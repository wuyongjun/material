angular.module('iwx')
	.controller('CommElecMembersCtrl', function ($scope, $rootScope, $http, ngTableParams, $modalInstance, $modal, eventType) {
		$scope.choose_member_btn = true;
		//加载社团成员
		$scope.load_community_members = function () {
			var NgTableParams = ngTableParams;
			var community_members;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 5
			}, {
				counts:[],
				total: 0,
				getData: function ($defer, params) {
					var url = '/api/admin/members?page='+params.page() + '&per_page=' + params.count();
					$http
						.get(url)
						.success(function (data) {
							community_members = data.items;
							params.total(data.total);
							$defer.resolve(community_members);
						});
				}
			});
		};
		$scope.load_community_members();
		//取消选择管理范围
		$scope.cancel = function () {
			$modalInstance.close('ok');
		};
		//通过单选框选中成员
		$scope.get_checked_user = function (checked_user) {
			$scope.member = checked_user;
			$scope.choose_member_btn = false;
			console.log('被选中的成员：' + $scope.member);
		};
		//确定选中的成员
		$scope.choose_member = function () {
			$rootScope.$broadcast('member_choosed', $scope.member);
			$modalInstance.close('ok');
		};
		//获取大图  /images/images/placeholder.png
		$scope.viewImage = function(image) {
			console.log(image);
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