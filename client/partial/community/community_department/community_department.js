angular.module('iwx')
	.controller('CommDepartmentCtrl', function ($scope, $rootScope, $http, ngTableParams, $modal) {
		$scope.confirm = {};
		$scope.confirm.title = "请确定您的操作";
		$scope.confirm.message = "MESSAGE";
		$scope.confirm.type = "";
		$scope.confirm.param = "";
		
		//创建社团部门
		$scope.createDepartment = function () {
			var department = {
				'id': -1
			};
			$modal.open({
				templateUrl: 'partial/community/community_department/community_department_detail.html',
				controller: 'DepDetailCtrl',
				resolve: {
					department: function () {
						return department;
					}
				}
			});
		};
		//编辑社团部门
		$scope.editDepartment = function (department) {
			$modal.open({
				templateUrl: 'partial/community/community_department/community_department_detail.html',
				controller: 'DepDetailCtrl',
				resolve: {
					department: function () {
						return department;
					}
				}
			});
		};
		//删除社团部门
		$scope.delDepartment = function (departmentId) {
			$scope.confirm.message = "确定要删除该部门？";
			$scope.confirm.type = "delDepartment";
			$scope.confirm.param = departmentId;
			$('#confirmModal').modal();
		};
		//加载社团部门列表
		var NgTableParams = ngTableParams;
		var department = null;
		$scope.tableParams = new NgTableParams({
			page: 1,
			count: 50
		}, {
			counts: [],
			total: 0,
			getData: function ($defer, params) {
				//发送部门列表请求
				$http.get('/api/admin/department?page=' + params.page() + '&per_page=' + params.count())
					.success(function (data) {
						if (data.length === 0) {
							$scope.showTable = false;
							$scope.note_message = '目前还没有部门，点击“新建部门”按钮创建第一个本社部门吧~~';
						} else {
							$scope.showTable = true;
							department = data;
							params.total(data.length);
							$defer.resolve(department.slice((params.page() - 1) * params.count(), params.page() * params.count()));
						}
					});
			}
		});
		//注册刷新列表事件
		$scope.$on('flushDepartmentList', function () {
			$scope.tableParams.reload();
		});
		//确认框方法
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delDepartment') {
				$http.delete('/api/admin/department/' + $scope.confirm.param + '/delete')
					.success(function (data) {
						$scope.tableParams.reload();
					});
			}
		};
		//添加部门成员
		$scope.addDepMember = function (department) {
			$modal.open({
				templateUrl: 'partial/community/community_department/community_add_dep_member.html',
				controller: 'CommAddDepMemCtrl',
				resolve: {
					department: function () {
						return department;
					}
				}
			});
		};
		//注册表格刷新事件
		$scope.$on('flushDepartmentList', function () {
			$scope.tableParams.reload();
		});
	});