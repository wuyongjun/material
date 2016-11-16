angular.module('iwx')
	.controller('PartyPersonCtrl', function ($scope, $http, $rootScope, ngTableParams, eventType, $modal, $state, userService, $filter) {
		//人员查询条件
		var allGrades = [];
		var partGrades = [];
		var allGroups = [];
		var partGroups = [];
		$scope.date = $filter('date')(new Date(), 'yyyy-MM-dd');
		//获取学年查询条件
		var getGrades = function () {
			$http.get('/api/political/years?page=1&per_page=1000')
				.success(function (data) {
					console.log(data.items);
					if (data.total > 12) {
						partGrades = data.items.slice(0, 12);
					} else {
						partGrades = data.items;
					}
					allGrades = data.items;
					$scope.grades = partGrades;
				});
		};
		//获取分组查询条件
		var getGroups = function () {
			$http.get('/api/political/groups?page=1&per_page=1000')
				.success(function (data) {
					console.log(data.items);
					if (data.total > 12) {
						partGroups = data.items.slice(0, 12);
					} else {
						partGroups = data.items;
					}
					allGroups = data.items;
					$scope.groups = partGroups;
				});
		};
		$scope.operGrade = '展开学年';
		$scope.operGroup = '展开分组';
		var isGradeExpand = true;
		var isGroupExpand = true;
		$scope.exOratrGrade = function () {
			if (isGradeExpand) {
				$scope.grades = allGrades;
				$scope.operGrade = '收起学年';
				isGradeExpand = false;
			} else {
				$scope.grades = partGrades;
				$scope.operGrade = '展开学年';
				isGradeExpand = true;
			}
		};
		$scope.exOratrGroup = function () {
			if (isGroupExpand) {
				$scope.groups = allGroups;
				$scope.operGroup = '收起分组';
				isGroupExpand = false;
			} else {
				$scope.groups = partGroups;
				$scope.operGroup = '展开分组';
				isGroupExpand = true;
			}
		};
		//选择学年查询条件
		$scope.get_checked_grade = function (grade_id) {
			$scope.gradeId = grade_id;
			$scope.tableParams.reload();
		};
		//选择分组查询条件
		$scope.get_checked_group = function (group_id) {
			$scope.groupId = group_id;
			$scope.tableParams.reload();
		};
		var getPersonList = function () {
			//人员列表
			var NgTableParams = ngTableParams;
			var persons = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					var url = '/api/political/users/approved?page=' + params.page() + '&per_page=' + params.count();
					if ($scope.gradeId) {
						url += '&year=' + $scope.gradeId;
					}
					if ($scope.groupId) {
						url += '&group=' + $scope.groupId;
					}
					console.log(url);
					$http.get(url)
						.success(function (data) {
							persons = data.items;
							params.total(data.total);
							$defer.resolve(persons);
						});
				}
			});
		};
		//获取人员身份
		var getMemberType = function () {
			$http.get('/api/political/type')
				.success(function (data) {
					var identity = {};
					angular.forEach(data, function (value, key) {
						console.log(typeof key);
						var temp_key = key.toUpperCase();
						identity[temp_key] = value;
					});
					$scope.identity = identity;
					console.log($scope.identity);
					getPersonList();
				});
		};
		userService.load(true).then(function () {
			getGrades();
			getGroups();
			getMemberType();
		});
		//变更身份
		$scope.change = function (person) {
			$modal.open({
				templateUrl: 'partial/community/party_branch/party_persons/change.html',
				controller: 'ChangeCtrl',
				resolve: {
					person: function () {
						return person;
					}
				}
			});
		};
		//设置职务
		$scope.duty = function () {
			$state.go('party_info.duty', {reload: true});
		};
		//设置学年
		$scope.grade = function () {
			$state.go('party_info.grade', {reload: true});
		};
		//设置分组
		$scope.group = function () {
			$state.go('party_info.group', {reload: true});
		};
		//党建历程
		$scope.course = function (person_id) {
			$state.go('party_info.course', {
				personId: person_id,
				summaryId: 'null'
			}, {reload: true});
		};
		//发送私信
		$scope.letter = function (person) {
			$modal.open({
				templateUrl: 'partial/common/unpublished_reason.html',
				controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
					$scope.reason_title = '填写私信内容';
					$scope.receive = 'To: ' + person.user_obj.nickname;
					$scope.ok_btn = true;
					$scope.$watch('content', function (newValue) {
						if ($scope.content) {
							$scope.ok_btn = false;
						} else {
							$scope.ok_btn = true;
						}
					});
					$scope.ok = function () {
						$http.post('/api/admin/messages/' + person.user_obj.id, {
							'content': $scope.content
						})
						.success(function (data) {
							$rootScope.$emit(eventType.NOTIFICATION, {
	                            'type': 'POPMSG',
	                            'title': '消息',
	                            'message': '已经成功发送私信。'
	                        });
							$modalInstance.close('ok');
						});
					};
					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};
				}]
			});
		};
		$scope.$on('change', function () {
			console.log('this is change event');
			$scope.tableParams.reload();
		});
	});