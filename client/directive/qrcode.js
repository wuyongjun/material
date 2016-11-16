angular.module('iwx').directive('iQrcode', function ($timeout, $http, $rootScope, eventType) {
  return {
    restrict: 'E',
    scope: {
      'data': '=',
      'user': '='
    },
    templateUrl: 'directive/qrcode.html',
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

      scope.$watch('data.qr_code', function () {
        if (scope.data.qr_code) {
          reset(window.location.origin + '/k/' + scope.data.qr_code);
        }
      });

      scope.createQrcode = function () {
        if (scope.data.qr_code) {
          reset(window.location.origin + '/k/' + scope.data.qr_code);
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
          $http.post('/api/signs/' + scope.data.id + '/qrcode').success(function(data) {
            reset(window.location.origin + '/k/' + data.qr_code);
          });
        }
      };
    }
  };
});

