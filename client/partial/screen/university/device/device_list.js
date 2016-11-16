angular.module('iwx')
	.controller('DeviceListCtrl', function ($scope, $rootScope, $http, origin, ngTableParams, $stateParams, eventType, $modal) {
		//当前页码
		$scope.currentPage = $stateParams.page;
		$scope.weekdayTable = {
			'1': '周一',
			'2': '周二',
			'3': '周三',
			'4': '周四',
			'5': '周五',
			'6': '周六',
			'7': '周日'
		};	
		
		//获取设备信息列表
		$scope.getDeviceList = function () {
			var NgTableParams = ngTableParams;
			var devices = null;
			$scope.tableParams = new NgTableParams({
				page: $scope.currentPage,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$scope.currentPage = params.page();
					$http.get(origin.DESTINATION.name + '/v1/customer/screens?page=' + params.page() + '&per_page=' + params.count(), {
						'Origin' : origin.ORIGIN,
						'headers': {
							'Authentication-Token': $scope.auth_token
						}
					}).success(function (data) {
						angular.forEach(data.items, function (value, key) {
							var temp = value.plans;
							angular.forEach(temp, function (value, key) {
								var tempWeekdays = value.repeating_weekdays.split(',');
								var tempArr = [];
								angular.forEach(tempWeekdays, function (value, key) {
									tempArr.push($scope.weekdayTable[value]);
								});
								value.repeating_weekdays = tempArr.toString();
							});
						});
						$scope.devTotalNormal = data.total;
						devices = data.items;
						params.total(data.total);
						$defer.resolve(devices);
					});
				}
			});
		};

		$http.get('/api/auth/refreshtoken')
			.success(function (response) {
				$scope.user = response.user;
				$scope.auth_token = response.auth_token;
				$scope.getDeviceList();
			});

		//变更计划
		$scope.setPlan = function (screen_id, plans) {
			$modal.open({
				templateUrl: 'partial/screen/university/device/set_plan.html',
				controller: 'SetPlanCtrl',
				resolve: {
					screenId: function () {
						return screen_id;
					},
					plans: function () {
						return plans;
					},
					page: function () {
						return $scope.currentPage;
					}
				}
			});
		};
		//重启设备
		$scope.resetScreen = function (screen_id) {
			$http.post(origin.DESTINATION.name + '/v1/customer/screens/' + screen_id + '?action=restart', {},{
				'Origin' : origin.ORIGIN,
				'headers': {
					'Authentication-Token': $scope.auth_token
				}
			}).success(function (data) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '信息',
					'message': '成功重启设备。'
				});
			});
		};
		$scope.$on('getDeviceList', function () {
			$scope.tableParams.reload();
		});
	});