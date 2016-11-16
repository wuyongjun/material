angular.module('iwx')
	.controller('VerManageDetCtrl', function ($scope, $rootScope, $http, eventType, $state) {
		$scope.version = {};
		//发布版本信息
		$scope.publish = function () {
			var publish_version_api = '';
			if ($state.current.name === 'version_manage_super_detail') {
				publish_version_api = '/api/su/web/version/add';
			} else {
				publish_version_api = '/api/su/version/add'; 
			}
			console.log(publish_version_api);
			$http.post(publish_version_api, $scope.version, {
				headers: {
					'Content-Type': 'application/json'
				}
			}).success(function (data) {
				$rootScope.$emit(eventType.NOTIFICATION, {
					'type': 'POPMSG',
					'title': '消息',
					'message': '恭喜，版本信息发布成功！'
				});
				if ($state.current.name === 'version_manage_super_detail') {
					$state.go('version_manage_super', {
						reload: true
					});
				} else {
					$state.go('version_manage_super.app', {
						reload: true
					});
				}
				
			});
		};
		/**
			var strRegex = '^((https|http|ftp|rtsp|mms)?://)' 
			+ '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' //ftp的user@ 
			+ '(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184 
			+ '|' // 允许IP和DOMAIN（域名） 
			+ '([0-9a-z_!~*\'()-]+.)*' // 域名- www. 
			+ '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名 
			+ '[a-z]{2,6})' // first level domain- .com or .museum 
			+ '(:[0-9]{1,4})?' // 端口- :80 
			+ '((/?)|' // a slash isn't required if there is no file name 
			+ '(/[0-9a-z_!~*\'().;?:@&=+$,%#-]+)+/?)$'; 
		*/
	});