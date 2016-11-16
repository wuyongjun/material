angular.module('iwx')
  .controller('StatCtrl', function ($scope, $http, $rootScope, eventType, $state, $modal) {
    var activityid = $scope.$parent.activity.id;
    $scope.plugin_exist = {
    	'announcement': true,
    	'timeline': true,
    	'ticket': true,
    	'vote': true,
    	'sign_in': true,
    	'lottery': true,
        'questionnaire': true
    };
    //获取该活动的插件
    $http.get('/api/admin/activities/' + activityid)
    	.success(function (data) {
    		var plugins = data.plugins;
    		var len = plugins.length;
    		for (var i=0;i<len;i++) {
    			$scope.plugin_exist[plugins[i].id] = false;
    		}
    	});
    $http.get('/api/activities/' + activityid + '/summary')
      .success(function (data) {
      	//{"comment_count":1,"fav_count":2,"ticket_claimed_count":3,"ticket_used_count":0}
        //http://localhost:9000/api/activities/123/summary
        $scope.summary = data;
        console.log($scope.summary);
      });
  });