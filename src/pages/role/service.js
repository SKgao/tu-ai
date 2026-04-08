/**
 * 角色模块
 */
import { axios } from '@/configs/request';

export default {
	// 角色列表
	getRole: data => axios.post('role/list', data),

	// 添加角色
	addRole: data => axios.post('role/add', data),

	// 删除角色
	deleteRole: data => axios.post('role/delete', data),

	// 角色已有权限
	menusRole: data => axios.post('role/menus', data),

	// 任意角色权限
	getMenus: data => axios.get('role/menus/' + data.id, data),

	// 设置角色权限
	setauthRole: data => axios.post('role/setAuthority', data)
}
