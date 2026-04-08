/**
 * 邀请人数
 */
import { axios } from '@/configs/request';

export default {
	// 获取邀请
    getInvite: data => axios.post(`member/invite/list`, data),
}
