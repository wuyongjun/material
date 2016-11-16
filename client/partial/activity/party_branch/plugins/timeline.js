angular.module('iwx')
	.controller('PartyTimelineCtrl', function ($scope, $http, $rootScope, eventType, ngTableParams, $modal) {
		$scope.comment = {
			images: []
		};
		//获取评论内容
		var getComments = function () {
			var NgTableParams = ngTableParams;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http.get('/api/activities/' + $scope.$parent.activity.id + '/comments_edit?page='+params.page() + '&per_page=' + params.count())
						.success(function (data) {
							$scope.comments = data.items;
							params.total(data.total);
							$defer.resolve($scope.comments);
						});
				}
			});
		};
		//删除添加的爆料图片
		$scope.removeFile = function (index) {
			var newImages = [];
			angular.forEach($scope.comment.images, function (value, key) {
				if (key !== index) {
					newImages.push(value);
				}
			});
			$scope.comment.images = newImages;
		};
		//提交爆料信息
		$scope.submit = function () {
			if (!$scope.comment.images) {
				$scope.comment.images = [];
			}
			if ($scope.comment && $scope.comment.images && $scope.comment.images.length > 6) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					type: 'POPMSG',
					title: '警告',
					message: '最多上传6张图片'
				});
				return;
			}
			if (!$scope.comment.content || $scope.comment.content.length === 0) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					type: 'POPMSG',
					title: '警告',
					message: '请填写要爆料的内容'
				});
				return;
			}
			var fd = new FormData();
			fd.append('content', $scope.comment.content);
			angular.forEach($scope.comment.images, function (value, key) {
				fd.append('images', value);
			});

			$http.post('/api/activities/' + $scope.$parent.activity.id + '/comments', fd, {
				transformRequest: angular.identity,
				headers: {
					'Content-Type': undefined 
				}
			}).success(function (data) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					type: 'POPMSG',
					title: '消息',
					message: '发布成功'
				});
				$scope.tableParams.reload();
				$scope.comment = {};
			});
		};
		//选择参与者
		$scope.participator = function () {
			$modal.open({
				templateUrl: 'partial/activity/party_branch/plugins/participator.html',
				controller: 'ParticipatorCtrl',
				size: 'lg',
				resolve: {
					activityId: $scope.$parent.activity.id
				}
			});
		};
	});