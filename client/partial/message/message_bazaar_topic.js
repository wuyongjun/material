angular.module('iwx')
	.controller('MesBazTopicCtrl', function ($scope, $http, $rootScope, $stateParams, $modal, eventType) {
		$scope.messages = [];
	    $scope.load_btn_content = '加载更多消息';
	    $scope.load_more_btn = false;
	    var messageSet = {};
	    $scope.messageStatus = {
	        'NEW': '未查看',
	        'READ': '已查看'
	    };
	    var current_page = 1;
	    //获取主题信息
	    var loadTopic = function (topic_id) {
	    	$http.get('/api/admin/bazaar/' + topic_id)
	    		.success(function (data) {
	    			$scope.topic = data;
	    			if (data.images.length !== 0) {
	    				$scope.items = data.images;
	    			}
	    		});
	    };
	    loadTopic($stateParams.id);
	    var loadMessages = function(page) {
	      $http.get('/api/admin/bazaar/message/' + $stateParams.id + '/' + $stateParams.user_id + '/list?page=' + page + '&per_page=10')
	      	.success(function (data) {
	        if (data.items.length === 0) {
	            $scope.load_btn_content = '已经加载全部信息';
	            $scope.load_more_btn = true;
	            return; 
	        }
	        //重新调用人员和主题接口
			$rootScope.$broadcast('bazaarEvent');
	        var added = 0;
	        angular.forEach(data.items, function(value) {
	            if (!(value.id in messageSet)) {
	                messageSet[value.id] = true;
	                $scope.messages.push(value);
	                added++;
	            }
	        });
	        if (added === 0) {
	            loadMessages(++current_page);
	        }
	      });
	    };
	    loadMessages(current_page);
	    $scope.loadMore = function() {
	        loadMessages(++current_page);
	    };
	    $scope.send = function() {
	        if (!$scope.content) { return; }
	        $http.post('/api/admin/bazaar/message/' + $stateParams.id + '/send', {
	            'content': $scope.content,
	            'user_id': $stateParams.user_id
	        }).success(function(data) {
	            messageSet[data.id] = true;
	            $scope.messages.unshift(data);
	        });
	        $scope.content = '';
	    };
	    $scope.viewImage = function(image) {
	        try {
	            var tempArr = image.split('/');
	            if (tempArr[tempArr.length - 1] === 'placeholder.png') {
	                return;
	            }
	          // console.log(tempArr);
	        } catch (e) {
	            $rootScope.$emit(eventType.NOTIFICATION, {
	                'type': 'POPMSG',
	                'title': '警告',
	                'message': '图片路径不正确'
	            });
	            return;
	        }
	        $modal.open({
	            template: '<div><img style="width:100%" src=' + image + '></div>',
	            size: "lg",
	        });
	    };
	});