angular.module('iwx')
	.directive('owlcarousel', function ($compile, $state) {
		return {
			restrict: 'AE',
			scope: {
				/*chosenStatus: '='*/
			},
			link: function (scope, element, attribute) {
				element.owlCarousel();
			}
		};
	})
	.directive('repeatFinish',function(){
	    return {
	        link: function(scope,element,attr){
	            console.log(scope.$index);
	            if(scope.$last === true){
	                element.parent().owlCarousel({
	                	items: 3,
	                	lazyLoad: false,
	                	dots: true,
	                	nav: false,
	                	navText: ['向 左', '向 右'],
	                	margin: 10,
	                	autoplay: false,
	                	autoplayTimeout: 5000,
	                	autoplayHoverPause: true,
	                	autoWidth: false,
	                	loop: false
	                }).on('mousewheel', '.owl-stage', function (e) {
					    if (e.originalEvent.deltaY>0) {
					        element.parent().trigger('next.owl');
					    } else {
					        element.parent().trigger('prev.owl');
					    }
					    e.preventDefault();
					});
	            }
	        }
	    };
	});