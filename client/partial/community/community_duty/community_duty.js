angular.module('iwx')
	.controller('CommDutyCtrl', function ($scope, $rootScope, $http, ngTableParams, $modal, eventType, $state) {
		$scope.confirm = {};
		$scope.confirm.title = "请确定您的操作";
		$scope.confirm.message = "MESSAGE";
		$scope.confirm.type = "";
		$scope.confirm.param = "";
		
		//创建职务
		$scope.createDuty = function () {
			//检测是否存在部门
			$http.get('/api/admin/department')
				.success(function (data) {
					if (data.length === 0) {
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type': 'POPMSG',
							'title': '',
							'message': '需要先创建部门，才能创建对应的部门职位。'
						});
						$state.go('community.department', {
							reload: true
						});
					} else {
						var duty = {
							'id': -1
						};
						$modal.open({
							templateUrl: 'partial/community/community_duty/community_duty_detail.html',
							controller: 'DutyDetailCtrl',
							resolve: {
								duty: function () {
									return duty;
								}
							}
						});
					}
				});
		};
		//编辑职务
		$scope.editDuty = function (duty) {
			$modal.open({
				templateUrl: 'partial/community/community_duty/community_duty_detail.html',
				controller: 'DutyDetailCtrl',
				resolve: {
					duty: function () {
						return duty;
					}
				}
			});
		};
		//删除社团部门
		$scope.delDuty = function (dutyId) {
			$scope.confirm.message = "确定要删除该职务？";
			$scope.confirm.type = "delDuty";
			$scope.confirm.param = dutyId;
			$('#confirmModal').modal();
		};
		//加载社团部门列表
		var NgTableParams = ngTableParams;
		var duty = null;
		$scope.tableParams = new NgTableParams({
			page: 1,
			count: 50
		}, {
			counts: [],
			total: 0,
			getData: function ($defer, params) {
				$http.get('/api/admin/duty/all')
					.success(function (data) {
						if (data.length === 0) {
							$scope.showTable = false;
							$scope.note_message = '目前还没有职务，点击“新建职务”按钮创建本社第一份职务吧~~';
						} else {
							$scope.showTable = true;
							duty = data;
							params.total(data.length);
							$defer.resolve(duty.slice((params.page() - 1) * params.count(), params.page() * params.count()));
						}
					});
			}
		});
		//注册刷新列表事件
		$scope.$on('flushDutyList', function () {
			$scope.tableParams.reload();
		});
		//确认框方法
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delDuty') {
				$http.delete('/api/admin/duty/' + $scope.confirm.param + '/delete')
					.success(function (data) {
						$scope.tableParams.reload();
					});
			}
		};
		//将职务分配给社员
		$scope.addDutyMember = function (duty) {
			$modal.open({
				templateUrl: 'partial/community/community_duty/comm_add_duty_member.html',
				controller: 'CommDutyMemCtrl',
				resolve: {
					duty : function () {
						return duty;	
					}
				}
			});
		};
	});