angular.module('iwx')
	.controller('CommIwxPendingCtrl', function ($scope, $rootScope, $http, ngTableParams, eventType) {
		//加载未审核社团信息列表
		$scope.load_pending_community = function () {
			var NgTableParams = ngTableParams;
			var community_pending = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http
						.get('/api/iwx/pending_admins' + '?page=' + params.page() + '&per_page=' + params.count() + '&university_id=' + $rootScope.university_id_param)
						.success(function (data) {
							community_pending = data.items;
							params.total(data.total);
							$defer.resolve(community_pending);
							$scope.load_community_table();
						});
				}
			});
		};
		if ($scope.search_params.university_scope_id) {
			$rootScope.university_id_param = $scope.search_params.university_scope_id;
			$scope.load_pending_community();
		} else {
	    	$http
	    		.get('/api/iwx/geography')
	    		.success(function (data) {
	    			$scope.geography = data;
	    			if ($scope.geography) {
			    		$scope.geography_city = $scope.geography['1'];
			    	}
			    	if ($scope.geography_city) {
			    		$scope.geography_university = $scope.geography_city['2'];
			    	}
	    			$rootScope.university_id_param = $scope.geography_university[0].university.id;
	    			$scope.load_pending_community();
	    		});
		}
		
		//确认操作方法
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'verify_approved') {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'LONG_INFO',
					'message': '处理中...'
				});
				console.log('要批准的社团管理员邮箱：' + $scope.confirm.param);
				$http
					.get('/api/iwx/confirm/' + $scope.confirm.param)
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
		$scope.$on('reload_community_pending', function (event, param) {
			$rootScope.university_id_param = param;
			$scope.tableParams.reload();
		});
	});