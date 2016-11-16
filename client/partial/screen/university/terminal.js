angular.module('iwx')
	.controller('TerminalCtrl', function ($scope, $rootScope, $http, ngTableParams, eventType, $modal, $state, $stateParams, origin, userService) {
		$rootScope.welcome_bg = false;
		$scope.server = origin.DESTINATION.name;
		//获取审核列表
		$scope.getVerifyScreens = function () {
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
						'/contents?s=p&page=' + params.page() + '&per_page=' + params.count(), {
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
			$scope.getVerifyScreens();
		});
		//重新加载分页列表
		var reloadTable = function () {
			$scope.tableParams.reload();
		};
		//通过
		$scope.approve = function (screen, auth_token, nickname) {
			$modal.open({
				templateUrl: 'partial/screen/university/terminal/approve_time.html',
				controller: ['$scope', '$modalInstance', '$filter', 'origin', function ($scope, $modalInstance, $filter, origin) {
					$scope.title = '设置允许播放时间';
					var current = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm');
					screen['current'] = current;
					$scope.screen = screen;
					$scope.ok = function () {
						var fd = new FormData();
						fd.append('start_time', $scope.screen.start_time);
						fd.append('end_time', $scope.screen.end_time);
						$http.post(origin.DESTINATION.name + '/v1/customer/' + screen.region.id +
							'/contents/' + screen.id, fd, {
								'Origin' : origin.ORIGIN,
								'headers': {
									'Authentication-Token': auth_token,
									'Content-Type': undefined
								}
							}).success(function (data) {
								//成功通过后向申请社团发送私信
								var letter = {};
								letter['community_id'] = data.community_id;
								letter['content'] = '你申请的“' + data.title + '”已被“' + nickname + '”审核通过，批准播放时间为：' + 
									$filter('date')(data.approved_start_time, 'yyyy-MM-dd HH:mm') + '~' + 
									$filter('date')(data.approved_end_time, 'yyyy-MM-dd HH:mm');
								console.log('letter:'+ angular.toJson(letter));
								$http.post('/api/un/single/message/create', letter)
									.success(function (data) {});
								$modalInstance.close('ok');
								reloadTable();
							});
					};
					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};
				}]
			});
		};
		//拒绝
		$scope.refuse = function (screen, auth_token) {
			$modal.open({
				templateUrl: 'partial/common/unpublished_reason.html',
				controller: ['$scope', '$modalInstance', 'origin', function ($scope, $modalInstance, origin) {
					$scope.reason_title = '填写拒绝理由';
					$scope.receive = 'To: ' + screen.author_name;
					$scope.ok_btn = true;
					$scope.$watch('content', function (newValue) {
						if ($scope.content) {
							$scope.ok_btn = false;
						} else {
							$scope.ok_btn = true;
						}
					});
					$scope.ok = function () {
						console.log($scope.content);
						/*var param = {};
						param['message'] = $scope.content;*/
						$http.delete(origin.DESTINATION.name + '/v1/customer/' + screen.region.id +
							'/contents/' + screen.id + '?message=' + $scope.content, {
								'Origin' : origin.ORIGIN,
								'headers': {
									'Authentication-Token': auth_token
								}
							}).success(function (data) {
								$modalInstance.dismiss('cancel');
								reloadTable();
							});
					};
					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};
				}]
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