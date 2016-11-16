$(function() {
  
  $('.banner').unslider({
    dots: true,
    autoplay: false
  });
  
  $('.banner li img').each(function(i, element) {
    var $el = $(element), $parent = $el.parent();
    if ($el.width()/$parent.width() > $el.height()/$parent.height()) {
      $el.css({'height': '100%'});
    } else {
      $el.css({'width': '100%'});
    }
    $el.addClass('show');
  });
  
});