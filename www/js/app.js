// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','starter.addressController', 'starter.ordercrtl','starter.order','starter.mycartcrtl','starter.services', 'ngCordova'])

.run(function($ionicPlatform, $http, $cordovaAppVersion, $ionicPopup, $ionicLoading, $cordovaFileTransfer, Userinfo) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    // 设备准备完后 隐藏启动动画
    
    navigator.splashscreen.hide();

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
    //启动极光推送服务
    window.plugins.jPushPlugin.init();
    //调试模式
    // window.plugins.jPushPlugin.setDebugMode(true);

    //检查更新
    checkUpdate();

    function checkUpdate() {
      $cordovaAppVersion.getAppVersion().then(function(version) {
        Userinfo.add('version', version);
        $http.get('v='+version).success(function(data) {
          if (data.error == 0) {
            if (version != data.version) {
              showUpdateConfirm(data.desc, data.apk);
            }
          }
        })
      });
    };

    function showUpdateConfirm(desc, url) {
      var confirmPopup = $ionicPopup.confirm({
        title: '有新版本了！是否要升级？',
        template: desc,
        cancelText: '下一次',
        okText: '确定'
      });
      var url = url;
      confirmPopup.then(function(res) {
        if (res) {
          window.open(url, '_system', 'location=yes');
        };

      });
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  //andoird 底部出现在了上部 解决方案
  $ionicConfigProvider.platform.ios.tabs.style('standard');
  $ionicConfigProvider.platform.ios.tabs.position('bottom');
  $ionicConfigProvider.platform.android.tabs.style('standard');
  $ionicConfigProvider.platform.android.tabs.position('standard');

  $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
  $ionicConfigProvider.platform.android.navBar.alignTitle('left');

  $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
  $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

  $ionicConfigProvider.platform.ios.views.transition('ios');
  $ionicConfigProvider.platform.android.views.transition('android');
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'UserCtrl'
  })
  
  // Each tab has its own nav history stack:

  .state('app.index', {
    url: '/index',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-index.html',
        controller: 'IndexCtrl'
      }
    }
  })
  
  .state('app.quan', {//美O圈
    url: '/quan',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-quan.html',
        controller: 'QuanCtrl'
      }
    }
  })
  
  .state('app.order', { //我的的订单
    url: '/order',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-order.html',
        controller: 'OrderCtrl'
      }
    }
  })

 .state('user.userinfo', {
	  url: '/userinfo',
	  views: {
		  'menuContent': {
			  templateUrl: 'templates/user/userinfo.html',
			  controller: 'UserCtrl'
		  }
	  }
  })
  
  .state('addresss', { //收货地址
	  url: '/addresss',
	  abstract: true,
	  templateUrl: 'templates/user/address.html',
	  controller: 'AddCtrl'
  })
  
  .state('addresss.addresslist', {
    url: '/addresslist',
    views: {
      'addresss': {
        templateUrl: 'templates/user/addresslist.html',
        controller: 'AddresssCtrl'
      }
    }
  })
  
  
  
  .state('product', {
    url: '/product',
    abstract: true,
    templateUrl: 'templates/public/product.html',
    controller: 'Product'
  })
  
  .state('product.detail', {
	  url: '/detail/{productId:[0-9]{1,4}}',//页面之间的参数传递
	  views: {
		  'product': {
			  templateUrl: 'templates/public/product-detail.html',
			  controller: 'ProductCtrl'
		  }
	  }
  })

  
   .state('message', {
	  url: '/message',
	  abstract: true,
	  templateUrl: 'templates/message/message.html',
	  controller: 'Message'
  })
  
  .state('message.msgall', {//全部信息
	  url: '/msgall',
	  views: {
		  'message': {
			  templateUrl: 'templates/message/messageAll.html',
			  controller: 'MessageCtrl'
		  }
	  }
  })
  
  .state('message.msgwd', {//未读信息
	  url: '/msgwd',
	  views: {
		  'message': {
			  templateUrl: 'templates/message/messageWd.html',
			  controller: 'MessageCtrl'
		  }
	  }
  })
  
  .state('message.msgyd', {//已读信息
	  url: '/msgyd',
	  views: {
		  'message': {
			  templateUrl: 'templates/message/messageYd.html',
			  controller: 'MessageCtrl'
		  }
	  }
  })
  
  .state('message.msgxq', {//消息详情
    url: '/msgxq/:title',
    views: {
      'message': {
        templateUrl: 'templates/message/article.html',
        controller: 'msgArticle'
      }
    }
  })
  
  .state('public', { //公用视图容器
    url: '/public',
    abstract: true,
    templateUrl: 'templates/public/public.html',
    controller: 'Public'
  })
  
  .state('public.myCart', {//我的购物车
    url: '/myCart',
    views: {
      'public': {
        templateUrl: 'templates/public/myCart.html',
        controller: 'MyCart'
      }
    }
  })
  .state('public.order', {//我的订单
	  url: '/order/{msg}',
	  views: {
		  'public': {
			  templateUrl: 'templates/public/order.html',
			  controller: 'Order'
		  }
	  }
  })
  
  .state('public.logistics', {//物流详情
    url: '/logistics/{com}', //快递公司代码、快递单号、订单编号
    views: {
      'public': {
        templateUrl: 'templates/public/logistics.html',
        controller: 'Logistics'
      }
    }
  })
  
  

  .state('welcome', {
    url: '/welcome',
    abstract: true,
    templateUrl: 'templates/welcome/welcome.html',
    controller: 'Welcome'
  })

  .state('welcome.w_page', {
    url: '/w_page',
    views: {
      'welcome': {
        templateUrl: 'templates/welcome/w_page.html',
        controller: 'Welcome'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  console.log(!window.localStorage['first']);
  if(!window.localStorage['first']){
    $urlRouterProvider.otherwise('/welcome/w_page');
  }else{
    $urlRouterProvider.otherwise('/app/index');
  }
});