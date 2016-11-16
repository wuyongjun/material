angular.module('iwx').directive('file', function() {
  return {
    restrict: 'A',
    scope: {
      file: '='
    },
    link: function(scope, element, attrs) {
      element.bind('change', function(event) {
        var files = event.target.files || event.dataTransfer.files;
        var file = files[0];
        scope.file = file;
        scope.$apply();
      });
    }
  };
});

angular.module('iwx').directive('files', function() {
  return {
    restrict: 'A',
    scope: {
      files: '='
    },
    link: function(scope, element, attrs) {
      element.bind('change', function(event) {
        var files = event.target.files || event.dataTransfer.files;
        scope.files = files;
        scope.$apply();
      });
    }
  };
});