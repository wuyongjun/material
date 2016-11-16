angular.module('iwx')
	.controller('CommunityElectionCtrl', function ($scope, $rootScope, $http, userService, $modal, $stateParams, eventType) {
		// console.log($stateParams.id);
		//获取现管理员用户信息
		userService.load()
			.then(function (user) {
				$scope.user = user;
			});
		//选择新的管理员用户
		$scope.choose_new_manager = function () {
			$modal.open({
				templateUrl: 'partial/community/community_election_members.html',
				controller: 'CommElecMembersCtrl',
				resolve: {

				}
			});
		};
		//选中新管理员事件
		$scope.$on('member_choosed', function (d, param) {
			$scope.new_manager = true;
			//根据id获取用户信息
			$http
				.get('/api/admin/community/register/users/' + param)
				.success(function (data) {
					$scope.new_user = data;
				});
		});
		//申请换届方法
		$scope.election = function (user_id) {
			if (!$scope.new_user.user.email) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '消息',
					'message': '请正确填写新管理员邮箱。'
				});
				return;
			} else if ($scope.new_user.user.photo_id === '/images/images/placeholder.png') {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '消息',
					'message': '请选择新管理员证件照。'
				});
				return;
			}
			var fd = new FormData();
			fd.append('email', $scope.new_user.user.email);
			if (typeof $scope.new_user.user.photo_id !== 'string') {
				fd.append('photo_id', $scope.new_user.user.photo_id);
			}
			//修改新管理员信息
			$http
				.post('/api/admin/' + user_id + '/update', fd, {
					transformRequest: angular.identity,
					headers: {
						'Content-Type': undefined
					}
			    })
				.success(function (data) {
					$http
						.get('/api/admin/' + $stateParams.id + '/election/' + $scope.new_user.user.id)
						.success(function (data) {
							$rootScope.$emit(eventType.NOTIFICATION, {
								'type': 'POPMSG',
								'title': '消息',
								'message': '换届申请已成功提交，请等待上级管理员审批。'
							});
						});
				})
				.error(function (code) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '新管理员信息提交失败，换届申请终止。'
					});
				});
		};
	});