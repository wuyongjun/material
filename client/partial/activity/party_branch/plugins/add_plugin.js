angular.module('iwx')
	.controller('AddPartyPlugin', function ($scope, $rootScope, party_plu_a, $modalInstance, party_act, eventType, $state) {
		var plugins = party_act.plugins;
		$scope.plugins_alivable = party_plu_a;
		$scope.addPlugin = function (plugin_id) {
			angular.forEach(plugins, function (value, key) {
				if (plugin_id === value.id) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '请先结束当前的' + value.name + '功能，再进行添加！'
					});
					$modalInstance.close('ok');
					$state.go('party_act_item.' + plugin_id + '_plugin');
					return;
				}
			});
			$modalInstance.close('ok');
			$rootScope.$broadcast('addPartyPlugin', plugin_id);
			//删除已添加的插件
			angular.forEach($scope.plugins_alivable, function (value, key) {
				console.log('value=' + angular.toJson(value) + ';key=' + key);
				if (value.id === plugin_id) {
					$scope.plugins_alivable.splice(key, 1);
					return;
				}
			});
		};
	});