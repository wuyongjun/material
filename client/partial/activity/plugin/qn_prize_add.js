angular.module('iwx')
	.controller('QnPrizeAddCtrl', 
		function ($scope, $state, $modalInstance, eventType, $rootScope, $http, ngTableParams, questionnaire_id, activity_id, $modal) {
			//如果没有任何电子礼券，则跳转至礼券模块进行添加
			$scope.goToCertificate = function () {
				$modalInstance.close('ok');
				$state.go('certificate', {reload : true});
			};
			//取消添加礼券
			$scope.cancel = function () {
				$modalInstance.close('ok');
			};
			//放大物品图片
			$scope.viewImage = function (image) {
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
					template : '<div><img style="width:100%" src=' + image + '></div>',
					size : 'lg'
				});
			};
			//获取问卷信息
			var getQuestionnaire = function (questionnaire_id) {
				$http.get('/api/questionnaires/' + questionnaire_id)
					.success(function (data) {
						$scope.questionnaire = data.ques;
					});
			};
			getQuestionnaire(questionnaire_id);
			//分页获取电子礼券列表
			var loadCouponList = function () {
				var NgTableParams = ngTableParams;
				var coupons = null;
				$scope.tableParams = new NgTableParams({
					page: 1,
					count: 5,
				}, {
					counts: [],
					total: 0,
					getData: function($defer, params) {
						$http.get('/api/goods/community?page='+params.page() + '&per_page=' + params.count())
							.success(function(data) {
								// data = {items:[],total:0};
								if (data.total === 0) {
									$scope.note = true;
								}
								coupons = data.items;
								params.total(data.total);
								$defer.resolve(coupons);
							});
					}
				});
			};
			loadCouponList();
			//更改奖品数量
			$scope.add = function (prize, coupon) {
				if (!prize) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type' : 'POPMSG',
						'title' : '警告',
						'message' : '请填写礼券数量' 
					});
					return;
				}
				console.log(coupon.total + '-----' + prize.number);
				if ((coupon.remain - (prize.number || 0)) < 0) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type' : 'POPMSG',
						'title' : '警告',
						'message' : '礼券数量不够'
					});
					return;
				}
				//判断礼券有效日期和问卷设置的最后兑奖日期
				console.log(coupon.end_time);
				console.log($scope.questionnaire.exchange_time);
				if (coupon.end_time < $scope.questionnaire.exchange_time) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type' : 'POPMSG',
						'title' : '警告',
						'message' : '该礼券的有效日期早于问卷的最后兑奖日期，不能添加。'
					});
					return;
				}
				//将礼券和问卷进行绑定
				$http.post('/api/questionnaires/' + questionnaire_id + '/add/' + coupon.id + '/prize', {
					num : prize.number
				}).success(function (data) {
					$modalInstance.close('ok');
					//跳转问卷插件页并进行刷新
					$state.go('activity_item.questionnaire_plugin',{},{reload: true});
				});
			};
	});