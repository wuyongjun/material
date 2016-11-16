angular.module('iwx')
	.controller('ApproveCtrl', function ($scope, $rootScope, $http, ngTableParams, eventType, $modal, $state, $stateParams, origin, userService) {
		$scope.server = origin.DESTINATION.name;
		//获取已通过的列表
		$scope.getApproveScreens = function () {
			var NgTableParams = ngTableParams;
			var screens = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http.get(origin.DESTINATION.name + '/v1/customer/' + $scope.user.university.id + 
						'/contents?s=a&page=' + params.page() + '&per_page=' + params.count(), {
							'Origin' : origin.ORIGIN,
							'headers': {
								'Authentication-Token': $scope.auth_token
							}
						}).success(function (data) {
							screens = data.items;
							params.total(data.total);
							$defer.resolve(screens);
						});
				}
			});
		};
		$http.get('/api/auth/refreshtoken').success(function (response) {
			$scope.user = response.user;
			$scope.auth_token = response.auth_token;
			$scope.getApproveScreens();
		});
		//添加至播放列表
		$scope.addToDisplayList = function (screen) {
			$http.post('', {},{
					'Origin' : origin.ORIGIN,
					'headers': {
						'Authentication-Token': $scope.auth_token
					}
				}).success(function (data) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '已成功添加至播放列表。'
					});
				});
		};
		$scope.remove = function (screen) {
			$http.delete(origin.DESTINATION.name + '/v1/customer/' + $scope.user.university.id +
				'/contents/' + screen.id, {
					'Origin' : origin.ORIGIN,
					'headers': {
						'Authentication-Token': $scope.auth_token
					}
				}).success(function (data) {
					$scope.tableParams.reload();
				});
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
	});