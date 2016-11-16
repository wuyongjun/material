angular.module('iwx').controller('AnnouncementCtrl', function(
    $scope, $http, ngTableParams, $rootScope, eventType) {
  // Avoid lint complain
  var NgTableParams = ngTableParams;

  $scope.tableParams = new NgTableParams({
    page: 1,
    count: 10,
  }, {
    counts: [],
    total: 0,
    getData: function($defer, params) {
      $http({
        url: '/api/plugins/announcements',
        method: 'GET',
        params: {
            'page': params.page(),
            'per_page': params.count(),
            'activity_id': $scope.$parent.activity.id,
            'rnd': Math.random()
        }
      }).success(function(data) {
        params.total(data.total);
        $defer.resolve(data.data);
      });
    }
  });

  $scope.submit = function() {
    if ($scope.content && $scope.content.length > 0) {
      $http.post('/api/plugins/announcements', {
        'activity_id': $scope.$parent.activity.id,
        'content': $scope.content
      }).success(function() {
        $scope.tableParams.reload();
      });
    } else {
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '警告',
          'message': '请填写要发布的内容！'
      });
    }
  };

  $scope.delete = function(id) {
    $http.delete('/api/plugins/announcements/' + id).success(function() {
      $scope.tableParams.reload();
    });
  };
});