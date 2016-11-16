angular.module('iwx')
	.controller('EditGradeCtrl', function ($scope, $http, $rootScope, $modalInstance, grade) {
		if (grade.id !== -1) {
			var starttime = new Date(grade.start_year.toString());
			var endtime = new Date(grade.end_year.toString());
			grade.starttime = starttime.getTime();
			grade.endtime = endtime.getTime();
		}
		$scope.grade = grade;
		//创建或者修改学年
		$scope.creOrUdpGrade = function () {
			var param = {};
			param.name = $scope.grade.name;
			param.start_y = $scope.grade.starttime;
			param.end_y = $scope.grade.endtime;
			if ($scope.grade.id === -1) {
				console.log(param);
				$http.post('/api/political/year/add', param, {
					headers: {
						'Content-Type': 'application/json'
					}
				}).success(function (data) {
					$modalInstance.close('ok');
					$rootScope.$broadcast('flushGradeList');
				});
			} else {
				console.log(param);
				$http.put('/api/political/year/' + $scope.grade.id + '/update', param, {
					headers: {
						'Content-Type': 'application/json'
					}
				}).success(function (data) {
					$modalInstance.close('ok');
					$rootScope.$broadcast('flushGradeList');
				});
			}
		};
		//关闭
		$scope.cancel = function () {
			$modalInstance.close('ok');
		};
	});