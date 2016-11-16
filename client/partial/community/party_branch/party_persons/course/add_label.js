angular.module('iwx')
	.controller('AddLabelCtrl', function ($scope, $rootScope, $http, $modalInstance) {
		$scope.label = {};
		//创建标签
		$scope.createLabel = function () {
			var param = {};
			param.name = $scope.label.name;
			$http.post('/api/political/label/create', param, {
					headers: {
						'Content-Type': 'application/json'
					}
				}).success(function (data) {
					$modalInstance.close('ok');
					$rootScope.$broadcast('addLabel');
				});
		};
		//关闭
		$scope.cancel = function () {
			$modalInstance.close('ok');
		};
	});