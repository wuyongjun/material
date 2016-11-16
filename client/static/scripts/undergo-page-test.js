$(function () {
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
	//获取人员id
	// var personId = parseInt(window.location.href.substr(window.location.href.indexOf('#') + 1), 10);
	var personId = 75;
	// var auth_token = window.location.href.substr(window.location.href.indexOf('*') + 1);
	var auth_token = 'WyIxODkiLCIyMzRlMmQzNWFiMzhhNjZmNjZiNTg0NTMyMTM3NDZkYSJd.CqaF9w.U_bwsCxGc0QAEmPMuQAY1GsB8fA';
	var hashStatus = {
		'FORMAL' : '正式党员',
		'PREPARE' : '预备党员',
		'POSITIVE' : '积极份子'
	};
	var hashSex = {
		'MALE' : '男',
		'FEMALE' : '女'
	};
	//获取用户及党建历程数据
	var getData = function () {
		$.ajax({
			type: 'GET',
			url: '/api/political/undergo/' + personId + '/all?access_token=' + auth_token,
			dataType: 'json',
			success: function (data) {
				console.log(data);
				var info = data.data;
				info.user_obj.user_obj.sex = hashSex[info.user_obj.user_obj.sex];
				//注册过滤器
				Handlebars.registerHelper('datefilter', function (value) {
					return new Date(value).Format('yyyy-MM-dd hh:mm');
				});
				Handlebars.registerHelper('statusfilter', function (value) {
					if (hashStatus[value]) {
						return hashStatus[value];
					} else {
						return '<font color="#B8BEC3">未采集</font>';
					}
				});
				//获取模版内容
				var tpl = $('#tpl').html();
				// console.log(tpl);
				//预编译模版
				var template = Handlebars.compile(tpl);
				//匹配json数据
				var html = template(info);
				// console.log(html);
				//输出模版
				$('#info').html(html);
				var defereds = [];
				$('.poster_img').each(function () {
					var dfd = $.Deferred();
					$(this).load(dfd.resolve);
					defereds.push(dfd);
				});
				$.when.apply(null, defereds).done(function () {
					window.print();
				});
				
			}
		});
	};
	getData();
});