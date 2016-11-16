angular.module('iwx')
  .controller('HistoryVoteCtrl', function ($scope, $http, $rootScope, eventType, $state, $modal, $stateParams) {
    //get history vote infomations
    $http.get('/api/votes/' + $stateParams.id + '/all')
      .success(function (data) {
        var len = data.length;
        var tempArr = [];
        for (var i=0;i<len;i++) {
          if (data[i].is_done) {
            tempArr.push(data[i]);
          }
        }
        $scope.historyVote = tempArr;
        if ($scope.historyVote.length === 0) {
          $rootScope.$emit(eventType.NOTIFICATION, {
            'type': 'POPMSG',
            'title': '消息',
            'message': '没有历史投票信息'
          });
        }
        // console.log($scope.historyVote);
      });
    //return to vote
    $scope.returnToVote = function() {
      // console.log($stateParams.id);
      // console.log($scope.$parent.activity.id);
      $state.go('activity_item.vote_plugin', {
        'id': $stateParams.id
      }, {reload: true});
    };
    //get history candidates infomations
    $scope.candidateList = function (vote_id) {
      // console.log(vote_id);
      $state.go('activity_item.history_candidate_plugin', {
        'id': $scope.activity.id,
        'vote_id': vote_id
      }, {reload: true});
    };
})
  .controller('HistoryCandiCtrl', function ($scope, $http, $rootScope, eventType, $state, $stateParams, ngTableParams, $modal) {
    // console.log($stateParams.vote_id);
    var NgTableParams = ngTableParams;
    var candidates = null;
    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10
    }, {
      counts: [],
      total: 0,
      getData: function ($defer, params) {
        $http.get('/api/votes/' + $stateParams.vote_id + '/candidates?page='+params.page()+'&per_page='+params.count()/*, {
          'page': params.page()
        }*/)
        .success(function (data) {
          if (data.total === 0) {
            $rootScope.$emit(eventType.NOTIFICATION, {
              'type': 'POPMSG',
              'title': '消息',
              'message': '没有历史候选项信息'
            });
            return;
          }
          candidates = data.items;
          // console.log(data);
          params.total(data.total);
          // $defer.resolve(candidates.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          $defer.resolve(candidates);
        });
      }
    });
    //return to history vote
    $scope.returnToVote = function() {
      // console.log($scope.$parent.activity.id);
      $state.go('activity_item.history_vote_plugin', {
        'id': $scope.$parent.activity.id
      }, {reload: true});
    };
    //查看大图
    $scope.viewImage = function(image) {
      $modal.open({
        template: '<div><img style="width:100%" src=' + image + '></div>',
        size: "lg",
      });
  };
});