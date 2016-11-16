angular.module('iwx')
  .controller('CommArticleCtrl', function ($scope, $rootScope, $http, ngTableParams, eventType, $state, $stateParams) {
    // console.log('this community article controller');
    $scope.confirm = {};
    $scope.confirm.title = '请确定您的操作';
    $scope.confirm.message = 'MESSAGE';
    $scope.confirm.type = '';
    $scope.confirm.param = '';
    $scope.currentPage = $stateParams.page;
    //begin modify 这句不写在这里，应该写在编辑新闻的js中，original是在编辑页面的路由上的参数 app.js中
    $scope.original=$stateParams.original;
    //end modify
    //创建社团新闻列表
    var NgTableParams = ngTableParams;
    var articles = null;
    $scope.tableParams = new NgTableParams({
      page: $scope.currentPage,
      // page: 1,
      count: 10
    }, {
      counts: [],
      total: 0,
      getData: function ($defer, params) {
        $scope.currentPage = params.page();
        $http
          .get('/api/admin/news/list?page='+params.page() + '&per_page=' + params.count())
          .success(function (data) {
            //获取新闻总数
            $scope.article_sum = data.total;
            articles = data.items;
            params.total(data.total);
            $defer.resolve(articles);
          });
      }
    });
    //确认操作方法
    $scope.confirm = function () {
      if ($scope.confirm.type === 'deleteArticle') {
        $http
          .delete('/api/admin/news/' + $scope.confirm.param + '/del')
          .success(function () {
            $scope.tableParams.reload();
          });
      } else if ($scope.confirm.type === 'publishArticle') {
        $http
          .post('/api/admin/news/' + $scope.confirm.param + '/publish')
          .success(function () {
            $scope.tableParams.reload();
          });
      } else if ($scope.confirm.type === 'unPublishArticle') {
        $http
          .post('/api/admin/news/' + $scope.confirm.param + '/unpublish')
          .success(function () {
            $scope.tableParams.reload();
          });
      }
    };
    //发布新闻或者取消发布
    $scope.togglePubArt = function (articleId, publish) {
      var action = publish ? 'unPublishArticle' : 'publishArticle';
      if (action === 'unPublishArticle') {
        $scope.confirm.message = '您确定要取消发布这篇新闻？';
        $scope.confirm.type = 'unPublishArticle';
      } else {
        $scope.confirm.message = '您确定要发布这篇新闻？';
        $scope.confirm.type = 'publishArticle';
      }
      $scope.confirm.param = articleId;
      $('#confirmModal').modal();
      return;
    };
    //删除新闻
    $scope.deleteArticle = function (articleId) {
      $scope.confirm.message = '您确定要删除这篇新闻？';
      $scope.confirm.type = 'deleteArticle';
      $scope.confirm.param = articleId;
      $('#confirmModal').modal();
    };
    //创建或者编辑新闻
    $scope.goToArtDetail = function (articleId, currentPage,original) {
      $state.go('article_detail', {
        'articleId': articleId,
        'page': currentPage,
        'original':original
      });
    };
    //新闻被取消发布日志页面
    $scope.goToUnpubLog = function (type, article_id) {
      $state.go('activity.unpublishLog_art', {
        'type': type,
        'id': article_id
      });
    };
  });
