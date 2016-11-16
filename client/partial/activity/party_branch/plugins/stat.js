angular.module('iwx')
	.controller('PartyStatCtrl', function ($scope, $http) {
		var activityid = $scope.$parent.activity.id;
		$scope.page = $scope.$parent.page;
		console.log($scope.page);
		$scope.plugin_exist = {
			timeline: false,
			sign_in: false
		};
		//获取该活动的插件
		var getActPlugins = function (activity_id) {
			$http.get('' + activity_id)
				.success(function (data) {
					var plugins = data.plugins;
					var len = plugins.length;
					for (var i = 0; i < len; i++) {
						$scope.plugin_exist[plugins[i].id] = false;
					}
				});
		};
		//获取统计数据
		var getSummary = function (activity_id) {
			var data = {
				browse_count: 10,
				fav_count: 5,
				sign_in_count: 10,
				sign_in_special: 5,
				sign_in_total: 5,
				person_num: 10,
				speak_num: 100,
				speaker_num: 5
			};
			$scope.summary = data;
		};
		getSummary(activityid);
	});