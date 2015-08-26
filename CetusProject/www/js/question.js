angular.module('starter.question', [])

.controller('Question',function($scope,$ionicPopover, $http, $state,$ionicHistory,$ionicLoading,$stateParams, $timeout,$ionicModal,$ionicPopup,ApiEndpoint, Userinfo){
	//提示消息
	$ionicLoading.show({
	     template: '<ion-spinner></ion-spinner>'
	});
	$scope.questionBackGo = function(){
		$state.go('app.index');
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
	
	$scope.QuestionDataList = [];
	$scope.questionData = {};
	
	//加载数据
	$scope.loadQuestionData = function(){
		$ionicLoading.show({
		     template: '<ion-spinner></ion-spinner>'
		});
		$http.post(ApiEndpoint.url + '/api_question_list?userId='+Userinfo.l.id).success(function(data) {
			if (data.state == 'success') {
				for (var i = 0; i < data.list.length; i++) {
					if(data.list[i].content.length>15){
						data.list[i].content = data.list[i].content.substr(0, 15)+"...";
					}
					if(data.list[i].answer==null||data.list[i].answer==''){
						data.list[i].answer = 0;
					}else{
						data.list[i].answer = 1;
					}
				}
				$scope.QuestionDataList = data.list;
			}else{
				$scope.showMsg(data.msg);
			}
			$ionicLoading.hide();
		});
	}
	$scope.loadQuestionData();
	
	//新增问题
	$ionicModal.fromTemplateUrl('templates/public/question_add.html', {scope: $scope}).then(function(modal) {
		$scope.modal_question_add = modal;
	});
	//打开问题新增
	$scope.show_question_add = function(){
		$scope.modal_question_add.show();
		$scope.questionData = {};
	}
	//关闭问题新增
	$scope.close_question_add = function(){
		$scope.modal_question_add.hide();
	}
	//保存问题
	$scope.saveQuestion = function(){
		if($scope.questionData.content==null||$scope.questionData.content==''){
			$scope.showMsg("问题内容为空");
			return;
		}
		if($scope.questionData.content.length<15){
			$scope.showMsg("内容过短，请输入详细以便我们解答");
			return;
		}
		$http.post(ApiEndpoint.url + '/api_question_save?userId='+Userinfo.l.id+"&content="+$scope.questionData.content).success(function(data) {
			$scope.showMsg(data.msg);
			if (data.state == 'success') {
				$scope.close_question_add();
				$scope.loadQuestionData();
			}
		});
	}
	
	//查看问题
	$ionicModal.fromTemplateUrl('templates/public/question_show.html', {scope: $scope}).then(function(modal) {
		$scope.modal_question_show = modal;
	});
	//打开问题查看
	$scope.show_question_show = function(id){
		$scope.modal_question_show.show();
		$ionicLoading.show({
		     template: '<ion-spinner></ion-spinner>'
		});
		$http.post(ApiEndpoint.url + '/api_question_get?id='+id).success(function(data) {
			if (data.state == 'success') {
				$scope.questionData = data.obj
			}
			$ionicLoading.hide();
		});
	}
	//关闭问题查看
	$scope.close_question_show = function(){
		$scope.modal_question_show.hide();
	}
})