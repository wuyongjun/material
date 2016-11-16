angular.module('iwx').controller('CommunityCtrl', function ($scope, $http, $modal, userService, $rootScope, eventType, ngTableParams) {
  $rootScope.welcome_bg = false;
  if (!$rootScope.mes_note) {
    $rootScope.message();
  }
  var NgTableParams = ngTableParams;
  var admins = null;
  userService.load().then(function(user) {
    if (user.roles[0].name === 'SUPER_USER') {
      $scope.su = true;
      $scope.tableParams = new NgTableParams({
        page: 1,
        count: 10,
      }, {
        counts: [],
        getData: function($defer, params) {
          if (admins) {
            $defer.resolve(admins.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          }
          $http.get('/api/su/pending_admins').success(function(data) {
            admins = data;
            $defer.resolve(admins.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          });
        }
      });
    } else {
      $scope.su = false;
      $http.get('/api/admin/community').success(function(data) {
        $scope.community = data;
      });
    }
  });
  $scope.preview = function(url) {
    $modal.open({
      template: '<div><img style="width:100%" src=' + url + '></div>',
      size: "md",
    });
  };

  $scope.confirm = function(id) {
    $rootScope.$emit(eventType.NOTIFICATION, {
      'type': 'LONG_INFO',
      'message': '处理中...'
    });
    $http.get('/api/su/confirm/' + id).success(function(data) {
      admins = data;
      $scope.tableParams.reload();
      $rootScope.$emit(eventType.NOTIFICATION, null);
    });
  };
  //监控社团描述
  $scope.$watch('community.description', function (str) {
    if (str) {
      var arr = [];
      for (var i = 0;i < str.length;i++) {
        if (str.charAt(i) !== ' ') {
          console.log('-----'+str.charAt(i));
          arr.push(str.charAt(i));
        }
      }
      console.log(arr.length);
      if (arr.length > 200) {
        $scope.show_description = true;
      } else {
        $scope.show_description = false;
      }
    }
  });
  
  $scope.submit = function() {
    var fd = new FormData();
    angular.forEach($scope.community, function(value, key) {
      fd.append(key, value);
    });
    $http.post('/api/admin/community', fd, {
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).success(function(data) {
      $scope.community = data;
      $rootScope.$emit(eventType.NOTIFICATION, {
        // 'type': 'INFO',
        'type': 'POPMSG',
        'title': '消息',
        'message': '保存成功'
      });
    });
  };
  //分享web社团主页
  /*$scope.share_web = function () {
    console.log(window.location.origin);
    var share_url = window.location.origin + '/weixin/community/share#' + $scope.community.id
    $modal.open({
      templateUrl: 'partial/common/share_qrcode.html',
      controller: 'shareQrcodeCtrl',
      resolve: {
        shareUrl: function () {
          return share_url;
        }
      }
    });
  };*/
});