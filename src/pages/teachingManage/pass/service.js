/**
 * 关卡模块
 */
import { axios } from '@/configs/request';

export default {
	// 添加关卡
	addPass: data => axios.post('pass/add', data),

	// 关卡列表
    getPass: data => axios.get('pass/list/' + data.partsId, data),

    // 题型列表
    getSubject: data => axios.get('pass/subject'),

	// 删除关卡
    deletePass: data => axios.get('pass/delete/' + data, data),

    // 修改关卡
	updatePass: data => axios.post('pass/update', data)
}
