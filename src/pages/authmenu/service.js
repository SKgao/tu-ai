/**
 * 权限菜单模块
 */
import { axios } from '@/configs/request';

export default {
	// 角色列表
	getMenu: data => axios.post('menu/list', data),

	// 添加菜单
	addMenu: data => axios.post('menu/add', data),

	// 删除菜单
	deleteMenu: data => axios.post('menu/delete', data),

	// 修改菜单
	updateMenu: data => axios.post('menu/update', data),

}
