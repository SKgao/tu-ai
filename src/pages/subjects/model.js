import api from './service';
import api_teachingManage from '@/pages/teachingManage/book/service';
import { filterObj, getUrlParams } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'subject',

	state: {
		subjectList: [],     // 题目列表
		descList: [],        // 题目详情
        bookList: [],        // 教材列表
		customsPassName: '', // 关卡名
        subjectTypeId: '',   // 题目类型id
        startTime: '',
		endTime: '',
		partsId: '',         // partid
		sourceIds: '',       // 搜索题目内容
        modalShow: false,    // 添加题目
		modal2Show: false,   // 添加素材
		modal3Show: false,   // 添加素材
		textBookId: '',       // 教材id
		customsPassId: '',    // 关卡id
		sort: 0,             // 题目顺序
		detpage: false,      // 是否为题目详情页

		audioArray: [],      // 音频文件
		imageArray: [],      // 图片文件
		file: [],            // 题目文件
		addType: '2',          // 导入题目类型（默认导入）
		activeKey: '0',      // tabs选项
        pageSize: 10,
        pageNum: 1,
		totalCount: 0,

		// 批量删除
		idArr: [], // 批量删除题目
        selectedRowKeys: [], // 默认选中项

		// 题目id
		topicId: '',
		icon: '',
		sentenceAudio: '',
		audio: '',
		sceneGraph: ''
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/subjects') {
					let search = location.search.slice(1)
					let detpage = getUrlParams(location.search, 'detpage')
					let customsPassId = getUrlParams(location.search, 'customsPassId')
					let sort = getUrlParams(location.search, 'sort')
					let customsPassName = getUrlParams(location.search, 'customsPassName')
					let textBookId = getUrlParams(location.search, 'textBookId')
					let partsId = getUrlParams(location.search, 'partsId')
					let topicId = getUrlParams(location.search, 'topicId')
					if (search) {
						dispatch({
							type: 'setParam',
							payload: {
								subjectList: [],
								descList: [],
								detpage: detpage || '',
								customsPassId: customsPassId ? customsPassId - 0 : '',
								sort: sort ? sort - 0 : '',
								customsPassName: customsPassName || '',
								textBookId: textBookId ? textBookId - 0 : '',
								partsId: partsId ? partsId - 0 : '',
								topicId: topicId ? topicId - 0 : ''
							}
						})
						if (detpage) {
							dispatch({ type: 'subjectDesc' })
						} else {
							dispatch({
								type: 'getSubject',
								payload: {
									textBookId: textBookId ? textBookId - 0 : '',
									partsId: partsId ? partsId - 0 : '',
									customsPassId: customsPassId ? customsPassId - 0 : '',
									pageSize: 10,
                                    pageNum: 1
								}
							})
						}
					} else {
						dispatch({
							type: 'setParam',
							payload: {
								startTime: '',
		                        endTime: '',
								activeKey: '0',
								customsPassId: '',
								customsPassName: '',
								sort: '',
								sourceIds: '',
								textBookId: '',
								subjectTypeId: '',
								partsId: '',
								idArr: [], // 批量删除题目
   								selectedRowKeys: [], // 默认选中项
								pageSize: 10,
                                pageNum: 1
							}
						})
						dispatch({
							type: 'getSubject',
							payload: {
								startTime: '',
		                        endTime: '',
								customsPassId: '',
								customsPassName: '',
								sort: '',
								sourceIds: '',
								textBookId: '',
								subjectTypeId: '',
								partsId: '',
								pageSize: 10,
                                pageNum: 1
							}
						})
					}
				}
			});
		}
	},

	effects: {
		*getSubject({ payload }, { call, put, select }) {
			const { startTime, endTime, pageNum, pageSize, sourceIds, customsPassName, customsPassId, partsId, textBookId } = yield select(state => state.subject);
			const _pay = { startTime, endTime, pageNum, pageSize, sourceIds, customsPassName, customsPassId, partsId, textBookId}
			const res = yield call(api.getSubject, filterObj(_pay))
			if (res) {
				yield put({
					type: 'save',
					payload: {
                        subjectList: [],
                        totalCount:  0
					}
				})
				yield put({
					type: 'save',
					payload: {
                        subjectList: (res.data.data) ? res.data.data.data : [],
                        totalCount: (res.data.data) ? res.data.data.totalCount : 0
					}
				})
			}
		},

		*subjectDesc({ payload }, { call, put, select }) {
			const { topicId } = yield select(state => state.subject);
			const res = yield call(api.descTopic, topicId)
			if (res) {
				yield put({
					type: 'save',
					payload: {
                        descList: (res.data.data) ? [res.data.data] : []
					}
				})
			}
		},

		*scenePic({ payload }, { call, put, select }) {
			const res = yield call(api.scenePic, payload)
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getSubject' });
			}
		},

		*updatePic({ payload }, { call, put, select }) {
			const res = yield call(api.updatePic, payload)
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getSubject' });
			}
		},

		*deletePic({ payload }, { call, put, select }) {
			const res = yield call(api.deletePic, payload)
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getSubject' });
			}
		},

		// 批量删除
		*batchDeleteSubject({ payload }, { call, put }) {
			const res = yield call(api.batchDeleteSubject, payload);
			if (res) {
			  message.success(res.data.message);
			  yield put({
				type: 'setParam',
				payload: {
				  idArr: [],
				  selectedRowKeys: []
				}
			  })

			  yield put({ type: 'getSubject' });
			}
		},

        *addSource({ payload }, { call, put, select }) {
			const res = yield call(api.addSource, payload);
			if (res) {
				message.success(res.data.message);
				yield put({
					type: 'setParam',
					payload: {
						audioArray: [],
						imageArray: [],
						modal2Show: false,
						activeKey: '1'
					}
				})
			}
        },

        *addSubject({ payload }, { call, put, select }) {
			const res = yield call(api.addSubject, payload);
			if (res) {
				yield put({
					type: 'setParam',
					payload: {
						file: [],
						modalShow: false,
						activeKey: '1'
					}
				})
			}
		},

		*updateSubject({ payload }, { call, put, select }) {
			const res = yield call(api.updateSubject, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getSubject' })
			}
		},

		*deleteSubject({ payload }, { call, put }) {
			const res = yield call(api.deleteTopic, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getSubject' })
			}
		},

		*addTopic({ payload }, { call, put }) {
			const res = yield call(api.addTopic, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getSubject' })
			}
		},

        *getBook({ payload }, { call, put, select }) {
			const res = yield call(api_teachingManage.getBook, {
                pageNum: 1,
                pageSize: 100
            });
			if (res) {
				yield put({
					type: 'save',
					payload: {
						bookList: (res.data.data) ? res.data.data.data : []
					}
				})
			}
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
