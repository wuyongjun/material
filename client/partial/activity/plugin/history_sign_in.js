//签到历史查看controller
angular.module('iwx')
	.controller('HistorySignInCtrl', function ($scope, $rootScope, history_sign_in) {
		var sign_in = [];
		// console.log(history_sign_in);
		var len = history_sign_in.length;
		for (var i=0;i<len;i++) {
			if (history_sign_in[i].is_done) {
				sign_in.push(history_sign_in[i]);
			}
		}
		$scope.history_sign_in = sign_in;
});