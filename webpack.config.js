module.exports = {
	entry: './src/app.js',
	output: {
		filename:'app.bundle.js'
	},
	module: {
		rules: [{
			exclude: '/node_modules/',
			loader: 'babel-loader',
			query: {
				presets: ['es2015']
			}
		}]
	}
}