angular.module('iwx')
	.service('memberService', function ($rootScope, $http, $q) {

		//get person identify info
		this.getMemberType = function () {
			var deferred = $q.defer();
			$http.get('/api/political/type')
				.success(function (data) {
					deferred.resolve(data);
				});
			return deferred.promise;
		};
	});