angular.module('iwx')
	.controller('ParticipatorCtrl', function ($scope, $http) {
		//被选中的成员id
		$scope.checkedMembers = [];
		//别选中的参与讨论的成员id
		$scope.checkedPart = [];
		//被选中的成员hash
		$scope.memberHash = {};
		//根据小队，职务，身份筛选条件获取党支部人员
		$scope.getMembers = function (condition) {
			var param = '';
			if (condition === 'group') {
				param = 'condition=group';
			} else if (condition === 'duty') {
				param = 'condition=duty';
			} else {
				param = 'condition=status';
			}
			$http.get('/api/plugins')
				.success(function (data) {
					if (condition === 'group') {
						data = [{id: 1, name: '黄渤'}, {id: 2, name: '范冰冰'}, {id: 3, name: '邓超'}, {id: 4, name: '孙俪'}];
					} else if (condition === 'duty') {
						data = [{id: 5, name: '刘德华'}, {id: 6, name: '姚明'}];
					} else {
						data = [];
					}
					angular.forEach(data, function (value, key) {
						if ($scope.partHash[value.id] || $scope.memberHash[value.id]) {
							value['checked'] = true;
							if ($scope.partHash[value.id]) {
								value['isPart'] = true;
							}
						} else {
							value['checked'] = false;
							if ($scope.partHash[value.id]) {
								value['isPart'] = false;
							}
						}
					});
					$scope.members = data;
				});
		};
		//获取获取参与讨论的人员
		$scope.getParticipators = function () {
			$http.get('/api/plugins')
				.success(function (data) {
					$scope.participators = [{id: 1, name: '黄渤'}, {id: 6, name: '姚明'}, {id: 3, name: '邓超'}];
					//参与讨论的成员hash
					$scope.partHash = {};
					angular.forEach($scope.participators, function (value, key) {
						$scope.partHash[value.id] = value;
					});
					$scope.getMembers('group');
				});
		};
		$scope.getParticipators();
		//选中党支部成员
		$scope.getCheckedMem = function (member, checked_member) {
			console.log(checked_member);
			if (checked_member) {
				$scope.checkedMembers.push(member.id);
				$scope.memberHash[member.id] = member;
			} else {
				angular.forEach($scope.checkedMembers, function (value, key) {
					if (value === member.id) {
						$scope.checkedMembers.splice(key, 1);
						delete $scope.memberHash[value];
					}
				});
			}
			console.log($scope.checkedMembers);
		};
		//选中讨论区成员
		$scope.getCheckedPar = function (member_id, checked_member) {
			console.log('member_id:' + member_id + '---checked_member:' + checked_member);
			if (checked_member) {
				$scope.checkedPart.push(member_id);
			} else {
				angular.forEach($scope.checkedPart, function (value, key) {
					if (value === member_id) {
						$scope.checkedPart.splice(key, 1);
					}
				});
			}
			console.log($scope.checkedPart);
		};
		//添加参加讨论的人员
		$scope.addParticipator = function () {
			console.log($scope.checkedMembers);
			$scope.getParticipators();
		};
		//删除参加讨论的人员
		$scope.delParticipator = function () {
			console.log($scope.checkedPart);
			$scope.getParticipators();
		};
	});