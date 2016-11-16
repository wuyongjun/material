angular.module('iwx').controller('ActivityCtrl', function ($scope, $http, $state, ngTableParams, $rootScope, eventType, $modal, $stateParams) {
    $rootScope.welcome_bg = false;
    $scope.confirm = {};
    $scope.confirm.title = "请确定您的操作";
    $scope.confirm.message = "MESSAGE";
    $scope.confirm.type = "";
    $scope.confirm.param = "";
    $scope.plugins_config = {
      announcement:{
        'id':'announcement',
        'name':'公告板',
        'icon_path':'/static/images/announcement_new.png',
        'note':'活动地点，时间，临时突发状况可以通过公告板第一时间推送给所有关注本活动的小伙伴们。'
      },
      timeline:{
        'id':'timeline',
        'name':'活动动态',
        'icon_path':'/static/images/timeline_new.png',
        'note':'通过图片和文字形式还原现场实时动态，每一条动态可通过大屏幕实时展示。'
      },
      ticket:{
        'id':'ticket',
        'name':'电子票',
        'icon_path':'/static/images/ticket_new.png',
        'note':'环保，时尚的电子票据，作为活动唯一的入场凭证，电子票面内可以自定义广告位（包含票面背景和赞助商logo），通过后台可以实时查看抢票人数，实际到场验票人数，客观反映现场的热烈程度，每一张电子票都有唯一的电子票编号，可被用于后续的其他环节继续使用。'
      },
      vote:{
        'id':'vote',
        'name':'投票',
        'icon_path':'/static/images/vote_new.png',
        'note':'支持自定义候选项，可以是候选人，也可以是候选题目，通过灵活设置投票规则，可以收集到较为精确的投票统计数据。'
      },
      sign_in:{
        'id':'sign_in',
        'name':'签到',
        'icon_path':'/static/images/sign_in_new.png',
        'note':'轻量化的入场凭证，可作为活动唯一的入场方式，童鞋们通过扫描入场处的二维码签到入场，每一张签到凭证都有唯一的签到号码，可被用于后续的其他环节继续使用。'
      },
      lottery:{
        'id':'lottery',
        'name':'抽奖',
        'icon_path':'/static/images/lottery_new.png',
        'note':'活跃现场利器，社团可根据自己的实际情况安排出对应的单项奖，配合大屏幕的使用可以让活动现场悬念感十足，加强社团与参会小伙伴们的互动。'
      },
      contests:{
        'id':'contests',
        'name':'打分',
        'icon_path':'/static/images/grade_new.png',
        'note':'打分'
      },
      questionnaire: {
        'id': 'questionnaire',
        'name': '问卷',
        'icon_path': '/static/images/questionnaire.png',
        'note': '便于收集意见，目前支持四种问题，单选、多选、简答以及上传图片，每一次问卷支持添加无限量的礼券，礼券可以从电子凭证管理中调取，回答完成后自动获得一种礼券的一张，先到先得！具体使用细节请参阅问卷概况中的问卷功能解释。'
      }
    };
    //消息提示
    if (!$rootScope.mes_note) {
        $rootScope.message();
    }
    $scope.currentPage = $stateParams.currentPage;
    // Avoid lint complain
    var NgTableParams = ngTableParams;
    var activities = null;
    $scope.tableParams = new NgTableParams({
        page: $scope.currentPage,
        // page: 1,
        count: 10,
    }, {
        counts: [],
        total: 0,
        getData: function($defer, params) {
            $scope.currentPage = params.page();
            //if (activities) {
            //    $defer.resolve(activities.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            //}
            //TODO(zhangchun): we don't have pagination for this API
            // console.log(params.count() + '---------' + params.page());
            $http.get('/api/admin/activities?page='+params.page() + '&per_page=' + params.count()/*, {
                'page': params.page()
            }*/).success(function(data) {
                var items = data.items;
                if (items) {
                    var len_items = items.length;
                    for (var i=0;i<len_items;i++) {
                        var temp_item_plugin = items[i].plugins;
                        var len_plugins = temp_item_plugin.length;
                        for (var j=0;j<len_plugins;j++) {
                            var temp_plugin = temp_item_plugin[j];
                            // console.log(temp_plugin);
                            temp_plugin['icon_path'] = $scope.plugins_config[temp_plugin.id].icon_path;
                        }
                    }
                }
                activities = items;
                params.total(data.total);
                /*activities = data;
                params.total(data.length);*/
                $defer.resolve(activities);
            });
        }
    });

    $scope.createActivity = function() {
        $state.go('activity_item', {
            'id': -1,
            'currentPage': $scope.currentPage
        });
    };

    $scope.confirmModal = function(){
        var url = '/api/admin/activities/' + $scope.confirm.param + '/' + $scope.confirm.type;
        if($scope.confirm.type === 'deleteActivity') {
            $http.delete('/api/admin/activities/' + $scope.confirm.param)
                .success(function() {
                    activities = null;
                    $scope.tableParams.reload();
                });
        } else if($scope.confirm.type === 'publish') {
            $http.post(url).success(function() {
                $scope.tableParams.reload();
                // $scope.sendMessage($scope.confirm.param);
            });
        } else if ($scope.confirm.type === 'unpublish') {
            $http.post(url).success(function() {
                $scope.tableParams.reload();
            });
        }
    };

    $scope.sendMessage = function (activity_id) {
        $modal.open({
            templateUrl: 'partial/activity/message_modal.html',
            controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                $scope.ok = function () {
                    if (!$scope.content) { return; }
                    $http.post('/api/admin/activities/' + activity_id + '/publish/message', {
                        'content': $scope.content
                    }).success(function () {
                        $modalInstance.close('ok');
                        $rootScope.$emit(eventType.NOTIFICATION, {
                            'type': 'POPMSG',
                            'title': '消息',
                            'message': '已经成功发送私信和短信。'
                        });
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }]
        });
    };

    $scope.deleteActivity = function(activityId) {
        $scope.confirm.message = "您确定要删除这个活动吗?";
        $scope.confirm.type = "deleteActivity";
        $scope.confirm.param = activityId;
        $("#confirmModal").modal();
        return;
    };

    $scope.togglePublish = function(activityId, value) {
        var action = value ? 'publish' : 'unpublish';
        var url = '/api/admin/activities/' + activityId + '/' + action;
        $http.post(url).success(function() {
            $scope.tableParams.reload();
        });
    };

    $scope.invTogglePublish = function(activityId, value) {
        var action = value ? 'unpublish' : 'publish';
        if(action === 'unpublish') {
            $scope.confirm.message = "您确定要取消发布这个活动吗?";
            $scope.confirm.type = "unpublish";
        } else {
            $scope.confirm.message = "您确定要发布这个活动吗?";
            $scope.confirm.type = "publish";
        }

        $scope.confirm.param = activityId;
        $("#confirmModal").modal();
        return;
    };

    $scope.setTop = function(activityId) {

    };
    var _to_top = function(activityId) {
        $http.post('/api/admin/activities/' + activityId + '/top')
            .success(function(data) {
                $rootScope.$emit(eventType.NOTIFICATION, {
                    'type': 'POPMSG',
                    'title': '消息',
                    'message': '置顶成功'
                });
                $scope.tableParams.reload();
            });
    };
    $scope.top = function(published, admin_top, activityId) {

        if (!published) {
            $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '消息',
                'message': '请先发布活动'
            });
            return;
        }
        if (admin_top) {
            $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '消息',
                'message': '该活动已被i微校管理员置顶'
            });
            return;
        }
        var modalInstance = $modal.open({
            templateUrl: 'partial/activity/item/top_modal.html',
            size: 'md',
            controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                $scope.ok = function () {
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }]
        });
        modalInstance.result.then(function (selectedItem) {
            _to_top(activityId);
        });
    };
    $scope.gotoPlugin = function(activityId, pluginId) {
        if (pluginId === "") {
            $state.go('activity_item', {
                'id': activityId,
                'currentPage': $scope.currentPage
            });
        } else {
            $state.go('activity_item.' + pluginId + '_plugin', {
                'id': activityId,
                'currentPage': $scope.currentPage
            });
        }
    };
    //跳转到被取消发布的通知页面
    $scope.goToUnpubLog = function (type, activity_id) {
        console.log(type+'------'+activity_id);
        $state.go('activity.unpublishLog', {
            'type': type,
            'id': activity_id
        });
    };
});