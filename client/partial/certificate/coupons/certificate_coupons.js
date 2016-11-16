angular.module('iwx').controller('CertificateCouponsCtrl', function ($scope, $http, $state, $timeout, ngTableParams, $modal, $rootScope, eventType, userService) {
  $rootScope.welcome_bg = false;
  if (!$rootScope.mes_note) {
    $rootScope.message();
  }
  //创建电子礼券
  $scope.createCertificateCoupons= function () {
    $state.go('certificate_coupons_item', {
      'id': -1
    });
  };
  //修改电子礼券
  $scope.updateCertificateCoupons = function (id) {
    $state.go('certificate_coupons_item', {
      'id': id
    });
  };
  
  $scope.confirm = {};
  $scope.confirm.title = "请确定您的操作";
  $scope.confirm.message = "MESSAGE";
  $scope.confirm.type = "";
  $scope.confirm.param = "";
  
  var load_cer_coupons = function () {
    var NgTableParams = ngTableParams;
    var coupons = null;
    $scope.tableParams = new NgTableParams({
        page: 1,
        count: 10,
    }, {
        counts: [],
        total: 0,
        getData: function($defer, params) {
            // console.log(params.count() + '---------' + params.page());
            $http.get('/api/goods/community?page='+params.page()+'&per_page=' +params.count()).success(function(data) {
                // console.log(data);
                coupons = data.items;
                // $scope.community_id = coupons[0].community_id;
                params.total(data.total);
                $defer.resolve(coupons);

            });
        }
    });
  };
  
  userService.load(true).then(function () {
    load_cer_coupons();
  });
  //获取原图  /images/images/placeholder.png
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
  //删除电子礼券
  $scope.del_coupon = function (coupon_id) {
    $scope.confirm.message = '确定要删除这个礼券？';
    $scope.confirm.type = 'delete_coupon';
    $scope.confirm.param = coupon_id;
    $('#confirmModal').modal();
    return;
  };
  //确认框
  $scope.confirmModal = function () {
    if ($scope.confirm.type === "delete_coupon") {
      $http.delete('/api/goods/'+ $scope.confirm.param)
        .success(function (data) {
          $scope.tableParams.reload();
        });
    }
  }; 
});