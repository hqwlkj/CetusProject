angular.module('starter.mycartcrtl', [])

.controller('MyCart',function($scope, $state, $ionicPopup, Userinfo, $ionicLoading, $http, ApiEndpoint,$location){
	$scope.cartList = [];  //购物车数据几盒
	$scope.discount = 1;   //用户的折扣率
	$scope.allCheckClass = "icon-unselect-01";  //全选按钮的样式
	$scope.c = {};  //当前操作的数据
	$scope.allMoney = 0;  //订单合计
	
	$ionicLoading.show({
	    template: "<ion-spinner></ion-spinner>"
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
					$scope.allMoney = 0;
					$scope.allCheckClass = "icon-unselect-01";
				}
			});
		}
	};
	
	$scope.loadCartData();
	$scope.info = "";
	$http.post(ApiEndpoint.url + '/api_policy_get').success(function(data) {
		if (data.state == 'success') {
			$scope.info = data.val;
		}
	});
	/**
	 * 返回前一页（或关闭本页面）
	 * <li>如果没有前一页历史，则直接关闭当前页面</li>
	 */
	$scope.backToIndex = function() {
		$state.go('app.index');
	    /*if ((navigator.userAgent.indexOf('MSIE') >= 0) && (navigator.userAgent.indexOf('Opera') < 0)){ // IE
	        if(history.length > 0){
	            window.history.go( -1 );
	        }else{
	            window.opener=null;window.close();
	        }
	    }else{ //非IE浏览器
	        if (navigator.userAgent.indexOf('Firefox') >= 0 ||
	            navigator.userAgent.indexOf('Opera') >= 0 ||
	            navigator.userAgent.indexOf('Safari') >= 0 ||
	            navigator.userAgent.indexOf('Chrome') >= 0 ||
	            navigator.userAgent.indexOf('WebKit') >= 0){

	            if(window.history.length > 1){
	                window.history.go( -1 );
	            }else{
	                window.opener=null;window.close();
	            }
	        }else{ //未知的浏览器
	            window.history.go( -1 );
	        }
	    }*/
	}
	/**
	 * 到订单列表页面
	 * <li>如果没有前一页历史，则直接关闭当前页面</li>
	 */
	$scope.goMyOrder = function() {
		$state.go('app.order',{ran:Math.random()*1000});
	}
	
	//全选
	$scope.allchecked = function() {
		$scope.allMoney = 0;
		if ($scope.allCheckClass == "icon-unselect-01") {
			$scope.allCheckClass = "icon-select-satatus-01";
			for (var i = 0; i < $scope.cartList.length; i++) {
				$scope.cartList[i].checkClass = "icon-select-satatus-01";
				if($scope.cartList[i].product.ptId == 1){
					$scope.allMoney += $scope.cartList[i].product.price*$scope.discount*$scope.cartList[i].productNum;
				}else{
					$scope.allMoney += $scope.cartList[i].product.price*$scope.cartList[i].productNum;
				}
			}
		}else {
			$scope.allCheckClass = "icon-unselect-01";
			for (var i = 0; i < $scope.cartList.length; i++) {
				$scope.cartList[i].checkClass = "icon-unselect-01";
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
				    	    template: "<ion-spinner></ion-spinner>"
				    	});
				    	var cart = {};
						cart.userId = (Userinfo.l.id?Userinfo.l.id:"");
						cart.cartId = $scope.c.id;
				    	$http.post(ApiEndpoint.url + '/api_cart_del?json='+ JSON.stringify(cart)).success(function(data) {
							$ionicLoading.hide();
							$scope.showMsg(data.msg);
							if (data.state == 'success') {
								$ionicLoading.show({
								    template: "<ion-spinner></ion-spinner>"
								});
								$scope.loadCartData();
							}
						});
				    } 
			     });
			}else {
				$scope.c.productNum -= 1;
				if ($scope.c.checkClass == "icon-select-satatus-01") {
					if($scope.c.product.ptId == 1){				
						$scope.allMoney -= $scope.c.product.price*$scope.discount;
					}else{
						$scope.allMoney -= $scope.c.product.price;
					}
				}
			}
		}else {
			if ($scope.c.productNum >= $scope.c.product.stockNum){
				$scope.c.productNum = $scope.c.product.stockNum;
				$scope.showMsg("该商品的库存量不足");
			}else {
				$scope.c.productNum += 1;
				if ($scope.c.checkClass == "icon-select-satatus-01"){
					if($scope.c.product.ptId == 1){				
						$scope.allMoney += $scope.c.product.price*$scope.discount;
					}else{
						$scope.allMoney += $scope.c.product.price;
					}
				} 
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
			$scope.allCheckClass = "icon-unselect-01";
			if($scope.c.product.ptId == 1){				
				$scope.allMoney -= $scope.c.product.price*$scope.discount*$scope.c.productNum;
			}else{
				$scope.allMoney -= $scope.c.product.price*$scope.c.productNum;
			}
		}else {
			$scope.c.checkClass = "icon-select-satatus-01";
			if($scope.c.product.ptId == 1){				
				$scope.allMoney += $scope.c.product.price*$scope.discount*$scope.c.productNum;
			}else{
				$scope.allMoney += $scope.c.product.price*$scope.c.productNum;
			}
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
	$scope.policy = function(target){
		//console.log(target);
		if($scope.policy_state){
			$scope.prompt_height="50px;";
			$scope.prompt_info ="none;";
			$scope.policy_state=false;
		}else{
			$scope.prompt_height=target.Y+ 100 +"px;";
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
	    template: "<ion-spinner></ion-spinner>"
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
		$http.post(ApiEndpoint.url + '/api_express_send?com='+$scope.com+'&nu='+$scope.postId+'&ordnum='+$scope.ordNum).success(function(data) {
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

	//下拉刷新
	$scope.doRefresh = function(){
		$http.post(ApiEndpoint.url + '/api_express_findbycode?code='+$scope.com).success(function(data) {
			if (data.state =="success") {
				$scope.companyName = data.data.name;
				$scope.orderListImg = data.data.img;
			}else{
				$scope.showMsg(data.msg);
			}
		});
		$http.post(ApiEndpoint.url + '/api_express_send?com='+$scope.com+'&nu='+$scope.postId+'&ordnum='+$scope.ordNum).success(function(data) {
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
				$scope.$broadcast("scroll.refreshComplete");
			}else{
				$scope.showMsg(data.msg);
			}
		});
	};
	
	
	//关闭物流页面
	$scope.closeLogistics = function() {
		$ionicHistory.goBack();
	}
})


//评价列表
.controller('CommentList',function($scope, $state, $ionicPopup, Userinfo, $ionicLoading,$ionicHistory, $http, ApiEndpoint, $stateParams){
	$scope.commentListData = []; //该订单中的商品集合
	
	$ionicLoading.show({
	    template: "<ion-spinner></ion-spinner>"
	});
	
	//加载订单下的商品列表
	$scope.loadCommentList = function() {
		$http.post(ApiEndpoint.url + '/api_ordernum_list?orderNum='+$stateParams.ordNum).success(function(data) {
			if (data.state == 'success') {
				$scope.commentListData = data.items;
				for (var i = 0; i < $scope.commentListData.length; i++) {
					$scope.commentListData[i].imgUrl = ApiEndpoint.pic_url+'/'+$scope.commentListData[i].imgurl;
				}
			}
			$ionicLoading.hide();
		});
	}
	
	$scope.loadCommentList();
	
	//去评价
	$scope.toComment = function(itemId) {
		$state.go('public.comment', {itemId: itemId+"-"+$scope.commentListData.length});
	}
	
	//关闭商品评价列表页面
	$scope.closeCommentList = function() {
//		$ionicHistory.goBack();
		$state.go('app.order');
	}
})


//评价商品详情
.controller('Comment',function($scope, $state, $ionicPopup, Userinfo, $ionicLoading,$ionicHistory, $http, ApiEndpoint, $stateParams){

	$scope.itemId = $stateParams.itemId.split("-")[0];
	$scope.itemNum = $stateParams.itemId.split("-")[1];
	
	$scope.productImg = "";
	$scope.productNum = "";
	$scope.productPrice = "";
	$scope.productName = "";
	$scope.productPara = "";
	$scope.productId = 0;
	$scope.ordNum = "";
	$scope.commentData = {};
	$scope.commentData.score = 5;
	
	$scope.commentStars = [{starSrc: "img/star-on.png", starAlt: 1, starTitle: "bad"},
	                       {starSrc: "img/star-on.png", starAlt: 2, starTitle: "poor"},
	                       {starSrc: "img/star-on.png", starAlt: 3, starTitle: "regular"},
	                       {starSrc: "img/star-on.png", starAlt: 4, starTitle: "good"},
	                       {starSrc: "img/star-on.png", starAlt: 5, starTitle: "gorgeous"}];
	$scope.onStar = "img/star-on.png";
	$scope.offStar = "img/star-off.png";
	
	$scope.lsheng = 500;  //评论内容的剩余长度
	$scope.maxLengthContent = 500;  //评论内容的最大长度
	
	$ionicLoading.show({
	    template: "<ion-spinner></ion-spinner>"
	});
	
	//关闭商品评价详情页面
	$scope.closeCommentDetail = function() {
		$ionicHistory.goBack();
	}
	
	//加载订单下的商品详情
	$scope.commentDetail = function() {

		$http.post(ApiEndpoint.url + '/api_ordernum_detail?orderitemId='+$scope.itemId).success(function(data) {
			if (data.state == 'success') {
				$scope.productImg = ApiEndpoint.pic_url+'/'+data.item.imgurl;
				$scope.productNum = "x"+data.item.num;
				$scope.productPrice = "￥"+data.item.prince;
				$scope.productName = data.item.name;
				$scope.productId = data.item.pid;
				$scope.productPara = data.item.parameter;
				$scope.ordNum = data.item.ordNum;
			}
			$ionicLoading.hide();
		});

	}
	
	//提交评论
	$scope.saveComment = function() {
		if ($scope.commentData.score == undefined || $scope.commentData.score == 0) {
			$scope.showMsg("请为商品打分");
			return;
		}
		if ($scope.commentData.content == "" || $scope.commentData.content.trim() == "") {
			$scope.showMsg("请为商品写下评价");
			return;
		}
		var comment = {};
		comment.score = $scope.commentData.score;
		comment.content = $scope.commentData.content;
		comment.pid = $scope.productId;
		comment.userId = Userinfo.l.id;
		comment.ordNum = $scope.ordNum;
		$http.post(ApiEndpoint.url + '/api_app_comment_save?commentStr='+JSON.stringify(comment)).success(function(data) {
			if (data.state == 'success') {
				$scope.showMsg("评论成功");
				
				$timeout(function() {
					if ($scope.itemNum == 1 || $scope.itemNum == "1"){
						$state.go('app.order');
					}else 
						$state.go('public.commentList', {ordNum: $scope.ordNum});
			    }, 2000);
				
			}
			$ionicLoading.hide();
		});
	}
	
	$scope.commentDetail();
	
	//打分的星星的显示
	$scope.updStar = function(obj) {
		$scope.commentData.score = obj.starAlt;
		for (var i = 0; i < obj.starAlt; i++) {
			$scope.commentStars[i].starSrc = $scope.onStar;
		}
		for (var i = 4; i > obj.starAlt-1; i--) {
			$scope.commentStars[i].starSrc = $scope.offStar;
		}
	}
	
	//监视评价的内容长度
	$scope.contentNum = function() {
		var max = parseInt($scope.maxLengthContent, 10); //获取maxlength的值 转化为10进制，将输入到textarea的文本长度
        //这个判断可知max得到的是不是数字，设定的大小是多少
        if (max > 0) {
            if ($scope.commentData.content.length > max) { //textarea的文本长度大于maxlength
            	$scope.commentData.content = $scope.commentData.content.substr(0, max); //截断textarea的文本重新赋值
            }

            var sheng = max - $scope.commentData.content.length;
            $scope.lsheng = sheng;
        }
	}
})