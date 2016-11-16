angular.module('iwx').directive('dSref', function($compile, $state) {
	return {
		restrict: 'A',
    scope:{
        dSref: '='/*,
        name: '='*/
    },
		link: function(scope, element) {
      /*element.html($compile('<a ui-sref="{{ dSref }}">{{name}}</a>')(scope))*/
      function update() {
        console.log($state.current.name + '-------------' + scope.dSref);
        if ($state.current.name === scope.dSref ||
           ($state.current.name === 'activity.unpublishLog' && scope.dSref === 'activity') ||
           ($state.current.name === 'activity.unpublishLog_art' && scope.dSref === 'activity.article') ||
           ($state.current.name === 'activity.unpublishLog_bazaar' && scope.dSref === 'activity.bazaar') ||
           ($state.current.name === 'community.approved' && scope.dSref === 'community.members') ||
           ($state.current.name === 'community.pending' && scope.dSref === 'community.members') ||
           ($state.current.name === 'community.verify_members' && scope.dSref === 'community.register') ||
           ($state.current.name === 'community_university.pending' && scope.dSref === 'community_university') ||
           ($state.current.name === 'community_university.league' && scope.dSref === 'community_university') ||
           ($state.current.name === 'community_university.stu_union' && scope.dSref === 'community_university') ||
           ($state.current.name === 'community_university.stu_org' && scope.dSref === 'community_university') ||
           ($state.current.name === 'community_university.stu_community' && scope.dSref === 'community_university') ||
           ($state.current.name === 'activity_iWX.bazaar.personal' && scope.dSref === 'activity_iWX.bazaar' &&
            element.attr('id') && element.attr('id') === 'left') ||
           ($state.current.name === 'activity_university.bazaar.personal' && scope.dSref === 'activity_university.bazaar' &&
            element.attr('id') && element.attr('id') === 'left_un') ||
           ($state.current.name === 'party_info.duty' && scope.dSref === 'party_info.party_persons') ||
           ($state.current.name === 'party_info.grade' && scope.dSref === 'party_info.party_persons') ||
           ($state.current.name === 'party_info.group' && scope.dSref === 'party_info.party_persons') ||
           ($state.current.name === 'party_info.course' && scope.dSref === 'party_info.party_persons') ||
           ($state.current.name === 'party_info.activity' && scope.dSref === 'party_info.party_persons') ||
           ($state.current.name === 'party_info.verify' && scope.dSref === 'party_info.info_conllection') ||
           ($state.current.name === 'party_info.apply_person_info' && scope.dSref === 'party_info.info_conllection') ||
           ($state.current.name === 'party_info.activity_summary' && scope.dSref === 'party_info.party_persons') ||
           ($state.current.name === 'party_info.course_summary' && scope.dSref === 'party_info.party_persons') ||
           ($state.current.name === 'party_act_item.political_sign_in_at_plugin' && scope.dSref === 'party_act_item.political_sign_in_plugin') ||
           ($state.current.name === 'screen.screen_edit' && scope.dSref === 'screen') ||
           ($state.current.name === 'terminal_university.approve' && scope.dSref === 'terminal_university') ||
           ($state.current.name === 'terminal_university.inter_cut' && scope.dSref === 'terminal_university.schedule') ||
           ($state.current.name === 'terminal_university.source' && scope.dSref === 'terminal_university.schedule') ||
           ($state.current.name === 'terminal_university.display_log' && scope.dSref === 'terminal_university.schedule') ||
           ($state.current.name === 'terminal_university.device_exception' && scope.dSref === 'terminal_university.device') ||
           ($state.current.name === 'terminal_university.native_upload' && scope.dSref === 'terminal_university.schedule') ||
           ($state.current.name === 'terminal_university.set_levels' && scope.dSref === 'terminal_university.schedule') ||
           ($state.current.name === 'terminal_university.plans' && scope.dSref === 'terminal_university.device') ||
           ($state.current.name === 'terminal_university.edit_plan' && scope.dSref === 'terminal_university.device') ||
           ($state.current.name === 'terminal_university.batch' && scope.dSref === 'terminal_university.device')) {
          element.addClass('active');
        } else {
          element.removeClass('active');
        }
      }
      scope.$on('$stateChangeSuccess', update);
      update();
    }
	};
});
