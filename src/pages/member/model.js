import api from './service';
import { filterObj } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'member',

	state: {
		memberLevelList: [],
		bookList: [],
		feedList: [],    // 反馈列表
		pageSize: 10,
		pageNum: 1,
		totalCount: 0,
		expireStartTime: '', // 会员到期起始时间
		expireEndTime : '',  // 会员到期截止时间
		payStartTime: '',  // 会员开始起始时间
		payEndTime: '',    // 会员开始截止时间
		registerStartTime: '', // 会员注册起始时间
		registerEndTime: '',   // 会员注册截止时间
		userLevel: '', // 用户等级
		userLevelIds: [], // 用户等级id数组
		bookVersionId: '',  // 教材版本id
		sex: '',  // 性别
		tutuNumber: '', // 图图号
		mobile: '',     // 手机号
		sortInvite: '',   // 邀请人数排序
		sortUserId: '',   // 图图号排序
		modalShow: false,
		hasSetPassword: '',   // 是否设置密码
		activeKey: '0',       // 默认选中tabs
		vipButton: false,     // 是否有开通会员按钮权限

		// 开通用户模块
		userid: '',      // 用户id
		addvips: '',     // 会员id
		realName: ''    // 当前用户等级名称
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/member') {
					dispatch({
						type: 'setParam',
						payload: {
							pageNum: 1,
							pageSize: 10,
							hasSetPassword: '',
							tutuNumber: '',
							mobile: '',
							userLevelIds: [],
							expireStartTime: '', // 会员起始时间
							expireEndTime : '',  // 会员截止时间
							payStartTime: '',  // 会员开始起始时间
		          			payEndTime: '',    // 会员开始截止时间
							registerStartTime: '', // 会员注册起始时间
		          			registerEndTime: '',   // 会员注册截止时间
							bookVersionId: '',
							sex: '',
							addvips: '',
							sortInvite: '',   // 邀请人数排序
							sortUserId: '',   // 图图号排序
						}
					}).then(() => {
						dispatch({ type: 'getMember' }).then(() => {
							dispatch({ type: 'hasVipButton' });
						})
						dispatch({ type: 'getMemberLevel' });
					})
				}
			})
		},
	},

	effects: {
		// 是否有 开通会员按钮权限
		*hasVipButton({ }, { put, select }) {
			const { authsId } = yield select(state => state.app);
			yield put({
				type: 'save',
				payload: {
					vipButton: authsId.indexOf(147) > -1 // 147 - 开通会员功能
				}
			});
		},

		*getMember({ payload }, { call, put, select }) {
			const _state = yield select(state => state.member);
			const idArr = _state.userLevelIds.filter(e => e);
			const res = yield call(api.getMember, filterObj({
				userLevelIds: idArr.length ? idArr.map(e => e - 0) : '',
				expireStartTime: _state.expireStartTime,
				expireEndTime: _state.expireEndTime,
				payStartTime: _state.payStartTime,
				payEndTime: _state.payEndTime,
				registerStartTime: _state.registerStartTime,
				registerEndTime: _state.registerEndTime,
				pageNum: _state.pageNum,
				pageSize: _state.pageSize,
				bookVersionId: _state.bookVersionId,
				tutuNumber: _state.tutuNumber,
				mobile: _state.mobile,
				sex: _state.sex,
				hasSetPassword: _state.hasSetPassword,
				sortInvite: _state.sortInvite,
				sortUserId: _state.sortUserId

			}));
			if (res) {
				yield put({
					type: 'save',
					payload: {
						memberList: (res.data.data) ? res.data.data.data : [],
						totalCount: (res.data.data) ? res.data.data.totalCount : 0
					}
				});
			}
		},

		*getBooklist({ payload }, { call, put, select }) {
			const res = yield call(api.getBooklist, filterObj({
				pageNum: 1,
				pageSize: 1000
			}));
			if (res) {
				yield put({
					type: 'save',
					payload: {
						bookList: (res.data.data) ? res.data.data.data : []
					}
				});
			}
        },

        *getMemberLevel({ payload }, { call, put }) {
			const res = yield call(api.getMemberLevel, payload);
			if (res) {
				yield put({
					type: 'save',
					payload: {
						memberLevelList: (res.data) ? [{userLevel: 0, levelName: '全部'}, ...res.data.data] : []
					}
				});
			}
		},

		*getFeedList({ payload }, { call, put, select }) {
			const { startTime, endTime, pageNum, pageSize, tutuNumber, mobile } = yield select(state => state.member);
			const res = yield call(api.getFeedList, filterObj({ startTime, endTime, pageNum, pageSize, tutuNumber, mobile }));
			if (res) {
				yield put({
					type: 'save',
					payload: {
						feedList: (res.data.data) ? res.data.data.data : [],
						totalCount: (res.data.data) ? res.data.data.totalCount : 0
					}
				});
			}
		},

		*updateUserLevel({ payload }, { call, put }) {
			const res = yield call(api.updateUserLevel, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getMember'})
			}
		},

		*addMember({ payload }, { call, put }) {
			const res = yield call(api.addMember, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getMember'})
			}
		},

		*vipadd({ payload }, { call, put }) {
			const res = yield call(api.vipadd, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getMember'})
			}
		},

		*startMember({ payload }, { call }) {
			const res = yield call(api.startMember, payload);
			res && message.success(res.data.message);
		},

		*forbiddenMember({ payload }, { call }) {
			const res = yield call(api.forbiddenMember, payload);
			res && message.success(res.data.message);
		},

		*setParam({ payload }, { put }) {
			for (let key in payload) {
				yield put({
					type: 'save',
					payload: {
						[key]: payload[key]
					}
				})
			}
		}
	},

	reducers: {
		save(state, { payload }) {
			return { ...state, ...payload }
		}
	},
};
