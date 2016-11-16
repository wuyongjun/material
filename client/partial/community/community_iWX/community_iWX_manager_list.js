angular.module('iwx')
	.controller('CommIwxManagerListCtrl', function ($scope, $rootScope, $http, ngTableParams) {
		$rootScope.excel = false;
		//角色对照表
		$scope.role_hash_table = {
			'UN_ADMIN': '学校管理员',
			'ADMIN': '社团管理员'
		};
		//加载管理员列表
		$scope.load_manager_list = function () {
			var NgTableParams = ngTableParams;
			var manager_list = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http
						.get('/api/iwx/' + $rootScope.university_id_param + '/admin' + '?page=' + params.page() + '&per_page=' + params.count())
						.success(function (data) {
							manager_list = data.items;
							if (params.page() === 1 && data.un_admin) {
								var un_admin = data.un_admin;
								var len = un_admin.length;
								for (var i = 0;i < len;i++) {
									var temp = un_admin[i];
									manager_list.unshift(temp);
								}
							}
							params.total(data.total);
							$defer.resolve(manager_list);
							$scope.load_community_table();
						});
				}
			});
		};
		if ($scope.search_params.university_scope_id) {
			$rootScope.university_id_param = $scope.search_params.university_scope_id;
			$scope.load_manager_list();
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
	    			$scope.load_manager_list();
	    		});
		}
		
		$scope.$on('reload_manager_list', function (event, param) {
			$rootScope.university_id_param = param;
			console.log($rootScope.university_id_param);
			$scope.tableParams.reload();
		});
	});