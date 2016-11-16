angular.module('iwx')
	.controller('SignInAtCtrl', function ($scope, $http, ngTableParams, userService, $stateParams, $filter, actService, memberService) {
		console.log($stateParams);
		$scope.isSpecify = $stateParams.isSpecify;
		$scope.signInId = $stateParams.signInId;
		$scope.current = $filter('date')(new Date(), 'yyyy-MM-dd');
		//获取指定参与人员数据
		var getSpecifyPersons = function () {
			actService.getSpecifyPersons($stateParams.signInId)
				.then(function (data) {
					$scope.person_sum = data.length;
					$scope.signin_person_sum = 0;
					angular.forEach(data, function (value, key) {
						if (value.sign_in_time) {
							$scope.signin_person_sum++;
						}
					});
					$scope.specifyPersons = data;
				});
		};
		//获取实时签到人员
		var getActualPersons = function () {
			var NgTableParams = ngTableParams;
			var actualPersons = null;
			$scope.tableParams = new NgTableParams({
				page: 1,
				count: 10
			},{
				counts: [],
				total: 0,
				getData: function ($defer, params) {
					actService.getActualPersons($stateParams.signInId, params.page(), params.count())
						.then(function (data) {
							console.log(data);
							actualPersons = data.items;
							params.total(data.total);
							$defer.resolve(actualPersons);
						});
				}
			});
		};
		//获取人员身份
		var getMemberType = function () {
			memberService.getMemberType()
				.then(function (data) {
					var identity = {};
					angular.forEach(data, function (value, key) {
						var temp_key = key.toUpperCase();
						identity[temp_key] = value;
					});
					$scope.identity = identity;
					if ($scope.isSpecify === 'isPart') {
						getSpecifyPersons();
					}
					getActualPersons();
				});

		};
		//获取活动信息
		var getActivity = function () {
			actService.getActivity($stateParams.id)
				.then(function (data) {
					$scope.activity = data;
				}, function (data) {

				});
		};
		userService.load(true)
			.then(function () {
				getMemberType();
				getActivity();
			});
	});