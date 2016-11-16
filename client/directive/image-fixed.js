angular.module('iwx').directive('imageFixed', function($timeout, $http) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var $el = $(element), $parent = $el.parent();
      $el.load(function () {
        $parent.addClass('image-fixed-warp');
        if ($el.width()/$parent.width() > $el.height()/$parent.height()) {
          $el.css({'height': '100%'});
        } else {
          $el.css({'width': '100%'});
        }
        $el.addClass('show');
      });
    }
  };
});

