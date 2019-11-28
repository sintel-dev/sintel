const STATIC = './public/lib-static';               // manually installed
const NPM = './node_modules';                       // package.json

let assets = {
    css: [ 
        // `${NPM}/bootstrap/dist/css/bootstrap.min.css`,
        `${STATIC}/tooltipster/css/tooltipster.css`
    ],
    js: [
        `${NPM}/jquery/dist/jquery.min.js`,
        `${STATIC}/jquery-ui.js`,
        `${NPM}/jquery.rest/dist/jquery.rest.min.js`,
        // `${NPM}/bootstrap/dist/js/bootstrap.min.js`,
        `${STATIC}/bootstrap.min.js`,
    ]
}

module.exports = {
    css: assets.css,
    js: assets.js,
    all: [...assets.css, ...assets.js]
};
