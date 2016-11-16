angular.module('iwx')
	.controller('SetPlanCtrl', function ($scope, $rootScope, $http, origin, screenId, plans, page, $state, $modalInstance) {
		$scope.screenId = screenId;
		$scope.weekdayTable = {
			'1': '周一',
			'2': '周二',
			'3': '周三',
			'4': '周四',
			'5': '周五',
			'6': '周六',
			'7': '周日'
		};
		
		$scope.getPlans = function () {
			$http.get(origin.DESTINATION.name + '/v1/customer/plans?page=1&per_page=100', {
				'Origin' : origin.ORIGIN,
				'headers': {
					'Authentication-Token': $scope.auth_token
				}
			}).success(function (data) {
				$scope.planNumber = data.total;
				angular.forEach(data.items, function (value, key) {
					if ($scope.planExistTable[value.id]) {
						value['checked'] = true;
					} else {
						value['checked'] = false;
					}
					var weekdayTemp = value.repeating_weekdays.split(',');
					var tempArr = [];
					angular.forEach(weekdayTemp, function (value, key) {
						tempArr.push($scope.weekdayTable[value]);
					});
					value.repeating_weekdays = tempArr.toString();
				});
				console.log(data);
				$scope.plans = data.items;
			});
		};

		$scope.DealplanExist = function (plans_exist) {
			$scope.planExistTable = {};
			$scope.plansId = [];
			angular.forEach(plans_exist, function (value, key) {
				$scope.planExistTable[value.id] = value;
				$scope.plansId.push(value.id);
			});
			console.log($scope.planExistTable);
			console.log($scope.plansId);
		};

		$http.get('/api/auth/refreshtoken')
			.success(function (response) {
				$scope.user = response.user;
				$scope.auth_token = response.auth_token;
				$scope.DealplanExist(plans);
				$scope.getPlans();
			});

		//选择计划
		$scope.choosePlan = function (plan_id, checked_item) {
			if (checked_item) {
				$scope.plansId.push(plan_id);
			} else {
				angular.forEach($scope.plansId, function (value, key) {
					if (plan_id === value) {
						$scope.plansId.splice(key, 1);
					}
				});
			}
			console.log($scope.plansId);
		};
		//确定变更计划
		$scope.ok = function () {
			var param = {
				plans: $scope.plansId
			};
			$http.put(origin.DESTINATION.name + '/v1/customer/screens/' + screenId + '/plans', param, {
				'Origin' : origin.ORIGIN,
				'headers': {
					'Authentication-Token': $scope.auth_token
				}
			}).success(function (data) {
				$rootScope.$broadcast('getDeviceList');
				$modalInstance.close('ok');
			});
		};
		//关闭窗口
		$scope.cancel = function () {
			$modalInstance.close('ok');
		};
		//创建计划
		$scope.createPlan = function () {
			$modalInstance.close('ok');
			$state.go('terminal_university.edit_plan', {
				page: page,
				id: -1,
				from: 'device'
			});
		};
	});