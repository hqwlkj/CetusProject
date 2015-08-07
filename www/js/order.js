angular.module('starter.order', [])

.controller('Order',function($scope,$ionicPopover, $http, $state,$ionicHistory,$ionicLoading,$stateParams, $timeout,$ionicModal,$ionicPopup,ApiEndpoint, Userinfo){
	//提示消息
	console.log($stateParams.msg);
	$ionicLoading.show({
	     template: '加载中...'
	});
	$scope.orderBackGo = function(){
	     $ionicHistory.goBack();
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
	
	//加载数据
	$scope.loadOrderCountData = function(){
		$http.post(ApiEndpoint.url + '/api_order_count?msg='+$stateParams.msg).success(function(data) {
			console.log(data);
			if (data.state == 'success') {
			}
			$ionicLoading.hide();
		});
	}
	$scope.loadOrderCountData();
})