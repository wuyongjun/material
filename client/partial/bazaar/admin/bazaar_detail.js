angular.module('iwx')
	.controller('BazaarDetailCtrl', function ($scope, $rootScope, $state, $stateParams, $http, eventType, userService, $modal) {
		$scope.bazaar_id = $stateParams.id;
		$scope.page = $stateParams.page;
		//集市信息对象
		$scope.bazaar = {};
		//原图片字符串
		$scope.bazaar.old_images = '';
		//原图片数组
		$scope.oldImages = [];
		//新建集市消息
		if ($scope.bazaar_id === '-1') {
			$http.get('/api/admin/bazaar/type')
				.success(function (data) {
					$scope.bazaar_type_map = {};
					angular.forEach(data, function (value) {
						$scope.bazaar_type_map[value.alias] = value;
					});
					//根据url判断是什么类型的集市消息
					if ($state.current.name === 'sale_bazaar') {
					$scope.bazaar.type = $scope.bazaar_type_map['GIVE']['id'];
					} else if ($state.current.name === 'purchase_bazaar') {
						$scope.bazaar.type = $scope.bazaar_type_map['BUY']['id'];
					} else if ($state.current.name === 'lost_bazaar') {
						$scope.bazaar.type = $scope.bazaar_type_map['LOSE']['id'];
					} else {
						$scope.bazaar.type = $scope.bazaar_type_map['PICKUP']['id'];
					}
				});
		} else {
			//编辑修改已有的集市信息
			$http.get('/api/admin/bazaar/' + $scope.bazaar_id)
				.success(function (data) {
					$scope.bazaar = data;
					$scope.bazaar.type = $scope.bazaar.bazaar_type.id;
					$scope.bazaar.old_images = $scope.getOldImages($scope.bazaar.images);
					console.log($scope.bazaar);
				});
		}
		//获取登录用户和社团信息
		userService.load(true).then(function (user) {
			$scope.user = user;
		});
		$scope.getOldImages = function (image_arr) {
			var images_str = '';
			angular.forEach(image_arr, function (value, i) {
				var temp = value.substring(8, value.length);
				if (i !== image_arr.length - 1) {
					images_str += temp + ';';
				} else {
					images_str += temp;
				}
			});
			return images_str;
		};
		//删除要上传的图片文件
		$scope.removeImageFile = function (flag, images, index) {
			//创建一个临时的新上传图片数组
			var newImages = [];
			angular.forEach(images, function (value, i) {
				if (i !== index) {
					newImages.push(value);
				}
			});
			if (flag === 'create') {
				$scope.bazaar.images = newImages;
			} else if (flag === 'update') {
				$scope.bazaar.newImages = newImages;
			} else {
				$scope.bazaar.old_images = $scope.getOldImages(newImages);
				console.log($scope.bazaar.old_images);
				$scope.bazaar.images = newImages;
			}
		};
		//验证集市信息
		var validate = function () {
			var price_exp = /^\+?[1-9][0-9]*$/;
			if (!$scope.bazaar.topic || $scope.bazaar.topic.length < 5 || $scope.bazaar.topic.length > 20) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请输入5~20个字符作为标题'
				});
				return false;
			}
			if ($scope.bazaar.type === 6 || $scope.bazaar.type === 7) {
				if (!$scope.bazaar.price || !price_exp.test($scope.bazaar.price)) {
					$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请正确输入价格'
				});
				return false;
				}
			}
			if (!$scope.bazaar.content) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '请填写详情内容'
				});
				return false;
			}
			return true;
		};
		//保存集市信息
		$scope.save_bazaar = function (isPublish) {
			$scope.bazaar.publish = isPublish;
			if (!validate()) {
				return;
			}
			//创建表单数据对象
			var fd = new FormData();
			if ($scope.bazaar_id === '-1') {
				if (!$scope.bazaar.images) {
					$scope.bazaar.images = [];
				}
				if ($scope.bazaar && $scope.bazaar.images && $scope.bazaar.images.length > 6) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '警告',
						'message': '最多上传6张图片'
					});
					return;
				}
				console.log($scope.bazaar);
				angular.forEach($scope.bazaar, function (value, key) {
					if (key !== 'images') {
						fd.append(key, value);
					}
				});
				angular.forEach($scope.bazaar.images, function (value, key) {
					fd.append('images', value);
				});
				$http.post('/api/admin/bazaar/create', fd, {
					transformRequest: angular.identity,
					headers: {
						'Content-Type': undefined
					}
				}).success(function (data) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '恭喜你，创建成功！'
					});
					$state.go('activity.bazaar', {
						'id': $scope.user.managed_community.id,
						'currentPage': 1,
						'page': 1
					},{reload: true});
				});
			//修改表单数据对象
			} else {
				if (!$scope.bazaar.newImages) {
					$scope.bazaar.newImages = [];
				}
				if ($scope.bazaar.newImages && $scope.bazaar.newImages.length > 6) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '警告',
						'message': '最多上传6张图片'
					});
					return;
				}
				if ($scope.bazaar.images && $scope.bazaar.images.length > 0 && ($scope.bazaar.images.length + $scope.bazaar.newImages.length) > 6) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '警告',
						'message': '最多上传6张图片'
					});
					return;
				}
				var fd_up = new FormData();
				console.log($scope.bazaar);
				fd_up.append('type', $scope.bazaar.bazaar_type.id);
				fd_up.append('topic', $scope.bazaar.topic);
				fd_up.append('content', $scope.bazaar.content);
				fd_up.append('price', $scope.bazaar.price);
				fd_up.append('publish', isPublish);
				fd_up.append('old_images', $scope.bazaar.old_images);
				angular.forEach($scope.bazaar.newImages, function (value) {
					fd_up.append('images', value);
				});
				$http.put('/api/admin/bazaar/' + $scope.bazaar_id + '/update', fd_up, {
					transformRequest: angular.identity,
					headers: {
						'Content-Type': undefined
					}
				}).success(function (data) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '恭喜你，修改成功！'
					});
					$state.go('activity.bazaar', {
						'id': $scope.user.managed_community.id,
						'currentPage': 1,
						'page': $scope.page
					},{reload: true});
				});
			}
		};
		//查看大图
		$scope.viewImage = function (image_path) {
			$modal.open({
				template: '<div><img style="width:100%" src=' + image_path + '></div>',
				size: "lg",
			});
		};
	});