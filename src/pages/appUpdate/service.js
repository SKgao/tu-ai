/**
 * App、版本控制模块
 */
import { axios } from '@/configs/request';

export default {
	// 添加App类型
	addApptype: data => axios.post('app/type/add', data),

	// 删除App类型
	deleteApptype: data => axios.post('app/type/delete', data),

	// 禁用App类型
	disableApptype: data => axios.post('app/type/disable', data),

	// 启用App类型
	enableApptype: data => axios.post('app/type/enable', data),

	// App类型列表
    getApptype: data => axios.post('app/type/list', data),

    // 添加ver版本
	addVersion: data => axios.post('app/version/add', data),

	// 删除ver版本
	deleteVersion: data => axios.post('app/version/delete', data),

	// 禁用ver版本
	disableVersion: data => axios.post('app/version/disable', data),

	// 启用ver版本
	enableVersion: data => axios.post('app/version/enable', data),

	// ver版本列表
	getVersion: data => axios.post('app/version/page', data),

	// ios列表
    getIos: data => axios.get('app/ios', data),
}
