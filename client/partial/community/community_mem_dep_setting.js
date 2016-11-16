angular.module('iwx')
	.controller('CommMemDepSetCtrl', function ($scope, $rootScope, $http, $modalInstance, user, eventType) {
		$scope.btnSetting = true;
		//获取社员信息
		$http.get('/api/admin/community/register/users/' + user.user.id)
            .success(function (data) {
                $scope.member = data;
            });
		//获取社团部门列表
		var getDepatments = function () {
			$http.get('/api/admin/department')
				.success(function (data) {
					$scope.departmentArray = data;
				});
		};
		getDepatments();
		//监控部门下拉列表的值
		$scope.$watch('department_id', function () {
			if ($scope.department_id) {
				$scope.btnSetting = false;
			}
		});
		//取消操作
		$scope.cancel = function () {
			$modalInstance.close('ok');
		};
		//设置部门
		$scope.setDepartment = function () {
			var param = {};
			param.department_id = $scope.department_id;
			param.duty_id = 0;
			$http.post('/api/admin/community/' + $scope.member.user.id + '/member/set', param)
				.success(function (data) {
					$rootScope.$emit(eventType.NOTIFICATION, {
                        'type': 'POPMSG',
                        'title': '消息',
                        'message': '成功添加到该部门。'
                    });
                    $modalInstance.close('ok');
				});
		};
	});