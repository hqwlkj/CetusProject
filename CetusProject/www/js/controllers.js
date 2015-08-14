/*starry*/
angular.module('starter.controllers', ['ionic'])

.constant('ApiEndpoint', {
  url: 'http://www.parsec.com.cn/Cetus',
  pic_url:'http://www.parsec.com.cn/Cetus/pic'
})

.constant('HelpData', {
  arr: []
})

.controller('IndexCtrl', function($scope, $http, ApiEndpoint,Userinfo,$state) {
	$scope.titleState=0;//标题的显示状态
	$scope.banner = [];
	$http.post(ApiEndpoint.url + '/api_home_page?userId='+(Userinfo.l.id?Userinfo.l.id:"")).success(function(data) {
	  if (data.state == 'success') {
	     $scope.banner = data.activityList;
	   }
	});
	
	//打开广告链接
	$scope.openAdUrl = function(adUrl, title) {
		window.open(adUrl, '_blank', 'location=yes', title);
	}
})

.controller('Article', function($scope, $ionicHistory, $stateParams, HelpData) {
  $scope.param = {};
  $scope.backGo = function() {
    $ionicHistory.goBack();
  }

  for (var i = 0; i < HelpData.arr.length; i++) {
    if (HelpData.arr[i].title === $stateParams.title) {
      $scope.param.title = $stateParams.title;
      $scope.param.content = HelpData.arr[i].content;
    }
  }
})

