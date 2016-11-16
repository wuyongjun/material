angular.module('iwx').directive('datetimepicker', function($filter) {
	return {
    restrict: 'E',
    scope: {
      datetime: '=',
      starttime: '=',
      endtime: '='
    },
    templateUrl: 'directive/datetimepicker/datetimepicker.html',
    replace: true,
    link: function(scope, elem, attr, ctrl) {
      $(elem).datetimepicker({
        icons: {
          time: "fa fa-clock-o",
          date: "fa fa-calendar",
          up: "fa fa-arrow-up",
          down: "fa fa-arrow-down"
        },
        language: 'zh-CN',
        sideBySide: false,
        useCurrent: false,
        format: 'YYYY-MM-DD HH:mm'
      });

      $(elem).on("dp.change",function (e) {
        elem.find('input').trigger('change');
        // elem.data("DateTimePicker").hide();
      });

      scope.$watch('datetime', function(newVal) {
        if (typeof(newVal) === "number") {
          scope._datetime = $filter('date')(scope.datetime, 'yyyy-MM-dd HH:mm');
        }
      });

      scope.$watch('_datetime', function(newVal) {
        if (newVal && window.escape(newVal).indexOf('%u')<0) {
          scope.datetime = newVal;
        } else {
          if ($(elem).data("DateTimePicker")) {
            scope.datetime = $(elem).data("DateTimePicker").date.format("YYYY-MM-DD HH:mm");
          }
        }
       /* if ($(elem).data("DateTimePicker")) {
          console.log($(elem).data('DateTimePicker').date.format("YYYY-MM-DD HH:mm"));
          scope.datetime = $(elem).data("DateTimePicker").date.format("YYYY-MM-DD HH:mm");
        }*/
      });

      scope.$watch('starttime', function(newVal) {
        if (newVal) {
          $(elem).data("DateTimePicker").setMinDate(moment(newVal));
        }
      });

      scope.$watch('endtime', function(newVal) {
        if (newVal) {
          $(elem).data("DateTimePicker").setMaxDate(moment(newVal));
        }
      });
    }
  };
});
