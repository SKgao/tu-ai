/**
 * 学习记录
 */
import { axios } from '@/configs/request';

export default {
    getRecord: data => axios.post(`/member/pass/record`, data),
}
