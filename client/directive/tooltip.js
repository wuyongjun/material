angular.module('iwx').directive('toolTip', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.tooltip();
    }
  };
});