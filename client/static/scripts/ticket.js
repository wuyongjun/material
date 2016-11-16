$(function () {
	//日期参数格式化类
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
  //定义计数器，每5个一换行
  var count = 0;
  //第一每个用电子票签到的id标识
  var ticket_number = 0;
  //定义row id 计数
  var row_count = 1;
  //创建容器
  var $container = $('#ticket');
  //创建row
  var $row = $('<div id="row-'+row_count+'" class="row"><div class="col-md-1"></div></div>');
  //创建人员出现的小门
  var $door = $('<div class="door"><img id="door_image" src="/static/images/ticket_door.png" style="width:100%;height:100%;"></div>');
  $container.append($door);
  //创建电子票入场动画
  var animate = function ($ticket_person, $row, $image, $name, $column) {
  	$('body')
  		.animate({
  	    	scrollTop: $row.offset().top - $('body').offset().top + $('body').scrollTop()
  		});
  //动画
	$ticket_person
    .addClass('shake shake-rotate shake-constant')
		.animate({
			left: '45%',
			top: '80%'
		}, 2000, function () {
      $('#door_image')
        .animate({
          width: '100%'
        }, 'slow');
    })
		.animate({
			left: '45%',
			top: '40%'
		}, 2000, function () {
      $ticket_person.remove();
      var $image_div = $('<div class="image_bg"><div class="tip top2bottom"><img id="big_image" src="'+$image.attr('src')+'"></div></div>');
      $('body').append($image_div);
      $('#big_image')
        .delay(3000)
        .animate({
          top: $column.offset().top + 5,
          left: $column.offset().left + 45,
          height: $image.height(),
          width: $image.width()
        }, function () {
          $image_div.remove();
          $image
            //.show('slow')
            .css('display', 'block');
          $name.show();
          get_data();
        });
		});

  };
  //创建数据DOM
  var create = function (ticket_item) {
    ticket_number++;
  	//名字背景图
  	var cloud_image = '/static/images/white_cloud.png';
  	//小人身体部分图片
  	var person_image = '/static/images/ticket_person.png';
    //每一个ticket所在的div
  	var $column = $('<div id="item" class="col-md-2"><div class="thumbnail"><img id="image-'+ticket_number+'" class="img-rounded" src="'+ticket_item.photo+'"/><div class="caption" style="display:none;"><img id="cloud" src="'+cloud_image+'"/><p class="name" id="name">'+ticket_item.name+'</p></div></div></div>');
  	if (count === 5) {
  		row_count++;
  		var $newRow = $('<div id="row-'+row_count+'" class="row"><div class="col-md-1"></div></div>');
  		$row = $newRow;
  		count = 0;
  	}
  	$row.append($column);
  	$container.append($row);
    //设置图片为正方形
    $('.img-rounded')
      .css('width', $('.img-rounded').css('width'))
      .css('height', $('.img-rounded').css('width'));
    //设置图片隐藏
    $('#image-'+ticket_number)
      .css('display', 'none');
  	//创建移动到中点的元素，即移动的小人
  	var $ticket_person = $('<div class="ticket_person">'+
  		'<img class="person_head" src="'+ticket_item.photo+'"/>'+
  		'<img class="person_body" src="'+person_image+'"/></div>');
    //当图片加载完成后进行动画
    $('#image-'+ticket_number).bind('load', function () {
      console.log('动画执行了。。。。。');
      $('#door_image')
        .animate({
          width: '0'
        }, 'slow', function () {
          $container.append($ticket_person);
          $('.person_head')
            .css('width', $('.person_head').css('height'))
            .css('height', $('.person_head').css('height'));
          animate($ticket_person, $('#row-'+row_count), $('#image-'+ticket_number), $('.caption'), $column);
        });
    });
  	count++;
  };
  //创建历史DOM数据
  var create_history = function (ticket_item_history) {
    //名字背景图
    var cloud_image = '/static/images/white_cloud.png';
    //小人身体部分图片
    var person_image = '/static/images/ticket_person.png';
    var $column = $('<div id="item" class="col-md-2"><div class="thumbnail"><img class="img-rounded" src="'+ticket_item_history.photo+'"/><div class="caption"><img id="cloud" src="'+cloud_image+'"/><p class="name" id="name">'+ticket_item_history.name+'</p></div></div></div>');
    if (count === 5) {
      row_count++;
      var $newRow = $('<div id="row-'+row_count+'" class="row"><div class="col-md-1"></div></div>');
      $row = $newRow;
      count = 0;
    }
    $row.append($column);
    $container.append($row);
    //设置图片为正方形
    $('.img-rounded')
      .css('width', $('.img-rounded').css('width'))
      .css('height', $('.img-rounded').css('width'));
    count++;
  };
  //监控浏览器的变化
  $(window).resize(function () {
    $('.img-rounded')
      .css('height', $('.img-rounded').css('width'));
  });
  //获取电子票id
  window.ticket_id = parseInt(window.location.href.substr(window.location.href.indexOf('#') + 1), 10);
  window.date_time = null;
  // var number = 1;
  //向服务器请求数据
  var get_data = function () {
    console.log('----date_time='+window.date_time);
  	var url = '/api/tickets/'+ window.ticket_id +'/new/users';
  	if (window.date_time) {
  		url += '?end_time=' + window.date_time;
  	}

    //test data (sign_in) /api/tickets/{ticket_id}/new/users
    /*var data3 = {
      "data": [
      {"update_time": 1416994142000,"number": "001", "status": "USED", "ticket": {}, "user": {"icon": "/images/user/27/icon/5b143636-c7a8-11e4-8ac7-00163e002e66.jpg","id": 27, "major": "\u56fd\u9645\u8d38\u6613\u4e13\u4e1a", "name": "Wukelol ", "nickname": "\u738b\u5c0f\u4e94", "sex": "MALE"}},
      {"update_time": 1416994142000,"number": "001", "status": "USED", "ticket": {}, "user": {"icon": "/images/user/27/icon/5b143636-c7a8-11e4-8ac7-00163e002e66.jpg","id": 27, "major": "\u56fd\u9645\u8d38\u6613\u4e13\u4e1a", "name": "Wukelol ", "nickname": "\u738b\u5c0f\u4e94", "sex": "MALE"}}
      ], 
      "status": "success"
    }
  	var data2 = {"data":{"update_time": 1416994142000,"number": "001", "status": "USED", "ticket": {}, "user": {"icon": "/images/user/27/icon/5b143636-c7a8-11e4-8ac7-00163e002e66.jpg","id": 27, "major": "\u56fd\u9645\u8d38\u6613\u4e13\u4e1a", "name": "Wukelol ", "nickname": "\u738b\u5c0f\u4e94", "sex": "MALE"}},"status": "success"};
  	var data1 = {'data': [],'status': 'success'};
    var ticket_item;
    if (number === 1) {
      ticket_item = data3.data;
    } else if (number > 1 && number < 5) {
      ticket_item = data1.data;
    } else if (number >= 5 && number < 10) {
      ticket_item = data2.data;
    } else {
      ticket_item = data1.data;
    }
    number++;*/

  	$.get(url, function (data) {
      var ticket_item = data.data;
      if (ticket_item instanceof Array && ticket_item.length !== 0) {
        //get data from server at first time
        var ticket_len = ticket_item.length;
        for (var i=0;i<ticket_len;i++) {
          var temp = ticket_item[i];
          create_history({
            id: temp.user.id,
            photo: temp.user.icon,
            name: temp.user.name || temp.user.nickname
          });
          window.date_time = new Date(temp.update_time).Format('yyyy-MM-dd hh:mm:ss');
        }
        console.log('data is {[]}');
        window.setTimeout(function () {
          get_data();
        }, 3000);
      } else if (ticket_item instanceof Array && ticket_item.length === 0) {
        //do nothing
        console.log('data is []');
        window.setTimeout(function () {
          get_data();
        }, 3000);
      } else {
        console.log('data is {}');
        create({
          id: ticket_item.user.id,
          photo: ticket_item.user.icon,
          name: ticket_item.user.name || ticket_item.user.nickname
        });
        window.date_time = new Date(ticket_item.update_time).Format('yyyy-MM-dd hh:mm:ss');
      } 
  	});
  };
  get_data();
});