# webpack

## 目录

* [用法](#用法)
* [配置](#配置)

####  用法

> entry 入口文件

```json
	{
    	"entry":"./src/js 只有一个入口文件" ,
    	"entry":["./src/index.js","./src/test.js","将多个入口文件生成一个文件"],
    	"entry":{"a":"./src/index.js","b":"./src/test.js","c":"则会生成多个入口"} 
	}
```

#### 配置
```javascript
	const webpack = require("webpack");
	const path = require("path");
	const ExtractTextPlugin = require("extract-text-webpack-plugin");
	const HtmlWebpackPlugin = require('html-webpack-plugin');
	const Autoprefixer = require('autoprefixer');
	const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
	const BundleAnalyzerPlugin = require('webpack-bundle-analyzer') //查看哪些资源被打包进来了
	module.exports = {
	    devtool:'inline-source-map',  //开发工具，比如启动source-map
	    output: {
            filename: '[name].[hash].js', // 任何文件有改动hash值都会变
            path: path.join(
              __dirname,
              '../dist'
            ),
            publicPath: '/public/', // 资源文件的引入路径,最后一个/很重要
            library: 'test-web-app', // 指定的就是你使用require时的模块名
            libraryTarget: 'commonjs2', // node端要设置打包出来的js使用模块化的方案 umd cmd amd
            umdNamedDefine: true // 会对 UMD 的构建过程中的 AMD 模块进行命名。否则就使用匿名的 define
        },
	    mode:"development",
	    target:"node", // 打包出来的内容适配哪个执行环境 web node
	    devServer: { //webpack-dev-server输出的文件只存在于内存中,不输出真实的文件
	        host: '0.0.0.0', //允许用任何方式访问  localhost:8080  127.0.0.0:8080  172.168.2.34:8080
            contentBase: path.join(__dirname, 'dist'), // 服务器资源的根目录，在dist目录下启动了dev服务，可以直接localhost:8888/app.xxx.js访问资源
            noInfo:true,
            compress: true, // 服务器资源采用gzip压缩
            port: 9000,  // 运行的端口
            overlay: { // 如果编译过程中出现错误，在网页中覆盖一层错误信息
	            errors:true
            },  
          	proxy: {
              	'/api': 'http://localhost:3333' // 所有/api的请求都代理到http://localhost:3333下
            },
            publicPath: '/public',// 访问当前服务下的资源路径都要通过加上/public来访问，切记要删除本地硬盘上的dist文件夹,dev-server会先去硬盘上检测有没有index.html文件，如果有则直接访问这个目录下的文件
            historyApiFallback: { // 指定访问的index文件是public文件下的index.html,404的请求全部返回index.html
                  index: '/public/index.html'
            },
            hot: true, //启动热刷新
            open:true//自动打开浏览器
        },
        resolve:{ // 省略后缀名
	        modules:["./src/module","node_modules"], //寻找第三方模块，默认只会去node_modules下找
	        extensions:[".js",".jsx",".css",".scss",".less"],
	         alias: {//别名来把原来导入路径映射成一个新的导入路径
                com: './src/components/' 
	         }
        },
    	module:{ // loader 用于转换某些类型的模块
    	    rules:[{
				 "test" : /\.css$/,
		         "use" : ["style-loader", "css-loader","postcss-loader"]
    	    },
    	    {
	            "test": /\.(png|svg|jpg|gif)$/, // 加载图片
	            "use": [{
	                loader: 'url-loader',
	                options: {
	                    limit: 8192,  // 小于8k的图片自动转成base64格式
	                    name: 'images/[name].[ext]?[hash]', // 图片打包后存放的目录
	                    publicPath: '../'  // css图片引用地址，可修正打包后，css图片引用出错的问题
	                }
	            }]
	        },{
	              test: /\.(woff|woff2|eot|ttf|otf)$/,
	              use: [
	              'file-loader'
	              ]
    	    }]
    	},
    	plugins:[ // 打包 优化 压缩 重新定义环节中的变量
    	    new HtmlWebpakPlugin({
                minify:{
                    collapseWhitespace: true,   // 折叠空白区域 也就是压缩代码
                    removeAttributeQuotes: true // 移除双引号，
                },
                hash:true, //向html引入的src链接后面增加一段hash值,消除缓存
                template:'./src/index.html', // 模板地址
                title: '彻底弄懂webpack' // 标题
            }),
            new ExtractTextPlugin("css/styles.css"), // 打包后的css文件
            new Autoprefixer(),
            new webpack.optimize.ModuleConcatenationPlugin(),  //作用域提升,大型的工程中模块引用的层级往往较深,scope-hoisting可以将这种纵深的引用链拍平
            new SpeedMeasurePlugin(), //监控面板显示各个loader花费的时间
            new BundleAnalyzerPlugin({ analyzerPort: 8081 })
    	]
	}
```
