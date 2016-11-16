angular.module('iwx')
	.controller('VerManageSuCtrl', function ($scope, $rootScope, $http, ngTableParams, eventType, $state) {
		console.log($state);
		$rootScope.welcome_bg = false;
		//加载app版本信息表格
		var loadVersions = function (url) {
			var NgTableParams = ngTableParams;
			var versions = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					var requestParam = '&page='+params.page() + '&per_page=' + params.count();
					$http.get(url + requestParam)
						.success(function (data) {
							if (data.total === 0) {
								$scope.versionList = true;
								$scope.note = '未发布任何版本';
							} else {
								$scope.versionList = false;
							}
							versions = data.items;
							params.total(data.total);
							$defer.resolve(versions);
						});
				}
			});
		};
		if ($state.current.name === 'version_manage_super') {
			loadVersions('/api/su/version/list?type_v=web');
		} else {
			loadVersions('/api/su/version/list?type_v=app');
		}
	});