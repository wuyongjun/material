angular.module('iwx').controller('ActivityItemCtrl', function ($scope, $http, $modal, $state, $stateParams, $rootScope, $filter, eventType, $window) {
    $scope.page = $stateParams.currentPage;
    /**
        修改内容：将info信息框修改为弹出modal信息框
    */
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
    //验证表达式  /^[a-zA-Z0-9_\u4e00-\u9fa5_\x21-\x7e]{0,15}$/   /^[a-zA-Z0-9_\u4e00-\u9fa5_\x21-\x7e]{0,20}$/
    $scope.content_regexp = /^[\u4e00-\u9fa5_\x21-\x7e_\u0b7-\uff1f_\s]{0,20}$|^[\w\s_\x21-\x7e]{0,40}$/;
    $scope.sub_regexp = /^[\u4e00-\u9fa5_\x21-\x7e_\u0b7-\uff1f_\s]{0,25}$|^[\w\s_\x21-\x7e]{0,50}$/;
    $scope.loc_regexp = /^[\u4e00-\u9fa5_\x21-\x7e_\u0b7-\uff1f_\s]{0,15}$|^[\w\s_\x21-\x7e]{0,30}$/;

    $scope.editingActivityId = parseInt($stateParams.id);
    $scope.voteid = -1;
    
    $scope.activity = {
        'id': $scope.editingActivityId
    };
    
    if ($scope.editingActivityId !== -1) {
        $http.get('/api/admin/activities/' + $scope.editingActivityId).success(function(data) {
            $scope.activity = data;
            $scope.act_plugin = [];
            // $scope.activity.plugins.push({'id': 'questionnaire', 'name': '问卷'});
            //find vote id
            if($scope.activity.plugins && $scope.activity.plugins.length > 0) {
                for(var i=0;i<$scope.activity.plugins.length;i++) {
                    var temp_plugin = $scope.activity.plugins[i];
                    temp_plugin['icon_path'] = $scope.plugins_config[temp_plugin.id].icon_path;
                    $scope.act_plugin.push(temp_plugin);
                    if($scope.activity.plugins[i].id === "vote" && $scope.activity.plugins[i].enabled === true && $scope.activity.plugins[i].preview && $scope.activity.plugins[i].preview.id) {
                        $scope.voteid = $scope.activity.plugins[i].preview.id;
                    }
                }
                console.log($scope.act_plugin);
            }
            // console.log($scope.activity);
        });
    }

    /*$scope.$watch('activity.published', function(newVal, oldVal) {
        console.log(newVal);
        console.log(oldVal);
        if (newVal !== undefined &&
            oldVal !== undefined &&
            newVal !== oldVal &&
            $scope.activity.id &&
            $scope.editingActivityId !== -1) {

            var goodToGo = ($scope.activity.subject &&
                    $scope.activity.location &&
                    $scope.activity.start_time &&
                    $scope.activity.end_time &&
                    $scope.activity.content &&
                    $scope.activity.cover &&
                    $scope.activity.poster);

            if (newVal) {
                if (!goodToGo) {
                    $rootScope.$emit(eventType.NOTIFICATION, {
                        'type': 'POPMSG',
                        'title': '消息',
                        'message': '别偷懒，填写完所有内容再发布'
                    });
                    $scope.activity.published = false;
                    return;
                }
            }

            var action = newVal ? 'publish' : 'unpublish';
            var url = '/api/admin/activities/' + $scope.editingActivityId + '/' + action;
            $http.post(url).success(function(){
                if(newVal) {
                   $rootScope.$emit(eventType.NOTIFICATION, {
                        'type': 'POPMSG',
                        'title': '消息',
                        'message': '发布成功'
                    });  
                } else if(goodToGo) {
                   $rootScope.$emit(eventType.NOTIFICATION, {
                        'type': 'POPMSG',
                        'title': '消息',
                        'message': '取消发布成功'
                    });                     
                }
            });
        }
    });*/
    //是否发布活动
    $scope.isPublishActivity = function (id, isPublish, page) {
        var url = '';
        if (isPublish) {
            url = '/api/admin/activities/' + id + '/unpublish';
        } else {
            url = '/api/admin/activities/' + id + '/publish';
        }
        $http.post(url).success(function (data) {
            if (isPublish) {
                $rootScope.$emit(eventType.NOTIFICATION, {
                    'type': 'POPMSG',
                    'title': '消息',
                    'message': '取消发布成功'
                });
            } else {
                $rootScope.$emit(eventType.NOTIFICATION, {
                    'type': 'POPMSG',
                    'title': '消息',
                    'message': '发布成功'
                });
            }
            $state.go('activity_item', {id: id, currentPage: page}, {reload: true}); 
        });
    };
    $scope.delete = function() {
        if ($scope.editingActivityId !== -1) {
            $http.delete('/api/admin/activities/' + $scope.editingActivityId)
                .success(function() {
                    $state.go('activity', {currentPage: 1});
                });
        } else {
            $state.go('activity', {currentPage: 1});
        }
    };

    if ($scope.editingActivityId !== -1) {
        $http.get('/api/plugins_normal').success(function(data) {
            var tempArr = [];
            for (var i=0;i<data.length;i++) {
                var temp = $scope.plugins_config[data[i].id];
                tempArr.push(temp);
            }
            $scope.plugins = tempArr;
            // console.log($scope.plugins);
        });
    }
    //去除活动内容中的html tag
    $scope.removeHtmlTag = function (str) {
        str = str.replace(/<\/?[^>]*>/g,''); //去除HTML tag
        str = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
        //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
        str=str.replace(/&nbsp;/ig,'');//去掉&nbsp;
        return str;
    };
    //提交活动信息，信息提示修改为弹出modal框的形式
    $scope.saveActivity = function() {
        //捕获异常  $scope.activity.start_time.replace(/-/g,"/")
        try {
            if (typeof($scope.activity.start_time) === 'number') {
                $scope.activity.start_time = $filter('date')($scope.activity.start_time, 'yyyy-MM-dd HH:mm');
            }
            if (typeof($scope.activity.end_time) === 'number') {
                $scope.activity.end_time = $filter('date')($scope.activity.end_time, 'yyyy-MM-dd HH:mm');
            }
            var stTime = new Date($scope.activity.start_time.replace(/-/g,"/"));
            var endTime = new Date($scope.activity.end_time.replace(/-/g,"/"));
            if(Date.parse(stTime) > Date.parse(endTime)) {
                $rootScope.$emit(eventType.NOTIFICATION, {
                    'type': 'POPMSG',
                    'title': '警告',
                    'message': '结束时间必须在开始时间之后'
                });
                return;
            }
        } catch (e) {
            $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '警告',
                'message': '请正确选择活动时间'
            });
            return;
        }
        if (!$scope.activity.location || !$scope.activity.content || !$scope.activity.subject) {
            $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '警告',
                'message': '请填写完整，其中活动主题、活动地点和活动内容为必填项！'
            });
            return;
        }
        //限制字数提示
        if (!$scope.sub_regexp.test($scope.activity.subject)) {
            $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '警告',
                'message': '活动主题请限制在25个汉字以内！'
            });
            return;
        }
        if (!$scope.loc_regexp.test($scope.activity.location)) {
            $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '警告',
                'message': '活动地点请限制在15个汉字以内！'
            });
            return;
        }
        if ($scope.activity.members && !$scope.content_regexp.test($scope.activity.content)) {
            $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '警告',
                'message': '活动口号请限制在20个汉字以内！'
            });
            return;
        }
        //活动内容
        var contentText = $scope.removeHtmlTag($scope.activity.content);
        if (contentText.length > 2000) {
            $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '警告',
                'message': '“' + contentText.substring(1990, 2000) + '...”之后的内容超过了2000字数限制！'
            });
            return;
        }
        //设置图片宽高
        $scope.activity.content = $scope.activity.content.replaceAll('<img', '<img width="480px" height="320px"');
        if ($scope.editingActivityId === -1) {
            $http.post('/api/admin/activities').success(function(id) {
                // console.log(id);
                $scope.editingActivityId = id;

                var fd = new FormData();
                angular.forEach($scope.activity, function(value, key) {
                    fd.append(key, value);
                });
                $http.post('/api/admin/activities/' + $scope.editingActivityId, fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }).success(function(data) {
                    $scope.activity = data;
                    $rootScope.$emit(eventType.NOTIFICATION, {
                        'type': 'POPMSG',
                        'title': '消息',
                        'message': '保存成功'
                    });
                    $state.go('activity', {
                        'currentPage': 1
                    });
                    /*$state.go('activity_item', {
                        'id': $scope.editingActivityId,
                        'currentPage': page
                    });*/
                });
            });
        } else {
            // console.log($scope.removeHtmlTag($scope.activity.content));
            var fd = new FormData();
            angular.forEach($scope.activity, function(value, key) {
                fd.append(key, value);
            });
            // console.log($scope.activity.content);
            $http.post('/api/admin/activities/' + $scope.editingActivityId, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).success(function(data) {
                $scope.activity = data;
                $rootScope.$emit(eventType.NOTIFICATION, {
                    'type': 'POPMSG',
                    'title': '消息',
                    'message': '保存成功'
                });
            });
        }
    };
    //添加插件
    $scope.addPlugin = function(plugin_id) {
        if ($scope.activity && $scope.activity.id && $scope.activity.id !== -1) {
            var url = '/api/admin/activities/' + $scope.activity.id + '/plugins';
            $http.post(url, {
                'plugin_id': plugin_id
            }).success(function(data) {
                $scope.activity = data;
                $scope.act_plugin = [];
                angular.forEach(data.plugins, function (value) {
                    value['icon_path'] = $scope.plugins_config[value.id].icon_path;
                    $scope.act_plugin.push(value);
                });
                //添加插件完成后直接打开新添加的插件页面
                $state.go('activity_item.' + plugin_id + '_plugin');
            });
        }
    };
    //添加“更多功能”，打开modal窗体，显示要添加的插件
    $scope._addPlugin = function (plugin_id) {
        // console.log($scope.plugins);
        // console.log($scope.activity.plugins);
        var arr_temp_plugins = $scope.removeExistPlugin($scope.plugins, $scope.activity.plugins);
        if (arr_temp_plugins.length === 0) {
            $rootScope.$emit(eventType.NOTIFICATION, {
                'type': 'POPMSG',
                'title': '消息',
                'message': '提供的所有功能都已添加'                    
            });
        } else {
            var plugins_alivable = arr_temp_plugins;
            // console.log(plugins_alivable);
            $modal.open({
                templateUrl: 'partial/activity/plugin/plugin.html',
                controller: 'PluginAdd',
                resolve: {
                    activity: function () {
                      return $scope.activity;
                    },
                    plugins_alivable: function () {
                      return plugins_alivable;
                    }
                }
            });
        }
    };
    $scope.$on('addPlugin', function (event, data) {
        // console.log(data);
        var plugin_id = data;
        $scope.addPlugin(plugin_id);
    });
    //去掉已添加的插件
    $scope.removeExistPlugin = function (arr1, arr2) {
        var arr3 = [];
        var len_arr1 = arr1.length;
        var len_arr2 = arr2.length;
        for (var i=0;i<len_arr1;i++) {
            var flag = true;
            for (var j=0;j<len_arr2;j++) {
                if (arr1[i].id === arr2[j].id && arr1[i].id !== 'sign_in' && arr1[i].id !== 'vote' && arr1[i].id !== 'ticket' && arr1[i].id !== 'questionnaire') {
                        flag = false;
                }
            }
            if (flag) {
                arr3.push(arr1[i]);
            }
        }
        return arr3;
    };
    //replace all string
    String.prototype.replaceAll = function (targetText, replaceText) {
        return this.replace(new RegExp(targetText, 'gm'), replaceText);
    };
});