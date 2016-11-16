angular.module('iwx').controller('ProfileCtrl',function ($scope, $rootScope, userService){
  $rootScope.welcome_bg = false;
  userService.load().then(function(user) {
    $scope.user = user;
  });

  $scope.change = {};
  $scope.changePassword = function() {
    userService.changePassword($scope.change);
  };
});
