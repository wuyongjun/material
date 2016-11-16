angular.module('iwx')
  .controller('TicketCtrl', function ($scope, $http, $rootScope, eventType, $state, $modal, $filter) {
    $scope.ticket = {};
    $scope.confirm = {};
    $scope.confirm.title = "请确定您的操作";
    $scope.confirm.message = "MESSAGE";
    $scope.confirm.type = "";
    $scope.confirm.param = "";

    $scope.update = false;
    //赞助商名称正则表达式
    $scope.sponsor_name_regexp = /^[\u4e00-\u9fa5_\x21-\x7e_\u0b7-\uff1f_\s]{0,10}$|^[\w\s_\x21-\x7e]{0,25}$/;
    $http.get('/api/tickets/activity/' + $scope.$parent.activity.id).success(function(data) {
      if (data) {
        $scope.ticket_view = true;
        // console.log(data);
        $scope.ticket = data;
        //生成电子票示意图
        $scope.ticket_cover = $scope.ticket.cover.substring(0);
        $scope.ticket_logo = $scope.ticket.logo.substring(0);
        $scope.update = true;
        $scope.ticket_big_screen = true;
      } else {
        $scope.ticket_view = false;
        $scope.ticket = {};
        $scope.ticket.activity_id = $scope.$parent.activity.id;
        $scope.ticket.location = $scope.$parent.activity.location;
        $scope.ticket.start_time = $scope.$parent.activity.start_time;
        $scope.ticket.end_time = $scope.$parent.activity.end_time;
        $scope.update = false;
      }
    });

    $scope.viewImage = function(image) {
        $modal.open({
          template: '<div><img style="width:100%" src=' + image + '></div>',
          size: "lg",
        });
    };
    /**
      修改信息提示为modal
    */
    $scope.validation = function() {
      if($scope.ticket.total == null || isNaN(parseInt($scope.ticket.total)) || parseInt($scope.ticket.total) <= 0) {
        $rootScope.$emit(eventType.NOTIFICATION, {
            /*'type': 'ERROR',
            'message': '请正确输入人数'*/
            'type': 'POPMSG',
            'title': '警告',
            'message': '请正确输入人数'
        });
        return false;
      }

      if($scope.ticket.start_time == null || $scope.ticket.start_time === "") {
        $rootScope.$emit(eventType.NOTIFICATION, {
            'type': 'POPMSG',
            'title': '警告',
            'message': '请正确输入开始时间'
        });
        return false;
      }

      if($scope.ticket.end_time == null || $scope.ticket.end_time === "") {
        $rootScope.$emit(eventType.NOTIFICATION, {
            'type': 'POPMSG',
            'title': '警告',
            'message': '请正确输入结束时间'
        });
        return false;
      }

      if($scope.ticket.content == null || $scope.ticket.content === "") {
        $rootScope.$emit(eventType.NOTIFICATION, {
            'type': 'POPMSG',
            'title': '警告',
            'message': '请完整填写介绍'
        });
        return false;
      }    

      if($scope.ticket.location == null || $scope.ticket.location === "") {
        $rootScope.$emit(eventType.NOTIFICATION, {
            'type': 'POPMSG',
            'title': '警告',
            'message': '请完整填写地点'
        });
        return false;
      }

      if (!$scope.sponsor_name_regexp.test($scope.ticket.sponsor_name)) {
        $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '警告',
          'message': '请注意填写内容字数限制！'
        });
        return false;
      }
      return true;
    };

    $scope.create = function() {
      if(!$scope.validation()) {
        return;
      }
      var fd = new FormData();
      angular.forEach($scope.ticket, function(value, key) {
        fd.append(key, value);
      });
      $http.post('/api/tickets', fd, {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).success(function(data) {
        $scope.ticket = data;
        $scope.update = true;
        $scope.ticket_view = true;
        $scope.ticket_big_screen = true;
        //生成电子票示意图
        $scope.ticket_cover = $scope.ticket.cover.substring(0);
        $scope.ticket_logo = $scope.ticket.logo.substring(0);
        $rootScope.$emit(eventType.NOTIFICATION, {
            /*'type': 'INFO',
            'message': '创建成功'*/
            'type': 'POPMSG',
            'title': '消息',
            'message': '创建成功'
        });
      });
    };

    $scope.close = function() {
        var url = '/api/admin/activities/' + $scope.$parent.activity.id + '/plugins/ticket';
        // console.log(url);
        $http.delete(url).success(function(data) {
          // console.log(data);
          $scope.$parent.activity = data;
          $state.go('activity_item', {
              'id': data.id
          }, {reload: true});
        });
    };

    $scope.change = function() {
      if(!$scope.validation()) {
        return;
      }
      if (typeof($scope.ticket.start_time) === 'number') {
        $scope.ticket.start_time = $filter('date')($scope.ticket.start_time, 'yyyy-MM-dd HH:mm');
      }
      if (typeof($scope.ticket.end_time) === 'number') {
        $scope.ticket.end_time = $filter('date')($scope.ticket.end_time, 'yyyy-MM-dd HH:mm');
      }
      // console.log($scope.ticket);
      var fd = new FormData();
      angular.forEach($scope.ticket, function(value, key) {
        fd.append(key, value);
      });
      // console.log(fd);
      $http.put('/api/tickets/' + $scope.ticket.id, fd, {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).success(function(data) {
        $rootScope.$emit(eventType.NOTIFICATION, {
            'type': 'POPMSG',
            'title': '消息',
            'message': '更新成功'
        });
        $scope.ticket = data;
        $scope.ticket_cover = '/static/images/loading-4.jpg';
        $scope.ticket_logo = '/static/images/loading-5.jpg';
        $('#ticket_image').bind('load', function () {
          $scope.ticket_cover = $scope.ticket.cover.substring(0);
          $scope.ticket_logo = $scope.ticket.logo.substring(0);
        });
      });
  };
    //停用电子票插件
    $scope.complete_ticket = function () {
      // console.log($scope.ticket.id);
      if ($scope.ticket.id === undefined) {
        $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '警告',
          'message': '请先创建电子票'
        });
        return;
      }
      $http.post('/api/tickets/'+$scope.ticket.id+'/done')
        .success(function (data) {
          // console.log(data);
          if (data.is_done) {
            $rootScope.$emit(eventType.NOTIFICATION, {
              'type': 'POPMSG',
              'title': '消息',
              'message': '成功停用电子票'
            });
            $state.go('activity_item', {
              'id': $scope.activity.id
            });
          } else {
            $rootScope.$emit(eventType.NOTIFICATION, {
              'type': 'POPMSG',
              'title': '消息',
              'message': '未成功停用电子票'
            });
          }
        });
    };
    //查看历史电子票情况
    $scope.history_ticket = function () {
      $http.get('/api/tickets/'+$scope.activity.id+'/all')
        .success(function (data) {
          // console.log(data);
          var history_ticket = data;
          $modal.open({
            templateUrl: 'partial/activity/plugin/history_ticket.html',
            controller: 'HistoryTicketCtrl',
            resolve: {
              history_ticket: function () {
                return history_ticket;
              }
            }
          });
        });
      
    };
  })
  .controller('HistoryTicketCtrl', function ($scope, $http, $rootScope, eventType, history_ticket) {
    var tickets = [];
    if (history_ticket !== undefined) {
      var len = history_ticket.length;
      for (var i=0;i<len;i++) {
        if (history_ticket[i].is_done) {
          tickets.push(history_ticket[i]);
        }
      }
    }
    $scope.history_ticket = tickets;
  }); 