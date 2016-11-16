angular.module('iwx')
	.controller('DutyDetailCtrl', function ($scope, $rootScope, $http, duty, $modalInstance, eventType) {
		$scope.dutyId = duty.id;
		$scope.duty = {};
		if ($scope.dutyId === -1) {
			$scope.duty.name = '';
			$scope.duty.describe = '';
			$scope.duty.department = '';
		} else {
			$scope.duty = duty;
		}
		//获取部门列表
		var getDepartmentList = function () {
			$http.get('/api/admin/department')
				.success(function (data) {
					$scope.departmentArray = data;
				});
		};
		getDepartmentList();
		//创建或修改部门信息
		$scope.creOrUdpDuty = function () {
			var param = {};
			param.name = $scope.duty.name;
			param.describe = $scope.duty.describe;
			console.log($scope.duty.department.id);
			if (!$scope.duty.department.id) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '',
					'message': '需要先选择部门，才能创建对应的部门职位。'
				});
				return;
			}
			if ($scope.dutyId === -1) {
				//创建部门信息
				$http.post('/api/admin/department/' + $scope.duty.department.id + '/duty/add', param, {
					headers: {
						'Content-Type': 'application/json'
					}
				}).success(function (data) {
					$rootScope.$broadcast('flushDutyList');
					$modalInstance.close('ok');
				});
			} else {
				//修改部门信息
				$http.put('/api/admin/duty/' + $scope.duty.id + '/update', param, {
					headers: {
						'Content-Type': 'application/json'
					}
				}).success(function (data) {
					$rootScope.$broadcast('flushDutyList');
					$modalInstance.close('ok');
				});
			}
		};
		//关闭modal
		$scope.cancel = function () {
			$modalInstance.close('ok');
		};
	});