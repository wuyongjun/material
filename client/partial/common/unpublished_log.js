angular.module('iwx')
	.controller('UnpublishLogCtrl', function ($scope, $rootScope, $http, $stateParams) {
		console.log($stateParams);
		$scope.type = $stateParams.type;
		$scope.id = $stateParams.id;
		$rootScope.welcome_bg = false;
		$scope.sysinfos = [];
		var sysinfoSet = {};
		$scope.loadSysinfoBtn = '加载更多公告信息~~';
		$scope.loadMoreBtn = false;
		$scope.loadMore = true;
		$scope.currentPage = 1;
		var api = '';
		if ($scope.type === 'activity') {
			api = '/api/admin/activity/' + $scope.id + '/log';
		} else if ($scope.type === 'article') {
			api = '/api/admin/news/' + $scope.id + '/log';
		} else {
			api = '/api/admin/bazaar/' + $scope.id + '/log';
		}
		//加载系统公告信息
		var loadSysinfos = function (currentPage, api) {
			$http.get(api + '?per_page=10&page=' + currentPage)
				.success(function (data) {
					$scope.loadMore = true;
					if (data.items.length === 0) {
						$scope.loadSysinfoBtn = '已经加载全部公告信息~~';
						$scope.loadMoreBtn = true;
						return;
					}
					var added = 0;
					angular.forEach(data.items, function (value) {
						if (!(value.id in sysinfoSet)) {
							sysinfoSet[value.id] = true;
							$scope.sysinfos.push(value);
							added++;
						}
					});
					if (added === 0) {
						loadSysinfos(++$scope.currentPage);
					}
				});
		};
		//加载更多公告信息
		$scope.loadMoreInfos = function () {
			loadSysinfos(++$scope.currentPage, api);
		};
		loadSysinfos($scope.currentPage, api);
	});