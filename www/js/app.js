// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','starter.addressController', 'starter.ordercrtl','starter.order','starter.question','starter.mycartcrtl','starter.services', 'ngCordova'])

.run(function($ionicPlatform, $http, $cordovaAppVersion, $ionicPopup, $ionicLoading, $cordovaFileTransfer,$cordovaImagePicker, Userinfo,$location,$rootScope) {
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
    
    
   //头像选择开始
    var options = {
      title: '上传头像',
      buttonLabels: ['从相册选择', '拍照'],
      addCancelButtonWithLabel: '取消',
      androidEnableCancelButton: true,
      winphoneEnableCancelButton: true
    };
    $scope.upLoadImg = function() {
      $cordovaActionSheet.show(options)
        .then(function(btnIndex) {
          switch (btnIndex) {
            case 1:
              $scope.pickImg();
              break;
            case 2:
              $scope.cameraImg();
              break;
            default:
              break;
          }
        });
    };

    $scope.pickImg = function() {
      var options = {
        maximumImagesCount: 1,
        width: 800,
        height: 800,
        quality: 80
      };
      alert(Userinfo.l.ue);
      var server =   'http://www.parsec.com.cn/Cetus/api_update_head?id='+Userinfo.l.id;//图片上传
      var trustHosts = true
      var option = {};

      $cordovaImagePicker.getPictures(options)
        .then(function(results) {
          $cordovaFileTransfer.upload(server, results[0], option, true)
            .then(function(result) {
              alert('上传成功');
              $scope.avaImg =  ApiEndpoint.pic_url+"/"+result.path;
            }, function(err) {
              alert('上传失败，请重试');
            }, function(progress) {
              $ionicLoading.show({
                template: "正在上传..." + Math.round((progress.loaded / progress.total) * 100) + '%'
              });
              if (Math.round((progress.loaded / progress.total) * 100) >= 99) {
                $ionicLoading.hide();
              }
            });
        }, function(error) {
          // alert('出错');
        });
    };

    $scope.cameraImg = function() {
      var server =   'http://www.parsec.com.cn/Cetus/api_update_head?id='+Userinfo.l.id;//图片上传
      var trustHosts = true
      var option = {};
      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 100,
        targetHeight: 100,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
    	  alert(imageData);
        $cordovaFileTransfer.upload(server, "data:image/jpeg;base64," + imageData, option, true)
          .then(function(result) {
            alert('上传成功');
            $scope.avaImg =  ApiEndpoint.pic_url+"/"+result.path;
            //$scope.doRefresh();
          }, function(err) {
            alert('上传失败，请重试');
          }, function(progress) {
            $ionicLoading.show({
              template: "正在上传..." + Math.round((progress.loaded / progress.total) * 100) + '%'
            });
            if (Math.round((progress.loaded / progress.total) * 100) >= 99) {
              $ionicLoading.hide();
            };
          });
      }, function(err) {
        // alert('出错'+err);
      });
    };
    //头像选择结束
    //产品分享 开始
    $scope.productShare = function(e, desc, p, index) {
	    var url = 'http://www.parsec.com.cn/Cetus/' + e;
	    var short_title = desc.substr(0, 3) + '...';
	    var price = null;
	    if (parseFloat(p) < 1) {
	      price = 1;
	    } else {
	      price = p;
	    }
	    var title = '神奇的美O圈“' + short_title + '”才' + price + '元';
	    Wechat.isInstalled(function(installed) {
	      if (!installed) {
	        alert("手机尚未安装微信应用");
	      } else {
	        $ionicLoading.show({
	          template: '正在打开微信,请稍等...'
	        });
	        $timeout(function() {
	          $ionicLoading.hide();
	        }, 3000);
	      }
	    });
	    var scope = "snsapi_userinfo";
	    Wechat.auth(scope, function (response) {
	        // you may use response.code to get the access token.
	        alert(JSON.stringify(response));
	    }, function (reason) {
	        alert("Failed: " + reason);
	    });
	    Wechat.share({
	      message: {
	        title: title,
	        description: '美O圈',
	        thumb: "http://m2.cosjii.com/img/logo_28.png",//LOGO
	        media: {
	          type: Wechat.Type.LINK,
	          webpageUrl: url
	        }
	      },
	      scene: Wechat.Scene.TIMELINE // share to Timeline
	    }, function() {
	    	$scope.showMsg("分享成功");
	    }, function(reason) {
	      if (reason == 'ERR_USER_CANCEL') {} else {
	    	  $scope.showMsg("分享失败: " + reason);
	      }
	    });
	};
	//产品分享结束
	
    //检查更新
    checkUpdate();
    
    document.addEventListener("deviceready", checkUpdate(), false);
    
    function checkUpdate() {
      alert("初始化检查版本");
      $cordovaAppVersion.getVersionNumber().then(function(version) {
        Userinfo.add('version', version);//如果是IOS 请将android 修改为ios
        $http.get('http://www.parsec.com.cn/Cetus/api_checkversion_get?deviceType=android&v='+version).success(function(data) {
          if (data.state == 'success') {
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
        	Window.open(url, '_system', 'location=yes');
        };

      });
    }
    
  });
	//主页面显示退出提示框
	  /*$ionicPlatform.registerBackButtonAction(function (e) {
	    e.preventDefault();
	
	    function showConfirm() {
	      var confirmPopup = $ionicPopup.confirm({
	        title: '<strong>退出应用?</strong>',
	        template: '你确定要退出应用吗?',
	        okText: '退出',
	        cancelText: '取消'
	      });
	      confirmPopup.then(function (res) {
	        if (res) {
	          ionic.Platform.exitApp();
	        } else {
	          // Don't close
	        }
	      });
	    }
	    // Is there a page to go back to?
	    if ($location.path() == '/home' ) {
	      showConfirm();
	    } else if ($rootScope.$viewHistory.backView ) {
	      console.log('currentView:', $rootScope.$viewHistory.currentView);
	      // Go back in history
	      $rootScope.$viewHistory.backView.go();
	    } else {
	      // This is the last page: Show confirmation popup
	      showConfirm();
	    }
	    return false;
	  }, 101);*/
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
  
  .state('app.product', {//美O圈
	  url: '/product',
	  views: {
		  'menuContent': {
			  templateUrl: 'templates/tab-product.html',
			  controller: 'UserCtrl'
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
    url: '/addresslist/{msg}',
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

  //新版  消息中心
  .state('message', {
	  url: '/message',
	  abstract: true,
	  templateUrl: 'templates/message/message.html',
	  controller: 'Message'
  })
   /*.state('message', {
	  url: '/message',
	  abstract: true,
	  templateUrl: 'templates/message/message.html',
	  controller: 'Message'
  })*/
  
 .state('message.msgall', {//全部信息
	  url: '/msgall',
	  views: {
		  'message': {
			  templateUrl: 'templates/message/messageShow.html',
			  controller: 'MessageCtrl'
		  }
	  }
  })
   /*
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
  })*/
  
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
  .state('public.question', {//我的订单
	  url: '/question',
	  views: {
		  'public': {
			  templateUrl: 'templates/public/question.html',
			  controller: 'Question'
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
  
  .state('public.commentList', {//评价订单的商品列表
    url: '/commentList/{ordNum}', //订单编号
    views: {
      'public': {
        templateUrl: 'templates/public/commentlist.html',
        controller: 'CommentList'
      }
    }
  })
  
  .state('public.comment', {//评价订单的商品详情
    url: '/comment/{itemId}', //订单下商品的itemID
    views: {
      'public': {
        templateUrl: 'templates/public/comment.html',
        controller: 'Comment'
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