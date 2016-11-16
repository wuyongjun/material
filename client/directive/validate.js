angular.module('iwx')
  .directive('blur', function ($compile) {
    return {
      restrict: 'AE',
      scope: {
        regexp: '='
      },
      link: function(scope, element, attrs) {
        element.on('blur', function () {
          var flag;
          if (scope.regexp) {
            flag = scope.regexp.test(element.val());
          }
          if (!flag) {
            element
              .css('border-color', 'red');

          } else {
            element
              .css('border-color', '');
          }
        });
      }
    };
  })
  .directive('ngBlur', function ($compile) {
    return {
      restrict: 'AE',
      scope: {
        regexp: '=',
        repassword: '='
      },
      link: function (scope, element, attrs) {
        /*scope.$watch('user.username+user.password+user.rePassword', function () {
          console.log('user.username+user.password+user.rePassword');
          if (scope.username === undefined && scope.password === undefined && scope.rePassword === undefined) {
            console.log('user.username+user.password+user.rePassword');
          }
        });*/
        element.on('blur', function () {
          var flag;
          if (scope.regexp) {
            flag = scope.regexp.test(element.val());
          }
          console.log(element.val() === "");
          if (element.val() === "") {
            return;
          }
          if (flag) {
            element
              .parent()
              .removeClass('has-error has-feedback')
              .addClass('has-success has-feedback')
              .children('span')
              .removeClass('glyphicon glyphicon-remove form-control-feedback')
              .addClass('glyphicon glyphicon-ok form-control-feedback');
          } else {
            element
              .parent()
              .removeClass('has-success has-feedback')
              .addClass('has-error has-feedback')
              .children('span')
              .removeClass('glyphicon glyphicon-ok form-control-feedback')
              .addClass('glyphicon glyphicon-remove form-control-feedback');
          }
        });
      }
    };
  })
  .directive('ngRepassword', function ($compile) {
    return {
      restrict: 'AE',
      // require: 'ngModel',
      scope: {
        'password': '='
      },
      link: function (scope, element, attrs) {
        element.on('blur', function () {
          if (!scope.password || element.val() !== scope.password) {
            element
              .parent()
              .removeClass('has-success has-feedback')
              .addClass('has-error has-feedback')
              .children('span')
              .removeClass('glyphicon glyphicon-ok form-control-feedback')
              .addClass('glyphicon glyphicon-remove form-control-feedback');
          } else {
            element
              .parent()
              .removeClass('has-error has-feedback')
              .addClass('has-success has-feedback')
              .children('span')
              .removeClass('glyphicon glyphicon-remove form-control-feedback')
              .addClass('glyphicon glyphicon-ok form-control-feedback');
          }
        });
        
      }
    };
  })
  .directive('ngReset', function ($compile) {
    return {
      restrict: 'AE',
      scope: {
        
      },
      link: function (scope, element, attrs) {
        element.on('click', function () {
          $('span')
            .removeClass('glyphicon glyphicon-remove form-control-feedback')
            .removeClass('glyphicon glyphicon-ok form-control-feedback');
          $('.form-group')
            .children('div')
            .removeClass('has-error has-feedback')
            .removeClass('has-success has-feedback');
        });
      }
    };
  });