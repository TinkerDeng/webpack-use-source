const notifier = require("node-notifier");
const pkg = require('../package.json')

class Notifier {
    apply(compiler) {
        if (compiler.hooks) { //webpack > 4
            compiler.hooks.done.tapAsync("test", this.uploadFiles.bind(this));
        } else { //webpack<4
            compiler.plugin("done", this.uploadFiles.bind(this));
        }
    }

    uploadFiles(stats,callback) {
        const time = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
        notifier.notify({
            title:pkg.name,
            message:`打包完成\n发现${stats.compilation.errors.length}个错误，用时${time}s`
        });
        return callback();
    }
}

module.exports = Notifier;
