angular.module('iwx')
  .controller('CommUniElectionCtrl', function ($scope, $rootScope, $http, ngTableParams) {
    //加载申请换届的学校列表
    var load_university_election = function () {
      var NgTableParams = ngTableParams;
      var communities = null;
      $scope.tableParams = new NgTableParams({
        page: 1,
        count: 10
      }, {
        counts: [],
        total: 0,
        getData: function ($defer, params) {
          $http
            .get('/api/un/election?page=' + params.page() + '&per_page=' + params.count())
            .success(function (data) {
              communities = data.items;
              params.total(data.total);
              $defer.resolve(communities);
            });
        }
      });
    };
    load_university_election();
    //确认操作方法
    $scope.confirmModal = function () {
      if ($scope.confirm.type === 'election_approved') {
        //批准社团换届
        console.log($scope.confirm.param);
        $http
          .get('/api/un/confirm/' + $scope.confirm.param + '/election')
          .success(function (data) {
            $scope.tableParams.reload();
          });
        
      } else if ($scope.confirm.type === 'election_reject') {
        console.log($scope.confirm.param);
        //拒绝社团换届
        $http
          .post('/api/un/' + $scope.confirm.param + '/refuse')
          .success(function (data) {
            $scope.tableParams.reload();
          });
      }
    };
    //批准申请换届
    $scope.approved_election = function (election_id) {
      $scope.confirm.message = '确定批准社团换届？';
      $scope.confirm.type = 'election_approved';
      $scope.confirm.param = election_id;
      $('#confirmModal').modal();
    };
    //拒绝申请换届
    $scope.refuse_election = function (election_id) {
      $scope.confirm.message = '确定拒绝社团换届？';
      $scope.confirm.type = 'election_reject';
      $scope.confirm.param = election_id;
      $('#confirmModal').modal();
    };
  });