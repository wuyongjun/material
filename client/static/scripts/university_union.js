//校团委web页面js文件
$(function () {
	//获取学校id
	var un_id = parseInt(window.location.href.substr(window.location.href.indexOf('#') + 1), 10);
	// var un_id = 1;
	var windowW = $(window).width();
	var unsliderW = windowW;
	var unsliderH = windowW / 1.8;
	var coverW = windowW;
	var coverH = windowW / 1.8;
	//菜单距离顶部的距离
	var height = 0;
	var formatDate = function (time) {
      var date = new Date(time);
      var dateString = date.pattern('yyyy.MM.dd');
      return dateString;
    };
    //当前页数
    var curr_page_a = 1;
    var curr_page_o = 1;
    var load_img_path = '/static/images/loading1.gif';
    var $load_act = $('<div class="loading"><font color="gray">下拉加载更多</font>&nbsp;&nbsp;<img class="load_img" src="' + load_img_path + '"></div>');
	var $finish_act = $('<div class="finish"><font color="gray">已经到底了~~</font></div>');
	var $load_org = $('<div class="loading"><font color="gray">下拉加载更多</font>&nbsp;&nbsp;<img class="load_img" src="' + load_img_path + '"></div>');
	var $finish_org = $('<div class="finish"><font color="gray">已经到底了~~</font></div>');
	//点击活动列表菜单
	$('.menu_activity').click(function () {
		$(this).css('color', '#3cbfe0');
		$('.menu_org').css('color', '#333');
		$('.menu_select_a').css('display', 'block');
		$('.menu_select_o').css('display', 'none');
		$('#activity').css('display', 'block');
		$('#org').css('display', 'none');
	});
	//点击组织列表菜单
	$('.menu_org').click(function () {
		$(this).css('color', '#3cbfe0');
		$('.menu_activity').css('color', '#333');
		$('.menu_select_a').css('display', 'none');
		$('.menu_select_o').css('display', 'block');
		$('#activity').css('display', 'none');
		$('#org').css('display', 'block');

	});
	//加载活动数据
	var load_act_list = function (curr_page) {
		$.ajax({
			type: 'GET',
			url: '/api/activities/union?university='+un_id+'&page='+curr_page,
			dataType: 'json',
			success: function (data) {
				var items = data.data.items;
				var tops = data.data.top;
				if (curr_page === 1) {
					load_act_top(tops);
				} else {
					$load_act.css('display', 'none');
				}
				//活动总数
				var act_number = data.data.total;
				$('#act_number').text('（'+act_number+'）');
				for (var i = 0;i < items.length;i++) {
					var act = items[i];
					var $act_row = '<div id="act_' + act.id + '" class="act_row" onclick="to_act_sharing(' + act.id + ')">'+
						'<div class="post_div" style="background: url(' + act.poster + ');background-size: cover;">'+
				            '<img class="shade" src="/static/images/activity-sharing-gray.png">'+
				            /*'<img class="cover" src="' + act.poster + '" />'+*/
				            '<h4 class="title">' + act.subject + '</h4>'+
				        '</div>'+
				        '<div class="act_info">'+
				        	'<img class="act_post" src="' + act.host.logo + '">'+
				        	'<div class="act_loc_time">'+
				        		'<div class="act_comm">'+
				        			'<img style="width: 18px;" src="/static/images/un_community.png">&nbsp;'+
				        			'<font>' + act.host.name + '</font>'+
				        		'</div>'+
				        		'<div class="act_time">'+
				        			'<img style="width: 18px;" src="/static/images/un_time.png">&nbsp;'+
				                    '<font>' + formatDate(act.start_time) + '-' + formatDate(act.end_time) + '</font>'+
				        		'</div>'+
				        	'</div>'+
				        	'<div class="clear"></div>'+
				        '</div>'+
				        '<div class="split"></div>'+
					'</div>';
					$('#activity').append($act_row);
				}
				$finish_act.remove();
				if (items.length !== 0) {
					$('#activity').append($load_act);
				} else {
					$load_act.remove();
					$('#activity').append($finish_act);
				}
				//设置置顶活动海报的高
				$('.cover').css('height', coverH);
				//设置logo高度
				// $('.act_post').css('height', $('.act_post').width());
				//设置遮罩层的高
				$('.shade').css('height', coverH);
				//设置活动列表中海报的高度
				$('.post_div').css('height', coverH);
				//设置活动列表中活动名称样式
				var titleH = coverH - 27;
				$('.title').css('margin-top', titleH);
			}
		});
	};
	load_act_list(curr_page_a);
	//加载组织列表
	var load_org_list = function (curr_page) {
		$.ajax({
			type: 'GET',
			url: '/api/communities/list_union?university='+un_id+'&page='+curr_page,
			dataType: 'json',
			success: function (data) {
				var items = data.data.items;
				//组织总数
				var org_number = data.data.total;
				if (curr_page !== 1) {
					$load_org.css('display', 'none');
				}
				$('#org_number').text('（'+org_number+'）');
				for (var j = 0;j < items.length;j++) {
					var item = items[j];
					var description = '';
					console.log('简介原长度：'+item.community.description.length);
					if (item.community.description && item.community.description.length > 40) {
						description = item.community.description.substring(0, 40) + '...';
						console.log('简介现长度：'+description.length);
					} else {
						description = item.community.description;
					}
					if (item.activities.length !== 0 && item.activities[0].poster !== '/images/images/placeholder.png') {
						var $org_row_pic = '<div id="comm_'+item.community.id+'" class="org_row_pic" onclick="to_comm_sharing('+item.community.id+')">'+
							'<div class="org_logo_div">'+
								'<img class="org_logo" src="' + item.community.logo + '">'+
							'</div>'+
							'<div class="org_content_div">'+
								'<div style="width: 100%;">'+
									'<div class="org_comm_name_div">'+
										'<font class="org_comm_name">' + item.community.name + '</font>'+	
									'</div>'+
									'<div>'+
										'<font class="org_comm_dep">' + description + '</font>'+
									'</div>'+
								'</div>'+
							'</div>'+
							'<div class="org_post_div">'+
								'<img class="org_post" src="' + item.activities[0].poster + '">'+
							'</div>'+
							'<div class="clear"></div>'+
						'</div>';
						$('#org').append($org_row_pic);
					} else {
						var $org_row_nopic = '<div id="comm_'+item.community.id+'" class="org_row_nopic" onclick="to_comm_sharing('+item.community.id+')">'+
							'<div class="org_logo_div">'+
								'<img class="org_logo" src="' + item.community.logo + '">'+
							'</div>'+
							'<div class="org_content_div_l">'+
								'<div style="width: 100%;">'+
									'<div class="org_comm_name_div">'+
										'<font class="org_comm_name">' + item.community.name + '</font>'+	
									'</div>'+
									'<div>'+
										'<font class="org_comm_dep">' + description + '</font>'+
									'</div>'+
								'</div>'+
							'</div>'+
							'<div class="clear"></div>'+
						'</div>';
						$('#org').append($org_row_nopic);
					}
				}
				$finish_org.remove();
				if (items.length !== 0) {
					$('#org').append($load_org);
				} else {
					$load_org.remove();
					$('#org').append($finish_org);
				}
				//设置组织列表中的社团logo css
				$('.org_logo')
					.css('width', '70%')
					.css('border-radius', '50%')
					.css('margin-top', '5px')
					.css('margin-left', '5px')
					.css('height', 0.2*windowW*0.7 - 1);
				//设置组织列表中的活动海报
				$('.org_post')
					.css('height', 0.3*windowW - 3);
			}
		});
	};
	//加载组织列表
	load_org_list(curr_page_o);
	var add_banner_item = function (len, tops) {
		for (var k = 0;k < len;k++) {
    		var top = tops[k];
    		var $li = $('<li><img src="/static/images/activity-sharing-gray.png" onclick="to_top_sharing('+top.id+')"><div class="top_title"></div></li>');
			$('#top_list').append($li);
			$('#top_list li:eq(' + k + ')')
				.css('background','url(' + top.poster + ')')
				.css('background-size', 'cover');
			$('#top_list li:eq(' + k + ') img').attr('id', top.id);
			$('#top_list li:eq(' + k + ') div')
				.html('&nbsp;&nbsp;' + top.subject);
		}
	};
	//加载置顶活动，即轮播控件内容
	var load_act_top = function (tops) {
		console.log(tops);
		var count;
		// tops = [];
		// tops = [{id: 336,poster: "/images/activity/336/poster/1a74563a-419f-11e5-8ac7-00163e002e66.jpg",subject: "这是第一条测试数据"}];
		// tops = [{id: 336,poster: "/images/activity/336/poster/1a74563a-419f-11e5-8ac7-00163e002e66.jpg",subject: "这是第一条测试数据"},
		// {id: 336,poster: "/images/activity/365/poster/7d829e46-a3ea-11e5-92b1-00163e060098.jpg",subject: "这是第二条测试数据"}];
        if (tops && tops.length !== 0) {
        	if (tops.length > 3) {
				add_banner_item(3, tops);
				count = 4;
			} else {
				add_banner_item(tops.length, tops);
				if (tops.length === 1) {
					count = 2;
					$('.top_title').css('margin-top', '-12%');
				} else {
					count = 3;
					$('.top_title').css('margin-top', '-6%');
				}
			}
			$('#banner_split').css('display', 'block');
        	//设置轮播控件的高度
			$('.banner li').css('height', unsliderH);
			//菜单距离顶部的距离
			height = $('#menu').offset().top / count;
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
	//监控滚动条
	$(window).scroll(function () {
		//滚动条滚动高度
		var scrollH = $(this).scrollTop();
		//可见内容高度
		var clientH = $(this).height();
		//内容高度
		var offsetH = $('#container').get(0).scrollHeight;
		console.log($('.menu_select_a').css('display'));
		if (offsetH - clientH - scrollH === 0) {
			if ($('.menu_select_a').css('display') === 'block') {
				$load_act.css('display', 'block');
				load_act_list(++curr_page_a);
			} else {
				$load_org.css('display', 'block');
				load_org_list(++curr_page_o);
			}
		}
		console.log('height='+height+'----scrollH='+scrollH);
		if (scrollH > height) {
			$('#menu').css({'position':'fixed', 'top': '0'});
			console.log($('#menu').css('position'));
		} else {
			$('#menu').css('position', 'static');
		}
	});
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
});
function to_act_sharing(id) {
	console.log(id);//http://101.201.146.103:8888/weixin/activities/356
	window.location.href = '/weixin/activities/'+id;
}
function to_top_sharing (id) {
	console.log(id);//101.201.146.103:8888/app/university/share#1
	window.location.href = '/weixin/activities/'+id;
}
function to_comm_sharing (id) {
	console.log(id);//http://101.201.146.103:5003/weixin/community/share
	window.location.href = '/weixin/community/share#'+id;
}