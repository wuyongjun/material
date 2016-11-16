angular.module('iwx')
	.controller('ChangeCtrl', function ($scope, $rootScope, $http, person, $modalInstance) {
		$scope.person = person;
		$scope.changeObj = {
			status: person.status.toLowerCase()
		};
		if ($scope.person.duty_obj) {
			$scope.changeObj['duty'] = $scope.person.duty_obj.id;
		} else {
			$scope.changeObj['duty'] = -1;
		}
		if ($scope.person.year_obj) {
			$scope.changeObj['year'] = $scope.person.year_obj.id;
		} else {
			$scope.changeObj['year'] = -1;
		}
		if ($scope.person.group_obj) {
			$scope.changeObj['group'] = $scope.person.group_obj.id;
		} else {
			$scope.changeObj['group'] = -1;
		}
		//获取职务信息
		var getDuties = function () {
			$http.get('/api/political/duties?page=1&per_page=1000')
				.success(function (data) {
					$scope.dutyArray = data.items;
				});
		};
		getDuties();
		//获取学年信息
		var getGrades = function () {
			$http.get('/api/political/years?page=1&per_page=1000')
				.success(function (data) {
					$scope.gradeArray = data.items;
				});
		};
		getGrades();
		//获取分组信息
		var getGroups = function () {
			$http.get('/api/political/groups?page=1&per_page=1000')
				.success(function (data) {
					$scope.groupArray = data.items;
				});
		};
		getGroups();
		//获取身份信息
		/*var getIdentities = function () {
			$scope.identityArray = [{id: 1, name: '正式党员'},
				{id: 2, name: '预备党员'},
				{id: 3, name: '积极分子'}];
		};
		getIdentities();*/
		//获取党员类型
		var getMemberType = function () {
			$http.get('/api/political/type')
				.success(function (data) {
					$scope.identityArray = [];
					angular.forEach(data, function (value, key) {
						var obj = {};
						obj['id'] = key;
						obj['name'] = value;
						$scope.identityArray.push(obj);
					});
					console.log($scope.identityArray);
				});
		};
		getMemberType();
		$scope.ok = function () {
			var param = {};
			if ($scope.changeObj.duty !== -1) {
				param['duty'] = $scope.changeObj.duty;
			}
			if ($scope.changeObj.year !== -1) {
				param['year'] = $scope.changeObj.year;
			}
			if ($scope.changeObj.group !== -1) {
				param['group'] = $scope.changeObj.group;
			}
			if ($scope.changeObj.status !== 'nullify') {
				param['status'] = $scope.changeObj.status;
			}
			console.log(param);
			$http.put('/api/political/user/' + $scope.person.user_obj.id + '/update', param, {
				headers: {
					'Content-Type': 'application/json'
				}
			}).success(function (data) {
					$modalInstance.close('ok');
					$rootScope.$broadcast('change');
				});
		};
		$scope.cancel = function () {
			$modalInstance.close('ok');
		};
	});