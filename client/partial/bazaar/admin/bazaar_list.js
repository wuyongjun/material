angular.module('iwx')
	.controller('BazaarListCtrl', function ($scope, $rootScope, $http, ngTableParams, eventType, $state, userService, $stateParams) {
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		$scope.currentPage = $stateParams.page;
		$scope.act_page = $stateParams.currentPage;
		//集市信息类型id
		$scope.bazaar_alias_array = [];
		//获取校园集市类型
		$http.get('/api/admin/bazaar/type')
			.success(function (data) {
				$scope.bazaar_type = data;
				angular.forEach($scope.bazaar_type, function (bazaar) {
					bazaar.chosen = false;
				});
			});
		//创建校园集市
		$scope.createBazaar = function () {
			$state.go('create_bazaar');
		};
		//加载集市信息表格
		var loadBazaar = function () {
			var NgTableParams = ngTableParams;
			var bazaar = null;
			$scope.tableParams = new NgTableParams({
				page: $scope.currentPage,
				// page: 1,
				count: 10
			}, {
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					$scope.currentPage = params.page();
					var request_param;
					if ($scope.bazaar_alias_array.length !== 0) {
						var bazaar_alias = '';
						for (var i = 0;i < $scope.bazaar_alias_array.length;i++) {
							if (i !== $scope.bazaar_alias_array.length - 1) {
								bazaar_alias += $scope.bazaar_alias_array[i] + '-';
							} else {
								bazaar_alias += $scope.bazaar_alias_array[i];
							}
						}
						request_param = '?page='+params.page() + '&per_page=' + params.count() + '&bazaar_type=' + bazaar_alias;
					} else {
						request_param = '?page='+params.page() + '&per_page=' + params.count();
					}

					$http.get('/api/admin/bazaar/' + $stateParams.id + '/me' + request_param)
						.success(function (data) {
							$scope.bazaar_total = data.total;
							bazaar = data.items;
							params.total(data.total);
							$defer.resolve(bazaar);
						});
				}
			});
		};
		loadBazaar();
		//选择集市类型条件
		$scope.choseBazaarType = function (type) {
			if (type.chosen) {
				type.chosen = false;
				for (var i=0;i<$scope.bazaar_alias_array.length;i++) {
					if ($scope.bazaar_alias_array[i] === type.alias) {
						$scope.bazaar_alias_array.splice(i, 1);
						break;
					}
				}
				$scope.tableParams.page(1);
				$scope.tableParams.reload();
			} else {
				type.chosen = true;
				$scope.bazaar_alias_array.push(type.alias);
				$scope.tableParams.page(1);
				$scope.tableParams.reload();
			}
			console.log($scope.bazaar_alias_array);
		};
		//确定方法
		$scope.confirm = function () {
			if ($scope.confirm.type === 'DEL_BAZAAR') {
				$http
					.delete('/api/admin/bazaar/' + $scope.confirm.param + '/delete')
					.success(function () {
						$scope.tableParams.reload();
					});
			} else if ($scope.confirm.type === 'PUBLISHBAZ') {
				$http
					.post('/api/admin/bazaar/' + $scope.confirm.param + '/publish')
					.success(function () {
						$scope.tableParams.reload();
					});
			} else if ($scope.confirm.type === 'UNPUBLISHBAZ') {
				$http
					.post('/api/admin/bazaar/' + $scope.confirm.param + '/unpublish')
					.success(function () {
						$scope.tableParams.reload();
					});
			}
		};
		//发布或取消集市消息
		$scope.togglePubBaz = function (bazaar_id, publish) {
			var action = publish ? 'unPublishBaz' : 'publishBaz';
			if (action === 'unPublishBaz') {
				$scope.confirm.message = '您确定要取消发布该条集市消息？';
				$scope.confirm.type = 'UNPUBLISHBAZ';
			} else {
				$scope.confirm.message = '您确定要发布该条集市消息？';
				$scope.confirm.type = 'PUBLISHBAZ';
			}
			$scope.confirm.param = bazaar_id;
			$('#confirmModal').modal();
			return;
		};
		//编辑集市消息
		$scope.goToBazDetail = function (bazaar_id, bazaar_type, currentPage, act_page) {
			var root_url = '';
			if (bazaar_type === 'GIVE') {
				root_url = 'sale_bazaar';
			} else if (bazaar_type === 'BUY') {
				root_url = 'purchase_bazaar';
			} else if (bazaar_type === 'LOSE') {
				root_url = 'lost_bazaar';
			} else {
				root_url = 'pick_bazaar';
			}
			$state.go(root_url, {
				'id': bazaar_id,
				'page': currentPage,
				'currentPage': act_page
			});
		};
		//删除集市消息
		$scope.delBazaar = function (bazaar_id) {
			$scope.confirm.message = '您确定要删除该条集市信息？';
			$scope.confirm.type = 'DEL_BAZAAR';
			$scope.confirm.param = bazaar_id;
			$('#confirmModal').modal();
		};
		//新闻被取消发布日志页面
		$scope.goToUnpubLog = function (type, bazaar_id) {
			$state.go('activity.unpublishLog_bazaar', {
				'type': type,
				'id': bazaar_id
			});
		};
	});
