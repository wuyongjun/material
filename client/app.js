angular.module('iwx', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'ngTable', 'angular-loading-bar',
  'monospaced.qrcode', 'chart.js', 'treeControl', 'ngSanitize', 'angular-simditor']);

angular.module('iwx').constant('eventType', {
    LOGIN: 'login',
    LOGOUT: 'logout',
    NOTIFICATION: 'notification'
});

angular.module('iwx').constant('notificationType', {
    INFO: {
        name: "INFO",
        timeout: 3000, // in 3 seconds
        class: "info",
        closable: false
    },
    LONG_INFO: {
        name: "LONG_INFO",
        timeout: -1,
        class: "info",
        closable: true
    },
    ERROR: {
        name: "ERROR",
        timeout: 10000, // in 10 seconds
        class: "error",
        closable: true
    },
    POPMSG: {
        name: "POPMSG",
        timeout: 10000,
        class: "info",
        closable: true
    },
});
//添加请求头常量
angular.module('iwx').constant('origin', {
    DESTINATION: {
        name: 'http://broadcast.iweixiao.cn'
        // name: 'http://192.168.199.199'
    },
    /*ORIGIN: {
        name: 'http://101.201.146.103:5003'
    }*/
    ORIGIN: 'http://101.201.146.103:8888'
});
angular.module('iwx').config(['$httpProvider', function($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

}]);

