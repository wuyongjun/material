angular.module('iwx').controller('VoteCtrl', function ($scope, $http, $rootScope, eventType, $state, $modal, $filter, ngTableParams) {

  $scope.rangeArray = [];
  $http.get('/api/votes/scope').success(function(data) {
      $scope.rangeArray = data;
  });

  $scope.confirm = {};
  $scope.newcandi = {};
  $scope.confirm.title = "请确定您的操作";
  $scope.confirm.message = "MESSAGE";
  $scope.confirm.type = "";
  $scope.confirm.param = "";

  $scope.update = false;
  $scope.vote = {
    'activity_id': $scope.$parent.activity.id
  };

  $scope.viewresult = function () {
    $state.go('activity_item.votestat_plugin', {
      'id': $scope.$parent.activity.id
    }, {reload: true});
  };

  $http.get('/api/admin/activities/' + $scope.$parent.activity.id).success(function(data) {
      $scope.activity = data;
      // console.log($scope.activity);
      //find vote id
      if($scope.activity.plugins && $scope.activity.plugins.length > 0) {
        for(var i=0;i<$scope.activity.plugins.length;i++) {
          if($scope.activity.plugins[i].id === "vote" && $scope.activity.plugins[i].enabled === true && $scope.activity.plugins[i].preview && $scope.activity.plugins[i].preview.id) {
            $scope.vote.id = $scope.activity.plugins[i].preview.id;
          }
        }
      }
      if($scope.vote.id && $scope.vote.id > 0) {
        $http.get('/api/votes/' + $scope.vote.id).success(function(data) {
          if (data) {
            $scope.vote = data;
            // $scope.vote.vote_end_time = $scope.vote.vote_end_time;
            $scope.update = true;
            $scope.tableParams.reload();
          } else {
            // console.log($scope.$parent.activity.start_time + '------' + $scope.$parent.activity.end_time);
            $scope.vote = {};
            $scope.vote.vote_start_time = $scope.$parent.activity.start_time;
            $scope.vote.vote_end_time = $scope.$parent.activity.end_time;
            $scope.update = false;
          }
        });
      }
  });

  $scope.viewImage = function(image) {
      $modal.open({
        template: '<div><img style="width:100%" src=' + image + '></div>',
        size: "lg",
      });
  };

  $scope.validation = function() {
    //验证开始时间不早于结束时间
    // console.log($scope.vote.vote_start_time);
    // console.log($scope.vote.vote_end_time);
    try {
      if (typeof($scope.vote.vote_start_time) === 'number') {
        $scope.vote.vote_start_time = $filter('date')($scope.vote.vote_start_time, 'yyyy-MM-dd HH:mm');
      }
      if (typeof($scope.vote.vote_end_time) === 'number') {
        $scope.vote.vote_end_time = $filter('date')($scope.vote.vote_end_time, 'yyyy-MM-dd HH:mm');
      }
      var stTime = new Date($scope.vote.vote_start_time.replace(/-/g,"/"));
      var endTime = new Date($scope.vote.vote_end_time.replace(/-/g,"/"));
      if(Date.parse(stTime) > Date.parse(endTime)) {
          $rootScope.$emit(eventType.NOTIFICATION, {
              'type': 'POPMSG',
              'title': '警告',
              'message': '结束时间必须在开始时间之后'
          });
          return;
      }
    } catch (e) {
        $rootScope.$emit(eventType.NOTIFICATION, {
            'type': 'POPMSG',
            'title': '警告',
            'message': '请重新选择开始时间或结束时间'
        });
        return;
    }
    if($scope.vote.vote_start_time == null || $scope.vote.vote_start_time === "") {
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '警告',
          'message': '请正确输入开始时间'
      });
      return false;
    }

    if($scope.vote.vote_end_time == null || $scope.vote.vote_end_time === "") {
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '警告',
          'message': '请正确输入结束时间'
      });
      return false;
    }

    if($scope.vote.vote_description == null || $scope.vote.vote_description === "") {
      $rootScope.$emit(eventType.NOTIFICATION, {
          /*'type': 'ERROR',
          'message': '请正确输入介绍'*/
          'type': 'POPMSG',
          'title': '警告',
          'message': '请完整填写投票说明'
      });
      return false;
    }
    //添加投票标题验证
    if ($scope.vote.title === undefined) {
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '警告',
          'message': '请正确输入投票标题'
      });
      return false;
    }
    return true;
  };

  $scope.create = function() {
    if(!$scope.validation()) {
      return;
    }
    // console.log($scope.vote);
    $http.post('/api/votes', $scope.vote, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).success(function(data) {
      $scope.vote = data;
      $scope.update = true;
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '消息',
          'message': '创建成功'
      });
    });
  };

  /*$scope.___create = function() {
    if(!$scope.validation()) {
      return;
    }
    var fd = new FormData();
    angular.forEach($scope.vote, function(value, key) {
      fd.append(key, value);
    });
    $http.post('/api/votes', fd, {
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).success(function(data) {
      $scope.vote = data;
      $scope.update = true;
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '消息',
          'message': '创建成功'
      });
    });
  };*/

  $scope.close = function() {
      var url = '/api/admin/activities/' + $scope.$parent.activity.id + '/plugins/vote';
      $http.delete(url).success(function(data) {
        $scope.$parent.activity = data;
        $state.go('activity_item', {
            'id': data.id
        }, {reload: true});
      });
  };

  $scope.delete = function() {
      var url = '/api/votes/' + $scope.vote.id;
      $http.delete(url).success(function(data) {
        $scope.$parent.activity = data;
        $state.go('activity_item.vote_plugin', {
            'id': $scope.vote.activity_id
        }, {reload: true});
      });
  };

  $scope.deletecandi = function (candi) {
      var url = '/api/votes/candidate/' + candi.id;
      $http.delete(url).success(function(data) {
        // $scope.reloadVoteInfo();
        $scope.tableParams.reload();
        $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '消息',
          'message': '删除成功'
      });
      });
  };
  //原加载候选人方法
  /*$scope.reloadVoteInfo = function() {
    $http.get('/api/votes/' + $scope.vote.id + '/candidates').success(function(data) {
      console.log(data);
      if (data) {
        if (data.items !== undefined) {
          data.items.reverse();
        }
        $scope.vote.candidates = data.items;
        $scope.safeApply();
      }
    });
  };*/
  //分页加载候选人
  var NgTableParams = ngTableParams;
  $scope.tableParams = new NgTableParams({
    page: 1,
    count: 5
  }, {
    counts: [],
    total: 0,
    getData: function ($defer, params) {
      if ($scope.vote.id) {
        $http
          .get('/api/votes/' + $scope.vote.id + '/candidates?page='+params.page()+'&per_page='+params.count())
          .success(function (data) {
            $scope.vote.candidates = data.items;
            params.total(data.total);
            $defer.resolve($scope.vote.candidates);
          });
      }
    }
  });
  $scope.updatecandi = function (candi) {
    if(!candi.newimages) {
      candi.newimages = [];
    }

    if (candi && candi.newimages && candi.newimages.length > 6) {
      $rootScope.$emit(eventType.NOTIFICATION, {
        'type': 'POPMSG',
        'title': '警告',
        'message': '最多6张图片'
      });
      return;
    }

    if(candi.images && candi.images.length > 0 && (candi.images.length + candi.newimages.length) > 6) {
      $rootScope.$emit(eventType.NOTIFICATION, {
        'type': 'POPMSG',
        'title': '警告',
        'message': '最多6张图片'
      });
      return;
    }

    if(!candi || !candi.title || candi.title === '') {
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '警告',
          'message': '请正确输入候选人标题'
      });
      return;
    }

    if(!candi.describe || candi.describe === '') {
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '警告',
          'message': '请正确输入候选人描述'
      });
      return;
    }

    var fd = new FormData();
    fd.append('title', candi.title);
    fd.append('describe', candi.describe);
    angular.forEach(candi.newimages, function(value, key) {
      fd.append('images', value);
    });

    $http.put('/api/votes/' + $scope.vote.id + '/candidate_detail/' + candi.id, fd, {
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).success(function(data) {
      candi = data;
      $scope.safeApply();
      //重新加载更新候选项目页面
      // $scope.reloadVoteInfo();
      $scope.tableParams.reload();
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '消息',
          'message': '修改成功'
      });
    });
  };

  $scope.addcandi = function () {
    if(!$scope.newcandi.images) {
      $scope.newcandi.images = [];
    }

    if ($scope.newcandi && $scope.newcandi.images && $scope.newcandi.images.length > 6) {
      $rootScope.$emit(eventType.NOTIFICATION, {
        'type': 'POPMSG',
        'title': '警告',
        'message': '最多6张图片'
      });
      return;
    }

    if(!$scope.newcandi || !$scope.newcandi.title || $scope.newcandi.title === '') {
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '警告',
          'message': '请正确输入候选人标题'
      });
      return;
    }

    if(!$scope.newcandi.describe || $scope.newcandi.describe === '') {
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '警告',
          'message': '请正确输入候选人描述'
      });
      return;
    }

    var fd = new FormData();
    fd.append('title', $scope.newcandi.title);
    fd.append('describe', $scope.newcandi.describe);
    angular.forEach($scope.newcandi.images, function(value, key) {
      fd.append('images', value);
    });

    $http.post('/api/votes/' + $scope.vote.id + '/candidate_detail', fd, {
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).success(function(data) {
      $scope.newcandi.title = '';
      $scope.newcandi.describe = '';
      $scope.newcandi.images = [];
      // $scope.reloadVoteInfo();
      $scope.tableParams.reload();
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '消息',
          'message': '添加成功'
      });
    });
  };

 $scope.removeFile = function(index) {
    var newImages = [];
    angular.forEach($scope.newcandi.images, function(value, i) {
      if (i !== index) {
        newImages.push(value);
      }
    });
    $scope.newcandi.images = newImages;
  };

  $scope.removeCandiFile = function (candi, index) {
    var newImages = [];
    angular.forEach(candi.newimages, function(value, i) {
      if (i !== index) {
        newImages.push(value);
      }
    });
    candi.newimages = newImages;
  };

  $scope.removeExistCandiFile = function (candi, image) {
      var url = '/api/votes/candidate/images/' + image.id;
      $http.delete(url).success(function(data) {
        // $scope.reloadVoteInfo();
        $scope.tableParams.reload();
        $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '消息',
          'message': '删除成功'
      });
      });
  };

  $scope.change = function() {
    if(!$scope.validation()) {
      return;
    }
    console.log($scope.vote.vote_start_time + '-----------' + $scope.vote.vote_end_time);
    $http.put('/api/votes/' + $scope.vote.id, $scope.vote, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).success(function(data) {
      $scope.vote = data;
      // $scope.reloadVoteInfo();
      $scope.tableParams.reload();
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '消息',
          'message': '更新成功'
      });
    });
  };

  /*$scope.___change = function() {
    if(!$scope.validation()) {
      return;
    }

    var fd = new FormData();
    angular.forEach($scope.vote, function(value, key) {
      fd.append(key, value);
    });
    $http.put('/api/votes/' + $scope.vote.id, fd, {
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).success(function(data) {
      $scope.vote = data;
      $scope.reloadVoteInfo();
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '消息',
          'message': '更新成功'
      });
    });
  };*/
  //结束本次投票方法
  $scope.complete_vote = function () {
    // console.log($scope.vote.id);
    if ($scope.vote.id === undefined) {
      $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '警告',
          'message': '请先创建本次投票'
      });
      return;
    }
    $http.post('/api/votes/' + $scope.vote.id + '/done')
      .success(function (data) {
        // console.log(angular.toJson(data));
        $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '消息',
          'message': '成功结束投票'
        });
        $state.go('activity_item', {
          'id': $scope.activity.id
        });
      });
  };
  //查看历史投票方法
  $scope.history_vote = function () {
    // console.log($scope.activity.id);
    $state.go('activity_item.history_vote_plugin', {
      'id': $scope.activity.id
    }, {reload: true});
  };
});