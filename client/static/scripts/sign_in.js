$(function () {
	//时间格式化
	Date.prototype.Format = function (fmt) {
	    var o = {
	        "M+": this.getMonth() + 1, //月份
	        "d+": this.getDate(), //日
	        "h+": this.getHours(), //小时
	        "m+": this.getMinutes(), //分
	        "s+": this.getSeconds(), //秒
	        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
	        "S": this.getMilliseconds() //毫秒
	    };
	    if (/(y+)/.test(fmt)) {
	      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	    }
	    for (var k in o) {
	      if (new RegExp("(" + k + ")").test(fmt)) {
	       fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
	      }
	    }
	    return fmt;
	};
	//印章元素
	var $stamper = $('<img id="stamper" src="/static/images/stamper.png"/>');
	$('body').append($stamper);
	var row_count = 1;
	//加载签到大屏幕DOM
	var $container = $('#sign_ins');
	var $row = $('<div class="row" id="row-'+row_count+'"><div class="col-md-1"></div></div>');
	//定义计数器，当数目达到5条时，添加class='row'
	var count = 0;
	//创建动画
	var animate = function (position, $image, $name, $row) {
		// console.log($row.offset().top + '--------' + $('#sign_ins').offset().top + '-------' + $('#sign_ins').scrollTop());

		$stamper.show();
		$('html,body')
			.animate({
		    	scrollTop: $row.offset().top - $('body').offset().top + $('body').scrollTop()
			});
		$stamper/*
			.show()*/
			.animate({
				left: position.left,
				top: position.top
			}, 1000, function () {
				$image
					.show()
					.css('display', 'block');
				$name.show();
			})
			.animate({
				left: '0px',
				top: position.top
			}, 1000, function () {
				
			})
			.fadeOut('fast', function () {
				sign_in_person();
			});
	};

	//显示签到人员数据
	var sign_in_show = function (sign_in_item) {
		var cloud_image = '/static/images/white_cloud.png';
		var $sign_in_dom = $('<div id="item" class="col-md-2 col-sm-6"><div class="thumbnail"><img id="image" class="img-rounded" src="'+sign_in_item.photo+'"/><div class="caption" style="display:none;"><img class="cloud" src="'+cloud_image+'"/><p class="name" id="name">'+sign_in_item.name+'</p></div></div></div>');
		if (count === 5) {
			row_count++;
			var $newRow = $('<div class="row" id="row-'+row_count+'"><div class="col-md-1"></div></div>');
			$row = $newRow;
			count = 0;
		}
		$row.append($sign_in_dom);
		$container.append($row);
		//设置图片高度
		$('.img-rounded')
			.css('height', $('.img-rounded').css('width'))
			.css('width', $('.img-rounded').css('width'));
		//创建完成签到元素，调用动画
		animate({
			top: $sign_in_dom.offset().top,
			left: $sign_in_dom.offset().left
		}, $('.img-rounded'), $('.caption'), $('#row-'+row_count));
		count++;
	};

	//显示历史签到人员数据
	var sign_in_history = function (history_sign_in_item) {
		var cloud_image = '/static/images/white_cloud.png';
		var $sign_in_dom = $('<div id="item" class="col-md-2 col-sm-6"><div class="thumbnail"><img class="img-rounded" src="'+history_sign_in_item.photo+'"/><div class="caption"><img class="cloud" src="'+cloud_image+'"/><p class="name" id="name">'+history_sign_in_item.name+'</p></div></div></div>');
		if (count === 5) {
			row_count++;
			var $newRow = $('<div class="row" id="row-'+row_count+'"><div class="col-md-1"></div></div>');
			$row = $newRow;
			count = 0;
		}
		$row.append($sign_in_dom);
		$container.append($row);
		//设置图片高度
		$('.img-rounded')
			.css('height', $('.img-rounded').css('width'))
			.css('width', $('.img-rounded').css('width'));
		count++;
	};
	//监控浏览器的变化
	$(window).resize(function () {
		$('.img-rounded')
			.css('height', $('.img-rounded').css('width'));
	});
	//时间参数
	window.date_time = null; 
	//获取签到id
	window.sign_in_id = parseInt(window.location.href.substr(window.location.href.indexOf('#') + 1), 10);
	//获取签到人员数据 
	var sign_in_person = function () {
		var url = '/api/signs/' + window.sign_in_id + '/new/users';
		if (window.date_time) {
			url += '?end_time=' + window.date_time;
		}

		/*var data = {"data":[
				{"id": 48,"sign_in_index": 1,"sign_in_time": 1427425649000,"user": {"admission_date": "1980-07-07","icon": "/images/user/27/icon/5b143636-c7a8-11e4-8ac7-00163e002e66.jpg","id": 27, "name": "Wukelol ","nickname": "\u738b\u5c0f\u4e94", "phone": "18611540827"}},
				{"id": 48,"sign_in_index": 1,"sign_in_time": 1427425649000,"user": {"admission_date": "1980-07-07","icon": "/images/user/47/icon/15d80a72-d778-11e4-8ac7-00163e002e66.jpg","id": 27, "name": "Wukelol ","nickname": "\u738b\u5c0f\u4e94", "phone": "18611540827"}}
			],"status": "success"};*/
		// var data = {"data":{"id": 48,"sign_in_index": 1,"sign_in_time": 1427425649000,"user": {"admission_date": "1980-07-07","icon": "/images/user/27/icon/5b143636-c7a8-11e4-8ac7-00163e002e66.jpg","id": 27, "name": "Wukelol ","nickname": "\u738b\u5c0f\u4e94", "phone": "18611540827"}}};

		$.get(url, function (data) {
			var item = data.data;
			//第一次从服务器获取数据，数组数据且长度不为0
			if (item instanceof Array && item.length !== 0) {
				for (var i=0;i<item.length;i++) {
					var temp = item[i];
					sign_in_history({
						id: temp.user.id,
						name: temp.user.name || temp.user.nickname,
						photo: temp.user.icon
					});
					window.date_time = new Date(temp.sign_in_time).Format('yyyy-MM-dd hh:mm:ss');
				}
				//隔3秒发送请求
				window.setTimeout(function () {
					sign_in_person();
				}, 3000);
			} else if (item instanceof Array && item.length === 0) {
				//return;
				//没有签到人员，什么都不做
				window.setTimeout(function () {
					sign_in_person();
				}, 3000);
			} else {
				sign_in_show({
					id: item.user.id,
		 			name: item.user.name || item.user.nickname,
		 			photo: item.user.icon
				});
				window.date_time = new Date(item.sign_in_time).Format('yyyy-MM-dd hh:mm:ss');
			}
	    }, 'json');
	};
	sign_in_person();
	
});