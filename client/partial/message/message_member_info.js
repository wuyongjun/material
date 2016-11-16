angular.module('iwx').controller('MessMemberInfoCtrl', function ($scope, $http, $stateParams, $rootScope, eventType) {
    console.log($stateParams.id);
    $scope.unique = function (arr) {
        var hash = {}, result_arr = [], elem;
        for (var i = 0; (elem = arr[i]) != null; i++) {
            if (!hash[elem]) {
                result_arr.push(elem);
                hash[elem] = true;
            }
        }
        return result_arr;
    };

    $http.get('/api/admin/community/register/users/' + $stateParams.id).success(
        function(data) {
            angular.forEach(data.answers, function (value) {
                value.question.options = $scope.unique(value.question.options);
            });
            $scope.user = data;
        }
    );

    $scope.print = function() {
        window.print();
    };

});