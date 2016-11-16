angular.module('iwx')
	.controller('MessageUniversityCtrl', function ($scope, $rootScope, $http, $modal, ngTableParams, eventType, $state) {
		$rootScope.welcome_bg = false;
		//确认框参数
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		//社团id数组
		$scope.community_id_array = [];
		//选中社团的hash对照表
		$scope.community_id_hash = {};
		var hashtable = {};
		//定义变量，用来记录当前页码信息
		var current_page = 1;
		//定义页码和全选状态对照表
		var page_check_all_hash = {};
		//加载社团信息表格
		var load_message_communities = function () {
			var NgTableParams = ngTableParams;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 5
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http
						.get('/api/un/message?page=' + params.page() + '&per_page=' + params.count())
						.success(function (data) {
							//给当前页码变量赋值
							current_page = params.page();
							//处理服务器返回数据
							$scope.communitys = data.items;
							params.total(data.total);
							$defer.resolve($scope.communitys);
							//控制全选框的选中状态
							if (page_check_all_hash[current_page]) {
								$scope.is_checked_all = true;
							} else {
								$scope.is_checked_all = false;
							}
						});
				}
			});
		};
		load_message_communities();
		//对社团进行全部选择操作
	    $scope.get_checked_all = function (is_checked_all) {
	    	//当社团被全部选中时
	    	if (is_checked_all) {
	    		//当选中全选按钮时，进行页码和全选状态的记录
	    		page_check_all_hash[current_page] = true;
	    		for (var i = 0;i < $scope.communitys.length;i++) {
	    			var temp = $scope.communitys[i];
	    			if (!hashtable[temp.community.id]) {
	    				hashtable[temp.community.id] = true;
	    				$scope.community_id_array.push(temp.community.id);
	    			}
	    		}
	    		$scope.community_id_hash = {};
	    		$scope.is_checked_all = true;
	    	} else {
	    		//用来记录要删除的子数组的元素
	    		var hash = {};
	    		angular.forEach($scope.communitys, function (value) {
	    			hash[value.community.id] = true;
	    		});
	    		console.log('要删除的子数组hash表：' + angular.toJson(hash));
				for (var j = 0;j < $scope.community_id_array.length;j++) {
					if (hash[$scope.community_id_array[j]]) {
						delete $scope.community_id_array[j];
					}
				}
	    		//当取消全选按钮时，进行页码和全选状态的记录
	    		page_check_all_hash[current_page] = false;
	    		hashtable = {};
	    		// $scope.community_id_array.splice(0, $scope.community_id_array.length);
	    		$scope.is_checked_all = false;
	    	}
	    };
	    //对社团进行单个选择操作
	    $scope.get_checked_item = function (community_id, is_checked_item) {
	    	//当社团被选中时
	    	if (is_checked_item) {
	    		hashtable[community_id] = true;
	    		$scope.community_id_hash[community_id] = true;
	    		$scope.community_id_array.push(community_id);
	    	} else {
	    		for (var i=0;i<$scope.community_id_array.length;i++) {
	    			var temp = $scope.community_id_array[i];
	    			if (temp === community_id) {
	    				hashtable[community_id] = false;
	    				$scope.community_id_hash[community_id] = false;
	    				$scope.community_id_array.splice($scope.community_id_array.indexOf(temp), 1);
	    				break;
	    			}
	    		}
	    	}
	    };
	    //每条记录的复选框勾选状态
	    $scope.is_checked = function (id) {
	    	if ($scope.is_checked_all) {
	    		return true;
	    	} else {
	    		return $scope.community_id_hash[id];
	    	}
	    };
	    //全选复选框勾选状态
	    $scope.checked_all = function () {
	    	return $scope.is_checked_all;
	    };
		//操作确认提示
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delete_information') {
				$http
					.delete('/api/un/' + $scope.confirm.param + '/message/del')
					.success(function () {
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type': 'POPMSG',
							'title': '消息',
							'message': '成功删除与该社团的通信记录。'
						});
						$scope.tableParams.reload();
					});
			}
		};
		//删除通信记录
		$scope.delete_information = function (community_id) {
			$scope.confirm.message = '您确定要删除这个社团相关的通信记录？';
            $scope.confirm.type = 'delete_information';
            $scope.confirm.param = community_id;
            $("#confirmModal").modal();
            return;
		};
		//打开私信对话框
		var open_dialog = function (url, community_id, category) {
			$modal.open({
				templateUrl: 'partial/message/message_iWX/message_iWX_letter.html',
				controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
					$scope.ok = function () {
						console.log(url);
						var letter = {};
						if (category === 'item') {
							letter['community_id'] = community_id;
						} else {
							letter['communities'] = community_id;
						}
						letter['content'] = $scope.content;
						console.log(letter);
						$http
							.post(url, letter)
							.success(function () {
								$rootScope.$emit(eventType.NOTIFICATION, {
									'type': 'POPMSG',
									'title': '消息',
									'message': '已经成功向社团管理员发送信息。'
								});
								$modalInstance.close('ok');
							});
					};
					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};
				}]
			});
		};
		//私信
		//向选中的社团发送信息
		$scope.private_letter = function (community_id, category) {
			if (category === 'all') {
				var community_ids_parma = {
					'community_ids': []
				};
				console.log('社团id原数组：' + angular.toJson($scope.community_id_array));
				angular.forEach($scope.community_id_array, function (value) {
					if (value) {
						community_ids_parma.community_ids.push(value);
					}
				});
				console.log('要发送的社团id数组参数为：' + angular.toJson(community_ids_parma));
				if (community_ids_parma.community_ids.length === 0) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '请选择要发送私信的社团。'
					});
					return;
				}
				open_dialog('/api/un/multi/message/create', community_ids_parma.community_ids, category);
			} else if (category === 'item') {
				console.log('向某个社团发送私信：' + community_id);
				open_dialog('/api/un/single/message/create', community_id, category);
			}
		};

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
		//进入聊天信息页面
		$scope.go_to_message = function (community_id) {
			$state.go('message_university.message_uni_to_community', {
				'id': community_id
			});
		};
	});