angular.module('iwx')
	.controller('UserInfoCtrl', function ($scope, $rootScope, $http, user_info, $modalInstance, eventType) {
		$scope.user_info = {};
		$scope.user_info.id = user_info.id;
		$scope.user_info.username = user_info.nickname;
		$scope.user_info.mail = user_info.email;
		//验证参数
		$scope.validate = function () {
			if ($scope.user_info.username === undefined || !$rootScope.regexp_username.test($scope.user_info.username)) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '',
					'message': '请正确输入用户名称。'
				});
				return false;
			}
			if ($scope.user_info.mail === undefined || !$rootScope.regexp_email.test($scope.user_info.mail)) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '',
					'message': '请正确输入电子邮箱。'
				});
				return false;
			}
			if (!$rootScope.regexp_password.test($scope.user_info.password)) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '',
					'message': '请正确输入初始密码。'
				});
				return false;
			}
			if ($scope.user_info.rePassword !== $scope.user_info.password) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '',
					'message': '两次密码输入应一致。'
				});
				return false;
			}
			return true;
		};
		//修改用户
		$scope.update_user = function () {
			if (!$scope.validate()) {
				console.log('没有通过表单验证！');
				return;
			}

			var params = {};
			params.nickname = $scope.user_info.username;
			params.email = $scope.user_info.mail;
			if ($scope.user_info.password) {
				params.password = $scope.user_info.password;
			}
			$http
				.put('/api/su/user/' + $scope.user_info.id + '/update', params,{
					headers: {
						'Content-Type': 'application/json'
					}
				})
				.success(function (data) {
					$modalInstance.close('ok');
					$rootScope.$broadcast('reload_user_table');
				});
		};
		//取消修改用户
		$scope.cancel = function () {
			$modalInstance.close('ok');
		};
	});