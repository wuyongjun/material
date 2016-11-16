angular.module('iwx')
	.controller('ActSummaryCtrl', function ($scope, $rootScope, $http, $stateParams, $modal, userService, $state, eventType) {
		//活动id
		$scope.activityId = $stateParams.activityId;
		//总结id
		$scope.summaryId = $stateParams.summaryId;
		//人员id
		$scope.personId = $stateParams.personId;
		$scope.summary = {
			id: $scope.summaryId
		};
		//要添加的标签id数组
		$scope.label_id_array = [];
		//要删除的标签id数组
		// $scope.label_id_remove = [];
		//已存在的总结的标签hash
		$scope.summary_exist_labels = {};
		
		//获取标签库数据
		$scope.getLabels = function () {
			$http.get('/api/political/label/list')
				.success(function (data) {
					angular.forEach(data, function (value, key) {
						value['chosen'] = false;
					});
					$scope.labels = data;
					$scope.chosenExistLabels();
				});
		};
		//记录已存在的总结的标签
		$scope.recordExistLabels = function (summary) {
			angular.forEach(summary.label, function (value, key) {
				$scope.summary_exist_labels[value.id] = value;
			});
			$scope.getLabels();
		};
		//选中已存在的标签
		$scope.chosenExistLabels = function () {
			console.log($scope.summary_exist_labels);
			console.log($scope.labels);
			angular.forEach($scope.labels, function (value, key) {
				if ($scope.summary_exist_labels[value.id]) {
					value.chosen = true;
					$scope.label_id_array.push(value.id);
				}
			});
		};
		//获取活动数据
		$scope.getActivity = function () {
			$http.get('/api/political/' + $scope.activityId + '/undergo')
				.success(function (data) {
					$scope.browse_num = data.activity_obj.browse_num;
					$scope.activity = data.activity_obj.activity;
					$scope.signIn = data.activity_obj.sign_in;
					if (data.join_undergo_obj) {
						$scope.summary = data.join_undergo_obj;
						$scope.recordExistLabels($scope.summary);
					} else {
						var temp = [];
						$scope.recordExistLabels(temp);
					}
					
				});
		};
		
		userService.load(true)
			.then(function () {
				$scope.getActivity();
			});
		//选择标签
		$scope.choseLabel = function (label) {
			if (label.chosen) {
				label.chosen = false;
				angular.forEach($scope.label_id_array, function (value, key) {
					if (value === label.id) {
						$scope.label_id_array.splice(key, 1);
					}
				});
				/*if ($scope.summary_exist_labels[label.id]) {
					$scope.label_id_remove.push(label.id);
				}*/
			} else {
				label.chosen = true;
				// if (!$scope.summary_exist_labels[label.id]) {
				$scope.label_id_array.push(label.id);
				// }
				/*if ($scope.summary_exist_labels[label.id]) {
					angular.forEach($scope.label_id_remove, function (value, key) {
						if (value === label.id) {
							$scope.label_id_remove.splice(key, 1);
						}
					});
				}*/
				
			}
			console.log('要添加到总结中的label id：' + $scope.label_id_array);
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
		$scope.$on('addLabel', function (event, value) {
			$scope.getLabels();
		});
		//保存活动总结，保存成功跳转至个人党建历程页面
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
			if (parseInt($scope.summary.id) === -1) {
				params['user_id'] = $scope.personId;
				params['activity_id'] = $scope.activity.id;
			}
			params['label'] = $scope.label_id_array;
			params['content'] = $scope.summary.content;
			/*if ($scope.label_id_remove.length !== 0) {
				params['label_del'] = $scope.label_id_remove;
			}*/
			console.log(params);
			if (parseInt($scope.summary.id) !== -1) {
				console.log('update activity summary!');
				$http.put('/api/political/undergo/' + $scope.summary.id + '/update', params)
					.success(function (data) {
						$state.go('party_info.course', {
							personId: $scope.personId,
							summaryId: $scope.summary.id
						}, {reload: true});
					});
			} else {
				console.log('create activity summary!');
				$http.post('/api/political/undergo/create', params)
					.success(function (data) {
						$state.go('party_info.course', {
							personId: $scope.personId,
							summaryId: data.id
						}, {reload: true});
					});
			}
			
		};
	});