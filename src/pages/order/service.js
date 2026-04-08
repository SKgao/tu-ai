/**
 * 订单模块
 */
import { axios } from '@/configs/request';

export default {
	// 订单列表
	getOrder: data => axios.post('order/list', data),

	// 活动列表-下拉框
	activeSelect: data => axios.get('activity/list/combox', data),

	// 会员等级列表
	getMemberLevel: data => axios.get('member/level/list', data),

	// 精品课程列表
    getCourse: data => axios.post('course/list/down', data),
}
