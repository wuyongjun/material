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

  var $el = $('#items');

  var _read = function (item) {
    if (item.is_display) {
      $el.prepend('<div id="i-' + item.id + '" class="item clearfix" style="display:none"><img src="' + item.avatar + '"><div class="info"><h3>' + item.name + ':</h3><p>' + item.content + '</p></div></div>');

      var $items = $el.find('.item');
      if ($items.length > 30) {
        $items.each(function (i) {
          if (i > 30) {
            $items.eq(i).remove();
          }
        });
      }

      $items.eq(0).slideDown('slow',function(){
        $items.eq(0).addClass('show');
      });
    } else {
      $el.find('#i-' + item.id).remove();
    }
  };

  // window._dt = new Date(new Date().getTime() - 10 * 1000).Format('yyyy-MM-dd hh:mm:ss');
  window._dt = null;
  window.id = parseInt(window.location.href.substr(window.location.href.indexOf('#') + 1), 10);

  var rc = function () {
    var url = '/api/activities/' + window.id + '/comments/on/screen';
    if (window._dt) {
      url += '?end_time=' + window._dt;
    }
    //测试数据
    // var data = {"data": [{"activity_id": 280, "comment_detail": {"content": "234", "create_time": 1430117732000, "id": 533, "images": [], "is_display": true, "like_count": 0, "liked": false, "replies": [], "title": "PLACEHOLDER", "user": {"admission_date": "1235836800000", "email": "htd_offer@163.com", "icon": "/images/user/10/icon.jpg", "id": 10, "major": "\u5929\u5929", "managed_community": {"description": "\u97f3\u4e50\u5982\u661f\u5b50\u4e00\u6837\u660e\u4eae\u548c\u7eaf\u51c0\uff0c\u4e00\u628a\u5409\u4ed6\uff0c\u51e0\u4e2a\u670b\u53cb\uff0c\u4e00\u676f\u9152\uff0c\u5c31\u6709\u5fc3\u4e8b\u8bc9\u5c3d\u7684\u8f7b\u677e\uff0c\u5c31\u6709\u62e5\u62b1\u89e3\u653e\u7684\u8d44\u683c\u3002\\r\\n\u5728\u8fd9\u91cc\uff0c\u81ea\u7531\u5e76\u4e0d\u662f\u6c89\u5bc2\u5728\u9ed1\u6d1e\u91cc\u9759\u9ed8\u9065\u8fdc\u7684\u56e0\u5b50\uff0c\u800c\u662f\u4f60\u6211\u8eab\u8fb9\u73af\u7ed5\u7684\u7a7a\u6c14\u3002\\r\\n\u5728\u8fd9\u91cc\uff0c\u6bcf\u4e2a\u4eba\u90fd\u662f\u8000\u773c\u7684\u3002\\r\\n\u52a0\u5165\u6211\u4eec\uff0c\u6253\u7834\u5e73\u5eb8\u3002", "enable_register": true, "id": 3, "logo": "/images/community/3/logo/e81ad6f0-dea2-11e4-8ac7-00163e002e66.jpg", "name": "\u4e2d\u592e\u6c11\u65cf\u5927\u5b66\u5409\u5b83\u534f\u4f1a", "university": {"city": "\u5317\u4eac\u5e02", "id": 1, "name": "\u4e2d\u592e\u6c11\u65cf\u5927\u5b66", "province": "\u5317\u4eac\u5e02"}}, "name": "Kiddie", "nickname": "Idiot", "phone": "13888888888", "photo_id": "/images/user/10/photo_id.jpg", "roles": [{"description": "community admin", "name": "ADMIN"}, {"description": "normal user", "name": "USER"}], "sex": "MALE", "university": {"city": "\u5317\u4eac\u5e02", "id": 1, "name": "\u4e2d\u592e\u6c11\u65cf\u5927\u5b66", "province": "\u5317\u4eac\u5e02"}}}, "create_time": 1430117777000, "id": 113, "is_display": true, "update_time": 1430118202000}], "status": "success"};
    $.get(url, function (data) {
      for (var i = 0; i < data.data.length; i++) {
        var d = data.data[i];
        //根据角色数组判断爆料信息是社团还是用户发的，从而显示不同的爆料人信息
        var roles = d.comment_detail.user.roles;
        var roles_len = roles.length;
        //爆料内容对象
        var item = {
          id: d.comment_detail.id,
          avatar: d.comment_detail.user.icon,
          name: d.comment_detail.user.name || d.comment_detail.user.nickname,
          content: d.comment_detail.content,
          is_display: d.comment_detail.is_display
        };
        for (var j = 0; j < roles_len; j++) {
          var role = roles[j];
          if (role.name === 'ADMIN') {
            item.avatar = d.comment_detail.user.managed_community.logo;
            item.name = d.comment_detail.user.managed_community.name;
            break;
          }
        }
        _read(item);
        window._dt = new Date(d.update_time).Format('yyyy-MM-dd hh:mm:ss');
      }
    }, 'json');
  };

  rc();
  window.setInterval(function () {
    rc();
  }, 3000);
});
