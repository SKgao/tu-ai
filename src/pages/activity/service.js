/**
 * 活动模块
 */
import { axios } from '@/configs/request';

export default {
	// 活动列表
	getActivity: data => axios.post('activity/list', data),

	// 会员等级列表
  	getMemberLevel: data => axios.get('member/level/list', data),

	// 新增活动
	addActivity: data => axios.post('activity/add', data),

	// 修改活动
	updateActivity: data => axios.post('activity/update', data),

	// 删除活动
	deleteActivity: data => axios.get('activity/delete/' + data.id, data),

	// 活动列表-下拉框
	activeSelect: data => axios.get('activity/list/combox', data),

	// 改变活动状态
	changeStatus: data => axios.post('activity/change/status', data),

}
