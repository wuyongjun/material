$(function () {
  //抽奖圆盘DOM对象
  var $circleEl = $('#circle');
  //抽奖按钮DOM对象
  var $draw_btn = $('#draw_btn');
  //隐藏加载动画
  var loaderHide = function () {
    var $loaderEL = $('#loader');

    $loaderEL.removeClass('pageload-loading');
    window.setTimeout(function () {
      $loaderEL.removeClass('pageload-show');
    }, 300);
  };

  // 生成转盘
  var iTurntable = function (items, options) {
    if (!options) {
      options = {};
    }
    //获取圆盘div的高度
    var towR = $circleEl.height();
    var circleEls;

    var generator = function (ops, callback) {
      //定义一个pointer，使该pointer在圆盘中的随机位置上去
      var p = {
        x: Math.round(Math.random() * towR),
        y: Math.round(Math.random() * towR)
      };

      var _rr = towR / 10, _nis = false;
      if (ops.length !== 0) {
        for (var i = 0; i < ops.length; i++) {
          var _p = ops[i];
          var nisX = (p.x + _rr > _p.x) && (_p.x + _rr > p.x);
          var nisY = (p.y + _rr > _p.y) && (_p.y + _rr > p.y);
          if (nisX && nisY) {
            _nis = true;
            break;
          }
        }
      }

      if (_nis) {
        setTimeout(function () {generator(ops, callback);}, 0);
      } else {
        ops.push(p);
        callback(p);
      }
    };

    // 需要随机出现头像
    if (options.revolve) {
      circleEls = $circleEl.find('ul li');

      $circleEl.find('ul li.show').remove();
      var index = Math.round(Math.random() * circleEls.length);

      var _rr = towR / 10;
      var p = {
        x: _rr * 3 + Math.round(Math.random() * _rr * 2),
        y: _rr * 3 + Math.round(Math.random() * _rr * 2)
      };

      var $el = $('<li>' + circleEls.eq(index).html() + '</li>');
      $circleEl.find('ul').append($el);


      $el.css({left: p.x, top: p.y}).addClass('show bounceIn animated');
    } else {
      var circleTemplate = Handlebars.compile($('#circleTpl').html());
      $circleEl.find('.items').html(circleTemplate({items: items}));
      //定义一个随机点数组
      var ops = [];
      circleEls = $circleEl.find('ul li');
      circleEls.each(function () {
        var $el = $(this);
        generator(ops, function (_op) {
          $el.css({left: _op.x, top: _op.y});
        });
      });
    }
  };

  // 显示结果
  //要删除的中奖人id和中奖人DOM
  var delUserId, $delUserItem, awards_id;
  var prize = function (user) {
    //定义一个hashmap对照表
    var draw_type_map = {
      'SIGN': '签到号码',
      'TICKET': '电子票号码',
      'VOTE': '投票号码'
    };
    var doneTemplate = Handlebars.compile($('#doneTpl').html());
    $circleEl.find('.done').html(doneTemplate(user)).addClass('show');
    $circleEl.find('.done div p').css({'fontSize': $circleEl.width() * 8 / 100});
    setTimeout(function () {
      $circleEl.find('.done img').addClass('show bounceIn animated');
      $circleEl.find('.items .show').remove();
    }, 1);
    setTimeout(function () {
      $circleEl.css({overflow: 'visible'});
      var $done = $circleEl.find('.done');
      $done.find('div').hide();
      $done.find('img').animate({
        top: '-12%',
        height: '1px',
        width: '1px'
      }, 800, function () {
        $circleEl.find('.done').remove();
        var $item = $('.notice .item.null').eq(0);
        $item.find('.avatar').html('<img src="' + user.avatar + '">');
        $item.find('span').html('&nbsp;&nbsp;No.' + user.number + '&nbsp;' + user.name + '&nbsp;&nbsp;');
        //添加删除按钮
        var $del_image = $('<image id="' + user.userId + '" class="del_sign" src="/static/images/draw-big-close.png">');
        $item.find('span').after($del_image);
        $item.removeClass('null');
        $del_image.click(function () {
          console.log($(this).attr('id'));
          delUserId = $(this).attr('id');
          $('#message').text('确定删除该中奖人？');
          $('#confirmModal').modal();
          $delUserItem = $item;
          
        });
        if ($('.notice .item.null').length >= 0) {
          $circleEl.find('.backdrop').addClass('show');
          $circleEl.find('.items').after('<div class="done"></div>');
        }
      });
    }, 3000);
  };

  // 渲染头
  (function () {
    $('.warp').css({top: $('.header .notice').height() + 'px'});
  })();

  // 自适应大小
  (function () {
    var cWdith, cHeight;
    var $window = $(window);
    var _Height = ($window.width() > $window.height()) ? $window.height() : $window.width();

    cWdith = cHeight = _Height * 3 / 4;

    $circleEl.css({
      width: cWdith,
      height: cHeight
    });

    $circleEl.find('.btn').css({'fontSize': cWdith / 10});
    $circleEl.addClass('show');
  })();

  // 开始抽奖  http://localhost:9000/templates/draw.html
  //点击抽奖按钮，按钮切换成停止样式，向服务器请求一个中奖人数据，生成圆盘动画
  // var flag = 1, data;
  $draw_btn.on('click', '.start', function () {
      this.remove('.start');
      $draw_btn.append('<a class="stop" href="#"><span>停止</span></a>');
      $circleEl.find('.backdrop').removeClass('show');
      /*if (flag === 1) {
        data = {"data": {"number": 3, "type": "TICKET", "user": {"admission_date": "2010-08-18", "email": "", "icon": "/images/user/56/icon/e79f4634-d777-11e4-8ac7-00163e002e66.jpg",
          "id": 56, "major": "\u767b\u673a\u53e3", "name": "\u738b\u5fd7\u6587", "nickname": "\u56fd\u753b\u5bb6", "phone": "18601251927", "roles": [{"description": "normal user", "name": "USER"}], 
          "sex": "MALE", "university": {"city": "\u5317\u4eac\u5e02", "id": 1, "name": "\u4e2d\u592e\u6c11\u65cf\u5927\u5b66", "province": "\u5317\u4eac\u5e02"}}}, "status": "success"};
        flag++;
      } else if (flag === 2) {
        data = {"data": {"number": 4, "type": "TICKET", "user": {"admission_date": "2010-08-18", "email": "", "icon": "/images/user/56/icon/e79f4634-d777-11e4-8ac7-00163e002e66.jpg",
          "id": 73, "major": "\u767b\u673a\u53e3", "name": "\u738b\u5fd7\u6587", "nickname": "\u56fd\u753b\u5bb6", "phone": "18601251927", "roles": [{"description": "normal user", "name": "USER"}], 
          "sex": "MALE", "university": {"city": "\u5317\u4eac\u5e02", "id": 1, "name": "\u4e2d\u592e\u6c11\u65cf\u5927\u5b66", "province": "\u5317\u4eac\u5e02"}}}, "status": "success"};
        flag++;
      } else {
        data = {"code": 4, "message": "\u4e2d\u5956\u4eba\u6570\u5df2\u8fbe\u5230\u6700\u5927\u503c", "status": "error"};
      }
      console.log(!data.data);
      if (!data.data) {
        $circleEl.find('.btn').html('<a class="start" href="#"><span><font size="5">'+
          data.message+'</font></span></a>').addClass('show');
        $circleEl.find('.backdrop').addClass('show');
        $draw_btn.find('.stop').replaceWith($('<a class="start" href="#"><span>开始</span></a>'));
        return;
      }
      window._user = data.data;*/
      $.ajax({
        type: 'POST',
        url: '/api/lotteries/' + id + '/draw_lots',
        headers: {
          'Authentication-Token': window.auth_token
        },
        dataType: 'json',
        success: function (data) {
          if (!data.data) {
            $circleEl.find('.btn').html('<a class="start" href="#"><span><font size="5">'+
              data.message+'</font></span></a>').addClass('show');
            $circleEl.find('.backdrop').addClass('show');
            $draw_btn.find('.stop').replaceWith($('<a class="start" href="#"><span>开始</span></a>'));
            clearTimeout(window.revolve);
            return;
          }
          window._user = data.data;
        }
      });

      var _revolve = function () {
        iTurntable(window.items, {
          revolve: true
        });
        window.revolve = setTimeout(function () {
          _revolve();
        }, 200);
      };
    _revolve();
    return false;
  });
  //删除中奖人员
  $('#confirm_del').click(function () {
    console.log('要删除的中奖人id：'+delUserId);
    // flag = 1;
    //调用删除接口
    $.ajax({
      type: 'DELETE',
      url: '/api/lotteries/' + awards_id + '/winner/' + delUserId + '/delete',
      headers: {
        'Authentication-Token': window.auth_token
      },
      dataType: 'json',
      success: function (data) {
        if (data.status === 'success') {
          $circleEl.find('.btn').html('<a class="start" href="#"><span><font size="5">'+
            data.message+'</font></span></a>').removeClass('show');
          $delUserItem.replaceWith($('<div class="item null"><div class="avatar"></div><span></span></div>'));
        } else {
          var error_mes = data.message;
          window.alert(error_mes);
        }
      }
    });
  });

  // 停止抽奖 开始按钮切换成停止按钮，将中奖人头像、号码、姓名信息放大停留，移动到中奖人列表显示
  $draw_btn.on('click', '.stop', function () {
    clearTimeout(window.revolve);
    this.remove('.stop');
    $draw_btn.append('<a class="start" href="#"><span>开始</span></a>');
    $circleEl.find('.backdrop').addClass('show');

    prize({
      userId: window._user.user.id,
      number: window._user.number,
      type: window._user.type,
      name: window._user.user.nickname,
      avatar: window._user.user.icon
    });
    return false;
  });

  var id = parseInt(window.location.href.substr(window.location.href.indexOf('#') + 1), 10);
  
  /*var data_total = {"data": [{"number": 3, "type": "TICKET", 
  "user": {"admission_date": "2010-08-18", "email": "", "icon": "/images/user/56/icon/e79f4634-d777-11e4-8ac7-00163e002e66.jpg",
      "id": 56, "major": "\u767b\u673a\u53e3", "name": "\u738b\u5fd7\u6587", "nickname": "\u56fd\u753b\u5bb6", "phone": "18601251927", 
      "roles": [{"description": "normal user", "name": "USER"}], 
      "sex": "MALE", 
      "university": {"city": "\u5317\u4eac\u5e02", "id": 1, "name": "\u4e2d\u592e\u6c11\u65cf\u5927\u5b66", "province": "\u5317\u4eac\u5e02"}
      }
  },{"number": 3, "type": "TICKET", 
  "user": {"admission_date": "2010-08-18", "email": "", "icon": "/images/user/56/icon/e79f4634-d777-11e4-8ac7-00163e002e66.jpg",
      "id": 56, "major": "\u767b\u673a\u53e3", "name": "\u738b\u5fd7\u6587", "nickname": "\u56fd\u753b\u5bb6", "phone": "18601251927", 
      "roles": [{"description": "normal user", "name": "USER"}], 
      "sex": "MALE", 
      "university": {"city": "\u5317\u4eac\u5e02", "id": 1, "name": "\u4e2d\u592e\u6c11\u65cf\u5927\u5b66", "province": "\u5317\u4eac\u5e02"}
      }
  },{"number": 3, "type": "TICKET", 
  "user": {"admission_date": "2010-08-18", "email": "", "icon": "/images/user/56/icon/e79f4634-d777-11e4-8ac7-00163e002e66.jpg",
      "id": 56, "major": "\u767b\u673a\u53e3", "name": "\u738b\u5fd7\u6587", "nickname": "\u56fd\u753b\u5bb6", "phone": "18601251927", 
      "roles": [{"description": "normal user", "name": "USER"}], 
      "sex": "MALE", 
      "university": {"city": "\u5317\u4eac\u5e02", "id": 1, "name": "\u4e2d\u592e\u6c11\u65cf\u5927\u5b66", "province": "\u5317\u4eac\u5e02"}
      }
  }], "status": "success"};
  window.items = [];
  for (var i = 0; i < data_total.data.length; i++) {
    var u = data_total.data[i].user;
    if (u) {
      window.items.push({
        ticketNum: data_total.data[i].number,
        number: u.id,
        name: u.nickname,
        avatar: u.icon
      });
    }
  }

  iTurntable(window.items);*/
  //'/api/lotteries/' + id + '/draw_lots_users' 该接口返回设定范围内的抽奖人员数组
  $.get('/api/lotteries/' + id + '/draw_lots_users', function (data) {
    window.items = [];
    for (var i = 0; i < data.data.length; i++) {
      var u = data.data[i].user;
      if (u) {
        window.items.push({
          ticketNum: data.data[i].number,
          number: u.id,
          name: u.nickname,
          avatar: u.icon
        });
      }
    }

    iTurntable(window.items);
  }, 'json');
  /*var draw_data = {"data": {"create_time": 1444974518000,"exchange_end_time": 1444888200000,"id": 59,"lottery_plugin_id": 71,"name": "一等奖",
  "scope_id": 10,"state": true,"total": 2,"update_time": 1444974579000,"update_user_id": 15}, "status": "success"};
  var draw_type;
  if (draw_data.scope_id === 10) {
    draw_type = '（电子票）';
  } else if (draw_data.scope_id === 9) {
    draw_type = '（签到）';
  } else {
    draw_type = '（投票）';
  }
  var draw = '<div class="lotterieName"><font class="name">'+draw_data.data.name+'</font><br/><font class="type">'+draw_type+'</font></div>';
  $('#lotterieName').html(draw);
  //声明定义函数
  (function () {
    var h = '';
    for (var i = 0; i < draw_data.data.total; i++) {
      h = h + '<div class="item null"><div class="avatar"></div><span></span></div>';
    }
    $('#lotterieNotice').html(h);
  })();

  // 渲染头
  (function () {
    $('.warp').css({top: $('.header .notice').height() + 'px'});
  })();
  loaderHide();*/
  $.getJSON('/api/auth/refreshtoken', function (data) {
    window.auth_token = data.data.auth_token;
    //'/api/lotteries/' + id 该接口返回进行开奖的奖项信息
    $.ajax({
      type: 'GET',
      url: '/api/lotteries/' + id,
      headers: {
        'Authentication-Token': data.data.auth_token
      },
      dataType: 'json',
      success: function (data) {
        if (data.status === 'error') {
          var msg = data.message;
          window.alert(msg);
          return;
        }
        var draw_data = data;
        var draw_type;
        if (draw_data.data.scope_id === 10) {
          draw_type = '（电子票）';
        } else if (draw_data.data.scope_id === 9) {
          draw_type = '（签到）';
        } else {
          draw_type = '（投票）';
        }
        //奖项id
        awards_id = draw_data.data.id;
        console.log('删除接口需要的奖项id：'+awards_id);
        var draw = '<div class="lotterieName"><font class="name">'+draw_data.data.name+'</font><br/><font class="type">'+draw_type+'</font></div>';
        $('#lotterieName').html(draw);
        //声明定义函数
        (function () {
          var h = '';
          for (var i = 0; i < draw_data.data.total; i++) {
            h = h + '<div class="item null"><div class="avatar"></div><span></span></div>';
          }
          $('#lotterieNotice').html(h);
        })();

        // 渲染头
        (function () {
          $('.warp').css({top: $('.header .notice').height() + 'px'});
        })();
        loaderHide();
      }
    });
  });
  
});
