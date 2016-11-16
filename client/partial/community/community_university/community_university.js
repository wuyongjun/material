angular.module('iwx')
	.controller('communityUniversityCtrl', function ($scope, $rootScope, $http, $modal, $state, ngTableParams, eventType) {
		$rootScope.welcome_bg = false;
		//确认框参数
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		//确认操作方法
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delete_community') {
				$http
					.delete('' + $scope.confirm.param)
					.success(function () {
						$scope.tableParams.reload();
					});
			} else if ($scope.confirm.type === 'disable_community') {
				$http
					.post('/api/un/manager/' + $scope.confirm.param + '/use')
					.success(function (data) {
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type': 'POPMSG',
							'title': '消息',
							'message': '禁用社团成功'
						});
						$scope.tableParams.reload();
					});

			}else if ($scope.confirm.type === 'enable_community') {
				$http
					.post('/api/un/manager/' + $scope.confirm.param + '/use')
					.success(function (data) {
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type': 'POPMSG',
							'title': '消息',
							'message': '启用社团成功。'
						});
						$scope.tableParams.reload();
					});

			} else if ($scope.confirm.type === 'verify_approved') {
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
		//社团信息表格
		var load_university_communities = function () {
			var NgTableParams = ngTableParams;
			var communities = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$http
						.get('/api/un/community?page=' + params.page() + '&per_page=' + params.count() + '&c_type=committee')
						.success(function (data) {
							communities = data.items;
							params.total(data.total);
							$defer.resolve(communities);
						});
				}
			});
		};
		load_university_communities();
		//给通过审核的社团发私信
		$scope.privateLetter = function (communityId) {
			$modal.open({
				templateUrl: 'partial/community/community_iWX/community_iWX_letter.html',
				controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
					$scope.ok = function () {
						var letter = {};
						letter['community_id'] = communityId;
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
		//禁用社团
		$scope.disable_community = function (admin_user_id) {
			$scope.confirm.message = '如果禁用社团，该社团管理员将无法登录，是否继续?';
            $scope.confirm.type = 'disable_community';
            $scope.confirm.param = admin_user_id;
            $("#confirmModal").modal();
		};
		//启用社团
		$scope.enable_community = function (admin_user_id) {
			$scope.confirm.message = '您确定要启用这个社团吗?';
            $scope.confirm.type = 'enable_community';
            $scope.confirm.param = admin_user_id;
            $("#confirmModal").modal();
		};
		//删除社团信息
		$scope.delete_community = function (communityId) {
			$scope.confirm.message = '您确定要删除这个社团吗?';
            $scope.confirm.type = 'delete_community';
            $scope.confirm.param = communityId;
            $("#confirmModal").modal();
            return;
		};
		//批准社团通过审核
		$scope.approved = function (email) {
			$scope.confirm.message = '确定批准该社团审核通过？';
			$scope.confirm.type = 'verify_approved';
			$scope.confirm.param = email;
			$('#confirmModal').modal();
		};
		//拒绝社团通过审核
		$scope.reject = function (community_id) {
			$scope.confirm.message = '确定拒绝该社团审核通过？';
			$scope.confirm.type = 'verify_reject';
			$scope.confirm.param = community_id;
			$('#confirmModal').modal();
		};
		//获取大图  /images/images/placeholder.png
		$scope.viewImage = function(image) {
			try {
				var tempArr = image.split('/');
				if (tempArr[tempArr.length - 1] === 'placeholder.png') {
					return;
				}
			} catch (e) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '图片路径不正确'
				});
				return;
			}
			$modal.open({
				template: '<div><img style="width:100%" src=' + image + '></div>',
				size: "lg",
			});
		};
		//tree option and data
		$scope.treeOptions = {
		   	nodeChildren: 'children',
		    dirSelectable: true,
		    injectClasses: {
		        ul: 'a1',
		        li: 'a2',
		        liSelected: 'a7',
		        iExpanded: 'a3',
		        iCollapsed: 'a4',
		        iLeaf: 'a5',
		        label: 'a6',
		        labelSelected: 'tree_selected'
		    }
		};
		//tree data model
		$scope.dataForTheTree =[
			{'nickname' : '社团信息', 'id' : 1, 'children': [{
				'nickname' : '社团列表', 'id' : 3, 'parent_id' : 1
			},{
				'nickname' : '待审核社团', 'id' : 4, 'parent_id' : 1
			}]},
			{'nickname' : '社团活动审批', 'id' : 2, 'children': [{
				'nickname' : '审批设置', 'id' : 5, 'parent_id': 2
			}]}
		];
		$scope.expandedNodes = [];
		for (var i = 0;i < $scope.dataForTheTree.length;i++) {
			$scope.expandedNodes.push($scope.dataForTheTree[i]);
		}
		$scope.$on('changeMenu', function (obj, param) {
			if (param === 'committee') {
				$scope.menu_name = '院系团委';
			} else if (param === 'tissue') {
				$scope.menu_name = '院系学生会';
			} else if (param === 'organization') {
				$scope.menu_name = '校级学生组织';
			} else {
				$scope.menu_name = '学生社团';
			}
		});
		
	});