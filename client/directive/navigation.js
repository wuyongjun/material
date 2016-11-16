angular.module('iwx')
	.directive('opacity', function ($compile) {
		return {
			restrict: 'AE',
			link: function (scope, element, attrs) {
				$(window)
					.scroll(function () {
						element.css('opacity', '0.5');
					});
				element
					.css('opacity', '1.0')
					.mouseover(function () {
						element.css('opacity', '1.0');
					});
			}
		};
	})
	.directive('scroll', function ($compile) {
		return {
			restrict: 'AE',
			link: function ($scope, element, attrs) {
				element
					.css('opacity', '0.5');
				$(window)
					.scroll(function () {
						element.css('opacity', '1.0');
					});
			}
		};
	})
	.directive('display', function ($compile) {
		return {
			restrict: 'AE',
			link: function ($scope, element, attrs) {
				element
					.children('nav')
					.hide();
				element
					.mouseover(function () {
						console.log('mouse is coming!');
						element
							.children('nav')
							.slideDown(1000);
					})
					.mouseout(function () {
						console.log('mouse is leaving!');
						element
							.children('nav')
							.slideUp(1000);
					});
			}
		};
	});