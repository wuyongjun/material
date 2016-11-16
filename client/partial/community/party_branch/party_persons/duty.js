angular.module('iwx')
	.controller('DutyCtrl', function ($scope, $http, $modal, ngTableParams, userService) {
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		//新建职务
		$scope.createDuty = function () {
			$modal.open({
				templateUrl: 'partial/community/party_branch/duty_detail/edit_duty.html',
				controller: 'EditDutyCtrl',
				resolve: {
					duty: function () {
						return {id: -1};
					}
				}
			});
		};
		var getDuties = function () {
			var NgTableParams = ngTableParams;
			var duties = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http.get('/api/political/duties?page=' + params.page() + '&per_page=' + params.count())
						.success(function (data) {
							/*var data = {
								items: [{id: 1, name: '部长', describe: '这是最高官职', createtime: 1442991218000, number: 5}],
								total: 1
							};*/
							duties = data.items;
							params.total(data.total);
							$defer.resolve(duties);
						});
					
				}
			});
		};
		
		userService.load(true).then(function () {
			getDuties();
		});
		//查看成员
		$scope.members = function (duty) {
			$modal.open({
				templateUrl: 'partial/community/party_branch/members.html',
				controller: 'MembersCtrl',
				resolve: {
					obj: function () {
						return duty;
					},
					type: function () {
						return { description: 'duty' };
					}
				}
			});
		};
		//编辑职务
		$scope.edit = function (duty) {
			$modal.open({
				templateUrl: 'partial/community/party_branch/duty_detail/edit_duty.html',
				controller: 'EditDutyCtrl',
				resolve: {
					duty: function () {
						return duty;
					}
				}
			});
		};
		//删除职务
		$scope.delete = function (duty_id) {
			$scope.confirm.message = '确定要删除该职务？';
			$scope.confirm.type = 'delDuty';
			$scope.confirm.param = duty_id;
			$('#confirmModal').modal();
		};
		//确认框方法
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delDuty') {
				$http.delete('/api/political/duty/' + $scope.confirm.param + '/del')
					.success(function (data) {
						$scope.tableParams.reload();
					});
			}
		};
		//刷新职务表格
		$scope.$on('flushDutyList', function () {
			$scope.tableParams.reload();
		});
	});