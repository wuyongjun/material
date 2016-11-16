angular.module('iwx')
	.service('actService', function ($rootScope, $http, $q) {

		//get activity info
		this.getActivity = function (id) {
			var deferred = $q.defer();
			$http.get('/api/admin/activities/' + id)
				.success(function (data) {
					deferred.resolve(data);
				});
			return deferred.promise;
		};
		//get actual signin persons
		this.getActualPersons = function (id, page, per_page) {
			var deferred = $q.defer();
			$http.get('/api/political_sign/' + id + '/participant/user_list?page=' + page + '&per_page=' + per_page)
				.success(function (data) {
					deferred.resolve(data);
				});
			return deferred.promise;
		};
		//get specify signin persons
		this.getSpecifyPersons = function (id) {
			var deferred = $q.defer();
			$http.get('/api/political_sign/' + id + '/participant/users')
				.success(function (data) {
					deferred.resolve(data);
				});
			return deferred.promise;
		};
	});