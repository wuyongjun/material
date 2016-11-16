angular.module('iwx')
	.controller('CommIwxShiftCtrl', function ($scope, $rootScope, $http, ngTableParams, eventType) {

		//加载换届社团信息列表
		$scope.load_election_community = function () {
			var NgTableParams = ngTableParams;
			var community_shift = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http
						.get('/api/iwx/' + $rootScope.university_id_param + '/election' + '?page=' + params.page() + '&per_page=' + params.count())
						.success(function (data) {
							community_shift = data.items;
							params.total(data.total);
							$defer.resolve(community_shift);
							$scope.load_community_table();
						});
				}
			});
		};
		if ($scope.search_params.university_scope_id) {
			$rootScope.university_id_param = $scope.search_params.university_scope_id;
			$scope.load_election_community();
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
	    			$scope.load_election_community();
	    		});
		}
		//确认操作方法
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'shift_approved') {
				//批准社团换届
				console.log($scope.confirm.param);
				$http
					.get('/api/iwx/confirm/' + $scope.confirm.param + '/election')
					.success(function (data) {
						$scope.tableParams.reload();
					});
				
			} else if ($scope.confirm.type === 'shift_reject') {
				console.log($scope.confirm.param);
				//拒绝社团换届
				$http
					.post('/api/iwx/' + $scope.confirm.param + '/refuse')
					.success(function (data) {
						$scope.tableParams.reload();
					});
			}
		};
		//批准社团换届
		$scope.approved_shift = function (election_id) {
			$scope.confirm.message = '确定批准社团换届？';
			$scope.confirm.type = 'shift_approved';
			$scope.confirm.param = election_id;
			$('#confirmModal').modal();
		};
		//拒绝社团换届
		$scope.reject_shift = function (election_id) {
			$scope.confirm.message = '确定拒绝社团换届？';
			$scope.confirm.type = 'shift_reject';
			$scope.confirm.param = election_id;
			$('#confirmModal').modal();
		};
		$scope.$on('reload_community_shift', function (event, param) {
			$rootScope.university_id_param = param;
			$scope.tableParams.reload();
		});
	});