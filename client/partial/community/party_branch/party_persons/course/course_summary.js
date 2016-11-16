angular.module('iwx')
	.controller('CouSummaryCtrl', function ($scope, $rootScope, $http, $stateParams, $modal, userService, $state, eventType) {
		$scope.personId = $stateParams.personId;
		//选中的标签id
		$scope.label_id_array = [];
		$scope.summary = {};
		//获取标签库数据
		$scope.getLabels = function () {
			$http.get('/api/political/label/list')
				.success(function (data) {
					angular.forEach(data, function (value, key) {
						value['chosen'] = false;
					});
					$scope.labels = data;
				});
		};
		userService.load(true)
			.then(function () {
				$scope.getLabels();
			});
		//选择标签
		$scope.choseLabel = function (label) {
			if (label.chosen) {
				label.chosen = false;
				for (var i=0;i<$scope.label_id_array.length;i++) {
					if ($scope.label_id_array[i] === label.id) {
						$scope.label_id_array.splice(i, 1);
						break;
					}
				}
			} else {
				label.chosen = true;
				$scope.label_id_array.push(label.id);
			}
			console.log($scope.label_id_array);
		};
		//添加标签
		$scope.addLabel = function () {
			$modal.open({
				templateUrl: 'partial/community/party_branch/party_persons/course/add_label.html',
				controller: 'AddLabelCtrl',
				resolve: {
					
				}
			});
		};
		//保存文字总结
		$scope.saveSummary = function () {
			if ($scope.label_id_array.length === 0) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请选择标签！'
				});
				return;
			}
			if (!$scope.summary.content) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请添写总结内容！'
				});
				return;
			}
			var params = {};
			params['user_id'] = $scope.personId;
			params['label'] = $scope.label_id_array;
			params['content'] = $scope.summary.content;
			$http.post('/api/political/undergo/create', params)
				.success(function (data) {
					$state.go('party_info.course', {
						personId: $scope.personId,
						summaryId: data.id
					}, {reload: true});
				});
		};
		$scope.$on('addLabel', function (event, value) {
			$scope.getLabels();
		});
	});