.controller('UserCtrl', function($scope, $state, $ionicModal, $timeout, $ionicPopup, $ionicPopover, $http, ApiEndpoint, Userinfo, $ionicLoading, $cordovaActionSheet, $cordovaImagePicker, $cordovaFileTransfer, $cordovaCamera, $cordovaAppVersion,$cordovaFileOpener2, $stateParams) {
  //window.localStorage.clear();
  $scope.flag = Userinfo.l.flag;
  $scope.params = Userinfo.l;
  $scope.sign = Userinfo.l.today_signed;
  $scope.avaImg = Userinfo.l.headImg ? ApiEndpoint.pic_url+"/"+Userinfo.l.headImg : 'img/default-ava.png';
  $scope.searchData = {};
  $scope.goodsPage = 1;
  $scope.goods_load_over = true;
  $scope.products = [];
  $scope.InvitationName = '';
  $scope.discount = 1;
  $scope.app_version = Userinfo.l.version;
  $scope.doRefresh = function() {//下拉刷新
      $http.post(ApiEndpoint.url + '/api_home_page?userId='+(Userinfo.l.id?Userinfo.l.id:"")).success(function(data) {
    	if (data.state == 'success') {
          	$scope.products = data.productList;
          	$scope.InvitationName = data.InvitationName;
  	    	$scope.discount = data.discount;
  	    	$scope.$broadcast("scroll.refreshComplete");
         }
     })
  };

  $scope.doRefresh();
  
  $scope.loadGoods = function() {//加载更多商品
    $timeout(function() {
      $http.post(ApiEndpoint.url + '/api_home_page?userId='+(Userinfo.l.id?Userinfo.l.id:"")).success(function(data) {
        if (data.state == 'success') {
        	$scope.products = data.productList;
        	$scope.InvitationName = data.InvitationName;
	    	$scope.discount = data.discount;
          /*if (data.productList.length < 20) {//加载更多
            return;
          }*/
	    	$scope.goods_load_over = false;
          //$scope.goodsPage++;//页码加加
          //$scope.$broadcast("scroll.infiniteScrollComplete");
        }
      });
    }, 200);
  };

  $scope.cartClick = function() {
	  if(!Userinfo.l.id){
		  $scope.login();
		  return;
	  }
	  $state.go("public.myCart");
	}

  $scope.clickDetail = function(id) {//产品详情
	  $state.go('product.detail',{productId: id});
  };
  $scope.goAddress = function() {//收货地址
	  if(!Userinfo.l.id){
		  $scope.login();
		  return;
	  }
	  $state.go('addresss.addresslist',{userId: Userinfo.l.id});
  };

  $scope.myMessage = function(){
	  if(!Userinfo.l.id){
		  $scope.login();
		  return;
	  }
	  $state.go('message.msgall');
  };
  //到客服列表
  $scope.goQuestion = function(){
	  if(!Userinfo.l.id){
		  $scope.login();
		  return;
	  }
	  $state.go('public.question');
  };
  
  //头像选择
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
    var server =   ApiEndpoint.url + '/api_update_head?id='+Userinfo.l.id;//图片上传
    var trustHosts = true
    var option = {};

    $cordovaImagePicker.getPictures(options)
      .then(function(results) {
        $cordovaFileTransfer.upload(server, results[0], option, true)
          .then(function(result) {
            $ionicPopup.alert({
		        title: '提示',
		        template: '上传成功',
		        buttons: [{
		          text: '确定',
		          type: 'button-assertive'
		        }]
		    });
            $scope.avaImg =  ApiEndpoint.pic_url+"/"+result.path;
          }, function(err) {
            $ionicPopup.alert({
		        title: '提示',
		        template: '上传失败，请稍后重试',
		        buttons: [{
		          text: '确定',
		          type: 'button-assertive'
		        }]
		    });
          }, function(progress) {
        	  $timeout(function(){
        		  $ionicLoading.show({
        			  template: "正在上传..." + Math.round((progress.loaded / progress.total) * 100) + '%'
        		  });
        		  if (Math.round((progress.loaded / progress.total) * 100) >= 99) {
        			  $ionicLoading.hide();
        		  }
        	  },200);
          });
      }, function(error) {
        // alert('出错'+error);
      });
  };

  $scope.cameraImg = function() {
	var server =   ApiEndpoint.url + '/api_update_head?id='+Userinfo.l.id;//图片上传
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
          $scope.avaImg = ApiEndpoint.pic_url+"/"+result.path;
          //$scope.doRefresh();
        }, function(err) {
          alert('上传失败，请重试');
        }, function(progress) {
        	$timeout(function(){
      		  $ionicLoading.show({
      			  template: "正在上传..." + Math.round((progress.loaded / progress.total) * 100) + '%'
      		  });
      		  if (Math.round((progress.loaded / progress.total) * 100) >= 99) {
      			  $ionicLoading.hide();
      		  }
      	  },200);
        });
    }, function(err) {
       //alert('出错'+err);
    });
  };

 
  // 登陆
  $ionicModal.fromTemplateUrl('templates/user/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalLogin = modal;
    $scope.loginData = {};
  });

  // 关闭登录页面
  $scope.closeLogin = function() {
    $scope.modalLogin.hide();
    $scope.loginData = {};
  };

  // 打开登陆页面
  $scope.login = function() {
    $scope.modalLogin.show();
  };

  //提示消息
  $scope.showMsg = function(txt) {
    var template = '<ion-popover-view style = "background-color:#ec3473 !important" class = "light padding" > ' + txt + ' </ion-popover-view>';
    $scope.popover = $ionicPopover.fromTemplate(template, {
      scope: $scope
    });
    $scope.popover.show();
    $timeout(function() {
      $scope.popover.hide();
    }, 1400);
  };

  $scope.doLogin = function() {
    if (!$scope.loginData.username) {
      $scope.showMsg('用户名不能为空');
      return false;
    };
    if (!$scope.loginData.password) {
      $scope.showMsg('密码不能为空');
      return false;
    };
    $ionicLoading.show({
      template: "正在登录..."
    });
    $http.post(ApiEndpoint.url + '/api_user_login?json='+JSON.stringify({
    	loginName: $scope.loginData.username,
    	pwd: $scope.loginData.password
    })).success(function(data) {
      $ionicLoading.hide();
      if (data.state!= 'success') {
        $scope.showMsg(data.msg);
      } else {
        Userinfo.save(data.obj);
        Userinfo.add('flag', 1);
        $scope.sign = Userinfo.l.today_signed;
        $scope.avaImg = Userinfo.l.headImg ? ApiEndpoint.pic_url+"/"+Userinfo.l.headImg : 'img/default-ava.png';
        $scope.username = Userinfo.l.name ? Userinfo.l.name : '登录';
        $scope.cellPhone = Userinfo.l.cellPhone ? Userinfo.l.cellPhone : '';
        $scope.flag = 1;
        $scope.closeLogin();
        $scope.loadGoods();
      }
    });

  };


  /*$ionicModal.fromTemplateUrl('templates/user/user.html ', {
	  scope: $scope
  }).then(function(modal) {
	  $scope.userModal = modal;
	  $scope.userData = {};
  });*/
  $scope.user = function() {
	  //$scope.userModal.show();
	  //acount.user
	  $state.go('acount.user');
  };
 /* $scope.closeUser = function() {
	  $scope.userModal.hide();
	  $scope.userData = {};
  };*/
  
  /*$ionicModal.fromTemplateUrl('templates/help/about.html ', {
    scope: $scope
  }).then(function(modal) {
    $scope.aboutModal = modal;
    $scope.aboutData = {};
  });
  $scope.about = function() {
    $scope.aboutModal.show();
  };
  $scope.closeAbout = function() {
    $scope.aboutModal.hide();
    $scope.aboutData = {};
  };*/
  $scope.exit = function() {//退出登录
    $scope.flag = '';
    Userinfo.l.id = '';
    $scope.username="登录";
    $scope.cellPhone = '';
    $scope.avaImg="img/default-ava.png";
    window.localStorage.clear();//清除缓存
    Userinfo.remove('flag');
    $scope.modal.hide();
  };

  $scope.checkUpdata = function() {
      $cordovaAppVersion.getVersionNumber().then(function(version) {
        $ionicLoading.show({
          template: '检测版本中...'
        });
        Userinfo.add('version', version);//如果是IOS 请将android 修改为ios
        $http.get(ApiEndpoint.url + '/api_checkversion_get?deviceType=android&v='+version).success(function(data) {
          $ionicLoading.hide();
          if (data.state == 'success') {
            if (version != data.version) {
              $scope.showUpdateConfirm(data.desc, data.apk);
            } else {
              $ionicPopup.alert({
			        title: '提示',
			        template: '目前是最新版本',
			        buttons: [{
			          text: '确定',
			          type: 'button-assertive'
			        }]
			    });
            }
          } else {
            alert('服务器连接错误，请稍候再试');
          }
        })
      });
    }

  $scope.showUpdateConfirm = function(desc, url) {
    var confirmPopup = $ionicPopup.confirm({
      title: '有新版本了！是否要升级？',
      template: desc,
      cancelText: '下一次',
      okText: '确定'
    });
    var url = url;
    confirmPopup.then(function(res) {
      if (res) {
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

  $scope.aboutGoTo = function(listid){//用户信息修改
	  switch (listid) {
      case 1://头像
    	  $scope.upLoadImg();
        break;
      case 2: //姓名
    	// 一个精心制作的自定义弹窗
    	   var myPopup = $ionicPopup.show({
    	     template: '<input type="text" ng-model="data.username">',
    	     title: '修改姓名',
    	     subTitle: '',
    	     scope: $scope,
    	     buttons: [
    	       { text: '关闭' },
    	       {text: '<b>保存</b>',
    	         type: 'button-assertive',
    	         onTap: function(e) {
    	           if (!$scope.data.username) {
    	             //不允许用户关闭，除非他键入wifi密码
    	             e.preventDefault();
    	           } else {
    	             return $scope.data.username;
    	           }
    	         }
    	       },
    	     ]
    	   });
    	   myPopup.then(function(res) {
    	     console.log('Tapped!', res);
    	   });
        break;
      case 3://密码
    	$scope.username="登录";
    	$scope.cellPhone = '';
    	$scope.avaImg="img/default-ava.png";
    	window.localStorage.clear();//清除缓存
    	$ionicPopup.alert({
	        title: '提示',
	        template: '修改密码',
	        buttons: [{
	          text: '确定',
	          type: 'button-assertive'
	        }]
	    });
        break;
      default:
        break;
    };
  }
  

  // 注册
  $ionicModal.fromTemplateUrl('templates/user/register.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal_register = modal;
    $scope.registerData = {};
  });

  $scope.register = function() {
    $scope.modal_register.show();
  };
  $scope.closeRegister = function() {
    $scope.modal_register.hide();
    $scope.registerData = {};
  };
  $scope.doRegister = function() {
    var reg = /^1\d{10}$/;
    if (!$scope.registerData.phone) {
      $scope.showMsg('手机号不能为空');
      return false;
    } else if (!reg.test($scope.registerData.phone)) {
      $scope.showMsg('手机号格式错误');
      return false;
    };
    if (!$scope.registerData.username) {
    	$scope.showMsg('用户名不能为空');
    	return false;
    };
    if (!$scope.registerData.password || !$scope.registerData.repassword) {
      $scope.showMsg('密码不能为空');
      return false;
    } else if ($scope.registerData.password != $scope.registerData.repassword) {
      $scope.showMsg('两次密码不一致');
      return false;
    }
    $ionicLoading.show({
      template: '注册中...'
    });
    var u ={
		userName:$scope.registerData.username,
		cellPhone:$scope.registerData.phone,
		pwd:$scope.registerData.password,
		code:$scope.registerData.invitation,
		alipay:$scope.registerData.alipayCode
    }
    $http.post(ApiEndpoint.url + '/api_user_register?json='+ JSON.stringify(u)).success(function(data) {
      $ionicLoading.hide();
      $scope.showMsg(data.msg);
      if (data.state== 'success') {
    	  Userinfo.save(data.obj);
          Userinfo.add('flag', 1);
          $scope.flag = 1;
          $scope.sign = Userinfo.l.today_signed;
          $scope.avaImg = Userinfo.l.headImg ? ApiEndpoint.pic_url+"/"+Userinfo.l.headImg : 'img/default-ava.png';
          $scope.username = Userinfo.l.name ? Userinfo.l.name : '登录';
          $scope.cellPhone = Userinfo.l.cellPhone ? Userinfo.l.cellPhone : '';
          $scope.closeRegister();
          $scope.closeLogin();
          $scope.loadGoods();
      }
	});
  }
  $scope.username = Userinfo.l.name ? Userinfo.l.name : '登录';
  $scope.cellPhone = Userinfo.l.cellPhone ? Userinfo.l.cellPhone : '';
  
	//会员信息
	$ionicModal.fromTemplateUrl('templates/user/userinfo.html', {scope: $scope}).then(function(modal) {
		$scope.modal_user_info = modal;
	    $scope.userInfoData = {};
	});
  	//关闭会员信息页面
	$scope.closeUserInfo = function() {
	    $scope.modal_user_info.hide();
	    //$state.go('user.userinfo');
	    $scope.userInfoData = {};
	}
	//打开输入邀请码页面
	$scope.c_state = 0;
	$scope.openInvitationEdit = function() {
		if($scope.c_state==0){
			$scope.c_state=1
		}else{
			$scope.c_state=0;
		}
	}
	
	//绑定邀请码
	$scope.bandInvitation = function(){
		if(!$scope.userInfoData.invitationCode){
			$scope.showMsg("邀请码为空");
			return;
		}
		$http.post(ApiEndpoint.url + '/api_binding_invitationcode?userId='+(Userinfo.l.id?Userinfo.l.id:"")+"&invitationCode="+$scope.userInfoData.invitationCode).success(function(data) {
			$scope.showMsg(data.msg);
			if (data.state =="success") {
				$scope.c_state = 0;
				$scope.state = 0;
				$scope.userinfo_InvitationName = data.InvitationName;
			}
		});
	}
	$scope.show_myInvitationCode = 0;
	//加载会员信息数据 并且打开
	$scope.userInfo = function() {
		if(!Userinfo.l.id){
			$scope.modalLogin.show();
		}else{
			$scope.modal_user_info.show();
			$ionicLoading.show({
			     template: '加载中...'
			});
			$http.post(ApiEndpoint.url + '/api_userinfo?userId='+(Userinfo.l.id?Userinfo.l.id:"")).success(function(data) {
				if (data.state == 'success') {
					$scope.userinfo_name = data.obj.name;
					$scope.userinfo_userNo = data.obj.userNo;
					$scope.userinfo_userType = data.obj.userTypeName;
					$scope.userinfo_myScore = data.obj.myscore+"分";
					$scope.userinfo_myMoney = "￥"+data.obj.mymoney.toFixed(2);
					$scope.userinfo_myInvitationCode = data.obj.myInvitation;
					if(data.obj.InvitationName!=''){
						$scope.state = 0;
						$scope.userinfo_InvitationName = data.obj.InvitationName;
					}else{
						$scope.state = 1;
					}
					if(data.obj.userType!=1){
						$scope.show_myInvitationCode = 1;
					}
				}
				$ionicLoading.hide();
			});
		}
	}
	
	$scope.usercoin_data_list=[];
	$scope.usercoin_pageNo=1;
	$scope.usercoin_pages;
	//用户积分
	$ionicModal.fromTemplateUrl('templates/user/usercoin.html', {scope: $scope}).then(function(modal) {
		$scope.modal_usercoin = modal;
	});
	//显示用户积分页面
	$scope.show_usercoin = function(){
		$scope.modal_usercoin.show();
		$ionicLoading.show({
		     template: '加载中...'
		});
		$scope.load_usercoin_score();//加载数据
		$scope.load_usercoin_data();//加载列表数据
	}
	//关闭用户积分页面
	$scope.close_usercoin = function(){
		$scope.modal_usercoin.hide();
	}
	//用户积分下拉刷新
	$scope.usercoin_doRefresh = function(){
		$scope.usercoin_pageNo = 1;
		$scope.load_usercoin_data();
	}
	$scope.usercoin_load_state = false;
	//用户积分上拉加载更多
	$scope.usercoin_loadmore = function(){
		if($scope.usercoin_pageNo<$scope.usercoin_pages){
			$scope.usercoin_pageNo = $scope.usercoin_pageNo+1;
			$scope.usercoin_load_state = true;
			$scope.load_usercoin_data();
		}
		$timeout(function() {
			$scope.usercoin_load_state = false;
	    }, 3000);
	}
	//加载积分列表
	$scope.load_usercoin_data = function(){
		var obj = {};
		obj.userId = Userinfo.l.id;
		obj.pageNo = $scope.usercoin_pageNo;
		obj.state = -1;
		$http.post(ApiEndpoint.url + '/api_score_list?json='+JSON.stringify(obj)).success(function(data) {
			$scope.$broadcast("scroll.refreshComplete");
			$scope.usercoin_load_state = false;
			if (data.state =="success") {
				$scope.usercoin_pageNo = data.obj.pageNo;
				$scope.usercoin_pages = data.obj.totalPages;
				$scope.usercoin_data_list = data.list;
			}
		});
	}
	//加载用户积分
	$scope.load_usercoin_score = function(){
		$http.post(ApiEndpoint.url + '/api_score_get?userId='+(Userinfo.l.id?Userinfo.l.id:"")).success(function(data) {
			if (data.state =="success") {
				$scope.usercoin_username = data.userName;
				$scope.usercoin_score = data.score;
			}
			$ionicLoading.hide();
		});
	}
	
	
	//我的团队
	$ionicModal.fromTemplateUrl('templates/user/myteam.html', {scope: $scope}).then(function(modal) {
		$scope.modal_myteam = modal;
	});
	//显示我的团队页面
	$scope.show_myteam = function(){
		$ionicLoading.show({
		     template: '加载中...'
		});
		$scope.modal_myteam.show();
		$http.post(ApiEndpoint.url + '/api_myteam?userId='+(Userinfo.l.id?Userinfo.l.id:"")).success(function(data) {
			if (data.state =="success") {
				$scope.myteam_username = data.userName;
				$scope.myteam_moneyInThreeMonth = data.moneyInThreeMonth.toFixed(2)+"元";
				$scope.myteam_rebate = data.sumRebate.toFixed(2);
				$scope.myteam_allscore = data.allscore;
				$scope.myteam_mymoney = data.mymoney.toFixed(2)+"元";
				$scope.myteam_myscore = data.myscore+"分";
				$scope.myteam_teammoney = data.teammoney.toFixed(2)+"元";
				$scope.myteam_teamscore = data.teamscore+"分";
			}else{
				$scope.showMsg(data.msg);
			}
			$ionicLoading.hide();
		});
	}
	//关闭我的团队页面
	$scope.close_myteam = function(){
		$scope.modal_myteam.hide();
	}
	
	//-----------------------------------------------------------------我的活动------------------------------------------------------------------------------
	//打开活动列表页面
	$ionicModal.fromTemplateUrl('templates/public/activitylist.html', {scope: $scope}).then(function(modal) {
		$scope.modal_activity_list = modal;
	    $scope.activityListData = {};
	});
  	//关闭活动列表页面
	$scope.closeActivityList = function() {
	    $scope.modal_activity_list.hide();
	    $scope.activityListData = {};
	}
	//跳转到订单页面（免费领取活动的立即领取、满送活动的立即购买或领取赠品）。sta为1表示领取，2表示购买
	$scope.goOrder = function(obj, sta) {
		var productId = obj.product.id;
		var productNum = 1;
		if (sta == 2) 
			productNum = obj.detail.buysNum;
		var userId = (Userinfo.l.id?Userinfo.l.id:"");
		var activityId = obj.activity.id;

		$http.post(ApiEndpoint.url + '/api_encode?msg='+productId+' '+productNum+' '+userId+' '+activityId+' '+sta).success(function(data) {
			if (data.state =="success") {
				$state.go('public.order',{msg:data.secret});
				$scope.modal_activity_list.hide();
				return;
			}else{
				$scope.showMsg(data.msg);
			}
		});
	}
	//签到
	$scope.addSign = function(acId) {
		$ionicLoading.show({
		    template: "加载中..."
		});
//		var share = {};
//		share.userId = (Userinfo.l.id?Userinfo.l.id:"");
//		share.activityId = acId;
//		share.type = 1;
//		share.shareSns = "";
		$http.post(ApiEndpoint.url + '/api_app_signandshare_save?type=1&userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&activityId='+acId+'&shareSns=').success(function(data) {
			$ionicLoading.hide();
			var title = data.title;
			var msg = data.msg;
			if (data.state == 'success') {
				title = "提示";
				msg = "签到成功";
			}
			$ionicPopup.alert({
		        title: title,
		        template: msg,
		        buttons: [{
		          text: '确定',
		          type: 'button-assertive'
		        }]
		    }).then(function(res) {
		    	if (data.state == 'success')
		    		$scope.activityList();
			});
		});
	}
	//分享。
	$scope.toShare = function(acId) {
//	    Wechat.isInstalled(function(installed) {
//	      if (!installed) {
//	        alert("手机尚未安装微信应用");
//	      } else {
//	        $ionicLoading.show({
//	          template: '正在打开微信,请稍等...'
//	        });
//	        $timeout(function() {
//	          $ionicLoading.hide();
//	        }, 3000);
//
////			alert(WeChat.Scene.TIMELINE+"----");
////		    $scope.shareViaWechat(1, "分享到微信朋友圈", 'aaa', 'http://baidu.com', 'cccc');
//	      }
//	    });
		var shareContent = {
				title: '', // 分享标题
				desc: '', // 分享描述
				link: '', // 分享链接 分享的URL，以http或https开头
				imgUrl: '', // 分享图标 分享图标的URL，以http或https开头
				type: '', // 分享类型,music、video或link，不填默认为link
				dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
				acId:'',//活动ID 
				shareUser:'' //分享用户
			}
		$http.post(ApiEndpoint.url + '/api_activity_detail?activityId='+acId+'&userId='+(Userinfo.l.id?Userinfo.l.id:"")).success(function(data) {
			if(data.state =="success") {
				var obj = data.obj;
				
				shareContent.title =obj.name;//标题
				shareContent.desc =obj.remark+"活动时间："+obj.showBeginTime+"—"+obj.showEndTime;//描述
				//shareContent.link = window.location.protocol+"//"+window.location.host+":"+window.location.port+"/Cetus/mobile/activity.html?userid=&activityId="+acId;//分享链接
				shareContent.link = data.sharelink;//分享链接
				shareContent.imgUrl= window.location.protocol+"//"+window.location.host+":"+window.location.port+"/Cetus/qn_pic/"+obj.activityIcon;//分享图标
				shareContent.type='link';
				shareContent.shareUser = (Userinfo.l.id?Userinfo.l.id:"");
				shareContent.acId = acId;
//				console.log(shareContent);
				
				$scope.shareViaWechat(shareContent);
			}else{
				$ionicLoading.show({
			          template: data.msg
		        });
		        $timeout(function() {
		            $ionicLoading.hide();
		        }, 1000);
			}
		});
		
	    

	}
	$scope.shareViaWechat = function(shareContent) {
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
		        title: shareContent.title,
		        description: shareContent.desc,
//		        thumb: shareContent.imgUrl,//LOGO
		        thumb: "http://m2.cosjii.com/img/logo_28.png",
		        media: {
		           type: Wechat.Type.LINK,
		           webpageUrl: shareContent.link
		        }
		      },
	         scene: Wechat.Scene.TIMELINE
		    }, function() {
		    	$http.post(ApiEndpoint.url + '/api_app_signandshare_save?type=2&userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&activityId='+shareContent.acId+'&shareSns="微信朋友圈"').success(function(data) {
					$ionicLoading.hide();
					var title = data.title;
					var msg = data.msg;
					if (data.state == 'success') {
						title = "提示";
						msg = "分享成功";
					}
					$ionicPopup.alert({
				        title: title,
				        template: msg,
				        buttons: [{
				          text: '确定',
				          type: 'button-assertive'
				        }]
				    }).then(function(res) {
				    	if (data.state == 'success')
				    		$scope.activityList();
					});
				});
		    }, function(reason) {
		      if (reason == 'ERR_USER_CANCEL') {} else {
		    	  $scope.showMsg("分享失败: " + reason);
		      }
		    });
    };
	//加载活动列表内容
	$scope.activityList = function() {
		$ionicLoading.show({
		    template: "加载中..."
		});
		console.log(Userinfo);
		if(!Userinfo.l.id){
			$ionicLoading.hide();
			$scope.modalLogin.show();
		}else{
			$scope.modal_activity_list.show();
			$http.post(ApiEndpoint.url + '/api_activity_list?userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&type=1').success(function(data) {
				if (data.state == 'success') {
					$scope.activitys = data.list;
				}
				$ionicLoading.hide();
			});
		}
	}
	
	//打开活动详情页面
	$ionicModal.fromTemplateUrl('templates/public/activity-detail.html', {scope: $scope}).then(function(modal) {
		$scope.modal_activity_detail = modal;
	    $scope.activityId = 0;
	});
  	//关闭活动详情页面
	$scope.closeActivityDetail = function() {
	    $scope.modal_activity_detail.hide();
	    $scope.activityId = 0;
	}
	//加载活动详情内容
	$scope.activityDetail = function(acId) {
		$ionicLoading.show({
		    template: "加载中..."
		});
		console.log(Userinfo);
		if(!Userinfo.l.id){
			$ionicLoading.hide();
			$scope.modalLogin.show();
		}else{
			$scope.modal_activity_detail.show();
			$http.post(ApiEndpoint.url + '/api_activity_detail?activityId='+acId+'&userId='+(Userinfo.l.id?Userinfo.l.id:"")).success(function(data) {
				if (data.state == 'success') {
					$scope.imgUrl = ApiEndpoint.pic_url+"/"+data.obj.activityIcon;
					$scope.title = data.obj.name;
					$scope.times = data.obj.showBeginTime+"—"+data.obj.showEndTime;
					$scope.content = data.obj.remark;
				    $scope.activityId = data.obj.id;
				}
				$ionicLoading.hide();
			});
		}
	}
	//点击马上参与按钮
	$scope.addActivity = function() {
		$http.post(ApiEndpoint.url + '/api_activity_add?activityId='+$scope.activityId+'&userId='+(Userinfo.l.id?Userinfo.l.id:"")).success(function(data) {
			if (data.state == 'success') {
				var obj = data.activity;
				if (obj.activityType == 2){  //活动类型为满送活动
					var detailObj = data.detail;
					//前往订单页面，参与满送活动
				}else {
					$scope.activityList();
				}
			}else {
				$ionicPopup.alert({
			        title: '提示',
			        template: data.msg,
			        buttons: [{
			          text: '确定',
			          type: 'button-assertive'
			        }]
			    });
			}
		});
	}
	
	//打开广告详情页面
	$ionicModal.fromTemplateUrl('templates/public/adDetail.html', {scope: $scope}).then(function(modal) {
		$scope.modal_ad_detail = modal;
	});
  	//关闭广告详情页面
	$scope.closeAdDetail = function() {
	    $scope.modal_ad_detail.hide();
	}
	//加载广告详情内容
	$scope.adDetail = function(acId) {
		$ionicLoading.show({
		    template: "加载中..."
		});
		console.log(Userinfo);
		if(!Userinfo.l.id){
			$ionicLoading.hide();
			$scope.modalLogin.show();
		}else{
			$scope.modal_ad_detail.show();
			$http.post(ApiEndpoint.url + '/api_activity_detail?activityId='+acId+'&userId='+(Userinfo.l.id?Userinfo.l.id:"")).success(function(data) {
				if (data.state == 'success') {
					$scope.detailImg = ApiEndpoint.pic_url+"/"+data.obj.activityIcon;
					$scope.detailTitle = data.obj.name;
					$scope.detailContent = data.obj.adContent;
				}
				$ionicLoading.hide();
			});
		}
	}
})


