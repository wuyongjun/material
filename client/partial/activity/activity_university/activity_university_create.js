angular.module('iwx')
	.controller('activityUniversityCreateCtrl', function ($scope, $rootScope, $http, $filter, eventType) {
		// $scope.content_regexp = /^[\u4e00-\u9fa5_\x21-\x7e_\u0b7-\uff1f_\s]{0,20}$|^[\w\s_\x21-\x7e]{0,40}$/;
		$scope.loc_and_sub_regexp = /^[\u4e00-\u9fa5_\x21-\x7e_\u0b7-\uff1f_\s]{0,15}$|^[\w\s_\x21-\x7e]{0,30}$/;
		$scope.activity = {
			'editingActivityId': -1
		};

		$scope.saveActivity = function () {
			 try {
	            if (typeof($scope.activity.start_time) === 'number') {
	                $scope.activity.start_time = $filter('date')($scope.activity.start_time, 'yyyy-MM-dd HH:mm');
	            }
	            if (typeof($scope.activity.end_time) === 'number') {
	                $scope.activity.end_time = $filter('date')($scope.activity.end_time, 'yyyy-MM-dd HH:mm');
	            }
	            var stTime = new Date($scope.activity.start_time.replace(/-/g,"/"));
	            var endTime = new Date($scope.activity.end_time.replace(/-/g,"/"));
	            if(Date.parse(stTime) > Date.parse(endTime)) {
	                $rootScope.$emit(eventType.NOTIFICATION, {
	                    'type': 'POPMSG',
	                    'title': '警告',
	                    'message': '结束时间必须在开始时间之后'
	                });
	                return;
	            }
	        } catch (e) {
	            $rootScope.$emit(eventType.NOTIFICATION, {
	                'type': 'POPMSG',
	                'title': '警告',
	                'message': '请正确选择活动时间'
	            });
	            return;
	        }
	        if (!$scope.activity.location || !$scope.activity.content || !$scope.activity.subject) {
	            $rootScope.$emit(eventType.NOTIFICATION, {
	                'type': 'POPMSG',
	                'title': '警告',
	                'message': '请填写完整，其中活动主题、活动地点和活动内容为必填项！'
	            });
	            return;
	        }
	        //限制字数提示
	        if (!$scope.loc_and_sub_regexp.test($scope.activity.subject) || 
	            !$scope.loc_and_sub_regexp.test($scope.activity.location) || ($scope.activity.members && !$scope.content_regexp.test($scope.activity.content))) {
	            $rootScope.$emit(eventType.NOTIFICATION, {
	                'type': 'POPMSG',
	                'title': '警告',
	                'message': '请注意填写内容字数限制！'
	            });
	            return;
	        }
	        $http.post('/api/admin/activities').success(function(id) {
                console.log(id);
                $scope.editingActivityId = id;

                var fd = new FormData();
                angular.forEach($scope.activity, function(value, key) {
                    fd.append(key, value);
                });
                $http.post('/api/admin/activities/' + $scope.editingActivityId, fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }).success(function(data) {
                    $scope.activity = data;
                    $rootScope.$emit(eventType.NOTIFICATION, {
                        'type': 'POPMSG',
                        'title': '消息',
                        'message': '保存成功'
                    });

                });
            });
		};
	});