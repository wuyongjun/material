angular.module('iwx')
	.controller('ScreenCtrl', function ($scope, $rootScope, $http, ngTableParams, eventType, $modal, $state, $stateParams, origin, userService) {
		$rootScope.welcome_bg = false;
		$scope.confirm = {};
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		$scope.currentPage = $stateParams.page;
		// console.log($scope.currentPage);
		$scope.getScreens = function () {
			//创建分页表格
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
					$http.get(origin.DESTINATION.name + '/v1/customer/' + $scope.user.university.id + '/editor/' + 
						$scope.user.id + '/contents?page=' + params.page() + '&per_page=' + params.count(), {
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
			$scope.getScreens();
		});
		//确定操作
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delete') {
				$http.delete('', {
					'Origin' : origin.ORIGIN
				}).success(function (data) {
					$scope.tableParams.reload();
				});
			}
		};
		//删除展板信息
		$scope.delete = function (screen) {
			$scope.confirm.message = '确定要删除“' + screen.title + '”的信息？';
			$scope.confirm.type = "delete";
			$scope.confirm.param = screen.id;
			$('#confirmModal').modal();
			return;
		};
		//新建展板
		$scope.createScreen = function () {
			$state.go('screen.screen_edit', {
				id: -1,
				page: $scope.currentPage
			});
		};
		//修改展板
		$scope.applyScreen = function (screen) {
			$state.go('screen.screen_edit', {
				id: screen.id,
				page: $scope.currentPage
			});
		};
		//查看拒绝原因
		$scope.refuseReason = function (screen) {
			$modal.open({
				templateUrl: 'partial/screen/refuse_reason.html',
				controller: ['$scope', '$modalInstance', 'origin', function ($scope, $modalInstance) {
					/*$http.get('', {
						'Origin' : origin.ORIGIN
					}).success(function (data) {
						$scope.content = data;
					});*/
					$scope.content = screen.decline_message;
					$scope.cancel = function () {
						$modalInstance.close('ok');
					};
				}]
			});
		};
	});