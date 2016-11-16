angular.module('iwx')
	.controller('DisplayEditCtrl', function ($scope, $rootScope, $http, authToken, universityId, total, $modalInstance, origin) {
		//素材库展板列表
		$scope.currentPage = 1;
		$scope.loadBtn = '加载更多~~';
		$scope.sourceScreens = [];
		$scope.sourceScreensSet = {};
		//选中的素材展板
		$scope.sourScreenChosen = [];
		//播放展板列表
		$scope.displayScreens = [];
		//选中的播放展板
		$scope.disScreenChosen = [];
		if (total === 0) {
			$scope.modalTitle = '新建播放列表';
		} else {
			$scope.modalTitle = '更新播放列表';
		}
		$scope.close = function () {
			$modalInstance.close('ok');
		};
		//分页获取素材库展板列表
		$scope.getSourceScreenList = function (page) {
			$http.get(origin.DESTINATION.name + '/v1/customer/' + universityId +
				'/contents?s=usable&page=' + page + '&per_page=20', {
					'Origin' : origin.ORIGIN,
					'headers' : {
						'Authentication-Token' : authToken
					}
				}).success(function (data) {
					if (data.items.length === 0) {
						if (page === 1) {
							$scope.message = true;
							$scope.loadMsg = '暂时没有可用的展板素材，请在素材库中进行添加！';
						} else {
							$scope.btn = true;
							$scope.loadBtn = '已经加载全部~~';
						}
						return;
					}
					$scope.btn = false;
					$scope.loadBtn = '加载更多~~';
					$scope.message = false;
					var add = 0;
					angular.forEach(data.items, function (value, key) {
						if (!(value.id in $scope.sourceScreensSet)) {
							value['chosen'] = false;
							value['isDisabled'] = false;
							$scope.sourceScreensSet[value.id] = true;
							$scope.sourceScreens.push(value);
							add++;
						}
					});
					if (add === 0) {
						$scope.getSourceScreenList(++$scope.currentPage);
					}
				});
		};
		//获取下一页素材库展板信息
		$scope.getMoreScreens = function () {
			$scope.getSourceScreenList(++$scope.currentPage);
		};
		$scope.getSourceScreenList($scope.currentPage);
		//选择素材展板
		$scope.choseScreen = function (screen) {
			if (screen.chosen) {
				screen.chosen = false;
				angular.forEach($scope.sourScreenChosen, function (value, key) {
					if (value.id === screen.id) {
						$scope.sourScreenChosen.splice(key, 1);
					}
				});
			} else {
				screen.chosen = true;
				$scope.sourScreenChosen.push(screen);
			}
			console.log($scope.sourScreenChosen);
		};
		//获取播放展板列表
		$scope.getDisplayScreenList = function () {
			$http.get(origin.DESTINATION.name + '/v1/customer/playlist/contents/', {
					'Origin' : origin.ORIGIN,
					'headers' : {
						'Authentication-Token' : authToken
					}
				}).success(function (data) {
					angular.forEach(data, function (value, key) {
						value['content']['chosen'] = false;
						value['content']['isDisabled'] = false;
						$scope.displayScreens.push(value);
					});
				});
		};
		$scope.getDisplayScreenList();
		//选择播放展板
		$scope.choseDisplayScreen = function (screen) {
			if (screen.chosen) {
				screen.chosen = false;
				angular.forEach($scope.disScreenChosen, function (value, key) {
					if (value === screen.id) {
						$scope.disScreenChosen.splice(key, 1);
					}
				});
			} else {
				screen.chosen = true;
				$scope.disScreenChosen.push(screen.id);
			}
		};
		//获取播放等级列表
		$scope.getLevels = function () {
			$http.get(origin.DESTINATION.name + '/v1/customer/priorities/?page=1&per_page=100', {
				'Origin' : origin.ORIGIN,
				'headers': {
					'Authentication-Token': authToken
				}
			}).success(function (data) {
				$scope.levels = data.items;
			});
		};
		$scope.getLevels();
		//将选中的素材展板添加到播放列表
		$scope.addToDisList = function () {
			var hash = {};
			var temp = [];
			//要添加到播放列表中的选中的展板
			var add = [];
			angular.forEach($scope.sourScreenChosen, function (value, key) {
				value.chosen = false;
				value.isDisabled = true;
				hash[value.id] = value;
				var screen = {};
				screen['content'] = value;
				add.push(screen);
			});
			angular.forEach($scope.sourceScreens, function (value, key) {
				if (!hash[value.id]) {
					temp.push(value);
				}
			});
			$scope.sourScreenChosen = [];
			$scope.sourceScreens = temp;
			$scope.displayScreens = add.concat($scope.displayScreens);
		};
		//给要添加的展板选择播放等级
		$scope.selectLevel = function (content_id, priority_id, flag) {
			console.log(priority_id);
			console.log(flag);
			if (flag) {
				//添加
				var addParam = {};
				addParam['content_id'] = content_id;
				addParam['priority_id'] = priority_id;
				$http.post(origin.DESTINATION.name + '/v1/customer/playlist/contents/', addParam, {
					'Origin' : origin.ORIGIN,
					'headers': {
						'Authentication-Token': authToken
					}
				}).success(function (data) {
					data['content']['chosen'] = false;
					data['content']['isDisabled'] = false;
					angular.forEach($scope.displayScreens, function (value, key) {
						if (value.content.id === data.content.id) {
							$scope.displayScreens.splice(key, 1, data);
						}
					});
					//广播通知刷新播放列表
					$rootScope.$broadcast('updateDisplayList');
				});
			} else {
				//修改
				var updParam = {};
				updParam['priority_id'] = priority_id;
				$http.put(origin.DESTINATION.name + '/v1/customer/playlist/contents/' + content_id, updParam, {
					'Origin' : origin.ORIGIN,
					'headers': {
						'Authentication-Token': authToken
					}
				}).success(function (data) {
					data['content']['chosen'] = false;
					data['content']['isDisabled'] = false;
					angular.forEach($scope.displayScreens, function (value, key) {
						if (value.content.id === data.content.id) {
							$scope.displayScreens.splice(key, 1, data);
						}
					});
					$rootScope.$broadcast('updateDisplayList');
				});
			}
			
		};
		//将播放的展板从播放列表移除
		$scope.removeFromDisList = function () {
			console.log(JSON.stringify($scope.disScreenChosen));
			$http.delete(origin.DESTINATION.name + '/v1/customer/playlist/contents/?contents=' + $scope.disScreenChosen.toString(), {
				'Origin' : origin.ORIGIN,
				'headers': {
					'Authentication-Token': authToken
				}
			}).success(function (data) {
				var displaySet = {};
				var displayTemp = [];
				angular.forEach(data, function (value, key) {
					displaySet[value] = value;
				});
				angular.forEach($scope.displayScreens, function (value, key) {
					if (!displaySet[value.content.id]) {
						displayTemp.push(value);
					}
				});
				$scope.displayScreens = displayTemp;
				$scope.disScreenChosen = [];
				$scope.currentPage = 1;
				$scope.getSourceScreenList($scope.currentPage);
				//将删除成功的展板从播放展板列表中删除
				$rootScope.$broadcast('updateDisplayList');
			});
		};
		//通知广告屏幕刷新
		$scope.update = function () {
			$http.post(origin.DESTINATION.name + '/v1/customer/playlist/notification', {}, {
				'Origin' : origin.ORIGIN,
				'headers': {
					'Authentication-Token': authToken
				}
			}).success(function (data) {
				$modalInstance.close('ok');
			});
		};
 	});