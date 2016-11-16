angular.module('iwx')
	.controller('DisplayLogCtrl', function ($scope, $rootScope, $http, ngTableParams, eventType, $modal, $state, $stateParams, origin, userService) {
		$scope.server = origin.DESTINATION.name;
		$scope.currentPage = $stateParams.page;
		$scope.getDisplayLog = function () {
			var NgTableParams = ngTableParams;
			var screens = null;
			$scope.tableParams = new NgTableParams({
				page: $scope.currentPage,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$scope.currentPage = params.page();
					$http.get(origin.DESTINATION.name + '/v1/customer/spots/?page=' + params.page() + '&per_page=' + params.count(), {
							'Origin' : origin.ORIGIN,
							'headers': {
								'Authentication-Token': $scope.auth_token
							}
						}).success(function (data) {
							// data = {items: [], total: 0};
							$scope.total = data.total;
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
			$scope.getDisplayLog();
		});
		var reloadTable = function () {
			$scope.tableParams.reload();
		};
		//再次插播
		$scope.interCut = function (screen, auth_token) {
			$http.get(origin.DESTINATION.name + '/v1/customer/priorities/?page=1&per_page=100', {
						'Origin' : origin.ORIGIN,
						'headers': {
							'Authentication-Token': $scope.auth_token
						}
					}).success(function (data) {
						var priorities = data.items;
						if (priorities.length === 0) {
							$rootScope.$emit(eventType.NOTIFICATION, {
								'type' : 'POPMSG',
								'title': '警告',
								'message': '当前无自定义播放等级，请先进行播放等级设置。'
							});
							return;
						}
						$modal.open({
							templateUrl: 'partial/screen/university/schedule/add_display_level.html',
							controller: ['$scope', '$modalInstance', 'origin', function ($scope, $modalInstance, origin) {
								$scope.title = '再次插播';
								$scope.levelArray = priorities;
								$scope.btnOk = true;
								$scope.param = {
									priority_id : 0
								};
								$scope.$watch('param.priority_id', function (value) {
									if (value !== 0) {
										$scope.btnOk = false;
									}
								});
								$scope.ok = function () {
									console.log($scope.param);
									$http.post(origin.DESTINATION.name + '/v1/customer/contents/' + screen.id + '/spot', $scope.param, {
										'Origin' : origin.ORIGIN,
										'headers' : {
											'Authentication-Token' : auth_token
										}
									}).success(function (data) {
										$modalInstance.close('ok');
										reloadTable();
									});
								};
								$scope.cancel = function () {
									$modalInstance.close('ok');
								};
							}]
						});
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