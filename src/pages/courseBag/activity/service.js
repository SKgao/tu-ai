/**
 * 精品课程包模块
 */
import { axios } from '@/configs/request';

export default {
	// 添加课程活动
	addActivity: data => axios.post('course/active/add', data),

	// 课程活动下拉框
	getSelect: data => axios.post('course/list/down', data),

	// 课程活动列表
	getActivity: data => axios.get(`course/active/list/${data.id}`, data),

    // 课程活动修改
	updateActivity: data => axios.post('course/active/update', data),

	// 课程活动删除
	deleteActivity: data => axios.get(`course/active/del/${data.id}`, data),
}