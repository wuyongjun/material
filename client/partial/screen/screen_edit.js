angular.module('iwx')
	.controller('ScreenEditCtrl', function ($scope, $rootScope, $http, $stateParams, origin, userService, eventType, $filter, $state, $modal) {
		$scope.page = $stateParams.page;
		$scope.server = origin.DESTINATION.name;
		$scope.editScreenId = parseInt($stateParams.id);
		var currentDate = new Date().getTime();
		var current = $filter('date')(currentDate, 'yyyy-MM-dd HH:mm');
		$scope.screen = {
			id: $scope.editScreenId,
			current: currentDate
		};
		//获取已安装的电子展板数量信息
		var getScreensNum = function () {
			$http.get(origin.DESTINATION.name + '/v1/customer/screens/numbers', {
				'Origin': origin.ORIGIN,
				'headers': {
					'Authentication-Token': $scope.auth_token
				}
			}).success(function (data) {
				$scope.screenInfo = '本校支持横装电子展板：' + data.h + '块，竖装电子展板：' + data.v + '块';
			});
		};
		$http.get('/api/auth/refreshtoken').success(function (response) {
			$scope.auth_token = response.auth_token;
			$scope.user = response.user;
			getScreensNum();
			//如果id !== -1
			if ($scope.editScreenId !== -1) {
				$http.get(origin.DESTINATION.name + '/v1/customer/contents/' + $scope.editScreenId, {
					'Origin': origin.ORIGIN,
					'headers': {
						'Authentication-Token': $scope.auth_token
					}
				}).success(function (data) {
					$scope.screen = data;
				});
			}
		});
		
		//验证
		var validate = function () {
			if (!$scope.screen.landscape_poster) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请上传横装电子展板活动专用海报。'
				});
				return false;
			} else if ($scope.screen.landscape_poster.size > 1024*1024*3) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请将上传横装电子展板活动专用海报大小控制在3M以内。'
				});
				return false;
			}
			if (!$scope.screen.portrait_poster) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请上传竖装电子展板活动专用海报。'
				});
				return false;
			} else if ($scope.screen.portrait_poster.size > 1024*1024*3) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请将上传竖装电子展板活动专用海报大小控制在3M以内。'
				});
				return false;
			}
			if (!$scope.screen.title) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请填写展板项目名称。'
				});
				return false;
			}
			var sTime = new Date($scope.screen.start_time.replace(/-/g, '/'));
			var eTime = new Date($scope.screen.end_time.replace(/-/g, '/'));
			if (Date.parse(sTime) > Date.parse(eTime)) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '结束时间必须在开始时间之后。'
				});
				return false;
			}
			if (Date.parse(sTime) === Date.parse(eTime)) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请填写开始或结束时间。'
				});
				return false;
			}
			return true;
		};
		console.log(origin.DESTINATION.name);
		//编辑
		$scope.save = function () {
			console.log($scope.screen);
			if (!validate()) {
				return;
			}
			var fd = new FormData();
			fd.append('title', $scope.screen.title);
			fd.append('start_time',$scope.screen.start_time);
			fd.append('end_time',$scope.screen.end_time);
			fd.append('landscape_poster',$scope.screen.landscape_poster);
			fd.append('portrait_poster',$scope.screen.portrait_poster);

			if ($scope.editScreenId === -1) {
				$http.post(origin.DESTINATION.name + '/v1/customer/' + $scope.user.university.id + '/editor/' + $scope.user.id + '/contents', fd, {
					'Origin': origin.ORIGIN,
					'headers': {
						'Authentication-Token': $scope.auth_token,
						'Content-Type': undefined
					}
				}).success(function (data) {
					$scope.screen = data;
					$state.go('screen', {
						reload: true
					}, {
						page: $scope.page
					});
				});
			} else {
				$http.put(origin.DESTINATION.name + '/v1/customer/' + $scope.user.university.id + '/editor/' + $scope.user.id + '/contents/' + $scope.editScreenId,
					fd, {
						'Origin' : origin.ORIGIN,
						'headers' : {
							'Authentication-Token' : $scope.auth_token,
							'Content-Type' : undefined
						}
					}).success(function (data) {
						$state.go('screen', {
							reload: true
						}, {
							page: $scope.page
						});
					});
			}
		};
		$scope.showDemo = function (image, type) {
			var modalSize = 'md';
			if (type === 'portrait_poster') {
				modalSize = 'sm';
			}
			$modal.open({
				template: '<div><img style="width:100%" src=' + image + '></div>',
				size: modalSize,
			});
		};
	});