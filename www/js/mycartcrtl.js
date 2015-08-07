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
			$scope.allCheckClass = "icon-select-satatus-01";
			for (var int = 0; int < $scope.cartList.length; int++) {
				$scope.cartList[int].checkClass = "icon-select-satatus-01";
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
				if ($scope.c.checkClass == "icon-select-satatus-01") 
					$scope.allMoney -= $scope.c.product.price*$scope.discount;
			}
		}else {
			if ($scope.c.productNum >= $scope.c.product.stockNum){
				$scope.c.productNum = $scope.c.product.stockNum;
				$scope.showMsg("该商品的库存量不足");
			}else {
				$scope.c.productNum += 1;
				if ($scope.c.checkClass == "icon-select-satatus-01") 
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
		if ($scope.c.checkClass == "icon-select-satatus-01") {
			$scope.c.checkClass = "icon-unselect-01";
			$scope.allMoney -= $scope.c.product.price*$scope.discount*$scope.c.productNum;
		}else {
			$scope.c.checkClass = "icon-select-satatus-01";
			$scope.allMoney += $scope.c.product.price*$scope.discount*$scope.c.productNum;
		}
	}
	
	//去结算－－－前往订单页面
	$scope.toOrder = function() {
		var pid = "0";
		var count = "0";
		for (var int = 0; int < $scope.cartList.length; int++) {
			if ($scope.cartList[int].checkClass == "icon-select-satatus-01"){
				pid += ","+$scope.cartList[int].productId;
				count += ","+$scope.cartList[int].productNum;
			}
		}
		if (pid == "0") {
			$scope.showMsg("请选择商品");
			return;
		}
		$http.post(ApiEndpoint.url + '/api_encode?msg='+pid+' '+count+' '+(Userinfo.l.id?Userinfo.l.id:"")).success(function(data) {
			if (data.state =="success") {
				$state.go('public.order',{msg:data.secret});
			}else{
				$scope.showMsg(data.msg);
			}
		});
	}
	
	$scope.policy_state=false;
	$scope.prompt_height="50px;";
	$scope.prompt_info="none;";
	$scope.policy = function(){
		if($scope.policy_state){
			$scope.prompt_height="50px;";
			$scope.prompt_info ="none;";
			$scope.policy_state=false;
		}else{
			$scope.prompt_height="230px;";
			$scope.prompt_info = "block;";
			$scope.policy_state=true;
		}
	}

	//包邮政策、商品政策
	/*jQuery(function(){
	     jQuery("#key").toggle(function(){
		   jQuery("#key .up").removeClass("up").addClass("down").parent().animate({height:jQuery("#key").height()+$(".info").outerHeight(true)+"px"},1000);
		   jQuery(".info").css("display","block");
		 },function(){
		   jQuery("#key .down").removeClass("down").addClass("up").parent().animate({height:"50px"},1000);
		   jQuery(".info").css("display","none");
		 })
	  });*/
	
	
//	//物流详情
//	$scope.wuliu = function(){
//		//aaa。快递公司编号-快递单号-订单编号
//		var aaa = 'tiantian-560331923708-1438679113340';
//		$state.go('public.logistics',{com:aaa});
//	}
})



//物流详情
.controller('Logistics',function($scope, $state, $ionicPopup, Userinfo, $ionicLoading,$ionicHistory, $http, ApiEndpoint, $stateParams){
	$scope.companyName = "快递名称";
	$scope.orderListImg = "";
	$scope.com = $stateParams.com.split("-")[0];
	$scope.postId = $stateParams.com.split("-")[1];  //快递单号
	$scope.ordNum = $stateParams.com.split("-")[2];  //订单编号
	$scope.orderItemMsg = "";
	$scope.orderItemList = []; //该订单中的商品集合
	$scope.logisticsList = []; //该订单的物流信息
	$scope.logisticsState = 0; //该订单的物流状态
	
	$ionicLoading.show({
	    template: "加载中..."
	});
	/*$scope.com  = 'tiantian';
	$scope.postId  = '550169065187';
	$scope.ordNum  = '1124839389468986';*/
	$scope.loadLogisticsData = function() {
		$http.post(ApiEndpoint.url + '/api_express_findbycode?code='+$scope.com).success(function(data) {
			if (data.state =="success") {
				$scope.companyName = data.data.name;
				$scope.orderListImg = data.data.img;
			}else{
				$scope.showMsg(data.msg);
			}
		});
		$http.post(ApiEndpoint.url + '/api_express_send?code='+$scope.com+'&nu='+$scope.postId+'&ordnum='+$scope.ordNum).success(function(data) {
			if (data.state =="success") {
				$scope.orderItemMsg = data.msg;
				$scope.orderItemList = data.oitem;
				$scope.logisticsState = data.json.status;
				$scope.logisticsList = data.json.data;
				for (var i = 0; i < $scope.orderItemList.length; i++) {
					$scope.orderItemList[i].imgUrl = ApiEndpoint.pic_url+'/'+$scope.orderItemList[i].imgurl;
				}
				if ($scope.logisticsList != null && $scope.logisticsList.length > 0) {
					$scope.logisticsList[0].numberOne = 1;
				}
			}else{
				$scope.showMsg(data.msg);
			}
			
			$ionicLoading.hide();
		});
	}
	
	$scope.loadLogisticsData();
	
	//关闭物流页面
	$scope.closeLogistics = function() {
		$ionicHistory.goBack();
	}
});