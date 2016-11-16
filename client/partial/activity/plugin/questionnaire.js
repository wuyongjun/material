angular.module('iwx')
	.controller('QuestionnaireCtrl', function ($scope, $http, $rootScope, eventType, $state, $modal, $filter, ngTableParams, userService) {
		//bootstrap toggle event
		$scope.$on('toggle:change', function (event, data) {
			$scope.question.answer_type = data;
		});
		//确认框信息
		$scope.confirm = {};
		$scope.confirm.title = '请确定您的操作';
		$scope.confirm.message = 'MESSAGE';
		$scope.confirm.type = '';
		$scope.confirm.param = '';
		$scope.update = false;
		//问卷对象
		$scope.questionnaire = {
			activity_id : $scope.$parent.activity.id,
		};
		//问题数组
		$scope.questions = [];
		//问题类型对照表
		$scope.question_type_table = {
			'RCQ' : 'single',
			'MCQ' : 'multiple',
			'SAQ' : 'short',
			'PUP' : 'upload'
		};
		$scope.answer_type_map = {
			'NORMAL' : 'normal',
			'OTHER' : 'other'
		};
		$scope.answer_type_hash = {
			'NORMAL' : '否',
			'OTHER' : '是'
		};
		//获取问题类型数组
		var getQuestionTypes = function () {
			$http.get('/api/questionnaires/rubric_type')
				.success(function (data) {
					$scope.typeArray = data;
				});
		};
		getQuestionTypes();
		var getSomeDay = function (date, count) {
			date.setDate(date.getDate() + count);
			return date;
		};
		// console.log($scope.$parent.activity);
		//根据活动id获取活动
		var getActivityById = function () {
			$http.get('/api/admin/activities/' + $scope.$parent.activity.id)
				.success(function (data) {
					$scope.activity = data;
					getActQuestionnaire();
				});
		};
		//获取活动的问卷插件
		var getActQuestionnaire = function () {
			$http.get('/api/questionnaires/' + $scope.$parent.activity.id + '/plugin')
				.success(function (data) {
					$scope.questionnaire = data;
					$scope.update = true;
					loadQuestions($scope.questionnaire.id);
					var gift_etime = [];
					angular.forEach(data.prizes, function (value) {
						gift_etime.push(value.goods.end_time);
					});
					// console.log(gift_etime);
					$scope.min_gift_etime = Math.min.apply(Math, gift_etime);
					// console.log($scope.min_gift_etime);
				})
				.error(function (data) {
					if (data) {
						userService.load().then(function (data) {
							console.log(data);
							var user = data;
							if (user.role.name === 'ADMIN' || user.role.name === 'USER') {
								$rootScope.$emit(eventType.NOTIFICATION, {
									'type' : 'POPMSG',
									'title' : '消息',
									'message' : '请编辑问卷详细内容。'
								});
								$scope.questionnaire.start_time = $scope.activity.start_time;
								$scope.questionnaire.end_time = $scope.activity.end_time;
								if ($scope.questionnaire.end_time) {
									var exchange_time = getSomeDay(new Date($scope.activity.end_time), 1).getTime();
									$scope.questionnaire.exchange_time = exchange_time;
								}
								$scope.update = false;
							} else {
								$rootScope.$emit(eventType.NOTIFICATION, {
									'type' : 'POPMSG',
									'title' : '消息',
									'message' : '该社团管理员未创建新的活动问卷。'
								});
							}
						});
					}
				});
		};
		userService.load(true).then(function () {
			getActivityById();
		});
		//操作确认框
		$scope.confirm = function () {
			if ($scope.confirm.type === 'pubQuestionnaire') {
				$http.post('/api/questionnaires/' + $scope.confirm.param + '/publish')
					.success(function (data) {
						$scope.questionnaire = data;
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type' : 'POPMSG',
							'title' : '消息',
							'message' : '恭喜，问卷发布成功。'
						});
					});
			} else if ($scope.confirm.type === 'finishQuestionnaire') {
				$http.post('/api/questionnaires/' + $scope.confirm.param + '/done')
					.success(function (data) {
						$state.go('activity_item.questionnaire_plugin', {}, {reload: true});
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type' : 'POPMSG',
							'title' : '消息',
							'message' : '成功结束该问卷。'
						});
					});
			} else if ($scope.confirm.type === 'delQuestionnaire') {
				$http.delete('/api/questionnaires/' + $scope.confirm.param + '/del')
					.success(function (data) {
						$state.go('activity_item.questionnaire_plugin', {}, {reload: true});
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type' : 'POPMSG',
							'title' : '消息',
							'message' : '成功删除该问卷。'
						});
					});
			} else if ($scope.confirm.type === 'removeQuestion') {
				$http.delete('/api/questionnaires/rubric/' + $scope.confirm.param + '/del')
					.success(function (data) {
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type' : 'POPMSG',
							'title' : '消息',
							'message' : '问题删除成功。'
						});
						//重新加载问题分页列表
						// $state.go('activity_item.questionnaire_plugin', {}, {reload: true});
						$scope.tableParams.reload();
					});
			} else if ($scope.confirm.type === 'delCertificate') {
				$http.delete('/api/questionnaires/' + $scope.confirm.params.questionnaire_id + 
						'/del/' + $scope.confirm.params.certificate_id + '/prize')
					.success(function (data) {
						$state.go('activity_item.questionnaire_plugin', {},{reload: true});
					});
			}
		};
		//定义一个初始化问题
		$scope.question = {
			rubric_type: 'RCQ',
			rubric: '',
			answers: [],
			answer_type: 'OTHER'
		};
		//验证问题
		var validateQuestion = function (data, flag) {
			if (!data.rubric || data.rubric.length > 100) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type' : 'POPMSG',
					'title' : '警告',
					'message' : '请填写问题内容，并且内容不超过100个字符。'
				});
				return false;
			}
			if (data.rubric_type === 'single' || data.rubric_type === 'multiple') {
				if (flag === 'add') {
					if (data.answer.length === 0) {
						$rootScope.$emit(eventType.NOTIFICATION, {
							'type' : 'POPMSG',
							'title' : '警告',
							'message' : '请添加单选或多选问题的选项。'
						});
						return false;
					} else {
						return loop(data.answer);
					}
				} else {
					if (data.answer.add) {
						if (data.answer.add.length === 0 && data.answers.length === 0) {
							$rootScope.$emit(eventType.NOTIFICATION, {
								'type' : 'POPMSG',
								'title' : '警告',
								'message' : '请添加单选或多选问题的选项。'
							});
							return false;
						} else {
							if (data.answer.add.length === 0) {
								return true;
							} else {
								return loop(data.answer.add);
							}
						}
					} else {
						if (data.answers.length === 0) {
							$rootScope.$emit(eventType.NOTIFICATION, {
								'type' : 'POPMSG',
								'title' : '警告',
								'message' : '请添加单选或多选问题的选项。'
							});
							return false;
						}
					}
				}
				
			}
			return true;
		};
		var loop = function (data) {
			console.log(data);
			for (var j = 0; j < data.length; j++) {
				if (data[j] === '' || data[j].length > 50) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type' : 'POPMSG',
						'title' : '警告',
						'message' : '请填写选项内容，并且内容不超过50个字符。'
					});
					return false;
				}
			}
			return true;
		};
		//添加问题
		$scope.addQuestion = function () {
			var params_add = {};
			params_add['rubric_type'] = $scope.question_type_table[$scope.question.rubric_type];
			params_add['rubric'] = $scope.question.rubric;
			if ($scope.question.rubric_type === 'RCQ' || $scope.question.rubric_type === 'MCQ') {
				params_add['answer_type'] = $scope.answer_type_map[$scope.question.answer_type];
				params_add['answer'] = $scope.question.answers;
			} else {
				params_add['answer_type'] = 'normal';
			}
			if (!validateQuestion(params_add, 'add')) {
				return;
			}
			console.log(params_add);
			$http.post('/api/questionnaires/' + $scope.questionnaire.id + '/add/rubric', params_add, {
				'headers' : {
					'Content-Type' : 'application/json'
				}
			}).success(function (data) {
				// console.log(data);
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type' : 'POPMSG',
					'title' : '消息',
					'message' : '问题添加成功。'
				});
				$state.go('activity_item.questionnaire_plugin', {}, {reload: true});
				// $scope.tableParams.reload();
			});
		};

		//修改问题
		$scope.updateQuestion = function (rubric) {
			var params_upd = {};
			params_upd['rubric_type'] = $scope.question_type_table[rubric.rubric_type];
			params_upd['rubric'] = rubric.rubric;
			params_upd['answers'] = rubric.answers;
			if (rubric.rubric_type === 'RCQ' || rubric.rubric_type === 'MCQ') {
				console.log('rubric.answer_type:'+rubric.answer_type);
				params_upd['answer_type'] = $scope.answer_type_map[rubric.answer_type];
				params_upd['answer'] = {};
				params_upd['answer']['add'] = rubric.newOptions;
				params_upd['answer']['delete'] = rubric.delOption;
			} else {
				params_upd['answer_type'] = 'normal';
			}
			if (!validateQuestion(params_upd, 'update')) {
				return;
			}
			console.log(params_upd);
			$http.put('/api/questionnaires/rubric/' + rubric.id + '/update', params_upd, {
				'headers' : {
					'Content-Type' : 'application/json'
				}
			}).success(function (data) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type' : 'POPMSG',
					'title' : '消息',
					'message' : '问题修改成功。'
				});
				//重新加载问题分页列表
				// $state.go('activity_item.questionnaire_plugin', {}, {reload: true});
				$scope.tableParams.reload();
			});
		};
		//删除问题
		$scope.removeQuestion = function (rubric_id) {
			$scope.confirm.type = 'removeQuestion';
			$scope.confirm.message = '您确定要删除该问题吗？';
			$scope.confirm.param = rubric_id;
			$('#confirm').modal();
			return;
		};
		//添加多选题或单选题问题选项
		$scope.addOption = function () {
			$scope.question.answers.push('');
		};
		//添加已存在问题的选项
		$scope.addOptionUpd = function (parentIndex) {
			if (!$scope.exist_questions[parentIndex].newOptions) {
				$scope.exist_questions[parentIndex]['newOptions'] = [];
			}
			$scope.exist_questions[parentIndex]['newOptions'].push('');
			// console.log($scope.exist_questions[parentIndex]);
		};
		//删除存在问题的新增选项
		$scope.delOption = function (parentIndex, index) {
			console.log(parentIndex);
			console.log(index);
			$scope.exist_questions[parentIndex].newOptions.splice(index, 1);
		};
		//删除多选题或单选题问题选项
 		$scope.removeOption = function (index) {
			$scope.question.answers.splice(index, 1);
		};
		$scope.removeOptionUpd = function (question, index, optionId) {
			//要删除的选项
			if (!question.delOption) {
				question['delOption'] = [];
			}
			question['delOption'].push(optionId);
			question.answers.splice(index, 1);
		};
		//问卷统计
		$scope.statView = function () {
			$state.go('activity_item.questionnaire_stat_plugin', {}, {reload: true});
		};
		//验证问卷信息
		var validateQuestionnaire = function () {
			//验证问卷标题，不能为空或者不能超过50个字符
			if (!$scope.questionnaire.title || $scope.questionnaire.title.length > 50) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type' : 'POPMSG',
					'title' : '警告',
					'message' : '问卷标题不能为空或超过50个字符。'
				});
				return false;
			}
			if (!$scope.questionnaire.describe || $scope.questionnaire.describe.length > 100) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type' : 'POPMSG',
					'title' : '警告',
					'message' : '问卷描述不能为空或超过100个字符。'
				});
				return false;
			}
			if (!$scope.questionnaire.notice || $scope.questionnaire.notice.length > 100) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type' : 'POPMSG',
					'title' : '警告',
					'message' : '问卷须知不能为空或超过100个字符。'
				});
				return false;
			}
			//验证时间
			try {
				if (typeof($scope.questionnaire.start_time) === 'number') {
					$scope.questionnaire.start_time = $filter('date')($scope.questionnaire.start_time, 'yyyy-MM-dd HH:mm');
				}
				if (typeof($scope.questionnaire.end_time) === 'number') {
					$scope.questionnaire.end_time = $filter('date')($scope.questionnaire.end_time, 'yyyy-MM-dd HH:mm');
				}
				//最晚兑奖时间
				if (typeof($scope.questionnaire.exchange_time) === 'number') {
					$scope.questionnaire.exchange_time = $filter('date')($scope.questionnaire.exchange_time, 'yyyy-MM-dd HH:mm');
				}
				var exTime = new Date($scope.questionnaire.exchange_time.replace(/-/g,'/'));
				var sTime = new Date($scope.questionnaire.start_time.replace(/-/g,'/'));
				var eTime = new Date($scope.questionnaire.end_time.replace(/-/g, '/'));
				var actStartTime = $scope.activity.start_time;
				var actEndTime = $scope.activity.end_time;
				if (Date.parse(sTime) > Date.parse(eTime)) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type' : 'POPMSG',
						'title' : '警告',
						'message' : '结束时间必须在开始时间之后。'
					});
					return false;
				}
				if (Date.parse(eTime) > actEndTime) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type' : 'POPMSG',
						'title' : '警告',
						'message' : '问卷结束时间不能晚于活动结束时间。'
					});
					return false;
				}
				//判断最晚兑奖时间和问卷结束时间
				if (Date.parse(exTime) <= Date.parse(eTime)) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type' : 'POPMSG',
						'title' : '警告',
						'message' : '最晚兑奖时间必须晚于问卷结束时间。'
					});
					return false;
				}
				//最晚兑奖时间不能大于所有奖券中有效时间的最小值
				if (Date.parse(exTime) > $scope.min_gift_etime) {
					$rootScope.$emit(eventType.NOTIFICATION, {
						'type' : 'POPMSG',
						'title' : '警告',
						'message' : '修改的最晚兑奖日期晚于礼券最早有效日期，请检查！'
					});
					return false;
				}
			} catch (e) {
				// console.log(e);
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type' : 'POPMSG',
					'title' : '警告',
					'message' : '请正确选择开始时间或结束时间。' 
				});
				return;
			}
			return true;
		};
		//创建问卷插件
		$scope.createQuestionnaire = function() {
			if (!validateQuestionnaire()) {
				return;
			}
			// console.log($scope.questionnaire);
			$http.post('/api/questionnaires/add', $scope.questionnaire, {
				headers : {
					'Content-Type' : 'application/json'
				}
			}).success(function (data) {
				$scope.questionnaire = data;
				$scope.update = true;
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type' : 'POPMSG',
					'title' : '消息',
					'message' : '创建问卷成功。'
				});
			});
		};
		//修改问卷插件
		$scope.updateQuestionnaire = function() {
			if (!validateQuestionnaire()) {
				return;
			}
			var upd_param = {};
			upd_param['activity_id'] = $scope.questionnaire.activity_id;
			upd_param['title'] = $scope.questionnaire.title;
			upd_param['describe'] = $scope.questionnaire.describe;
			upd_param['notice'] = $scope.questionnaire.notice;
			upd_param['start_time'] = $scope.questionnaire.start_time;
			upd_param['end_time'] = $scope.questionnaire.end_time;
			upd_param['exchange_time'] = $scope.questionnaire.exchange_time;
			console.log(upd_param);
			$http.put('/api/questionnaires/' + $scope.questionnaire.id + '/update', upd_param, {
				headers : {
					'Content-Type' : 'application/json'
				}
			}).success(function (data) {
				$scope.questionnaire = data;
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type' : 'POPMSG',
					'title' : '消息',
					'message' : '修改问卷成功。'
				});
			});
		};
		//发布本次问卷
		$scope.pubQuestionnaire = function (questionnaire_id) {
			var isActivityPublish = $scope.activity.published;
			if (!isActivityPublish) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type' : 'POPMSG',
					'title' : '警告',
					'message' : '需要先发布活动，才能发布问卷功能。'
				});
				$state.go('activity_item', {id: $scope.$parent.activity.id}, {reload: true});
				return;
			}
			$scope.confirm.type = 'pubQuestionnaire';
			$scope.confirm.message = '问卷发布后不能更改，您确定发布该问卷吗？';
			$scope.confirm.param = questionnaire_id;
			$('#confirm').modal();
			return;
		};
		//结束本次问卷
		$scope.finishQuestionnaire = function (questionnaire_id) {
			$scope.confirm.type = 'finishQuestionnaire';
			$scope.confirm.message = '您确定结束本次问卷吗？';
			$scope.confirm.param = questionnaire_id;
			$('#confirm').modal();
			return;
		};
		//删除本次问卷
		$scope.delQuestionnaire = function (questionnaire_id) {
			$scope.confirm.type = 'delQuestionnaire';
			$scope.confirm.message = '您确定删除本次问卷吗？';
			$scope.confirm.param = questionnaire_id;
			$('#confirm').modal();
			return;
		};
		//添加礼券
		$scope.addCertificate = function (questionnaire_id) {
			$modal.open({
				templateUrl : 'partial/activity/plugin/qn_prize_add.html',
				controller : 'QnPrizeAddCtrl',
				resolve : {
					questionnaire_id : function () {
						return questionnaire_id;
					},
					activity_id : function () {
						return $scope.questionnaire.activity_id;
					}
				}
			});
		};
		//修改礼券数量
		$scope.modifyCerNumber = function (questionnaire_id, gift) {
			$modal.open({
				templateUrl : 'partial/activity/plugin/qn_prize_minus.html',
				controller : 'QnPrizeMinusCtrl',
				resolve : {
					questionnaire_id : function () {
						return questionnaire_id;
					},
					gift: function () {
						return gift;
					},
					activity_id : function () {
						return $scope.questionnaire.activity_id;
					}
				}
			});
		};
		//删除与该问卷绑定的礼券
		$scope.delCertificate = function (questionnaire_id, certificate_id) {
			$scope.confirm.type = 'delCertificate';
			$scope.confirm.message = '您确定要删除该礼券吗？';
			$scope.confirm.params = {};
			$scope.confirm.params['questionnaire_id'] = questionnaire_id;
			$scope.confirm.params['certificate_id'] = certificate_id;
			$('#confirm').modal();
			return;
		};
		//放大物品图片
		$scope.viewImage = function (image) {
			try {
				var tempArr = image.split('/');
				if (tempArr[tempArr.length - 1] === 'placeholder.png') {
					return;
				}
			} catch (e) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '警告',
					'message': '图片路径不正确'
				});
				return;
			}
			$modal.open({
				template : '<div><img style="width:100%" src=' + image + '></div>',
				size : 'lg'
			});
		};
		//分页获取已添加到问卷的问题
		var loadQuestions = function (questionnaire_id) {
			var NgTableParams = ngTableParams;
			$scope.exist_questions = null;
			$scope.tableParams = new NgTableParams({
				page : 1,
				count : 5
			}, {
				counts : [],
				total : 0,
				getData : function ($defer, params) {
					$http.get('/api/questionnaires/' + questionnaire_id + '/rubric/list?page=' + params.page() + '&per_page=' + params.count())
						.success(function (data) {
							// console.log(data);
							if (data.items.length === 0 && params.page() !== 1) {
								$scope.tableParams.page(params.page() - 1);
								return;
							}
							$scope.exist_questions = data.items;
							params.total(data.total);
							$defer.resolve($scope.exist_questions);
						});
				}
			});
		};

	});