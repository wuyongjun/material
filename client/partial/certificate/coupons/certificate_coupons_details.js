angular.module('iwx').filter('couponStatus', function () {
  return function (input, value) {
    if (input === 'NEW') {
      return '未使用';
    } else if (input === 'USED') {
      return '已使用';
    } else if (input === 'EXPIRED') {
      return '已过期';
    } else if (input === 'RETRIEVE') {
      return '已作废';
    } else {
      return input;
    }
  };
}).controller('CertificateCouponsDetailsCtrl', function($scope, $http, $state, $stateParams, $modal, ngTableParams) {

  var NgTableParams = ngTableParams;
  var users = null;
  $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
  }, {
      counts: [],
      total: 0,
      getData: function($defer, params) {
          $http.get('/api/goods/' + $stateParams.id + '/users?page='+params.page() + '&per_page=' + params.count()/*, {
              'page': params.page()
          }*/).success(function(data) {
              users = data.items;
              params.total(data.total);
              // $defer.resolve(users.slice((params.page() - 1) * params.count(), params.page() * params.count()));
              $defer.resolve(users);

          });
      }
  });

  $scope.takeback = function (id) {
    $http.post('api/goods/takeback/' + id).success(function (data) {
      $state.go('certificate_coupons_details', {
        'id': $stateParams.id
      }, {reload: true});
    });
  };

  $scope.privateLetter = function(user_id) {
    $modal.open({
      template: '<div class="modal-header">' +
            '<h3 class="modal-title">发送私信</h3>'+
            '</div>' +
          '<div class="modal-body">' +
            '<textarea class="form-control ng-pristine ng-valid ng-touched" ng-model="content" rows="5"></textarea>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button class="btn btn-primary" ng-click="ok()">发送</button>' +
            '<button class="btn btn-warning" ng-click="cancel()">取消</button>' +
        '</div>',
      controller: function ($scope, $modalInstance) {
        $scope.ok = function () {
          $http.post('/api/admin/messages/' + user_id, {
            content: $scope.content
          }).success(function(data) {
            $modalInstance.close('ok');
          });
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      }
    });
  };
});


