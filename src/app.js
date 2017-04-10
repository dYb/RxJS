import Rx from 'rxjs/Rx'
import $ from 'jquery'
const { Observable } = Rx

// ===============EXAMPLE 1=================
{
  // function render(val) {
  //   $('.text').text(`You have survived The Older for ${val} Seconds`)
  // }
  // let count = 0;
  // const button = document.querySelector('.btn1');
  // button.addEventListener('click', () => render(++count));

  const btn1$ = Observable.fromEvent($('.btn1'), 'click')
  let subscription = btn1$
    .scan(count => count + 1, 0)
    .subscribe((val) => {
      $('.text').text(`You have survived The Older for ${val} Seconds`)
    })
  Observable.fromEvent($('.btn11'), 'click')
    .subscribe(() => {
      subscription && subscription.unsubscribe()
      subscription = null
    })
}

// ===============EXAMPLE 2=================

{
  function render(obj) {
    $('.info').html(`
      <li>name: ${obj.name}</li>
      <li>avatar_url: <img src="${obj.avatar_url}" /></li>
      <li>location: ${obj.location}</li>
      <li>email: ${obj.email}</li>
    `)
  }
  function getUser(user) {
    return $.ajax({
      url: `https://api.github.com/users/${user}`,
      dataType: 'jsonp'
    }).promise()
  }
  Observable.fromEvent($('.user'), 'input')
    .debounceTime(500)
    .distinctUntilChanged()
    .map(e => e.target.value.toLowerCase())
    .switchMap(user => Observable.fromPromise(getUser(user)))
    .pluck('data')
    .subscribe(render)

// -----i---iiiiiii----------------|>
//       debounceTime
// -----i---------i----------------|>
//           map
// -----v---------v----------------|>
//      ↓       ↑ ↓        ↑  switchMap
//      ↘--p--↗  ↘--p--↗
//          pluck
// -----u---------u----------------|>
}

// ====================Example 3===================

{
  const button = $('.btn2')
  const down$ = Observable.fromEvent(button, 'mousedown')
  const move$ = Observable.fromEvent(button, 'mousemove')
  const up$ = Observable.fromEvent(button, 'mouseup')

  down$
    .switchMap(() => Observable.timer(1000).takeUntil(up$))
    .subscribe(() => {
      console.log('press')
    })
}

// ====================Example 4===================
{
  const rect = $('.rect')
  function render(x, y) {
    rect.css({ left: x, top: y })
  }
  const down$ = Observable.fromEvent(rect, 'mousedown')
  const move$ = Observable.fromEvent(rect, 'mousemove')
  const up$ = Observable.fromEvent(rect, 'mouseup')
  down$
    .do(() => console.log('drag start'))
    .map((e) => {
      return {
        x: e.pageX - e.target.offsetLeft,
        y: e.pageY - e.target.offsetTop,
      }
    })
    .switchMap(({ x, y }) => {
      return move$.map((e) => {
        return {
          x: e.pageX - x,
          y: e.pageY - y,
        }
      }).takeUntil(up$.do(() => console.log('drag end')))
    })
    .subscribe(({ x, y }) => {
      render(x, y)
    })
}

// =====================Array vs Observable===================
{
  // let array = []
  // for (let i = 0; i < 1000000; i++) {
  //   array.push(i)
  // }
  // console.time('Array')
  // const n = array
  //   .map(i => i + 1)
  //   .filter(i => i % 2)
  //   .reduce((acc, curr) => acc + curr, 0)
  // console.timeEnd('Array')

  // const array$ = Observable.range(0, 1000000)
  // console.time('Observable')
  // array$
  //   .map(i => i + 1)
  //   .filter(i => i % 2)
  //   .reduce((acc, curr) => acc + curr, 0)
  //   .subscribe((v) => {
  //     console.timeEnd('Observable')
  //   })
}

//=========================Promise vs Observable======
{
  // const promise = new Promise((resolve, reject) => {
  //   console.info('Promise before resolving')
  //   setTimeout(() => {
  //     resolve('Promise done!')
  //   }, 1000)
  // })
  // console.info('Promise before then')
  // promise.then(val => console.log(val))


  // const o$ = Observable.create((observer) => {
  //   console.info('Observer before complete')
  //   setTimeout(() => {
  //     observer.next('Observable done!')
  //     observer.complete()
  //   }, 1000)
  // })
  // console.info('Observer before suscribe')
  // o$.subscribe(val => console.log(val)) 

}

//=========================Error================

{
  function errorWhen2 (x) {
    return new Promise((resolve, reject) => {
      if (x === 2) {
        reject(new Error('Too large'))
      }
      resolve(x)
    })
  }

  // Error will interrupt the chain
  // Observable.interval(1000)
  //   .switchMap(x => Observable.fromPromise(errorWhen2(x)))
  //   .subscribe(
  //     (x) => console.log('next: ' + x),
  //     (err) => console.error(err),
  //     () => console.log('complete!')
  //   )
  
  // Use catch to catch the error
  // Observable.interval(1000)
  //   .switchMap(x => Observable.fromPromise(errorWhen2(x)))
  //   .catch(() => Observable.empty())
  //   .subscribe(
  //     (x) => console.log('next: ' + x),
  //     (err) => console.error(err),
  //     () => console.log('complete!')
  //   )

  // Correct way

  // Observable.interval(1000)
  //   .switchMap(x => {
  //     return Observable.fromPromise(errorWhen2(x))
  //       .catch(() => Observable.empty())
  //   })
  //   .subscribe(
  //     (x) => console.log('next: ' + x),
  //     (err) => console.error(err),
  //     () => console.log('complete!')
  //   )
}