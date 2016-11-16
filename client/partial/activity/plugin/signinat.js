angular.module('iwx').filter('signNumber', function () {
  return function (input, value) {
    input = '' + input;
    if (input.length === 1 && input !== '0') {
      return '00' + input;
    }

    if (input.length === 2) {
      return '0' + input;
    }

    return input;
  };
}).controller('SignInStatCtrl', function(
    $scope, $http, $rootScope, eventType, $state, ngTableParams) {

  $scope.sign_in = {};

  $scope.returntosignin = function() {
    $state.go('activity_item.sign_in_plugin', {
      'id': $scope.$parent.activity.id
    }, {reload: true});
  };

  var NgTableParams = ngTableParams;
  var signins = null;
  $http.get('/api/admin/activities/' + $scope.$parent.activity.id).success(function(data) {
      $scope.activity = data;
      $scope.sign_in.activity_id = $scope.activity.id;

      //find sign_in id
      if($scope.activity.plugins && $scope.activity.plugins.length > 0) {
        for(var i=0;i<$scope.activity.plugins.length;i++) {
          if($scope.activity.plugins[i].id === "sign_in" && $scope.activity.plugins[i].enabled === true && $scope.activity.plugins[i].preview && $scope.activity.plugins[i].preview.id) {
            $scope.sign_in.id = $scope.activity.plugins[i].preview.id;
          }
        }
      }

      if($scope.sign_in.id && $scope.sign_in.id > 0) {
        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
        }, {
            counts: [],
            total: 0,
            getData: function($defer, params) {
                $http.get('/api/signs/' + $scope.sign_in.id + '/users?page=' + params.page() + '&per_page=' + params.count()/*, {
                    'page': params.page()
                }*/).success(function(data) {
                    signins = data.items;
                    params.total(data.total);
                    // $defer.resolve(signins.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    $defer.resolve(signins);
                });
            }
        });

        $scope.tableParams.reload();
      }
  });


});