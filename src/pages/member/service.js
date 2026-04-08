/**
 * 会员模块
 */
import { axios } from '@/configs/request';

export default {
	// 会员列表
    getMember: data => axios.post('member/all/list', data),

    // 精品课程列表
	getBooklist: data => axios.post('course/list', data),

    // 会员等级列表
    getMemberLevel: data => axios.get('member/level/list/combox', data),

    // 修改会员等级
    updateUserLevel: data => axios.post('member/level/update', data),

    // 添加用户
    addMember: data => axios.post('member/add', data),

    // 会员启用
    startMember: data => axios.get('member/startup/' + data.id, data),

    // 会员禁用
    forbiddenMember: data => axios.get('member/forbidden/' + data.id, data),

    // 会员反馈信息
    getFeedList: data => axios.post('member/feed/list', data),

    // 开通vip
    vipadd: data => axios.post('/member/vip/add', data),
}
