var json=new Array();
angular.module('starter.ordercrtl', [])

.controller('OrderCtrl',function($scope, $ionicPopover, $timeout, $ionicModal,$ionicPopup,$ionicLoading,$location, $http, Userinfo, ApiEndpoint, $state ,$ionicHistory){
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
			 $scope.ordermsg = false;//未读消息提示默认隐藏
			 if (data.state == 'success') {
				if(data.lst.length<1){
					  $scope.ordermsg = true;
					  $ionicLoading.hide();
				  }
				$scope.orderWf = data.lst;
				//console.log($scope.orderWf.Item);
				$ionicLoading.hide();
		    }else{
		    	$ionicLoading.hide();
				$scope.showMsg(data.msg);
			}
		});
	  };
	  
	  $scope.getOrderWf();
	  //已付款
	  $scope.getOrderYf = function() {
		  $ionicLoading.show({
			    template: "加载中..."
		 });
		 $http.post(ApiEndpoint.url + '/api_order_list?userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&pageNo=1'+'&pageSize=10'+'&flag=2').success(function(data) {
			 $scope.ordermsg2 = false;//已付款默认隐藏
			if (data.state == 'success') {
				if(data.lst.length<1){
					$scope.ordermsg2 = true;
				  }
				$scope.orderYf = data.lst;
				//console.log($scope.orderWf.Item);
				$ionicLoading.hide();
		    }else{
		    	$ionicLoading.hide();
				$scope.showMsg(data.msg);
			}
		});
	  };
	  
	  //已完成
	  $scope.getOrderYwc = function() {
		  $ionicLoading.show({
			  template: "加载中..."
		  });
		  $http.post(ApiEndpoint.url + '/api_order_list?userId='+(Userinfo.l.id?Userinfo.l.id:"")+'&pageNo=1'+'&pageSize=10'+'&flag=3').success(function(data) {
			  $scope.ordermsg3 = false;//已完成默认隐藏
			  if (data.state == 'success') {
				  if(data.lst.length<1){
					//  alert("暂无数据");
					  $scope.ordermsg3 = true;
				  }
				  $scope.orderYwc = data.lst;
				  //console.log($scope.orderWf.Item);
				  $ionicLoading.hide();
			  }else{
			    	$ionicLoading.hide();
					$scope.showMsg(data.msg);
				}
		  });
	  };
	  
	  /*
	   * 支付订单
	   */
	  $scope.payOrder=function(order,items){
		 //console.log(orderId);
		  var name="";
		  for (var i = 0; i < items.length; i++) {
			  name += ","+items[i].name;
		    }
		  name = name.substring(1, name.length);
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
				if(msgCode=="9000"){
					$scope.showMsg("付款成功");
					 $scope.getOrderWf();//回到未付款订单列表界面
				}
			},
			function(msg){
				if(msgCode!="9000"){
					$scope.showMsg("付款失败,请检查网络");
					 $scope.getOrderWf();//回到未付款订单列表界面
				}
			}

		)
	  }
	  
	  /*
	   * 取消订单
	   */
	  $scope.removeOrder=function(orderId){
		  $scope.myPopup = $ionicPopup.show({
				title: '提示',
				scope: $scope,
				buttons: [
				{ text: '取消', },   
				{ text: '确定',type: 'button-positive',onTap:function(e){
					$ionicLoading.show({
						  template: "加载中..."
					  });
					  $http.post(ApiEndpoint.url + '/api_order_reallyDelete?id='+(orderId)).success(function(data) {
						  if (data.state == 'success') {
								  //alert(data.msg);
							        $scope.showMsg(data.msg);
							  $scope.getOrderWf();
							  $ionicLoading.hide();
						  }else{
						    	$ionicLoading.hide();
								$scope.showMsg(data.msg);
							}
					  });
				}}]
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
					  //alert("确认收货成功");
					  $scope.showMsg("确认收货成功");
				  $scope.getOrderYf();//重新加载出未做操作的数据  
				  $ionicLoading.hide();
			  }else{
			    	$ionicLoading.hide();
					$scope.showMsg(data.msg);
				}
		  });
	  }
	  /*
	   * 已完成订单中 ，删除订单
	   */
	  $scope.deleteOrder=function(orderOrder){
		  var orderId=orderOrder.id;
		  $ionicLoading.show({
			  template: "加载中..."
		  });
		  $http.post(ApiEndpoint.url + '/api_order_pretendDelete?id='+(orderId)).success(function(data) {
			  if (data.state == 'success') {
					 // alert("删除成功");
				  $scope.showMsg("删除成功");
				  $scope.getOrderYwc();
				  $ionicLoading.hide();
			  }else{
			    	$ionicLoading.hide();
					$scope.showMsg(data.msg);
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
					//console.log(data);
					if (data.state == 'success') {
						//根据订单状态处理按钮的显示
						$scope.flag1 = false;//取消订单
						$scope.flag2 = false;//去支付
						$scope.flag3 = false;//确认收货
						$scope.flag4 = false;//申请退货
						$scope.flag5 = false;//评价
						$scope.flag6 = false;//再次购买
						$scope.flag9 = false;//显示完成的图片
						if(data.order.state == 4){
							$scope.flag4 = true;
							$scope.flag5 = true;
							$scope.flag6 = true;
							$scope.flag9 = true;
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
							var args = '{"userId":'+(Userinfo.l.id?Userinfo.l.id:"")+', "productId":'+data.item[i].pid+', "productNum":'+data.item[i].num+'}';
							json.push(args);
						}
						//$scope.orderData=data;
						$scope.ordNum = data.order.ordNum;
						$scope.orderAdd=data.add;
						$scope.orderItems=data.item;
						$scope.orderOrder=data.order;
						
						$scope.orderOrder.items = data.item;
						
						$scope.recipients=data.add.recipients;
						$scope.telephone=data.add.telephone;
						$scope.falgaddress1 = true;//有地址
						$scope.falgaddress2 = false;//上门自提
						if(data.order.atype == 0){ //上门自提
							$scope.falgaddress1 = false;
							$scope.falgaddress2 =true;
							$scope.shopcom="上门自提";
							$scope.shopName=data.add.shopName;//店名
							$scope.address=data.add.address;//地址
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
						$scope.testcom=data.order.com;//处理 快递代码问题
						$http.post(ApiEndpoint.url + '/api_express_findbycode?code='+$scope.testcom).success(function(data) {
							if (data.state =="success") {
								$scope.com = data.name;
							}else{
								$scope.showMsg(data.msg);
							}
						});
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
							  $scope.showMsg("订单已取消");
							  $timeout(function() {
								  closeOrderDetail()
							    }, 2000);
					  }else{
							$scope.showMsg(data.msg);
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
						$scope.showMsg(data.msg);
						$timeout(function() {
							closeOrderDetail()
					    }, 2000);

						
					}else{
						$scope.showMsg(data.msg);
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
						$scope.showMsg(data.msg);
						$timeout(function() {
							closeOrderDetail()
					    }, 2000);
					}else{
						$scope.showMsg(data.msg);
					}
				});
			}
		}
		/**
		 * 评价
		 */
		$scope.evaluate = function(orderOrder){
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
		  $scope.skipToProductDetail = function(id) {
			  $scope.modal_order_info.hide();
			  $state.go('product.detail',{productId: id});
			 
		  };
		/**
		 * 再次购买
		 */
		 $scope.purchaseAgain = function(orderOrder) {
			 console.log(orderOrder);
			  var pid = "0";
			  var count = "0";
				for (var int = 0; int < $scope.orderOrder.items.length; int++) {
						pid += ","+$scope.orderOrder.items[int].pid;
						 console.log(pid);
						count += ","+$scope.orderOrder.items[int].num;
						 console.log(count);
					
				}
				if (pid == "0") {
					$scope.showMsg("请选择商品");
					return;
				}
				$http.post(ApiEndpoint.url + '/api_encode?msg='+pid+' '+count+' '+(Userinfo.l.id?Userinfo.l.id:"")).success(function(data) {
					if (data.state =="success") {
						$scope.modal_order_info.hide();
						$state.go('public.order',{msg:data.secret});
					}else{
						$scope.showMsg(data.msg);
					}
				});
			  
		  };
		  
	  $scope.changeAcount = function() {
		//  alert(2);
	  };
	  $scope.backGo = function() {
	    $state.go('tab.user');
	  }
})