//美O圈Controller
.controller('QuanCtrl',function($scope, $ionicPopover, $timeout, $ionicModal, $ionicLoading, $http, Userinfo, ApiEndpoint, $state){
	$scope.titleState=1;//标题的显示状态
	$scope.quans = [];  //美O圈数据
	$scope.doRefresh = function() {//下拉刷新
      $http.post(ApiEndpoint.url + '/api_europeanpowder_list').success(function(data) {
        if (data.state == 'success') {
        	$scope.quans = data.list;
        }else {
        	$scope.showMsg(data.msg);
        }
        $scope.$broadcast("scroll.refreshComplete");
      })
	};
	
	$scope.doRefresh();
	
	//打开某个美O圈数据详情
	$ionicModal.fromTemplateUrl('templates/quan-detail.html', {scope: $scope}).then(function(modal) {
		$scope.modal_quan_detail = modal;
	});
  	//关闭活动列表页面
	$scope.closeQuanDetail = function() {
	    $scope.modal_quan_detail.hide();
	}
	//加载详情
	$scope.quanDetail = function(quanId) {
		$ionicLoading.show({
		    template: "加载中..."
		});
		$scope.modal_quan_detail.show();
		$http.post(ApiEndpoint.url + '/api_europeanpowder_detail?euroId='+quanId).success(function(data) {
			if (data.state == 'success') {
				$scope.title = data.european.title;
				$scope.detailTime = data.european.showCreateTime;
				$scope.quanImg = ApiEndpoint.pic_url+"/"+data.european.imgUrl;
				$scope.detailContent = data.european.content;
			}
			$ionicLoading.hide();
		});
	}
})

