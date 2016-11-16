angular.module('iwx')
	.controller('CommUniPendingCtrl', function ($scope, $rootScope, $http, ngTableParams, eventType) {
		//加载待审核的学校社团列表
		var load_university_pending = function () {
			var NgTableParams = ngTableParams;
			var communities = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http
						.get('/api/un/pending_admins?page=' + params.page() + '&per_page=' + params.count())
						.success(function (data) {
							communities = data.items;
							params.total(data.total);
							$defer.resolve(communities);
						});
				}
			});
		};
		load_university_pending();
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'verify_approved') {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'LONG_INFO',
					'message': '处理中...'
				});
				console.log('要批准的社团管理员邮箱：' + $scope.confirm.param);
				$http
					.get('/api/un/confirm/' + $scope.confirm.param)
					.success(function (data) {
						$rootScope.$emit(eventType.NOTIFICATION, null);
						$scope.tableParams.reload();
					});
				
			} else if ($scope.confirm.type === 'verify_reject') {
				console.log('verify_reject');
			}
		};
		//批准社团通过审核
		$scope.approved = function (email) {
			$scope.confirm.message = '确定批准该社团审核通过？';
			$scope.confirm.type = 'verify_approved';
			$scope.confirm.param = email;
			$('#confirmModal').modal();
		};
		//拒绝社团通过审核
		$scope.reject = function (communityId) {
			$scope.confirm.message = '确定拒绝该社团审核通过？';
			$scope.confirm.type = 'verify_reject';
			$scope.confirm.param = communityId;
			$('#confirmModal').modal();
		};
	});