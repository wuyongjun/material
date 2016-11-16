angular.module('iwx').controller('ResetPasswordCtrl', function($scope, $modalInstance) {
  $scope.reset = {
    'email': ''
  };
  $scope.reset = function() {
    $modalInstance.close($scope.reset.email);
  };
});

angular.module('iwx').controller(
    'LoginCtrl',function ($scope, $rootScope, $stateParams, $modal, userService) {
  $rootScope.welcome_bg = false;
  $scope.user = {};
  $scope.submit = function() {
    userService.login($scope.user, $stateParams.next);
  };
  $scope.resetPassword = function() {
    var modalInstance = $modal.open({
      templateUrl: 'partial/admin/reset.html',
      controller: 'ResetPasswordCtrl',
      size: 'sm'
    });
    modalInstance.result.then(function(email) {
      if (email) {
        userService.resetPassword(email);
      }
    });
  };
});

