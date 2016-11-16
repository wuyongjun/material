angular.module('iwx')
	.controller('BazListUnCtrl', function ($scope, $http, $modal, $state, ngTableParams, userService, $rootScope, eventType) {
		console.log($state.current.url);
		$scope.current_page = 1;
		$scope.load_btn = '加载更多~~';
		//社团数组
		$scope.communities = [];
		$scope.community_set = {};
		//组织类型对照表
		$scope.org_type = {
			'committee': '院系团委',
	   		'tissue': '院系学生会',
	   		'organization': '校级学生组织',
	   		'union': '学生社团'
		};
		//集市列表参数
		$scope.bazaar_alias_arr = [];
		$scope.community_id = '';
		//切换各级组织
		$('#org_tab a').click(function (e) {
	    	e.preventDefault();
	    	$(this).tab('show');
	    	var id = $(this).attr('id');
	    	if (id === 'committee') {
	    		$scope.$apply(function () {
	    			$scope.communities = [];
    				$scope.community_set = {};
    				$scope.c_type = 'committee';
    				$scope.current_page = 1;
	    			loadUniversityCommunities($scope.current_page);
	    		});
	    	} else if (id === 'union') {
	    		$scope.$apply(function () {
	    			$scope.communities = [];
    				$scope.community_set = {};
    				$scope.c_type = 'union';
    				$scope.current_page = 1;
	    			loadUniversityCommunities($scope.current_page);
	    		});
	    	} else if (id === 'tissue') {
	    		$scope.$apply(function () {
	    			$scope.communities = [];
    				$scope.community_set = {};
    				$scope.c_type = 'tissue';
    				$scope.current_page = 1;
	    			loadUniversityCommunities($scope.current_page);
	    		});
	    	} else {
	    		$scope.$apply(function () {
	    			$scope.communities = [];
    				$scope.community_set = {};
    				$scope.c_type = 'organization';
    				$scope.current_page = 1;
	    			loadUniversityCommunities($scope.current_page);
	    		});
	    	}
	    });
	    //加载组织社团
	    var loadUniversityCommunities = function (page) {
	    	$http
	            .get('/api/un/community?page=' + page + '&per_page=12&c_type=' + $scope.c_type)
	            .success(function (data) {
	                if (data.items.length === 0) {
	                    if (page === 1) {
	                    	$scope.msg = false;
	                    	if ($scope.c_type === 'organization') {
	                    		$scope.load_msg = '暂时没有更多' + $scope.org_type[$scope.c_type] + '~~';
	                    	} else {
	                    		$scope.load_msg = '暂时没有更多' + $scope.org_type[$scope.c_type] + '组织~~';
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
	                // $scope.show_community = true;
	                var add = 0;
	                angular.forEach(data.items, function (value) {
	                    if (!(value.id in $scope.community_set)) {
	                        $scope.community_set[value.community.id] = true;
	                        $scope.communities.push(value.community);
	                        add++;
	                    }
	                });
	                if (add === 0) {
	                    loadUniversityCommunities(++$scope.current_page);
	                }
	            });
	    };
	    $scope.loadMore = function () {
	        loadUniversityCommunities(++$scope.current_page);
	    };
	    //选择社团
	    $scope.getCheckedCommunity = function (checked_community) {
	    	// console.log(checked_community);
	    	$scope.community_id = checked_community;
	    	$scope.tableParams.page(1);
	    	$scope.tableParams.reload();
	    };
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
	    //加载集市消息表格
	    var loadBazaars = function () {
	    	// Avoid lint complain
		    var NgTableParams = ngTableParams;
		    var bazaars = null;
		    $scope.tableParams = new NgTableParams({
		        page: 1,
		        count: 10,
		    }, {
		        counts: [],
		        total: 0,
		        getData: function($defer, params) {
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
		        	console.log($scope.bazaar_list_api + request_param);
		            $http.get($scope.bazaar_list_api + request_param)
		                .success(function(data) {
		                bazaars = data.items;
		                params.total(data.total);
		                $defer.resolve(bazaars);
		            });
		        }
		    });
	    };
	    //获取集市消息发布总数
	    var getBazCount = function () {
	    	$http.get('/api/un/university/bazaar/count')
	    		.success(function (data) {
	    			console.log(data);
	    			$scope.org_count = data.admin;
	    			$scope.personal_count = data.user;
	    		});
	    };
	    userService.load(true)
	    	.then(function (user) {
	    		var bazaar_type_api = '';
	    		if (user.admin_type === 'COMMITTEE') {
	    			$scope.c_type = 'committee';
	    		} else {
	    			$scope.c_type = 'union';
	    		}
	    		if ($state.current.url === '/bazaar') {
	    			$scope.bazaar_list_api = '/api/un/community/bazaars';
	    			bazaar_type_api = '/api/admin/bazaar/type';
	    			loadUniversityCommunities($scope.current_page);
	    		} else {
	    			$scope.bazaar_list_api = '/api/un/bazaar/user';
	    			bazaar_type_api = '/api/bazaars/type';
	    		}
	    		getBazType(bazaar_type_api);
	    		loadBazaars();
	    		getBazCount();
	    	});
	    var reloadBazaar = function () {
	    	$scope.tableParams.reload();
	    };
		//取消发布操作
		$scope.unPubBazaar = function (bazaar_id, publisher_id, flag) {
			$modal.open({
				templateUrl: 'partial/common/unpublished_reason.html',
				controller: ['$scope', '$rootScope', '$modalInstance', function ($scope, $rootScope, $modalInstance) {
					if (flag === 'USER') {
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
						$http.post('/api/un/bazaar/' + bazaar_id + '/unpublish?b_type=' + flag, { content: $scope.content })
							.success(function (data) {
								$modalInstance.dismiss('cancel');
								reloadBazaar();
							});
					};
					$scope.cancel = function () {
	                    $modalInstance.dismiss('cancel');
	                };
				}]
			});
		};
		//获取发布者信息
		$scope.publisherInfo = function (publisher_id, flag) {
			$modal.open({
				templateUrl: 'partial/bazaar/university/publisher_info.html',
				controller: 'PublisherInfoUnCtrl',
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
		$scope.$on('flushBazaarList', function () {
			$scope.tableParams.reload();
			getBazCount();
		});
	});