angular.module('iwx')
	.controller('BazListIwxCtrl', function ($scope, $http, $modal, $rootScope, ngTableParams, $state, userService) {
		console.log($state.current.url);
		//页码初始值
	    $scope.current_page = 1;
	    $scope.load_btn = '加载更多~~';
	    //查询到的社团
    	$scope.communities = [];
    	$scope.community_set = {};
		$scope.community_id = '';
    	$scope.org_type_hash = {
	   		'committee': '院系团委',
	   		'tissue': '院系学生会',
	   		'organization': '校级学生组织',
	   		'union': '学生社团'
	   	};
	   	$scope.bazaar_alias_arr = [];
		//获取管理的地域和学校
	    var load_geography = function () {
	        $http
	            .get('/api/iwx/geography')
	            .success(function (data) {
	                $scope.geography = data;
	                $scope.provinceArray = [];
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
	                $scope.bazaar_list_param = $scope.search_params.university_scope_id + '/u';

	                var bazaar_type_api = '';
	                if ($state.current.url === '/bazaar') {
		    			bazaar_type_api = '/api/admin/bazaar/type';
	                	$scope.bazaar_list_api = '/api/iwx/' + $scope.search_params.university_scope_id + '/community/bazaars';
		    			//分页加载社团，参数为学校id和社团类型
	                	loadCommunities($scope.current_page);
		    		} else {
		    			bazaar_type_api = '/api/bazaars/type';
		    			$scope.bazaar_list_api = '/api/iwx/' + $scope.search_params.university_scope_id + '/user/bazaars';
		    		}
	                getBazCount($scope.search_params.university_scope_id);
	    			getBazType(bazaar_type_api);
	    			loadBazaars($scope.current_page);
	            });
	    };
	    
	    //监听省份条件的改变
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
	    //监听市级条件的改变
	    $scope.change_city = function () {
	        $scope.universityArray = [];
	        if ($scope.geography_city) {
	            $scope.geography_university = $scope.geography_city[$scope.search_params.city_scope_id];
	            angular.forEach($scope.geography_university, function (value, key) {
	                $scope.universityArray.push(value.university);
	            });
	        }
	    };
	    //监听校级条件的改变
	    $scope.change_university = function () {
	    	console.log($scope.search_params.university_scope_id);
	    	$scope.communities = [];
    		$scope.community_set = {};
	    	$scope.current_page = 1;
	    	if ($state.current.url === '/bazaar') {
	    		$scope.bazaar_list_api = '/api/iwx/' + $scope.search_params.university_scope_id + '/community/bazaars';
	    		loadCommunities($scope.current_page);
	    	} else {
	    		$scope.bazaar_list_api = '/api/iwx/' + $scope.search_params.university_scope_id + '/user/bazaars';
	    	}
	    	getBazCount($scope.search_params.university_scope_id);
	    	$scope.tableParams.page($scope.current_page);
	    	$scope.tableParams.reload();
	    };
	    //根据学校和组织类型加载组织
	    var loadCommunities = function (page) {
	    	$http.get('/api/iwx/' + $scope.search_params.university_scope_id + '/communities?page=' + page + '&per_page=12&c_type=' + $scope.search_params.org_type)
	    		.success(function (data) {
	    			if (data.items.length === 0) {
	                    if (page === 1) {
	                    	$scope.msg = false;
	                    	console.log($scope.search_params.org_type);
	                    	if ($scope.search_params.org_type === 'organization') {
	                    		$scope.load_msg = '暂时没有更多' + $scope.org_type_hash[$scope.search_params.org_type] + '~~';
	                    	} else {
	                    		$scope.load_msg = '暂时没有更多' + $scope.org_type_hash[$scope.search_params.org_type] + '组织~~';
	                    	}
	                        
	                    } else {
	                    	$scope.btn = true;
	                    	$scope.load_btn = '已经加载全部~~';
	                    }
	                    return;
	                }
	                $scope.btn = false;
	                $scope.load_btn = '加载更多~~';
	                $scope.msg = true;
	                var add = 0;
	                angular.forEach(data.items, function (value) {
	                    if (!(value.id in $scope.community_set)) {
	                        $scope.community_set[value.community.id] = true;
	                        $scope.communities.push(value.community);
	                        add++;
	                    }
	                });
	                if (add === 0) {
	                    loadCommunities(++$scope.current_page);
	                }
	    		});
	    };
	    $scope.load_more = function () {
	        loadCommunities(++$scope.current_page);
	    };
	    //选择组织条件
		$scope.get_checked_community = function (id) {
	        $scope.community_id = id;
	        $scope.current_page = 1;
	        $scope.tableParams.page($scope.current_page);
	        $scope.tableParams.reload();
		};
		//切换组织条件
		$('#org_tab_baz a').click(function (e) {
	    	e.preventDefault();
	    	$(this).tab('show');
	    	var id = $(this).attr('id');
	    	if (id === 'committee') {
	    		$scope.$apply(function () {
	    			$scope.communities = [];
    				$scope.community_set = {};
    				$scope.search_params.org_type = 'committee';
    				$scope.current_page = 1;
	    			loadCommunities($scope.current_page);
	    		});
	    	} else if (id === 'union') {
	    		$scope.$apply(function () {
	    			$scope.communities = [];
    				$scope.community_set = {};
    				$scope.search_params.org_type = 'union';
    				$scope.current_page = 1;
	    			loadCommunities($scope.current_page);
	    		});
	    	} else if (id === 'tissue') {
	    		$scope.$apply(function () {
	    			$scope.communities = [];
    				$scope.community_set = {};
    				$scope.search_params.org_type = 'tissue';
    				$scope.current_page = 1;
	    			loadCommunities($scope.current_page);
	    		});
	    	} else {
	    		$scope.$apply(function () {
	    			$scope.communities = [];
    				$scope.community_set = {};
    				$scope.search_params.org_type = 'organization';
    				$scope.current_page = 1;
	    			loadCommunities($scope.current_page);
	    		});
	    	}
	    });
	    //获取集市类型
	    var getBazType = function (bazaar_type_api) {
	    	$http.get(bazaar_type_api)
	    		.success(function (data) {
	    			$scope.bazaar_type = data;
					angular.forEach($scope.bazaar_type, function (bazaar) {
						bazaar.chosen = false;
					});
	    		});
	    };
	    //选择集市类型条件
	    $scope.choseBazaarType = function (type) {
	    	if (type.chosen) {
	    		type.chosen = false;
	    		angular.forEach($scope.bazaar_alias_arr, function (value, index) {
	    			if (value === type.alias) {
	    				$scope.bazaar_alias_arr.splice(index, 1);
	    			}
	    		});
	    		console.log($scope.bazaar_alias_arr);
	    		$scope.tableParams.page(1);
				$scope.tableParams.reload();
	    	} else {
	    		type.chosen = true;
	    		$scope.bazaar_alias_arr.push(type.alias);
	    		console.log($scope.bazaar_alias_arr);
	    		$scope.tableParams.page(1);
				$scope.tableParams.reload();
	    	}
	    };
	    //获取集市列表
	    var loadBazaars = function () {
	    	var NgTableParams = ngTableParams;
	    	var bazaars = null;
	    	$scope.tableParams = new NgTableParams({
	    		page: 1,
	    		count: 10
	    	}, {
	    		counts: [],
	    		total: 0,
	    		getData: function ($defer, params) {
	    			var request_param = '?page='+params.page() + '&per_page=' + params.count();
	    			if ($scope.community_id !== '') {
	    				request_param += '&community_id=' + $scope.community_id;
	    			}
					if ($scope.bazaar_alias_arr.length !== 0) {
						var bazaar_alias = '';
						angular.forEach($scope.bazaar_alias_arr, function (value, index) {
							if (index !== $scope.bazaar_alias_arr.length - 1) {
								bazaar_alias += value + '-';
							} else {
								bazaar_alias += value;
							}
						});
						request_param += '&bazaar_type=' + bazaar_alias;
					}

	    			$http.get($scope.bazaar_list_api + request_param)
	    				.success(function (data) {
	    					bazaars = data.items;
	    					params.total(data.total);
	    					$defer.resolve(bazaars);
	    				});
	    		}
	    	});
	    };
	    //获取发布总数
	    var getBazCount = function (university_id) {
	    	$http.get('/api/iwx/university/bazaar/' + university_id + '/count')
	    		.success(function (data) {
	    			console.log(data);
	    			$scope.org_count = data.admin;
	    			$scope.personal_count = data.user;
	    			$scope.sum = data.admin + data.user;
	    		});
	    };
	    userService.load(true)
	    	.then(function (user) {
	    		//条件搜索参数对象
		    	$scope.search_params = {
		    		org_type: 'committee'
		    	};
	    		load_geography();
	    	});
	    var reloadBazaar = function () {
	    	$scope.tableParams.reload();
	    };
		//取消发布操作
		$scope.unPubBazaar = function (university_id, type, bazaar_id) {
			$modal.open({
				templateUrl: 'partial/common/unpublished_reason.html',
				controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
					if (type === 'USER') {
						$scope.reason_title = '删除理由';
					} else {
						$scope.reason_title = '取消发布理由';
					}
	                $scope.$watch('content', function (value) {
	                    if (value) {
	                        $scope.ok_btn = false;
	                    } else {
	                        $scope.ok_btn = true;
	                    }
	                });
					$scope.ok = function () {
						$http.post('/api/iwx/' + university_id + '/bazaar/' + bazaar_id + '/unpublish?b_type=' + type, { content: $scope.content})
							.success(function (data) {
								$modalInstance.close('ok');
								reloadBazaar();
							});
					};
					$scope.cancel = function () {
	                    $modalInstance.dismiss('cancel');
	                };
				}]
			});
		};
		//查看发布者信息
		$scope.publisherInfo = function (publisher_id, flag) {
			console.log(flag);
			$modal.open({
				templateUrl: 'partial/bazaar/iwx/publisher_info.html',
				controller: 'PublisherInfoCtrl',
				resolve: {
					publisherId: function () {
						return publisher_id;
					},
					flag: function () {
						return flag;
					}
				}
			});
		};
		$scope.goToBazDetail = function (bazaar_id, bazaar_type) {
			console.log(bazaar_id);
			var root_url = '';
			if (bazaar_type === 'GIVE') {
				root_url = 'sale_bazaar';
			} else if (bazaar_type === 'BUY') {
				root_url = 'purchase_bazaar';
			} else if (bazaar_type === 'LOSE') {
				root_url = 'lost_bazaar';
			} else {
				root_url = 'pick_bazaar';
			}
			$state.go(root_url, {
				'id': bazaar_id
			});
		};
	});