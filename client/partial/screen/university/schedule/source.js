angular.module('iwx')
	.controller('SourceCtrl', function ($scope, $rootScope, $http, ngTableParams, eventType, $modal, $state, $stateParams, origin, userService) {
		$scope.server = origin.DESTINATION.name;
		$scope.confirm = {};
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		$scope.currentPage = $stateParams.page;
		//查询素材条件
		$scope.conditions = [{
			id: 1, name: '当前有效的'
		}, {
			id: 3, name: '3天后过期'
		}, {
			id: 7, name: '7天后过期'
		}, {
			id: 15, name: '15天后过期'
		}, {
			id: 30, name: '30天后过期'
		}, {
			id: 0, name: '已过期'
		}];
		$scope.condition = {
			id: 1
		};
		//筛选素材条件
		$scope.selCondition = function () {
			console.log($scope.condition);
			$scope.tableParams.page(1);
			$scope.tableParams.reload();
		};
		//获取素材库列表
		$scope.getSourceScreens = function () {
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
					var param = '?s=l&page=' + params.page() + '&per_page=' + params.count();
					if ($scope.condition.id === 0) {
						param = param + '&expired=1';
					} else {
						if ($scope.condition.id !== 1) {
							param = param + '&leftdays=' + $scope.condition.id;
						}
					}
					$http.get(origin.DESTINATION.name + '/v1/customer/' + $scope.user.university.id + 
						'/contents' + param, {
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
			$scope.getSourceScreens();
		});
		var reloadTable = function () {
			$scope.tableParams.reload();
		};
		//确定操作
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delete') {
				$http.delete('', {
					'Origin' : origin.ORIGIN,
					'headers' : {
						'Authentication-Token' : $scope.auth_token
					} 
				}).success(function (data) {
					$scope.tableParams.reload();
				});
			}
		};
		//添加到播放列表
		$scope.addToDisplay = function (screen, auth_token) {
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
								$scope.title = '添加到播放列表';
								$scope.levelArray = priorities;
								$scope.param = {
									priority_id : 0,
									content_id : screen.id,
									notify: 1
								};
								$scope.$watch('param.priority_id', function (value) {
									if (value !== 0) {
										$scope.btnOk = false;
									}
								});
								$scope.ok = function () {
									console.log($scope.param);
									$http.post(origin.DESTINATION.name + '/v1/customer/playlist/contents/', $scope.param, {
										'Origin' : origin.ORIGIN,
										'headers' : {
											'Authentication-Token' : auth_token
										}
									}).success(function (data) {
										$modalInstance.close('ok');
										$rootScope.$emit(eventType.NOTIFICATION, {
											'type' : 'POPMSG',
											'title': '信息',
											'message': '已成功添加至播放列表。'
										});
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
		//从库中删除展板
		$scope.delete = function (screen) {
			$scope.confirm.message = '确定要从库中删除“' + screen.title + '”的信息?';
			$scope.confirm.type = "delete";
			$scope.confirm.param = screen.id;
			$('#confirmModal').modal();
			return;
		};
		//本地上传
		$scope.nativeUpload = function () {
			$state.go('terminal_university.native_upload', {
				page: $scope.currentPage
			}, {
				reload: true
			});
		};
		//设置等级
		$scope.setLevels = function () {
			$state.go('terminal_university.set_levels', {
				page: $scope.currentPage
			}, {
				reload: true
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
		//修改播放时间
		$scope.updDisplayTime = function (screen, auth_token) {
			$modal.open({
				templateUrl: 'partial/screen/university/schedule/upd_display_time.html',
				controller: ['$scope', '$modalInstance', '$filter', 'origin', function ($scope, $modalInstance, $filter, origin) {
					$scope.title = '修改播放时间';
					var current = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm');
					screen['current'] = current;
					$scope.screen = screen;
					$scope.ok = function () {
						var fd = new FormData();
						fd.append('start_time', $scope.screen.approved_start_time);
						fd.append('end_time', $scope.screen.approved_end_time);
						$http.put(origin.DESTINATION.name + '/v1/customer/' + screen.region.id +
							'/contents/' + screen.id, fd, {
								'Origin' : origin.ORIGIN,
								'headers': {
									'Authentication-Token': auth_token,
									'Content-Type': undefined
								}
							}).success(function (data) {
								$modalInstance.close('ok');
								$rootScope.$emit(eventType.NOTIFICATION, {
									'type': 'POPMSG',
									'title': '信息',
									'message': '成功修改播放时间。'
								});
								reloadTable();
							});
					};
					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};
				}]
			});
		};
		//插播
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
								$scope.title = '插播';
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
										$state.go('terminal_university.display_log', {
											page: 1
										}, {
											reload: true
										});
									});
								};
								$scope.cancel = function () {
									$modalInstance.close('ok');
								};
							}]
						});
					});
			
		};
	});