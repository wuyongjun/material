angular.module('iwx').controller('TimelineCtrl', function ($scope, $http, $rootScope, eventType, ngTableParams) {

  $scope.comment = {
    'images': [],
    'title': 'PLACEHOLDER'
  };
  // $scope.currentPage = 1;
  
  // Avoid lint complain
  var NgTableParams = ngTableParams;
  var activities = null;
  $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
  }, {
      counts: [],
      total: 0,
      getData: function($defer, params) {
          $http.get('/api/activities/' + $scope.$parent.activity.id + '/comments_edit?page='+params.page() + '&per_page=' + params.count())
            .success(function(data) {
              var items = data.items;
              $scope.comments = items;
              params.total(data.total);
              $defer.resolve($scope.comments);
          });
      }
  });
  /*$scope.refresh = function() {
    $http.get('/api/activities/' + $scope.$parent.activity.id + '/comments?page=2' + $scope.currentPage).success(
      function(data) {
        // console.log(angular.toJson(data)+'------12');
        $scope.comments = data;
      });
  };*/

  $scope.removeFile = function(index) {
    var newImages = [];
    angular.forEach($scope.comment.images, function(value, i) {
      if (i !== index) {
        newImages.push(value);
      }
    });
    $scope.comment.images = newImages;
  };

  // $scope.refresh();
  $scope.submit = function() {
    if(!$scope.comment.images) {
      $scope.comment.images = [];
    }

    if ($scope.comment && $scope.comment.images && $scope.comment.images.length > 6) {
      $rootScope.$emit(eventType.NOTIFICATION, {
        /*'type': 'ERROR',
        'message': '最多6张图片'*/
        'type': 'POPMSG',
        'title': '警告',
        'message': '最多6张图片'
      });
      return;
    }

    $scope.comment.title = "PLACEHOLDER";
    if (!$scope.comment.title || $scope.comment.title.length === 0) {
      $rootScope.$emit(eventType.NOTIFICATION, {
        'type': 'ERROR',
        'message': '请填写标题'
      });
      return;
    }

    if (!$scope.comment.content || $scope.comment.content.length === 0) {
      $rootScope.$emit(eventType.NOTIFICATION, {
        /*'type': 'ERROR',
        'message': '请填写内容'*/
        'type': 'POPMSG',
        'title': '警告',
        'message': '请填写要爆料的内容'
      });
      return;
    } 
    
    var fd = new FormData();
      fd.append('title', $scope.comment.title);
      fd.append('content', $scope.comment.content);
      angular.forEach($scope.comment.images, function(value, key) {
        fd.append('images', value);
      });
      /*$rootScope.$emit(eventType.NOTIFICATION, {
        'type': 'LONG_INFO',
        'message': '正在上传。。。'
      });*/
      // console.log($scope.comment);
      $http.post('/api/activities/' + $scope.$parent.activity.id + '/comments', fd, {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).success(function(data) {
        $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '消息',
          'message': '发布成功'
        });
        // console.log($scope.comments);
        // $scope.comments.unshift(data);
        $scope.tableParams.reload();
        $scope.comment = {};
      });
  };

});