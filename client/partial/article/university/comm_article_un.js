angular.module('iwx')
  .controller('CommArtUnCtrl', function ($scope, $rootScope, $http, eventType, ngTableParams, $modal) {
    //查询到的社团
    $scope.communitys = [];
    $scope.community_set = {};
    //当前页码
    $scope.current_page = 1;
    $scope.load_btn = '加载更多~~';
    //选中的社团id数组
    $scope.community_id_chosen = [];
    //确认框参数
    $scope.confirm = {};
    $scope.confirm.title = '请确定您的操作';
    $scope.confirm.message = 'MESSAGE';
    $scope.confirm.type = '';
    $scope.confirm.param = '';
    $scope.c_type = 'committee';
    $('#org_tab a').click(function (e) {
      e.preventDefault();
      $(this).tab('show');
      var id = $(this).attr('id');
      if (id === 'committee') {
        $scope.$apply(function () {
          $scope.community_id_chosen = [];
          $scope.choose_all = false;
          $scope.communitys = [];
          $scope.community_set = {};
          $scope.c_type = 'committee';
          $scope.current_page = 1;
          load_community($scope.current_page);
          $scope.tableParams.page($scope.current_page);
          $scope.tableParams.reload();
        });
      } else if (id === 'union') {
        $scope.$apply(function () {
          $scope.community_id_chosen = [];
          $scope.choose_all = false;
          $scope.communitys = [];
          $scope.community_set = {};
          $scope.c_type = 'union';
          $scope.current_page = 1;
          load_community($scope.current_page);
          $scope.tableParams.page($scope.current_page);
          $scope.tableParams.reload();
        });
      } else if (id === 'tissue') {
        $scope.$apply(function () {
          $scope.community_id_chosen = [];
          $scope.choose_all = false;
          $scope.communitys = [];
          $scope.community_set = {};
          $scope.c_type = 'tissue';
          $scope.current_page = 1;
          load_community($scope.current_page);
          $scope.tableParams.page($scope.current_page);
          $scope.tableParams.reload();
        });
      } else {
        $scope.$apply(function () {
          $scope.community_id_chosen = [];
          $scope.choose_all = false;
          $scope.communitys = [];
          $scope.community_set = {};
          $scope.c_type = 'organization';
          $scope.current_page = 1;
          load_community($scope.current_page);
          $scope.tableParams.page($scope.current_page);
          $scope.tableParams.reload();
        });
      }
    });
    //选择社团
    $scope.choose_community = function (community_id, choose_item) {
      if (choose_item) {
        $scope.community_id_chosen.push(community_id);
        console.log($scope.community_id_chosen);
        //调用分页接口，查询新闻
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
      } else {
        for (var i = 0;i < $scope.community_id_chosen.length;i++) {
          var temp = $scope.community_id_chosen[i];
          if (temp === community_id) {
            $scope.community_id_chosen.splice($scope.community_id_chosen.indexOf(temp), 1);
          }
        }
        console.log($scope.community_id_chosen);
        //调用分页接口，查询新闻
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
      }
    };
    //选择查询到的所有社团
    $scope.choose_communitys = function (choose_all) {
      if (choose_all) {
        if ($scope.community_id_chosen.length !== 0) {
          $scope.community_id_chosen.splice(0, $scope.community_id_chosen.length);
        }
        for (var i = 0;i < $scope.communitys.length; i++) {
          var temp = $scope.communitys[i];
          $scope.community_id_chosen.push(temp.id);
        }
        console.log($scope.community_id_chosen);
        //调用分页接口，查询新闻
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
      } else {
        $scope.community_id_chosen.splice(0, $scope.community_id_chosen.length);
        console.log($scope.community_id_chosen);
        //调用分页接口，查询新闻
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
      }
    };
    //加载查询到的社团
    var load_community = function (page) {
      $http
        .get('/api/un/community?page=' + page + '&per_page=12&c_type=' + $scope.c_type)
        .success(function (data) {
          if (data.items.length === 0) {
            if (page === 1) {
              $scope.msg = false;
              if ($scope.c_type === 'organization') {
                $scope.load_msg = '暂时没有更多' + $rootScope.org_type[$scope.c_type] + '~~';
              } else {
                $scope.load_msg = '暂时没有更多' + $rootScope.org_type[$scope.c_type] + '组织~~';
              }
            } else {
              $scope.btn = true;
              $scope.load_btn = '已经加载全部~~';
            }
            return;
          }
          $scope.btn = false;
          $scope.load_btn = '加载更多~~';
          $scope.msg = true;
          $scope.show_community = true;
          var add = 0;
          angular.forEach(data.items, function (value) {
            if (!(value.id in $scope.community_set)) {
              $scope.community_set[value.community.id] = true;
              $scope.communitys.push(value.community);
              add++;
            }
          });
          //当全选复选框为选中状态时，添加选中的社团
          if ($scope.choose_all) {
            $scope.choose_communitys($scope.choose_all);
          }
          if (add === 0) {
            load_community(++$scope.current_page);
          }
        });
    };
    load_community($scope.current_page);
    //加载更多
    $scope.load_more = function () {
      load_community(++$scope.current_page);
    };
    //社团新闻列表
    var NgTableParams = ngTableParams;
    var articles = null;
    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10
    }, {
      counts: [],
      total: 0,
      getData: function ($defer, params) {
        //请求参数
        var request_param;
        if ($scope.community_id_chosen.length !== 0) {
          var comm_id_str = '';
          for (var i=0;i<$scope.community_id_chosen.length;i++) {
            if (i !== $scope.community_id_chosen.length - 1) {
              comm_id_str += $scope.community_id_chosen[i] + '-';
            } else {
              comm_id_str += $scope.community_id_chosen[i] + '';
            }

          }
          console.log(comm_id_str);
          request_param = '?page=' + params.page() + '&per_page=' + params.count() + '&communities=' + comm_id_str;
        } else {
          request_param = '?page=' + params.page() + '&per_page=' + params.count() + '&c_type=' + $scope.c_type;
        }
        $http
          .get('/api/un/news/list' + request_param)
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
      /*if ($scope.confirm.type === 'publishArticle') {
       $http
       .post('' + $scope.confirm.param + '/' + $scope.confirm.type)
       .success(function () {
       $scope.tableParams.reload();
       });
       } else */if ($scope.confirm.type === 'unPublishArticle') {
        $http
          .post('/api/un/news/' + $scope.confirm.param + '/unpublish')
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
            $scope.reason_title = '取消发表理由';
            $scope.$watch('content', function (value) {
              if (value) {
                $scope.ok_btn = false;
              } else {
                $scope.ok_btn = true;
              }
            });
            $scope.ok = function () {
              console.log($scope.content);
              $http.post('/api/un/news/' + article_id + '/unpublish', { content: $scope.content })
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
        $scope.confirm.param = article_id;
        $('#confirmModal').modal();
        return;
      }
    };
    //查看社团详细信息
    $scope.preview_host = function (hostId) {
      $modal.open({
        templateUrl: 'partial/common/host_detail.html',
        controller: 'HostDetailCtrl',
        resolve: {
          hostId: function () {
            return hostId;
          }
        }
      });
    };
  });
