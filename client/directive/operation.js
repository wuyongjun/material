angular.module('iwx')
  .directive('mouse', function ($compile) {
    return {
      restrict: 'AE',
      scope: {
        role: '='
      },
      link: function(scope, element, attrs) {
        
        element
          .children('label')
          .hide();

        element
          .parent()
          .mouseenter(function () {
            if (scope.role === 'IWX_ADMIN' || scope.role === 'UN_ADMIN') {
              //隐藏创建时间
              element
                .children('font')
                .hide();
              //显示操作按钮
              element
                .children('label')
                .show();
            }
            
          })
          .mouseleave(function () {
            //隐藏操作按钮
            element
              .children('label')
              .hide();
            //显示创建时间
            element
              .children('font')
              .show();
          });
      }
    };
  });