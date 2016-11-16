angular.module('iwx')
	.controller('PartyBranchCtrl', function ($scope, $http, $rootScope, eventType) {
		console.log('这是党支部社团信息控制器');
		$rootScope.welcome_bg = false;
		if (!$rootScope.mes_note) {
			$rootScope.message();
		}
		//获取党支部社团组织信息
		$http.get('/api/admin/community')
			.success(function (data) {
				$scope.community = data;
			});
		//监听组织描述
		$scope.$watch('community.description', function (string) {
			if (string) {
				var arr = [];
				angular.forEach(string, function (value, index) {
					if (value !== ' ') {
						arr.push(value);
					}
				});
				if (arr.length > 200) {
					$scope.show_description = true;
				} else {
					$scope.show_description = false;
				}
			}
		});
		$scope.submit = function() {
			var fd = new FormData();
			angular.forEach($scope.community, function(value, key) {
				fd.append(key, value);
			});
			$http.post('/api/admin/community', fd, {
					transformRequest: angular.identity,
					headers: {
						'Content-Type': undefined
					}
				}).success(function(data) {
					$scope.community = data;
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '保存成功'
					});
					$rootScope.$broadcast('flushLoginUser', data);
				});
		};
	});