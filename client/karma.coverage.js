const webpack = require('webpack');
const webpackConfig = require("./webpack.conf");

let wpConfig = webpackConfig({
    entryPoints: {
        'main': __dirname + '/src/main.ts'
    },
    outputDir: __dirname + '/public/dist'
});

// add global variables
// wpConfig.plugins = [
//     new webpack.ProvidePlugin({$: 'jquery', jQuery: 'jquery'})
// ];

wpConfig.module.rules = [{
    test: /\.ts$/,
    exclude: /node_modules/,
    loader: 'ts-loader'
},
{
    test: /\.ts(x?)$/,
    enforce: "post",
    use: {
        loader: 'istanbul-instrumenter-loader',
        options: { esModules: true }
    },
    // loader: require.resolve('istanbul-instrumenter-loader'),
    exclude: /node_modules|\.test\.ts$/
}];

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'chai', 'sinon'],
        files: [
            'tests/**/*.ts'
        ],
        exclude: [],
        preprocessors: {
            'tests/**/*.ts': ['webpack']
        },
        webpack: {
            devtool: 'inline-source-map',
            module: wpConfig.module,
            resolve: wpConfig.resolve,
            plugins: wpConfig.plugins
        },
        webpackMiddleware: {
            noInfo: true
        },
        // webpackServer: {
        //     noInfo: true
        // },
        coverageReporter: {
            dir: 'coverage',
            reporters: [
                {
                    type: 'html',
                    subdir: 'report-html'
                },
                {
                    type: 'lcov',
                    subdir: 'report-lcov'
                },
                {
                    type: 'cobertura',
                    subdir: '.',
                    file: 'cobertura.txt'
                },
                { 
                    type: 'text-summary'
                }
            ]
        },
        reporters: ['progress', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: true,
        concurrency: Infinity
    })
}