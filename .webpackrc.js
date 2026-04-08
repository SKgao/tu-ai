var path = require('path');

export default {
    // 禁用css-module
    "disableCSSModules": true,

    "extraBabelPlugins": [
        "@babel/transform-runtime"
    ],

    "alias": {
        "@": path.resolve(__dirname, "./src"),
        "babel-runtime-helpers": path.resolve(__dirname, "./node_modules/@babel/runtime/helpers/esm")
    },

    "commons": [{
        "async": "common",
        "children": true
    }],

    "browserslist": [
        "> 5%",
        "last 40 Chrome versions"
    ],
    
    "entry": "src/index.js",

    "html": {
        "template": "./src/index.ejs"
    },
    
    "hash": true
}
