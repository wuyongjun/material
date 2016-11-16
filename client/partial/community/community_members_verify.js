angular.module('iwx')
	.controller('CommMemVerCtrl', function ($scope, $rootScope, $http, ngTableParams, $modal, $stateParams) {
		$scope.currentPage = $stateParams.page;
		var NgTableParams = ngTableParams;
		var users = null;
		$scope.tableParams = new NgTableParams({
			// page: 1,
			page: $scope.currentPage,
			count: 10,
		}, {
			counts: [],
			total: 0,
			getData: function ($defer, params) {
				$scope.currentPage = params.page();
				$http.get('/api/admin/community/register/users?page='+params.page()+'&per_page='+params.count()+'&register_type=PENDING')
					.success(function (data) {
						users = data.items;
						params.total(data.total);
						$defer.resolve(users);
					});
			}
		});
		//刷新表格
		var reloadTable = function () {
			$scope.tableParams.reload();
		};
	    //批准入社
	    $scope.approve = function (userId) {
	    	$modal.open({
	    		templateUrl: 'partial/community/community_member_department.html',
	    		controller: 'CommMemberDepCtrl',
	    		resolve: {
	    			userId: function () {
	    				return userId;
	    			}
	    		}
	    	});
	    };
	    //拒绝入社
	    $scope.refuse = function (user, reason) {
	    	$modal.open({
	            templateUrl: 'partial/community/community_reject_reason.html',
	            controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
	                $scope.ok = function () {
	                    if (!$scope.content) { return; }
	                    $http.post('/api/admin/messages/' + user.user.id, {
	                        'content': $scope.content
	                    }).success(function (data) {
	                        $modalInstance.close('ok');
	                        $http.post('/api/admin/community/register/users/' + user.user.id + '/decision', {
	                            'status': 'REJECTED',
	                            'reason': reason
	                        }).success(function (data) {
	                            reloadTable();
	                        });
	                    });
	                };
	                $scope.cancel = function () {
	                    $modalInstance.dismiss('cancel');
	                };
	            }]
	        });
	    };
	    //刷新待审核成员表事件
	    $scope.$on('verify_members_tab', function () {
	    	$scope.tableParams.reload();
	    });
	});