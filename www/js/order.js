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
	$scope.have_address = true;
	$scope.address = {};
	$scope.ruleInfo = "";//提示信息
	$scope.autoaddress_list = [];
	$scope.orderName="";
	//加载数据
	$scope.loadOrderCountData = function(){
		$http.post(ApiEndpoint.url + '/api_order_count?msg='+$stateParams.msg).success(function(data) {
			$scope.order_data = data;
			$ionicLoading.hide();
			if (data.state == 'success') {
				for (var i = 0; i < data.list.length; i++) {
					data.list[i].coverUrl = ApiEndpoint.pic_url+"/"+data.list[i].coverUrl;
					$scope.price += Number(data.list[i].price)*Number(data.discount)*Number(data.list[i].stockNum);
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
					$scope.have_address=false;
				}else{
					$scope.have_address=true;
					$scope.address = data.address;
				}
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
	}
	$scope.send_type1 = function(){
		if($scope.send_type_state==0){
			var temp = "<ul style=\"max-height:80%; overflow:hidden; overflow-y: scroll;\">";
			for (var i = 0; i < $scope.autoaddress_list.length; i++) {
				temp+="<li style=\"height:35px;line-height:35px; cursor:pointer; white-space:nowrap; overflow:hidden;\" ng-click=\"select_autoaddress('"+$scope.autoaddress_list[i].id+"')\">"+$scope.autoaddress_list[i].shopName+"</li>";
			}
			temp +="</ul>";
			// 一个精心制作的自定义弹窗
			$scope.myPopup = $ionicPopup.show({
				template: temp,
				title: '选择自提点',
				scope: $scope,
				buttons: [{ text: '取消' }]
		   });
		}
	}
	$scope.autoaddress_id = 0;
	//选择自动提货地址
	$scope.select_autoaddress = function(id){
		for (var i = 0; i < $scope.autoaddress_list.length; i++) {
			if($scope.autoaddress_list[i].id==id){
				$scope.autoaddress = $scope.autoaddress_list[i];
				$scope.myPopup.close();
				$scope.send_type_state = 1;
				$scope.show_transportation_expenses = 0.00;
				$scope.autoaddress_id = id;
				if($scope.price<200){
					$scope.show_price = $scope.show_price - Number($scope.transportation_expenses);
				}
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
		if($scope.save_state==true){
			return;
		}
		$scope.save_state = true;
		if($scope.send_type_state==0&&($scope.order_data.address==null||$scope.order_data.address.id=='')){
			$scope.showMsg("收货地址为空");
			return;
		}
		//提交订单
		var url = ApiEndpoint.url + "/api_order_insert?userId="+Userinfo.l.id+"&activityId="+$scope.order_data.activityId+"&atype="+($scope.send_type_state==0?1:0)+"&aid="+($scope.send_type_state==0?$scope.order_data.address.id:$scope.autoaddress_id)+"&productIds="+$scope.order_data.ids+"&counts="+$scope.order_data.count+"&activityType="+$scope.order_data.activityType;
		$http.post(url).success(function(data) {
			if (data.state == 'success') {
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
				if(data.orderState==1){
					//需要支付
					var order = data.obj;
					var name= $scope.orderName.substring(1, $scope.orderName.length);
					navigator.alipay.pay(
						{
							seller : "ougemaoyi@163.com",
							subject : name,
							body : name,
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
			}
		});
	}
})