angular.module('iwx').config(
    function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
        //$locationProvider.html5Mode(true);
        $stateProvider.state('welcome', {
            url: '/',
            templateUrl: 'partial/welcome/welcome.html'
        });
        $stateProvider.state('certificate', {
            url: '/certificate',
            templateUrl: 'partial/certificate/certificate.html'
        });
        $stateProvider.state('certificate_coupons', {
            url: '/certificate/coupons',
            templateUrl: 'partial/certificate/coupons/certificate_coupons.html'
        });
        $stateProvider.state('certificate_coupons_details', {
            url: '/certificate/coupons/:id/details',
            templateUrl: 'partial/certificate/coupons/certificate_coupons_details.html'
        });
        $stateProvider.state('certificate_coupons_item', {
            url: '/certificate/coupons/:id',
            templateUrl: 'partial/certificate/coupons/certificate_coupons_item.html'
        });
        $stateProvider.state('profile', {
            url: '/profile',
            templateUrl: 'partial/profile/profile.html'
        });
        $stateProvider.state('profile.change_password', {
            url: '/change_password',
            templateUrl: 'partial/profile/change_password.html'
        });
        $stateProvider.state('community', {
            url: '/community',
            templateUrl: 'partial/community/community.html'
        });
        $stateProvider.state('community.members', {
            url: '/community/members/:page',
            // url: '/community/members',
            templateUrl: 'partial/community/community_members.html'
        });
        //部门管理
        $stateProvider.state('community.department', {
            url: '/community/department',
            templateUrl: 'partial/community/community_department/community_department.html'
        });
        //职务管理
        $stateProvider.state('community.duty', {
            url: '/community/duty',
            templateUrl: 'partial/community/community_duty/community_duty.html'
        });
        //已审核的成员
        $stateProvider.state('community.approved', {
            url: '/community/members/approved',
            templateUrl: 'partial/community/community_members_approved.html'
        });
        //待审核的成员
        /*$stateProvider.state('community.pending', {
            url: '/community/members/pending',
            templateUrl: 'partial/community/community_members_pending.html'
        });*/
        $stateProvider.state('community.verify_members', {
            url: '/members/verify_members/:page',
            // url: '/members/verify_members',
            templateUrl: 'partial/community/community_members_verify.html'
        });
        $stateProvider.state('community.register', {
            url: '/community/register',
            templateUrl: 'partial/community/community_register.html'
        });
        $stateProvider.state('community.member', {
            url: '/community/member/:id/:page',
            // url: '/community/member/:id',
            templateUrl: 'partial/community/community_member.html'
        });
        //换届管理
        $stateProvider.state('community.election', {
            url: '/community/election/:id',
            templateUrl: 'partial/community/community_election.html'
        });
        $stateProvider.state('activity', {
            url: '/activity/:currentPage',
            // url: '/activity',
            templateUrl: 'partial/activity/activity.html'
        });
        //社团管理员-社团文章管理
        $stateProvider.state('activity.article', {
            url: '/article/:page',
            // url: '/article',
            templateUrl: 'partial/article/admin/comm_article.html'
        });
        //社团管理员-校园集市
        $stateProvider.state('activity.bazaar', {
            url: '/bazaar/:id/:page',
            // url: '/bazaar/:id',
            templateUrl: 'partial/bazaar/admin/bazaar_list.html'
        });
        //创建校园集市
        $stateProvider.state('create_bazaar', {
            url: '/create_bazaar',
            templateUrl: 'partial/bazaar/admin/create_bazaar.html'
        });
        //求购
        $stateProvider.state('purchase_bazaar', {
            url: '/purchase_bazaar/:id/:page',
            // url: '/purchase_bazaar/:id',
            templateUrl: 'partial/bazaar/admin/purchase.html'
        });
        //转让
        $stateProvider.state('sale_bazaar', {
            url: '/sale_bazaar/:id/:page',
            // url: '/sale_bazaar/:id',
            templateUrl: 'partial/bazaar/admin/sale.html'
        });
        //寻物
        $stateProvider.state('lost_bazaar', {
            url: '/lost_bazaar/:id/:page',
            // url: '/lost_bazaar/:id',
            templateUrl: 'partial/bazaar/admin/lost.html'
        });
        //招领
        $stateProvider.state('pick_bazaar', {
            url: '/pick_bazaar/:id/:page',
            // url: '/pick_bazaar/:id',
            templateUrl: 'partial/bazaar/admin/pick.html'
        });
        //校园集市消息路由
        $stateProvider.state('message.bazaar', {
            url: '/message_bazaar/:id',
            templateUrl: 'partial/message/message.html'
        });
        $stateProvider.state('message.bazaar_user', {
            url: '/message_bazaar_user/:id',
            templateUrl: 'partial/message/message_bazaar_user.html'
        });
        $stateProvider.state('message.bazaar_topic', {
            url: '/message_bazaar_topic/:id/:user_id',
            templateUrl: 'partial/message/message_bazaar_topic.html'
        });
        /*$stateProvider.state('activity.article_detail', {
            url: '/article/detail/:articleId/:page',
            // url: '/article/detail/:articleId',
            templateUrl: 'partial/article/admin/comm_article_detail.html'
        });*/
        //lishihan
        $stateProvider.state('article_detail', {
            url: '/article/detail/:articleId/:page/:original',
            // url: '/article/detail/:articleId',
            templateUrl: 'partial/article/admin/comm_article_detail.html'
        });
        //校级管理员-社团文章管理
        $stateProvider.state('activity_university.article', {
            url: '/article',
            templateUrl: 'partial/article/university/comm_article_un.html'
        });
        //校级管理员-校园集市
        $stateProvider.state('activity_university.bazaar', {
            url: '/bazaar',
            templateUrl: 'partial/bazaar/university/bazaar_list_un.html'
        });
        $stateProvider.state('activity_university.bazaar.personal', {
            url: '/personal',
            templateUrl: 'partial/bazaar/university/bazaar_list_personal_un.html'
        });
        //i微校管理员-社团文章管理
        $stateProvider.state('activity_iWX.article', {
            url: '/article',
            templateUrl: 'partial/article/iwx/comm_article_iwx.html'
        });
        //i微校管理员-校园集市
        $stateProvider.state('activity_iWX.bazaar', {
            url: '/bazaar',
            templateUrl: 'partial/bazaar/iwx/bazaar_list_iwx.html'
        });
        $stateProvider.state('activity_iWX.bazaar.personal', {
            url: '/personal',
            templateUrl: 'partial/bazaar/iwx/bazaar_list_person_iwx.html'
        });
        //i微校管理员-活动管理
        $stateProvider.state('activity_iWX', {
            url: '/activity_iWX',
            templateUrl: 'partial/activity/activity_iWX.html'
        });
        $stateProvider.state('activity_iWX.create_activity', {
            url: '/create',
            templateUrl: 'partial/activity/activity_iWX_create.html'
        });
        //i微校管理员-社团管理
        $stateProvider.state('community_iWX', {
            url: '/community_iWX',
            templateUrl: 'partial/community/community_iWX/community_iWX.html'
        });
        $stateProvider.state('community_iWX.pending', {
            url: '/pending',
            templateUrl: 'partial/community/community_iWX/community_iWX_pending.html'
        });
        //换届状态
        $stateProvider.state('community_iWX.shift', {
            url: '/shift',
            templateUrl: 'partial/community/community_iWX/community_iWX_shift.html'
        });
        //新建社团
        $stateProvider.state('community_iWX.register_community', {
            url: '/register_community',
            templateUrl: 'partial/community/community_iWX/community_iWX_register_community.html'
        });
        //新建管理员
        $stateProvider.state('community_iWX.create_manager', {
            url: '/create_manager',
            templateUrl: 'partial/community/community_iWX/community_iWX_create_manager.html'
        });
        //管理员列表
        $stateProvider.state('community_iWX.manager_list', {
            url: '/manager_list',
            templateUrl: 'partial/community/community_iWX/community_iWX_manager_list.html'
        });
        //i微校管理员-电子凭证管理
        $stateProvider.state('certificate_coupons_iWX', {
            url: '/certificate_coupons_iWX',
            templateUrl: 'partial/certificate/coupons/coupons_iWX/certificate_coupons_iWX.html'
        });
        $stateProvider.state('certificate_coupons_iWX.create', {
            url: '/create',
            templateUrl: 'partial/certificate/coupons/coupons_iWX/certificate_coupons_iWX_create.html'
        });
        $stateProvider.state('certificate_coupons_iWX.coupons_detail', {
            url: '/coupons_detail/:id',
            templateUrl: 'partial/certificate/coupons/coupons_iWX/certificate_coupons_detail_iWX.html'
        });
        //i微校管理员-信息管理
        $stateProvider.state('message_iWX', {
            url: '/message_iWX',
            templateUrl: 'partial/message/message_iWX/message_iWX.html'
        });
        $stateProvider.state('message_iWX.create_letters', {
            url: '/create_letters',
            templateUrl: 'partial/message/message_iWX/message_iWX_letters.html'
        });
        $stateProvider.state('message_iWX.message_iWX_to_community', {
            url: '/message_iWX_to_community/:id',
            templateUrl: 'partial/message/message_iWX/message_iWX_to_community.html'
        });
        //i微校管理员-账户管理
        $stateProvider.state('profile_iwx', {
            url: '/profile_iwx',
            templateUrl: 'partial/profile/profile_iwx/profile_iwx.html'
        });
        $stateProvider.state('profile_iwx.change_password', {
            url: '/change_password_iwx',
            templateUrl: 'partial/profile/profile_iwx/change_password_iwx.html'
        });
        //校级管理员相关路由
        //校级管理员-活动管理
        $stateProvider.state('activity_university', {
            url: '/activity_university',
            templateUrl: 'partial/activity/activity_university/activity_university.html'
        });
        $stateProvider.state('activity_university.create_activity', {
            url: '/create_activity',
            templateUrl: 'partial/activity/activity_university/activity_university_create.html'
        });
        //校级管理员-电子凭证管理
        $stateProvider.state('certificate_coupons_university', {
            url: '/certificate_coupons_university',
            templateUrl: 'partial/certificate/coupons/coupons_university/certificate_university.html'
        });
        $stateProvider.state('certificate_coupons_university.create', {
            url: '/create_coupon',
            templateUrl: 'partial/certificate/coupons/coupons_university/certificate_university_create.html'
        });
        $stateProvider.state('certificate_coupons_university.details', {
            url: '/details_coupon/:id',
            templateUrl: 'partial/certificate/coupons/coupons_university/certificate_university_detail.html'
        });
        //校级管理员-社团管理-社联
        $stateProvider.state('community_university', {
            url: '/community_university',
            templateUrl: 'partial/community/community_university/community_university.html'
        });
        $stateProvider.state('community_university.pending', {
            url: '/pending',
            templateUrl: 'partial/community/community_university/community_university_pending.html'
        });
        $stateProvider.state('community_university.election', {
            url: '/election',
            templateUrl: 'partial/community/community_university/community_university_election.html'
        });
        //校级管理员-活动审批-社联
        $stateProvider.state('community_university.activity_approve', {
            url: '/activity_approve',
            templateUrl: 'partial/community/community_university/comm_activity_approve/activity_appr_list.html'
        });
        $stateProvider.state('community_university.act_appr_setting', {
            url: '/act_appr_setting',
            templateUrl: 'partial/community/community_university/comm_activity_approve/act_setting/act_appr_setting.html'
        });
        $stateProvider.state('community_university.appr_table_detail', {
            url: '/activity_approve/:id',
            templateUrl: 'partial/community/community_university/comm_activity_approve/act_setting/appr_table_detail.html'
        });
        //校级管理员-校团委
        $stateProvider.state('community_university.league', {
            url: '/league',
            templateUrl: 'partial/community/community_university/community_org_info/org_info.html'
        });
        $stateProvider.state('community_university.stu_union', {
            url: '/stu_union',
            templateUrl: 'partial/community/community_university/community_org_info/org_info.html'
        });
        $stateProvider.state('community_university.stu_org', {
            url: '/stu_org',
            templateUrl: 'partial/community/community_university/community_org_info/org_info.html'
        });
        $stateProvider.state('community_university.stu_community', {
            url: '/stu_org',
            templateUrl: 'partial/community/community_university/community_org_info/org_info.html'
        });

        //校级管理员-信息管理
        $stateProvider.state('message_university', {
            url: '/message_university',
            templateUrl: 'partial/message/message_university/message_university.html'
        });
        $stateProvider.state('message_university.create_letters', {
            url: '/create_letters',
            templateUrl: 'partial/message/message_university/message_university_letters.html'
        });
        $stateProvider.state('message_university.message_uni_to_community', {
            url: '/message_uni_to_community/:id',
            templateUrl: 'partial/message/message_university/message_university_to_community.html'
        });
        //校级管理员-账户管理
        $stateProvider.state('profile_university', {
            url: '/profile_university',
            templateUrl: 'partial/profile/profile_university/profile_university.html'
        });
        $stateProvider.state('profile_university.change_password', {
            url: '/change_password_university',
            templateUrl: 'partial/profile/profile_university/change_password_university.html'
        });
        //超级管理员相关路由
        //超级管理员-角色管理
        $stateProvider.state('role_manage_super', {
            url: '/role_manage_super',
            templateUrl: 'partial/role/super/role_manage_super.html'
        });
        //版本管理
        $stateProvider.state('version_manage_super', {
            url: '/version_manage_super',
            templateUrl: 'partial/role/super/version_manage_super.html'
        });
        $stateProvider.state('version_manage_super.app', {
            url: '/app',
            templateUrl: 'partial/role/super/app_version_manage_super.html'
        });
        $stateProvider.state('version_manage_super_detail', {
            url: '/version_manage_super_detail/:id',
            templateUrl: 'partial/role/super/version_manage_super_detail.html'
        });
        $stateProvider.state('version_manage_super_detail_app', {
            url: '/app_version_manage_super_detail/:id',
            templateUrl: 'partial/role/super/app_version_manage_super_detail.html'
        });
        $stateProvider.state('role_manage_super.user', {
            url: '/user/:manager_type',
            templateUrl: 'partial/role/super/role_manage_super_user.html'
        });
        $stateProvider.state('role_manage_super.create_user', {
            url: '/create_user',
            templateUrl: 'partial/role/super/role_manage_super_create_user.html'
        });

        $stateProvider.state('message', {
            url: '/message',
            templateUrl: 'partial/message/messages.html'
        });
        $stateProvider.state('message.members', {
            url: '/members',
            templateUrl: 'partial/message/messages_members.html'
        });
        $stateProvider.state('message.user', {
            url: '/:id',
            templateUrl: 'partial/message/message.html'
        });
        $stateProvider.state('message.userInfo', {
            url: '/:id',
            templateUrl: 'partial/message/message_member_info.html'
        });
        //添加社团管理员和管理员间通信页面路由
        $stateProvider.state('message.iwx', {
            url: '/message.iwx/:id',
            templateUrl: 'partial/message/message_admin_iwx.html'
        });
        $stateProvider.state('message.university', {
            url: '/message.university/:id',
            templateUrl: 'partial/message/message_admin_university.html'
        });
        $stateProvider.state('activity_item', {
            url: '/activity/:id/:currentPage',
            // url: '/activity/:id',
            templateUrl: 'partial/activity/item/activity_item.html'
        });
        $stateProvider.state('activity_item.announcement_plugin', {
            url: '/plugin/announcement/:currentPage',
            templateUrl: 'partial/activity/plugin/announcement.html'
        });
        $stateProvider.state('activity_item.lottery_plugin', {
            url: '/plugin/lottery/:currentPage',
            templateUrl: 'partial/activity/plugin/lottery.html'
        });
        $stateProvider.state('activity_item.lotteryat_plugin', {
            url: '/plugin/lottery/:award_id',
            templateUrl: 'partial/activity/plugin/lotteryat.html'
        });
        $stateProvider.state('activity_item.timeline_plugin', {
            url: '/plugin/timeline/:currentPage',
            templateUrl: 'partial/activity/plugin/timeline.html'
        });
        $stateProvider.state('activity_item.ticket_plugin', {
            url: '/plugin/ticket/:currentPage',
            templateUrl: 'partial/activity/plugin/ticket.html'
        });
        $stateProvider.state('activity_item.vote_plugin', {
            url: '/plugin/vote/:currentPage',
            templateUrl: 'partial/activity/plugin/vote.html'
        });
       $stateProvider.state('activity_item.stat_plugin', {
            url: '/plugin/stat/:currentPage',
            templateUrl: 'partial/activity/plugin/stat.html'
        });
        $stateProvider.state('activity_item.votestat_plugin', {
            url: '/plugin/votestat',
            templateUrl: 'partial/activity/plugin/votestat.html'
        });
        //添加查看历史投票route
        $stateProvider.state('activity_item.history_vote_plugin', {
            url: '/plugin/history_vote',
            templateUrl: 'partial/activity/plugin/history_vote.html'
        });
        //添加查看历史候选人route
        $stateProvider.state('activity_item.history_candidate_plugin', {
            url: '/plugin/history_candidate/:vote_id',
            templateUrl: 'partial/activity/plugin/history_candidate.html'
        });
        //添加查看历史电子票route
        $stateProvider.state('activity_item.history_ticket_plugin', {
            url: '/plugin/history_ticket',
            templateUrl: 'partial/activity/plugin/history_ticket.html'
        });
        $stateProvider.state('activity_item.register_plugin', {
            url: '/plugin/register',
            template: '<h4>社团招新</h4>'
        });
        $stateProvider.state('activity_item.sign_in_plugin', {
            url: '/plugin/signin/:currentPage',
            templateUrl: 'partial/activity/plugin/signin.html'
        });
        $stateProvider.state('activity_item.sign_in_at_plugin', {
            url: '/plugin/signinat',
            templateUrl: 'partial/activity/plugin/signinat.html'
        });
        //问卷插件
        $stateProvider.state('activity_item.questionnaire_plugin', {
            url: '/plugin/questionnaire/:currentPage',
            templateUrl: 'partial/activity/plugin/questionnaire.html'
        });
        $stateProvider.state('activity_item.questionnaire_stat_plugin', {
            url: '/plugin/questionnaire_stat',
            templateUrl: 'partial/activity/plugin/questionnaire_stat.html'
        });
        $stateProvider.state('register', {
            url: '/admin/register',
            templateUrl: 'partial/admin/register.html'
        });
        $stateProvider.state('login', {
            url: '/admin/login/:next',
            templateUrl: 'partial/admin/login.html'
        });
        //系统通知和信息--社团管理员
        $stateProvider.state('sysMesAndInfo', {
            url: '/sysMesAndInfo/:id',
            templateUrl: 'partial/welcome/sysMesAndInfo.html'
        });
        //取消发布活动通知日志
        $stateProvider.state('activity.unpublishLog', {
            url: '/unpublishLog/:type/:id',
            templateUrl: 'partial/common/unpublished_log.html'
        });
        //取消发布文章通知日志
        $stateProvider.state('activity.unpublishLog_art', {
            url: '/unpublishLog/:type/:id',
            templateUrl: 'partial/common/unpublished_log.html'
        });
        //取消发布集市通知日志
        $stateProvider.state('activity.unpublishLog_bazaar', {
            url: '/unpublishLog/:type/:id',
            templateUrl: 'partial/common/unpublished_log.html'
        });
        //党支部角色相关路由
        $stateProvider.state('party_info', {
            url: '/party_org',
            templateUrl: 'partial/community/party_branch/party_org.html'
        });
        $stateProvider.state('party_info.party_persons', {
            // url: '/party_persons/:grade/:group/:page',
            url: '/party_persons',
            templateUrl: 'partial/community/party_branch/party_persons.html'
        });
        $stateProvider.state('party_info.duty', {
            url: '/duty',
            templateUrl: 'partial/community/party_branch/party_persons/duty.html'
        });
        $stateProvider.state('party_info.grade', {
            url: '/grade',
            templateUrl: 'partial/community/party_branch/party_persons/grade.html'
        });
        $stateProvider.state('party_info.group', {
            url: '/group',
            templateUrl: 'partial/community/party_branch/party_persons/group.html'
        });
        $stateProvider.state('party_info.course', {
            url: '/course/:personId/:summaryId',
            templateUrl: 'partial/community/party_branch/party_persons/course.html'
        });
        $stateProvider.state('party_info.activity', {
            url: '/course/:personId/activity',
            templateUrl: 'partial/community/party_branch/party_persons/course/party_activity.html'
        });
        $stateProvider.state('party_info.info_conllection', {
            url: '/info_conllection',
            templateUrl: 'partial/community/party_branch/info_conllection.html'
        });
        $stateProvider.state('party_info.verify', {
            url: '/verify',
            templateUrl: 'partial/community/party_branch/info_conllection/verify.html'
        });
        $stateProvider.state('party_info.apply_person_info', {
            url: '/apply_person_info/:id',
            templateUrl: 'partial/community/party_branch/info_conllection/applyPersonInfo.html'
        });
        $stateProvider.state('party_info.activity_summary', {
            url: '/activity_summary/:activityId/:summaryId/:personId',
            templateUrl: 'partial/community/party_branch/party_persons/course/activity_summary.html'
        });
        $stateProvider.state('party_info.course_summary', {
            url: '/course_summary/:personId',
            templateUrl: 'partial/community/party_branch/party_persons/course/course_summary.html'
        });
        //党支部动态管理
        $stateProvider.state('party_act_list', {
            url: '/party_act/:page',
            templateUrl: 'partial/activity/party_branch/activity_list.html'
        });
        $stateProvider.state('party_act_item', {
            url: '/party_act_item/:id/:page',
            templateUrl: 'partial/activity/party_branch/activity_item.html'
        });
        $stateProvider.state('party_act_item.stat_plugin', {
            url: '/plugin/stat_plugin',
            templateUrl: 'partial/activity/party_branch/plugins/stat.html'
        });
        //活动签到插件
        $stateProvider.state('party_act_item.political_sign_in_plugin', {
            url: '/plugin/sign_in_plugin',
            templateUrl: 'partial/activity/party_branch/plugins/sign_in.html'
        });
        //线上讨论插件
        $stateProvider.state('party_act_item.discuss_plugin', {
            url: '/plugin/timeline_plugin',
            templateUrl: 'partial/activity/party_branch/plugins/timeline.html'
        });
        //签到结果
        $stateProvider.state('party_act_item.political_sign_in_at_plugin', {
            url: '/plugin/sign_in_at_plugin/:signInId/:isSpecify',
            templateUrl: 'partial/activity/party_branch/plugins/sign_in_at.html'
        });
        //电子展板
        $stateProvider.state('screen', {
            url: '/screen/:page',
            templateUrl: 'partial/screen/screen_list.html'
        });
        $stateProvider.state('screen.screen_edit', {
            url: '/screen_edit/:id',
            templateUrl: 'partial/screen/screen_edit.html'
        });
        //校级管理员终端管理
        $stateProvider.state('terminal_university', {
            url: '/terminal',
            templateUrl: 'partial/screen/university/terminal.html'
        });
        $stateProvider.state('terminal_university.schedule', {
            url: '/schedule/:page',
            templateUrl: 'partial/screen/university/schedule.html'
        });
        //素材库
        $stateProvider.state('terminal_university.source', {
            url: '/source/:page',
            templateUrl: 'partial/screen/university/schedule/source.html'
        });
        //播放日志
        $stateProvider.state('terminal_university.display_log', {
            url: '/display_log/:page',
            templateUrl: 'partial/screen/university/schedule/display_log.html'
        });
        $stateProvider.state('terminal_university.approve', {
            url: '/approve',
            templateUrl: 'partial/screen/university/terminal/approve_list.html'
        });
        $stateProvider.state('terminal_university.inter_cut', {
            url: '/inter_cut/:page/:router',
            templateUrl: 'partial/screen/university/schedule/inter_cut.html'
        });
        $stateProvider.state('terminal_university.native_upload', {
            url: '/native_upload/:page',
            templateUrl: 'partial/screen/university/schedule/upload_native.html'
        });
        $stateProvider.state('terminal_university.set_levels', {
            url: '/set_levels/:page',
            templateUrl: 'partial/screen/university/schedule/set_levels.html'
        });
        //校级管理员设备管理
        $stateProvider.state('terminal_university.device', {
            url: '/device_list/:page',
            templateUrl: 'partial/screen/university/device/device_list.html'
        });
        //设置开关机计划
        $stateProvider.state('terminal_university.plans', {
            url: '/device_list/:page/device_plans',
            templateUrl: 'partial/screen/university/device/plan_list.html'
        });
        //编辑开关机计划
        $stateProvider.state('terminal_university.edit_plan', {
            url: '/device_list/:page/device_plans/edit_plan/:id/:from',
            templateUrl: 'partial/screen/university/device/plan_edit.html'
        });
        //批量操作
        $stateProvider.state('terminal_university.batch', {
            url: '/device_list/:page/device_batch',
            templateUrl: 'partial/screen/university/device/batch_list.html'
        });
        $urlRouterProvider.otherwise('/');

        $httpProvider.interceptors.push('httpinterceptor');
    });

