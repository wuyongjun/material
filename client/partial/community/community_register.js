angular.module('iwx').controller('CommunityRegisterCtrl', function ($scope, $http, $rootScope, $state, eventType) {
  //确认框信息
  $scope.confirm = {};
  $scope.confirm.title = "请确定您的操作";
  $scope.confirm.message = "MESSAGE";
  $scope.confirm.type = "";
  $scope.confirm.param = "";

  $scope.types = [{
    name: '问答题',
    id: 'TEXT'
  }, {
    name: '单选题',
    id: 'SINGLE_CHOICE'
  }, {
    name: '多选题',
    id: 'MULTI_CHOICE'
  }, {
    name: '图片上传',
    id: 'IMAGES'
  }];

  $scope.questions = [];
  //定义一个选择部门问题
  $scope.dep_question = {
    title: 'PLACEHOLDER',
    type: 'MULTI_CHOICE',
    question: '你想加入我们哪个部门？',
    options: []
  };
  
  $http.get('/api/admin/community/register/form').success(function (data) {
    if (data) {
      $scope.questions = data;
      console.log($scope.dep_question);
    } else {
      $http.get('/api/admin/department').success(function (data) {
        $scope.departments = data;
        for (var i=0;i<$scope.departments.length;i++) {
          $scope.dep_question.options.push($scope.departments[i].name);
        }
        $scope.questions.unshift($scope.dep_question);
      });
    }
  });

  $scope.addQuestion = function() {
    $scope.questions.push({
      title: 'PLACEHOLDER',
      type: 'TEXT',
      question: '',
      options: []
    });
  };
  //删除问题
  $scope.remove_question = function (index) {
    var question = index + 1;
    $scope.confirm.message = '确定要删除问题 ' + question + '？';
    $scope.confirm.type = 'remove_question';
    $scope.confirm.param = index;
    $('#confirmModal').modal();
    return;
  };
  /*$scope.removeQuestion = function(index) {
      $scope.questions.splice(index, 1);
  };*/
  $scope.addOption = function(index) {
    $scope.questions[index].options.push("");
  };

  $scope.removeOption = function(questionIndex, index) {
    $scope.questions[questionIndex].options.splice(index, 1);
  };
  //确认框
  $scope.confirmModal = function () {
    if ($scope.confirm.type === "remove_question") {
      $('#question'+($scope.confirm.param+1))
        .slideUp(1000, function () {
          $scope.questions.splice($scope.confirm.param, 1);
        });
      // $scope.questions.splice($scope.confirm.param, 1);
    }
  };
  //验证招新问题
  $scope.validate_question = function () {
    var questions_len = $scope.questions.length;
    var question, option;
    for (var i = 0; i < questions_len; i++) {
      question = $scope.questions[i];
      if (question.question === '') {
        $rootScope.$emit(eventType.NOTIFICATION, {
          'type': 'POPMSG',
          'title': '消息',
          'message': '请填写问题的内容。'
        });
        return false;
      } else {
        if (question.type === 'SINGLE_CHOICE' || question.type === 'MULTI_CHOICE') {
          if (question.options.length === 0) {
            $rootScope.$emit(eventType.NOTIFICATION, {
              'type': 'POPMSG',
              'title': '消息',
              'message': '请添加单选或多选问题的选项。'
            });
            return false;
          } else {
            for (var j = 0; j < question.options.length; j++) {
              option = question.options[j];
              if (option === '') {
                $rootScope.$emit(eventType.NOTIFICATION, {
                  'type': 'POPMSG',
                  'title': '消息',
                  'message': '请完整填写单选或多选问题的选项。'
                });
                return false;
              }
            }
          }
        }
      }
    }
    return true;
  };
  $scope.submit = function() {
    if (!$scope.validate_question()) {
      return;
    }
    console.log($scope.questions);
    $http.post('/api/admin/community/register/form', {
      register_form: angular.toJson($scope.questions)
    }).success(function() {
      $rootScope.$emit(eventType.NOTIFICATION, {
        'type': 'POPMSG',
        'title': '消息',
        'message': '保存成功'
      });
    });
  };

  $scope.create_activity = function() {
    $http.post('/api/admin/activities?register=1').success(function(id) {
      $state.go('activity_item', {
        'id': id,
        'currentPage': 1
      });
    });
  };

  $scope.$parent.$watch('community.enable_register', function(newVal, oldVal) {
    if (newVal !== undefined &&
      oldVal !== undefined &&
      newVal !== oldVal) {
      if (newVal) {
        $http.post('/api/admin/community/register').success(function() {
          $rootScope.$emit(eventType.NOTIFICATION, {
            /*'type': 'INFO',
            'message': '保存成功'*/
            'type': 'POPMSG',
            'title': '消息',
            'message': '保存成功'
          });
        });
      } else {
        $http.delete('/api/admin/community/register').success(function() {
          $rootScope.$emit(eventType.NOTIFICATION, {
            'type': 'POPMSG',
            'title': '消息',
            'message': '保存成功'
          });
        });
      }
    }
  });
});