angular.module('iwx')
	.controller('PartySigninCtrl', function ($scope, $http, userService, $state, eventType, $rootScope, $filter) {
		//当前页
		$scope.currentPage = 1;
		$scope.loadBtn = '加载更多';
		$scope.saveBtn = '创建';
		$scope.persons = [];
		$scope.personSet = {};
		//选中的人员id， 即要添加的人员id数组
		$scope.personIdChosen = [];
		//取消选中的人员id，即可能要删除的人员id数组，要和已保存在数据库中的参与人员id进行对比
		$scope.personIdRemove = [];
		//人员查询条件
		var allDuties = [];
		var partDuties = [];
		var allGroups = [];
		var partGroups = [];
		$scope.persons = [];
		//签到信息
		$scope.signIn = {};
		$scope.sponser_name = /^[\u4e00-\u9fa5_\x21-\x7e_\u0b7-\uff1f_\s]{0,15}$|^[\w\s_\x21-\x7e]{0,30}$/;
		//获取活动信息
		$http.get('/api/admin/activities/' + $scope.$parent.activity.id)
			.success(function (data) {
				$scope.activity = data;
				$scope.signIn['activity_id'] = $scope.activity.id;

				angular.forEach($scope.activity.plugins, function (value, key) {
					if (value.id === 'political_sign_in' && value.enabled === true && value.preview && value.preview.id) {
						$scope.signIn.id = value.preview.id;
					}
				});
				if ($scope.signIn.id) {
					$http.get('/api/political_sign/' + $scope.signIn.id)
						.success(function (data) {
							$scope.signIn = data;
							// $scope.update = true;
							$scope.saveBtn = '更新';
							if ($scope.signIn.participant) {
								$scope.signIn.participant = 'isPart';
								getParticipant();
							} else {
								$scope.signIn.participant = 'isNotPart';
							}
							if ($scope.signIn.online) {
								$scope.signIn['modal'] = 'online';
							} else {
								$scope.signIn['modal'] = 'offline';
							}
						});
				} else {
					$scope.signIn.sign_in_start_time = $scope.activity.start_time;
					$scope.signIn.end_time = $scope.activity.end_time;
				}
			});
		//组装签到插件参数
		var getSignFormData = function (flag) {
			var fd = new FormData();
			fd.append('activity_id', $scope.signIn.activity_id);
			console.log( $scope.signIn.end_time);
			console.log(typeof $scope.signIn.end_time);
			if (typeof $scope.signIn.end_time === 'number') {
				fd.append('end_time', $filter('date')($scope.signIn.end_time, 'yyyy-MM-dd HH:mm'));
			} else {
				fd.append('end_time', $scope.signIn.end_time);
			}
			fd.append('sponsor_name', $scope.signIn.sponsor_name);
			fd.append('sponsor_logo', $scope.signIn.sponsor_logo);
			if (flag === 'update') {
				if ($scope.signIn.participant === 'isPart') {
					fd.append('participant', 1);
				} else {
					fd.append('participant', 0);
				}
								
				if ($scope.signIn.modal === 'online') {
					fd.append('online', 1);
				} else {
					fd.append('online', 0);
				}
				
			}
			return fd;
		};
		$scope.validation = function() {
			if($scope.signIn.end_time == null || $scope.signIn.end_time === "") {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '消息',
					'message': '请正确输入结束时间'
				});
				return false;
			}
			if (!$scope.sponser_name.test($scope.signIn.sponsor_name)) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '消息',
					'message': '请将赞助商名称限制在15个汉字以内！'
				});
				return false;
			}
			return true;
		};
    	//保存签到插件
    	$scope.save = function () {
    		console.log($scope.signIn.id);
    		if ($scope.signIn.id && $scope.signIn.id !== -1) {
    			$scope.change();
    		} else {
    			$scope.create();
    		}
    	};
		//创建签到插件
		$scope.create = function () {
			if (!$scope.validation()) {
				return;
			}
			$http.post('/api/political_sign/sign/create', getSignFormData('create'), {
				headers: {
					'Content-Type': undefined
				}
			}).success(function(data) {
				if (data.participant) {
					data.participant = 'isPart';
				} else {
					data.participant = 'isNotPart';
				}
				if (data.online) {
					data.modal = 'online';
				} else {
					data.modal = 'offline';
				}
				// $scope.update = true;
				$scope.saveBtn = '更新';
				$scope.signIn = data;
			});
		};
		//修改插件
		$scope.change = function () {
			//此处可以根据$scope.signIn.participant判断是否调用绑定指定参与人接口
			console.log($scope.signIn.participant);
			if (!$scope.validation()) {
				return;
			}
			$http.put('/api/political_sign/sign/' + $scope.signIn.id + '/update', getSignFormData('update'), {
				headers: {
					'Content-Type': undefined
				}
			}).success(function(data) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '消息',
					'message': '功能更新完毕！'
				});
				$scope.signIn = data;
				if ($scope.signIn.participant) {
					$scope.signIn.participant = 'isPart';
					$scope.currentPage = 1;
					getParticipant();
				} else {
					$scope.signIn.participant = 'isNotPart';
				}
				if ($scope.signIn.online) {
					$scope.signIn['modal'] = 'online';
				} else {
					$scope.signIn['modal'] = 'offline';
				}
				
			});
		};
		//获取学年查询条件
		var getDuties = function () {
			$http.get('/api/political/duties?page=1&per_page=1000')
				.success(function (data) {
					data.items.unshift({id: -1, name: '全部', checked: true});
					if (data.total > 7) {
						partDuties = data.items.slice(0, 7);
					} else {
						partDuties = data.items;
					}
					allDuties = data.items;
					$scope.duties = partDuties;
				});
		};
		//选中职务
		$scope.getCheckedDuty = function (duty_id) {
			$scope.dutyId = duty_id;
			$scope.persons = [];
			$scope.personSet = {};
			$scope.currentPage = 1;
			getPersons($scope.currentPage);
		};
		//获取分组查询条件
		var getGroups = function () {
			$http.get('/api/political/groups?page=1&per_page=1000')
				.success(function (data) {
					data.items.unshift({id: -1, name: '全部', checked: true});
					if (data.total > 7) {
						partGroups = data.items.slice(0, 7);
					} else {
						partGroups = data.items;
					}
					allGroups = data.items;
					$scope.groups = partGroups;
				});
		};
		//选中分组
		$scope.getCheckedGroup = function (group_id) {
			$scope.groupId = group_id;
			$scope.persons = [];
			$scope.personSet = {};
			$scope.currentPage = 1;
			getPersons($scope.currentPage);
		};
		//获取身份信息
		var getMemberType = function () {
			$http.get('/api/political/type')
				.success(function (data) {
					$scope.identityArray = [];
					angular.forEach(data, function (value, key) {
						var obj = {};
						obj['id'] = key;
						obj['name'] = value;
						$scope.identityArray.push(obj);
					});
					$scope.identityArray.unshift({id: 'all', name: '全部', checked: true});
				});
		};
		//选中身份
		$scope.getCheckedIdentity = function (identity_id) {
			$scope.identityId = identity_id;
			$scope.persons = [];
			$scope.personSet = {};
			$scope.currentPage = 1;
			getPersons($scope.currentPage);
		};
		$scope.operDuty = '展开职务';
		$scope.operGroup = '展开分组';
		var isDutyExpand = true;
		var isGroupExpand = true;
		$scope.exOratrDuty = function () {
			if (isDutyExpand) {
				$scope.duties = allDuties;
				$scope.operDuty = '收起职务';
				isDutyExpand = false;
			} else {
				$scope.duties = partDuties;
				$scope.operDuty = '展开职务';
				isDutyExpand = true;
			}
		};
		$scope.exOratrGroup = function () {
			if (isGroupExpand) {
				$scope.groups = allGroups;
				$scope.operGroup = '收起分组';
				isGroupExpand = false;
			} else {
				$scope.groups = partGroups;
				$scope.operGroup = '展开分组';
				isGroupExpand = true;
			}
		};
		userService.load(true).then(function () {
			getDuties();
			getGroups();
			getMemberType();
		});

		//根据筛选条件获取人员
		var getPersons = function (page) {
			var url = '/api/political/users/approved/list?page=' + page + '&per_page=12';
			if ($scope.dutyId && $scope.dutyId !== '-1') {
				url += '&duty=' + $scope.dutyId;
			}
			if ($scope.groupId && $scope.groupId !== '-1') {
				url += '&group=' + $scope.groupId;
			}
			if ($scope.identityId && $scope.identityId !== 'all') {
				url += '&status=' + $scope.identityId;
			}
			$http.get(url)
				.success(function (data) {
					if (data.items.length === 0) {
						$scope.btn = true;
						$scope.loadBtn = '已经加载全部';
						return;
					}
					$scope.btn = false;
					$scope.loadBtn = '加载更多';
					angular.forEach(data.items, function (value, key) {
						if (!(value.user_obj.id in $scope.personSet)) {
							if ($scope.participantHash[value.user_obj.id]) {
								value.user_obj['checked'] = true;
							} else {
								value.user_obj['checked'] = false;
							}
							$scope.personSet[value.user_obj.id] = true;
							$scope.persons.push(value.user_obj);
						}
					});

				});
		};
		//在更新签到插件时，获取已经添加的指定签到人员
		var getParticipant = function () {
			$http.get('/api/political_sign/' + $scope.signIn.id + '/participant/users')
				.success(function (data) {
					console.log(data);
					$scope.participants = data;
					$scope.participantHash = {};
					angular.forEach($scope.participants, function (value, key) {
						$scope.participantHash[value.user_obj.user_obj.id] = value;
					});
					console.log($scope.participantHash);
					getPersons($scope.currentPage);
				});
		};
		//加载更多人员
		$scope.loadMore = function () {
			getPersons(++$scope.currentPage);
		};
		//选中人员
		$scope.getCheckedPerson = function (person_id, checked_person) {
			if (checked_person) {
				$scope.personIdChosen.push(person_id);
			} else {
				//从添加人员id数组中去掉取消勾选的人员
				angular.forEach($scope.personIdChosen, function (value, key) {
					if (value === person_id) {
						$scope.personIdChosen.splice(key, 1);
					}
				});
				//将取消勾选的人员添加多要删除的人员数组中
				if ($scope.participantHash[person_id]) {
					$scope.personIdRemove.push(person_id);
				}
			}
			console.log('要添加的人员id数组：' + $scope.personIdChosen);
			console.log('可能要删除的人员id数组：' + $scope.personIdRemove);
		};
		//保存选中的人员
		$scope.savePersons = function () {
			//新添加的人员参数
			var personParam = {};
			if ($scope.personIdChosen.length !== 0) {
				personParam['users_add'] = $scope.personIdChosen;
			}
			if ($scope.personIdRemove.length !== 0) {
				personParam['users_del'] = $scope.personIdRemove;
			}
			console.log(personParam);
			$http.post('/api/political_sign/' + $scope.signIn.id + '/modify/users', personParam)
				.success(function (data) {
					//调用更新方法更新插件
					$scope.change();
					getParticipant();
					$scope.personIdRemove = [];
					$scope.personIdChosen = [];
				});
		};
		//选择签到模式
		$scope.signInModal = function (sign_in_modal) {
			console.log(sign_in_modal);
			$scope.signIn.modal = sign_in_modal;
		};
		//选择是否指定参与者
		$scope.isSpecifyPerson = function (participant) {
			console.log(participant);
			$scope.signIn.participant = participant;
			getParticipant();
		};
		//查看签到结果
		$scope.result = function () {
			$state.go('party_act_item.political_sign_in_at_plugin', {
				signInId: $scope.signIn.id,
				isSpecify: $scope.signIn.participant
			}, {reload: true});
		};
		//结束签到插件
		$scope.finishSignIn = function () {
			$http.post('/api/political_sign/finish/' + $scope.signIn.id)
				.success(function (data) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '成功结束签到！'
					});
					$state.go('party_act_item', {
						id: $scope.activity.id
					});
				});
		};
		//暂时关闭签到
		$scope.closeSignIn = function () {
			$http.post('/api/political_sign/suspend/' + $scope.signIn.id)
				.success(function (data) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '成功关闭签到！'
					});
					$state.go('party_act_item', {
						id: $scope.activity.id
					});
				});
		};
		//删除签到
		$scope.deleteSignIn = function () {
			$http.delete('/api/political_sign/delete/' + $scope.signIn.id)
				.success(function (data) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '成功删除签到！'
					});
					$state.go('party_act_item', {
						id: $scope.activity.id
					});
				});
		};
	});