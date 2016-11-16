angular.module('iwx')
	.controller('HostDetailCtrl', function ($scope, $rootScope, $http, $stateParams, hostId) {
		$scope.commId = hostId;
		$http.get('/api/un/' + $scope.commId + '/admin_user')
			.success(function (data) {
				console.log(data);
				$scope.admin_user = data;
				$scope.community = data.managed_community;
			});
	});