angular.module('iwx')
	.controller('UserManageScopeCtrl', function ($scope, $rootScope, $http, user, eventType, $modalInstance, ngTableParams) {
		//初始化当前页码
		$scope.current_page = 1;
		//已加载的学校
		$scope.university_set = {};
		$scope.universitys = [];
		//已添加的学校
		$scope.university_hash = {};
		//已经选择的学校的id数组
		$scope.university_id_choosen = [];
		//查询条件对象
		$scope.user = {};
		//加载省份信息
		$scope.load_province = function () {
			$http
				.get('/api/su/geography/0')
				.success(function (data) {
					$scope.provinceArray = data;
				});
		};
		$scope.load_province();
		//加载市信息
		$scope.load_city = function () {
			$http
				.get('/api/su/geography/' + $scope.user.province_scope_id)
				.success(function (data) {
					$scope.cityArray = data;
				});
		};
		//监听省级管理范围
		$scope.change_province = function () {
			if ($scope.user.province_scope_id) {
				$scope.load_city();
			}
		};
		//监听市级管理范围
		$scope.change_city = function () {
			if ($scope.user.city_scope_id) {
				$scope.current_page = 1;
				$scope.universitys = [];
				$scope.university_id_choosen = [];
				$scope.university_set = {};
				$scope.more_university = false;
				$scope.choose_all = false;
				$scope.get_universitys($scope.current_page);
			}
		};
		//选择要给管理员添加的学校
		$scope.choose_university = function (university_id, choose_item) {
			if (choose_item) {
				if (!$scope.university_hash[university_id]) {
					$scope.university_id_choosen.push(university_id);
				}
            } else {
                for (var i = 0;i < $scope.university_id_choosen.length;i++) {
                    var temp = $scope.university_id_choosen[i];
                    if (temp === university_id) {
                        $scope.university_id_choosen.splice($scope.university_id_choosen.indexOf(temp), 1);
                    }
                }
            }
		};
		//选择全部加载的学校
		$scope.choose_universitys = function (choose_all) {
			if (choose_all) {
                if ($scope.university_id_choosen.length !== 0) {
                    $scope.university_id_choosen.splice(0, $scope.university_id_choosen.length);
                }
                for (var i = 0;i < $scope.universitys.length; i++) {
                    var temp = $scope.universitys[i];
                    //判断该学校是否已经添加了
                    if (!$scope.university_hash[temp.id]) {
                    	$scope.university_id_choosen.push(temp.id);
                    }
                }
            } else {
                $scope.university_id_choosen.splice(0, $scope.university_id_choosen.length);
            }
		};
		//加载学校信息，根据市县id进行获取
		$scope.get_universitys = function (page) {
			$http
				.get('/api/su/' + $scope.user.city_scope_id + '/university' + '?page=' + page + '&per_page=' + 12)
				.success(function (data) {
					if (data.items.length === 0) {
						if ($scope.current_page === 1) {
							$rootScope.$emit(eventType.NOTIFICATION, {
								'type': 'POPMSG',
	        					'title': '消息',
	        					'message': '没有查询到符合条件的学校'
							});
						} else {
							$rootScope.$emit(eventType.NOTIFICATION, {
								'type': 'POPMSG',
	        					'title': '消息',
	        					'message': '已加载全部符合条件的学校'
							});
						}
						return;
					}
					$scope.more_university = true;
					var add = 0;
					angular.forEach(data.items, function (value) {
						if (!(value.id in $scope.university_set)) {
							$scope.university_set[value.id] = true;
							$scope.universitys.push(value);
						}
						add++;
					});
					if (add === 0) {
						$scope.get_universitys(++$scope.current_page);
					}
				});
		};
		//加载更多学校
		$scope.load_more_university = function () {
			$scope.get_universitys(++$scope.current_page);
		};
		//取消选择管理范围
		$scope.cancel = function () {
			$modalInstance.close('ok');
		};
		//已经添加的学校列表，根据用户id获取
		$scope.get_universitys_add = function () {
			var NgTableParams = ngTableParams;
			var university_data;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 5
			}, {
				counts:[],
				total: 0,
				getData: function ($defer, params) {
					var url = '/api/su/iwx/' + user.id + '?page='+params.page() + '&per_page=' + params.count();
					$http
						.get(url)
						.success(function (data) {
							university_data = data.items;
							params.total(data.total);
							$defer.resolve(university_data);
							//将已添加的学校id添加到对照表中
							for (var i = 0;i < university_data.length;i++) {
								var temp = university_data[i];
								$scope.university_hash[temp.university_id] = true;
							}
						});
				}
			});
		};
		$scope.get_universitys_add();
		//删除管理员管理的学校
		$scope.delete_university = function (manage_id, university_id) {
			$http
				.delete('/api/su/iwx/' + manage_id + '/del')
				.success(function (data) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '成功删除管理员与该学校的关联关系。'
					});
					$scope.university_hash[university_id] = false;
					console.log($scope.university_hash);
					$scope.tableParams.reload();
				});
		};
		//添加管理员要管理的学校
		$scope.add_university = function () {
			console.log('选中的学校id数组：'+angular.toJson($scope.university_id_choosen)+';选中的学校对照set：'+angular.toJson($scope.university_set));
			var param = {
				'universities': ''
			};
			if ($scope.university_id_choosen.length === 0) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '消息',
					'message': '未选择学校或学校已添加完成。'
				});
				return;
			} else {
				param.universities = $scope.university_id_choosen;
			}

			console.log('给id为'+user.id+'的用户添加的学校参数为：'+angular.toJson(param));
			$http
				.post('/api/su/iwx/' + user.id + '/add', param, {
					headers: {
						'Content-Type': 'application/json'
					}
				})
				.success(function (data) {
					console.log(data);
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '学校添加成功。'
					});
					$scope.tableParams.reload();
				});
		};
	});