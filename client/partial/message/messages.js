angular.module('iwx').controller('MessagesCtrl', function ($scope, $http, $state, $rootScope, eventType, userService) {
  $rootScope.welcome_bg = false;
  $rootScope.mes_note = false;
  $scope.messages = [];
  //非社团成员数组
  $scope.noncommMembers = [];
  $scope.message = {};
  //集市主题数组
  // $scope.topics = [];
  //tree option and data
  $scope.treeOptions = {
    nodeChildren: 'children',
    dirSelectable: true,
    injectClasses: {
        ul: 'a1',
        li: 'a2',
        liSelected: 'a7',
        iExpanded: 'a3',
        iCollapsed: 'a4',
        iLeaf: 'a5',
        label: 'a6',
        labelSelected: 'tree_selected'
    }
  };
  /*$scope.dataForTheTree =[{ 'nickname' : '对话列表', 'id' : 0, 'children' : [
    {'nickname' : 'i微校管理员', 'id' : 1, 'children': []},
    {'nickname' : '学校管理员', 'id' : 2, 'children': []},
    {'nickname' : '社团成员', 'id' : 3, 'children' : []}
  ]}];*/
  $scope.dataForTheTree =[
    {'nickname' : 'i微校管理员', 'id' : 1, 'parent_id' : 0, 'children': []},
    {'nickname' : '学校管理员', 'id' : 2, 'parent_id' : 0, 'children': []},
    {'nickname' : '本社成员', 'id' : 3, 'parent_id' : 0, count: 0, 'children' : []},
    {'nickname': '非本社成员', 'id': 4, 'parent_id' : 0, count: 0, 'children' : []},
    {'nickname': '集市消息', 'id': 5, 'parent_id' : 0, count: 0, 'children': []}
  ];
  $scope.expandedNodes = [];

  //向树形列表添加成员数据
  var addMembersToTree = function (members, nodeNumber) {
    var len = members.length;
    if (nodeNumber === 4) {
      $scope.dataForTheTree[nodeNumber].children = [];
      $scope.dataForTheTree[nodeNumber].count = 0;
    }
    var tree_children = $scope.dataForTheTree[nodeNumber].children;
    for (var i=0;i<len;i++) {
      tree_children.push(members[i]);
      tree_children[i]['parent_id'] = $scope.dataForTheTree[nodeNumber].id;
      // $scope.dataForTheTree[nodeNumber].count += tree_children[i].count;
      if (nodeNumber === 4) {
        $scope.dataForTheTree[nodeNumber].count += tree_children[i].count;
        var topic_len = members[i].topic.length;
        for (var j = 0;j < topic_len;j++) {
          var temp_topic = members[i].topic[j];
          temp_topic['user_id'] = members[i].id;
          // $scope.topics.push(temp_topic);
        }
        tree_children[i]['children'] = members[i].topic; 
      }
    }
    console.log($scope.dataForTheTree);
    $scope.expandedNodes.push($scope.dataForTheTree[nodeNumber]);
  };
  //获取社团成员
  var getCommMembers = function (commMember) {
    $scope.messages = commMember.member;
    addMembersToTree(commMember.member, 2);
  };
  //获取非本社成员但有过通信记录的手机用户
  var getNoncommMembers = function (nonCommMember) {
    $scope.noncommMembers = nonCommMember.non_member;
    addMembersToTree(nonCommMember.non_member, 3);
  };
  //获取有集市消息人员列表
  var getBazaarMembers = function () {
    $http.get('/api/admin/bazaar/message/users')
      .success(function (data) {
        $scope.bazaarMembers = data;
        console.log($scope.bazaarMembers);
        addMembersToTree($scope.bazaarMembers, 4);
      });
      /*$scope.bazaarMembers = [{count: 1, name: '星女神', id: 99, topic: [{id: 1, topic: '转让iphone 5s', count: 1}]},
        {count: 3, name: 'Idiot', id: 10, topic: [{id: 2, topic: '求购ipad mini', count: 1}]}];
      addMembersToTree($scope.bazaarMembers, 4);*/
  };
  getBazaarMembers();
  //集市事件
  $scope.$on('bazaarEvent', function () {
    getBazaarMembers();
  });
  //获取通信列表成员
  var getMessMembers = function () {
    $http
      .get('/api/admin/community/message/members')
      .success(function (data) {
        getCommMembers(data);
        getNoncommMembers(data);
      });
  };
  getMessMembers();
  //通信事件
  /*$scope.$on('messageEvent', function () {
    getMessMembers();
  });*/
  //获取学校管理员
  $scope.getUniManager = function () {
    userService
      .load()
      .then(function (data) {
        var uniManager = {};
        uniManager['nickname_full'] = data.university.name;
        // uniManager['parent_id'] = $scope.dataForTheTree[0].children[1].id;
        uniManager['parent_id'] = $scope.dataForTheTree[1].id;
        uniManager['university_id'] = data.university.id;
        if (uniManager.nickname_full.length > 7) {
          uniManager['nickname'] = uniManager.nickname_full.substring(0, 7) + '...';
        } else {
          uniManager['nickname'] = uniManager.nickname_full;
        }
        // $scope.dataForTheTree[0].children[1].children.push(uniManager);
        $scope.dataForTheTree[1].children.push(uniManager);
        $scope.expandedNodes.push($scope.dataForTheTree[1]);
      });
      
  };
  $scope.getUniManager();
  //获取iwx管理员
  $scope.getIwxManager = function () {
    $http
      .get('/api/admin/iwx/users')
      .success(function (data) {
        var len = data.length;
        // var tree_children = $scope.dataForTheTree[0].children[0].children;
        var tree_children = $scope.dataForTheTree[0].children;
        for (var i=0;i<len;i++) {
          tree_children.push(data[i]);
          tree_children[i]['nickname_full'] = data[i].nickname;
          // tree_children[i]['parent_id'] = $scope.dataForTheTree[0].children[0].id;
          tree_children[i]['parent_id'] = $scope.dataForTheTree[0].id;
          if (tree_children[i].nickname.length > 7) {
            tree_children[i].nickname = tree_children[i].nickname.substring(0, 7) + '...';
          }
        }
        $scope.expandedNodes.push($scope.dataForTheTree[0]);
      });
  };
  $scope.getIwxManager();

  $scope.clearId = function(id) {
    var users = $scope.messages.concat($scope.noncommMembers);
    angular.forEach(users, function(value) {
      if (value.user_id === parseInt(id)) {
        value.count = 0;
      }
    });
  };

  $scope.send = function() {
    // console.log($scope.message);
    $http.post('/api/admin/messages/members', $scope.message)
      .success(function(data) {
        $rootScope.$emit(eventType.NOTIFICATION, {
          // 'type': 'INFO',
          'type': 'POPMSG',
          'title': '消息',
          'message': '发送成功'
        });
      })
      .error(function(data){
        /*$rootScope.$emit(eventType.NOTIFICATION, {
          // 'type': 'INFO',
          'type': 'POPMSG',
          'title': '警告',
          'message': data.message
        });*/
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
          });
  };
  $scope.getCommDep();
});