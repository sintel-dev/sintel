const LIB_BASE_PATH = './node_modules';
const THEME_BASE_PATH = './public/themes/options';


let theme = {
    css: [
        `${THEME_BASE_PATH}/css/bootstrap.css`,
        `${THEME_BASE_PATH}/css/font-awesome.css`,
        `${THEME_BASE_PATH}/css/animate-css/animate.min.css`,
        `${THEME_BASE_PATH}/css/lobipanel/lobipanel.min.css`,
        `${THEME_BASE_PATH}/css/main.css`
    ],
    js: [
        `${THEME_BASE_PATH}/js/bootstrap/bootstrap.min.js`,
        `${THEME_BASE_PATH}/js/jquery/jquery-2.2.4.min.js`,
        `${THEME_BASE_PATH}/js/jquery-ui/jquery-ui.min.js`,
        `${THEME_BASE_PATH}/js/bootstrap/bootstrap.min.js`,
        `${THEME_BASE_PATH}/js/pace/pace.min.js`,
        `${THEME_BASE_PATH}/js/lobipanel/lobipanel.min.js`,
        `${THEME_BASE_PATH}/js/iscroll/iscroll.js`,
        `${THEME_BASE_PATH}/js/main.js`
    ]
}




let lib = {
    css: [
        // `${LIB_BASE_PATH}/libName/pathToCSSFile`,
    ],
    js: [
        `${LIB_BASE_PATH}/d3/dist/d3.js`,
    ]
}

module.exports = {
    theme: {
        css: theme.css,
        js: theme.js,
        all: [...theme.css, ...theme.js]
    },
    lib: {
        css: lib.css,
        js: lib.js,
        all: [...lib.css, ...lib.js]
    }
};
