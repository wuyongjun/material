angular.module('iwx')
	.directive('chosen', function ($compile, $state) {
		return {
			restrict: 'AE',
			scope: {
				chosenStatus: '='
			},
			link: function (scope, element, attribute) {
				scope.$watch(scope.chosenStatus, function () {
					if (scope.chosenStatus) {
						element
							.css('borderColor', 'green')
							.children('span')
							.css('color', 'green')
							.append('<i class="fa fa-check"></i>');
					}
				});
				element
					.click(function () {
						if (!scope.chosenStatus) {
							element
								.css('borderColor', '#3CBBDC')
								.children('span')
								.css('color', '#3CBBDC')
								.children('i')
								.remove();
						} else {
							element
								.css('borderColor', 'green')
								.children('span')
								.css('color', 'green')
								.append('<i class="fa fa-check"></i>');
						}
					});

			}
		};
	});