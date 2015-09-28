angular.module('starter.services', [])

.factory('Userinfo', function() {
  var userinfo = {};

  return {
    save: function(j) {
      for (var k in j) {
        window.localStorage[k] = userinfo[k] = j[k];
      };
      return userinfo;
    },

    remove: function(f) {
      if(f.constructor==Array){
        for(var i=0;i<f.length;i++){
          window.localStorage.removeItem(f[i]);
        }
      }
        window.localStorage.removeItem(f);
    },

    add: function(k, v) {
      window.localStorage[k] = userinfo[k] = v;
    },

    addLong: function(k, v) {
      window.localStorage[k] = v;
    },

    l: window.localStorage
  };
})

.factory('jpushService',['$http','$window',function($http,$window){
	var jpushServiceFactory={};

	//启动极光推送
	var _init=function(){
		$window.plugins.jPushPlugin.init();
		$window.plugins.jPushPlugin.setDebugMode(false);
	}

	//停止极光推送
	var _stopPush=function(){
		$window.plugins.jPushPlugin.stopPush();
	}

	//重启极光推送
	var _resumePush=function(){
		$window.plugins.jPushPlugin.resumePush();
	}

	//设置标签和别名
	var _setTagsWithAlias=function(tags,alias){
		//console.log("_setTagsWithAlias -  设置标签 >>==============================="+tags+"=============================");
		//console.log("_setTagsWithAlias -  设置别名 >>==============================="+alias+"=============================");
		$window.plugins.jPushPlugin.setTagsWithAlias(tags,alias);
	}

	//设置标签
	var _setTags=function(tags){
		//console.log("设置标签>>==============================="+tags+"=============================");
		$window.plugins.jPushPlugin.setTags(tags);
	}

	//设置别名
	var _setAlias=function(alias){
		$window.plugins.jPushPlugin.setAlias(alias);
	}


	jpushServiceFactory.init=_init;
	jpushServiceFactory.stopPush=_stopPush;
	jpushServiceFactory.resumePush=_resumePush;

	jpushServiceFactory.setTagsWithAlias=_setTagsWithAlias;
	jpushServiceFactory.setTags=_setTags;
	jpushServiceFactory.setAlias=_setAlias;

	return jpushServiceFactory;
}]);