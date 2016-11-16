$(function () {
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
	//获取信息id
	var id = parseInt(window.location.href.substr(window.location.href.indexOf('#') + 1), 10);
	// var id = 1;
	//获取浏览器窗口的宽度
	var windowW = $(window).width();
	var unsliderH = windowW;
	//轮播图片列表对象
	var $image_list = $('#image_list');
	//格式化数据
	var formatDate = function (time, pattern) {
		var date = new Date(time);
		var dateStr = date.pattern(pattern);
		return dateStr;
	};
	//获取身边事数据
	var getDataFromServe = function (id) {
		$.ajax({
			type: 'GET',
			url: '/api/nearby/' + id,
			dataType: 'json',
			success: function (data) {
				console.log(data);
				var nearby = data.data.nearby;
				var msg = data.data.msg;
				loadUnsliderImg(nearby.images);
				loadData(nearby, msg);
			}
		});
	};
	var loadData = function (nearby, stats) {
		/*stats = [{content: '撒打发是非法的', create_time: 1425459075000, user: {nickname:'周润发', icon: '/static/images/4.jpg'}},
			{content: '大是大非斯蒂芬', create_time: 1425459075000, user: {nickname:'梁朝伟', icon: '/static/images/5.jpg'}},
			{content: '下次vndsdfs', create_time: 1425459075000, user: {nickname:'李连杰', icon: '/static/images/6.jpg'}}];*/
		//加载身边事信息内容
		$('#nearby_title').html(nearby.title);
		$('#nearby_logo').attr('src', nearby.user.icon);
		$('#nearby_logo').css('height', $('#nearby_logo').css('width'));
		$('#nickname').html(nearby.user.nickname);
		var publish_time = formatDate(nearby.create_time, 'yyyy-MM-dd');
		$('#publish_time').html(publish_time);
		$('#content').html(nearby.content);
		//加载评论内容
		var stat_num;
		if (parseInt(nearby.message_num, 10) >= 999) {
			stat_num = '评论：9k+ 条';
		} else {
			stat_num = '评论：' + nearby.message_num + ' 条';
		}
		$('#stat_num').html(stat_num);
		var stat_len = stats.length;
		var $stats = $('#stats');
		for (var i = 0;i < stat_len;i++) {
			var stat = stats[i];
			var create_time = formatDate(stat.create_time, 'yyyy-MM-dd HH:mm');
			var $stat_person = $('<div class="stat_person"><div class="logo"><img class="stat_logo" src="'+stat.user.icon+'"></div>'+
				'<div class="name_time"><div class="stat_name">'+stat.user.nickname+'</div>'+
				'<div class="stat_time">'+create_time+'</div></div>'+
				'<div class="clear"></div></div>');
			var $stat_content = $('<div class="stat_content">'+stat.content+'</div>');
			var $hr = $('<hr class="stat_info_hr"/>');
			if (i !== stat_len - 1) {
				$stats.append($stat_person);
				$stats.append($stat_content);
				$stats.append($hr);
			} else {
				$stats.append($stat_person);
				$stats.append($stat_content);
			}
			$('.stat_logo').css('height', $('.stat_logo').css('width'));
		}
	};
	getDataFromServe(id);
	//添加轮播图片
	var loadUnsliderImg = function (image_arr) {
		console.log(image_arr);
		// image_arr = ['/static/images/2.jpg', '/static/images/1.jpg', '/static/images/3.jpg'];
		// image_arr = [];
		if (image_arr && image_arr.length !== 0) {
			addBannerItem(image_arr.length, image_arr);
			//设置轮播控件的高度
			$('.banner li').css('height', unsliderH);
			//轮播控件
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
		}
	};
	var addBannerItem = function (len, arr) {
		for (var k = 0;k < len;k++) {
			var image = arr[k];
			var $li = $('<li><img align="center" src="' + image + '"></li>');
			$('#image_list').append($li);
		}
	};
	$('.download_iwx')
		.click(function () {
			if (!browser.versions.mobile) {
				window.alert('您这里不是移动端，请手机登陆此页面！');
			} else {
				if (browser.versions.android) {
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
//路由 app/weixin/nearby/share#id
//数据接口 /api/nearby/<int:nearby_id>/ GET