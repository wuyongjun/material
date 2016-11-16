angular.module('iwx')
	.controller('certificateUniversityCreateCtrl', function ($scope, $http, $rootScope, ngTableParams, eventType, $filter) {
		$scope.coupon = {};
		//验证参数
		$scope.validation = function () {
			console.log($scope.coupon.end_time);
			console.log($filter('date')(new Date(), 'yyyy-MM-dd HH:mm'));
			if ($scope.coupon.title === undefined || $scope.coupon.title === '') {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请正确输入名称'
				});
				return false;
			}
			if ($scope.coupon.end_time === undefined || $scope.coupon.end_time === '') {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请正确输入结束时间'
				});
				return false;
			}
			if ($scope.coupon.sponsor_name === undefined || $scope.coupon.sponsor_name === '') {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请正确输入赞助商名称'
				});
				return false;
			}
			if ($scope.coupon.total === undefined || isNaN(parseInt($scope.coupon.total)) || parseInt($scope.coupon.total) <= 0) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请正确输入总数'
				});
				return false;
			}
			return true;
		};
		//获取表单参数
		var getFormData = function () {
			var fd = new FormData();
			fd.append('end_time', $scope.coupons.end_time);
			fd.append('title', $scope.coupons.title);
			fd.append('sponsor_name', $scope.coupons.sponsor_name);
			fd.append('sponsor_logo', $scope.coupons.sponsor_logo);
			fd.append('image', $scope.coupons.image);
			fd.append('total', $scope.coupons.total);
			return fd;
		};
		//创建电子凭证
		$scope.create = function () {
			if (!$scope.validation()) {
				return;
			}
			var url = '';
			$http
				.post(url, getFormData(), {
					headers: {
						'Content-Type': undefined
					}
				})
				.success(function (data) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '警告',
						'message': '成功创建电子凭证。'
					});
				});
		};
	});