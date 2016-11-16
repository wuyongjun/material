angular.module('iwx')
  .controller('PrizeAdd', function ($scope, $state, $modalInstance, eventType, $rootScope, $http, ngTableParams, award, activity_id, $modal) {
    $scope.award = award;
    // console.log($scope.award);
    var NgTableParams = ngTableParams;
    var coupons = null;
    $scope.tableParams = new NgTableParams({
        page: 1,
        count: 5,
    }, {
        counts: [],
        total: 0,
        getData: function($defer, params) {
            $http.get('/api/goods/community?page='+params.page() + '&per_page=' + params.count()/*, {
                'page': params.page()
            }*/).success(function(data) {
                if (data.total === 0) {
                  $scope.note = true;
                }
                coupons = data.items;
                // console.log(coupons);
                params.total(data.total);
                $defer.resolve(coupons);
            });
        }
    });
    //添加奖品数量
    $scope.select = function (prize, coupon) {
      //console.log(angular.toJson(prize)+'-----'+angular.toJson(coupon));
      if (!prize) {
        $rootScope.$emit(eventType.NOTIFICATION, {
          // 'type': 'ERROR',
          'type': 'POPMSG',
          'title': '警告',
          'message': '请填写奖品数量'
        });
        return;
      }

      if ((coupon.remain - (prize.number||0) * $scope.award.total) < 0) {
        $rootScope.$emit(eventType.NOTIFICATION, {
            // 'type': 'ERROR',
            'type': 'POPMSG',
            'title': '警告',
            'message': '奖品数量不够'
        });
        return false;
      }

      $http.post('/api/lotteries/' + $scope.award.id + '/prize', {
        goods_id: coupon.id,
        number: prize.number,
        awards_id: $scope.award.id
      }).success(function (data) {
        $modalInstance.close('ok');
        $state.go('activity_item.lottery_plugin', {
          'id': activity_id
        }, {reload: true});
      });
    };
    //跳转到电子凭证页面
    $scope.to_certificate = function () {
      $modalInstance.close('ok');
      $state.go('certificate', {reload: true});
    };
    //关闭窗口
    $scope.cancel = function () {
      $modalInstance.close('ok');
    };
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
  })
  .controller('PrizeMinus', function ($scope, $state, $modalInstance, eventType, $rootScope, $http, award, activity_id, $modal, award_total) {
    $scope.award = award;
    // console.log($scope.award);
    $scope.award_total = award_total;
    //减少奖品数量
    $scope.update_number = function (prize) {
      if (!prize) {
        $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '警告',
          'message': '奖品数量不能为空'
        });
        return;
      }
      if (prize.number === 0) {
        // console.log($scope.award.number - (prize.number||0));
        $http.delete('/api/lotteries/prize/' + $scope.award.id)
          .success(function (data) {
            $modalInstance.close('ok');
            $state.go('activity_item.lottery_plugin', {
              'id': activity_id
            }, {reload: true});
          });
      } else {
        // console.log(prize.number);
        if (prize.number < 0) {
          $rootScope.$emit(eventType.NOTIFICATION, {
            'type': 'POPMSG',
            'title': '警告',
            'message': '奖品数量不能为负数'
          });
          return;
        }
        $http.put('/api/lotteries/prize/' + $scope.award.id, {
            goods_id: $scope.award.goods_info.id,
            number: prize.number,
            awards_id: $scope.award.awards_id
          })
          .success(function (data) {
            // console.log(data);
            $modalInstance.close('ok');
            $state.go('activity_item.lottery_plugin', {
              'id': activity_id
            }, {reload: true});
          });
      }
      // console.log(prize);
    };
    //获取大图  /images/images/placeholder.png
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
  });

