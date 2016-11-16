angular.module('iwx')
	.controller('GradeCtrl', function ($scope, $http, $modal, ngTableParams, userService) {
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		//获取学年列表
		var getGrades = function () {
			var NgTableParams = ngTableParams;
			var grades = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http.get('/api/political/years?page=' + params.page() + '&per_page=' + params.count())
						.success(function (data) {
							/*var data = {
								items: [{id: 1, name: '2016级', describe: '2016级当所有党员', createtime: 1442991218000, number: 2, starttime: 1442991218000, 
									endtime: 1442991218000}],
								total: 1
							};*/
							grades = data.items;
							params.total(data.total);
							$defer.resolve(grades);
						});
				}
			});
		};

		userService.load(true).then(function () {
			getGrades();
		});
		
		//新建学年
		$scope.createGrade = function () {
			$modal.open({
				templateUrl: 'partial/community/party_branch/grade_detail/edit_grade.html',
				controller: 'EditGradeCtrl',
				resolve: {
					grade: function () {
						return {id: -1};
					}
				}
			});
		};
		//编辑学年
		$scope.edit = function (grade) {
			console.log(grade);
			$modal.open({
				templateUrl: 'partial/community/party_branch/grade_detail/edit_grade.html',
				controller: 'EditGradeCtrl',
				resolve: {
					grade: function () {
						return grade;
					}
				}
			});
		};
		//查看成员
		$scope.members = function (grade) {
			$modal.open({
				templateUrl: 'partial/community/party_branch/members.html',
				controller: 'MembersCtrl',
				resolve: {
					obj: function () {
						return grade;
					},
					type: function () {
						return { description: 'grade' };
					}
				}
			});
		};
		//删除学年
		$scope.delete = function (grade_id) {
			$scope.confirm.message = '确定要删除该学年？';
			$scope.confirm.type = 'delGrade';
			$scope.confirm.param = grade_id;
			$('#confirmModal').modal();
		};
		//确认框方法
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delGrade') {
				$http.delete('/api/political/year/' + $scope.confirm.param + '/del')
					.success(function (data) {
						$scope.tableParams.reload();
					});
			}
		};
		//刷新学年列表
		$scope.$on('flushGradeList', function () {
			$scope.tableParams.reload();
		});
	});