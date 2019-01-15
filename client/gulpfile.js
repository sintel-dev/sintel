'use strict';

//******************************************************************************
//* IMPORT PACKAGES
//******************************************************************************
const _ = require('lodash');
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



/********************* build TYPESCRIPT ***********************/
const registerTypescriptBuildTasks = (options) => {

    const handleWebpackOutput = (err, stats) => {
        if (err) throw new gutil.PluginError('ts', err);
        log('[ts]', stats.toString({
            colors: true,
            chunks: false
        }));
    };

    const getDevCompiler = () => {
        options.name = `${options.filename}` + '.js';
        return webpack(webpackConfig(options));
    };

    const getReleaseCompiler = () => {
        options.name = `${options.filename}` + '.min.js';
        return webpack(webpackConfigProd(options));
    };

    gulp.task('ts:clean', () =>
        gulp.src([`${options.outputDir}/${options.filename}*.js*`], 
                { read: false, allowEmpty: true })
            .pipe(plugins.clean())
    );

    gulp.task('ts:compile:dev', (done) => {
        const compiler = getDevCompiler();
        compiler.run((err, stats) => {
            handleWebpackOutput(err, stats);
            done();
        });
    });

    gulp.task('ts:compile:prod', (done) => {
        const compiler = getReleaseCompiler();
        compiler.run((err, stats) => {
            handleWebpackOutput(err, stats);
            done();
        });
    });

    let outputRelativeDir = '.' + options.outputDir.substring(__dirname.length);
    gulp.task(`ts:writeToHTML:dev`, () =>
        gulp.src('index.html')
            .pipe(plugins.htmlReplace({
                    'app-js': `${outputRelativeDir}/${options.filename}.js`
                }, {
                    keepUnassigned: true,
                    keepBlockTags: true,
                    resolvePaths: false
                }
            ))
            .pipe(gulp.dest('./'))
    );

    gulp.task(`ts:writeToHTML:prod`, () =>
        gulp.src('index.html')
            .pipe(plugins.htmlReplace({
                    'app-js': `${outputRelativeDir}/${options.filename}.min.js`
                }, {
                    keepUnassigned: true,
                    keepBlockTags: true,
                    resolvePaths: false
                }
            ))
            .pipe(gulp.dest('./'))
    );

    gulp.task('ts:build:dev', series(
        'ts:clean', 'ts:compile:dev', 'ts:writeToHTML:dev'
    ));
    
    gulp.task('ts:build:prod', series(
        'ts:clean', 'ts:compile:prod', 'ts:writeToHTML:prod'
    ));

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
        filename: 'main',
        entryPoints: {
            'main': __dirname + '/src/main.ts'
        },
        outputDir: __dirname + '/public/dist'
    }
);


/********************* build LESS ***********************/
const registerLessBuildTasks = (options) => {

    let { src, dir, bundleDir, bundleFileName } = options;
    
    gulp.task('less:clean', () =>
        gulp.src([dir, `${bundleDir}/${bundleFileName}*.css`], 
                 { read: false, allowEmpty: true })
            .pipe(plugins.clean())
    );

    gulp.task('less:compile', () =>
        gulp.src(src)
            .pipe(plugins.less().on('error', function (err) {
                gutil.log(err);
                this.emit('end');
            }))
            .pipe(plugins.autoprefixer())
            .pipe(gulp.dest(dir))
    );

    gulp.task('less:bundle', () =>
        gulp.src(`${dir}/**/*.css`)
            .pipe(plugins.concat(`${bundleFileName}.css`))
            .pipe(gulp.dest(bundleDir))
    );

    gulp.task('less:min', () =>
        gulp.src(`${bundleDir}/${bundleFileName}.css`)
            .pipe(plugins.cssmin())
            .pipe(plugins.rename(`${bundleFileName}.min.css`))
            .pipe(gulp.dest(bundleDir))
    );

    gulp.task(`less:writeToHTML:dev`, () =>
        gulp.src('index.html')
            .pipe(plugins.htmlReplace({
                    'app-css': `${bundleDir}/${bundleFileName}.css`
                }, {
                    keepUnassigned: true,
                    keepBlockTags: true,
                    resolvePaths: false
                }
            ))
            .pipe(gulp.dest('./'))
    );

    gulp.task(`less:writeToHTML:prod`, () =>
        gulp.src('index.html')
            .pipe(plugins.htmlReplace({
                    'app-css': `${bundleDir}/${bundleFileName}.min.css`
                }, {
                    keepUnassigned: true,
                    keepBlockTags: true,
                    resolvePaths: false
                }
            ))
            .pipe(gulp.dest('./'))
    );

    gulp.task('less:build:dev', series(
        'less:clean', 'less:compile', 'less:bundle', 'less:writeToHTML:dev'
    ));
    
    gulp.task('less:build:prod', series(
        'less:clean', 'less:compile', 'less:bundle',
        'less:min', 'less:writeToHTML:prod'
    ));

    gulp.task('less:watch', () => {
        gulp.watch(src, series('less:build:dev'));
    });
}

