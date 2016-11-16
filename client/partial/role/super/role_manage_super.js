angular.module('iwx')
	.controller('RoleManageSuperCtrl', function ($scope, $rootScope, $http, eventType, ngTableParams, $state, $window, $stateParams) {
		$rootScope.welcome_bg = false;
		$rootScope.roles_table = {
			'SUPER_USER': '超级管理员',
			'IWX_ADMIN': 'i微校管理员',
			'UN_ADMIN': '校管理员',
			'ADMIN': '社团管理员',
			'USER': '普通用户',
			'visitor': '游客'
		};
		$rootScope.regexp_password = /^[a-zA-Z0-9]\w{3,17}$/;
		$rootScope.regexp_username = /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,100}$/;
		$rootScope.regexp_email = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
		$scope.provinceArray = [];
		$scope.user = {};
		$scope.load_roles = function () {
			//获取管理员列表
			$http
				.get('/api/su/roles')
				.success(function (data) {
					console.log(data);
					for (var i=0;i<data.length;i++) {
						data[i].name = $rootScope.roles_table[data[i].name];
					}
					$scope.roleArray = data;
				});
		};
		$scope.load_roles();
		
		//获取角色列表
		var NgTableParams = ngTableParams;
		var roles;
		$scope.tableParams = new NgTableParams({
			page: 1,
			count: 10
		}, {
			counts:[],
			total: 0,
			getData: function ($defer, params) {
				var url = '/api/su/roles/all';
				$http
					.get(url)
					.success(function (data) {
						roles = data;
						params.total(data.length);
						$defer.resolve(roles.slice((params.page() - 1) * params.count(), params.page() * params.count()));
					});
			}
		});
		//获取用户列表
		$scope.user_list = function (id) {
			$state.go('role_manage_super.user', {
				'manager_type': id
			}, {reload: true});
		};
		//验证参数
		$scope.validate = function () {
			console.log($scope.user.username + '-----------' + $rootScope.regexp_username.test($scope.user.username));
			if ($scope.user.username === undefined || !$rootScope.regexp_username.test($scope.user.username)) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '',
					'message': '请正确输入用户名称。'
				});
				return false;
			}
			if ($scope.user.email === undefined || !$rootScope.regexp_email.test($scope.user.email)) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '',
					'message': '请正确输入电子邮箱。'
				});
				return false;
			}
			if ($scope.user.password === undefined || !$rootScope.regexp_password.test($scope.user.password)) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '',
					'message': '请正确填写初始密码。'
				});
				return false;
			}
			if ($scope.user.rePassword !== $scope.user.password) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '',
					'message': '两次密码输入应一致。'
				});
				return false;
			}
			if ($scope.user.role_scope === undefined) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '',
					'message': '请选择用户类型。'
				});
				return false;
			}
			return true;
		};
		//创建管理员用户
		$scope.create_user = function () {
			if (!$scope.validate()) {
				console.log('没有通过表单验证！');
				return;
			}
			var params = {};
			params['nickname'] = $scope.user.username;
			params['password'] = $scope.user.password;
			params['email'] = $scope.user.email;
			params['roles'] = $scope.user.role_scope;
			console.log($scope.user.role_scope);
			var url = '/api/su/manager/create';
			$http
				.post(url, params, {
					headers: {
						'Content-Type': 'application/json'
					}
				})
				.success(function (data) {
					$rootScope.$emit(eventType, {
						'type': 'POPMSG',
						'title': '',
						'message': '成功创建用户。'
					});
				});
			
		};
		//取消操作
		$scope.cancel = function () {
			$scope.user = {};
			$scope.load_roles();
			// $scope.load_province();
		};
	});