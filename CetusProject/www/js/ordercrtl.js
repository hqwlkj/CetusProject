angular.module('starter.ordercrtl', [])


.controller('OrderCtrl',function($scope, $ionicPopover, $timeout, $ionicModal, $ionicLoading,$location, $http, Userinfo, ApiEndpoint, $state ,$ionicHistory){
	$scope.orderWf = [];
	$scope.orderYf = [];
	$scope.orderYwc = [];
	
	$scope.isActive = 'a';
	$scope.changeTab = function(evt) {
	    var elem = evt.currentTarget;
	    $scope.isActive = elem.getAttributeNode('data-active').value;
	    $scope.orderGoTo($scope.isActive);
    };
    $scope.orderGoTo = function(isActive){
    	switch (isActive) {
		case 'a':
			$scope.getOrderWf();
			break;
		case 'b':
			$scope.getOrderYf();
			break;
		case 'c':
			$scope.getOrderYwc();
			break;
		default:
			$scope.getOrderWf();
			break;
		}
    }
    
      //未付款
	  $scope.getOrderWf = function() {
		  $ionicLoading.show({
			    template: "加载中..."
		 });
		 $http.post(ApiEndpoint.url + '/api_order_list?userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&pageNo=1'+'&pageSize=10'+'&flag=1').success(function(data) {
			if (data.state == 'success') {
				$scope.orderWf = data.lst;
				//console.log($scope.orderWf.Item);
				$ionicLoading.hide();
		    }
		});
	  };
	  //已付款
	  $scope.getOrderYf = function() {
		  $ionicLoading.show({
			    template: "加载中..."
		 });
		 $http.post(ApiEndpoint.url + '/api_order_list?userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&pageNo=1'+'&pageSize=10'+'&flag=2').success(function(data) {
			if (data.state == 'success') {
				$scope.orderYf = data.lst;
				//console.log($scope.orderWf.Item);
				$ionicLoading.hide();
		    }
		});
	  };
	  
	  //已完成
	  $scope.getOrderYwc = function() {
		  $ionicLoading.show({
			  template: "加载中..."
		  });
		  $http.post(ApiEndpoint.url + '/api_order_list?userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&pageNo=1'+'&pageSize=10'+'&flag=3').success(function(data) {
			  if (data.state == 'success') {
				  if(data.lst.length<1){
					  alert("暂无数据");
				  }
				  $scope.orderYwc = data.lst;
				  //console.log($scope.orderWf.Item);
				  $ionicLoading.hide();
			  }
		  });
	  };
	  
	  /*
	   * 支付订单
	   */
	  $scope.payOrder=function(orderId){
		 //console.log(orderId);
	  }
	  
	  /*
	   * 取消订单
	   */
	  $scope.removeOrder=function(orderId){
		  $ionicLoading.show({
			  template: "加载中..."
		  });
		  $http.post(ApiEndpoint.url + '/api_order_reallyDelete?id='+("orderId")).success(function(data) {
			  if (data.state == 'success') {
					  alert(data.msg);
				 
				  $ionicLoading.hide();
			  }
		  });
	  }
	  
	  /*
	   * 确认收货
	   */
	  $scope.successOrder=function(orderId){
		  $ionicLoading.show({
			  template: "加载中..."
		  });
		  $http.post(ApiEndpoint.url + '/api_order_changeState?id='+(orderId)+'&state=4').success(function(data) {
			  if (data.state == 'success') {
					  alert("确认收货成功");
				  $scope.getOrderYf();//重新加载出未做操作的数据  
				  $ionicLoading.hide();
			  }
		  });
	  }
	  /*
	   * 已完成订单中 ，删除订单
	   */
	  $scope.deleteOrder=function(orderId){
		  $ionicLoading.show({
			  template: "加载中..."
		  });
		  $http.post(ApiEndpoint.url + '/api_order_pretendDelete?id='+(orderId)).success(function(data) {
			  if (data.state == 'success') {
					  alert("删除成功");
				  $scope.getOrderYwc();
				  $ionicLoading.hide();
			  }
		  });
	  }
	  /*
	   * 查看物流详情
	   */
	  $scope.chaWuliu = function(order){
			//aaa。快递公司编号-快递单号-订单编号
		    var oNumber=order.com+"-"+order.postid+"-"+order.ordNum;
			//var aaa = 'tiantian-560331923708-1438679113340';
			$state.go('public.logistics',{com:oNumber});
		}
	  
	  $scope.changeAcount = function() {
		  alert(2);
	  };
	  $scope.backGo = function() {
	    $state.go('tab.user');
	  }
})