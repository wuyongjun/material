angular.module('iwx')
	.controller('RoleManageSuperUserCtrl', function ($scope, $rootScope, $http, ngTableParams, eventType, $stateParams, $modal) {
		$scope.confirm = {};
		$scope.confirm.title = "请确定您的操作";
		$scope.confirm.message = "MESSAGE";
		$scope.confirm.type = "";
		$scope.confirm.param = "";
		//获取角色列表
		$scope.manager_type = $stateParams.manager_type;
		var NgTableParams = ngTableParams;
		var roles;
		$scope.tableParams = new NgTableParams({
			page: 1,
			count: 10
		}, {
			counts:[],
			total: 0,
			getData: function ($defer, params) {
				var url = '/api/su/managers?page='+params.page() + '&per_page=' + params.count() + '&manager_type=' + $scope.manager_type;
				$http
					.get(url)
					.success(function (data) {
						console.log(data);
						roles = data.items;
						params.total(data.total);
						$defer.resolve(roles);
					});
			}
		});
		//操作确认提示
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delete_user') {
				var url = '';
				$http
					.delete(url + $scope.confirm.param)
					.success(function () {
						$scope.tableParams.reload();
					});
			}
		};
		//删除用户
		$scope.delete_user = function (user_id) {
			$scope.confirm.message = '您确定要删除该用户?';
            $scope.confirm.type = 'delete_user';
            $scope.confirm.param = user_id;
            $("#confirmModal").modal();
		};
		//修改用户基本信息
		$scope.update_user = function (user) {
			$modal.open({
				templateUrl: 'partial/role/super/role_manage_super_user_info.html',
				controller: 'UserInfoCtrl',
				resolve: {
					user_info: function () {
						return user;
					}
				}
			});
		};
		//修改用户管理范围
		$scope.manage_scope = function (user) {
			$modal.open({
				templateUrl: 'partial/role/super/role_manage_super_scope.html',
				controller: 'UserManageScopeCtrl',
				resolve: {
					user: function () {
						return user;
					}
				}
			});
		};
		//绑定reload_user_table事件
		$scope.$on('reload_user_table', function () {
			$scope.tableParams.reload();
		});
	});