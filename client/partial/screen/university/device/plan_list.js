angular.module('iwx')
	.controller('PlanListCtrl', function ($scope, $rootScope, $http, $stateParams, origin, $state, eventType) {
		$scope.page = $stateParams.page;
		var weekTable = {'1': '周一', '2': '周二', '3': '周三', '4': '周四', '5': '周五', '6': '周六', '7': '周日'};
		$scope.confirm = {};
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';

		$scope.getPlans = function () {
			$http.get(origin.DESTINATION.name + '/v1/customer/plans?page=1&per_page=100', {
				'Origin' : origin.ORIGIN,
				'headers': {
					'Authentication-Token': $scope.auth_token
				}
			}).success(function (data) {
				angular.forEach(data.items, function (value, key) {
					var reWeekdays = [];
					var temp = [];
					reWeekdays = value.repeating_weekdays.split(',');
					reWeekdays.sort();
					angular.forEach(reWeekdays, function (value, key) {
						temp.push(weekTable[value]);
					});
					reWeekdays = temp;
					value.repeating_weekdays = reWeekdays.toString();
				});
				$scope.plans = data.items;
				$scope.planNumber = data.total;
			});
		};

		$http.get('/api/auth/refreshtoken')
			.success(function (response) {
				$scope.user = response.user;
				$scope.auth_token = response.auth_token;
				$scope.getPlans();
			});

		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'remove_plan') {
				$http.delete(origin.DESTINATION.name + '/v1/customer/plans/' + $scope.confirm.param, {
					'Origin' : origin.ORIGIN,
					'headers': {
						'Authentication-Token': $scope.auth_token
					}
				}).success(function (data) {
					$scope.getPlans();
				});
			}
		};
		//删除计划
		$scope.removePlan = function (plan) {
			$scope.confirm.message = '确定要移除“' + plan.name + '”?';
			$scope.confirm.type = "remove_plan";
			$scope.confirm.param = plan.id;
			$('#confirmModal').modal();
			return;
		};
		//创建计划
		$scope.createPlan = function () {
			if ($scope.planNumber === 10) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '设备最多只支持设置10个开关机计划。'
				});
				return;
			}
			$state.go('terminal_university.edit_plan', {
				page: $scope.page,
				id: -1,
				from: 'plan'
			}, {reload: true});
		};
		//修改计划
		$scope.updPlan = function (plan) {
			$state.go('terminal_university.edit_plan', {
				page: $scope.page,
				id: plan.id,
				from: 'plan'
			}, {reload: true});
		};
	});