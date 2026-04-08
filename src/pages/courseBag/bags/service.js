/**
 * 精品课程包模块
 */
import { axios } from '@/configs/request';

export default {
	// 添加课程包
	addBag: data => axios.post(`bag/add?title=${data.title}&icon=${data.icon}`, data),

	// 改变课程包状态
	changeStatus: data => axios.post(`bag/changeStatus?id=${data.id}&status=${data.status}`, data),

	// 删除课程包
	deleteBag: data => axios.get('bag/delete/' + data, data),

	// 精品课程包列表
    getBag: data => axios.get('bag/list', data),

    // 课程包修改
    updateBag: data => axios.post(`bag/update?id=${data.id}&sort=${data.sort}&title=${data.title}&icon=${data.icon}`, data),
}
//http://test.img.tutukids.com/group1/M00/00/01/rBELkVv3XhyARF-bAAEGq1C5Q9k145.jpg