.controller('Public', function($scope, $ionicPopover, $timeout, $ionicModal, $ionicLoading, $http, Userinfo, ApiEndpoint, $state) {
  $scope.showMsg = function(txt) {
    var template = '<ion-popover-view style = "background-color:#ec3473 !important" class = "light padding" > ' + txt + ' </ion-popover-view>';
    $scope.popover = $ionicPopover.fromTemplate(template, {
      scope: $scope
    });
    $scope.popover.show();
    $timeout(function() {
      $scope.popover.hide();
    }, 1400);
  };
  
})


//欢迎页
.controller('Welcome', function($scope, $ionicModal, $state) {
  $scope.guideFlag = 'a';
  $scope.guideSure = function() {
    $state.go('app.index');
    window.localStorage['first'] = '1';
  };

  $scope.onSwipeLeft = function() {
    switch ($scope.guideFlag) {
      case 'a':
        $scope.guideFlag = 'b';
        break;
      case 'b':
        $scope.guideFlag = 'c';
        break;
      case 'c':
        $scope.guideFlag = 'd';
        break;
      case 'd':
        $scope.guideFlag = 'e';
        break;
      default:
        break;
    }
  };

})


.controller('Product',function($scope, $ionicModal, $state, $ionicHistory, $ionicPopover, $timeout,$stateParams){
	$scope.param = {};
	//后退
	$scope.backGoPro = function() {
	    //$ionicHistory.goBack();
	    $state.go('app.index');
	}
	
	//提示信息
	$scope.showMsg = function(txt) {
	    var template = '<ion-popover-view style = "background-color:#ec3473 !important" class = "light padding" > ' + txt + ' </ion-popover-view>';
	    $scope.popover = $ionicPopover.fromTemplate(template, {
	      scope: $scope
	    });
	    $scope.popover.show();
	    $timeout(function() {
	      $scope.popover.hide();
	    }, 1400);
	 }
})
.controller('ProductCtrl',function($scope, $http, $ionicModal, $state,$timeout,$stateParams,$ionicLoading,$ionicActionSheet,Userinfo,ApiEndpoint,$ionicPopover){
	$scope.picfiles = [];
	$scope.comments = [];
	$scope.product = {};
	$scope.cartData ={};
	$scope.commenHtml="";
	$scope.commenState=true;
	$scope._width="200px";
	$ionicLoading.show({
	     template: '加载中...'
	});
	$timeout(function() {
	   //console.log(ApiEndpoint.url + '/api_product_detail?productId='+$stateParams.productId+'&userId='+(Userinfo.l.id?Userinfo.l.id:""));
	   $http.post(ApiEndpoint.url + '/api_product_detail?productId='+$stateParams.productId+'&userId='+(Userinfo.l.id?Userinfo.l.id:"")).success(function(data) {
		   $ionicLoading.hide();  
			if (data.state == 'success') {
				$scope.product = data;
				$scope.picfiles = data.picfiles;
				$scope.cartData.stockNum = $scope.product.stockNum;
				$scope.cartData.amount = 1;
	        }else{
	            $scope.showMsg(data.msg);
	        }
	    });
	   console.log(ApiEndpoint.url + '/api_comment_list?pid='+$stateParams.productId+'&pageNo=1');
	   $http.post(ApiEndpoint.url + '/api_comment_list?pid='+$stateParams.productId+'&pageNo=1').success(function(data) {
			if (data.state == 'success') {
				$scope._width =(document.body.scrollWidth - 30)+"px;";
				if(data.list.length){
					$scope.comments = data.list;
				}else{
					$scope.commenState=false;
					$scope.commenHtml = "该商品暂无任何评论...";
				}
	        }else{
	            $scope.showMsg(data.msg);
	        }
	    });
	}, 200)
	//客服
	$scope.kf = function() {
		if(!Userinfo.l.id){
			  $scope.login();
			  return;
		  }
		  $state.go('public.question');
		//$scope.showMsg("开发中");
	};
	//分享
	$scope.productShare = function(code, desc, p, index) {
	    var url = 'httpp://www.parsec.com.cn';
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
	
	//提示信息
	$scope.showMsg = function(txt) {
	    var template = '<ion-popover-view style = "background-color:#ec3473 !important" class = "light padding" > ' + txt + ' </ion-popover-view>';
	    $scope.popover = $ionicPopover.fromTemplate(template, {
	      scope: $scope
	    });
	    $scope.popover.show();
	    $timeout(function() {
	      $scope.popover.hide();
	    }, 1400);
	 }
	//商品数量减少或增加。sta为1表示减1，为2表示加1
	$scope.productNum = function(sta) {
		if (sta == 1) {
			if ($scope.cartData.amount == 1) 
				$scope.showMsg('商品数量不能小于1');
			else
				$scope.cartData.amount -= 1;
		}else {
			if ($scope.cartData.amount >= $scope.product.stockNum) 
				$scope.showMsg('商品数量不能超过库存数');
			else
				$scope.cartData.amount += 1;
		}
	}
	//加入购物车
	$scope.addCart = function() {
		if ($scope.cartData.amount > $scope.product.stockNum) {
			$scope.showMsg('库存不足');
			return;
		}
		if ($scope.cartData.amount < 1) {
			$scope.showMsg('商品数量不能小于1');
			return;
		}
		$ionicLoading.show({
		     template: '加载中...'
		});
		var cart = {};
		cart.userId = (Userinfo.l.id?Userinfo.l.id:"");
		cart.productId = $scope.product.id;
		cart.productNum = $scope.cartData.amount;
		if(!Userinfo.l.id){
			$ionicLoading.hide();
//			$scope.modalLogin.show();
			$scope.showMsg("请先登录");
		}else{
			$http.post(ApiEndpoint.url + '/api_cart_add?json='+JSON.stringify(cart)).success(function(data) {
				if (data.state == 'success') {
					$scope.showMsg("加入购物车成功");
		        }else{
		            $scope.showMsg(data.msg);
		        }
				$ionicLoading.hide();
		    });
		}
	}
})

.controller('Message',function($scope, $ionicModal, $state,$timeout,$ionicHistory,$state){
	 
})

//美O圈个人消息中心
.constant('HelpData', {
  arr: []
})
.controller('MessageCtrl',function($scope, $ionicPopover, $timeout, $ionicModal, $ionicLoading,$location, $http, Userinfo, ApiEndpoint, $state,HelpData,$ionicHistory){
	$scope.backGoMsg = function() {
	    //$ionicHistory.goBack();
	    $state.go('app.index');
	}
	$scope.isActive = 'a';
	$scope.changeTab = function(evt) {
	    var elem = evt.currentTarget;
	    $scope.isActive = elem.getAttributeNode('data-active').value;
	    $scope.orderGoTo($scope.isActive);
    };
    $scope.orderGoTo = function(isActive){
    	switch (isActive) {
		case 'a':
			$scope.getMessageWd();
			break;
		case 'b':
			//$scope.getMessageYd();
			break;
		case 'c':
			//$scope.getMessageAll();
			break;
		default:
			$scope.getMessageWd();
			break;
		}
    }
    $scope.flag = true;//显示消息中心
	$scope.messageWd = [];
	$scope.messageYd = [];
	$scope.messageAll = [];
	
	//未读的点击
	$scope.getMessageWd = function() {
		  $ionicLoading.show({
			    template: "加载中..."
		 });
		  $http.post(ApiEndpoint.url + '/api_message_list?userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&state=0'+'&pageNo=1'+'&pageSize=10').success(function(data) {
			  $scope.nomsg = false;//未读消息提示默认隐藏
			  if (data.state == 'success') {
				  if(data.lst.length<1){
					  $scope.nomsg = true;
					  $ionicLoading.hide();
				  }
				  for (var i = 0; i < data.lst.length; i++) {
				        (data.lst)[i].index = i + 1;
				        HelpData.arr.push((data.lst)[i]);
				        $ionicLoading.hide();
				      }
				      $scope.messageWd = data.lst;
				    }
			});
	  };
	//未读的默认加载
	$http.post(ApiEndpoint.url + '/api_message_list?userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&state=0'+'&pageNo=1'+'&pageSize=10').success(function(data) {
	  if (data.state == 'success') {
		  for (var i = 0; i < data.lst.length; i++) {
		        (data.lst)[i].index = i + 1;
		        HelpData.arr.push((data.lst)[i]);
		      }
		      $scope.messageWd = data.lst;
		    }
	});
	
	//已读
	 $http.post(ApiEndpoint.url + '/api_message_list?userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&state=1'+'&pageNo=1'+'&pageSize=10').success(function(data) {
		    if (data.state == 'success') {
		      for (var i = 0; i < data.lst.length; i++) {
		        (data.lst)[i].index = i + 1;
		        HelpData.arr.push((data.lst)[i]);
		      }
		      $scope.messageYd = data.lst;
		    }
		  });
	//全部
	 $http.post(ApiEndpoint.url + '/api_message_list?userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&pageNo=1'+'&pageSize=10').success(function(data) {
		    if (data.state == 'success') {
		      for (var i = 0; i < data.lst.length; i++) {
		        (data.lst)[i].index = i + 1;
		        HelpData.arr.push((data.lst)[i]);
		      }
		      $scope.messageAll = data.lst;
		    }
		  });

         //处理未读消息变成已读消息
		  $scope.helpDetail = function(k,test) {
			  var title=k.title;
			  var msgId=k.mid;
			   //alert(title);
			  // alert(msgId);
			  if(test==1||test=="1"){
				  $http.post(ApiEndpoint.url + '/api_message_detail?userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&msgId='+msgId).success(function(data) {
					    if (data.state == 'success') {
					    	 $location.path('message/msgxq/' + title);
					    }
					  });
			  }else{
				  $location.path('message/msgxq/' + title);
			  }
			  
		   
		  }
})

.controller('msgArticle', function($scope, $ionicHistory, $stateParams, HelpData,$ionicHistory, $state) {
  $scope.param = {};
  $scope.flag = false;//隐藏大的消息中心 显示出详情的顶部
  for (var i = 0; i < HelpData.arr.length; i++) {
    if (HelpData.arr[i].title === $stateParams.title) {
      $scope.param.title = $stateParams.title;
      $scope.param.time = HelpData.arr[i].showCreateTime;
      $scope.param.content = HelpData.arr[i].content;
    }
  }
})


.controller('Acount', function($scope, $ionicHistory, $state, $http, ApiEndpoint, Userinfo) {
	$scope.showMsg = function(txt) {
	    var template = '<ion-popover-view style = "background-color:#ec3473 !important" class = "light padding" > ' + txt + ' </ion-popover-view>';
	    $scope.popover = $ionicPopover.fromTemplate(template, {
	      scope: $scope
	    });
	    $scope.popover.show();
	    $timeout(function() {
	      $scope.popover.hide();
	    }, 1400);
	  };
})
.controller('UserSetCrtl',function($scope, $ionicHistory, $state, $ionicPopup, $http, $ionicLoading, $ionicPopover, ApiEndpoint, $ionicModal, $timeout, Userinfo ,$cordovaActionSheet, $cordovaImagePicker, $cordovaFileTransfer, $cordovaCamera, $cordovaAppVersion,$cordovaFileOpener2, $stateParams){
	$scope.loginData ={};
	$scope.registerData ={};
	$scope.flag = Userinfo.l.flag;
	$scope.params = Userinfo.l;
	$scope.avaImg = Userinfo.l.headImg ? ApiEndpoint.pic_url+"/"+Userinfo.l.headImg : 'img/default-ava.png';
	$scope.app_version = Userinfo.l.version;
	$scope.userGoTo = function(listid) {
	    switch (listid) {
	      case 1:
	    	$scope.goAbortUs();
	        break;
	      case 2:
	    	$scope.checkUpdata();
	        break;
	      case 3:
	    	  console.log(window.localStorage);
	    	//window.localStorage.clear();//清除缓存
	    	$ionicPopup.alert({
		        title: '提示',
		        template: '缓存已清除',
		        buttons: [{
		          text: '确定',
		          type: 'button-assertive'
		        }]
		    });
	        break;
	      case 4:
	    	  $state.go('acount.account');
	    	  $scope.modal.hide();
	    	  break;
	      default:
	        break;
	    };
	  }
	  $scope.closeUser = function() {
		  $state.go('app.index');
	  };
	  
	  $scope.doRefreshUser = function(){
		  $timeout(function(){
			  $http.post(ApiEndpoint.url + '/api_user_detail?id='+Userinfo.l.id).success(function(data) {
			    if (data.state == "success") {
			      Userinfo.save(data.obj);
			      $scope.userinfo = Userinfo.l;
			      $scope.userinfo.cellPhone = Userinfo.l.cellPhone != 'null' ? Userinfo.l.cellPhone : '';
			      $scope.userinfo.realname = Userinfo.l.name != 'null' ? Userinfo.l.name : '';
			      $scope.userinfo.alipay = Userinfo.l.alipay != 'null' ? Userinfo.l.alipay : '';
			      $scope.$broadcast("scroll.refreshComplete");
			    }
			  });
		  },500);
	  }
	  
	  
	  
	//头像选择
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
	    var server =   ApiEndpoint.url + '/api_update_head?id='+Userinfo.l.id;//图片上传
	    var trustHosts = true
	    var option = {};

	    $cordovaImagePicker.getPictures(options)
	      .then(function(results) {
	        $cordovaFileTransfer.upload(server, results[0], option, true)
	          .then(function(result) {
	            $ionicPopup.alert({
			        title: '提示',
			        template: '上传成功',
			        buttons: [{
			          text: '确定',
			          type: 'button-assertive'
			        }]
			    });
	            $scope.avaImg =  ApiEndpoint.pic_url+"/"+result.path;
	            $state.reload();
	          }, function(err) {
	            $ionicPopup.alert({
			        title: '提示',
			        template: '上传失败，请稍后重试',
			        buttons: [{
			          text: '确定',
			          type: 'button-assertive'
			        }]
			    });
	          }, function(progress) {
	        	  $timeout(function(){
	        		  $ionicLoading.show({
	        			  template: "正在上传..." + Math.round((progress.loaded / progress.total) * 100) + '%'
	        		  });
	        		  if (Math.round((progress.loaded / progress.total) * 100) >= 99) {
	        			  $ionicLoading.hide();
	        		  }
	        	  },200);
	          });
	      }, function(error) {
	        // alert('出错'+error);
	      });
	  };

	  $scope.cameraImg = function() {
		var server =   ApiEndpoint.url + '/api_update_head?id='+Userinfo.l.id;//图片上传
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
	            $ionicPopup.alert({
			        title: '提示',
			        template: '上传成功',
			        buttons: [{
			          text: '确定',
			          type: 'button-assertive'
			        }]
			    });
	          $scope.avaImg = ApiEndpoint.pic_url+"/"+result.path;
	          $state.reload();
	          //$scope.doRefresh();
	        }, function(err) {
	            $ionicPopup.alert({
			        title: '提示',
			        template: '上传失败，请稍后重试',
			        buttons: [{
			          text: '确定',
			          type: 'button-assertive'
			        }]
			    });
	        }, function(progress) {
	        	$timeout(function(){
        		  $ionicLoading.show({
        			  template: "正在上传..." + Math.round((progress.loaded / progress.total) * 100) + '%'
        		  });
        		  if (Math.round((progress.loaded / progress.total) * 100) >= 99) {
        			  $ionicLoading.hide();
        		  }
        	  },200);
	        });
	    }, function(err) {
	       //alert('出错'+err);
	    });
	  };
	  
	  
	  $scope.checkUpdata = function() {
	      $cordovaAppVersion.getVersionNumber().then(function(version) {
	        $ionicLoading.show({
	          template: '检测版本中...'
	        });
	        Userinfo.add('version', version);//如果是IOS 请将android 修改为ios
	        $http.get(ApiEndpoint.url + '/api_checkversion_get?deviceType=android&v='+version).success(function(data) {
	          $ionicLoading.hide();
	          if (data.state == 'success') {
	            if (version != data.version) {
	              $scope.showUpdateConfirm(data.desc, data.apk);
	            } else {
	              $ionicPopup.alert({
				        title: '提示',
				        template: '目前是最新版本',
				        buttons: [{
				          text: '确定',
				          type: 'button-assertive'
				        }]
				    });
	            }
	          } else {
	            alert('服务器连接错误，请稍候再试');
	          }
	        })
	      });
	    }

	  $scope.showUpdateConfirm = function(desc, url) {
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
	  
	  $scope.exit = function() {//退出登录
	    $scope.flag = '';
	    Userinfo.l.id = '';
	    $scope.username="登录";
	    $scope.cellPhone = '';
	    $scope.avaImg="img/default-ava.png";
	    Userinfo.remove('flag');
	    window.localStorage.clear();//清除缓存
	    window.localStorage['first'] = '1';//不在显示欢迎页
	    $scope.modal.hide();
	  };
	  
	  
	// 登陆
	  $ionicModal.fromTemplateUrl('templates/user/login.html', {
	    scope: $scope
	  }).then(function(modal) {
	    $scope.modalLogin = modal;
	    $scope.loginData = {};
	  });

	  // 关闭登录页面
	  $scope.closeLogin = function() {
		$scope.modalLogin.hide();
	    $scope.loginData = {};
	  };

	  // 打开登陆页面
	  $scope.login = function() {
	    $scope.modalLogin.show();
	  };
	  
	  $scope.doLogin = function() {
	    if (!$scope.loginData.username) {
	      $scope.showMsg('用户名不能为空');
	      return false;
	    };
	    if (!$scope.loginData.password) {
	      $scope.showMsg('密码不能为空');
	      return false;
	    };
	    $ionicLoading.show({
	      template: "正在登录..."
	    });
	    $http.post(ApiEndpoint.url + '/api_user_login?json='+JSON.stringify({
	    	loginName: $scope.loginData.username,
	    	pwd: $scope.loginData.password
	    })).success(function(data) {
	      $ionicLoading.hide();
	      if (data.state!= 'success') {
	        $scope.showMsg(data.msg);
	      } else {
	        Userinfo.save(data.obj);
	        Userinfo.add('flag', 1);
	        $scope.sign = Userinfo.l.today_signed;
	        $scope.avaImg = Userinfo.l.headImg ? ApiEndpoint.pic_url+"/"+Userinfo.l.headImg : 'img/default-ava.png';
	        $scope.username = Userinfo.l.name ? Userinfo.l.name : '登录';
	        $scope.cellPhone = Userinfo.l.cellPhone ? Userinfo.l.cellPhone : '';
	        $scope.flag = 1;
	        $scope.closeLogin();
	      }
	    });
	    $scope.avaImg = Userinfo.l.headImg ? ApiEndpoint.pic_url+"/"+Userinfo.l.headImg : 'img/default-ava.png';
	    $scope.username = Userinfo.l.name ? Userinfo.l.name : '登录';
	  };
	  
	  
	  $ionicModal.fromTemplateUrl('templates/user/register.html', {
	    scope: $scope
	  }).then(function(modal) {
	    $scope.modal_register = modal;
	    $scope.registerData = {};
	  });

	  $scope.register = function() {
	    $scope.modal_register.show();
	  };
	  $scope.closeRegister = function() {
	    $scope.modal_register.hide();
	    $scope.registerData = {};
	  };
	  
	  $scope.doRegister = function() {
	    var reg = /^1\d{10}$/;
	    if (!$scope.registerData.phone) {
	      $scope.showMsg('手机号不能为空');
	      return false;
	    } else if (!reg.test($scope.registerData.phone)) {
	      $scope.showMsg('手机号格式错误');
	      return false;
	    };
	    if (!$scope.registerData.username) {
	    	$scope.showMsg('用户名不能为空');
	    	return false;
	    };
	    if (!$scope.registerData.password || !$scope.registerData.repassword) {
	      $scope.showMsg('密码不能为空');
	      return false;
	    } else if ($scope.registerData.password != $scope.registerData.repassword) {
	      $scope.showMsg('两次密码不一致');
	      return false;
	    }
	    $ionicLoading.show({
	      template: '注册中...'
	    });
	    var u ={
			userName:$scope.registerData.username,
			cellPhone:$scope.registerData.phone,
			pwd:$scope.registerData.password,
			code:$scope.registerData.invitation,
			alipay:$scope.registerData.alipayCode
	    }
	    $http.post(ApiEndpoint.url + '/api_user_register?json='+ JSON.stringify(u)).success(function(data) {
	      $ionicLoading.hide();
	      $scope.showMsg(data.msg);
	      if (data.state== 'success') {
	    	  Userinfo.save(data.obj);
	          Userinfo.add('flag', 1);
	          $scope.flag = 1;
	          $scope.sign = Userinfo.l.today_signed;
	          $scope.avaImg = Userinfo.l.headImg ? ApiEndpoint.pic_url+"/"+Userinfo.l.headImg : 'img/default-ava.png';
	          $scope.username = Userinfo.l.name ? Userinfo.l.name : '登录';
	          $scope.cellPhone = Userinfo.l.cellPhone ? Userinfo.l.cellPhone : '';
	          $scope.closeRegister();
	      }
		});
	  }
	  //关于meiO
	  $ionicModal.fromTemplateUrl('templates/help/aboutUs.html', {
	    scope: $scope
	  }).then(function(modal) {
	    $scope.modalAbortUs = modal;
	    $scope.abortUsData = {};
	  });

	  // 关闭关于页面
	  $scope.closeAbortUs = function() {
	    $scope.modalAbortUs.hide();
	    $scope.abortUsData = {};
	  };

	  // 打开关于页面
	  $scope.goAbortUs = function() {
	    $scope.modalAbortUs.show();
	  };
})
.controller('AccountCrtl',function($scope, $state, $http, $ionicLoading, $ionicPopover, ApiEndpoint, $ionicModal, $timeout, Userinfo ) {
	$scope.userinfo ={};

	if (!Userinfo.l.id) {
      $scope.alogin();
      return;
    }
	
	// 登陆
	  $ionicModal.fromTemplateUrl('templates/user/login.html', {
	    scope: $scope
	  }).then(function(modal) {
	    $scope.modalLogin = modal;
	    $scope.loginData = {};
	  });

	  // 关闭登录页面
	  $scope.closeLogin = function() {
		$scope.modalLogin.hide();
	    $scope.loginData = {};
	  };

	  // 打开登陆页面
	  $scope.alogin = function() {
	    $scope.modalLogin.show();
	  };
	  
	  $scope.doLogin = function() {
	    if (!$scope.loginData.username) {
	      $scope.showMsg('用户名不能为空');
	      return false;
	    };
	    if (!$scope.loginData.password) {
	      $scope.showMsg('密码不能为空');
	      return false;
	    };
	    $ionicLoading.show({
	      template: "正在登录..."
	    });
	    $http.post(ApiEndpoint.url + '/api_user_login?json='+JSON.stringify({
	    	loginName: $scope.loginData.username,
	    	pwd: $scope.loginData.password
	    })).success(function(data) {
	      $ionicLoading.hide();
	      if (data.state!= 'success') {
	        $scope.showMsg(data.msg);
	      } else {
	        Userinfo.save(data.obj);
	        Userinfo.add('flag', 1);
	        $scope.sign = Userinfo.l.today_signed;
	        $scope.avaImg = Userinfo.l.headImg ? ApiEndpoint.pic_url+"/"+Userinfo.l.headImg : 'img/default-ava.png';
	        $scope.username = Userinfo.l.name ? Userinfo.l.name : '登录';
	        $scope.cellPhone = Userinfo.l.cellPhone ? Userinfo.l.cellPhone : '';
	        $scope.flag = 1;
	        $scope.closeLogin();
	      }
	    });
	    $scope.avaImg = Userinfo.l.headImg ? ApiEndpoint.pic_url+"/"+Userinfo.l.headImg : 'img/default-ava.png';
	    $scope.username = Userinfo.l.name ? Userinfo.l.name : '登录';
	  };
	
	$http.post(ApiEndpoint.url + '/api_user_detail?id='+Userinfo.l.id).success(function(data) {
	    if (data.state == "success") {
	      Userinfo.save(data.obj);
	      $scope.userinfo = Userinfo.l;
	      $scope.userinfo.cellPhone = Userinfo.l.cellPhone != 'null' ? Userinfo.l.cellPhone : '';
	      $scope.userinfo.realname = Userinfo.l.name != 'null' ? Userinfo.l.name : '';
	      $scope.userinfo.alipay = Userinfo.l.alipay != 'null' ? Userinfo.l.alipay : '';
	    } else {
	      alert('登录超时，请重新登录');
	      $scope.login();
	      $scope.flag = '';
	      Userinfo.l.id = '';
	      Userinfo.remove('flag');
	      return;
	    }
	  });
	  $scope.isActive = 'a';
	  $scope.changeTab = function(evt) {
	    var elem = evt.currentTarget;
	    $scope.isActive = elem.getAttributeNode('data-active').value;
	  };
	  
	  $scope.changeBasic = function() {
		   if (!$scope.userinfo.password_person) {
		      $scope.showMsg('请输入账户密码');
		      return false;
		    };
		    if (!$scope.userinfo.name) {
		    	$scope.showMsg('请输入会员姓名');
		    	return false;
		    };
		    $ionicLoading.show({
		      template: '保存中...'
		    });
		    $http.post(ApiEndpoint.url + '/api_update_user?password='+ $scope.userinfo.password_person+'&name='+ $scope.userinfo.name+'&id='+ Userinfo.l.id).success(function(data) {
		    	$ionicLoading.hide();
		      $scope.showMsg(data.msg);
		      if (data.state == 'successs') {
		        $scope.userinfo.password_person = '';
		        $state.reload();
		      }
		    })
		  };
		  $scope.changePwd = function() {
		    if (!$scope.userinfo.password_change) {
		      $scope.showMsg('原始密码不能为空');
		      return false;
		    };
		    if (!$scope.userinfo.password) {
		    	$scope.showMsg('新密码不能为空');
		    	return false;
		    }else if ($scope.userinfo.password != $scope.userinfo.password_repeat) {
		      $scope.showMsg('两次密码不一致');
		      return false;
		    }
		    $ionicLoading.show({
		      template: '保存中...'
		    });
			  console.log(Userinfo.l.id);
		    $http.post(ApiEndpoint.url + '/api_password_update?id='+ Userinfo.l.id+'&oldpassword='+ $scope.userinfo.password_change+'&newpassword='+ $scope.userinfo.password).success(function(data) {
		    	$ionicLoading.hide();
		       $scope.showMsg(data.msg);
		      if (data.state == 'successs') {
		        $scope.userinfo.password_change = '';
		        $scope.userinfo.password = '';
		        $scope.userinfo.password_repeat = '';
		        $state.reload();
		      }
		    })
		  };
		  $scope.changeAcount = function() {
		   if (!$scope.userinfo.password_person) {
		      $scope.showMsg('请输入账户密码');
		      return false;
		    };
		    if (!$scope.userinfo.alipay) {
		    	$scope.showMsg('请输入支付宝账号');
		    	return false;
		    };
		    $ionicLoading.show({
		      template: '保存中...'
		    });

		   $http.post(ApiEndpoint.url + '/api_update_user?password='+ $scope.userinfo.password_person+'&alipay='+ $scope.userinfo.alipay+'&id='+ Userinfo.l.id).success(function(data) {
		      $ionicLoading.hide();
		      $scope.showMsg(data.msg);
		      if (data.state == 'successs') {
		        $scope.userinfo.password_person = '';
		        $state.reload();
		      }
		    })
		  };
	  

	  $scope.showMsg = function(txt) {
	    var template = '<ion-popover-view style = "background-color:#ec3473 !important" class = "light padding" > ' + txt + ' </ion-popover-view>';
	    $scope.popover = $ionicPopover.fromTemplate(template, {
	      scope: $scope
	    });
	    $scope.popover.show();
	    $timeout(function() {
	      $scope.popover.hide();
	    }, 1400);
	  };
	  
	  $scope.backGo = function() {
	    $scope.userinfo.password_change = '';
	    $scope.userinfo.password = '';
	    $scope.userinfo.password_repeat = '';
	    $scope.userinfo.password_acount = '';
	    $scope.userinfo.password_person = '';
	    $state.go('acount.user');
	  }
})
