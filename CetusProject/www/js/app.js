// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','starter.addressController', 'starter.ordercrtl','starter.order','starter.question','starter.mycartcrtl','starter.services','starter.filter', 'ngCordova'])

.run(function($ionicPlatform, $http, $cordovaAppVersion, $ionicPopup, $ionicLoading, $cordovaFileTransfer,$cordovaImagePicker, Userinfo,$location,$rootScope,$cordovaActionSheet, $timeout, $ionicHistory,$cordovaFileOpener2, $cordovaToast) {
	$ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    // 设备准备完后 隐藏启动动画
    //navigator.splashscreen.hide();

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
    
    
   //头像选择开始
   var options = {
      title: '上传头像',
      buttonLabels: ['从相册选择', '拍照'],
      addCancelButtonWithLabel: '取消',
      androidEnableCancelButton: true,
      winphoneEnableCancelButton: true
    };
    $rootScope.upLoadImg = function() {
      $cordovaActionSheet.show(options)
        .then(function(btnIndex) {
          switch (btnIndex) {
            case 1:
            	$rootScope.pickImg();
              break;
            case 2:
            	$rootScope.cameraImg();
              break;
            default:
              break;
          }
        });
    };

    $rootScope.pickImg = function() {
      var options = {
        maximumImagesCount: 1,
        width: 800,
        height: 800,
        quality: 80
      };
      var server =   'http://121.40.255.179/Cetus/api_update_head?id='+Userinfo.l.id;//图片上传
      var trustHosts = true
      var option = {};

      $cordovaImagePicker.getPictures(options)
        .then(function(results) {
          $cordovaFileTransfer.upload(server, results[0], option, true)
            .then(function(result) {
              alert('上传成功');
              $rootScope.avaImg =  ApiEndpoint.pic_url+"/"+result.path;
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

    $rootScope.cameraImg = function() {
      var server =   'http://121.40.255.179/Cetus/api_update_head?id='+Userinfo.l.id;//图片上传
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
        $cordovaFileTransfer.upload(server, "data:image/jpeg;base64," + imageData, option, true)
          .then(function(result) {
            alert('上传成功');
            $rootScope.avaImg =  ApiEndpoint.pic_url+"/"+result.path;
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
    
    //检查更新
    checkUpdate();
    
    function checkUpdate() {
      $cordovaAppVersion.getVersionNumber().then(function(version) {
        Userinfo.add('version', version);//如果是IOS 请将android 修改为ios
        $http.get('http://121.40.255.179/Cetus/api_checkversion_get?deviceType=android&v='+version).success(function(data) {
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
        	//window.open(url, '_blank', 'location=yes');
            $ionicLoading.show({
                template: "已经下载：0%"
            });
            var targetPath = "file:///storage/sdcard0/Download/Cetus_android.apk"; //APP下载存放的路径，可以使用cordova file插件进行相关配置
            var trustHosts = true
            var options = {};
            $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
                // 打开下载下来的APP
                $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive'
                ).then(function () {
                        // 成功
                }, function (err) {
                    // 错误
                });
                $ionicLoading.hide();
            }, function (err) {
                //alert('下载失败');
            	$ionicLoading.hide();
            	$ionicPopup.alert({
			        title: '提示',
			        template: '下载失败，请稍候重试...',
			        buttons: [{
			          text: '确定',
			          type: 'button-assertive'
			        }]
			    });
            }, function (progress) {
                //进度，这里使用文字显示下载百分比
                $timeout(function () {
                    var downloadProgress = (progress.loaded / progress.total) * 100;
                    $ionicLoading.show({
                        template: "已经下载：" + Math.floor(downloadProgress) + "%"
                    });
                    if (downloadProgress > 99) {
                        $ionicLoading.hide();
                    }
                },500)
            });
        };
      });
    }
    
  });
	//双击退出
    $ionicPlatform.registerBackButtonAction(function (e) {
        //判断处于哪个页面时双击退出
        if ($location.path() == '/app/index' || $location.path() == '/app/product' || $location.path() == '/app/quan' || $location.path() == '/app/order') {
            if ($rootScope.backButtonPressedOnceToExit) {
                ionic.Platform.exitApp();
            } else {
                $rootScope.backButtonPressedOnceToExit = true;
                $cordovaToast.showShortBottom('再按一次退出系统');
                setTimeout(function () {
                    $rootScope.backButtonPressedOnceToExit = false;
                }, 2000);
            }
        }else{
        	$ionicHistory.goBack();
        }
        /*} else if ($ionicHistory.backView()) {
            $ionicHistory.goBack();
        } else {
            $rootScope.backButtonPressedOnceToExit = true;
            $cordovaToast.showShortBottom('再按一次退出系统');
            setTimeout(function () {
                $rootScope.backButtonPressedOnceToExit = false;
            }, 2000);
        }*/
        e.preventDefault();
        return false;
    }, 101);
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  //andoird 底部出现在了上部 解决方案
  $ionicConfigProvider.platform.ios.tabs.style('standard');
  $ionicConfigProvider.platform.ios.tabs.position('bottom');
  $ionicConfigProvider.platform.android.tabs.style('standard');
  $ionicConfigProvider.platform.android.tabs.position('standard');

  $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
  $ionicConfigProvider.platform.android.navBar.alignTitle('center'); //处理android nav-title 没有居中的问题

  $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
  $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

  //$ionicConfigProvider.navBar.alignTitle('center');//处理android nav-title 没有居中的问题
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
      'tab-index': {
        templateUrl: 'templates/tab-index.html',
        controller: 'IndexCtrl'
      }
    }
  })
  
  .state('app.product', {//美O圈
	  url: '/product',
	  views: {
		  'tab-product': {
			  templateUrl: 'templates/tab-product.html',
			  controller: 'UserCtrl'
		  }
	  }
  })
  .state('app.quan', {//美O圈
    url: '/quan',
    views: {
      'tab-quan': {
        templateUrl: 'templates/tab-quan.html',
        controller: 'QuanCtrl'
      }
    }
  })
  
  .state('app.order', { //我的的订单
    url: '/order/{ran}',
    views: {
      'tab-order': {
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
	  url: '/msgall/{ran}',
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
    url: '/myCart/{ran}',
    views: {
      'public': {
        templateUrl: 'templates/public/myCart.html',
        controller: 'MyCart'
      }
    }
  })
  .state('public.order', {//我的订单
	  url: '/order/{msg}/{ran}',
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
        templateUrl: 'templates/public/commentList.html',
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
  
  .state('acount', {
    url: '/acount',
    abstract: true,
    templateUrl: 'templates/help/acount.html',
    controller: 'Acount'
  })
  
  .state('acount.user', {//用户信息管理
    url: '/user',
    cache: 'false',
    views: {
      'acount': {
        templateUrl: 'templates/user/user.html',
        controller: 'UserSetCrtl'
      }
    }
  })
  
  .state('acount.account', {//账户设置
    url: '/account',
    cache: 'false',
    views: {
      'acount': {
        templateUrl: 'templates/help/account.html',
        controller: 'AccountCrtl'
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
  //console.log(!window.localStorage['first']);
  if(!window.localStorage['first']){
    $urlRouterProvider.otherwise('/welcome/w_page');
  }else{
    $urlRouterProvider.otherwise('/app/index');
  }
});