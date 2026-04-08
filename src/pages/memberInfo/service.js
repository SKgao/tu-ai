/**
 * 会员模块
 */
import { axios } from '@/configs/request';

export default {
	// 会员列表
    getMember: data => axios.post('member/list', data),

    // 会员等级列表
    getMemberLevel: data => axios.get('member/level/list/combox', data),

    // 修改会员等级
    updateUserLevel: data => axios.post('member/level/update', data)
}
