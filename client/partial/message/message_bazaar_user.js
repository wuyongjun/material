angular.module('iwx')
	.controller('MesBazUserCtrl', function ($scope, $http, $rootScope, $stateParams, $modal) {
		$scope.bazaar_user_id = $stateParams.id;
		console.log($scope.bazaar_user_id);
		$scope.load_topic_content = '加载更多消息';
		$scope.more_topic = false;
		//和该用户相关的主题数组
		$scope.topics = [];
		//已经加载的主题对象
		var topicSet = {};
		//当前页数
		var curr_page = 1;
		//加载和该用户相关的主题信息
		var loadTopics = function (page) {
			$http.get('/api/admin/bazaar/message/' + $stateParams.id + '/topic?page=' + page + '&per_page=6')
				.success(function (data) {
					console.log(data);
					if (data.items.length === 0) {
						$scope.load_topic_content = '已经加载全部相关主题';
						$scope.more_topic = true;
						return;
					}
					var added = 0;
					angular.forEach(data.items, function (value) {
						if (!(value.topic.id in topicSet)) {
							topicSet[value.topic.id] = true;
							$scope.topics.push(value.topic);
							added++;
						}
					});
					if (added === 0) {
						loadTopics(++curr_page);
					}
				});
		};
		loadTopics(curr_page);
		//加载更多主题
		$scope.loadMoreTopic = function () {
			loadTopics(++curr_page);
		};
		//查看大图
		$scope.imageView = function (image) {
			if (image) {
				$modal.open({
		            template: '<div><img style="width:100%" src=' + image + '></div>',
		            size: "lg",
		        });
			}
		};
		
	});