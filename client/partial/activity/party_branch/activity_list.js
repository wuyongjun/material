angular.module('iwx')
	.controller('PartyActListCtrl', function ($scope, $rootScope, $http, $modal, ngTableParams, $stateParams, $state) {
		$rootScope.welcome_bg = false;
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		$scope.plugins_config = {
			discuss: {
				'id':'discuss',
				'name':'线上讨论',
				'icon_path':'/static/images/timeline_new.png',
				'note':'不必再协调所有人的时间，再没有场地的限制，在线讨论，随时随地。'
			},
			political_sign_in: {
				'id':'political_sign_in',
				'name':'活动签到',
				'icon_path':'/static/images/sign_in_new.png',
				'note':'支持线上签到和线下签到，根据所需要的数据精准度，自由选择签到模式。'
			}
		};
		$scope.currentPage = $stateParams.page;
		console.log($stateParams.page);
		//加载党支部活动
		var loadPartyAct = function () {
			var NgTableParams = ngTableParams;
			var activities = null;
			$scope.tableParams = new NgTableParams({
				page: $scope.currentPage,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$scope.currentPage = params.page();
					$http.get('/api/admin/activities?page='+params.page() + '&per_page=' + params.count())
						.success(function(data) {
							/*data = {items: [{
								id: 1, subject: '由 Microsoft Edge 创建', content: '<blockquote><div><i>卓越法律人才培养/div>', published: true,
								start_time: 1420095480000, end_time: 1442079600000, location: '人民大会堂河北厅', range: 'ALL',
								poster: '/images/activity/336/poster/1a74563a-419f-11e5-8ac7-00163e002e66.jpg',
								plugins: [{
									id: 'discuss', name: '线上讨论', enabled: true,
									preview: {}},{id: 'political_sign_in', name: '活动签到', enabled: true, preview: {}}]
								}],
								total: 1
							};*/
							var items = data.items;
							if (items) {
								var len_items = items.length;
								for (var i=0;i<len_items;i++) {
									var temp_item_plugin = items[i].plugins;
									var len_plugins = temp_item_plugin.length;
									for (var j=0;j<len_plugins;j++) {
										var temp_plugin = temp_item_plugin[j];
										temp_plugin['icon_path'] = $scope.plugins_config[temp_plugin.id].icon_path;
									}
								}
							}
							activities = items;
							params.total(data.total);
							$defer.resolve(activities);
						});
				}
			});
		};
		loadPartyAct();
		//创建活动
		$scope.createActivity = function () {
			$state.go('party_act_item', {
				id: -1,
				page: $scope.currentPage
			});
		};
		//确认方法
		$scope.confirmModal = function () {
			var url = '/api/admin/activities/' + $scope.confirm.param + '/' + $scope.confirm.type;
			if ($scope.confirm.type === 'del_activity') {
				$http.delete('/api/admin/activities/' + $scope.confirm.param)
					.success(function (data) {
						$scope.tableParams.reload();
					});
			} else if ($scope.confirm.type === 'publish') {
				$http.post(url)
					.success(function (data) {
						$scope.tableParams.reload();
					});
			} else if ($scope.confirm.type === 'unpublish') {
				$http.post(url)
					.success(function (data) {
						$scope.tableParams.reload();
					});
			}
		};
		//删除活动
		$scope.deleteActivity = function (activity) {
			$scope.confirm.message = '您确定要删除“' + activity.subject + '”活动吗？';
			$scope.confirm.type = 'del_activity';
			$scope.confirm.param = activity.id;
			$('#confirmModal').modal();
			return;
		};
		//发布或取消发布活动
		 $scope.invTogglePublish = function(activity) {
			var action = activity.published ? 'unpublish' : 'publish';
			if(action === 'unpublish') {
				$scope.confirm.message = '您确定要取消发布“' + activity.subject + '”活动吗?';
				$scope.confirm.type = 'unpublish';
			} else {
				$scope.confirm.message = '您确定要发布“' + activity.subject + '”活动吗?';
				$scope.confirm.type = 'publish';
			}
			$scope.confirm.param = activity.id;
			$('#confirmModal').modal();
			return;
		};
		$scope.gotoPlugin = function(activityId, pluginId) {
		if (pluginId === "") {
			$state.go('party_act_item', {
				'id': activityId,
				'page': $scope.currentPage
			});
		} else {
			$state.go('party_act_item.' + pluginId + '_plugin', {
				'id': activityId,
				'page': $scope.currentPage
			});
		}
    };
	});