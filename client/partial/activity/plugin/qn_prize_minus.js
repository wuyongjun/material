angular.module('iwx')
	.controller('QnPrizeMinusCtrl', 
		function ($scope, $state, $modalInstance, eventType, $rootScope, $http, gift, activity_id, $modal, questionnaire_id) {
			$scope.gift = gift;
			$scope.cer_remain = $scope.gift.goods.remain;
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
			//更新奖品数量
			$scope.updateNumber = function (prize) {
				if (!prize) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type' : 'POPMSG',
						'title' : '警告',
						'message' : '礼券数量不能为空。' 
					});
					return;
				}
				if (prize.number <= $scope.gift.remain) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type' : 'POPMSG',
						'title' : '警告',
						'message' : '礼券数量应大于已领取数量。' 
					});
					return;
				}
				if (prize.number > ($scope.cer_remain + $scope.gift.num)) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type' : 'POPMSG',
						'title' : '警告',
						'message' : '礼券数量应小于库存礼券数量。' 
					});
					return;
				}
				$http.put('/api/questionnaires/' + questionnaire_id + '/update/' + $scope.gift.id + '/prize', {
					num : prize.number
				}).success(function (data) {
					$modalInstance.close('ok');
					$state.go('activity_item.questionnaire_plugin', {},{reload: true});
				});
			};
	});