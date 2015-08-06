angular.module('starter.mycartcrtl', [])

.controller('MyCart',function($scope, $state, $ionicPopup, Userinfo, $ionicLoading, $http, ApiEndpoint){
	$scope.cartList = [];  //购物车数据几盒
	$scope.discount = 1;   //用户的折扣率
	$scope.allCheckClass = "icon-unselect-01";  //全选按钮的样式
	$scope.c = {};  //当前操作的数据
	$scope.allMoney = 0;  //订单合计
	
	$ionicLoading.show({
	    template: "加载中..."
	});
	$scope.loadCartData = function() {
		
		if(!Userinfo.l.id){
			$ionicLoading.hide();
//			$scope.modalLogin.show();
			$scope.showMsg("请先登录");
		}else{
			var cart = {};
			cart.userId = (Userinfo.l.id?Userinfo.l.id:"");
			$http.post(ApiEndpoint.url + '/api_cart_list?json='+ JSON.stringify(cart)).success(function(data) {
				$ionicLoading.hide();
				if (data.state == 'success') {
					$scope.cartList = data.list;
					$scope.discount = data.discount;
				}
			});
		}
	};
	
	$scope.loadCartData();
	
	//返回
	$scope.backToIndex = function() {
	    $state.go('app.index');
	}
	
	//全选
	$scope.allchecked = function() {
		$scope.allMoney = 0;
		if ($scope.allCheckClass == "icon-unselect-01") {
			$scope.allCheckClass = "icon-select-01";
			for (var int = 0; int < $scope.cartList.length; int++) {
				$scope.cartList[int].checkClass = "icon-select-01";
				$scope.allMoney += $scope.cartList[int].product.price*$scope.discount*$scope.cartList[int].productNum;
			}
		}else {
			$scope.allCheckClass = "icon-unselect-01";
			for (var int = 0; int < $scope.cartList.length; int++) {
				$scope.cartList[int].checkClass = "icon-unselect-01";
			}
		}
	}
	
	//修改数量。sta为1表示减少1，为2表示增加1
	$scope.updProductNum = function(obj, sta) {
		$scope.c = obj;
		var num = $scope.c.productNum;
		if (sta == 1) {
			if ($scope.c.productNum == 1) {
				$ionicPopup.confirm({
			        title: '提示',
			        template: '你确定要移除该商品?',
			        okText: '确定',
			        cancelText: '取消'
			     }).then(function(res) {
				    if(res) {
				    	$ionicLoading.show({
				    	    template: "加载中..."
				    	});
				    	var cart = {};
						cart.userId = (Userinfo.l.id?Userinfo.l.id:"");
						cart.cartId = $scope.c.id;
				    	$http.post(ApiEndpoint.url + '/api_cart_del?json='+ JSON.stringify(cart)).success(function(data) {
							$ionicLoading.hide();
							$scope.showMsg(data.msg);
							if (data.state == 'success') {
								$scope.loadCartData();
							}
						});
				    } 
			     });
			}else {
				$scope.c.productNum -= 1;
				if ($scope.c.checkClass == "icon-select-01") 
					$scope.allMoney -= $scope.c.product.price*$scope.discount;
			}
		}else {
			if ($scope.c.productNum >= $scope.c.product.stockNum){
				$scope.c.productNum = $scope.c.product.stockNum;
				$scope.showMsg("该商品的库存量不足");
			}else {
				$scope.c.productNum += 1;
				if ($scope.c.checkClass == "icon-select-01") 
					$scope.allMoney += $scope.c.product.price*$scope.discount;
			}
		}
		
		//修改购物车中该商品的数量
		if (num != $scope.c.productNum) {
			var cart = {};
			cart.cartId = $scope.c.id;
			cart.productNum = $scope.c.productNum;
			$http.post(ApiEndpoint.url + '/api_cart_upd?json='+ JSON.stringify(cart)).success(function(data) {
				console.log(data.state);
			});
		}
		
		
	}
	
	//选中购物车中的某商品
	$scope.choseCheck = function(obj) {
		$scope.c = obj;
		if ($scope.c.checkClass == "icon-select-01") {
			$scope.c.checkClass = "icon-unselect-01";
			$scope.allMoney -= $scope.c.product.price*$scope.discount*$scope.c.productNum;
		}else {
			$scope.c.checkClass = "icon-select-01";
			$scope.allMoney += $scope.c.product.price*$scope.discount*$scope.c.productNum;
		}
	}
	
	//去结算－－－前往订单页面
	$scope.toOrder = function() {
		$scope.showMsg("开发中。。。");
	}
})