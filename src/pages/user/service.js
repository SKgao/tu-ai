/**
 * 用户模块
 */
import { axios } from '@/configs/request';

export default {
	// 用户列表
	getUser: data => axios.post('user/list', data),

	// 添加用户
	addUser: data => axios.post('user/add', data),

	// 修改用户
	updateUser: data => axios.post('user/update', data),

	// 删除用户
	deleteUser: data => axios.post('user/delete', data),

	// 禁用用户
	forbiddenUser: data => axios.post('user/forbidden', data),

	// 启用用户
	usingUser: data => axios.post('user/using', data)
}
