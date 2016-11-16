angular.module('iwx')
	.controller('MessAdminIwxCtrl', function ($scope, $rootScope, $http, $stateParams, userService, eventType) {
		console.log('this is message between admin manager and iwx manager!');
		$scope.messages = [];

		var messageSet = {};

		var current_page = 1;

		var loadMessages = function(page) {
			var url = '/api/admin/message/iwx/' + $stateParams.id + '?page=' + page + '&per_page=' + 10;
			$http.get(url).success(function(data) {
				if (data.items.length === 0) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '已加载全部聊天信息'
					});
					return; 
				}
				var added = 0;
				angular.forEach(data.items, function(value) {
					if (!(value.id in messageSet)) {
						messageSet[value.id] = true;
						$scope.messages.push(value);
						added++;
					}
				});
				if (added === 0) {
					loadMessages(++current_page);
				}
			});
		};

		loadMessages(current_page);

		$scope.loadMore = function() {
			loadMessages(++current_page);
		};

		$scope.send = function() {
			if (!$scope.content) { return; }
			var param = {};
			// param['community_id'] = $scope.community.id;
			param['user_id'] = $stateParams.id;
			param['content'] = $scope.content;
			$http.post('/api/admin/message/iwx/reply', param).success(function(data) {
				messageSet[data.id] = true;
				$scope.messages.unshift(data);
			});
			$scope.content = '';
		};

		/*$http.put('/api/admin/messages/' + $stateParams.id).success(function() {
			$scope.$parent.clearId($stateParams.id);
		});*/

		userService.load().then(function(data) {
			$scope.community = data.managed_community;
		});
	});