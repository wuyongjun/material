angular.module('iwx')
	.controller('shareQrcodeCtrl', function ($scope, shareUrl) {
		console.log(shareUrl);
		var data = shareUrl;
		var set_qrcode = function (data) {
			$scope.qrcode = {
				v: parseInt(6 + 14*Math.random(), 10),
				data: data
			};
		};
		set_qrcode(data);
	});