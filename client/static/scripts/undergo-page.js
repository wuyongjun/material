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
	var personId = parseInt(window.location.href.substr(window.location.href.indexOf('#') + 1), 10);
	// var personId = 71;
	var auth_token = window.location.href.substr(window.location.href.indexOf('*') + 1);
	// var auth_token = 'WyIxODkiLCIyMzRlMmQzNWFiMzhhNjZmNjZiNTg0NTMyMTM3NDZkYSJd.CqaF9w.U_bwsCxGc0QAEmPMuQAY1GsB8fA';
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
				var person = data.data.user_obj.user_obj;
				$('#person').html(person.name);
				$('#photo').attr('src', person.icon);
				$('#name').html(person.name);
				if (hashStatus[data.data.user_obj.status]) {
					$('#status').html(hashStatus[data.data.user_obj.status]);
				} else {
					$('#status').html('<font color="#B8BEC3">未采集</font>');
				}
				
				$('#sex').html(hashSex[person.sex]);
				$('#major').html(person.major);
				$('#phone').html(person.phone);
				$('#admission_date').html(person.admission_date);
				if (data.data.user_obj.duty_obj) {
					$('#duty').html(data.data.user_obj.duty_obj.name);
				} else {
					$('#duty').html('<font color="#B8BEC3">未采集</font>');
				}
				if (data.data.user_obj.group_obj) {
					$('#group').html(data.data.user_obj.group_obj.name);
				} else {
					$('#group').html('<font color="#B8BEC3">未采集</font>');
				}
				if (data.data.user_obj.year_obj) {
					$('#year').html(data.data.user_obj.year_obj.name);
				} else {
					$('#year').html('<font color="#B8BEC3">未采集</font>');
				}
				var undergo = data.data.undergo_obj;
				var container = $('#party_course');
				
				for (var i = 0;i < undergo.length;i++) {
					var tempUndergo = undergo[i];
					var create_time = new Date(tempUndergo.create_time).Format('yyyy-MM-dd hh:mm:ss');
					var panel = $('<div class="panel panel-default form-horizontal"></div>');
					var panelHeading = $('<div class="panel-heading"><div class="panel-title">' + create_time + '</div></div>');
					var panelBody = $('<div class="panel-body"></div>');
					var labelRow = $('<div class="row"></div>');
					var contentRow = $('<div class="row"><div class="col-sm-12"><div class="well">' + tempUndergo.content + '</div></div></div>');
					for (var j = 0;j < tempUndergo.label.length;j++) {
						var tempLabel = tempUndergo.label[j];
						var label = $('<span class="label label-info course"><font size="3">' + tempLabel.name + '</font></span>');
						labelRow.append(label);
					}
					var activityRow = '';
					// var postArr = [];
					if (tempUndergo.activity_obj) {
						var start_time = new Date(tempUndergo.activity_obj.start_time).Format('yyyy-MM-dd hh:mm:ss');
						var end_time = new Date(tempUndergo.activity_obj.end_time).Format('yyyy-MM-dd hh:mm:ss');
						activityRow = $('<div class="row"></div>');
						var infoColumn = $('<div class="col-sm-6"></div>');
						var subject = $('<p>活动名称：' + tempUndergo.activity_obj.subject + '</p>');
						var loc = $('<p>活动地点：' + tempUndergo.activity_obj.location + '</p>');
						var starttime = $('<p>活动开始时间：' + start_time + '</p>');
						var endtime = $('<p>活动结束时间：' + end_time + '</p>');
						var plugin1 = '';
						var plugin2 = '';
						if (tempUndergo.activity_obj.plugins[0]) {
							plugin1 = $('<span class="label label-success plugin">' + tempUndergo.activity_obj.plugins[0].name + '</span>');
						}
						if (tempUndergo.activity_obj.plugins[1]) {
							plugin2 = $('<span class="label label-success plugin">' + tempUndergo.activity_obj.plugins[1].name + '</span>');
						}
						var postColumn = $('<div class="col-sm-6"></div>');
						var poster = $('<div class="thumbnail" style="width: 300px;height: 200px;"><img class="poster_img" src="' + tempUndergo.activity_obj.poster + 
							'" style="width: 100%;height: 100%;"></div><p class="text-center" style="width: 300px">活动海报</p>');
						postColumn.append(poster);
						// var infoPlugin 
						infoColumn.append(subject);
						infoColumn.append(loc);
						infoColumn.append(starttime);
						infoColumn.append(endtime);
						if (plugin1) {
							infoColumn.append(plugin1);
						}
						if (plugin2) {
							infoColumn.append(plugin2);
						}
						activityRow.append(infoColumn);
						activityRow.append(postColumn);

					}
					panelBody.append(labelRow);
					panelBody.append(activityRow);
					panelBody.append(contentRow);
					panel.append(panelHeading);
					panel.append(panelBody);
					container.append(panel);
					
				}
				console.log($('.poster_img'));
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