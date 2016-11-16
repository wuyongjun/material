angular.module('iwx')
	.controller('CommMemberDepCtrl', function ($scope, $rootScope, $http, ngTableParams, $modalInstance, userId, eventType) {
		//待审核的用户id
		$scope.userId = userId;
		$scope.choose_department_btn = true;
		var NgTableParams = ngTableParams;
		var department = null;
		$scope.tableParams = new NgTableParams({
			page: 1,
			count: 50,
		}, {
			counts: [],
			total: 0,
			getData: function ($defer, params) {
				$http.get('/api/admin/department?page=' + params.page() + '&per_page=' + params.count())
					.success(function (data) {
						department = data;
						params.total(data.length);
						$defer.resolve(department);
					});
			}
		});
		//批准成员
		var approve_member = function () {
			var param = {
				'status': 'APPROVED',
				'department_id': 0
			};
			if ($scope.department) {
				param.department_id = $scope.department;
			}
			console.log(param);

			$http.post('/api/admin/community/register/users/' + $scope.userId + '/decision', param)
				.success(function (data) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
	                    'title': '消息',
	                    'message': '批准成功'
					});
					//通知表格刷新
					$rootScope.$broadcast('verify_members_tab');
					//刷新社员信息表
					$rootScope.$broadcast('getUserEvent');
				});
		};
		//取消选择部门
		$scope.cancel = function () {
			$modalInstance.close('ok');
			approve_member();
		};
		//获取选中的部门
		$scope.get_checked_department = function (checked_department) {
			$scope.department = checked_department;
			$scope.choose_department_btn = false;
			console.log('选中的部门：' + $scope.department);
		};
		//确定选中的部门
		$scope.choose_department = function () {
			$modalInstance.close('ok');
			approve_member();
		};
	});