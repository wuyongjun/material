angular.module('iwx').controller(
    'RegisterCtrl', function ($scope, $http, $rootScope, $state, eventType) {
  $rootScope.welcome_bg = false;
  $scope.user = {
  };
  $scope.community = {
  };
  $scope.community_scope = {
  };
  $scope.universities = [];
  //定义类型map
  /*
    "organization": "ORG",   组织 ---校级学生组织
    "tissue": "TISSUE",    --- 院系学生会
    "union": "ST_UNION",  社联的公会 （就是普通社团）
    "committee": "COMMITTEE"} 委员会 --院系团委
  */
  var type_name_hash = {
    'union': '学生社团',
    'organization': '校级学生组织',
    'tissue': '院系学生会',
    'committee': '院系团委',
    'political': '党支部'
  };
  $scope.manager_type = [];
  //加载社团管理员类型信息
  $scope.load_type = function () {
    $http
      .get('/api/auth/admin/type')
      .success(function (data) {
        angular.forEach(data, function (value, key) {
          var obj = {id: '', name: ''};
          obj.id = value;
          obj.name = type_name_hash[value];
          $scope.manager_type.push(obj);
        });
      });
  };
  $scope.load_type();
  $scope.type = function () {
    $scope.prefix_name = type_name_hash[$scope.community.admin_type];
  };
  //加载省份信息
  $scope.load_province = function () {
    $http
      .get('/api/su/geography/0')
      .success(function (data) {
        $scope.provinceArray = data;
      });
  };
  $scope.load_province();
  //加载市信息
  $scope.load_city = function () {
    $http
      .get('/api/su/geography/' + $scope.community_scope.province_scope_id)
      .success(function (data) {
        $scope.cityArray = data;
      });
  };
  //加载学校信息
  $scope.load_university = function () {
    $http
      .get('/api/university/' + $scope.community_scope.city_scope_id + '/universities')
      .success(function (data) {
        $scope.universities = data;
      });
  };
  //监听省级管理范围
  $scope.change_province = function () {
    if ($scope.community_scope.province_scope_id) {
      $scope.load_city();
    }
  };
  //监听市级管理范围
  $scope.change_city = function () {
    if ($scope.community_scope.city_scope_id) {
      $scope.load_university();
    }
  };
  //监控社团描述
  $scope.$watch('community.description', function (str) {
    if (str) {
      var arr = [];
      for (var i = 0;i < str.length;i++) {
        if (str.charAt(i) !== ' ') {
          console.log('-----'+str.charAt(i));
          arr.push(str.charAt(i));
        }
      }
      console.log(arr.length);
      if (arr.length > 200) {
        $scope.show_description = true;
      } else {
        $scope.show_description = false;
      }
    }
    
  });
  //test
  $scope.select_un = function (value) {
    console.log(value);
  };
  console.log($scope.community_name);
  $scope.submit = function() {
    var fd = new FormData();
    angular.forEach($scope.user, function(value, key) {
      fd.append(key, value);
    });
    console.log($scope.community);
    angular.forEach($scope.community, function(value, key) {
      console.log('key:'+key+'-----value:'+value);
      fd.append(key, value);
    });
    $http.post('/api/auth/admin/register', fd, {
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).success(function(data) {
      $rootScope.$emit(eventType.NOTIFICATION, {
        'type': 'LONG_INFO',
        'message': "注册成功，等待人工核对信息. 我们将会以邮件方式通知您核对的结果, 请耐心等候..."
      });
      $state.go('welcome');
    });
  };
  /*$http.get('/api/universities').success(function(universities) {
    $scope.universities = universities;
  });*/
});