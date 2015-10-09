angular.module('starter.order', [])

.controller('Order',function($scope,$ionicPopover, $http, $state,$ionicHistory,$ionicLoading,$stateParams, $timeout,$ionicModal,$ionicPopup,ApiEndpoint, Userinfo){
	//提示消息
	$ionicLoading.show({
	     template: '<ion-spinner></ion-spinner>'
	});
	$scope.orderBackGo = function(){
		$state.go('public.myCart',{ran:Math.random()*1000});
		//$ionicHistory.goBack();
	}
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
	$scope.order_data = {};
	$scope.orderItemList = [];
	$scope.discount = 1;   //用户的折扣率
	$scope.price = 0;   //商品价格
	$scope.show_price = 0;   //商品价格
	$scope.transportation_expenses = 0;   //邮费
	$scope.show_transportation_expenses = 0;   //邮费
	$scope.have_address = -1;
	$scope.address = {};
	$scope.ruleInfo = "";//提示信息
	$scope.autoaddress_list = [];
	$scope.orderName="";
	$scope.canUseCoupon = false;
	$scope.useCouponMsg = "";
	$scope.CouponsNum = 0;//优惠券数量
	$scope.payType = 1;//支付类型
	$scope.useCouponsNum = 0;//使用优惠券数量
	//加载数据
	$scope.loadOrderCountData = function(){
		$http.post(ApiEndpoint.url + '/api_order_count?msg='+$stateParams.msg).success(function(data) {
			$scope.order_data = data;
			console.log(data);
			$ionicLoading.hide();
			if (data.state == 'success') {
				for (var i = 0; i < data.list.length; i++) {
					if(data.list[i].ptId==1){
						data.list[i].discount = data.discount;
					}
					if(data.list[i].ptId==2){
						data.list[i].discount = 1;
					}
					if(data.list[i].ptId==3){
						data.list[i].discount = 1;
						data.transportation_expenses = 0;
					}else{
						if(data.activityId==null||data.activityId==""||data.activityId==undefined){
							$scope.canUseCoupon = true;
						}
					}
					data.list[i].coverUrl = ApiEndpoint.pic_url+"/"+data.list[i].coverUrl;
					$scope.price += Number(data.list[i].price)*Number(data.list[i].discount)*Number(data.list[i].stockNum);
					$scope.orderName += ","+data.list[i].name;
				}
				$scope.orderItemList = data.list;
				$scope.discount = data.discount;   //用户的折扣率
				$scope.show_price = $scope.price;
				if($scope.price<200){
					$scope.transportation_expenses = data.transportation_expenses.toFixed(2);
					$scope.show_transportation_expenses = data.transportation_expenses.toFixed(2);
					$scope.show_price += data.transportation_expenses;
				}
				if(data.address==null||data.address.id==''){
					$scope.have_address=0;
				}else{
					$scope.address = data.address;
				}
				$scope.CouponsNum = data.CouponsNum;
				$scope.useCouponMsg = "用优惠券(余"+$scope.CouponsNum+"张)"
				$scope.number.inputNumber = $scope.price.toFixed(0);
			}
		});
		//加载提示
		$http.post(ApiEndpoint.url + '/api_rule_get').success(function(data) {
			if (data.state == 'success') {
				$scope.ruleInfo = data.val;
			}
		});
		//加载自动提货地址
		$http.post(ApiEndpoint.url + '/api_autoaddress_list').success(function(data) {
			if (data.state == 'success') {
				$scope.autoaddress_list = data.list;
			}
		});
	}
	$scope.loadOrderCountData();
	
	$scope.send_type_state = 0;//配送方式
	$scope.autoaddress = {};//自提地址
	//选择配送方式
	$scope.myPopup = {};
	$scope.send_type = function(){
		if($scope.send_type_state==1){
			$scope.send_type_state = 0;
			$scope.show_transportation_expenses = $scope.transportation_expenses;
			if($scope.price<200){
				$scope.show_price = $scope.show_price + Number($scope.transportation_expenses);
			}
		}
		if($scope.have_address>=0){
			if($scope.have_address==0){
				$scope.have_address = 1;
			}else{
				$scope.have_address = 0;
			}
		}
	}
	$scope.send_type1 = function(){
		if($scope.send_type_state==0){
			var showItems=[];  
			for (var i = 0; i < $scope.autoaddress_list.length; i++) {
				var item = { text: $scope.autoaddress_list[i].shopName, value: $scope.autoaddress_list[i].id};
		        showItems.push(item);
			}
			var config = {
				title: "自提点选择", 
				items: showItems,
				selectedValue: "",
				doneButtonLabel: "完成",
				cancelButtonLabel: "取消"
			};
			// Show the picker
			window.plugins.listpicker.showPicker(config,function(item){ 
				$timeout(function() {
					$scope.select_autoaddress(item);
			    }, 100);
			},
			function() { 
		  		  //alert("You have cancelled");
			});
		}
	}
	//不使用优惠券 默认支付模式
	$scope.zx_pay  = function(){
		$scope.payType = 1;
		$scope.useCouponsNum = 0;
		$scope.number.inputNumber = $scope.price.toFixed(0);
		$scope.useCouponMsg = "用优惠券(余"+$scope.CouponsNum+"张)"
	}
	//新增优惠券 设置弹框函数
	$scope.number = {}
	$scope.showPopup  = function(){
		 $scope.number.state = "none";
		 var myPopup = $ionicPopup.show({
			template : '<input type="text" ng-model="number.inputNumber" ng-focus="changeInputVal()">'+
			'<label style="height: 25px; line-height: 25px; color: rgb(255, 0, 0); font-weight: 700; display:{{number.state}}" ng-bind-html="number.errmsg"></label>',
			title : '请输入优惠卷数量',
			scope : $scope,
			buttons : [ {
				text : '取消'
			}, {
				text : '<b>确认</b>',
				type : 'button-positive',
				onTap : function(e) {
					if($scope.number.inputNumber>$scope.CouponsNum){
						e.preventDefault();
						$scope.number.state = "block";
						$scope.number.errmsg ="优惠券数量输入过多";
						return;
					}
					if($scope.number.inputNumber<$scope.price){
						e.preventDefault();
						$scope.number.state = "block";
						$scope.number.errmsg ="所需优惠券数量不足";
						return;
					}
					$scope.payType = 3;
					$scope.useCouponsNum = $scope.number.inputNumber;
					$scope.useCouponMsg = "用优惠券(余"+$scope.CouponsNum+"张,使用"+$scope.useCouponsNum+"张)"
					if (!$scope.number.inputNumber) {
						// 不允许用户关闭，除非他键入数量
						e.preventDefault();
					} else {
						$scope.payType = 3;
					}
				}
			}, ]
		});
	}
	
	$scope.changeInputVal = function(){
		$scope.number.state = 'none';
	}
	
	$scope.autoaddress_id = 0;
	//选择自动提货地址
	$scope.select_autoaddress = function(id){
		for (var i = 0; i < $scope.autoaddress_list.length; i++) {
			if($scope.autoaddress_list[i].id==id){
				$scope.autoaddress = $scope.autoaddress_list[i];
				//$scope.myPopup.close();
				$scope.send_type_state = 1;
				$scope.show_transportation_expenses = 0.00;
				$scope.autoaddress_id = id;
				if($scope.price<200){
					$scope.show_price = $scope.show_price - Number($scope.transportation_expenses);
				}
			}
		}
		if($scope.have_address>=0){
			if($scope.have_address==0){
				$scope.have_address = 1;
			}else{
				$scope.have_address = 0;
			}
		}
	}	
	//跳转到修改地址
	$scope.go_address = function(){
		Userinfo.add('order_address', true);
		$state.go('addresss.addresslist',{msg:$stateParams.msg});
	}
	$scope.save_state = false;
	//提交订单
	$scope.submit_order = function(){
		if($scope.send_type_state==0&&($scope.order_data.address==null||$scope.order_data.address.id=='')){
			$scope.showMsg("收货地址为空");
			return;
		}
		if($scope.save_state==true){
			return;
		}
		$scope.save_state = true;
		//提交订单
		var url = ApiEndpoint.url + "/api_order_insert?userId="+Userinfo.l.id+"&activityId="+$scope.order_data.activityId+"&atype="+($scope.send_type_state==0?1:0)+"&aid="+($scope.send_type_state==0?$scope.order_data.address.id:$scope.autoaddress_id)+"&productIds="+$scope.order_data.ids+"&counts="+$scope.order_data.count+"&activityType="+$scope.order_data.activityType+"&payMethod="+$scope.payType+"&couponsNum="+$scope.useCouponsNum;
		$http.post(url).success(function(data) {
			if (data.state == 'success') {
				if(data.orderState==1){
					//需要支付
					var order = data.obj;
					var name= $scope.orderName.substring(1, $scope.orderName.length);
					navigator.alipay.pay(
						{
							seller : "ougemaoyi@163.com",
							subject : name,
							body : name,
							//price : order.orderMoney,
							price : "0.01",
							tradeNo : order.ordNum,
							timeout : "30m",
							notifyUrl : ApiEndpoint.url +"/api_alipay_asynchronous_notify"
						},
						function(msgCode){
							var temp="";
							if(msgCode=="9000"){
								temp="支付成功"
							}else{
								temp="支付失败"
							}
							$scope.myPopup = $ionicPopup.show({
								template: temp,
								title: '提示',
								scope: $scope,
								buttons: [{ text: '确定',type: 'button-assertive',onTap:function(e){
									$state.go('app.index');
								}}]
						   });
						},
						function(msg){
							console.log(msg);
						}
					)
				}
				if($scope.order_data.activityId!=null&&$scope.order_data.activityId!=''){
					var split=$scope.order_data.count.split(",");
					var num = 0;
					for (var i = 0; i < split.length; i++) {
						num+=Number(split[i]);
					}
					$http.post(ApiEndpoint.url + "/api_activity_upd?activityId="+$scope.order_data.activityId+"&userId="+Userinfo.l.id+"&buyNum="+num+"&orderId="+data.orderId+"&type="+$scope.order_data.activityType).success(function(data) {
						//通知活动领取成功
					});
				}
				if(data.orderState==2){
					//免费类型直接提示
					$scope.myPopup = $ionicPopup.show({
						template: "提交成功",
						title: '提示',
						scope: $scope,
						buttons: [{ text: '确定',type: 'button-assertive',onTap:function(e){
							$state.go('app.index');
						}}]
				   });
				}
			}
		});
	}
})