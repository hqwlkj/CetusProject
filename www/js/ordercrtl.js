angular.module('starter.ordercrtl', [])


.controller('OrderCtrl',function($scope, $ionicPopover, $timeout, $ionicModal, $ionicLoading,$location, $http, Userinfo, ApiEndpoint, $state ,$ionicHistory){
	$scope.orderWf = [];
	$scope.orderYf = [];
	$scope.orderYwc = [];
	
	if (!Userinfo.l.id) {
      $scope.login();
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
		$ionicHistory.goBack();
	    $scope.loginData = {};
	  };

	  // 打开登陆页面
	  $scope.login = function() {
	    $scope.modalLogin.show();
	  };
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
						$scope.flag1 = false;//取消订单
						$scope.flag2 = false;//去支付
						$scope.flag3 = false;//确认收货
						$scope.flag4 = false;//申请退货
						$scope.flag5 = false;//评价
						$scope.flag6 = false;//再次购买
						if(data.order.state == 4){
							$scope.flag4 = true;
							$scope.flag5 = true;
							$scope.flag6 = true;
						}else if(data.order.state == 2 || data.order.state == 3 ){
 							$scope.flag3 = true;
						}else if(data.order.state == 1){
							$scope.flag1 = true;
							$scope.flag1 = true;
						}
						//计算出price countFee
						var price =0,countFee=0;
						for (var i = 0; i < data.item.length; i++) {
							price +=(parseFloat(data.item[i].prince)*parseInt(data.item[i].num));
							countFee +=( parseFloat(data.item[i].productPrice)*parseInt(data.item[i].num));
						}
						//$scope.orderData=data;
						$scope.ordNum = data.order.ordNum;
						$scope.orderAdd=data.add;
						$scope.orderItems=data.item;
						$scope.orderOrder=data.order;
						
						$scope.orderOrder.items = data.item;
						
						$scope.recipients=data.add.recipients;
						$scope.telephone=data.add.telephone;
						
						
						if(data.order.atype == 0){ //上门自提
							$scope.locations=data.add.address;//地址
						}else{
							$scope.locations=data.add.province+data.add.city+data.add.county+data.add.locations;//地址
						}
						if(data.order.payMethod==1||data.order.payMethod=="1"){
							$scope.payMethod="在线支付";
						}else if(data.order.payMethod == "2" || data.order.payMethod == 2){
							$scope.payMethod="货到付款";
						}
						//判断该订单是否已经评价
						if(data.allComment == 1){
							$scope.flag5 = false;
						}
						$scope.com=data.order.com;
						//$scope.myorderId=data.order.id;
						$scope.deliveryTime=data.order.deliveryTime;//送货时间
						//$scope.orderMoney=data.order.orderMoney;//订单单价
						$scope.orderMoney=(countFee.toFixed(2));//订单总额
						$scope.freight=data.order.freight.toFixed(2);//运费
						$scope.discountPrice=(parseFloat(countFee - price).toFixed(2));//优惠价格
						$scope.countPrice=(parseFloat(data.order.orderMoney).toFixed(2));//实付金额
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
			var ordNum=orderOrder.id;
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
		/**
		 * 申请退款
		 */
		/*$scope.drawback=function(orderOrder){
			if(confirm("确定要将此订单申请退款吗？")){
				$http.post(ApiEndpoint.url + '/api_order_drawback?id='+(ordNum)).success(function(data) {
					if (data.state == 'success') {
						alert(data.msg);
						setTimeout("closeOrderDetail()",2000);//刷新
					}else{
						alert(data.msg);
					}
				});
			}
		}*/
		/**
		 * 申请退货
		 */
		$scope.returnGoods=function(orderOrder){
			var ordNum=orderOrder.id;
			if(confirm("确定要将此订单申请退货吗？")){
				$http.post(ApiEndpoint.url + '/api_order_return?id='+(ordNum)).success(function(data) {
					if (data.state == 'success') {
						alert(data.msg);
						setTimeout("closeOrderDetail()",2000);//刷新
					}else{
						alert(data.msg);
					}
				});
			}
		}
		/**
		 * 确认收获订单
		 */
		$scope.changeStateToCompleted=function(orderOrder){
			var ordNum=orderOrder.id;
			var state = 4;//更改订单为完成状态
			if(confirm("请收到货后，再确认收货！否则您可能钱货两空哦！")){
				$http.post(ApiEndpoint.url + '/api_order_changeState?id='+(ordNum)+'&state=4').success(function(data) {
					if (data.state == 'success') {
						alert(data.msg);
						setTimeout("closeOrderDetail()",2000);//刷新
					}else{
						alert(data.msg);
					}
				});
			}
		}
		/**
		 * 评价
		 */
		$scope.evaluate = function(orderOrder){
			
//			if (len == 1){
//				window.location.href="comment.html?userId="+userId+"&orderitemId="+itemId+"&orderNum="+orderNum+"&pnum=1";
//			}else {
//				window.location.href="order-list.html?userId="+userId+"&orderNum="+orderNum;
//			}
			$scope.modal_order_info.hide();
			if (orderOrder.items != null && orderOrder.items.length == 1) {
				$state.go('public.comment', {itemId: orderOrder.items[0].id+"-"+1});
			}else {
				$state.go('public.commentList', {ordNum: orderOrder.ordNum});
			}
		};
		/**
		 * 跳转到产品详情
		 */
		/*function skipToProductDetail(productId){
			location.href="product-detail.html?userId="+userId+"&productId="+productId;
		}
	  */
	  $scope.changeAcount = function() {
		  alert(2);
	  };
	  $scope.backGo = function() {
	    $state.go('tab.user');
	  }
})