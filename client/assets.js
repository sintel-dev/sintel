const NPM = './node_modules';                       // package.json
const STATIC = './public/lib-static';               // manually installed
const THEME = './public/themes/AdminLTE-2.4.2';     // theme template


let assets = {
    css: [
        `${THEME}/bower_components/bootstrap/dist/css/bootstrap.min.css`,
        `${THEME}/bower_components/font-awesome/css/font-awesome.min.css`,
        `${THEME}/bower_components/Ionicons/css/ionicons.min.css`,
        `${THEME}/dist/css/AdminLTE.min.css`,
        `${THEME}/dist/css/skins/_all-skins.min.css`,
        `${THEME}/bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css`,
        `${THEME}/bower_components/bootstrap-daterangepicker/daterangepicker.css`,
        `${STATIC}/tooltipster/css/tooltipster.css`
],
    js: [
        `${STATIC}/jquery.min.js`,
        // `${NPM}/jquery/dist/jquery.min.js`,
        `${THEME}/bower_components/jquery-ui/jquery-ui.min.js`,
        `${STATIC}/jquery.rest.js`,
        // `${NPM}/jquery.rest/dist/jquery.rest.js`,
        `${STATIC}/jquery-ui-resolve-conflict.js`,
        `${THEME}/bower_components/bootstrap/dist/js/bootstrap.min.js`,
        `${THEME}/bower_components/raphael/raphael.min.js`,
        `${THEME}/bower_components/morris.js/morris.min.js`,
        `${THEME}/bower_components/jquery-sparkline/dist/jquery.sparkline.min.js`,
        `${THEME}/plugins/jvectormap/jquery-jvectormap-1.2.2.min.js`,
        `${THEME}/plugins/jvectormap/jquery-jvectormap-world-mill-en.js`,
        `${THEME}/bower_components/jquery-knob/dist/jquery.knob.min.js`,
        `${THEME}/bower_components/moment/min/moment.min.js`,
        `${THEME}/bower_components/bootstrap-daterangepicker/daterangepicker.js`,
        `${THEME}/bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js`,
        `${THEME}/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.all.min.js`,
        `${THEME}/bower_components/jquery-slimscroll/jquery.slimscroll.min.js`,
        `${THEME}/bower_components/fastclick/lib/fastclick.js`,
        `${THEME}/dist/js/adminlte.js`,
        // `${THEME}/dist/js/adminlte.min.js`,
        `${STATIC}/math.js`,
        `${STATIC}/science.js`,
        `${NPM}/tinycolor/tinycolor.js`
        // `${THEME}/dist/js/pages/dashboard.js`,
        // `${THEME}/dist/js/demo.js`,
    ]
}


module.exports = {
    css: assets.css,
    js: assets.js,
    all: [...assets.css, ...assets.js]
};
