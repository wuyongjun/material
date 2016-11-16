angular.module('iwx')
	.controller('MembersCtrl', function ($scope, $http, ngTableParams, $modalInstance, obj, type) {
		console.log(type);
		$scope.obj = obj;
		$scope.isHasMembers = true;
		var getMembers = function (url) {
			var NgTableParams = ngTableParams;
			var members = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 5
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http.get(url + '?page=' + params.page() + '&per_page=' + params.count())
						.success(function (data) {
							console.log(data);
							/*data = {items:[{id: 1, nickname: '麻衣库怡', name: '王静', icon: '/images/user/5/icon/4b910af4-3bf7-11e5-8ac7-00163e002e66.jpg', 
								identity: { id: 1, name: '党员'}},
								{id: 1, nickname: '出版界', name: '郭德纲', icon: '/images/user/15/icon/d749432c-3995-11e5-8ac7-00163e002e66.jpg', 
								identity: { id: 1, name: '积极分子'}}],
								total: 2};*/
							if (data.total === 0) {
								$scope.isHasMembers = false;
							} else {
								$scope.isHasMembers = true;
								members = data.items;
								params.total(data.total);
								$defer.resolve(members);
							}
						});
				}
			});
		};
		var loadMembers = function (type, obj) {
			if (type === 'duty') {
				getMembers('/api/political/duty/' + obj.id + '/user');
			} else if (type === 'grade') {
				getMembers('/api/political/year/' + obj.id + '/user');
			} else {
				getMembers('/api/political/group/' + obj.id + '/user');
			}
		};
		loadMembers(type.description, $scope.obj);
		//关闭
		$scope.close = function () {
			$modalInstance.close('ok');
		};
	});