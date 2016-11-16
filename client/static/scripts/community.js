$(function () {
	/**高斯模糊算法*/
	var gaussBlur_single = function (imgData,radius, sigma) {
		console.log(imgData);
		var pixes = imgData.data;
	    var width = imgData.width;
	    var height = imgData.height;
	    var gaussMatrix = [],
	        gaussSum = 0,
	        x, y,
	        r, g, b, a,
	        i, j, k, len;
	    radius = Math.floor(radius) || 3;
	    sigma = sigma || radius / 3;
	    a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
	    b = -1 / (2 * sigma * sigma);
	    //生成高斯矩阵
	    for (i = 0, x = -radius; x <= radius; x++, i++){
	        g = a * Math.exp(b * x * x);
	        gaussMatrix[i] = g;
	        gaussSum += g;
	    }
	    console.log(gaussMatrix);
	    //归一化, 保证高斯矩阵的值在[0,1]之间
	    for (i = 0, len = gaussMatrix.length; i < len; i++) {
	        gaussMatrix[i] /= gaussSum;
	    }
	    //x 方向一维高斯运算
	    for (y = 0; y < height; y++) {
	        for (x = 0; x < width; x++) {
	            r = g = b = a = 0;
	            gaussSum = 0;
	            for(j = -radius; j <= radius; j++){
	                k = x + j;
	                if(k >= 0 && k < width){//确保 k 没超出 x 的范围
	                    //r,g,b,a 四个一组
	                    i = (y * width + k) * 4;
	                    r += pixes[i] * gaussMatrix[j + radius];
	                    g += pixes[i + 1] * gaussMatrix[j + radius];
	                    b += pixes[i + 2] * gaussMatrix[j + radius];
	                    gaussSum += gaussMatrix[j + radius];
	                }
	            }
	            i = (y * width + x) * 4;
	            // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
	            pixes[i] = r / gaussSum;
	            pixes[i + 1] = g / gaussSum;
	            pixes[i + 2] = b / gaussSum;
	        }
	    }
	    //y 方向一维高斯运算
	    for (x = 0; x < width; x++) {
	        for (y = 0; y < height; y++) {
	            r = g = b = a = 0;
	            gaussSum = 0;
	            for(j = -radius; j <= radius; j++){
	                k = y + j;
	                if(k >= 0 && k < height){//确保 k 没超出 y 的范围
	                    i = (k * width + x) * 4;
	                    r += pixes[i] * gaussMatrix[j + radius];
	                    g += pixes[i + 1] * gaussMatrix[j + radius];
	                    b += pixes[i + 2] * gaussMatrix[j + radius];
	                    gaussSum += gaussMatrix[j + radius];
	                }
	            }
	            i = (y * width + x) * 4;
	            pixes[i] = r / gaussSum;
	            pixes[i + 1] = g / gaussSum;
	            pixes[i + 2] = b / gaussSum;
	        }
	    }
	    //end
	    imgData.data = pixes;
	    return imgData;
	};

	//社团id
	var comm_id = parseInt(window.location.href.substr(window.location.href.indexOf('#') + 1), 10);
	// var comm_id = 7;
	var windowW = $(window).width();
	var logoH = (windowW - 30)*0.25;
	//加载社团信息
	var img = document.getElementById('logo_img');
	var act_num = 0;
	//加载社团活动列表
	var curr_page = 1;
	var load_img_path = '/static/images/loading1.gif';
	var $load_act = $('<div class="loading"><font color="gray">下拉加载更多</font>&nbsp;&nbsp;<img class="load_img" src="' + load_img_path + '"></div>');
	var $finish_act = $('<div class="finish"><font color="gray">已经到底了~~</font></div>');
	//获取logo进行高斯模糊处理设置成背景图片
	var canvas_to_img = function (canvas) {
		var img = new Image();
		img.src = canvas.toDataURL('image/png');
		return img;
	};
	var set_logo_gauss = function () {
		var canvas = document.getElementById('logo_canvas');
		canvas.width = img.width;
		canvas.height = $('#comm_info').height();
		var context = canvas.getContext('2d');
		context.drawImage(img, -50, -50);
		var canvasData = context.getImageData(0, 0, canvas.width, canvas.height);
		var tempData = gaussBlur_single(canvasData, 50);
		context.putImageData(tempData, 0, 0);
		var image = canvas_to_img(canvas);
		$('#comm_info')
			.css('background', 'url('+image.src+')')
			.css('background-size', 'cover');
	};
	
	//展开社团简介
	$('#dep_btn').click(function () {
		$('#br').remove();
		$('.dep_content').css('display', 'block');
		$('.comm_shade').css('height', $('#comm_info').height());

	});
	//收起社团简介
	$('#up_btn_img').click(function () {
		$('#comm_logo_title').after($('<div id="br"><br/></div>'));
		$('.dep_content').css('display', 'none');
		$('.comm_shade').css('height', $('#comm_info').height());
	});
	//获取社团信息
	var get_comm_info = function () {
		$.ajax({
			url: '/api/communities/' + comm_id,
			type: 'GET',
			dataType: 'json',
			success: function (data) {
				console.log(data.logo);
				$('#web_title').html(data.data.name);
				$('#logo_img').attr('src', data.data.logo);
				$('#comm_title').html('<font>' + data.data.name + '</font>');
				$('#dep_content').html(data.data.description);
				console.log($('#comm_info').height());
				$('.comm_shade').css('height', $('#comm_info').height());
				if (img.complete) {
					console.log(img.complete);
					set_logo_gauss();
				} else {
					console.log(img.complete);
					img.onload = function () {
						set_logo_gauss();
					};
				}
			}
		});
	};
	get_comm_info();
	//获取社团活动列表
	var get_act_list = function (curr_page) {
		$.ajax({
			url: '/api/communities/' + comm_id + '/all?page=' + curr_page,
			type: 'GET',
			dataType: 'json',
			success: function (data) {
				var items = data.data.items;
				act_num = data.data.total;
				if (curr_page !== 1) {
					$load_act.css('display', 'none');
					if (items.length !== 0) {
						$('#comm_activty').append($('<div class="act_split"></div>'));
					}
				}
				$('#comm_act_title').html('<font>社团活动（' + act_num + '）</font>');
				for (var i = 0;i < items.length;i++) {
					var item = items[i];
					var $act_row = '<div class="act_row" onclick="to_act_share(' + item.id + ')">'+
						'<div class="post_div" style="background: url(' + item.poster + ');background-size: cover;">'+
				            '<img class="shade" src="/static/images/activity-sharing-gray.png">'+
				            '<div class="comm_act_subject">'+
				            	'<h4 class="title">' + item.subject + '</h4>'+
				            '</div>'+
				        '</div>'+
					'</div>';
					var $act_split = $('<div class="act_split"></div>');
					if (i !== items.length - 1) {
						$('#comm_activty')
							.append($act_row)
							.append($act_split);
					} else {
						$('#comm_activty')
							.append($act_row);
					}
				}
				$finish_act.remove();
				if (items.length !== 0) {
					$('#comm_activty').append($load_act);
				} else {
					$load_act.remove();
					if (curr_page !== 1) {
						$('#comm_activty').append($finish_act);
					}
				}
				//设置活动海报高度
				$('.post_div').css('height', windowW*0.94 / 1.8);
				$('.shade').css('height', windowW*0.94 / 1.8);
			}
		});
	};
	get_act_list(curr_page);
	//监控滚动条
	$(window).scroll(function () {
		//滚动条滚动高度
		var scrollH = $(this).scrollTop();
		//可见内容高度
		var clientH = $(this).height();
		//内容高度
		var offsetH = $('#container').get(0).scrollHeight;
		if (offsetH - clientH - scrollH === 0) {
			$load_act.css('display', 'block');
			console.log('已经到底了');
			get_act_list(++curr_page);
		}
	});
});
function to_act_share(id) {
	console.log(id);
	window.location.href = '/weixin/activities/'+id;
}