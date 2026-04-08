import jsonp from '@/utils/jsonp';
import axios from 'axios';
import qs from 'qs';
import { message } from 'antd';

const DEFAULT_TIMEOUT = 60000;
// 正式接口
// const BASIC_URL = '//new.api.admin.tutukids.com/'
// 测试接口
const BASIC_URL = '//test.api.admin.tutukids.com/'
//const BASIC_URL = '//124.160.63.242:9003/'

axios.defaults.baseURL = BASIC_URL;
//axios.defaults.withCredentials = true;
axios.defaults.timeout = DEFAULT_TIMEOUT;

axios.defaults.headers = {
	'token': localStorage.getItem('token') || '',
	'Content-Type': 'application/json'
}

// 返回状态拦截器
axios.interceptors.response.use(res => {
	let code = res.data.code
	let msg = res.data.message
	switch (code) {
		case 45:
		case 46:
			window.location.href = '#/login'
			return false;
		case 0:
			return res;
		default:
		  	message.error(msg);
			return false;
	}
});

// axios.defaults.transformRequest = [function (data, headers) {
// 	return qs.stringify(data);
// }]

// axios.defaults.paramsSerializer = function (params) {
// 	return qs.stringify(params);
// }

// 是否为正式环境
export const isPro = BASIC_URL === '//new.api.admin.tutukids.com/'

/**
 * jsonp方法
 * @param  {[type]} url  url拼接
 * @param  {[type]} data 参数
 * @return {[type]}      [description]
 */
let J = async (url, data) => {
	return jsonp(BASIC_URL + url, {
		params: data || {},
		timeout: DEFAULT_TIMEOUT,
		jsonpCallback: 'callbackparam'
	}).then(res => {
		return res
	})
}

export {
	J,
	axios
}
