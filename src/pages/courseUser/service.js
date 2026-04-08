/**
 * 会员模块
 */
import { axios } from '@/configs/request';

export default {
	// 精品课程--用户列表
    getUser: data => axios.post('/course/user/list', data),

    // 添加用户
    addMember: data => axios.post('member/add', data),

    // 精品课程列表
	getBooklist: data => axios.post('course/list/down', data),
}
