angular.module('iwx')
	.controller('CommMemDutySetCtrl', function ($scope, $rootScope, $http, $modalInstance, user, eventType) {
		$scope.btnSetting = true;
		//获取社员信息
		$http.get('/api/admin/community/register/users/' + user.user.id)
            .success(function (data) {
                $scope.member = data;
                if ($scope.member.department) {
					$http.get('/api/admin/department/' + $scope.member.department.id + '/duty')
						.success(function (data) {
							$scope.dutyArray = data;
						});
				}
            });
		//获取社团部门列表
		var getDepatments = function () {
			$http.get('/api/admin/department')
				.success(function (data) {
					$scope.departmentArray = data;
				});
		};
		getDepatments();
		$scope.changeDepartment = function (departmentId) {
			console.log(departmentId);
			if (departmentId) {
				$http.get('/api/admin/department/' + departmentId + '/duty')
					.success(function (data) {
						$scope.dutyArray = data;
					});
			}
		};

		//监听职务下拉框变化
		$scope.$watch('duty_id', function () {
			if ($scope.duty_id) {
				$scope.btnSetting = false;
			}
		});
		//设置职务
		$scope.setDuty = function () {
			var param = {};
			if ($scope.member.department) {
				param.department_id = $scope.member.department.id;
			} else {
				param.department_id = $scope.department_id;
			}
			param.duty_id = $scope.duty_id;

			$http.post('/api/admin/community/' + $scope.member.user.id + '/member/set', param)
				.success(function (data) {
					$rootScope.$emit(eventType.NOTIFICATION, {
                        'type': 'POPMSG',
                        'title': '消息',
                        'message': '成功赋予成员该职务。'
                    });
                    $modalInstance.close('ok');
				});
		};
		//取消操作
		$scope.cancel = function () {
			$modalInstance.close('ok');
		};
	});