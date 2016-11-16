angular.module('iwx')
	.controller('BatchListCtrl', function ($scope, $rootScope, $http, origin, ngTableParams, $stateParams, eventType, $modal) {
		$scope.page = $stateParams.page;
		//记录设备勾选状态
		$scope.deviceChosenHash = {};
		//选中设备id
		$scope.deviceChosenId = [];
		//记录页码和全选对应
		$scope.pageChosenAllHash = {};
		//定义当前页码
		$scope.currentPage = 1;
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
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 5
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http.get(origin.DESTINATION.name + '/v1/customer/screens?page=' + params.page() + '&per_page=' + params.count(), {
						'Origin' : origin.ORIGIN,
						'headers': {
							'Authentication-Token': $scope.auth_token
						}
					}).success(function (data) {
						$scope.currentPage = params.page();
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
						$scope.devices = data.items;
						params.total(data.total);
						$defer.resolve($scope.devices);
						if ($scope.pageChosenAllHash[$scope.currentPage]) {
							$scope.chosenAllDev = true;
						} else {
							$scope.chosenAllDev = false;
						}
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
		
		//获取选中的计划
		$scope.$on('mulSelect:change', function (event, plans) {
			console.log(plans);
			$scope.plans = plans;
		});
		//勾选全部设备
		$scope.chooseAllDevice = function (chosen_all_dev) {
			if (chosen_all_dev) {
				$scope.pageChosenAllHash[$scope.currentPage] = true;
				$scope.chosenAllDev = true;
				angular.forEach($scope.devices, function (value, key) {
					if (!$scope.deviceChosenHash[value.id]) {
						$scope.deviceChosenHash[value.id] = true;
						$scope.deviceChosenId.push(value.id);
					}
				});
				
			} else {
				$scope.pageChosenAllHash[$scope.currentPage] = false;
				$scope.chosenAllDev = false;
				angular.forEach($scope.devices, function (value, key) {
					var device = value;
					angular.forEach($scope.deviceChosenId, function (value, key) {
						if (device.id === value) {
							$scope.deviceChosenId.splice(key, 1);
							$scope.deviceChosenHash[value] = false;
						}
					});
				});
			}
		};
		//勾选设备
		$scope.chooseDevice = function (chosen_dev, chosen_dev_id) {
			//当选中设备时
			if (chosen_dev) {
				$scope.deviceChosenHash[chosen_dev_id] = true;
				$scope.deviceChosenId.push(chosen_dev_id);
			} else {
				angular.forEach($scope.deviceChosenId, function (value, key) {
					if (value === chosen_dev_id) {
						$scope.deviceChosenHash[value] = false;
						$scope.deviceChosenId.splice(key, 1);
					}
				});
				$scope.pageChosenAllHash[$scope.currentPage] = false;
				$scope.chosenAllDev = false;
			}
			console.log($scope.deviceChosenHash);
			console.log($scope.deviceChosenId);
		};
		//记录全选框勾选状态
		$scope.chooseAll = function () {
			return $scope.chosenAllDev;
		};
		//记录每条设备的勾选状态
		$scope.choose = function (device_id) {
			if ($scope.chosenAllDev) {
				return true;
			} else {
				return $scope.deviceChosenHash[device_id];
			}
			
		};
		$scope.validate = function (type) {
			if ($scope.deviceChosenId.length === 0) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请选择要操作的设备。'
				});
				return false;
			}
			if (type === 'bindingPlans') {
				if (!$scope.plans) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '警告',
						'message': '请选择添加的开关机计划。'
					});
					return false;
				}
			}
			return true;
		};
		//绑定设备和计划
		$scope.bindPlanAndDevice = function () {
			if (!$scope.validate('bindingPlans')) {
				return;
			}
			var params = {};
			params['screens'] = $scope.deviceChosenId;
			params['plans'] = $scope.plans;
			console.log(params);
			$http.post(origin.DESTINATION.name + '/v1/customer/screens/plans', params, {
				'Origin' : origin.ORIGIN,
				'headers': {
					'Authentication-Token': $scope.auth_token
				}
			}).success(function (data) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '信息',
					'message': '操作成功。'
				});
				$scope.tableParams.reload();
			});
		};
		//重启设备
		$scope.resetDevices = function () {
			if (!$scope.validate('resetDevice')) {
				return;
			}
			var param = {};
			param['screens'] = $scope.deviceChosenId;
			console.log(param);
			$http.post(origin.DESTINATION.name + '/v1/customer/screens?action=restart', param, {
				'Origin' : origin.ORIGIN,
				'headers': {
					'Authentication-Token': $scope.auth_token
				}
			}).success(function (data) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '信息',
					'message': '成功重启选中设备。'
				});
			});
		};
	});