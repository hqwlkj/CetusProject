cordova.define("com.qdc.plugins.alipay.alipay", function(require, exports, module) { var exec = require('cordova/exec');

var alipay = {
  payment: function(json, successFn, failureFn) {
    exec(successFn, failureFn, 'Alipay', 'payment', [json]);
  }
}

module.exports = alipay;

});
