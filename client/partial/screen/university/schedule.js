angular.module('iwx')
	.controller('DisplayListCtrl', function ($scope, $rootScope, $http, eventType, $modal, $state, $stateParams, origin, userService) {
		$scope.server = origin.DESTINATION.name;
		$scope.currentPage = $stateParams.page;
		$scope.confirm = {};
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		$scope.getDisplayScreens = function () {
			$http.get(origin.DESTINATION.name + '/v1/customer/playlist/contents/', {
					'Origin' : origin.ORIGIN,
					'headers' : {
						'Authentication-Token' : $scope.auth_token
					}
				}).success(function (data) {
					$scope.screens = data;
				});
		};
		$http.get('/api/auth/refreshtoken').success(function (response) {
			$scope.user = response.user;
			$scope.auth_token = response.auth_token;
			$scope.getDisplayScreens();
		});
		//确定操作
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'remove') {
				$http.delete(origin.DESTINATION.name + '/v1/customer/playlist/contents/?notify=1&contents=' + $scope.confirm.param, {
					'Origin' : origin.ORIGIN,
					'headers': {
						'Authentication-Token': $scope.auth_token
					}
				}).success(function (data) {
					$scope.getDisplayScreens();
				});
			}
		};
		//从列表中移除
		$scope.remove = function (screen) {
			$scope.confirm.message = '确定要移除“' + screen.title + '”?';
			$scope.confirm.type = "remove";
			$scope.confirm.param = screen.id;
			$('#confirmModal').modal();
			return;
		};
		//紧急插播
		$scope.urgentInterCut = function () {
			$state.go('terminal_university.inter_cut', {
				page: $scope.currentPage,
				id: -1
			}, {
				reload: true
			});
		};
		//编辑播放列表
		$scope.editDisplayList = function () {
			$modal.open({
				templateUrl: 'partial/screen/university/schedule/display_list_edit.html',
				controller: 'DisplayEditCtrl',
				size: 'lg',
				resolve: {
					authToken: function () {
						return $scope.auth_token;
					},
					universityId: function () {
						return $scope.user.university.id;
					},
					total: function () {
						return $scope.total;
					}
				}
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
		//获取正在播放的展板列表
		$scope.displaying = function (auth_token) {
			$modal.open({
				templateUrl: 'partial/screen/university/schedule/displaying.html',
				size: 'lg',
				controller: ['$scope', '$modalInstance', 'origin', function ($scope, $modalInstance, origin) {
					$scope.server = origin.DESTINATION.name;
					$http.get(origin.DESTINATION.name + '/v1/customer/playlist/contents/?s=playing', {
						'Origin' : origin.ORIGIN,
						'headers': {
							'Authentication-Token': auth_token
						}
					}).success(function (data) {
						$scope.screens = data;
					});
					$scope.cancel = function () {
						$modalInstance.close('ok');
					};
				}]
			});
		};
		var reloadTable = function () {
			$scope.getDisplayScreens();
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
									'message': '成功修改播放时间为：' + $filter('date')(data.approved_start_time, 'yyyy-MM-dd HH:mm') + 
										'~' + $filter('date')(data.approved_end_time, 'yyyy-MM-dd HH:mm')
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
		//修改播放等级
		$scope.updDisplayLevel = function (screen, level, auth_token) {
			$http.get(origin.DESTINATION.name + '/v1/customer/priorities/?page=1&per_page=100', {
				'Origin' : origin.ORIGIN,
				'headers': {
					'Authentication-Token': auth_token
				}
			}).success(function (data) {
				var priorities = data.items;
				$modal.open({
					templateUrl: 'partial/screen/university/schedule/add_display_level.html',
					controller: ['$scope', '$modalInstance', 'origin', function ($scope, $modalInstance, origin) {
						$scope.title = '修改播放等级';
						$scope.levelArray = priorities;
						$scope.btnOk = false;
						$scope.param = {
							priority_id : level.id
						};
						$scope.ok = function () {
							console.log($scope.param);
							$http.put(origin.DESTINATION.name + '/v1/customer/playlist/contents/' + screen.id, $scope.param, {
								'Origin' : origin.ORIGIN,
								'headers' : {
									'Authentication-Token' : auth_token
								}
							}).success(function (data) {
								$modalInstance.close('ok');
								$rootScope.$emit(eventType.NOTIFICATION, {
									'type' : 'POPMSG',
									'title': '信息',
									'message': '成功修改播放等级。'
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
		//监听刷新播放列表事件
		$scope.$on('updateDisplayList', function () {
			$scope.getDisplayScreens();
		});
	});