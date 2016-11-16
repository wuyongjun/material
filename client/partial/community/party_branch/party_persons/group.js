angular.module('iwx')
	.controller('GroupCtrl', function ($scope, $http, $modal, ngTableParams, userService) {
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		//获取列表
		var getGroups = function () {
			var NgTableParams = ngTableParams;
			var groups = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http.get('/api/political/groups?page=' + params.page() + '&per_page=' + params.count())
						.success(function (data) {
							/*var data = {
								items: [{id: 1, name: '党建一队', describe: '这是第一支党建活动小组', createtime: 1442991218000, number: 2}],
								total: 1
							};*/
							groups = data.items;
							params.total(data.total);
							$defer.resolve(groups);
						});
					
				}
			});
		};
		userService.load(true).then(function () {
			getGroups();
		});
		
		//新建小组
		$scope.createGroup = function () {
			$modal.open({
				templateUrl: 'partial/community/party_branch/group_detail/edit_group.html',
				controller: 'EditGroupCtrl',
				resolve: {
					group: function () {
						return {id: -1};
					}
				}
			});
		};
		//编辑小组
		$scope.edit = function (group) {
			$modal.open({
				templateUrl: 'partial/community/party_branch/group_detail/edit_group.html',
				controller: 'EditGroupCtrl',
				resolve: {
					group: function () {
						return group;
					}
				}
			});
		};
		//查看成员
		$scope.members = function (group) {
			$modal.open({
				templateUrl: 'partial/community/party_branch/members.html',
				controller: 'MembersCtrl',
				resolve: {
					obj: function () {
						return group;
					},
					type: function () {
						return { description: 'group' };
					}
				}
			});
		};
		//删除小组
		$scope.delete = function (group_id) {
			$scope.confirm.message = '确定要删除该小组？';
			$scope.confirm.type = 'delGroup';
			$scope.confirm.param = group_id;
			$('#confirmModal').modal();
		};
		//确认框方法
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delGroup') {
				$http.delete('/api/political/group/' + $scope.confirm.param + '/del')
					.success(function (data) {
						$scope.tableParams.reload();
					});
			}
		};
		//刷新小组表格
		$scope.$on('flushGroupList', function () {
			$scope.tableParams.reload();
		});
	});