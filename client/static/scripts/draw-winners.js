$(function () {
  //抽奖类型map
  var lottary_type = {
    '持电子票入场人员': '电子票',
    '签到人员': '签到',
    '投票人员': '投票'
  };
  var id = parseInt(window.location.href.substr(window.location.href.indexOf('#') + 1), 10);
  
  //显示一个奖项获奖人名单
  var showLottaryList = function (winner_list) {
    var $draw_winner = $('.draw-winner');
    var $row = $('<div class="row"></div>');
    var $award = $('<div class="col-md-2"></div>');
    var $next_row = $('<div class="row"></div>');
    //定义计数器
    var count_col = 1;
    //添加奖项信息
    $award.append('<div class="title"><font>' + winner_list.name + 
      '</font><br/><font size="5">（' + lottary_type[winner_list.scope_type] + '）</font></div>');
    $row.append($award);
    $draw_winner.append($row);
    //添加中奖人
    for (var i = 0;i < winner_list.win_users.length;i++) {
      var winner = winner_list.win_users[i];
      if (winner_list.scope_type === '投票人员') {
        winner.number = '';
      } else{
        winner.number = 'No.' + winner.number;
      }
      if (i < 2) {
        $row.append('<div class="col-md-4">'+
          '<div class="col-md-1"><img class="photo" src="../../images/' + winner.icon + '"></div>'+
          '<div class="col-md-11"><span class="winner">&nbsp;<font>' + winner.number +
          '</font>&nbsp;<font>' + winner.nickname + '</font></span></div>'+
          '</div>');
      } else {
        if (count_col < 3) {
          if (count_col === 1) {
            var $column_first = $('<div class="col-md-4 col-md-offset-2">'+
              '<div class="col-md-1"><img class="photo" src="../../images/' + winner.icon + '"></div>'+
              '<div class="col-md-11"><span class="winner">&nbsp;<font>' + winner.number +
              '</font>&nbsp;<font>' + winner.nickname + '</font></span></div></div>');
            $next_row.append($column_first);
            $next_row.after($('<br/>'));
            $draw_winner.append($next_row);
          } else {
            var $column_second = $('<div class="col-md-4">'+
              '<div class="col-md-1"><img class="photo" src="../../images/' + winner.icon + '"></div>'+
              '<div class="col-md-11"><span class="winner">&nbsp;<font>' + winner.number +
              '</font>&nbsp;<font>' + winner.nickname + '</font></span></div></div>');
            $next_row.append($column_second);
            if (i !== winner_list.win_users.length - 1) {
              $next_row.after($('<br/>'));
            }
          }
        }
        if (count_col === 2) {
          count_col = 1;
          $next_row = $('<div class="row"></div>');
          continue;
        }
        count_col++;
      }
    }
    $draw_winner.append($('<br/><br/>'));
  };
  
  //请求数据
  /*$.getJSON('/api/auth/refreshtoken', function (data) {
    window.auth_token = data.data.auth_token;
    
  });*/
  $.ajax({
      type: 'GET',
      url: '/api/lotteries/' + id + '/result',
      dataType: 'json',
      success: function (data) {
        //数据模板
        /*var data = {data:[
          {'id': 9,'name': '一等奖', 'scope_type': '持电子票入场人员', 'win_users':[
            {'id': 65,'number': '004', 'nickname': '黄晓明', 'icon': '/static/images/sign_in_example.PNG'}
          ]},{'id': 9,'name': '二等奖', 'scope_type': '签到人员', 'win_users':[
            {'id': 65,'number': '004', 'nickname': '黄晓明', 'icon': '/static/images/sign_in_example.PNG'},
            {'id': 65,'number': '004', 'nickname': '黄晓明', 'icon': '/static/images/sign_in_example.PNG'},
            {'id': 65,'number': '004', 'nickname': '黄晓明', 'icon': '/static/images/sign_in_example.PNG'}
          ]},{'id': 9,'name': '三等奖', 'scope_type': '投票人员', 'win_users':[
            {'id': 65,'number': '004', 'nickname': '黄晓明', 'icon': '/static/images/sign_in_example.PNG'},
            {'id': 65,'number': '004', 'nickname': '黄晓明', 'icon': '/static/images/sign_in_example.PNG'},
            {'id': 65,'number': '004', 'nickname': '黄晓明', 'icon': '/static/images/sign_in_example.PNG'},
            {'id': 65,'number': '004', 'nickname': '黄晓明', 'icon': '/static/images/sign_in_example.PNG'},
            {'id': 65,'number': '004', 'nickname': '黄晓明', 'icon': '/static/images/sign_in_example.PNG'}
          ]}
        ], status: 'success'};*/
        console.log(data);
        //判断数据状态，弹框给予提示
        if (data.status === 'success') {
          for (var i = 0;i < data.data.length;i++) {
            showLottaryList(data.data[i]);
          }
        } else {
          window.alert(data.message);
        }
      }
    });
});