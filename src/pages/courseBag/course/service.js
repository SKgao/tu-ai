/**
 * 精品课程包模块
 */
import { axios } from '@/configs/request';

export default {
	// 精品课程包列表
    getCourseList: data => axios.get('bag/list', data),

    // 删除精品课程列表
    delCourse: data => axios.get(`course/delete/${data.id}`, data),

    // 更新课程列表
    updateCourse: data => axios.post(`course/update?id=${data.id}&name=${data.name}&icon=${data.icon}&sort=${data.sort}`, data),

    // 更改课程状态
    changeStatus: data => axios.get(`course/changeStatus?status=${data.status}&id=${data.id}`, data),

    // 添加精品课程
    addCourse: data => axios.post(`course/add?bagId=${data.bagId}&name=${data.name}&icon=${data.icon}`, data),
}

//http://test.img.tutukids.com/group1/M00/00/01/rBELkVv5OfiAE7DtAAEGq1C5Q9k68.jpeg