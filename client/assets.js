const STATIC = './public/lib-static';               // manually installed

let assets = {
    css: [ 
        `${STATIC}/tooltipster/css/tooltipster.css`
],
    js: [
        `${STATIC}/jquery.min.js`,
        `${STATIC}/jquery-ui.js`,
        `${STATIC}/jquery.rest.js`, 
        `${STATIC}/bootstrap.min.js`,
    ]
}

module.exports = {
    css: assets.css,
    js: assets.js,
    all: [...assets.css, ...assets.js]
};
