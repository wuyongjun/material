$(function() {
  var browser= {
    versions: (function () {
      var u = navigator.userAgent, app = navigator.appVersion;
      return {
        mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
        android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
        iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
        iPad: u.indexOf('iPad') > -1 , //是否iPad
        weixin: u.indexOf('MicroMessenger') > -1, //是否微信
        safari: u.match(/Safari/i) === "Safari", //是否为safari
        webApp: u.indexOf('Safari') === -1 //是否web应该程序，没有头部与底部
      };
    })()
  };

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

  $('.footer-btn').on('click', function () {
    if (!browser.versions.mobile) {
      window.alert('您这里不是移动端，请手机登陆此页面去投票吧！');
    } else {
      if (browser.versions.android) {
        // $('#android_popweixin').css('display', 'block');
        window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.boringkiller.xgm';
      } else if (browser.versions.iPhone || browser.versions.iPad) {
        if (browser.versions.weixin) {
          $('#ios_popweixin').css('display', 'block');
        } else {
          window.location.href = 'https://itunes.apple.com/cn/app/i-wei-xiao/id835588974?l=en&mt=8';
        }
      } else {
        window.alert('您使用的系统暂不支持，请使用安卓或苹果手机!');
      }
    }
    return false;
  });
});