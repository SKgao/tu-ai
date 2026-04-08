/**
 * 会员等级模块
 */
import { axios } from '@/configs/request';

export default {
	// 会员等级列表
    getMemberLevel: data => axios.get('member/level/list', data),
    
    // 删除会员等级
    deleteMemberLevel: data => axios.get('member/level/delete/' + data.userLevel, data),
    
    // 修改会员等级
    updateMemberLevel: data => axios.post('member/level/update', data),

    // 新增会员等级
    addMemberLevel: data => axios.post('member/level/add', data),
}
