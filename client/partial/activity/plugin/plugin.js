//添加插件controller
angular.module('iwx')
  .controller('PluginAdd', function ($scope, $rootScope, plugins_alivable, $modalInstance, activity, eventType, $state) {
    // console.log(activity);
    var plugins = activity.plugins;
    var len = plugins.length;
    $scope.plugins_alivable = plugins_alivable;
    //各个插件添加方法，例如抽奖
    $scope.addPlugin = function (plugin_id) {
    //当活动已有该插件时，提示不能添加
      for (var j=0;j<len;j++) {
        var temp = plugins[j];
        if (plugin_id === temp.id) {
          $rootScope.$emit(eventType.NOTIFICATION, {
            'type': 'POPMSG',
            'title': '消息',
            'message': '请先结束当前的' + temp.name + '功能，再进行添加！'
          });
          $modalInstance.close('ok');
          $state.go('activity_item.' + plugin_id + '_plugin');
          return;
        }
      }
      $modalInstance.close('ok');
      // console.log(plugin_id);
      $rootScope.$broadcast('addPlugin', plugin_id);
      //删除已添加的插件
      var len_plugin = $scope.plugins_alivable.length;
      for (var i=0;i<len_plugin;i++) {
        if ($scope.plugins_alivable[i].id === plugin_id && 
          $scope.plugins_alivable[i].id !== 'sign_in' && 
          $scope.plugins_alivable[i].id !== 'vote' && 
          $scope.plugins_alivable[i].id !== 'ticket' &&
          $scope.plugins_alivable[i].id !== 'questionnaire') {
            $scope.plugins_alivable.splice(i,1);
            return;
        }
      }		
    };
});