angular.module('iwx')
	.controller('ApplyPerInCtrl', function ($scope, $http, $stateParams, $rootScope, eventType, $modal, $state) {
		$scope.userId = $stateParams.id;
		//处理答案选项
		$scope.unique = function (arr) {
			var hash = {}, result_arr = [], elem;
			for (var i = 0; (elem = arr[i]) != null; i++) {
				if (!hash[elem]) {
					result_arr.push(elem);
					hash[elem] = true;
				}
			}
			return result_arr;
		};
		//获取申请人信息
		var getUserInfo = function () {
			$http.get('/api/political/user/' + $scope.userId + '/pending')
				.success(function (data) {
					/*$scope.user = {
						user: {id:1, nickname: '坏叔叔', name: '黄渤', sex: 'MALE', major: '计算机科学与技术', admission_date: '2013-7-7',
								identity: {id: 1, name: '正式党员'}, phone: '13927658341', apply_time: 1403576402000, 
								icon: '/images/user/5/icon/4b910af4-3bf7-11e5-8ac7-00163e002e66.jpg',
								university: {id: 1, name: '中央民族大学'},
								duty: {id: 1, name: '部长'}, 
								group: {id: 1, name: '党建一队'}, 
								grade: {id: 3, name: '2016'}},
						answers: [{
							answer: ['乔布斯'],
							question: {
								options: ['乔布斯', '科比', '科比', '乔丹', '皮蓬'],
								question: '第一届奥斯卡得主？',
								title: '常识题',
								type: 'SINGLE_CHOICE'
							}
						}, {
							answer: ['要不是的确实话题材质检讨论文化学生日本人生日志愿望你好像'],
							question: {
								options: [],
								question: '老罗邀请方舟子共进晚餐，请你用你的理解，描述一下当时会发生的情况（500字以内）',
								title: '常识题',
								type: 'TEXT'
							}
						}, {
							answer: ['/images/user/64/community_register/3/images/b3df52a0-de82-11e4-8ac7-00163e002e66.jpg'],
							question: {
								options: [],
								question: '请上传一张你最满意的近照，让我们快速认识你！',
								title: '常识题',
								type: 'IMAGES'
							}
						}, {
							answer: ['王泽'],
							question: {
								options: ['王石', '汪小菲', '泷泽秀明', '小泽马里奥', '山本小太郎', '王泽'],
								question: '和郭美美有关的有哪几个人？',
								title: '常识题',
								type: 'MULTI_CHOICE'
							}
						}]
					};*/

					angular.forEach(data.answers, function (value) {
						value.question.options = $scope.unique(value.question.options);
					});
					$scope.user = data;
				}); 
		};
		getUserInfo();
		
		//录入
		$scope.approve = function (user) {
			$http.post('/api/political/user/' + user.id + '/approve')
				.success(function (data) {
					$state.go('party_info.verify', {reload: true});
				});
		};
		//信息有误
		$scope.refuse = function (user) {
			console.log(user);
			$modal.open({
				templateUrl: 'partial/common/unpublished_reason.html',
				controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
					$scope.reason_title = '填写信息有误理由';
					$scope.receive = 'To: ' + user.user_obj.nickname;
					$scope.ok_btn = true;
					$scope.$watch('content', function (newValue) {
						if ($scope.content) {
							$scope.ok_btn = false;
						} else {
							$scope.ok_btn = true;
						}
					});
					$scope.ok = function () {
						//拒绝录入
						$http.post('/api/political/user/' + user.id + '/reject')
							.success(function (data) {
								//拒绝成功发送私信给该用户
								$http.post('/api/admin/messages/' + user.user_obj.id, {
									'content': $scope.content
								}).success(function (data) {
									$modalInstance.close('ok');
									$state.go('party_info.verify', {reload: true});
								});
							});
					};
					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};
				}]
			});
		};
	});