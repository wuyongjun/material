angular.module('iwx').controller('SignInCtrl', function ($filter, $scope, $rootScope, $http, $state, eventType, $modal) {
  $scope.sign_in = {};
  $scope.sponser_name = /^[\u4e00-\u9fa5_\x21-\x7e_\u0b7-\uff1f_\s]{0,15}$|^[\w\s_\x21-\x7e]{0,30}$/;
  $http.get('/api/admin/activities/' + $scope.$parent.activity.id).success(function(data) {
      $scope.activity = data;
      $scope.sign_in.activity_id = $scope.activity.id;

      //find sign_in id
      if($scope.activity.plugins && $scope.activity.plugins.length > 0) {
        for(var i=0;i<$scope.activity.plugins.length;i++) {
          if($scope.activity.plugins[i].id === "sign_in" && $scope.activity.plugins[i].enabled === true && $scope.activity.plugins[i].preview && $scope.activity.plugins[i].preview.id) {
            $scope.sign_in.id = $scope.activity.plugins[i].preview.id;
            $scope.sign_big_screen = true;
          }
        }
      }

      if($scope.sign_in.id && $scope.sign_in.id > 0) {
        $http.get('/api/signs/' + $scope.sign_in.id).success(function(data) {
          if (data) {
            $scope.sign_in = data;
            $scope.update = true;
            $scope.sign_in_qrcode = true;
          } else {
            $scope.sign_in_qrcode = false;
            $scope.sign_in = {};
            $scope.sign_in.activity_id = $scope.activity.id;
            $scope.sign_in.sign_in_start_time = $scope.activity.start_time;
            $scope.sign_in.sign_in_end_time = $scope.activity.end_time;
            $scope.update = false;
          }
        });
      } else {
        $scope.sign_in.sign_in_start_time = $scope.activity.start_time;
        $scope.sign_in.sign_in_end_time = $scope.activity.end_time;
      }
  });

  $scope.viewresult = function () {
    $state.go('activity_item.sign_in_at_plugin', {
      'id': $scope.$parent.activity.id
    }, {reload: true});
  };

  $scope.close = function() {
      var url = '/api/admin/activities/' + $scope.$parent.activity.id + '/plugins/sign_in';
      $http.delete(url).success(function(data) {
        $scope.$parent.activity = data;
        $state.go('activity_item', {
            'id': data.id
        }, {reload: true});
      });
  };

  $scope.delete = function() {
      var url = '/api/signs/' + $scope.sign_in.id;
      $http.delete(url).success(function(data) {
        $scope.$parent.activity = data;
        $state.go('activity_item.sign_in_plugin', {
            'id': $scope.sign_in.activity_id
        }, {reload: true});
      });
  };

  $scope.validation = function() {
    if($scope.sign_in.sign_in_end_time == null || $scope.sign_in.sign_in_end_time === "") {
      $rootScope.$emit(eventType.NOTIFICATION, {
          // 'type': 'ERROR',
          'type': 'POPMSG',
          'title': '消息',
          'message': '请正确输入结束时间'
      });
      return false;
    }
    if (!$scope.sponser_name.test($scope.sign_in.sponsor_name)) {
        $rootScope.$emit(eventType.NOTIFICATION, {
            'type': 'POPMSG',
            'title': '消息',
            'message': '请将赞助商名称限制在15个汉字以内！'
        });
        return false;
    }
    //添加title验证
    /*if ($scope.sign_in.title === undefined) {
      $rootScope.$emit(eventType.NOTIFICATION, {
          // 'type': 'ERROR',
          'type': 'POPMSG',
          'title': '消息',
          'message': '请正确输入签到标题'
      });
      return false;
    }*/
    return true;
  };


  var getSignFormData = function () {
    var fd = new FormData();
    fd.append('activity_id', $scope.sign_in.activity_id);
    // console.log($scope.sign_in.title);
    // fd.append('title', $scope.sign_in.title);
    fd.append('sign_in_start_time', $filter('date')($scope.sign_in.sign_in_start_time, 'yyyy-MM-dd HH:mm'));
    fd.append('sign_in_end_time', $scope.sign_in.sign_in_end_time);
    fd.append('sponsor_name', $scope.sign_in.sponsor_name);
    fd.append('sponsor_logo', $scope.sign_in.sponsor_logo);
    return fd;
  };

  $scope.create = function() {
    if(!$scope.validation()) {
      return;
    }

    $http.post('/api/signs', getSignFormData(), {
      headers: {
        'Content-Type': undefined
      }
    }).success(function(data) {
      $scope.sign_in_qrcode = true;
      $scope.sign_big_screen = true;
      $scope.sign_in = data;
      $scope.update = true;
      $rootScope.$emit(eventType.NOTIFICATION, {
        'type': 'POPMSG',
        'title': '消息',
        'message': '创建成功'
      });
    });
  };

  $scope.change = function() {
    if(!$scope.validation()) {
      return;
    }
    
    $http.put('/api/signs/' + $scope.sign_in.id, getSignFormData(), {
      headers: {
        'Content-Type': undefined
      }
    }).success(function(data) {
      $scope.sign_big_screen = true;
      $scope.sign_in = data;
      $rootScope.$emit(eventType.NOTIFICATION, {
        'type': 'POPMSG',
        'title': '消息',
        'message': '更新成功'
      });
    });
  };
  //完成本次签到方法
  $scope.complete_sign_in = function () {
    // console.log($scope.sign_in.id);
    if (!$scope.sign_in.id) {
      $rootScope.$emit(eventType.NOTIFICATION, {
        'type': 'POPMSG',
        'title': '警告',
        'message': '请先保存本次签到'
      });
      return;
    }
    //请求结束本次签到
    var url = '/api/signs/' + $scope.sign_in.id + '/done';
    $http.post(url)
      .success(function (data) {
        // console.log(data);
        if (data.is_done) {
          $rootScope.$emit(eventType.NOTIFICATION, {
            'type': 'POPMSG',
            'title': '消息',
            'message': '成功结束签到'
          });
          $state.go('activity_item', {
            'id': $scope.activity.id
          });
        }
      });
  };
  //查看历史签到列表方法
  $scope.history_sign_in = function () {
    // console.log($scope.activity.id);
    //获取全部签到插件
    var url = '/api/signs/' + $scope.activity.id + '/all';
    $http.get(url)
      .success(function (data) {
        // console.log(angular.toJson(data));
        var history_sign_in = data;
        $modal.open({
          templateUrl: 'partial/activity/plugin/history_sign_in.html',
          controller: 'HistorySignInCtrl',
          resolve: {
            history_sign_in: function () {
              return history_sign_in;
            }
          }
        });
      });
  };
});