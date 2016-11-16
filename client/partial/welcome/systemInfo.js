angular.module('iwx')
	.controller('SystemInfoCtrl', function ($scope, $modalInstance) {
		$scope.version = 'v1.6';
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	});