angular.module('iwx')
	.controller('EditDutyCtrl', function ($scope, $http, $rootScope, $modalInstance, duty) {
		$scope.duty = duty;
		//创建或者修改职务
		$scope.creOrUdpDuty = function () {
			var param = {};
			param.name = $scope.duty.name;
			param.describe = $scope.duty.describe;
			if ($scope.duty.id === -1) {
				$http.post('/api/political/duty/add', param, {
					headers: {
						'Content-Type': 'application/json'
					}
				}).success(function (data) {
					$modalInstance.close('ok');
					$rootScope.$broadcast('flushDutyList');
				});
			} else {
				$http.put('/api/political/duty/' + $scope.duty.id + '/update', param, {
					headers: {
						'Content-Type': 'application/json'
					}
				}).success(function (data) {
					$modalInstance.close('ok');
					$rootScope.$broadcast('flushDutyList');
				});
			}
		};
		//关闭
		$scope.cancel = function () {
			$modalInstance.close('ok');
		};
	});