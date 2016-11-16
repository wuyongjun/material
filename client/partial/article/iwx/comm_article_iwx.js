angular.module('iwx')
  .controller('CommArtIwxCtrl', function ($scope, $rootScope, $http, ngTableParams, eventType, $state, $modal) {
    //确认操作参数
    $scope.confirm = {};
    $scope.confirm.title = "请确定您的操作";
    $scope.confirm.message = "MESSAGE";
    $scope.confirm.type = "";
    $scope.confirm.param = "";
    //条件搜索参数对象
    $scope.params = {};
    //获取管理的地域和学校
    $scope.load_region = function () {
      $http
        .get('/api/iwx/geography')
        .success(function (data) {
          $scope.geography = data;
          $scope.provinceArray = [];
          angular.forEach($scope.geography, function (value, key) {
            $scope.provinceArray.push(value.obj);
          });
          $scope.params.province_scope_id = $scope.provinceArray[0].id;
          $scope.cityArray = [];
          if ($scope.geography) {
            $scope.geography_city = $scope.geography[$scope.params.province_scope_id];
            angular.forEach($scope.geography_city, function (value, key) {
              if (value instanceof Array) {
                $scope.cityArray.push(value[0].geography);
              }
            });
          }
          $scope.params.city_scope_id = $scope.cityArray[0].id;
          $scope.universityArray = [];
          if ($scope.geography_city) {
            $scope.geography_university = $scope.geography_city[$scope.params.city_scope_id];
            angular.forEach($scope.geography_university, function (value, key) {
              $scope.universityArray.push(value.university);
            });
          }
          $scope.params.university_scope_id = $scope.universityArray[0].id;
          $scope.article_list_param = $scope.params.university_scope_id;
          article_list();
        });
    };
    $scope.load_region();
    //监控省下拉列表框的value值的改变
    $scope.change_province = function () {
      $scope.cityArray = [];
      if ($scope.geography) {
        $scope.geography_city = $scope.geography[$scope.params.province_scope_id];
        angular.forEach($scope.geography_city, function (value, key) {
          if (value instanceof Array) {
            $scope.cityArray.push(value[0].geography);
          }
        });
      }
    };
    //监控市下拉列表框的value值的改变
    $scope.change_city = function () {
      $scope.universityArray = [];
      if ($scope.geography_city) {
        $scope.geography_university = $scope.geography_city[$scope.params.city_scope_id];
        angular.forEach($scope.geography_university, function (value, key) {
          $scope.universityArray.push(value.university);
        });
      }
    };
    //监控学校下拉框的value值的改变
    $scope.change_university = function () {
      console.log('change_university');
      $scope.article_list_param = $scope.params.university_scope_id;
      $scope.tableParams.page(1);
      $scope.tableParams.reload();
    };
    //社团新闻列表
    var article_list = function () {
      var NgTableParams = ngTableParams;
      var articles = null;
      $scope.tableParams = new NgTableParams({
        page: 1,
        count: 10
      }, {
        counts: [],
        total: 0,
        getData: function ($defer, params) {
          $http
            .get('/api/iwx/news/' + $scope.article_list_param + '/list' +
              '?page='+params.page() + '&per_page=' + params.count())
            .success(function (data) {
              //获取新闻总数
              $scope.article_sum = data.total;
              articles = data.items;
              params.total(data.total);
              $defer.resolve(articles);
            });
        }
      });
    };
    //确认操作方法
    $scope.confirm = function () {
      /*if ($scope.confirm.type === 'publishArticle') {
       $http
       .post('' + $scope.confirm.param + '/' + $scope.confirm.type)
       .success(function () {
       $scope.tableParams.reload();
       });
       } else */if ($scope.confirm.type === 'unPublishArticle') {
        $http
          .post('/api/iwx/news/' + $scope.confirm.param + '/unpublish')
          .success(function () {
            $scope.tableParams.reload();
          });
      }
    };
    var reloadArticle = function () {
      $scope.tableParams.reload();
    };
    //发布新闻或者取消发布
    $scope.togglePubArt = function (article_id, publish) {
      var action = publish ? 'unPublishArticle' : 'publishArticle';
      if (action === 'unPublishArticle') {
        $modal.open({
          templateUrl: 'partial/common/unpublished_reason.html',
          controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
            $scope.reason_title = '取消发布理由';
            $scope.$watch('content', function (value) {
              if (value) {
                $scope.ok_btn = false;
              } else {
                $scope.ok_btn = true;
              }
            });
            $scope.ok = function () {
              $http.post('/api/iwx/news/' + article_id + '/unpublish', { content: $scope.content })
                .success(function (data) {
                  $modalInstance.close('ok');
                  reloadArticle();
                });
            };
            $scope.cancel = function () {
              console.log($modalInstance);
              $modalInstance.close('ok');
            };
          }]
        });
      } else {
        $scope.confirm.message = '您确定要发布这篇新闻？';
        $scope.confirm.type = 'publishArticle';
      }
    };
  });
