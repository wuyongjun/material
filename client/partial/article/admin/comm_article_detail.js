angular.module('iwx')
  .controller('CommArtDetailCtrl', function ($scope, $rootScope, $http, $stateParams, eventType, $state) {
    // console.log('新闻id：' + $stateParams.articleId);
    $scope.articleId = $stateParams.articleId;
    $scope.page = $stateParams.page;
    console.log($stateParams);
    $scope.article = {};
    //url regular expression
    $scope.urlRegExp = /^https{0,1}:\/\/mp.weixin.qq.com\//;
    if ($scope.articleId === '-1') {
      $scope.article.title = '';
      $scope.article.context = '';
      $scope.article.link = '';
    } else {
      $http
        .get('/api/admin/news/' + $scope.articleId)
        .success(function (data) {
          $scope.article = data;
        });
    }
    //begin modify 判断original
    $scope.original = $stateParams.original;
    console.log($scope.original);
    if ($scope.original === "true") {
      //原创
      $scope.tab = 1;
    } else {
      $scope.tab = 2;
    }
    $scope.tab1 = function () {
      $scope.tab = 1;
      $scope.disable=true;
    };
    $scope.tab2 = function () {
      $scope.tab = 2;
      $scope.disable=false;
    };
    $scope.sendArticle = function () {
      var params = {};
      if ($scope.articleId === '-1') {
        //创建
        if ($scope.tab === 1) {
          //原创，组织参数params
          params.title = $scope.article.title;
          params.context = $scope.article.context;
          params.original_context = $scope.article.original_context;
          $scope.article.original = 1;
          params.original = $scope.article.original;

          //创建新闻
          $http
            .post('/api/admin/news/add', params, {
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .success(function (data) {
              $state.go('activity.article', {currentPage:1,page: 1}, {reload: true});
              $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '消息',
                'message': '成功发送社团新闻。'
              });
            });

        } else {
          //导入
          console.log($scope.urlRegExp.test($scope.article.link));
          if (!$scope.urlRegExp.test($scope.article.link)) {
            $rootScope.$emit(eventType.NOTIFICATION, {
              'type': 'POPMSG',
              'title': '消息',
              'message': '目前仅支持http(s)://mp.weixin.qq.com/开头的新闻链接。'
            });
            return;
          }
          params.title = $scope.article.title;
          params.context = $scope.article.context;
          params.link = $scope.article.link;
          //创建新闻
          $http
            .post('/api/admin/news/add', params, {
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .success(function (data) {
              $state.go('activity.article', {page: 1}, {reload: true});
              $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '消息',
                'message': '成功发送社团新闻。'
              });
            });
        }
      } else {
        //修改
        if ($scope.tab=== 1) {
          //原创，组织参数params
          params.title = $scope.article.title;
          params.context = $scope.article.context;
          params.original_context = $scope.article.original_context;
          $scope.article.original = 1;
          params.original = $scope.article.original;
          console.log(params);
          $http
            .put('/api/admin/news/' + $scope.articleId + '/update', params, {
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .success(function (data) {
              $state.go('activity.article', {currentPage:1,page: $scope.page}, {reload: true});
              $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '消息',
                'message': '成功发送社团新闻。'
              });
            });
        } else {
          //导入;
          params.title = $scope.article.title;
          params.context = $scope.article.context;
          params.link = $scope.article.link;
          $http
            .put('/api/admin/news/' + $scope.articleId + '/update', params, {
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .success(function (data) {
              $state.go('activity.article', {currentPage:1,page: $scope.page}, {reload: true});
              $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '消息',
                'message': '成功发送社团新闻。'
              });
            });
        }
      }

    };
    //end modify

    // };
  });
