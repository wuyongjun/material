angular.module('iwx')
	.controller('CommDutyMemCtrl', function ($scope, $rootScope, $http, ngTableParams, $modalInstance, duty, eventType) {
		//部门id
		$scope.duty = duty;
		//社团成员id数组
		$scope.member_id_array = [];
		//选中成员的hash对照表
		$scope.member_id_hash = {};
		var hashtable = {};
		//定义页码和全选状态对照表
		var page_check_all_hash = {};
		//定义变量，用来记录当前页码信息
		var current_page = 1;
		//获取全部社团成员
		var NgTableParams = ngTableParams;
		$scope.tableParams = new NgTableParams({
			page: 1,
			count: 5,
		}, {
			counts: [],
			total: 0,
			getData: function ($defer, params) {
				$http.get('/api/admin/duty/'+$scope.duty.department.id+'/users?page='+params.page()+'&per_page='+params.count())
					.success(function (data) {
						//给当前页码变量赋值
						current_page = params.page();
						$scope.users = data.items;
						params.total(data.total);
						$defer.resolve($scope.users);
						//控制全选框的选中状态
						if (page_check_all_hash[current_page]) {
							$scope.is_checked_all = true;
						} else {
							$scope.is_checked_all = false;
						}
					});
			}
		});
		//全选复选框勾选状态
	    $scope.checked_all = function () {
	    	return $scope.is_checked_all;
	    };
	    //对社团成员进行全部选择操作
	    $scope.get_checked_all = function (is_checked_all) {
	    	//当社团被全部选中时
	    	if (is_checked_all) {
	    		//当选中全选按钮时，进行页码和全选状态的记录
	    		page_check_all_hash[current_page] = true;
	    		for (var i = 0;i < $scope.users.length;i++) {
	    			var temp = $scope.users[i];
	    			if (!hashtable[temp.user.id]) {
	    				hashtable[temp.user.id] = true;
	    				$scope.member_id_array.push(temp.user.id);
	    			}
	    		}
	    		$scope.member_id_hash = {};
	    		$scope.is_checked_all = true;
	    	} else {
	    		//用来记录要删除的子数组的元素
	    		var hash = {};
	    		angular.forEach($scope.users, function (value) {
	    			hash[value.user.id] = true;
	    		});
	    		console.log('要删除的子数组hash表：' + angular.toJson(hash));
				for (var j = 0;j < $scope.member_id_array.length;j++) {
					if (hash[$scope.member_id_array[j]]) {
						delete $scope.member_id_array[j];
					}
				}
	    		//当取消全选按钮时，进行页码和全选状态的记录
	    		page_check_all_hash[current_page] = false;
	    		hashtable = {};
	    		// $scope.member_id_array.splice(0, $scope.member_id_array.length);
	    		$scope.is_checked_all = false;
	    	}
	    };
	    //每条记录的复选框勾选状态
	    $scope.is_checked = function (id) {
	    	if ($scope.is_checked_all) {
	    		return true;
	    	} else {
	    		return $scope.member_id_hash[id];
	    	}
	    };
	    //对社团成员进行单个选择操作
	    $scope.get_checked_item = function (member_id, is_checked_item) {
	    	//当社团被选中时
	    	if (is_checked_item) {
	    		hashtable[member_id] = true;
	    		$scope.member_id_hash[member_id] = true;
	    		$scope.member_id_array.push(member_id);
	    	} else {
	    		for (var i=0;i<$scope.member_id_array.length;i++) {
	    			var temp = $scope.member_id_array[i];
	    			if (temp === member_id) {
	    				hashtable[member_id] = false;
	    				$scope.member_id_hash[member_id] = false;
	    				$scope.member_id_array.splice($scope.member_id_array.indexOf(temp), 1);
	    				break;
	    			}
	    		}
	    	}
	    };
	    //添加选中的社团成员
	    $scope.choose_member = function () {
	    	console.log($scope.member_id_array);
	    	console.log('部门id：'+$scope.duty.department.id);
	    	var param = {};
	    	param.users = $scope.member_id_array;
	    	if ($scope.member_id_array.length === 0) {
	    		$rootScope.$emit(eventType.NOTIFICATION, {
	    			'type': 'POPMSG',
                    'title': '消息',
                    'message': '请选择社团成员。'
	    		});
	    		return;
	    	}
	    	$http.post('/api/admin/duty/' + $scope.duty.id + '/add_duty', param)
	    		.success(function (data) {
	    			$rootScope.$emit(eventType.NOTIFICATION, {
		    			'type': 'POPMSG',
	                    'title': '消息',
	                    'message': '成功赋予成员职位。'
		    		});
	    		});
	    	$modalInstance.close('ok');
	    };
	    //取消添加操作
	    $scope.cancel = function () {
	    	$modalInstance.close('ok');
	    };
	});