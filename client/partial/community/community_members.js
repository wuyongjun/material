angular.module('iwx').controller('CommunityMembersCtrl', function ($scope, $http, $modal, $state, ngTableParams, $rootScope, eventType, $window, $stateParams) {
    $scope.currentPage = $stateParams.page;
    //部门id数组
    $scope.dep_id_array = [];
    //当前路径状态
    // var curr_state = $state.current.name;
    $scope.param = {};
    /*$scope.param.view = 'ALL';
    if (curr_state === 'community.approved') {
        $scope.param.view = "APPROVED";
    } else if (curr_state === 'community.pending') {
        $scope.param.view = "PENDING";
    }
    $scope.status = {
        'APPROVED': {
            'text': '已审核',
            'label': 'label label-success'
        },
        'PENDING': {
            'text': '待审核',
            'label': 'label label-warning'
        },
        'REJECTED': {
            'text': '已拒绝',
            'label': 'label label-danger'
        }
    };*/

    // Avoid lint complain
    var NgTableParams = ngTableParams;
    var users = null;
    $scope.tableParams = new NgTableParams({
        page: $scope.currentPage,
        // page: 1,
        count: 10,
    }, {
        counts: [],
        total: 0,
        getData: function ($defer, params) {
            /*if (users) {
                $defer.resolve(users.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }*/
            $scope.currentPage = params.page();
            //请求参数
            var request_param;
            if ($scope.dep_id_array.length !== 0) {
                var dep_id_str = '';
                for (var i=0;i<$scope.dep_id_array.length;i++) {
                    if (i !== $scope.dep_id_array.length - 1) {
                        dep_id_str += $scope.dep_id_array[i] + '-';
                    } else {
                        dep_id_str += $scope.dep_id_array[i] + '';
                    }
                    
                }
                console.log(dep_id_str);
                request_param = '?page=' + params.page() + '&per_page=' + params.count() + '&department_type=' + dep_id_str;
            } else {
                request_param = '?page=' + params.page() + '&per_page=' + params.count();
            }
            console.log(request_param);
            $http.get('/api/admin/community/members' + request_param)
                .success(function(data) {
                users = data.items;
                params.total(data.total);
                $defer.resolve(users);
            });
        }
    });
    
    /*$scope.$on('table_reload', function () {
        $scope.tableParams.reload();
    });*/
    //私信
    $scope.private_letter = function (user_id) {
        $modal.open({
            templateUrl: 'partial/community/community_letter.html',
            controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                $scope.ok = function () {
                    if (!$scope.content) { return; }
                    $http.post('/api/admin/messages/' + user_id, {
                        'content': $scope.content
                    }).success(function(data) {
                        $modalInstance.close('ok');
                        $rootScope.$emit(eventType.NOTIFICATION, {
                            'type': 'POPMSG',
                            'title': '消息',
                            'message': '已经成功发送私信。'
                        });
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }]
        });
    };
    //获取社团部门
    $scope.getCommDep = function () {
        $http.get('/api/admin/department')
            .success(function (data) {
                for (var i=0;i<data.length;i++) {
                    data[i].chosen = false;
                }
                $scope.departments = data;
                console.log($scope.departments);
            });
    };
    $scope.getCommDep();
    //选择部门条件
    $scope.chose_department = function (department) {
        if (department.chosen) {
            department.chosen = false;
            //将选中的部门从过滤条件中删除
            for (var i=0;i<$scope.dep_id_array.length;i++) {
                if ($scope.dep_id_array[i] === department.id){
                    $scope.dep_id_array.splice(i, 1);
                    break;
                }
            }
            console.log($scope.dep_id_array);
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        } else {
            department.chosen = true;
            //将选中的部门添加到过滤条件中
            $scope.dep_id_array.push(department.id);
            console.log($scope.dep_id_array);
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }
    };
});