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
	  $scope.removeOrder=function(order){
		  var orderId=order.id;
		  $ionicLoading.show({
			  template: "加载中..."
		  });
		  $http.post(ApiEndpoint.url + '/api_order_reallyDelete?id='+(orderId)).success(function(data) {
			  if (data.state == 'success') {
					  alert(data.msg);
				  $scope.getOrderWf();
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
	  $scope.deleteOrder=function(orderOrder){
		  var orderId=orderOrder.id;
		  alert(orderId);
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
	  /*
	   * 封装一个订单详情的mode
	   */
	  $ionicModal.fromTemplateUrl('templates/order-detail.html', {scope: $scope}).then(function(modal) {
			$scope.modal_order_info = modal;
		});
	  //关闭当前的视图 
	  $scope.closeOrderDetail = function() {
		    $scope.modal_order_info.hide();
		}
	  
	//加载订单详情信息数据 并且打开一个界面
		$scope.goOrderDetail = function(ordNum) {
			$scope.orderdata = [];
			$scope.orderAdd = [];
			$scope.orderItems = [];
			$scope.orderOrder = [];
			if(!Userinfo.l.id){//处理是否登陆
				$scope.modalLogin.show();
			}else{
				$scope.modal_order_info.show();
				$ionicLoading.show({
				     template: '加载中...'
				});
				$http.post(ApiEndpoint.url + '/api_order_get?ordNum='+ordNum+'&pageNo=1'+'&pageSize=10').success(function(data) {
					console.log(data);
					if (data.state == 'success') {
						//根据订单状态处理按钮的显示
						$scope.flag1 = false;
						$scope.flag2 = false;
						$scope.flag3 = false;
						$scope.flag4 = false;
						$scope.flag5 = false;
						$scope.flag6 = false;
						$scope.flag7 = false;
						if(data.order.state == 4){
							$scope.flag4 = true;
							$scope.flag5 = true;
							$scope.flag6 = true;
							$scope.flag7 = true;
							//$(".mo-isdo").css("display","block");
							//$(".complete").css("display","block");
						}else if(data.order.state == 2 || data.order.state == 3 ){
							//$(".paid").css("display","block");
							$scope.flag3 = true;
						}else if(data.order.state == 1){
							$scope.flag1 = true;
							$scope.flag1 = true;
						}
						//$scope.orderData=data;
						$scope.ordNum = data.order.ordNum;
						$scope.orderAdd=data.add;
						$scope.orderItems=data.item;
						$scope.orderOrder=data.order;
						
						$scope.recipients=data.add.recipients;
						$scope.telephone=data.add.telephone;
						$scope.locations=data.add.province+data.add.city+data.add.county+data.add.locations;//地址
						if(data.order.payMethod==1||data.order.payMethod=="1"){
							$scope.payMethod="在线支付";
						}else if(data.order.payMethod == "2" || data.order.payMethod == 2){
							$scope.payMethod="货到付款";
						}
						$scope.com=data.order.com;
						//$scope.myorderId=data.order.id;
						$scope.deliveryTime=data.order.deliveryTime;//送货时间
						$scope.orderMoney=data.order.orderMoney;//订单单价
						$scope.freight=data.order.freight;//运费
						$scope.discountPrice=data.order.discountPrice;//优惠价格
						$scope.countPrice=data.order.orderMoney;//订单总价
						$scope.showRiseTime=data.order.showRiseTime;//下单时间
					}
					$ionicLoading.hide();
				});
			}
		}
		
		/**
		 * 订单详情中  取消订单
		 */
		$scope.reallyDelete=function(orderOrder){
			alert(orderOrder.id);
			if(confirm("确定要取消该订单吗？")){
				$http.post(ApiEndpoint.url + '/api_order_reallyDelete?id='+(ordNum)).success(function(data) {
					  if (data.state == 'success') {
							  alert("订单已取消");
							  setTimeout("closeOrderDetail()",2000);//刷新
					  }else{
							alert(data.msg);
						}
				});
			}
		}
	  
	  $scope.changeAcount = function() {
		  alert(2);
	  };
	  $scope.backGo = function() {
	    $state.go('tab.user');
	  }
})