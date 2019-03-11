# webpack

1. Webpack 在启动后会从 Entry开始，递归解析 Entry 依赖的所有 Module
2. 每找到一个 Module ，就会根据配置的 Loader 去找出对应的转换规则
3. 对 Module 进行转换后，再解析出当前 Module 依赖的 Module 
4. 这些模块会以entry为单位进行分组，一个entry及其所有依赖的 Module 被分到一个组，也就是 Chunk 
5. 最后， Webpack 将所有 Chunk 转换成文件输出
6. 在整个流程中， Webpack 会在恰当的时机执行 Plugin里定义的逻辑 

## 目录

* [entry](#entry)
* [名词](#名词)
* [配置](#配置)
* [loader](#loader)
	* [loader-api](#loaderApi)
* [plugin](#plugin)

####  entry

1. 从entry入口文件开始搜寻及递归解析出所有入口依赖的模块
1. webpack寻找相对路径的文件时,默认为执行启动webpack时所在的工作目录，context可以改变，context必须是一个绝对路径的字符串

```json
	{
		"context": "path.resolve(__dirname,'src')",
        "entry":"./src/js 只有一个入口文件" ,
        "entry":["./src/index.js","./src/test.js","将多个入口文件生成一个文件"],
        "entry":{"a":"./src/index.js","b":"./src/test.js","c":"则会生成多个入口"} 
	}
```

> hash和chunkhash

```
	hash:在 webpack 一次构建中会产生一个 compilation 对象，该 hash 值是对 compilation 内所有的内容计算而来的
	chunkhash:每一个 chunk 都根据自身的内容计算而来,在持久化缓存中更为有效
```

#### 名词

1. chunk:代码块,多个模块组合而成,用于代码合并与分割

#### loader 

1. 用于对模块的源代码进行转换
1. 一个 Loader 其实就是一个 Node.js 模块，这个模块需要导出一个函数
1. loader运行在node中，所以可以调用任何自带的 API和第三方模块
1. loader本身就是接收字符串、buffer并返回字符串、buffer的过程
1. webpack会将加载的资源作为参数传入loader方法，交于loader处理，再返回
1. 同步 loader 可以简单的返回一个代表模块转化后的值
1. loader 也可以通过使用 this.callback(err, values...) 函数，返回任意数量的值
1. 设置module.exports.raw = true来选择使用Buffer数据格式来传递数据
1. this.callback是Webpack 给 Loader 注入的 API,方便 Loader 和 Webpack 之间通信
1. webpack默认缓存所有loader的处理结果，如果文件或依赖的文件没有变化时，不会重新调用对应的 Loader 去执行转换操作的

##### loaderApi

1. console.log(this.context) // 当前处理的文件所在目录 d:\dfc\webpack-use-source\src
1. console.log(this.resource) // 当前处理文件的完整请求路径,包括querystring d:\dfc\webpack-use-source\src\index.js?name=1
1. console.log(this.resourceQuery);
1. console.log(this.resourcePath) // 当前处理文件的路径d:\dfc\webpack-use-source\src\index.js
1. console.log(this.request);//  当前文件的完整路径D:\dfc\webpack-use-source\loader\test-loader.js!D:\dfc\webpack-use-source\src\index.js
1. console.log(this.target) // 等于 Webpack 配置中的 Target
1. this.loadModule(request: string, callback: function(err, source, sourceMap, module)) //但 Loader 在处理一个文件时，如果依赖其它文件的处理结果才能得出当前文件的结果时， 就可以通过 去获得 request 对应文件的处理结果
1. this.addDependency(file:string) //给当前处理文件添加其依赖的文件，以便再其依赖的文件发生变化时，会重新调用 Loader 处理该文件
1. this.addContextDependency(directory:string) // 是把整个目录加入到当前正在处理文件的依赖中
1. this.clearDependencies() // 清除当前正在处理文件的所有依赖
1. this.emitFile(name:string,content:Buffer|string,sourceMap:{}) //输出一个文件
	
```javascript
	/*
		调用自定义loader
		方式一：loader: path.resolve('path/to/loader.js'),
		方式二：
			resolveLoader: {
               modules: [
                 'node_modules',
                 path.resolve(__dirname, 'loaders')
               ]
            }
        方式三：npm link 专门用于开发和调试本地 Npm 模块,能做到在不发布模块的情况下，把本地的一个正在开发的模块的源码链接到项目的 node_modules 目录下
	*/
	/*demo1:html-layout-loader*/
		const loaderUtils = require('loader-utils'); // 提供了许多有用的工具 
	    const validateOptions = require('schema-utils'); // 验证loader配置
	    const schema = {
	        type: 'object',
	        properties: {
	            test: {
	                type: 'string'
	            }
	        }
	    };
	    module.exports = function (source) {
	        const options = loaderUtils.getOptions(this) // 获取配置loader的参数
	        validateOptions(schema,options,"example loader");
	        const layoutHtml = fs.readFileSync(options.layout, 'utf-8')
	        return layoutHtml.replace('{{__content__}}', source)
	    }
    /*demo2:sass转换成css*/
      	const sass = require('node-sass');
	    module.exports = function(source) {
	        return sass(source);
	    };
    /*demo3:除了需要转换source代码以外，还需要转换sourceMaps源码，以方便调试*/
	    module.exports = function(source) {
	        // 通过 this.callback 告诉 Webpack 返回的结果
	        this.callback(
	            null, // Error | null   当无法转换原内容时，给 Webpack 返回一个 Error 
	            source, // 原内容转换后的内容
	            sourceMaps, // 用于把转换后的内容得出原内容的 Source Map，方便调试
	            // abstractSyntaxTree?: "AST" // 如果本次转换为原内容生成了 AST 语法树，可以把这个 AST 返回,以方便之后需要 AST 的 Loader 复用该 AST，以避免重复生成 AST，提升性能
	        );
	        // 当你使用 this.callback 返回内容时，该 Loader 必须返回 undefined，
	        // 以让 Webpack 知道该 Loader 返回的结果在 this.callback 中，而不是 return 中 
	        return;
	    };
	/*demo4:异步转换*/
		module.exports = function(source) {
	        // 告诉 Webpack 本次转换是异步的，Loader 会在 callback 中回调结果
	        var callback = this.async();
	        someAsyncOperation(source, function(err, result, sourceMaps, ast) {
	            // 通过 callback 返回异步执行后的结果
	            callback(err, result, sourceMaps, ast);
	        });
	    };
	/*demo5:处理二进制数据*/
		module.exports = function(source) {
            // 在 exports.raw === true 时，Webpack 传给 Loader 的 source 是 Buffer 类型的
            source instanceof Buffer === true;
            // Loader 返回的类型也可以是 Buffer 类型的
            // 在 exports.raw !== true 时，Loader 也可以返回 Buffer 类型的结果
            return source;
        };
        // 通过 exports.raw 属性告诉 Webpack 该 Loader 是否需要二进制数据 
        module.exports.raw = true;
    /*demo6:关闭loader的缓存功能*/
      	module.exports = function(source) {
      		// 关闭该 Loader 的缓存功能
      		this.cacheable(false);
      		return source;
      	};
    /*demo7:标明依赖*/
    	module.exports = function(source) {
	        this.cacheable();
	        var callback = this.async();
	        var headerPath = path.resolve("header.js");
	        this.addDependency(headerPath);
	        fs.readFile(headerPath, "utf-8", function(err, header) {
	            if(err) return callback(err);
	            callback(null, header + "\n" + source);
	        });
	    };
```

#### plugin

1. 通过在构建流程里注入钩子来扩展 Webpack 功能
1. plugins是一个数组，里面的每一项都是插件的一个实例,通过构造函数传入配置信息
1. 

#### style-loader

1. 将css的内容用 JavaScript 里的字符串存储起来，在网页执行 JavaScript 时通过 DOM 操作，动态地向HTML head 标签里插入 HTML style 标签

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
            filename: '[name].[hash:8].js', // 任何文件有改动hash值都会变,默认20位数，可以指定
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
	    target:"node", // 打包出来的内容适配哪个执行环境 web node async-node webworker
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
	        modules:["./src/module",path.resolve(__dirname,"node_modules")], //寻找第三方模块，默认只会去node_modules下找
	        extensions:[".js",".jsx",".css",".scss",".less"],
	        alias: {//别名来把原来导入路径映射成一个新的导入路径
				com: './src/components/' 
	        },
	        mainFields:["browswer","module","main"]
        },
    	module:{ // loader 用于转换某些类型的模块
    	    rules:[
    	        {
    	            "enforce":"post",// post将该loader最后执行 pre将该loader提前执行
    	          	"test":/\.js/,
    	          	"use":['babel-loader?cacheDirectory'], //cacheDirectory缓存babel的编译结果，加快重新编译的速度
    	          	"include":path.resolve(__dirname,'src'),  
    	          	"exclude":/node_modules/
    	        },
    	        {
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
	        	},
		        {
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

### plugin

1. plugin通过在构建流程中注入钩子来扩展webpack功能
1. 每一项都是插件的一个实例，通过构造函数注入配置信息

