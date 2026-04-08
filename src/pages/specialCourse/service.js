/**
 * 精品课程模块
 */
import { axios } from '@/configs/request';

export default {
	// 精品课程列表
	getCourse: data => axios.post('course/list', data),

	// 已买精品课程列表
    buyCourse: data => axios.get('/course/course/list/' + data, data),

    // 精品课程列表下拉框
	getCourseList: data => axios.post('course/list/down', data),

	// 添加精品课程
	addCourse: data => axios.post('course/add', data),

	// 删除精品课程 {textbookId}
	deleteCourse: data => axios.get('course/delete/' + data, data),

	// 下架精品课程 {textbookId}
	downCourse: data => axios.get('course/down/' + data, data),

	// 上架精品课程
	upCourse: data => axios.get('course/up/' + data, data),

	// 更新精品课程
	updateCourse: data => axios.post('course/update', data)
}
