angular.module('iwx')
	.controller('CommunityIwxCtrl', function ($scope, $http, $modal, $state, ngTableParams, $rootScope, eventType) {
		$rootScope.welcome_bg = false;
		//显示到处表格
		$rootScope.excel = true;
		//使用查询按钮
		$rootScope.search = false;
		//确认框参数
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		//定义省、市、学校数组
		$scope.provinceArray = [];
		//条件搜索参数对象
	    $scope.search_params = {
	    	
	    };
	    $scope.org_type_hash = {
	    	'ORG': '校级学生组织',
	    	'ST_UNION': '学生社团',
	    	'TISSUE': '院系学生会',
	    	'COMMITTEE': '院系团委',
	    	'POLITICAL': '党支部'
	    };
	    //获取管理的地域和学校信息
	    $scope.load_geography = function () {
	    	$http
	    		.get('/api/iwx/geography')
	    		.success(function (data) {
	    			$scope.geography = data;
	    			angular.forEach($scope.geography, function (value, key) {
	    				$scope.provinceArray.push(value.obj);
	    			});
	    			$scope.search_params.province_scope_id = $scope.provinceArray[0].id;
	    			$scope.cityArray = [];
	    			if ($scope.geography) {
			    		$scope.geography_city = $scope.geography[$scope.search_params.province_scope_id];
			    		angular.forEach($scope.geography_city, function (value, key) {
			    			if (value instanceof Array) {
			    				$scope.cityArray.push(value[0].geography);
			    			}
			    		});
			    	}
			    	$scope.search_params.city_scope_id = $scope.cityArray[0].id;
			    	$scope.universityArray = [];
			    	if ($scope.geography_city) {
			    		$scope.geography_university = $scope.geography_city[$scope.search_params.city_scope_id];
			    		angular.forEach($scope.geography_university, function (value, key) {
			    			$scope.universityArray.push(value.university);
			    		});
			    	}
	    			$scope.search_params.university_scope_id = $scope.universityArray[0].id;
	    			console.log($scope.search_params.university_scope_id);
	    			if ($state.current.name === 'community_iWX' || $state.current.name === 'community_iWX.create_manager') {
	    				$scope.load_community_table();
	    			}
	    		});
	    };
	    $scope.load_geography();
	    //监控省下拉列表框的value值的改变
	    $scope.change_province = function () {
	    	$scope.cityArray = [];
	    	if ($scope.geography) {
	    		$scope.geography_city = $scope.geography[$scope.search_params.province_scope_id];
	    		angular.forEach($scope.geography_city, function (value, key) {
	    			if (value instanceof Array) {
	    				$scope.cityArray.push(value[0].geography);
	    			}
	    		});
	    	}
	    };
	    //监控市下拉列表框的value值的改变
	    $scope.change_city = function () {
	    	$scope.universityArray = [];
	    	if ($scope.geography_city) {
	    		$scope.geography_university = $scope.geography_city[$scope.search_params.city_scope_id];
	    		angular.forEach($scope.geography_university, function (value, key) {
	    			$scope.universityArray.push(value.university);
	    		});
	    	}
	    };
	    //查询社团信息方法
	    $scope.change_university = function () {
	    	console.log('this is search community infomation for iweixiao manager');
	    	if ($state.current.name === 'community_iWX.manager_list') {
	    		$scope.$broadcast('reload_manager_list', $scope.search_params.university_scope_id);
	    	} else if ($state.current.name === 'community_iWX') {
	    		console.log($scope.search_params.university_scope_id);
	    		$scope.$broadcast('reload_community_university', $scope.search_params.university_scope_id);
	    	} else if ($state.current.name === 'community_iWX.pending') {
	    		$scope.$broadcast('reload_community_pending', $scope.search_params.university_scope_id);
	    	} else if ($state.current.name === 'community_iWX.shift') {
	    		$scope.$broadcast('reload_community_shift', $scope.search_params.university_scope_id);
	    	} else if ($state.current.name === 'community_iWX.create_manager') {
	    		console.log($scope.search_params.university_scope_id);
	    		$scope.$broadcast('reload_community_university', $scope.search_params.university_scope_id);
	    	}
	    };
	    //社团信息表格
		$scope.load_community_table = function () {
			$rootScope.university_id_param = $scope.search_params.university_scope_id;
			console.log($rootScope.university_id_param);
			var NgTableParams = ngTableParams;
			var communitys = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http
						.get('/api/iwx/' + $rootScope.university_id_param + '/community' + '?page=' + params.page() + '&per_page=' + params.count())
						.success(function (data) {
							communitys = data.items;
							params.total(data.total);
							$defer.resolve(communitys);
						});
				}
			});
		};
		// $scope.load_community_table();
		//确认操作方法
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delete_community') {
				
			} else if ($scope.confirm.type === 'disable_community') {
				$http
					.post('/api/iwx/manager/' + $scope.confirm.param + '/use')
					.success(function (data) {
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type': 'POPMSG',
							'title': '消息',
							'message': '禁用社团成功。'
						});
						$scope.tableParams.reload();
					});
			} else if ($scope.confirm.type === 'enable_community') {
				$http
					.post('/api/iwx/manager/' + $scope.confirm.param + '/use')
					.success(function (data) {
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type': 'POPMSG',
							'title': '消息',
							'message': '启用社团成功。'
						});
						$scope.tableParams.reload();
					});
			} else if ($scope.confirm.type === 'verify_approved') {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'LONG_INFO',
					'message': '处理中...'
				});
				console.log('<要批准的社团管理员邮箱：>' + $scope.confirm.param);
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
		//给通过审核的社团发私信
		$scope.privateLetter = function (communityId) {
			$modal.open({
				templateUrl: 'partial/community/community_iWX/community_iWX_letter.html',
				controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
					$scope.ok = function () {
						var letter = {};
						letter['community_id'] = communityId;
						letter['content'] = $scope.content;
						console.log(letter);
						$http.post('/api/iwx/single/message/create', letter).success(function (data) {
							$modalInstance.close('ok');
							$rootScope.$emit(eventType.NOTIFICATION, {
								'type': 'POPMSG',
								'title': '消息',
								'message': '已经成功向社团管理员发送私信。'
							});
						});
					};
					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};
				}]
			});
		};
		//禁用社团
		$scope.disable_community = function (admin_user_id) {
			$scope.confirm.message = '如果禁用社团，该社团管理员将无法登录，是否继续?';
            $scope.confirm.type = 'disable_community';
            $scope.confirm.param = admin_user_id;
            $("#confirmModal").modal();
		};
		//启用社团
		$scope.enable_community = function (admin_user_id) {
			$scope.confirm.message = '您确定要启用这个社团吗？';
            $scope.confirm.type = 'enable_community';
            $scope.confirm.param = admin_user_id;
            $("#confirmModal").modal();
		};
		//删除社团信息
		$scope.delete_community = function (communityId) {
			$scope.confirm.message = '您确定要删除这个社团吗？';
            $scope.confirm.type = 'delete_community';
            $scope.confirm.param = communityId;
            $("#confirmModal").modal();
            return;
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
		//获取大图  /images/images/placeholder.png
		$scope.viewImage = function(image) {
			console.log(image);
			try {
				var tempArr = image.split('/');
				if (tempArr[tempArr.length - 1] === 'placeholder.png') {
					return;
				}
			} catch (e) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '图片路径不正确'
				});
				return;
			}
			$modal.open({
				template: '<div><img style="width:100%" src=' + image + '></div>',
				size: "lg",
			});
		};
		$scope.$on('reload_community_university', function (event, param) {
			$rootScope.university_id_param = param;
			console.log($scope.tableParams);
			$scope.tableParams.reload();
		});
	});