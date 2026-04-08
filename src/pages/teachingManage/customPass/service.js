/**
 * 精品课程包模块
 */
import { axios } from '@/configs/request';

export default {
	// 添加小关卡
	addPass: data => axios.post('pass/add', data),

	// 教材下--小关卡列表
    getPass: data => axios.get(`pass/list/${data.textbookId}`, data),

    // 删除小关卡
	deletePass: data => axios.get(`/pass/delete?id=${data.id}&textbookId=${data.textbookId}`, data),

    // 小关卡修改
    updatePass: data => axios.post('pass/update', data),

    // 小关卡--题型列表
    getSubject: data => axios.get('pass/subject', data),

    // 添加单个题目
    addTopic: data => axios.post(`subject/add/one`, data),

    // 大关卡--绑定小关卡
    sessionBind: data => axios.post(
        `session/bind?textbookId=${data.textbookId}&sessionId=${data.sessionId}&customPassId=${data.customPassId}`, data),
}