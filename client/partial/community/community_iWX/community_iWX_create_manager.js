angular.module('iwx')
	.controller('CreateManagerCtrl', function ($scope, $rootScope, $http, eventType) {
		$rootScope.excel = false;
		$rootScope.search = true;
		//定义省、市、学校数组
		$scope.provinceArray = [];
		$scope.cityArray = [];
		$scope.universityArray = [];
		//定义角色数组
		$scope.roleArray = [];
		//参数字段标识 role，例如?role = 2
		var role_id_hash = {
			'ADMIN': 2,
			'UN_ADMIN': 5,
			'visitor': 3
		};
		var role_name_hash = {
			'ADMIN': '社团管理员',
			'UN_ADMIN': '学校管理员',
			'visitor': '游客'
		};
		//定义校级管理员类型数组
		$scope.un_Man_type = [];
		var type_name_hash = {
			'union': '社团联合会',
			'committee': '共青团委员会',
			'disseminate': '校宣传部'
		};
		$scope.manager = {};
		$scope.param = {};
		//获取可创建的校级管理员的类型列表
		$scope.load_un_man_type = function () {
			$http
				.get('/api/iwx/manager/un_admin/type')
				.success(function (data) {
					angular.forEach(data, function (value, key) {
						var obj = {id: '', name: ''};
						obj.id = value;
						obj.name = type_name_hash[value];
						$scope.un_Man_type.push(obj);
					});
					console.log($scope.un_Man_type);
				});
		};
		$scope.load_un_man_type();
		$scope.type = function () {
			console.log($scope.manager.un_admin_type);
		};
		//获取i微校管理可以创建的角色列表
		$scope.load_role = function () {
			$http
				.get('/api/iwx/manager/roles')
				.success(function (data) {
					angular.forEach(data, function (value, key) {
						value['id'] = role_id_hash[value.name];
						value['role_name'] = role_name_hash[value.name];
						$scope.roleArray.push(value);
					});
				});
		};
		$scope.load_role();
		//获取管理的地域和学校信息
	    $scope.load_geography = function () {
	    	$http
	    		.get('/api/iwx/geography')
	    		.success(function (data) {
	    			$scope.geography = data;
	    			angular.forEach($scope.geography, function (value, key) {
	    				$scope.provinceArray.push(value.obj);
	    				$scope.param.province_scope_id = 1;
	    			});
	    		});
	    };
	    $scope.load_geography();
	    //监控省下拉列表框的value值的改变
	    $scope.change_province = function () {
	    	if ($scope.geography) {
	    		$scope.geography_city = $scope.geography[$scope.manager.province_scope_id];
	    		angular.forEach($scope.geography_city, function (value, key) {
	    			if (value instanceof Array) {
	    				$scope.cityArray.push(value[0].geography);
	    			}
	    		});
	    	}
	    };
	    //监控市下拉列表框的value值的改变
	    $scope.change_city = function () {
	    	if ($scope.geography_city) {
	    		$scope.geography_university = $scope.geography_city[$scope.manager.city_scope_id];
	    		angular.forEach($scope.geography_university, function (value, key) {
	    			$scope.universityArray.push(value.university);
	    		});
	    	}
	    };
	    //监控学校下拉列表框的value值的改变
	    $scope.change_university = function () {
	    	console.log($scope.manager.university_id);
	    };
	    //监控角色列表的value值的改变
	    $scope.change_role = function () {
	    	if ($scope.manager.role === 2) {
	    		$scope.show_community = true;
	    	} else if ($scope.manager.role === 5) {
	    		$scope.show_community = false;
	    	}
 	    	console.log($scope.manager.role);
	    };
	    $scope.$watch('manager.role + manager.email + manager.password + manager.nickname' + 
	    	'manager.university_id + manager.community_name + manager.un_admin_type', 
	    	function () {
	    	if ($scope.manager.role === 2 && $scope.manager.email && $scope.manager.password && $scope.manager.community_name && $scope.manager.university_id && 
	    		$scope.manager.nickname) {
	    		$scope.create_manager_btn = false;
	    	} else if ($scope.manager.role === 5 && $scope.manager.email && $scope.manager.password && $scope.manager.university_id && 
	    		$scope.manager.un_admin_type) {
	    		$scope.create_manager_btn = false;
	    	} else {
	    		$scope.create_manager_btn = true;
	    	}
	    });
	    //创建管理员方法
	    $scope.create_manager = function () {
	    	$scope.param['nickname'] = $scope.manager.nickname;
	    	$scope.param['email'] = $scope.manager.email;
	    	$scope.param['password'] = $scope.manager.password;
	    	$scope.param['university_id'] = $scope.manager.university_id;
	    	$scope.param['role'] = $scope.manager.role;
	    	$scope.param['un_admin_type'] = $scope.manager.un_admin_type;
	    	if ($scope.manager.community_name) {
	    		$scope.param['community_name'] = $scope.manager.community_name;
	    	}
	    	console.log('this is creat manager param:' + angular.toJson($scope.param));
	    	$http
	    		.post('/api/iwx/manager/create', $scope.param, {
	    			headers: {
	    				'Content-Type': 'application/json'
	    			}
	    		})
	    		.success(function (data) {
	    			$rootScope.$emit(eventType.NOTIFICATION, {
	    				'type': 'POPMSG',
	    				'title': '消息',
	    				'message': '创建成功'
	    			});
	    		});
	    };
	});