angular.module('iwx')
	.filter('noval', function () {
		return function (text) {
			return text === 'undefined' ? '------' : text; 
		};
	})
	.filter('substring', function () {
		return function (input) {
			return input.length >= 14 ? input.substring(0, 12) + '...' : input;
		};
	})
	.filter('substr', function () {
		return function (input, param1, param2) {
			if (input) {
				return input.length >= param1 ? input.substring(0, param2) + '...' : input;
			} else {
				return input;
			}
		};
	})
	.filter('depcontent', function () {
		return function (input) {
			if (!input) {
				var str = '无部门';
				return str;
			} else {
				return input;
			}
		};
	})
	.filter('dutycontent', function () {
		return function (input) {
			if (!input) {
				var str = '正式社员';
				return str;
			} else {
				return input;
			}
		};
	})
	.filter('format', function () {
		return function (input) {
			if (input && typeof input === 'string') {
				return input.split('-')[0];
			}
		};
	})
	.filter('trusthtml', function ($sce) {
		return function (input) {
			return $sce.trustAsHtml(input);
		};
	});