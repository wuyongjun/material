angular.module('iwx')
	.controller('EditGroupCtrl', function ($scope, $http, $rootScope, $modalInstance, group) {
		$scope.group = group;
		//创建或者修改职务
		$scope.creOrUdpGroup = function () {
			var param = {};
			param.name = $scope.group.name;
			param.describe = $scope.group.describe;
			if ($scope.group.id === -1) {
				$http.post('/api/political/group/add', param, {
					headers: {
						'Content-Type': 'application/json'
					}
				}).success(function (data) {
					$modalInstance.close('ok');
					$rootScope.$broadcast('flushGroupList');
				});
			} else {
				$http.put('/api/political/group/' + $scope.group.id + '/update', param, {
					headers: {
						'Content-Type': 'application/json'
					}
				}).success(function (data) {
					$modalInstance.close('ok');
					$rootScope.$broadcast('flushGroupList');
				});
			}
		};
		//关闭
		$scope.cancel = function () {
			$modalInstance.close('ok');
		};
	});