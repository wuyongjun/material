angular.module('iwx')
	.controller('SysMesInfoCtrl', function ($scope, $rootScope, $http, $stateParams) {
		console.log($stateParams);
		$scope.sysinfoId = $stateParams.id;
		$rootScope.welcome_bg = false;
		$scope.sysinfos = [];
		var sysinfoSet = {};
		$scope.loadSysinfoBtn = '加载更多公告信息~~';
		$scope.loadMoreBtn = false;
		$scope.loadMore = true;
		$scope.currentPage = 1;
		//测试展开指定信息代码
		/*angular.forEach($scope.sysinfos, function (value) {
			if (value.id === parseInt($scope.sysinfoId)) {
				value.isDisplay = true;
			} else {
				value.isDisplay = false;
			}
		});*/
		//加载系统公告信息
		var loadSysinfos = function (currentPage) {
			$http.get('/api/admin/system/message?per_page=10&page=' + currentPage)
				.success(function (data) {
					$scope.loadMore = true;
					if (data.items.length === 0) {
						$scope.loadSysinfoBtn = '已经加载全部公告信息~~';
						$scope.loadMoreBtn = true;
						return;
					}
					var added = 0;
					angular.forEach(data.items, function (value) {
						if (value.id === parseInt($scope.sysinfoId)) {
							value.isDisplay = true;
						} else {
							value.isDisplay = false;
						}
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
		loadSysinfos($scope.currentPage);
		//加载更多公告信息
		$scope.loadMoreInfos = function () {
			loadSysinfos(++$scope.currentPage);
		};
	});