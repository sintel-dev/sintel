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

/********************* global variables ***********************/
const DIST = './public/dist';
const cssBundleFileName = 'main';
const jsBundleFileName = 'main';

/********************* global utils ***********************/
gulp.task('htmlCleanEmptyLines', (done) => {
    let content = fs.readFileSync('index.html', 'utf-8');
    let newContent = content.replace(/^\s*[\r\n]/gm, '');
    fs.writeFileSync('index.html', newContent, 'utf-8');
    done();
});

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

    gulp.task('ts:build:dev', series(
        'ts:clean', 'ts:compile:dev'
    ));

    gulp.task('ts:build:prod', series(
        'ts:clean', 'ts:compile:prod'
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
        filename: jsBundleFileName,
        entryPoints: {
            'main': __dirname + '/src/main.ts'
        },
        outputDir: __dirname + DIST.substring(1)  // delete .
    }
);


/********************* build LESS ***********************/
const registerLessBuildTasks = (options) => {

    let { src, entryPoint, dir } = options;

    gulp.task('less:clean', () =>
        gulp.src([dir, `${DIST}/${cssBundleFileName}*.css`],
            { read: false, allowEmpty: true })
            .pipe(plugins.clean())
    );

    gulp.task('less:compile', () =>
        gulp.src(entryPoint)
        // gulp.src(src)
            .pipe(plugins.less().on('error', function (err) {
                gutil.log(err);
                // this.emit('end');
            }))
            .pipe(plugins.autoprefixer())
            .pipe(gulp.dest(dir))
    );

    gulp.task('less:bundle', () =>
        gulp.src(`${dir}/**/*.css`)
            .pipe(plugins.concat(`${cssBundleFileName}.css`))
            .pipe(gulp.dest(DIST))
    );

    gulp.task('less:min', () =>
        gulp.src(`${DIST}/${cssBundleFileName}.css`)
            .pipe(plugins.cssmin())
            .pipe(plugins.rename(`${cssBundleFileName}.min.css`))
            .pipe(gulp.dest(DIST))
    );

    gulp.task('less:build:dev', series(
        'less:clean', 'less:compile', 'less:bundle'
    ));

    gulp.task('less:build:prod', series(
        'less:clean', 'less:compile', 'less:bundle', 'less:min'
    ));

    gulp.task('less:watch', () => {
        gulp.watch(src, series('less:build:dev'));
    });
}

registerLessBuildTasks(
    {
        src: './src/**/*.less',
        dir: `${DIST}/css`,
        entryPoint: './src/main.less'
    }
)


/********************* build Assets ***********************/
const registerAssetsBuildTasks = (options) => {

    let { assetsFile } = options;

    // create empty files
    if (!fs.existsSync(DIST)) { fs.mkdirSync(DIST); }
    fs.writeFile(`${DIST}/none.css`, ' ', (err) => { if (err) throw err; });
    fs.writeFile(`${DIST}/none.js`, ' ', (err) => { if (err) throw err; });

    // update assets : todo dev/prod
    let replacementAssets;
    gulp.task(`assets:update`, (done) => {
        delete require.cache[require.resolve(assetsFile)]
        let assets = require(assetsFile);
        replacementAssets = {
            'assets-css': assets.css,
            'assets-js': assets.js
        };
        if (assets.css.length === 0) {
            replacementAssets[`assets-css`] = [`${DIST}/none.css`];
        }
        if (assets.js.length === 0) {
            replacementAssets[`assets-js`] = [`${DIST}/none.js`];
        }
        done();
    });

    gulp.task(`assets:writeToHTML:dev`, () => {
        replacementAssets['app-js'] = `${DIST}/${jsBundleFileName}.js`;
        replacementAssets['app-css'] = `${DIST}/${cssBundleFileName}.css`;

        return gulp.src('index.html')
            .pipe(plugins.htmlReplaceDyu(replacementAssets, {
                keepUnassigned: true,
                keepBlockTags: true,
                resolvePaths: false
            }))
            .pipe(gulp.dest('./'))
     });

    gulp.task(`assets:writeToHTML:prod`, () => {
        replacementAssets['app-js'] = `${DIST}/${jsBundleFileName}.min.js`;
        replacementAssets['app-css'] = `${DIST}/${cssBundleFileName}.min.css`;
    
        return gulp.src('index.html')
            .pipe(plugins.htmlReplaceDyu(replacementAssets, {
                keepUnassigned: true,
                keepBlockTags: true,
                resolvePaths: false
            }))
            .pipe(gulp.dest('./'))
    });

    gulp.task(`assets:build:dev`, series(
        `assets:update`,
        `assets:writeToHTML:dev`
    ));

    gulp.task(`assets:build:prod`, series(
        `assets:update`,
        `assets:writeToHTML:prod`
    ));

    gulp.task('assets:watch', () => {
        gulp.watch('assets.js', series('assets:build:dev'));
    });
};

registerAssetsBuildTasks(
    {
        assetsFile: './assets'
    }
);

/********************* MAIN ***********************/

gulp.task('build:dev', parallel(
    'less:build:dev',
    'ts:build:dev',
    'assets:build:dev'
));

gulp.task('build:prod', parallel(
    'less:build:prod',
    'ts:build:prod',
    'assets:build:prod'
));

// watching mode for development use
gulp.task('default', series(
    'build:dev',
    parallel('less:watch', 'ts:watch', 'assets:watch')
));
