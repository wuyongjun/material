angular.module('iwx').controller('VoteStatCtrl', function(
    $scope, $http, $rootScope, eventType, $state, $modal) {

  $scope.returntovote = function() {
    $state.go('activity_item.vote_plugin', {
      'id': $scope.$parent.activity.id
    }, {reload: true});
  };
  /*$scope.accMul = function(arg1,arg2){
    var m=0,s1=arg1.toString(),s2=arg2.toString();
    try{
      m+=s1.split('.')[1].length;
      m+=s2.split('.')[1].length;
    }catch(e){}
    return Number(s1.replace('.',''))*Number(s2.replace('.',''))/Math.pow(10,m);
  };*/

  $scope.confirm = {};
  $scope.confirm.title = "请确定您的操作";
  $scope.confirm.message = "MESSAGE";
  $scope.confirm.type = "";
  $scope.confirm.param = "";

  $scope.vote = {
    'activity_id': $scope.$parent.activity.id
  };

  $http.get('/api/admin/activities/' + $scope.$parent.activity.id).success(function(data) {
      $scope.activity = data;

      //find vote id
      if($scope.activity.plugins && $scope.activity.plugins.length > 0) {
        for(var i=0;i<$scope.activity.plugins.length;i++) {
          if($scope.activity.plugins[i].id === "vote" && $scope.activity.plugins[i].enabled === true && $scope.activity.plugins[i].preview && $scope.activity.plugins[i].preview.id) {
            $scope.vote.id = $scope.activity.plugins[i].preview.id;
          }
        }
      }

      if($scope.vote.id && $scope.vote.id > 0) {
        $http.get('/api/votes/' + $scope.vote.id).success(function(data) {
          if (data) {
            $scope.vote = data;
            if ($scope.vote.candidates_num === 0) {
              $rootScope.$emit(eventType.NOTIFICATION, {
                  'type': 'POPMSG',
                  'title': '消息',
                  'message': '未添加候选项'
              });
              return;
            }
            //图表部分
            // $scope.type = 'PolarArea';
            $scope.labels_bar = [];
            $scope.color = ['#000000'];
            $scope.labels_pie = [];
            $scope.series_bar = [];
            $scope.series_pie = [];
            $scope.data_bar = [];
            $scope.data_pie = [];
            //柱状图配置options
            $scope.options_bar = {
              scaleOverlay: true
            };
            //拼图配置options
            $scope.option_pie = {
              animateRotate : true,
              animateScale : true,
            };
            $scope.colours = [
              /*{ // dark grey
                fillColor: 'rgba(176,224,230,0.7)',
                strokeColor: 'rgba(176,224,230,1)',
                pointColor: 'rgba(77,83,96,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(77,83,96,1)'
              }*/
              '#00FF7F',
              '#FFD700',
              '#FF7F50',
              '#OOFFOO', 
              '#00BFFF', 
              '#949FB1',
              '#FF6347'
            ];
            //候选项得票数组
            var vote_num_arr = [];
            //支持率数组
            var suppose_rate = [];
            //总的投票数
            var vote_num_sum = $scope.vote.vote_num;
            var candidates = $scope.vote.candidates;
            var len = candidates.length;
            for (var i=0;i<len;i++) {
              var temp = candidates[i];
              $scope.labels_bar.push(temp.title);
              $scope.labels_pie.push(temp.title);
              vote_num_arr.push(temp.vote_num);
              suppose_rate.push(Math.round(temp.vote_num*100/vote_num_sum));
            }
            $scope.data_bar.push(vote_num_arr);
            $scope.data_pie = suppose_rate;
            /*$scope.toggle = function () {
              $scope.type = $scope.type === 'PolarArea' ?
                'Pie' : 'PolarArea';
            };*/
          }
        });
      }
  });

  $scope.viewImage = function(image) {
      $modal.open({
        template: '<div><img style="width:100%" src=' + image + '></div>',
        size: "lg",
      });
  };
});