angular.module('iwx')
	.controller('CourseCtrl', function ($scope, $rootScope, $http, $stateParams, $filter, $state, eventType, userService) {
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		$scope.personId = $stateParams.personId;
		$scope.summaryId = $stateParams.summaryId;
		//党建历程信息数组
		$scope.courses = [];
		//已加载的历程信息id
		var courseSet = {};
		$scope.loadCourseBtn = '加载更多~~';
		$scope.loadMoreBtn = false;
		$scope.loadMore = true;
		$scope.currentPage = 1;
		//获取认证
		$http.get('/api/auth/refreshtoken').success(function (response) {
			$scope.auth_token = response.auth_token;
		});
		//获取人员信息
		var getPerson = function () {
			$http.get('/api/political/' + $scope.personId + '/user')
				.success(function (data) {
					$scope.person = data;
				});
		};
		getPerson();
		//加载历程信息
		var loadCourses = function (currentPage) {
			$http.get('/api/political/undergo/' + $scope.personId + '/list?per_page=10&page=' + currentPage)
				.success(function (data) {
					$scope.loadMore = true;
					if (data.items.length === 0) {
						$scope.loadCourseBtn = '已经加载全部~~';
						$scope.loadMoreBtn = true;
						return;
					}
					var added = 0;
					angular.forEach(data.items, function (value, key) {
						if ($scope.summaryId === 'null') {
							if (key === 0) {
								value.isDisplay = true;
							} else {
								value.isDisplay = false;
							}
						} else {
							if (value.id === parseInt($scope.summaryId)) {
								value.isDisplay = true;
							} else {
								value.isDisplay = false;
							}
						}
						if (!(value.id in courseSet)) {
							courseSet[value.id] = true;
							$scope.courses.push(value);
							added++;
						}
					});
					if (added === 0) {
						loadCourses(++$scope.currentPage);
					}
				});
		};
		loadCourses($scope.currentPage);
		//加载更多公告信息
		$scope.loadMoreCourses = function () {
			loadCourses(++$scope.currentPage);
		};
		//删除历程
		$scope.delCourse = function (course) {
			$scope.confirm.message = '确定要删除“' + $filter('date')(course.create_time, 'yyyy-MM-dd HH:mm') + '”的党建信息？';
			$scope.confirm.type = 'delCourse';
			$scope.confirm.param = course.id;
			$('#confirmModal').modal();
		};
		//确认框方法
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delCourse') {
				$http.delete('/api/political/undergo/' + $scope.confirm.param + '/delete')
					.success(function (data) {
						/*$scope.courses = [];
						courseSet = {};
						$scope.currentPage = 1;
						loadCourses($scope.currentPage);*/
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type': 'POPMSG',
							'title': '消息',
							'message': '删除成功！'
						});
						$state.go('party_info.course', {
							personId: $scope.personId,
							summaryId: 'null'
						}, {reload: true});
					});
			}
		};
		//添加活动总结
		$scope.addActSummary = function (person_id) {
			console.log(person_id);
			$state.go('party_info.activity', {
				personId: person_id
			}, {reload: true});
		};
		//添加党建历程
		$scope.addCourseSummary = function (person_id) {
			$state.go('party_info.course_summary', {
				personId: person_id
			}, {reload: true});
		};

		$scope.print = function() {
	        window.print();
	    };
	});