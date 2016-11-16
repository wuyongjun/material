angular.module('iwx').controller('RegisterIwxCtrl', function ($scope, $http, $rootScope, $state, eventType) {
  //隐藏到处表格
  $rootScope.excel = false;
  //禁用查询按钮
  $rootScope.search = true;
  $scope.user = {
  };
  $scope.community = {
  };
  $scope.universities = [];
  $scope.submit = function() {
    var fd = new FormData();
    angular.forEach($scope.user, function(value, key) {
      fd.append(key, value);
    });
    angular.forEach($scope.community, function(value, key) {
      fd.append(key, value);
    });
    $http.post('/api/auth/admin/register', fd, {
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).success(function(data) {
      $rootScope.$emit(eventType.NOTIFICATION, {
        'type': 'POPMSG',
        'title': '消息',
        'message': "注册成功，等待人工核对信息. 我们将会以邮件方式通知您核对的结果, 请耐心等候..."
      });
      // $state.go('welcome');
    });
  };
  $http.get('/api/universities').success(function(universities) {
    $scope.universities = universities;
  });
});