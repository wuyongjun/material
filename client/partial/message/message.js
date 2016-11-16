angular.module('iwx').controller('MessageCtrl', function ($scope, $http, $stateParams, userService, $rootScope, eventType, $modal, $state) {
    if ($state.current.name === 'message.user') {
        //获取信息列表的接口
        $scope.messages_url = '/api/admin/messages/' + $stateParams.id;
        //发送消息的接口
        $scope.mes_send_url = '/api/admin/messages/' + $stateParams.id;
        //调用父级方法清除未读消息提醒count
        $http.put('/api/admin/messages/' + $stateParams.id).success(function() {
            $scope.$parent.clearId($stateParams.id);
        });
    } else {
        $scope.messages_url = '/api/admin/bazaar/message/' + $stateParams.id + '/list';
        $scope.mes_send_url = '/api/admin/bazaar/message/' + $stateParams.id + '/send';
        //获取和该用户有关的聊天主题
        /*$http.get('/api/admin/bazaar/message/' + $stateParams.id + '/topic')
            .success(function (data) {
                console.log(data);
                $scope.items = ['/static/images/3.jpg', '/static/images/4.jpg', '/static/images/5.jpg', '/static/images/ticket.jpg', '/static/images/login_before.jpg',
                 '/static/images/1.jpg', '/static/images/6.jpg', '/static/images/7.jpg', '/static/images/8.jpg', 
                 '/static/images/9.jpg', '/static/images/10.jpg', '/static/images/11.jpg'];
                $scope.topic = true;
            });*/
    }
    $scope.messages = [];
    $scope.load_btn_content = '加载更多消息';
    $scope.load_more_btn = false;
    var messageSet = {};
    $scope.messageStatus = {
        'NEW': '未查看',
        'READ': '已查看'
    };
    var current_page = 1;
    var loadMessages = function(page) {
      var url = $scope.messages_url + '?page=' + page + '&per_page=' + 10;
      $http.get(url).success(function(data) {
        if (data.items.length === 0) {
            /*$rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '消息',
                'message': '已加载全部聊天信息'
            });*/
            $scope.load_btn_content = '已经加载全部信息';
            $scope.load_more_btn = true;
            return; 
        }
        //广播通信事件
        // $rootScope.$broadcast('messageEvent');
        var added = 0;
        angular.forEach(data.items, function(value) {
            if (!(value.id in messageSet)) {
                messageSet[value.id] = true;
                $scope.messages.push(value);
                added++;
            }
        });
        if (added === 0) {
            loadMessages(++current_page);
        }
      });
    };
    loadMessages(current_page);
    $scope.loadMore = function() {
        loadMessages(++current_page);
    };
    $scope.send = function() {
        if (!$scope.content) { return; }
        $http.post($scope.mes_send_url, {
            'content': $scope.content
        }).success(function(data) {
            messageSet[data.id] = true;
            $scope.messages.unshift(data);
        });
        $scope.content = '';
    };
    $scope.viewImage = function(image) {
        try {
            var tempArr = image.split('/');
            if (tempArr[tempArr.length - 1] === 'placeholder.png') {
                return;
            }
          // console.log(tempArr);
        } catch (e) {
            $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '警告',
                'message': '图片路径不正确'
            });
            return;
        }
        $modal.open({
            template: '<div><img style="width:100%" src=' + image + '></div>',
            size: "lg",
        });
    };
    userService.load().then(function(data) {
      $scope.community = data.managed_community;
      $http.get('/api/users/' + $stateParams.id).success(function(data) {
            $scope.user = data;
        });
      });
});