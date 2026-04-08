/**
 * part模块
 */
import { axios } from '@/configs/request';

export default {
    // part列表
	getPart: data => axios.post('part/list', data),

	// 添加part
	addPart: data => axios.post('part/add', data),

	// 更新part
	updatePart: data => axios.post('part/update', data),

	// 删除part
	deletePart: data => axios.get('part/del/' + data, data),
}
