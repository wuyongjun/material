angular.module('iwx')
	.controller('certificateCouponsIwxCtrl', function ($scope, $http, $rootScope, ngTableParams, eventType, $modal, $state) {
		//确认框参数
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		//条件搜索参数对象
	    $scope.search_params = {
	    	
	    };
	    //获取全国省份信息方法
	    $scope.load_province = function () {
	        //获取全部省份列表
	        $http
	            .get('/api/su/geography/0')
	            .success(function (data) {
	                $scope.provinceArray = data;
	                console.log($scope.provinceArray);
	            });
	    };
	    $scope.load_province();
	    //获取省份相应城市方法
	    $scope.load_city = function () {
	        //获取省份相应的城市列表
	        $http
	            .get('/api/su/geography/' + $scope.search_params.province_scope_id)
	            .success(function (data) {
	                $scope.cityArray = data;
	            });
	    };
	    //获取市相应的学校方法
	    $scope.load_university = function () {
	        //获取城市相应的学校列表
	        $http
	            .get('/api/su/'+$scope.search_params.city_scope_id+'/university')
	            .success(function (data) {
	                console.log(data);
	                $scope.universityArray = data;
	            });
	    };
	    //获取学校相应社团方法
	    $scope.load_community = function () {

	    };
	    //监听省份select列表
	    $scope.change_province = function () {
	        if ($scope.search_params.province_scope_id) {
	            $scope.load_city();
	        }
	    };
	    //监听市select列表
	    $scope.change_city = function () {
	        if ($scope.search_params.city_scope_id) {
	            $scope.load_university();
	        }
	    };
	    //监听学校select列表
	    $scope.change_university = function () {
	        if ($scope.search_params.university_scope_id) {
	            $scope.load_community();
	        }
	    };
	    
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
			$state.go('certificate_coupons_iWX.coupons_detail', {
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