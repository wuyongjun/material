angular.module('iwx')
	.controller('DepDetailCtrl', function ($scope, $rootScope, $http, department, $modalInstance) {
		$scope.departmentId = department.id;
		$scope.department = {};
		if ($scope.departmentId === -1) {
			$scope.department.name = '';
			$scope.department.describe = '';
		} else {
			$scope.department = department;
		}
		//创建或修改部门信息
		$scope.creOrUdpDep = function () {
			console.log($scope.department);
			var param = {};
			param.name = $scope.department.name;
			param.describe = $scope.department.describe;
			if ($scope.departmentId === -1) {
				//创建部门信息
				$http.post('/api/admin/department/add', param, {
					headers: {
						'Content-Type': 'application/json'
					}
				}).success(function (data) {
					$rootScope.$broadcast('flushDepartmentList');
					$modalInstance.close('ok');
				});
			} else {
				//修改部门信息
				$http.put('/api/admin/department/' + $scope.department.id + '/update', param, {
					headers: {
						'Content-Type': 'application/json'
					}
				}).success(function (data) {
					$rootScope.$broadcast('flushDepartmentList');
					$modalInstance.close('ok');
				});
			}
		};
		//关闭modal
		$scope.cancel = function () {
			$modalInstance.close('ok');
		};
	});