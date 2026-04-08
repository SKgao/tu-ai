/**
 * 教材管理模块
 */
import { axios } from '@/configs/request';

export default {
	// 年级列表
	getGrade: data => axios.post('grade/list', data),

	// 添加年级
	addGrade: data => axios.post('grade/add', data),

	// 同步年级
	sendGrade: data => axios.get(`test/send2line/grade/${data}`, data),

	// 修改年级
	updateGrade: data => axios.post('grade/update', data),

	// 删除年级
    deleteGrade: data => axios.get('grade/version/delete/' + data.id, data),

    // 教材列表
    getBook: data => axios.post('book/list', data),

    // 添加教材
	addBook: data => axios.post('book/add', data),

	// 删除教材
	deleteBook: data => axios.post('book/delete', data),

	// 锁定教材
	lockBook: data => axios.post(`book/lock?textbookId=${data.textbookId}&canLock=${data.canLock}`, data),

	// 修改教材
	updateBook: data => axios.post('book/update', data),

	// 同步教材
	sendBook: data => axios.get(`test/send2line/textbook/${data}`, data),

	// 添加教材版本
	addVersion: data => axios.post('book/version/add', data),

	// 教材版本列表
	getVersion: data => axios.get('book/version/list', data),

	// 同步教材版本
	sendVersion: data => axios.get(`test/send2line/book/version/${data}`, data),

	// 修改教材版本
	updateVersion: data => axios.post('book/version/update', data),

	// 删除教材版本
	deleteVersion: data => axios.get('book/version/delete/' + data.id, data),
}
