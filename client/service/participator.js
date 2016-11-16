angular.module('iwx')
	.service('partiService', function ($scope, $rootScope, $http, $q) {

		//get all party members
		this.getMembers = function (condition) {
			$http.get('/api/plugins')
				.success(function (data) {
					return data;
				});
		};
		//get participators
		this.getParticipators = function () {
			$http.get('/api/plugins')
				.success(function (data) {
					return data;
				});
		};
	});