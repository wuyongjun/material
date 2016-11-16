angular.module('iwx')
	.controller('InterCutCtrl', function ($scope, $rootScope, $http, $state,$stateParams, origin, userService, eventType, $filter, $modal) {
		console.log($state);
		$scope.page = $stateParams.page;
		$scope.router = $stateParams.router;
		$scope.screen = {};
		//获取等级列表
		var getLevels = function () {
			$http.get(origin.DESTINATION.name + '/v1/customer/priorities/?page=1&per_page=100', {
				'Origin' : origin.ORIGIN,
				'headers': {
					'Authentication-Token': $scope.auth_token
				}
			}).success(function (data) {
				$scope.levels = data.items;
			});
		};
		$http.get('/api/auth/refreshtoken').success(function (response) {
			$scope.user = response.user;
			$scope.auth_token = response.auth_token;
			getLevels();
		});
		var validate = function () {
			if (!$scope.screen.title) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请填写展板项目名称。'
				});
				return false;
			}
			if (!$scope.screen.priority) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请选择播放等级。'
				});
				return false;
			}
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
			return true;
		};
		$scope.save = function () {
			console.log($scope.screen);
			if (!validate()) {
				return;
			}
			// var currentTime = new Date();
			var fd = new FormData();
			fd.append('title', $scope.screen.title);
			// fd.append('start_time', $filter('date')(currentTime, 'yyyy-MM-dd HH:mm'));
			// fd.append('end_time', $filter('date')(currentTime, 'yyyy-MM-dd HH:mm'));
			fd.append('landscape_poster', $scope.screen.landscape_poster);
			fd.append('portrait_poster', $scope.screen.portrait_poster);
			fd.append('to', 'spots');
			fd.append('priority_id', $scope.screen.priority.id);
			$http.post(origin.DESTINATION.name + '/v1/customer/' + $scope.user.university.id + '/chief_editor/' +
				$scope.user.id + '/contents', fd, {
					'Origin': origin.ORIGIN,
					'headers': {
						'Authentication-Token': $scope.auth_token,
						'Content-Type': undefined
					}
				}).success(function (data) {
					//为创建插播，跳转至播放列表
					$state.go('terminal_university.display_log', {
						page: 1
					}, {
						reload: true
					});
					
				});
			
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
