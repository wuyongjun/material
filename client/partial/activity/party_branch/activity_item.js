angular.module('iwx')
	.controller('PartyActItemCtrl', function ($scope, $http, $modal, $state, $stateParams, $rootScope, $filter, eventType, $window) {
		$scope.page = $stateParams.page;
		$scope.plugins_config = {
			discuss: {
				'id':'discuss',
				'name':'线上讨论',
				'icon_path':'/static/images/timeline_new.png',
				'note':'不必再协调所有人的时间，再没有场地的限制，在线讨论，随时随地。'
			},
			political_sign_in: {
				'id':'political_sign_in',
				'name':'活动签到',
				'icon_path':'/static/images/sign_in_new.png',
				'note':'支持线上签到和线下签到，根据所需要的数据精准度，自由选择签到模式。'
			}
		};
		//验证正则表达式
		$scope.content_regexp = /^[\u4e00-\u9fa5_\x21-\x7e_\u0b7-\uff1f_\s]{0,20}$|^[\w\s_\x21-\x7e]{0,40}$/;
		$scope.sub_regexp = /^[\u4e00-\u9fa5_\x21-\x7e_\u0b7-\uff1f_\s]{0,25}$|^[\w\s_\x21-\x7e]{0,50}$/;
		$scope.loc_regexp = /^[\u4e00-\u9fa5_\x21-\x7e_\u0b7-\uff1f_\s]{0,15}$|^[\w\s_\x21-\x7e]{0,30}$/;
		//活动id political_show为1==true表示仅党支部可见
		$scope.editingActivityId = parseInt($stateParams.id);
		$scope.activity = {
			'id': $scope.editingActivityId,
			'political_show': 'all'
		};
		//选择活动可见范围
		$scope.getCheckedRange = function (political_show) {
			$scope.activity.political_show = political_show;
		};
		//获取活动信息
		if ($scope.editingActivityId !== -1) {
			$http.get('/api/admin/activities/' + $scope.editingActivityId)
				.success(function (data) {
					/*data = {id: 272, subject: '由 Microsoft Edge 创建', content: '<blockquote><div><i>卓越法律人才培养/div>', published: true,
							start_time: 1420095480000, end_time: 1442079600000, location: '人民大会堂河北厅', range: 'ALL',
							poster: '/images/activity/336/poster/1a74563a-419f-11e5-8ac7-00163e002e66.jpg',
							plugins: [{
								id: 'discuss', name: '线上讨论', enabled: true,
								preview: {}},{id: 'political_sign_in', name: '活动签到', enabled: true, preview: {
									community_logo: "/images/community/3/logo/e81ad6f0-dea2-11e4-8ac7-00163e002e66.jpg",
									end_time: 1437847980000, has_signed_in: false, id: 79, sponsor_logo: "/images/images/placeholder.png",
									sponsor_name: "黄焖鸡"
								}}]
							};*/
					$scope.activity = data;
					if ($scope.activity.political_show) {
						$scope.activity.political_show = 'party';
					} else {
						$scope.activity.political_show = 'all';
					}
					$scope.act_plugin = [];

					if ($scope.activity.plugins && $scope.activity.plugins.length > 0) {
						for (var i=0;i<$scope.activity.plugins.length;i++) {
							var temp_plugin = $scope.activity.plugins[i];
							temp_plugin['icon_path'] = $scope.plugins_config[temp_plugin.id].icon_path;
							$scope.act_plugin.push(temp_plugin);
						}
					}
				});
		}
		//获取所有插件
		if ($scope.editingActivityId !== -1) {
			$http.get('/api/plugins')
				.success(function(data) {
					/*data = [{id: 'discuss', name: '线上讨论', enabled: true},
							{id: 'political_sign_in', name: '活动签到', enabled: true}];*/
					var tempArr = [];
					for (var i=0;i<data.length;i++) {
						var temp = $scope.plugins_config[data[i].id];
						tempArr.push(temp);
					}
					$scope.plugins = tempArr;
				});
		}
		//是否发布活动
		$scope.isPublishActivity = function (id, isPublish, page) {
			var url = '';
			if (isPublish) {
				url = '/api/admin/activities/' + id + '/unpublish';
			} else {
				url = '/api/admin/activities/' + id + '/publish';
			}
			$http.post(url)
				.success(function (data) {
					if (isPublish) {
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type': 'POPMSG',
							'title': '消息',
							'message': '取消发布成功'
						});
					} else {
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type': 'POPMSG',
							'title': '消息',
							'message': '发布成功'
						});
					}
					$state.go('party_act_item', {id: id, currentPage: page}, {reload: true}); 
				});
		};
		//删除活动
		$scope.delete = function() {
			if ($scope.editingActivityId !== -1) {
				$http.delete('/api/admin/activities/' + $scope.editingActivityId)
					.success(function() {
						$state.go('party_act_list', {currentPage: 1});
					});
			} else {
				$state.go('party_act_list', {currentPage: 1});
			}
		};
		$scope.removeHtmlTag = function (str) {
			str = str.replace(/<\/?[^>]*>/g,''); //去除HTML tag
			str = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
			str=str.replace(/&nbsp;/ig,'');//去掉&nbsp;
			return str;
		};
		//保存活动
		$scope.saveActivity = function () {
			try {
	            if (typeof($scope.activity.start_time) === 'number') {
	                $scope.activity.start_time = $filter('date')($scope.activity.start_time, 'yyyy-MM-dd HH:mm');
	            }
	            if (typeof($scope.activity.end_time) === 'number') {
	                $scope.activity.end_time = $filter('date')($scope.activity.end_time, 'yyyy-MM-dd HH:mm');
	            }
	            var stTime = new Date($scope.activity.start_time.replace(/-/g,"/"));
	            var endTime = new Date($scope.activity.end_time.replace(/-/g,"/"));
	            if(Date.parse(stTime) > Date.parse(endTime)) {
	                $rootScope.$emit(eventType.NOTIFICATION, {
	                    'type': 'POPMSG',
	                    'title': '警告',
	                    'message': '结束时间必须在开始时间之后'
	                });
	                return;
	            }
	        } catch (e) {
	            $rootScope.$emit(eventType.NOTIFICATION, {
	                'type': 'POPMSG',
	                'title': '警告',
	                'message': '请正确选择活动时间'
	            });
	            return;
	        }
	        if (!$scope.activity.location || !$scope.activity.content || !$scope.activity.subject) {
	            $rootScope.$emit(eventType.NOTIFICATION, {
	                'type': 'POPMSG',
	                'title': '警告',
	                'message': '请填写完整，其中活动主题、活动地点和活动内容为必填项！'
	            });
	            return;
	        }
	        //限制字数提示
	        if (!$scope.sub_regexp.test($scope.activity.subject)) {
	            $rootScope.$emit(eventType.NOTIFICATION, {
	                'type': 'POPMSG',
	                'title': '警告',
	                'message': '活动主题请限制在25个汉字以内！'
	            });
	            return;
	        }
	        if (!$scope.loc_regexp.test($scope.activity.location)) {
	            $rootScope.$emit(eventType.NOTIFICATION, {
	                'type': 'POPMSG',
	                'title': '警告',
	                'message': '活动地点请限制在15个汉字以内！'
	            });
	            return;
	        }
	        if ($scope.activity.members && !$scope.content_regexp.test($scope.activity.content)) {
	            $rootScope.$emit(eventType.NOTIFICATION, {
	                'type': 'POPMSG',
	                'title': '警告',
	                'message': '活动口号请限制在20个汉字以内！'
	            });
	            return;
	        }
	        //活动内容
	        var contentText = $scope.removeHtmlTag($scope.activity.content);
	        if (contentText.length > 2000) {
	            $rootScope.$emit(eventType.NOTIFICATION, {
	                'type': 'POPMSG',
	                'title': '警告',
	                'message': '“' + contentText.substring(1990, 2000) + '...”之后的内容超过了2000字数限制！'
	            });
	            return;
	        }
	        //设置图片宽高
	        $scope.activity.content = $scope.activity.content.replaceAll('<img', '<img width="480px" height="320px"');
	        //设置可见范围
	        if ($scope.activity.political_show === 'all') {
	        	$scope.activity.political_show = false;
	        } else {
	        	$scope.activity.political_show = true;
	        }
	        console.log($scope.activity);
			if ($scope.editingActivityId === -1) {
				$http.post('/api/admin/activities')
					.success(function (id) {
						$scope.editingActivityId = id;
						var fd = new FormData();
						angular.forEach($scope.activity, function (value, key) {
							fd.append(key, value);
						});
						$http.post('/api/admin/activities/' + $scope.editingActivityId, fd, {
							transformRequest: angular.identity,
							headers: {
								'Content-Type': undefined
							}
						}).success(function (data) {
							$scope.activity = data;
							$rootScope.$emit(eventType.NOTIFICATION, {
								'type': 'POPMSG',
								'title': '消息',
								'message': '保存成功'
							});
							$state.go('party_act_list', { 'page': 1 });
						});
					});
			} else {
				var fd = new FormData();
				angular.forEach($scope.activity, function (value, key) {
					fd.append(key, value);
				});
				$http.post('/api/admin/activities/' + $scope.editingActivityId, fd, {
					transformRequest: angular.identity,
					headers: {
						'Content-Type': undefined
					}
				}).success(function (data) {
					if (data.political_show) {
						data.political_show = 'party';
					} else {
						data.political_show = 'all';
					}
					$scope.activity = data;
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type': 'POPMSG',
						'title': '消息',
						'message': '更新成功'
					});
					$state.go('party_act_item', { 'currentPage': 1 });
				});
			}
		};
		//添加插件
		$scope.addPlugin = function (plugin_id) {
			if ($scope.activity && $scope.activity.id && $scope.activity.id !== -1) {
				var url = '/api/admin/activities/' + $scope.activity.id + '/plugins';
				console.log(plugin_id);
				$http.post(url, {
					'plugin_id': plugin_id
				}).success(function(data) {
					$scope.activity = data;
					$scope.act_plugin = [];
					angular.forEach(data.plugins, function (value) {
						value['icon_path'] = $scope.plugins_config[value.id].icon_path;
						$scope.act_plugin.push(value);
					});
					//添加插件完成后直接打开新添加的插件页面
					$state.go('party_act_item.' + plugin_id + '_plugin');
				});
			}
		};
		//添加“更多功能”，打开modal窗体，显示要添加的插件
		$scope._addPlugin = function (plugin_id) {
			var arr_temp_plugins = $scope.removeExistPlugin($scope.plugins, $scope.activity.plugins);
			if (arr_temp_plugins.length === 0) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '消息',
					'message': '提供的所有功能都已添加'                    
				});
			} else {
				var plugins_alivable = arr_temp_plugins;
				$modal.open({
					templateUrl: 'partial/activity/party_branch/plugins/add_plugin.html',
					controller: 'AddPartyPlugin',
					resolve: {
						party_act: function () {
							return $scope.activity;
						},
						party_plu_a: function () {
							return plugins_alivable;
						}
					}
				});
			}
		};
		$scope.$on('addPartyPlugin', function (event, data) {
			var plugin_id = data;
			$scope.addPlugin(plugin_id);
		});
		//去掉已添加的插件
		$scope.removeExistPlugin = function (arr1, arr2) {
			var arr3 = [];
			var len_arr1 = arr1.length;
			var len_arr2 = 0;
			if (arr2) {
				len_arr2 = arr2.length;
			}
			for (var i=0;i<len_arr1;i++) {
				var flag = true;
				for (var j=0;j<len_arr2;j++) {
					if (arr1[i].id === arr2[j].id) {
                        flag = false;
					}
				}
				if (flag) {
					arr3.push(arr1[i]);
				}
			}
			return arr3;
		};
		//replace all string
		String.prototype.replaceAll = function (targetText, replaceText) {
			return this.replace(new RegExp(targetText, 'gm'), replaceText);
		};
	});