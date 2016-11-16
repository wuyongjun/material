angular.module('iwx')
	.controller('ProfileUniCtrl', function ($scope, $rootScope, $http, eventType, userService) {
		$rootScope.welcome_bg = false;
		$scope.change = {};
		userService.load().then(function (user) {
			$scope.user = user;
		});
		var validate = function () {
			if ($scope.user.nickname && $scope.user.nickname === '') {
				$rootScope.$emit(eventType.NOTIFICATION, {
                    'type': 'POPMSG',
                    'title': '消息',
                    'message': '请填写管理员昵称。'
                });
                return false;
			}
			if ($scope.change.new_password !== $scope.change.new_password_confirm) {
				$rootScope.$emit(eventType.NOTIFICATION, {
                    'type': 'POPMSG',
                    'title': '消息',
                    'message': '两次密码输入必须一致。'
                });
                return false;
			}
			return true;
		};
		$scope.save_manager_info = function () {
			if (!validate()) {
				return;
			}
			var fd = new FormData();
			fd.append('nickname', $scope.user.nickname);
			if (typeof $scope.user.icon !== 'string') {
				fd.append('icon', $scope.user.icon);
			}
			userService.update(fd);
		};
		
		$scope.changePassword = function() {
			if (!validate()) {
				return;
			}
			var param = {};
			param['old_password'] = $scope.change.password;
			param['password'] = $scope.change.new_password;
			userService.update_password(param);
		};
	});