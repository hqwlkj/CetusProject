/*starry*/
angular.module('starter.controllers', [])

.constant('ApiEndpoint', {
  url: 'http://www.parsec.com.cn/Cetus',
  pic_url:'http://www.parsec.com.cn/Cetus/pic'
})

.constant('HelpData', {
  arr: []
})

.controller('IndexCtrl', function($scope, $http, ApiEndpoint,Userinfo) {
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
//  window.localStorage.clear();
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



  $scope.clickDetail = function(id) {//产品详情
	  $state.go('product.detail',{productId: id});
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
    var server = ApiEndpoint.url + '/' + Userinfo.l.ue;//图片上传
    var trustHosts = true
    var option = {};

    $cordovaImagePicker.getPictures(options)
      .then(function(results) {
        $cordovaFileTransfer.upload(server, results[0], option, true)
          .then(function(result) {
            alert('上传成功');
            $scope.avaImg = results[0];
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
    var server = ApiEndpoint.url + '/' + Userinfo.l.ue;//图片上传
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
          $scope.doRefresh();
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
      // alert('出错');
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
        $scope.flag = 1;
        $scope.closeLogin();
        $scope.loadGoods();
      }
    });

  };

  $scope.goToHelp = function() {
    $state.go('help.helpleft');
  }

  $scope.checkUpdata = function() {
    $cordovaAppVersion.getAppVersion().then(function(version) {
      $ionicLoading.show({
        template: '检测版本中...'
      });
      Userinfo.add('version', version);
      $http.get('v=' + version).success(function(data) {
        $ionicLoading.hide();
        if (data.error == 0) {
          if (version != data.version) {
            $scope.showUpdateConfirm(data.desc, data.apk);
          } else {
            alert('目前是最新版本');
          }
        } else {
          alert('服务器连接错误，请稍微再试');
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
        window.open(url, '_system', 'location=yes');
      };
    });
  }

  $scope.aboutGoTo = function(listid) {
    switch (listid) {
      case 1:
        $state.go('help.helpleft');
        $scope.modal.hide();
        break;
      case 2:
        $state.go('public.tutorial');
        $scope.modal.hide();
        break;
      case 3:
        $state.go('public.feedback');
        $scope.modal.hide();
        break;
      case 4:
        $scope.checkUpdata();
        break;
      case 5:
        alert('缓存已清除');
        break;
      default:
        break;
    };
  }

  $scope.goToEx = function() {
    $state.go('public.active-back');
  }

  $scope.goTo = function(listid) {//页面跳转路由器
    if (Userinfo.l.flag != 1) {
      $scope.login();
    } else {
      switch (listid) {
        case 1:
          $state.go('public.orderlist');
          break;
        case 2:
          $state.go('public.incomedetail');
          break;
        case 3:
          window.open();
          break;
        case 6:
          $state.go('public.acount');
          break;
        case 9:
          $scope.unreadMsg = window.localStorage['unread_msg_count'] = '0';
          $state.go('public.message');
          break;
        case 8:
          $state.go('public.feedback');
          break;
        case 7:
          $state.go('public.invitation');
          break;
        case 5:
          $state.go('public.active-back');
          break;
        case 11:
          $scope.signAlert();
          break;
        case 12:
          $state.go('public.jifen-exchange-cash');
          break;
        case 13:
          $state.go('public.store-rebate');
          break;
        case 14:
          $state.go('missorder.form');
          break;
        default:
          break;
      }
    }
  };

  $scope.kf = function(url, title) {
    if (window.localStorage['iswebchat'] == 1) {
      window.open(url, '_blank', 'location=yes', title);
    } else {
      window.open(url, '_system', 'location=yes', title);
    }
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
          $scope.closeRegister();
          $scope.closeLogin();
          $scope.loadGoods();
      }
	});
  }
  $scope.username = Userinfo.l.name ? Userinfo.l.name : '登录';
  
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
	//加载会员信息数据 并且打开
	$scope.userInfo = function() {
		if(!Userinfo.l.id){
			$scope.modalLogin.show();
		}else{
			$scope.modal_user_info.show();
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
				}
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
		});
	}
	
	
	//我的团队
	$ionicModal.fromTemplateUrl('templates/user/myteam.html', {scope: $scope}).then(function(modal) {
		$scope.modal_myteam = modal;
	});
	//显示我的团队页面
	$scope.show_myteam = function(){
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
			}
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
	//跳转到订单页面（免费领取活动的立即领取、满送活动的立即购买或领取赠品）
	$scope.goOrder = function() {
		$scope.showMsg('开发中。。。');
	}
	//签到
	$scope.addSign = function(acId) {
//		$ionicLoading.show({
//		    template: "加载中..."
//		});
//		var share = {};
//		share.userId = (Userinfo.l.id?Userinfo.l.id:"");
//		share.activityId = acId;
//		share.type = 1;
//		share.shareSns = "";
		$http.post(ApiEndpoint.url + '/api_app_signandshare_save?type=1&userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&activityId='+acId+'&shareSns=').success(function(data) {
//			$ionicLoading.hide();
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
		    });
			$scope.activityList();
		});
	}
	//分享
	$scope.toShare = function() {
		$scope.showMsg('开发中。。。');
	}
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
			        title: data.title,
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

  //login
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
  }
  
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
.controller('ProductCtrl',function($scope, $http, $ionicModal, $state,$timeout,$stateParams,$ionicLoading,Userinfo,ApiEndpoint,$ionicPopover){
	$scope.picfiles = [];
	$scope.comments = [];
	$scope.product = {};
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
	$scope.productShare = function() {
		$scope.showMsg("开发中");
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
})