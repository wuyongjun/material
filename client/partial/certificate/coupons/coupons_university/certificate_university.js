angular.module('iwx')
	.controller('certificateUniversityCtrl', function ($scope, $http, $rootScope, ngTableParams, eventType, $modal, $state) {
		console.log('certificateUniversityCtrl');
		$scope.university = '中央民族大学';
		//确认框参数
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		//电子凭证信息表格
		var NgTableParams = ngTableParams;
		var coupons = null;
		$scope.tableParams = new NgTableParams({
			page: 1,
			count: 10
		}, {
			counts: [],
			total: 0,
			getData: function ($defer, params) {
				var url = '/api/admin/community/register/users';
				$http
					.get(url + '?page=' + params.page() + '&per_page=' + params.count())
					.success(function (data) {
						coupons = data.items;
						params.total(data.total);
						$defer.resolve(coupons);
					});
			}
		});
		//操作确认提示
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delete_coupon') {
				var url = '';
				$http
					.delete(url + $scope.confirm.param)
					.success(function () {
						$scope.tableParams.reload();
					});
			}
		};
		//删除电子凭证
		$scope.delete_coupon = function (coupon_id) {
			$scope.confirm.message = '您确定要删除这个电子凭证吗?';
            $scope.confirm.type = 'delete_coupon';
            $scope.confirm.param = coupon_id;
            $("#confirmModal").modal();
            return;
		};
		//查看电子礼券使用详情
		$scope.detail_coupon = function (coupon_id) {
			$state.go('certificate_coupons_university.details', {
				'id': '36'
			}, {
				reload: true
			});
		};
		//获取大图  /images/images/placeholder.png
		$scope.viewImage = function(image) {
			image = '/static/images/example.png';
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
	});