angular.module('iwx')
	.controller('OrgInfoDetCtrl', function ($scope, $rootScope, $stateParams, $http, community, eventType, $modalInstance) {
		console.log(community);
		$scope.community = community;
		if ($scope.community.admin_user.confirmed_at) {
			$scope.status = true;
		} else {
			$scope.status = false;
		}
		//批准社团
		$scope.approve_org = function (email) {
			$rootScope.$emit(eventType.NOTIFICATION, {
				'type': 'LONG_INFO',
				'message': '处理中...'
			});
			$modalInstance.close('ok');
			console.log('<要批准的社团管理员邮箱：>' + email);
			$http
				.get('/api/un/confirm/' + email)
				.success(function (data) {
					$rootScope.$emit(eventType.NOTIFICATION, null);
					$scope.tableParams.reload();
				});
		};
	});