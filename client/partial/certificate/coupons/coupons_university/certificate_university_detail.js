angular.module('iwx')
	.controller('certificateUniversityDetailCtrl', function ($scope, $rootScope, $http, $stateParams, ngTableParams, eventType) {
		$scope.coupon_id = parseInt($stateParams.id);
		//确认框参数
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		//电子凭证使用状态
		$scope.coupon_status = {
			'NEW': {
				'text': '未使用',
				'label': 'label label-info'
			},
			'USED': {
				'text': '已使用',
				'label': 'label label-success'
			},
			'EXPIRED': {
				'text': '已过期',
				'label': 'label label-warning'
			},
			'RETRIEVE': {
				'text': '已作废',
				'label': 'label label-danger'
			}
		};
		//电子凭证使用详情
		var NgTableParams = ngTableParams;
		var coupon_details = null;
		$scope.tableParams = new NgTableParams({
			page: 1,
			count: 10
		}, {
			counts: [],
			total: 0,
			getData: function ($defer, params) {
				var url = '/api/goods/' + $scope.coupon_id + '/users';
				$http
					.get(url + '?page=' + params.page() + '&per_page=' + params.count())
					.success(function (data) {
						console.log(data);
						coupon_details = data.items;
						params.total(data.total);
						$defer.resolve(coupon_details);
					});
			}
		});
		//操作确认提示
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'takeback_coupon') {
				var url = '';
				$scope.tableParams.reload();
				/*$http
					.post(url + $scope.confirm.param)
					.success(function (data) {
						$scope.tableParams.reload();
					});*/
			}
		};
		//收回电子礼券
		$scope.takeback_coupon = function (id) {
			$scope.confirm.message = '您确定要收回这个电子凭证吗?';
            $scope.confirm.type = 'takeback_coupon';
            $scope.confirm.param = id;
            $("#confirmModal").modal();
            return;
		};
	});