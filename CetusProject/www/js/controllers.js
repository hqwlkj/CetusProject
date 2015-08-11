/*starry*/
angular.module('starter.controllers', [])

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

.controller('UserCtrl', function($scope, $state, $ionicModal, $timeout, $ionicPopup, $ionicPopover, $http, ApiEndpoint, Userinfo, $ionicLoading, $cordovaActionSheet, $cordovaImagePicker, $cordovaFileTransfer, $cordovaCamera, $cordovaAppVersion, $stateParams) {
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
          $ionicLoading.show({
            template: "正在上传..." + Math.round((progress.loaded / progress.total) * 100) + '%'
          });
          if (Math.round((progress.loaded / progress.total) * 100) >= 99) {
            $ionicLoading.hide();
          };
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


  $ionicModal.fromTemplateUrl('templates/user/user.html ', {
	  scope: $scope
  }).then(function(modal) {
	  $scope.userModal = modal;
	  $scope.userData = {};
  });
  $scope.user = function() {
	  $scope.userModal.show();
  };
  $scope.closeUser = function() {
	  $scope.userModal.hide();
	  $scope.userData = {};
  };
  
  $ionicModal.fromTemplateUrl('templates/help/about.html ', {
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
  };
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
    	  Window.open(url);
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
  
  
  $scope.userGoTo = function(listid) {
    switch (listid) {
      case 1:
    	  $ionicPopup.alert({
  	        title: '提示',
  	        template: '开发中',
  	        buttons: [{
  	          text: '确定',
  	          type: 'button-assertive'
  	        }]
  	    });
        break;
      case 2:
    	$scope.checkUpdata();
        break;
      case 3:
    	window.localStorage.clear();//清除缓存
    	$ionicPopup.alert({
	        title: '提示',
	        template: '缓存已清除',
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
	//分享
	$scope.toShare = function() {
		$scope.showMsg('开发中。。。');
//		    Wechat.isInstalled(function(installed) {
//		      if (!installed) {
//		        alert("手机尚未安装微信应用");
//		      } else {
//		        $ionicLoading.show({
//		          template: '正在打开微信,请稍等...'
//		        });
//		        $timeout(function() {
//		          $ionicLoading.hide();
//		        }, 3000);
//		      }
//		    });
//		$scope.shareViaWechat(WeChat.Scene.timeline, "分享到微信朋友圈", 'aaa', 'http://baidu.com', 'cccc');

	}
//	$scope.shareViaWechat = function(scene, title, desc, url, thumb) {
//		alert(222);
//        // 创建消息体
//        var msg = {
//            title: title ? title : "行者无疆",
//            description: desc ? desc : "A real traveller's province is boundless.",
//            url: url ? url : "http://www.xingzhewujiang.xinligen.osnuts.com",
//            thumb: thumb ? thumb : null
//        };
//        WeChat.share(msg, scene, function() {
//            $ionicPopup.alert({
//                title: '分享成功',
//                template: '感谢您的支持！',
//                okText: '关闭'
//            });
//        }, function(res) {
//            $ionicPopup.alert({
//                title: '分享失败',
//                template: '错误原因：' + res + '。',
//                okText: '我知道了'
//            });
//        });
//    };
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

  /*//login
  $ionicModal.fromTemplateUrl('templates/user/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalLogin = modal;
    $scope.loginData = {};
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modalLogin.hide();
    $state.go('tab.user');
    $scope.loginData = {};
  };

  // Open the login modal
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
    $http.post(ApiEndpoint.url + '/', {
      user: $scope.loginData.username,
      password: $scope.loginData.password
    }).success(function(data) {
      $ionicLoading.hide();
      if (data.error != 0) {
        $scope.showMsg(data.info);
      } else {
        Userinfo.save(data.user_info);
        Userinfo.add('flag', 1);
        $scope.sign = Userinfo.l.today_signed;
        $scope.avaImg = Userinfo.l.headImg ? ApiEndpoint.pic_url+"/"+Userinfo.l.headImg : 'img/default-ava.png';
        $scope.flag = 1;
        $scope.closeLogin();
      }
    });

  };

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
    if (!$scope.registerData.username) {
      $scope.showMsg('用户名不能为空');
      return false;
    };
    if (!$scope.registerData.phone) {
      $scope.showMsg('手机号不能为空');
      return false;
    } else if (!reg.test($scope.registerData.phone)) {
      $scope.showMsg('手机号格式错误');
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
    $http.post(ApiEndpoint.url + '/', {
      user: $scope.registerData.username,
      mobile: $scope.registerData.phone,
      password: $scope.registerData.password
    }).success(function(data) {
      $ionicLoading.hide();
      $scope.showMsg(data.info);
      if (data.error == 0) {
        $http.post(ApiEndpoint.url + '/User/Login?_ajax_=1', {
          user: $scope.registerData.username,
          password: $scope.registerData.password
        }).success(function(data) {
          if (data.error != 0) {
            $scope.showMsg(data.info);
          } else {
            Userinfo.save(data.user_info);
            Userinfo.add('flag', 1);
            $scope.flag = 1;
            $scope.sign = Userinfo.l.today_signed;
            $scope.avaImg = Userinfo.l.headImg ? ApiEndpoint.pic_url+"/"+Userinfo.l.headImg : 'img/default-ava.png';
            $scope.closeRegister();
            $scope.closeLogin();
          }
        });
      }
    });
  }*/
  
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
		$scope.showMsg("开发中");
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
			  if (data.state == 'success') {
				  if(data.lst.length<1){
					  alert("暂无消息")
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
  /*$scope.backGoInfo = function() {
     $ionicHistory.goBack();
  }*/
  $scope.flag = false;//隐藏大的消息中心 显示出详情的顶部
  for (var i = 0; i < HelpData.arr.length; i++) {
    if (HelpData.arr[i].title === $stateParams.title) {
      $scope.param.title = $stateParams.title;
      $scope.param.time = HelpData.arr[i].showCreateTime;
      $scope.param.content = HelpData.arr[i].content;
    }
  }
})

