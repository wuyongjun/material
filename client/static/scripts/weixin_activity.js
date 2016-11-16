$(function () {
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
  /**       
   * 对Date的扩展，将 Date 转化为指定格式的String       
   * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符       
   * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)       
   * eg:       
   * (new Date()).pattern("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423       
   * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04       
   * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04       
   * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04       
   * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18       
   */
    Date.prototype.pattern=function(fmt) {           
        var o = {           
        "M+" : this.getMonth()+1, //月份           
        "d+" : this.getDate(), //日           
        "h+" : this.getHours()%12 === 0 ? 12 : this.getHours()%12, //小时           
        "H+" : this.getHours(), //小时           
        "m+" : this.getMinutes(), //分           
        "s+" : this.getSeconds(), //秒           
        "q+" : Math.floor((this.getMonth()+3)/3), //季度           
        "S" : this.getMilliseconds() //毫秒           
        };           
        var week = {           
        "0" : "/u65e5",           
        "1" : "/u4e00",           
        "2" : "/u4e8c",           
        "3" : "/u4e09",           
        "4" : "/u56db",           
        "5" : "/u4e94",           
        "6" : "/u516d"          
        };           
        if(/(y+)/.test(fmt)){           
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));           
        }           
        if(/(E+)/.test(fmt)){           
            fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);           
        }           
        for(var k in o){           
            if(new RegExp("("+ k +")").test(fmt)){           
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length===1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));           
            }           
        }           
        return fmt;           
    };
    //活动时间格式化函数
    var formatDate = function (time) {
      var date = new Date(time);
      var dateString = date.pattern('MM/dd(EE) HH:mm');
      return dateString;
    };
    console.log(formatDate(1446259980000));
    $('.download_iwx')
      .click(function () {
        if (!browser.versions.mobile) {
          window.alert('您这里不是移动端，请手机登陆此页面！');
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