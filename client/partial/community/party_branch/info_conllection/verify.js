angular.module('iwx')
	.controller('VerifyCtrl', function ($scope, $http, ngTableParams, eventType, $modal, $state, userService) {
		//人员查询条件
		var allGrades = [];
		var partGrades = [];
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
		$scope.operGrade = '展开学年';
		var isGradeExpand = true;
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
		//选择学年查询条件
		$scope.get_checked_grade = function (grade_id) {
			$scope.gradeId = grade_id;
			$scope.tableParams.reload();
		};
		var loadApplyPerson = function () {
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
					var url = '/api/political/users/pending?page=' + params.page() + '&per_page=' + params.count();
					if ($scope.gradeId) {
						url += '&year=' + $scope.gradeId;
					}
					if ($scope.identityId) {
						url += '&status=' + $scope.identityId;
					}
					console.log(url);
					$http.get(url)
						.success(function (data) {
							/*data = {
								items:[{id:1, nickname: '坏叔叔', name: '黄渤', sex: 'MALE', major: '计算机科学与技术', admission_date: '2013-7-7',
									identity: 'POSITIVE', phone: '13927658341', apply_time: 1403576402000,
									duty: {id: 1, name: '部长'}, 
									group: {id: 1, name: '党建一队'}, 
									grade: {id: 3, name: '2016'}}],
								total: 1
							};*/
							$scope.person_sum = data.total;
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
					$scope.identities = [];
					angular.forEach(data, function (value, key) {
						console.log(typeof key);
						var temp = {};
						temp['id'] = key;
						temp['name'] = value;
						$scope.identities.push(temp);
						var temp_key = key.toUpperCase();
						identity[temp_key] = value;
					});
					$scope.identity = identity;
					console.log($scope.identity);
					loadApplyPerson();
				});
		};
		//选择身份筛选条件
		$scope.get_checked_identity = function (identity_id) {
			$scope.identityId = identity_id;
			$scope.tableParams.reload();
		};
		userService.load(true).then(function () {
			getGrades();
			getMemberType();
		});
		
		//刷新表格
		var reloadTable = function () {
			$scope.tableParams.reload();
		};
		//录入
		$scope.approve = function (person_id) {
			$http.post('/api/political/user/' + person_id + '/approve')
				.success(function (data) {
					reloadTable();
				});
		};
		//信息有误
		$scope.refuse = function (id, person) {
			$modal.open({
				templateUrl: 'partial/common/unpublished_reason.html',
				controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
					$scope.reason_title = '填写信息有误理由';
					$scope.receive = 'To: ' + person.nickname;
					$scope.ok_btn = true;
					$scope.$watch('content', function (newValue) {
						if ($scope.content) {
							$scope.ok_btn = false;
						} else {
							$scope.ok_btn = true;
						}
					});
					$scope.ok = function () {
						//拒绝录入
						$http.post('/api/political/user/' + id + '/reject')
							.success(function (data) {
								//拒绝成功发送私信给该用户
								$http.post('/api/admin/messages/' + person.id, {
									'content': $scope.content
								})
								.success(function (data) {
									$modalInstance.close('ok');
									reloadTable();
								});
							});
					};
					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};
				}]
			});
		};
	});