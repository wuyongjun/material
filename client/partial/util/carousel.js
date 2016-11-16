angular.module('iwx').controller('CarouselCtrl', function($scope, items) {
  $scope.interval = 5000;
  var slides = $scope.slides = [];
  $scope.addSlide = function(url) {
    slides.push({
      image: url
    });
  };
  angular.forEach(items, function(url) {
    $scope.addSlide(url);
  });
});