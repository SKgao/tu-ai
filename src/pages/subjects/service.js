/**
 * 题目模块
 */
import { axios } from '@/configs/request';

export default {
	// 题目-素材导入
	addSource: data => axios.post('subject/source/import', data),

	// 题目-详情 &sort=${data.sort}
	subjectDesc: data => axios.get(`subject/subject/desc?customsPassId=${data.customsPassId}&sort=${data.sort}`, data),

	// 题目导入
	addSubject: data => axios.post('subject/subject/import', data),

	// 题目列表
	getSubject: data => axios.post('subject/subject/list', data),

	// 题目修改
	updateSubject: data => axios.post('subject/subject/update', data),

	// 题目删除
	deleteSubject: data => axios.post('subject/delete', data),

	// 批量删除题目
	batchDeleteSubject: data => axios.post('subject/delete/batch', data),

	// ---------------------------------- 分割线 --------------------------------------
	// 题目详情
	descTopic: data => axios.get(`subject/decs/${data}`, data),

	// 题目删除
	deleteTopic: data => axios.get(`/subject/delete/${data}`, data),

	// 上传场景图
	scenePic: data => axios.post(`subject/upload/pic?id=${data.id}&scenePic=${data.scenePic}`, data),

	// 修改场景图
	updatePic: data => axios.post(`subject/upload/pic/update?id=${data.id}&scenePic=${data.scenePic}`, data),

	// 删除场景图
	deletePic: data => axios.get(`subject/del/pic/${data}`, data),
}
