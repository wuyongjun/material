angular.module('iwx')
	.controller('PartyActCtrl', function ($scope, $http, ngTableParams, eventType, $stateParams, $state) {
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
		$scope.personId = $stateParams.personId;
		console.log('人员id：'+$scope.personId);
		//加载活动
		var loadActivities = function () {
			console.log('PartyActCtrl');
			var NgTableParams = ngTableParams;
			var activities = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http.get('/api/political/undergo/' + $scope.personId + '/activity?page='+params.page() + '&per_page=' + params.count())
						.success(function (data) {
							$scope.activity_sum = data.total;
							var items = data.items;
							if (items) {
								var len_items = items.length;
								for (var i=0;i<len_items;i++) {
									var temp_item_plugin = items[i].activity_obj.activity.plugins;
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
		loadActivities();
		//添加总结
		$scope.addSummary = function (activity_id, summary_id, person_id) {
			$state.go('party_info.activity_summary', {
				activityId: activity_id,
				summaryId: summary_id,
				personId: person_id
			}, {reload: true});
		};
		//编辑总结
		$scope.editSummary = function (activity_id, summary_id, person_id) {
			$state.go('party_info.activity_summary', {
				activityId: activity_id,
				summaryId: summary_id,
				personId: person_id
			}, {reload: true});
		};
	});