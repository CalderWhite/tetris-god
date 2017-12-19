module.exports = {
    entry: './src/main.js',
    output: {
        path: __dirname,
        filename: 'dist/js/main.js'
    },
    module: {
        loaders: [
            {
                test : /\.js$/,
                exclude : /{node_modules}/,
                loader : 'babel-loader',
                query : {
                    presets : ['env']
                }
            }
        ]
    }
};