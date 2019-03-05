const path = require("path");
const webpack = require("webpack");
module.exports = {
    "mode":"none",
    entry:'./src/index.js',               // 入口文件
    output:{
        filename:"[name].[hash].js",
        path:path.join(__dirname, "dist")
    },
    module:{
        rules:[
            {
                test:/\.js/,
                loader:path.resolve(__dirname, "loader", 'test-loader.js'),
            }]
    }
};
