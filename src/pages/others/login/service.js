/**
 * 登录模块
 */
import { axios } from '@/configs/request';

export default {
	// 登入
	login: data => axios.post('user/login', data),

	// 登出
	logout: () => axios.post('user/logout'),
}