//抽奖controller
angular.module('iwx')
  .controller('LotteryCtrl', function ($scope, $http, $rootScope, eventType, $state, $modal, ngTableParams) {
    $scope.i = {};
    $scope.lottery = {
      'activity_id': $scope.$parent.activity.id
    };

    $scope.i._lottery = {};
    var initInfo = function () {
      $http.get('/api/admin/activities/' + $scope.$parent.activity.id).success(function(data) {
          $scope.activity = data;
          $scope.lottery_scope = [];
          //抽奖插件基本信息
          $scope.lottery_baseInfo = {};
          $scope.lottery.activity_id = $scope.activity.id;

          //find lottery id
          if($scope.activity.plugins && $scope.activity.plugins.length > 0) {
            for(var i=0;i<$scope.activity.plugins.length;i++) {
              if($scope.activity.plugins[i].id === 'lottery' && $scope.activity.plugins[i].enabled === true && $scope.activity.plugins[i].preview && $scope.activity.plugins[i].preview.id) {
                $scope.lottery.id = $scope.activity.plugins[i].preview.id;
              }
            }
          }

          if($scope.lottery.id && $scope.lottery.id > 0) {
            $http.get('/api/lotteries/lottery_scope').success(function (data) {
              console.log(data);
              $scope.i._lottery.scope_id = data[0].id;
              $scope.lottery_scopes = data;
            });
            //获取抽奖插件的基本信息
            $http.get('/api/lotteries/plugin/' + $scope.lottery.id)
              .success(function (data) {
                // console.log(data);
                $scope.lottery_baseInfo = data;
              });
            var NgTableParams = ngTableParams;
            var awards = null;
            $scope.tableParams = new NgTableParams({
                page: 1,
                count: 10,
            }, {
                counts: [],
                total: 0,
                getData: function($defer, params) {
                    $http.get('/api/lotteries/' + $scope.lottery.id + '/awards?page='+params.page() + '&per_page=' + params.count()/*, {
                        'page': params.page()
                    }*/).success(function(data) {
                        $scope.award_number = data.total;
                        awards = data.items;
                        // console.log(awards);
                        params.total(data.total);
                        // $defer.resolve(awards.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        $defer.resolve(awards);
                    });
                }
            });
          } else {
            $http.post('/api/lotteries/add', {activity_id: $scope.lottery.activity_id}).success(function (data) {
              initInfo();
            });
          }
      });
    };

    var validationLottery = function (lottery) {
      if(!lottery.name) {
        $rootScope.$emit(eventType.NOTIFICATION, {
            // 'type': 'ERROR',
            'type': 'POPMSG',
            'title': '警告',
            'message': '请正确输入奖项名称'
        });
        return false;
      }
      if(!lottery.total) {
        $rootScope.$emit(eventType.NOTIFICATION, {
            // 'type': 'ERROR',
            'type': 'POPMSG',
            'title': '警告',
            'message': '请正确输入中奖人数'
        });
        return false;
      }
      if(!lottery.scope_id) {
        $rootScope.$emit(eventType.NOTIFICATION, {
            // 'type': 'ERROR',
            'type': 'POPMSG',
            'title': '警告',
            'message': '请正确选择抽奖范围'
        });
        return false;
      }
      if(!lottery.exchange_end_time) {
        $rootScope.$emit(eventType.NOTIFICATION, {
            // 'type': 'ERROR',
            'type': 'POPMSG',
            'title': '警告',
            'message': '请正确输入最晚兑换时间'
        });
        return false;
      }

      return true;
    };

    var getLotteryFormData = function (lottery) {
      console.log(lottery);
      return {
        scope_id: lottery.scope_id,
        name: lottery.name,
        total: lottery.total,
        exchange_end_time: lottery.exchange_end_time
      };
    };


    initInfo();

    // 添加奖项
    $scope._create = function () {
      $scope.i._lottery.show = true;
    };

    $scope._cancel = function () {
      $scope.i._lottery.show = false;
    };
    //保存添加的奖项
    $scope.lotteryCreate = function () {
      if (validationLottery($scope.i._lottery)) {
        $http.post('/api/lotteries/' + $scope.lottery.id + '/lottery', getLotteryFormData($scope.i._lottery)).success(function (data) {
          $state.go('activity_item.lottery_plugin', {
            'id': $scope.$parent.activity.id
          }, {reload: true});
        });
      }
    };

    $scope.lotteryResult = function (award) {
      $state.go('activity_item.lotteryat_plugin', {
        'id': $scope.$parent.activity.id,
        'award_id': award.id
      }, {reload: true});
    };

    $scope.lotteryChange = function (award) {
      if (validationLottery(award)) {
        $http.put('/api/lotteries/' + award.id, getLotteryFormData(award)).success(function (data) {
          $rootScope.$emit(eventType.NOTIFICATION, {
              // 'type': 'SUCCESS',
              'type': 'POPMSG',
              'title': '消息',
              'message': '修改奖项成功'
          });
        });
      }
    };

    $scope.lotteryDelete = function (award) {
      $http.delete('/api/lotteries/' + award.id).success(function (data) {
        $state.go('activity_item.lottery_plugin', {
          'id': $scope.$parent.activity.id
        }, {reload: true});
      });
    };

    var activity_id = $scope.$parent.activity.id;
    $scope.prizeCreate = function (award) {
      $modal.open({
        templateUrl: 'partial/activity/plugin/prize.html',
        controller: 'PrizeAdd',
        resolve: {
          award: function () {
            return award;
          },
          activity_id: function () {
            return activity_id;
          }
        }
      });
    };

    $scope.close = function() {
        var url = '/api/admin/activities/' + $scope.$parent.activity.id + '/plugins/lottery';
        $http.delete(url).success(function(data) {
          $scope.$parent.activity = data;
          $state.go('activity_item', {
              'id': data.id
          }, {reload: true});
        });
    };

    $scope.delete = function() {
      var url = '/api/lotteries/plugin/' + $scope.lottery.id;
      $http.delete(url).success(function(data) {
        $scope.$parent.activity = data;
        $state.go('activity_item.lottery_plugin', {
            'id': $scope.lottery.activity_id
        }, {reload: true});
      });
    };
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
    //更新奖品数量
    $scope.updatePrize = function (award) {
      $http.get('/api/lotteries/' + award.awards_id)
        .success(function (data) {
          // console.log(data);
          var award_total = data.total;
          $modal.open({
            templateUrl: 'partial/activity/plugin/prize_minus.html',
            controller: 'PrizeMinus',
            resolve: {
              award: function () {
                return award;
              },
              award_total: function () {
                return award_total;
              },
              activity_id: function () {
                return activity_id;
              }
            }
          });
        });
    };
});