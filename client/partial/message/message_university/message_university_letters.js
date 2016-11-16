angular.module('iwx')
    .controller('CreateLetterUniversityCtrl', function ($scope, $rootScope, $http, eventType) {
        //查询到的社团
        $scope.communitys = [];
        $scope.community_set = {};
        //当前页码
        $scope.current_page = 1;
        //选中的社团id数组
        $scope.community_id_chosen = [];
        //要发送的私信内容
        $scope.message = {};
        
        //选择要新建私信的社团
        $scope.choose_community = function (community_id, choose_item) {
            console.log(community_id);
            if (choose_item) {
                $scope.community_id_chosen.push(community_id);
                console.log($scope.community_id_chosen);
            } else {
                for (var i = 0;i < $scope.community_id_chosen.length;i++) {
                    var temp = $scope.community_id_chosen[i];
                    if (temp === community_id) {
                        $scope.community_id_chosen.splice($scope.community_id_chosen.indexOf(temp), 1);
                    }
                }
                console.log($scope.community_id_chosen);
            }
        };
        //选择查询到的所有社团进行发送私信操作
        $scope.choose_communitys = function (choose_all) {
            if (choose_all) {
                console.log($scope.communitys.length);
                if ($scope.community_id_chosen.length !== 0) {
                    $scope.community_id_chosen.splice(0, $scope.community_id_chosen.length);
                }
                for (var i = 0;i < $scope.communitys.length; i++) {
                    var temp = $scope.communitys[i];
                    $scope.community_id_chosen.push(temp.id);
                }
                console.log($scope.community_id_chosen);
            } else {
                $scope.community_id_chosen.splice(0, $scope.community_id_chosen.length);
                console.log($scope.community_id_chosen);
            }
        };
        //加载查询到的社团
        var load_community = function (page) {
            $http
                .get('/api/un/community?page=' + page + '&per_page=12')
                .success(function (data) {
                    if (data.items.length === 0) {
                        if (page !== 1) {
                            $rootScope.$emit(eventType.NOTIFICATION, {
                                'type': 'POPMSG',
                                'title': '消息',
                                'message': '已加载全部符合条件的社团'
                            });
                        }
                        return;
                    }
                    $scope.show_community = true;
                    var add = 0;
                    angular.forEach(data.items, function (value) {
                        console.log(value);
                        if (!(value.id in $scope.community_set)) {
                            $scope.community_set[value.community.id] = true;
                            $scope.communitys.push(value.community);
                            add++;
                        }
                    });
                    //当全选复选框为选中状态时，添加选中的社团
                    if ($scope.choose_all) {
                        $scope.choose_communitys($scope.choose_all);
                        console.log($scope.communitys.length + '----115');
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
        //验证方法
        $scope.validate_letter = function () {
            if ($scope.message.content === '' || $scope.message.content === undefined) {
                $rootScope.$emit(eventType.NOTIFICATION, {
                    'type': 'POPMSG',
                    'title': '消息',
                    'message': '请填写要发送的私信内容。'
                });
                return false;
            }
            if ($scope.community_id_chosen.length === 0) {
                $rootScope.$emit(eventType.NOTIFICATION, {
                    'type': 'POPMSG',
                    'title': '消息',
                    'message': '请选择要发送私信的社团。'
                });
                return false;
            }
            return true;
        };
        //向选中的社团发送私信
        $scope.send_letter = function () {
            if (!$scope.validate_letter()) {
                return;
            }
            //群发私信接口
            $scope.message['communities'] = $scope.community_id_chosen;
            console.log($scope.message);
            $http
                .post('/api/un/multi/message/create', $scope.message)
                .success(function (data) {
                    $rootScope.$emit(eventType.NOTIFICATION, {
                        'type': 'POPMSG',
                        'title': '消息',
                        'message': '已经成功给选中的社团发送私信。'
                    });
                    $scope.message.content = '';
                });
        };
    });