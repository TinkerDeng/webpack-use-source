const path = require("path");
const webpack = require("webpack");
const Notifier = require('./plugin/notifier.js');
module.exports = {
    "mode":"none",
    context:path.resolve("src"),
    entry:'./index.js',               // 入口文件
    output:{
        filename:"[id].[name].[hash].js",
        path:path.join(__dirname, "dist")
    },
    module:{},
    plugins:[
        new Notifier()
    ]
};
