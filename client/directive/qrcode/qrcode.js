angular.module('iwx')
	.directive('signInQrcode', function ($timeout, $http, $rootScope, eventType) {
		return {
			restrict: 'AE',
			scope: {
				'data': '=',
				'user': '='
			},
			templateUrl: 'directive/qrcode/qrcode.html',
			link: function (scope, element, attrs) {
				scope.qrcode = null;
      
				var reset = function (data) {
					scope.qrcode = {
						v: parseInt(6 + 14*Math.random(), 10),
						data: data
					};

					$timeout(function () {
						var canvas = element.find('canvas')[0];
						element.find('.qrcode-import').attr({
								download: 'qrcode.png',
								title: '导出二维码',
								href: canvas.toDataURL('image/png')
							});
						}, 100);
				};

				scope.$watch('data.code', function () {
					if (scope.data.code) {
						reset(scope.data.code);
					}
				});

				scope.createQrcode = function () {
					
					if (scope.data.code) {
						reset(scope.data.code);
					} else {
					//添加判断
						if (!scope.data.id) {
							$rootScope.$emit(eventType.NOTIFICATION, {
								'type': 'POPMSG',
								'title': '警告',
								'message': '请先创建本次签到'
							});
							return;
						}
						$http.post('/api/political_sign/' + scope.data.id + '/qrcode').success(function(data) {
							reset(data.code);
						});
					}
				};

			}
		};
	});