angular.module('iwx').controller('LotteryatCtrl', function($scope, $stateParams, $http, $rootScope, eventType, $state, ngTableParams) {

  $scope.lottery = {};

  $scope.returntolottery = function() {
    $state.go('activity_item.lottery_plugin', {
      'id': $scope.$parent.activity.id
    }, {reload: true});
  };

  $scope.award_id = $stateParams.award_id;

  var initInfo = function () {
    $http.get('/api/admin/activities/' + $scope.$parent.activity.id).success(function(data) {
        $scope.activity = data;
        $scope.lottery_scope = [];
        $scope.lottery.activity_id = $scope.activity.id;

        //find lottery id
        if($scope.activity.plugins && $scope.activity.plugins.length > 0) {
          for(var i=0;i<$scope.activity.plugins.length;i++) {
            if($scope.activity.plugins[i].id === 'lottery' && $scope.activity.plugins[i].enabled === true && $scope.activity.plugins[i].preview && $scope.activity.plugins[i].preview.id) {
              $scope.lottery.id = $scope.activity.plugins[i].preview.id;
            }
          }
        }

        if($scope.lottery.id && $scope.lottery.id > 0) {
          var NgTableParams = ngTableParams;
          var awards = null;
          $scope.tableParams = new NgTableParams({
              page: 1,
              count: 10,
          }, {
              counts: [],
              total: 0,
              getData: function($defer, params) {
                  $http.get('/api/lotteries/' + $scope.lottery.id + '/awards', {
                      'page': params.page()
                  }).success(function(data) {
                      awards = data.items;
                      params.total(data.total);
                      $defer.resolve(awards.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                  });
              }
          });
        } else {
          $http.post('/api/lotteries/add', {activity_id: $scope.lottery.activity_id}).success(function (data) {
            initInfo();
          });
        }
    });
  };

  initInfo();
});