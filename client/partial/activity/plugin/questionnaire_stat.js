angular.module('iwx')
	.controller('QueStatCtrl', function ($scope, $rootScope, $http, ngTableParams, $modal, eventType) {
		$scope.activityId = $scope.$parent.activity.id;
		$scope.currentPage = 1;
		$scope.questions = [];
		var questionSet = {};
		$scope.loadQuestionBtn = '加载问卷更多问题~~';
		$scope.loadMoreBtn = false;
		$scope.genderMap = {
			MALE : '男',
			FEMALE : '女'
		};
		//选择的问卷id
		$scope.$on('select:change', function (event, data) {
			$scope.questionnaire_id = data;
			$scope.questions = [];
			questionSet = {};
			$scope.currentPage = 1;
			$scope.loadQuestionBtn = '加载问卷更多问题~~';
			$scope.loadMoreBtn = false;
			getQuestionnaire($scope.questionnaire_id);
			loadQuesAndAnswer($scope.questionnaire_id, $scope.currentPage);
		});
		//获取问卷信息
		var getQuestionnaire = function (questionnaire_id) {
			$http.get('/api/questionnaires/' + questionnaire_id)
				.success(function (data) {
					$scope.people = true;
					$scope.number = data.ques.people;
					$scope.questionnaire = data.ques;
				});
		};
		//获取问题类型数组
		var getQuestionTypes = function () {
			$http.get('/api/questionnaires/rubric_type')
				.success(function (data) {
					$scope.typeArray = data;
					$scope.typeMap = {};
					angular.forEach(data, function (value) {
						$scope.typeMap[value.id] = value.name;
					});
					console.log($scope.typeMap);
				});
		};
		getQuestionTypes();
		//加载问题及答案
		var loadQuesAndAnswer = function (questionnaire_id, currentPage) {
			// questionnaire_id = 1;
			$http.get('/api/questionnaires/' + questionnaire_id + '/data?page=' + currentPage + '&per_page=5')
				.success(function (data) {
					console.log(data);
					$scope.loadMore = true;
					if (data.items.length === 0) {
						$scope.loadQuestionBtn = '已经加载问卷全部问题~~';
						$scope.loadMoreBtn = true;
						return;
					}
					var added = 0;
					angular.forEach(data.items, function (value) {
						if (!(value.rubric.id in questionSet)) {
							questionSet[value.rubric.id] = true;
							$scope.questions.push(value);
							added++;
						}
					});
					console.log($scope.questions);
					if (added === 0) {
						loadQuesAndAnswer($scope.questionnaire_id, ++$scope.currentPage);
					}
				});
		};
		//加载更多问题
		$scope.loadMoreQuestion = function () {
			loadQuesAndAnswer($scope.questionnaire_id, ++$scope.currentPage);
		};
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
		$http.get('/api/auth/refreshtoken').success(function (response) {
			$scope.auth_token = response.auth_token;
		});
	});