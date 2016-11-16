angular.module('iwx').directive('partyPost', function($http, $modal, $state) {
  return {
    restrict: 'E',
    scope: {
      comment: '=',
      user: '='
    },
    templateUrl: 'directive/post/party_post.html',
    link: function(scope, element, attrs) {
      scope.editing = false;
      scope.replyText = "";
      scope.viewmore = false;

      scope.submit = function() {
        var url = '/api/activities/' +
            scope.$parent.activity.id +
            '/comments/' +
            scope.comment.id +
            '/reply';
        var data = {};
        data.content = scope.replyText;
        if (scope.replyTo) {
          data.reply_to = scope.replyTo.id;
        }
        scope.replyText = "";
        scope.editing = false;

        $http.post(url, data).success(function(comment) {
          scope.comment= comment;
        });
      };

      scope.getIcon = function(user) {
        if (!user) { return ''; }
        if (user.managed_community) {
          return user.managed_community.logo;
        } else {
          return user.icon;
        }
      };

      scope.getName = function(user) {
        if (!user) { return ''; }
        if (user.managed_community) {
          return user.managed_community.name;
        } else {
          return user.nickname;
        }
      };

      scope.replyReply = function(r) {
        scope.replyTo = r.user;
        scope.editing = true;
      };

      scope.removeComment = function() {
        var url = '/api/activities/' +
            scope.$parent.activity.id +
            '/comments/' +
            scope.comment.id;
        $http.delete(url).success(function() {
          // scope.$parent.refresh();
          scope.$parent.tableParams.reload();
        });
      };

      scope.upComment = function () {
        $http.post('/api/activities/comment/' + scope.comment.id + '/up').success(function() {
          scope.$parent.tableParams.reload();
        });
      };

      scope.downComment = function () {
        $http.post('/api/activities/comment/' + scope.comment.id + '/down').success(function() {
          scope.$parent.tableParams.reload();
        });
      };

      scope.expand = function() {
          scope.viewmore = true;
      };

      scope.viewImage = function(image) {
          $modal.open({
            template: '<div><img style="width:100%" src=' + image + '></div>',
            size: "lg",
          });
      };

      scope.sendMessage = function(user) {
        if (user.managed_community) {
          // Do not support send comunity to community message
          return;
        }
        $state.go('message.user', {'id': user.id});
      };

      scope.viewAllImages = function(index) {
        var items = scope.comment.images;
        items = items.slice(index).concat(items.slice(0, index));
        $modal.open({
          templateUrl: 'partial/util/carousel.html',
          controller: 'CarouselCtrl',
          size: 'lg',
          resolve: {
            items: function () {
              return items;
            }
          }
        });
      };
    }
  };
});