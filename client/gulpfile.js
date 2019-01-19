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

/********************* global utils ***********************/


gulp.task('htmlCleanEmptyLines', (done) => {
    // let content = fs.readFileSync('index.html', 'utf-8');
    // let newContent = content.replace(/^\s*[\r\n]/gm, '');
    // fs.writeFileSync('index.html', newContent, 'utf-8');
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
        'ts:clean', 'ts:compile:dev',
        'ts:writeToHTML:dev', 'htmlCleanEmptyLines'
    ));

    gulp.task('ts:build:prod', series(
        'ts:clean', 'ts:compile:prod',
        'ts:writeToHTML:prod', 'htmlCleanEmptyLines'
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
        outputDir: __dirname + DIST.substring(1)  // delete .
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
        'less:clean', 'less:compile', 'less:bundle',
        'less:writeToHTML:dev', 'htmlCleanEmptyLines'
    ));

    gulp.task('less:build:prod', series(
        'less:clean', 'less:compile', 'less:bundle',
        'less:min', 'less:writeToHTML:prod', 'htmlCleanEmptyLines'
    ));

    gulp.task('less:watch', () => {
        gulp.watch(src, series('less:build:dev'));
    });
}

registerLessBuildTasks(
    {
        src: './src/**/*.less',
        dir: `${DIST}/css`,
        bundleDir: DIST,
        bundleFileName: 'main'
    }
)


/********************* build Assets ***********************/
const registerAssetsBuildTasks = (options) => {

    let { dir, assets } = options;

    // create empty files
    if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }
    fs.writeFile(`${dir}/none.css`, ' ', (err) => { if (err) throw err; });
    fs.writeFile(`${dir}/none.js`, ' ', (err) => { if (err) throw err; });

    // todo update assets
    let replacement;

    gulp.task(`assets:update`, (done) => {
        delete require.cache[require.resolve('./assets')]
        assets = require('./assets');
        replacement = {
            'assets-css': assets.css,
            'assets-js': assets.js
        };
        if (assets.css.length === 0) {
            replacement[`assets-css`] = [`${dir}/none.css`];
        }
        if (assets.js.length === 0) {
            replacement[`assets-js`] = [`${dir}/none.js`];
        }
        done();
    });

    gulp.task(`assets:writeToHTML`, () =>
        gulp.src('index.html')
            .pipe(plugins.htmlReplace(replacement, {
                keepUnassigned: true,
                keepBlockTags: true,
                resolvePaths: false
            }))
            .pipe(gulp.dest('./'))
    );

    gulp.task(`assets:build`, series(
        `assets:update`,
        `assets:writeToHTML`,
        'htmlCleanEmptyLines'
    ));

    gulp.task('assets:watch', () => {
        gulp.watch('assets.js', series('assets:build'));
    });
};

registerAssetsBuildTasks(
    {
        dir: DIST,
        assets: require('./assets')
    }
);


/********************* MAIN ***********************/

// index.html: list all css and js in libraries
gulp.task('build:dev', parallel(
    'less:build:dev',
    'ts:build:dev',
    'assets:build'
));

// index.html: use bundled css and js in libraries
gulp.task('build:prod', parallel(
    'less:build:prod',
    'ts:build:prod',
    'assets:build'
));

// watching mode for development use
gulp.task('default', series(
    'build:dev',
    parallel('less:watch', 'ts:watch', 'assets:watch')
));
