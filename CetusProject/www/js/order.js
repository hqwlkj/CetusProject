angular.module('starter.order', [])

.controller('Order',function($scope,$ionicPopover, $http, $state,$ionicHistory,$ionicLoading,$stateParams, $timeout,$ionicModal,$ionicPopup,ApiEndpoint, Userinfo){
	//提示消息
	console.log($stateParams.msg);
	console.log(ApiEndpoint.pic_url);
	$ionicLoading.show({
	     template: '加载中...'
	});
	$scope.orderBackGo = function(){
		$state.go('public.myCart');
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
	$scope.orderItemList = [];
	$scope.discount = 1;   //用户的折扣率
	$scope.price = 0;   //商品价格
	$scope.transportation_expenses = 0;   //邮费
	$scope.have_address = true;
	$scope.address = {};
	$scope.ruleInfo = "";//提示信息
	$scope.autoaddress_list = [];
	//加载数据
	$scope.loadOrderCountData = function(){
		$http.post(ApiEndpoint.url + '/api_order_count?msg='+$stateParams.msg).success(function(data) {
			console.log(data);
			if (data.state == 'success') {
				for (var i = 0; i < data.list.length; i++) {
					data.list[i].coverUrl = ApiEndpoint.pic_url+"/"+data.list[i].coverUrl;
					console.log(data.list[i].coverUrl);
					$scope.price += Number(data.list[i].price)*Number(data.discount)*Number(data.list[i].stockNum);
				}
				$scope.orderItemList = data.list;
				$scope.discount = data.discount;   //用户的折扣率
				
				if($scope.price<200){
					$scope.transportation_expenses = data.transportation_expenses.toFixed(2);
					$scope.price+=data.transportation_expenses;
				}
				if(data.address.id==null||data.address.id==''){
					$scope.have_address==false;
				}else{
					$scope.have_address==true;
					$scope.address = data.address;
				}
				console.log($scope.have_address);
			}
			$ionicLoading.hide();
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
		}
	}
	$scope.send_type1 = function(){
		if($scope.send_type_state==0){
			var temp = "<ul>";
			for (var i = 0; i < $scope.autoaddress_list.length; i++) {
				temp+="<li ng-click=\"select_autoaddress('"+$scope.autoaddress_list[i].id+"')\">"+$scope.autoaddress_list[i].shopName+"</li>";
			}
			temp +="</ul>";
			// 一个精心制作的自定义弹窗
			$scope.myPopup = $ionicPopup.show({
				template: temp,
				title: '自提地址',
				scope: $scope,
				buttons: [{ text: '取消' }]
		   });
		}
	}
	//选择自动提货地址
	$scope.select_autoaddress = function(id){
		for (var i = 0; i < $scope.autoaddress_list.length; i++) {
			if($scope.autoaddress_list[i].id==id){
				$scope.autoaddress = $scope.autoaddress_list[i];
				$scope.myPopup.close();
				$scope.send_type_state = 1;
			}
		}
	}	
	//跳转到修改地址
	$scope.go_address = function(){
		Userinfo.add('order_address', true);
		$state.go('addresss.addresslist',{msg:$stateParams.msg});
	}
	
})