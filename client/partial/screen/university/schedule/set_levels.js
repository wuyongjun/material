angular.module('iwx')
	.controller('SetLevelsCtrl', function ($scope, $rootScope, $http, $state, $stateParams, origin, $modal) {
		$scope.page = $stateParams.page;
		$scope.confirm = {};
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		//获取等级列表
		var getLevels = function () {
			$http.get(origin.DESTINATION.name + '/v1/customer/priorities/?page=1&per_page=100', {
				'Origin' : origin.ORIGIN,
				'headers': {
					'Authentication-Token': $scope.auth_token
				}
			}).success(function (data) {
				$scope.levels = data.items;
			});
			/*$scope.levels = [{id : 1, name : '常规的', length : 30}, {id : 2, name : '需长时间的', length : 60}, 
				{id : 3, name : '短暂的', length : 15}];*/
		};
		$http.get('/api/auth/refreshtoken').success(function (response) {
			$scope.user = response.user;
			$scope.auth_token = response.auth_token;
			getLevels();
		});
		//确定操作
		$scope.confirmModal = function () {
			if ($scope.confirm.type === 'delLevel') {
				$http.delete(origin.DESTINATION.name + '/v1/customer/priorities/' + $scope.confirm.param, {
					'Origin' : origin.ORIGIN,
					'headers' : {
						'Authentication-Token' : $scope.auth_token
					}
				}).success(function (data) {
					getLevels();
				});
			}
		};
		//新建等级
		$scope.createLevel = function (auth_token) {
			$modal.open({
				templateUrl: 'partial/screen/university/schedule/create_level.html',
				controller: ['$scope', '$modalInstance', 'origin', function ($scope, $modalInstance, origin) {
					$scope.btnOk = true;
					$scope.error = false;
					$scope.level = {
						length: 15
					};
					$scope.$watch('level.name', function (value) {
						if (value) {
							$scope.btnOk = false;
						}
					});
					$scope.$watch('level.length', function (value) {
						console.log(typeof value);
						if (value < 15 || !value) {
							$scope.error = true;
						} else {
							$scope.error = false;
						}
					});
					$scope.ok = function () {
						console.log($scope.level);
						if (!$scope.level.length) {
							return;
						}
						$http.post(origin.DESTINATION.name + '/v1/customer/priorities/', $scope.level,{
							'Origin' : origin.ORIGIN,
							'headers' : {
								'Authentication-Token' : auth_token
							}
						}).success(function (data) {
							$modalInstance.close('ok');
							getLevels();
						});
					};
					$scope.cancel = function () {
						$modalInstance.close('ok');
					};
				}]
			});
		};
		//删除播放等级
		$scope.delLevel = function (level) {
			$scope.confirm.message = '确定要删除“' + level.name + '”播放等级？';
			$scope.confirm.type = "delLevel";
			$scope.confirm.param = level.id;
			$('#confirmModal').modal();
			return;
		};
	});