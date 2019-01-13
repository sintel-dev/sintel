'use strict';

//******************************************************************************
//* IMPORT PACKAGES
//******************************************************************************
const fs = require('fs');
const gulp = require('gulp');
const series = gulp.series;
const parallel = gulp.parallel;
const plugins = require('gulp-load-plugins')();
const log = require('fancy-log');
const webpack = require('webpack');
const webpackConfig = require('./webpack.conf');
const webpackConfigProd = require('./webpack.conf.prod');
const assets = require('./assets');



// compie and bundle user-writen typescript codes
const registerTypescriptBuildTasks = (options) => {

    const handleWebpackOutput = (err, stats) => {
        if (err) throw new gutil.PluginError('ts', err);
        log('[ts]', stats.toString({
            colors: true,
            chunks: false
        }));
    };

    const getDevCompiler = () => {
        return webpack(webpackConfig(options));
    };

    const getReleaseCompiler = () => {
        return webpack(webpackConfigProd(options));
    };

    gulp.task('ts:build:dev', (done) => {
        const compiler = getDevCompiler();
        compiler.run((err, stats) => {
            handleWebpackOutput(err, stats);
            done();
        });
    });

    gulp.task('ts:build:prod', (done) => {
        const compiler = getReleaseCompiler();
        compiler.run((err, stats) => {
            handleWebpackOutput(err, stats);
            done();
        });
    });

    gulp.task('ts:watch', () => {
        const compiler = getDevCompiler();
        compiler.watch({
            aggregateTimeout: 300, // wait so long for more changes
            poll: 2000 // windows needs polling to pick up changes :(
        }, (err, stats) => {
            handleWebpackOutput(err, stats);
        });
    });
};

registerTypescriptBuildTasks(
    {
        entryPoints: {
            'main': __dirname + '/src/main.ts'
        },
        outputDir: __dirname + '/public/dist'
    }
);


// compie and bundle user-writen less codes
gulp.task('clean:css', () =>
    gulp.src('./public/dist/css/**', { read: false })
        .pipe(plugins.clean())
);

gulp.task('less:compile', () =>
    gulp.src('src/**/*.less')
        .pipe(plugins.less().on('error', function (err) {
            gutil.log(err);
            this.emit('end');
        }))
        .pipe(plugins.autoprefixer())
        .pipe(gulp.dest('./public/dist/css/'))
);

gulp.task('less:bundle', () =>
    gulp.src('./public/dist/css/**/*.css')
        .pipe(plugins.concat('main.css'))
        .pipe(gulp.dest('./public/dist'))
);

gulp.task('cssmin', () =>
    gulp.src('./public/dist/main.css')
        .pipe(plugins.cssmin())
        .pipe(gulp.dest('./public/dist'))
);

gulp.task('less:build:dev', series('clean:css', 'less:compile', 'less:bundle'));
gulp.task('less:build:prod', series('clean:css', 'less:compile', 'less:bundle', 'cssmin'));

gulp.task('less:watch', () => {
    gulp.watch('src/**/*.less', series('less:build:dev'));
});



// compie and bundle the files listed in assets
gulp.task('lib:copy', (done) => {
    if (assets.ALL.length === 0) {
        return done();
    } else {
        return gulp.src(assets.ALL)
            .pipe(gulp.dest('./public/libs'));
    }
});

gulp.task('lib:css:bundle', (done) => {
    if (assets.CSS.length === 0) {
        let dir = './public/libs';
        if (!fs.existsSync(dir)){ fs.mkdirSync(dir); }
        fs.writeFile('./public/libs/bundle.lib.css', '', (err) => {
            if (err) throw err;
        });
        return done();
    } else {
        return gulp.src(assets.CSS)
            .pipe(plugins.concat('bundle.lib.css'))
            .pipe(gulp.dest('./public/libs'));
    }
});

gulp.task('lib:mincss', () => {
    return gulp.src('./public/libs/bundle.lib.css')
        .pipe(plugins.cssmin())
        .pipe(plugins.rename('bundle.lib.min.css'))
        .pipe(gulp.dest('./public/libs'));
});

gulp.task('lib:js:bundle', (done) => {
    if (assets.JS.length === 0) {
        let dir = './public/libs';
        if (!fs.existsSync(dir)){ fs.mkdirSync(dir); }
        fs.writeFile('./public/libs/bundle.lib.js', '', (err) => {
            if (err) throw err;
        });
        return done();
    } else {
        return gulp.src(assets.JS)
            .pipe(plugins.concat('bundle.lib.js'))
            .pipe(gulp.dest('./public/libs'));
    }
});

gulp.task('lib:minjs', () =>
    gulp.src('./public/libs/bundle.lib.js')
        .pipe(plugins.minify({
            ext: {
                min: '.min.js'
            }
        }))
        .pipe(gulp.dest('./public/libs'))
);

gulp.task('lib:writeToHTML:dev', () => 
    gulp.src('index.html')
        .pipe(plugins.htmlReplace({
            'css': assets.CSS,
			'js': assets.JS
        }, {
            keepUnassigned: false,
            keepBlockTags: true,
            resolvePaths: false
        }))
        .pipe(gulp.dest('./'))
);

gulp.task('lib:writeToHTML:prod', () => 
    gulp.src('index.html')
        .pipe(plugins.htmlReplace({
            'css': './public/libs/bundle.min.css',
			'js': './public/libs/bundle.min.js'
        }, {
            keepUnassigned: false,
            keepBlockTags: true,
            resolvePaths: false
        }))
        .pipe(gulp.dest('./'))
);

gulp.task('lib:build:dev', series(
    'lib:copy',
    parallel(series('lib:css:bundle', 'lib:mincss'), series('lib:js:bundle', 'lib:minjs')),
    'lib:writeToHTML:dev'
));

gulp.task('lib:build:prod', series(
    'lib:copy',
    parallel(series('lib:css:bundle', 'lib:mincss'), series('lib:js:bundle', 'lib:minjs')),
    'lib:writeToHTML:prod'
));




// ---------------------------  main  ------------------------------

// index.html:  list all css and js in libraries
gulp.task('dev', parallel('less:build:dev', 'ts:build:dev', 'lib:build:dev'));

// index.html:  use bundled css and js in libraries
gulp.task('prod', parallel('less:build:prod', 'ts:build:prod', 'lib:build:prod'));

gulp.task('default', series('dev', parallel('less:watch', 'ts:watch')));


