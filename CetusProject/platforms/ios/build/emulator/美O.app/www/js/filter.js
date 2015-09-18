angular.module('starter.filter', [])
//去掉 html 的filter
.filter("delHtmlTag",function(){
	return function(str){
        var nval = str.replace(/<[^>]+>/g, "");// 去掉所有的html标记
        return nval;
    }
});