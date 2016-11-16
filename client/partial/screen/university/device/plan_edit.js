angular.module('iwx')
	.controller('EditPlanCtrl', function ($scope, $rootScope, $http, $stateParams, origin, $state, eventType) {
		$scope.page = $stateParams.page;
		$scope.from = $stateParams.from;
		console.log($scope.page);
		$scope.editId = $stateParams.id;
		$scope.plan = {
			id: $scope.editId,
			sHour: 0,
			sMinute: 0,
			eHour: 0,
			eMinute: 0,
			weekdays: []
		};
		$scope.repeatWeekdays = [
			{id: '1', name: '周一', checked: false},
			{id: '2', name: '周二', checked: false},
			{id: '3', name: '周三', checked: false},
			{id: '4', name: '周四', checked: false},
			{id: '5', name: '周五', checked: false},
			{id: '6', name: '周六', checked: false},
			{id: '7', name: '周日', checked: false}
		];

		$http.get('/api/auth/refreshtoken')
			.success(function (response) {
				$scope.user = response.user;
				$scope.auth_token = response.auth_token;
				if ($scope.editId !== '-1') {
					$http.get(origin.DESTINATION.name + '/v1/customer/plans/' + $scope.editId, {
						'Origin' : origin.ORIGIN,
						'headers': {
							'Authentication-Token': $scope.auth_token
						}
					}).success(function (data) {
						$scope.plan['id'] = data.id;
						$scope.plan['name'] = data.name;
						$scope.plan['sHour'] = parseInt(data.wakeup_time.split(':')[0]);
						$scope.plan['sMinute'] = parseInt(data.wakeup_time.split(':')[1]);
						$scope.plan['eHour'] = parseInt(data.sleep_time.split(':')[0]);
						$scope.plan['eMinute'] = parseInt(data.sleep_time.split(':')[1]);
						var temp = data.repeating_weekdays.split(',');
						for (var i = 0;i < $scope.repeatWeekdays.length;i++) {
							for (var j = 0;j < temp.length;j++) {
								if ($scope.repeatWeekdays[i].id === temp[j]) {
									$scope.repeatWeekdays[i].checked = true;
									$scope.plan.weekdays.push($scope.repeatWeekdays[i].id);
								}
							}
						}
						console.log($scope.repeatWeekdays);
						console.log($scope.plan);
					});
				}
			});
		//选择重复周期
		$scope.chooseWeekday = function (weekday_id, choose_item) {
			console.log(weekday_id);
			console.log(choose_item);
			if (choose_item) {
				$scope.plan.weekdays.push(weekday_id);
			} else {
				angular.forEach($scope.plan.weekdays, function (value, key) {
					if (weekday_id === value) {
						$scope.plan.weekdays.splice(key, 1);
					}
				});
			}
			$scope.plan.weekdays.sort();
			console.log($scope.plan.weekdays);
		};
		//验证参数
		var validate = function () {
			if (!$scope.plan.name) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请填写计划名称。'
				});
				return false;
			}
			if (($scope.plan.sHour === $scope.plan.eHour && $scope.plan.sMinute === $scope.plan.eMinute) ||
				$scope.plan.sHour < 0 || $scope.plan.sHour > 23 ||
				$scope.plan.sMinute < 0 || $scope.plan.sMinute > 59 ||
				$scope.plan.eHour < 0 || $scope.plan.eHour > 23 ||
				$scope.plan.eMinute < 0 || $scope.plan.eMinute > 59) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '警告',
						'message': '请正确输入开始时间或结束时间。'
					});
					return false;
			}
			if ($scope.plan.sHour > $scope.plan.eHour) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '开始时间应小于结束时间。'
				});
				return false;
			} else {
				if ($scope.plan.sHour === $scope.plan.eHour && $scope.plan.sMinute > $scope.plan.eMinute) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '警告',
						'message': '开始时间应小于结束时间。'
					});
					return false;
				}
			}
			if ($scope.plan.weekdays.length === 0) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请选择重复周期。'
				});
				return false;
			}
			return true;
		};
		//保存计划
		$scope.savePlan = function () {
			if (!validate()) {
				return;
			}

			var params = {};
			params['name'] = $scope.plan.name;
			var sHour = $scope.plan.sHour, sMinute = $scope.plan.sMinute, eHour = $scope.plan.eHour, eMinute = $scope.plan.eMinute;
			if ($scope.plan.sHour < 10) {
				sHour = '0' + sHour;
			}
			if ($scope.plan.sMinute < 10) {
				sMinute = '0' + sMinute;
			}if ($scope.plan.eHour < 10) {
				eHour = '0' + eHour;
			}
			if ($scope.plan.eMinute < 10) {
				eMinute = '0' + eMinute;
			}
			params['wakeup_time'] = sHour + ':' + sMinute;
			params['sleep_time'] = eHour + ':' + eMinute;
			params['repeating_weekdays'] = $scope.plan.weekdays.toString();
			
			if ($scope.editId === '-1') {
				//创建计划
				$http.post(origin.DESTINATION.name + '/v1/customer/plans', params, {
					'Origin': origin.ORIGIN,
					'headers': {
						'Authentication-Token': $scope.auth_token
					}
				}).success(function (data) {
					if ($scope.from === 'plan') {
						$state.go('terminal_university.plans', {
							page: $scope.page
						}, {
							reload: true
						});
					} else {
						$state.go('terminal_university.device', {
							page: $scope.page
						}, {
							reload: true
						});
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type': 'POPMSG',
							'title': '信息',
							'message': '成功创建计划，请重新为需要的设备指定计划。'
						});
					}
				});
			} else {
				//修改计划
				$http.put(origin.DESTINATION.name + '/v1/customer/plans/' + $scope.editId, params, {
					'Origin': origin.ORIGIN,
					'headers': {
						'Authentication-Token': $scope.auth_token
					}
				}).success(function (data) {
					$state.go('terminal_university.plans', {
						page: $scope.page
					}, {
						reload: true
					});
				});
			}
		};
	});