angular.module('iwx')
	.directive('myCollapse', function ($compile) {
		return {
			restrict: 'AE',
			link: function (scope, element, attribute) {
				element.children('span:first')
					.click(function () {
						var $panelBody = element.children('.panel-body');
						var $collapseBtn = element.children('span:first');
						var ishide = $panelBody.is(':hidden');
						if (ishide) {
							$panelBody.slideDown(500, function () {
								$panelBody.css('display', 'hide');
							});
							$collapseBtn.html('')
								.html('<i class="fa fa-chevron-up"></i>&nbsp;收起');
						} else {
							$panelBody.slideUp(500, function () {
								$panelBody.css('display', 'show');
							});
							$collapseBtn.html('')
								.html('<i class="fa fa-chevron-down"></i>&nbsp;展开');
						}

					});
			}
		};
	})
  .directive('menuCollapse', function ($compile, $window) {
    return {
      restrict: 'AE',
      link: function (scope, element, attributes) {
        console.log($window.screen);
        if ($window.screen.width < 768 && $window.screen.height < 1024) {
          element.attr('data-toggle', 'collapse');
          element.attr('data-target', '#navbar-item');
        }
      }
    };
  })
	.directive('mySelect2', function ($compile, $filter, $http) {
		return {
			// require: 'ngModel',
			restrict: 'AE',
			scope: {
				activityId: '=activityId'
			},
			link: function (scope, element, attribute) {
				$http.get('/api/auth/refreshtoken').success(function (response) {
					loadSelect(response.auth_token);
				});
				var loadSelect = function (auth_token) {
					var $select = element.select2({
						placeholder: {
							id: '-1',
							text: '请选择问卷'
						},
						minimumResultsForSearch: Infinity,
						// data: scope.data
						selectOnClose: true,
						tags: true,
						ajax: {
							url: '/api/questionnaires/' + scope.activityId + '/q/list', //remote data api
							delay: 1000,
							dataType: 'json',
							headers: {
								'Authentication-Token': auth_token
							},
							data: function (params) {
								var query = {
									page: params.page || 1,
									per_page: params.per_page || 10
								};
								return query; //request params ?page = [page] & per_page = [per_page]
							},
							processResults: function (data, params) {
								//deal with params
								params.page = params.page || 1;
								params.per_page = params.per_page || 10;
								var select2_data = [];
								angular.forEach(data.data, function (value) {
									var obj = {id: '', text: ''};
									obj.id = value.id;
									obj.text = value.title + ' ' + $filter('date')(new Date(value.start_time), 'yyyy-MM-dd HH:mm');
									select2_data.push(obj);
								});
								return {
									results: select2_data,
									pagination: {
										more: (params.page * params.per_page) < data.data.total
									}
								};
							},
							cache: true
						}
					});
					$select.on('change', function (event) {
						scope.questionnaire_id = $select.val();
						scope.$emit('select:change', scope.questionnaire_id);
					});
				};
			}
		};
	})
	.directive('mulSelect', function ($compile, origin, $http) {
		return {
			restrict: 'AE',
			link: function (scope, element, attribute) {
				$http.get('/api/auth/refreshtoken').success(function (response) {
					var mulSelect = element.select2({
						placeholder: {
							id: '-1',
							text: '请选择添加的开关机计划'
						},
						selectOnClose: false,
						ajax: {
							url: origin.DESTINATION.name + '/v1/customer/plans',
							delay: 1000,
							dataType: 'json',
							Origin: origin.ORIGIN,
							headers: {
								'Authentication-Token': response.auth_token,
							},
							data: function (params) {
								var query = {
									page: 1,
									per_page: 100
								};
								return query; //request params ?page = [page] & per_page = [per_page]
							},
							processResults: function (data, params) {
								params.page = 1;
								params.per_page = 100;
								var select2_data = [];
								angular.forEach(data.data.items, function (value) {
									var obj = {id: '', text: ''};
									obj.id = value.id;
									obj.text = value.name;
									select2_data.push(obj);
								});
								return {
									results: select2_data
								};
							}
						}
					});
					mulSelect.on('change', function (event) {
						console.log(mulSelect.val());
						scope.$emit('mulSelect:change', mulSelect.val());
					});
				});

			}
		};
	})
	.directive('bootstrapswitch', function ($compile) {
		return {
			restrict: 'AE',
			require: '?ngModel',
			scope: {
				ngModel: '='
			},
			link: function (scope, element, attribute, ngModel) {
				if (!ngModel) {
					return;
				}
				var $bootstrapToggle = element.bootstrapToggle();
				/*scope.$watch('rubric.answer_type', function (newValue) {
					if (ngModel.$modelValue === 'OTHER') {
						$bootstrapToggle.bootstrapToggle('on');
					} else {
						$bootstrapToggle.bootstrapToggle('off');
					}
				});*/
				$bootstrapToggle.change(function (data) {
					var value = {};
					if ($(this).prop('checked')) {
						value = 'OTHER';
						// scope.ngModel = 'NORMAL';
					} else {
						value = 'NORMAL';
						// scope.ngModel = 'OTHER';
					}
					//propagate change check event
					scope.$emit('toggle:change', value);
				});
			}
		};
	})
	/*.directive('simditor', ['$timeout', function ($timeout) {
		//runs during compile
		return {
			restrict: 'AE',
			replace: true,
			template: '<textarea data-autosave="editor-content" disabled="disabled" autofocus></textarea>',
			scope: {
				content: '='
			},
			link: function ($scope, iElement, iAttr, controller) {
				var config = {
		        	placeholder: '这里输入文字...',
		        	toolbar: [],
		        	pasteImage: true,
		        	defaultImage: '',
		            allowedTags: ['br', 'a', 'img', 'b', 'strong', 'i', 'u', 'font', 'p', 'ul', 'ol', 'li', 'blockquote',
		            	'pre', 'h1', 'h2', 'h3', 'h4', 'hr', 'div', 'script', 'style']
				};
				var editor = new Simditor(angular.extend({textarea: iElement}, config));

				var nowContent = '';
				console.log($scope);
				$scope.$watch('content', function (value, old) {
					if (typeof value !== 'undefined' && value !== nowContent) {
						editor.setValue(value);
					}
				});

				editor.on('valuechanged', function (event) {
					if ($scope.content !== editor.getValue()) {
						$timeout(function () {
							$scope.content = nowContent = editor.getValue();
						});
					}
				});
			}
		};
	}])*/;
