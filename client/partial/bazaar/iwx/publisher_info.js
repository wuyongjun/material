angular.module('iwx')
	.controller('PublisherInfoCtrl', function ($scope, $http, $modal, $modalInstance, publisherId, flag) {
		$scope.flag = flag;
		$scope.publisher = {
			publish_title: ''
		};
		//获取社团信息
		var getCommInfo = function (comm_id) {
			$http.get('/api/communities/' + comm_id)
				.success(function (data) {
					$scope.community = data;
					$scope.publisher.publish_title = $scope.community.name + '信息预览';
				});
		};
		//获取个人信息
		var getPersonalInfo = function (user_id) {
			$http.get('/api/users/' + user_id)
				.success(function (data) {
					$scope.user = data;
					$scope.publisher.publish_title = $scope.user.name + '个人信息预览';
				});
		};
		//获取发布者信息
		var getPublisherInfo = function (publisher_id, flag) {
			if (flag === 'org') {
				//调用获取社团信息接口
				getCommInfo(publisher_id);
			} else {
				//调用获取个人信息接口
				getPersonalInfo(publisher_id);
			}
		};
		getPublisherInfo(publisherId, flag);
		//关闭信息框
		$scope.close = function () {
			$modalInstance.close('ok');
		};
	});