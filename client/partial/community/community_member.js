angular.module('iwx').controller('CommunityMemberCtrl', function ($scope, $http, $stateParams, $rootScope, eventType, $modal) {
    // console.log($stateParams.id);
    $scope.returnPage = $stateParams.page;
    $scope.unique = function (arr) {
        var hash = {}, result_arr = [], elem;
        for (var i = 0; (elem = arr[i]) != null; i++) {
            if (!hash[elem]) {
                result_arr.push(elem);
                hash[elem] = true;
            }
        }
        return result_arr;
    };
    //获取社员信息
    var getUser = function () {
        $http.get('/api/admin/community/register/users/' + $stateParams.id)
            .success(function (data) {
                angular.forEach(data.answers, function (value) {
                    value.question.options = $scope.unique(value.question.options);
                });
                $scope.user = data;
            });
    };
    getUser();
    //批准入社
    $scope.approve = function () {
        $modal.open({
            templateUrl: 'partial/community/community_member_department.html',
            controller: 'CommMemberDepCtrl',
            resolve: {
                userId: function () {
                    return $stateParams.id;
                }
            }
        });
    };
    $scope.print = function() {
        window.print();
    };

    //拒绝入社
    $scope.refuse = function (reason) {
        $modal.open({
            templateUrl: 'partial/community/community_reject_reason.html',
            controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                $scope.ok = function () {
                    if (!$scope.content) { return; }
                    $http.post('/api/admin/messages/' + $stateParams.id, {
                        'content': $scope.content
                    }).success(function (data) {
                        $modalInstance.close('ok');
                        $http.post('/api/admin/community/register/users/' + $stateParams.id + '/decision', {
                            'status': 'REJECTED',
                            'reason': reason
                        }).success(function (data) {
                            getUser();
                        });
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }]
        });
    };
    //进行成员部门设置
    $scope.depSetting = function () {
        $modal.open({
            templateUrl: 'partial/community/community_mem_dep_setting.html',
            controller: 'CommMemDepSetCtrl',
            resolve: {
                user: function () {
                    return $scope.user;
                }
            }
        });
    };
    //进行成员职位设置
    $scope.dutySetting = function () {
        $modal.open({
            templateUrl: 'partial/community/community_mem_duty_setting.html',
            controller: 'CommMemDutySetCtrl',
            resolve: {
                user: function () {
                    return $scope.user;
                }
            }
        });
    };
    //注册获取社员信息事件
    $scope.$on('getUserEvent', function () {
        getUser();
    });
});