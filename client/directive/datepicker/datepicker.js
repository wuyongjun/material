angular.module('iwx').directive('datePicker', function($filter) {
	return {
    restrict: 'E',
    scope: {
      date: '=',
      starttime: '=',
      endtime: '=',
      minviewmode: '=',
      format: '=',
      dateformat: '='
    },
    templateUrl: 'directive/datepicker/datepicker.html',
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
        viewMode: 'years',
        minViewMode: attr.minviewmode,
        format: attr.format
      });

      $(elem).on("dp.change",function (e) {
        elem.find('input').trigger('change');
        // elem.data("DateTimePicker").hide();
      });

      scope.$watch('date', function(newVal) {
        if (typeof(newVal) === "number") {
          scope._date = $filter('date')(scope.date, attr.dateformat);
        }
      });

      scope.$watch('_date', function(newVal) {
        if (newVal && window.escape(newVal).indexOf('%u')<0) {
          scope.date = newVal;
        } else {
          if ($(elem).data("DateTimePicker")) {
            scope.date = $(elem).data("DateTimePicker").date.format(attr.format);
          }
        }
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
