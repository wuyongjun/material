angular.module('iwx').directive('formInput', function($compile) {
  return {
    restrict: 'E',
    scope: {
      name: '=',
      title: '='
    },
    transclude: true,
    templateUrl: 'directive/form-input/form-input.html',
    link: function(scope, element, attrs) {}
  };
});