registerLessBuildTasks(
    {
        src: './src/**/*.less',
        dir: './public/dist/css',
        bundleDir: './public/dist',
        bundleFileName: 'main'
    }
)


/********************* build Assets ***********************/
const registerAssetsBuildTasks = (options) => {

    let { src, dir, filename } = options;

    let [all, js, css] = [
        assets[src].all,
        assets[src].js,
        assets[src].css
    ];

    gulp.task(`${src}:clean`, () =>
        gulp.src(`${dir}`, { read: false, allowEmpty: true })
            .pipe(plugins.clean())
    );

    gulp.task(`${src}:copy`, (done) => {
        if (all.length === 0) {
            return done();
        } else {
            return gulp.src(all)
                .pipe(gulp.dest(dir));
        }
    });

    gulp.task(`${src}:css:bundle`, (done) => {
        if (css.length === 0) {
            if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }
            fs.writeFile(`${dir}/${filename}.${src}.css`, ' ', (err) => {
                if (err) throw err;
            });
            return done();
        } else {
            return gulp.src(css)
                .pipe(plugins.concat(`${filename}.${src}.css`))
                .pipe(gulp.dest(dir));
        }
    });

    gulp.task(`${src}:css:min`, () => {
        return gulp.src(`${dir}/${filename}.${src}.css`)
            .pipe(plugins.cssmin())
            .pipe(plugins.rename(`${filename}.${src}.min.css`))
            .pipe(gulp.dest(options.dir));
    });

    gulp.task(`${src}:js:bundle`, (done) => {
        if (js.length === 0) {
            if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }
            fs.writeFile(`${dir}/${filename}.${src}.js`, ' ', (err) => {
                if (err) throw err;
            });
            return done();
        } else {
            return gulp.src(js)
                .pipe(plugins.concat(`${filename}.${src}.js`))
                .pipe(gulp.dest(dir));
        }
    });

    gulp.task(`${src}:js:min`, () =>
        gulp.src(`${dir}/${filename}.${src}.js`)
            .pipe(plugins.minify({
                ext: {
                    min: '.min.js'
                }
            }))
            .pipe(gulp.dest(dir))
    );

    let replacementDev = {};
    replacementDev[`${src}-css`] = _.map(css,
        o => dir + o.substring(o.lastIndexOf('/')));
    replacementDev[`${src}-js`] = _.map(js,
        o => dir + o.substring(o.lastIndexOf('/')));

    gulp.task(`${src}:writeToHTML:dev`, () =>
        gulp.src('index.html')
            .pipe(plugins.htmlReplace(replacementDev, {
                keepUnassigned: true,
                keepBlockTags: true,
                resolvePaths: false
            }))
            .pipe(gulp.dest('./'))
    );

    let replacementProd = {};
    replacementProd[`${src}-css`] = `${dir}/${filename}.${src}.min.css`;
    replacementProd[`${src}-js`] = `${dir}/${filename}.${src}.min.js`;

    gulp.task(`${src}:writeToHTML:prod`, () =>
        gulp.src('index.html')
            .pipe(plugins.htmlReplace(replacementProd, {
                keepUnassigned: true,
                keepBlockTags: true,
                resolvePaths: false
            }))
            .pipe(gulp.dest('./'))
    );

    gulp.task(`${src}:build:dev`, series(
        `${src}:clean`,
        `${src}:copy`,
        parallel(
            `${src}:css:bundle`,
            `${src}:js:bundle`,
            `${src}:writeToHTML:dev`
        )
    ));

    gulp.task(`${src}:build:prod`, series(
        `${src}:clean`,
        `${src}:copy`,
        parallel(
            series(`${src}:css:bundle`, `${src}:css:min`),
            series(`${src}:js:bundle`, `${src}:js:min`),
            `${src}:writeToHTML:prod`
        )
    ));

    // gulp.task(`${src}:watch`, () => {
    //     gulp.watch('assets.js', series('less:build:dev'));
    // });
};

registerAssetsBuildTasks(
    {
        src: 'lib',
        dir: './public/lib',
        filename: 'bundle'
    }
);

registerAssetsBuildTasks(
    {
        src: 'theme',
        dir: './public/lib-static/theme',
        filename: 'bundle'
    }
);


/********************* MAIN ***********************/

// index.html:  list all css and js in libraries
gulp.task('build:dev', parallel(
    'less:build:dev',
    'ts:build:dev',
    'lib:build:dev'
));

// index.html:  use bundled css and js in libraries
gulp.task('build:prod', parallel(
    'less:build:prod',
    'ts:build:prod',
    'lib:build:prod'
));

// watching mode for development use
gulp.task('default', series(
    'build:dev',
    parallel('less:watch', 'ts:watch')
));

