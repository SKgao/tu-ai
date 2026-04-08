module.exports = {
	// 单独页面打开
	singleView: ['/login'],

	// 隐藏左侧导航
	hideLeftView: ['/authority'],

	// 表单布局
    formItemLayout: {
        labelCol: {
            xs: { span: 14 },
            sm: { span: 6 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 },
        }
    },

	datalist: [
		{
			name: '用户管理',
			icon: 'team',
			modelpage: '/userSetting',
			id: 1
		},
		{
			name: '角色管理',
			icon: 'user-add',
			modelpage: '/roleSetting',
			id: 4
		},
		{
			name: '菜单管理',
			icon: 'tuisong',
			modelpage: '/authMenu',
			id: 3
		},
		{
			name: '教材管理',
			icon: 'book',
			modelpage: '/teachingManage',
			id: 400
		},
		{
			name: 'App版本控制',
			icon: 'reload',
			modelpage: '/appverUpdate',
			id: 500
		}
		// {
		// 	name: '系统管理',
		// 	icon: 'appstore-o',
		// 	modelpage: '',
		// 	id: 4,
		// 	children: [
		// 		{
		// 			name: '日志管理',
		// 			icon: 'calendar',
		// 			modelpage: '',
		// 			id: 5,
        //             children: [
		// 				{
		// 					name: '删除日志',
		// 					icon: '',
		// 					modelpage: '/system/logs/deleteLogs',
		// 				}
		// 			]
		// 		}
		// 	]
		// }
	]
}