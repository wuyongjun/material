angular.module('iwx')
	.controller('MessagesMemCtrl', function ($scope, $rootScope, $http, eventType) {
		//部门id数组
		$scope.dep_id_array = [];
		//查询到的社团成员
		$scope.members = [];
		$scope.member_set = {};
		//当前页码
		$scope.current_page = 1;
		//选中的社团id数组
		$scope.member_id_chosen = [];
		//是否显示“加载更多”按钮
		$scope.show_member = false;
		$scope.message = {};
		//获取社团部门
		$scope.getCommDep = function () {
			$http.get('/api/admin/department')
				.success(function (data) {
					for (var i=0;i<data.length;i++) {
						data[i].chosen = false;
					}
					$scope.departments = data;
				});
		};
		$scope.getCommDep();
		//发送消息
		$scope.send = function () {
			console.log($scope.member_id_chosen);
			console.log($scope.message.content);
			if ($scope.member_id_chosen.length === 0) {
				$rootScope.$emit(eventType.NOTIFICATION, {
                    'type': 'POPMSG',
                    'title': '消息',
                    'message': '请选择要发送私信的社员。'
                });
                return;
			}
			if (!$scope.message.content) {
				$rootScope.$emit(eventType.NOTIFICATION, {
                    'type': 'POPMSG',
                    'title': '消息',
                    'message': '请填写要发送的私信内容。'
                });
                return;
			}
			$scope.message['users'] = $scope.member_id_chosen;
			$http.post('/api/admin/messages/multi/members', $scope.message)
				.success(function (data) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '已经成功给选中的社员发送私信。'
					});
					$scope.message.content = '';
				});
		};
		//选择部门条件
		$scope.chose_department = function (department) {
			if (department.chosen) {
				department.chosen = false;
				//将选中的部门从过滤条件中删除
				for (var i=0;i<$scope.dep_id_array.length;i++) {
					if ($scope.dep_id_array[i] === department.id){
						$scope.dep_id_array.splice(i, 1);
						break;
					}
				}
				//加载社员
				$scope.member_set = {};
				$scope.members = [];
				$scope.current_page = 1;
				load_members($scope.current_page);
			} else {
				department.chosen = true;
				//将选中的部门添加到过滤条件中
				$scope.dep_id_array.push(department.id);
				//加载社员
				$scope.member_set = {};
				$scope.members = [];
				$scope.current_page = 1;
				load_members($scope.current_page);
			}
		};
		//选择要发送信息的社团成员
        $scope.choose_member = function (member_id, choose_item) {
            if (choose_item) {
                $scope.member_id_chosen.push(member_id);
            } else {
                for (var i = 0;i < $scope.member_id_chosen.length;i++) {
                    var temp = $scope.member_id_chosen[i];
                    if (temp === member_id) {
                        $scope.member_id_chosen.splice($scope.member_id_chosen.indexOf(temp), 1);
                    }
                }
            }
        };
        //选择查询到的所有社团进行发送私信操作
        $scope.choose_members = function (choose_all) {
            if (choose_all) {
                if ($scope.member_id_chosen.length !== 0) {
                    $scope.member_id_chosen.splice(0, $scope.member_id_chosen.length);
                }
                for (var i = 0;i < $scope.members.length; i++) {
                    var temp = $scope.members[i];
                    $scope.member_id_chosen.push(temp.id);
                }
            } else {
                $scope.member_id_chosen.splice(0, $scope.member_id_chosen.length);
            }
        };
		//加载查询到的社团
		var load_members = function (page) {
			//请求参数
            var request_param;
            if ($scope.dep_id_array.length !== 0) {
                var dep_id_str = '';
                for (var i=0;i<$scope.dep_id_array.length;i++) {
                    if (i !== $scope.dep_id_array.length - 1) {
                        dep_id_str += $scope.dep_id_array[i] + '-';
                    } else {
                        dep_id_str += $scope.dep_id_array[i] + '';
                    }
                    
                }
                request_param = '?page=' + page + '&per_page=12&department_type=' + dep_id_str;
            } else {
                request_param = '?page=' + page + '&per_page=12';
            }
        	$http
        		.get('/api/admin/community/members' + request_param)
        		.success(function (data) {
        			if (data.items.length === 0) {
        				if (page !== 1) {
                            $rootScope.$emit(eventType.NOTIFICATION, {
                                'type': 'POPMSG',
                                'title': '消息',
                                'message': '已加载全部符合条件的社员。'
                            });
                        }
        				return;
        			}
        			$scope.show_member = true;
        			var add = 0;
        			angular.forEach(data.items, function (value) {
        				if (!(value.user.id in $scope.member_set)) {
        					$scope.member_set[value.user.id] = true;
	        				$scope.members.push(value.user);
	        				add++;
        				}
        			});
                    //当全选复选框为选中状态时，添加选中的社团
                    if ($scope.choose_all) {
                        $scope.choose_members($scope.choose_all);
                    }
        			if (add === 0) {
        				load_members(++$scope.current_page);
        			}
        		});
		};
		load_members($scope.current_page);
		//加载更多
		$scope.load_more = function () {
			load_members(++$scope.current_page);
		};

		$scope.ok = function () {
			console.log($scope.input_value);
			console.log($('#input').val());
		};
	});