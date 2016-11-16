angular.module('iwx')
	.controller('OrgInfoCtrl', function ($rootScope, $scope, $http, ngTableParams, $modal, eventType, $state) {
		//确认框参数
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		//定义组织表格的状态参数对象
		$scope.status_arr = [{
				id: 0,
				name: 'pendding',
				descript: '待审核',
				chosen: false
			}];
		$scope.c_type = '';
		if ($state.current.name === 'community_university.league') {
			$scope.c_type = 'committee';
		} else if ($state.current.name === 'community_university.stu_union') {
			$scope.c_type = 'tissue';
		} else if ($state.current.name === 'community_university.stu_org') {
			$scope.c_type = 'organization';
		} else {
			$scope.c_type = 'union';
			$scope.union = true;
		}
		$rootScope.$broadcast('changeMenu', $scope.c_type);
		$scope.is_verify = true;
		//选择表格状态
		$scope.chose_status = function (status) {
			if (status.chosen) {
				status.chosen = false;
				$scope.is_verify = true;
				//调用待审核组织列表
				$scope.tableParams.page(1);
				$scope.tableParams.reload();
			} else {
				status.chosen = true;
				$scope.is_verify = false;
				//调用全部社团组织列表
				$scope.tableParams.page(1);
				$scope.tableParams.reload();
			}
		};
		//创建组织表格
		var load_org = function () {
			var NgTableParams = ngTableParams;
			var communities = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			},{
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					var request_url;
					if ($scope.is_verify) {
						request_url = '/api/un/community?page=' + params.page() + '&per_page=' + params.count() + '&c_type=' + $scope.c_type;
					} else {
						request_url = '/api/un/pending_admins?page=' + params.page() + '&per_page=' + params.count() + '&c_type=' + $scope.c_type;
					}
					$http.get(request_url)
						.success(function (data) {
							communities = data.items;
							params.total(data.total);
							$defer.resolve(communities);
						});
				}
			});
		};
		load_org();
		
		//确认操作方法
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'verify_approved') {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'LONG_INFO',
					'message': '处理中...'
				});
				console.log('<要批准的社团管理员邮箱：>' + $scope.confirm.param);
				$http
					.get('/api/un/confirm/' + $scope.confirm.param)
					.success(function (data) {
						$rootScope.$emit(eventType.NOTIFICATION, null);
						$scope.tableParams.reload();
					});
			}
		};
		//私信
		$scope.private_letter = function (community_id) {
			$modal.open({
				templateUrl: 'partial/community/community_iWX/community_iWX_letter.html',
				controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
					$scope.ok = function () {
						var letter = {};
						letter['community_id'] = community_id;
						letter['content'] = $scope.content;
						console.log(letter);
						$http.post('/api/un/single/message/create', letter).success(function (data) {
							$modalInstance.close('ok');
							$rootScope.$emit(eventType.NOTIFICATION, {
								'type': 'POPMSG',
								'title': '消息',
								'message': '已经成功向社团管理员发送私信。'
							});
						});
					};
					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};
				}]
			});
		};
		//批准社团加入
		$scope.approve = function (email) {
			$scope.confirm.message = '确定批准该社团审核通过？';
			$scope.confirm.type = 'verify_approved';
			$scope.confirm.param = email;
			$('#confirmModal').modal();
		};
		//打开详情页面
		$scope.org_info_detail = function (community, admin) {
			$modal.open({
				templateUrl: 'partial/community/community_university/community_org_info/org_info_detail.html',
				controller: 'OrgInfoDetCtrl',
				resolve: {
					community: function () {
						return community;
					}
				}
			});
		};
	});