angular.module('iwx').run(function($rootScope) {

    $rootScope.safeApply = function(fn) {
        var phase = $rootScope.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

});

//add the module with global defaults for froala
/*angular.module('iwx').value('froalaConfig', {
    inlineMode: false,
    events: {
        align: function (e, editor, alignment) {
        }
    }
});*/
//modify angular-simditor constant config
angular.module('iwx').constant('simditorConfig', {
    placeholder: '输入内容请限制在2000字以内',
    toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', 'color', '|',
    'ol', 'ul', 'blockquote', 'table', '|', 'link', 'hr', '|', 'indent', 'outdent', 'alignment'],
    pasteImage: true,
    toolbarFloat: false,
    defaultImage: '',
    upload: {
        url: '',
        params: null,
        fileKey: 'upload_file',
        connectionCount: 3,
        leaveConfirm: 'Uploading is in progress, are you sure to leave this page?'
    },
    allowedTags: ['br', 'a', 'img', 'b', 'strong', 'i', 'u', 'font', 'p',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'hr', 'div', 'script', 'style']
});

angular.module('iwx').controller('MainCtrl', function ($rootScope, $scope, $http, $timeout, $modal, userService, eventType, notificationType, $state) {
    $scope.user = null;
    userService.load(true).then(function(user) {
        if (user.role.name === 'ADMIN') {
            $rootScope.message();
            if (!user.managed_community.password_code) {
                $http.get('/api/admin/community').success(function (data) {});
            }
        }
        $scope.user = user;
        // console.log(user);
    });
    $scope.$on('flushLoginUser', function (event, community) {
        console.log(community);
        $scope.user.managed_community = community;
    });
    var notificationPromise = null;

    $scope.notification = null;
    $scope.popmsg = null;
    //发布编辑器或app新版本
    $scope.publishVersion = function (flag) {
            if (flag === 'editor') {
                $state.go('version_manage_super_detail', {
                    'id': -1
                });
            } else {
                $state.go('version_manage_super_detail_app', {
                    'id': -1
                });
            }

        };
    //消息提示
    $rootScope.message = function () {
        $http.get('/api/admin/community/message/members')
            .success(function (data) {
                var message = data.member.concat(data.non_member);
                var mes_len = message.length;
                for (var i = 0;i < mes_len;i++) {
                    if (message[i].count !== 0) {
                        $rootScope.mes_note = true;
                        break;
                    } else {
                        if (i === mes_len - 1) {
                            getBazMes();
                        }
                    }
                }
            });
    };
    var getBazMes = function () {
        $http.get('/api/admin/bazaar/message/users')
            .success(function (data) {
                var baz_len = data.length;
                for (var j = 0;j < baz_len;j++) {
                    if (data[j].count !== 0) {
                        $rootScope.mes_note = true;
                        break;
                    }
                }
            });
    };
    //分享web页面
    $scope.shareWeb = function (role) {
        // console.log(role);
        // console.log($scope.user);
        var shareUrl = '';
        if (role === 'ADMIN') {
            shareUrl = window.location.origin + '/weixin/community/share#' + $scope.user.managed_community.id;
        } else {
            if ($scope.user.admin_type === 'COMMITTEE') {
                shareUrl = window.location.origin + '/app/university/share#' + $scope.user.university.id;
            } else {
                shareUrl = window.location.origin + '/app/university/union/share#' + $scope.user.university.id;
            }
        }
        $modal.open({
            templateUrl: 'partial/common/share_qrcode.html',
            controller: 'shareQrcodeCtrl',
            resolve: {
            shareUrl: function () {
                    return shareUrl;
                }
            }
        });
    };
    $scope.logout = function() {
        userService.logout();
    };
    $scope.clearNotification = function() {
        if (notificationPromise) {
            $timeout.cancel(notificationPromise);
            notificationPromise = null;
        }
        $scope.notification = null;

        $("#notificationModal").modal('hide');
        $scope.popmsg = null;
    };
    $scope.notificationDetails = function(details) {
        $modal.open({
            template: JSON.stringify(details),
            size: "sm",
        });
    };
    $rootScope.$on(eventType.LOGIN, function(event, user) {
        if (user.role.name === 'ADMIN') {
            $rootScope.message();
            if (!user.managed_community.password_code) {
                //生成社团管理密码
                $http.get('/api/admin/community').success(function (data) {});
            }
        }
        console.log(user);
        $scope.user = user;
    });
    $rootScope.$on(eventType.LOGOUT, function(event, user) {
        $scope.user = null;
    });

    $rootScope.$on(eventType.NOTIFICATION, function(event, n) {
        if (!n) {
            $scope.clearNotification();
            return;
        }

        if(n.type === 'POPMSG'){
            angular.forEach(notificationType, function(type) {
                if (type.name === n.type) {
                    $scope.popmsg = {
                        message: n.message,
                        title: n.title,
                        type: type
                    };
                }
            });

            $("#notificationModal").modal();
        } else {
            angular.forEach(notificationType, function(type) {
                if (type.name === n.type) {
                    $scope.notification = {
                        message: n.message,
                        type: type
                    };
                }

                if (n.payload) {
                    $scope.notification.payload = n.payload;
                }
            });

            if ($scope.notification && $scope.notification.type.timeout > 0) {
                if (notificationPromise) {
                    $timeout.cancel(notificationPromise);
                }
                notificationPromise = $timeout(function() {
                    notificationPromise = null;
                    $scope.notification = null;
                }, $scope.notification.type.timeout);
            }
        }
    });
});
