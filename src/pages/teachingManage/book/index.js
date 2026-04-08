import PropTypes from 'prop-types';
import { routerRedux } from 'dva/router';
import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';
import TablePopoverLayout from '@/components/TablePopoverLayout';
import PaginationLayout from '@/components/PaginationLayout';
import MyUpload from '@/components/UploadComponent';

import moment from 'moment';
import { filterObj } from '@/utils/tools';

import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { axios, isPro } from '@/configs/request';
import { Input, Button, Popconfirm, Modal, Tabs, Select, DatePicker, message, Badge } from 'antd';
import { Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;

const TeachingManage = ({
    teachingmanage,
    loading,
    ...props
}) => {
    let { dispatch, form } = props;
    let { bookList, gradeList, versionList, modalShow, activeKey, bookVersionName, gradeName} = teachingmanage;
    let { getFieldDecorator, getFieldValue, resetFields, setFieldsValue } = form;

    // 表格配置
    const columnsOpt = {
        bookList, gradeList, versionList,
        // 书籍管理表格
        bookColumns: [
            {
                title: '教材名',
                dataIndex: 'name',
                render: (text, record) =>
                    <TablePopoverLayout
                        title={'修改教材名'}
                        valueData={text || '无'}
                        defaultValue={text || '无'}
                        onOk={v =>
                            dispatch({
                                type: 'teachingmanage/updateBook',
                                payload: {
                                    id: record.id,
                                    name: v
                                }
                            })
                        }/>
            }, {
                title: '创建时间',
                dataIndex: 'createdAt'
            }, {
                title: '年级',
                dataIndex: 'gradeId',
                sorter: true,
                render: (text, record) =>
                    <TablePopoverLayout
                        title={'修改年级'}
                        valueData={gradeList}
                        focusSelect={() => dispatch({type: 'teachingmanage/getGrade'})}
                        optionKey={'id'}
                        optionItem={'gradeName'}
                        defaultValue={text || '无'}
                        onOk={v =>
                            dispatch({
                                type: 'teachingmanage/updateBook',
                                payload: {
                                    id: record.id,
                                    gradeId: v - 0
                                }
                            })
                        }/>
            }, {
                title: '教材版本',
                dataIndex: 'bookVersionId',
                sorter: true,
                render: (text, record) =>
                    <TablePopoverLayout
                        title={'修改教材版本'}
                        valueData={versionList}
                        focusSelect={() => dispatch({type: 'teachingmanage/getVersion'})}
                        optionKey={'id'}
                        optionItem={'name'}
                        defaultValue={text || '无'}
                        onOk={v =>
                            dispatch({
                                type: 'teachingmanage/updateBook',
                                payload: {
                                    id: record.id,
                                    bookVersionId: v - 0
                                }
                            })
                    }/>
            }, {
                title: '教材封面图',
                dataIndex: 'icon',
                sorter: true,
                render: (text) => {
                   return (text) ?  <a href={ text } target='_blank' rel="nofollow noopener noreferrer">
                        <img alt="" src={ text } style={{ width: 35, height: 40 }}/>
                    </a> : <span>无</span>
                }
            }, {
                title: '年级顺序',
                dataIndex: 'status',
                sorter: true
            }, {
                title: '是否锁定',
                dataIndex: 'canLock',
                sorter: true,
                render: (txt) => {
                    if (txt === 1) {
                        return <Badge status="processing" text="已解锁"/>;
                    } else {
                        return <Badge status="warning" text="已锁定"/>;
                    }
                }
            }, {
                title: '上传封面图',
                dataIndex: 'updateicon',
                render: (txt, record, index) => {
                    return <MyUpload uploadTxt={'上传封面图'} uploadSuccess={(url) => changeImages(url, record)}></MyUpload>
                }
            }, {
                title: '详情',
                dataIndex: 'link',
                render: (txt, record, index) => {
                    return <span>
                        <a onClick={() => linktoUnit(record)} style={{ marginLeft: 10 }}>查看单元</a>
                        <a onClick={() => linktoSession(record)} style={{ marginLeft: 10 }}>查看大关卡</a>
                        <a onClick={() => linktoCustomPass(record)} style={{ marginLeft: 10 }}>查看小关卡</a>
                    </span>
                }
            }, {
                title: '操作',
                dataIndex: 'action',
                render: (txt, record, index) => {
                    let islock = record.canLock === 1 ? '锁定' : '解锁'
                    return <span>

                        <Popconfirm title={`是否${islock}该教材？`} onConfirm={() => handleLock(record)}>
                            <Button
                                icon={record.canLock === 1 ? 'lock' : 'unlock'}
                                size="small"
                                style={{ marginLeft: 10 }}>
                                { islock }
                            </Button>
                        </Popconfirm>

                        {
                            isPro ? null : <Popconfirm title="是否同步该教材?" onConfirm={() => handleSendBook(record)}>
                                <Button icon="reload" type="primary" size="small" style={{ marginLeft: 10 }}>同步</Button>
                            </Popconfirm>
                        }

                        <Popconfirm title="是否删除?" onConfirm={() => handleDelete(record)}>
                            <Button icon="delete" type="danger" size="small" style={{ marginLeft: 10 }}>删除</Button>
                        </Popconfirm>
                    </span>
                }
            }
        ],
        // 年级管理表格
        gradeColumns: [
            {
                title: '年级名称',
                dataIndex: 'gradeName',
                render: (text, record) =>
                    <TablePopoverLayout
                        title={'修改年级名称'}
                        valueData={text || '无'}
                        defaultValue={text || '无'}
                        onOk={v =>
                            dispatch({
                                type: 'teachingmanage/updateGrade',
                                payload: {
                                    id: record.id,
                                    gradeName: v
                                }
                            })
                        }/>
            }, {
                title: '年级id',
                dataIndex: 'id',
                sorter: true
            }, {
                title: '年级顺序',
                dataIndex: 'status',
                sorter: true,
                render: (text, record) =>
                    <TablePopoverLayout
                        title={'修改年级顺序'}
                        valueData={text || '0'}
                        defaultValue={text || '0'}
                        onOk={v =>
                            dispatch({
                                type: 'teachingmanage/updateGrade',
                                payload: {
                                    id: record.id,
                                    status: v - 0
                                }
                            })
                    }/>
            }, {
                title: '操作',
                dataIndex: 'action',
                render: (txt, record, index) => {
                    return <span>
                        {
                            isPro ? null : <Popconfirm title="是否同步该年级?" onConfirm={() => handleSendGrade(record)}>
                                <Button icon="reload" type="primary" size="small" style={{ marginLeft: 10 }}>同步</Button>
                            </Popconfirm>
                        }

                        <Popconfirm title="是否删除?" onConfirm={() => handleDeleteGrade(record)}>
                            <Button icon="delete" type="danger" size="small" style={{ marginLeft: 10 }}>删除</Button>
                        </Popconfirm>
                    </span>
                }
            }
        ],
        // 版本管理表格
        versionColumns: [
            {
                title: '教材版本名称',
                dataIndex: 'name',
                render: (text, record) =>
                    <TablePopoverLayout
                        title={'修改教材版本名称'}
                        valueData={text || '无'}
                        defaultValue={text || '无'}
                        onOk={v =>
                            dispatch({
                                type: 'teachingmanage/updateVersion',
                                payload: {
                                    id: record.id,
                                    name: v
                                }
                            })
                        }/>
            }, {
                title: '教材版本id',
                dataIndex: 'id',
                sorter: true
            }, {
                title: '操作',
                dataIndex: 'action',
                render: (txt, record, index) => {
                    return <span>
                        {
                            isPro ? null : <Popconfirm title="是否同步该版本?" onConfirm={() => handleSendVersion(record)}>
                                <Button icon="reload" type="primary" size="small" style={{ marginLeft: 10 }}>同步</Button>
                            </Popconfirm>
                        }

                        <Popconfirm title="是否删除?" onConfirm={() => handleDeleteVersion(record)}>
                            <Button icon="delete" type="danger" size="small" style={{ marginLeft: 10 }}>删除</Button>
                        </Popconfirm>
                    </span>
                }
            }
        ]
    }

    // 修改素材
    const changeImages = (url, record) => {
        axios.post('book/update', {
            id: record.id,
            icon: url
        })
        .then((res) => {
            if (res.data.code === 0) {
                message.success(res.data.message);
                dispatch({ type: 'getBook' })
            } else {
                message.error(res.data.message)
            }
        })
    }

    // 跳转到单元页面
    const linktoUnit = (record) => {
        dispatch(routerRedux.push({
            pathname: '/teachingManage/unit',
            search: `textBookId=${record.id}`
        }));
    }

    // 跳转到大关卡
    const linktoSession = (record) => {
        dispatch(routerRedux.push({
            pathname: '/teachingManage/session',
            search: `textbookId=${record.id}`
        }));
    }

    // 调转到小关卡
    const linktoCustomPass = (record) => {
        dispatch(routerRedux.push({
            pathname: '/teachingManage/customPass',
            search: `textbookId=${record.id}`
        }));
    }

    /**
     * 删除年级
     * @param  {object} 列数据
     */
    const handleDeleteGrade = (param) => {
        dispatch({
    		type: 'teachingmanage/deleteGrade',
    		payload: {
                id: param.id
            }
    	})
    }

    /**
     * 删除教材版本
     * @param  {object} 列数据
     */
    const handleDeleteVersion = (param) => {
        dispatch({
    		type: 'teachingmanage/deleteVersion',
    		payload: {
                id: param.id
            }
    	})
    }

    /**
     * 删除教材
     * @param  {object} 列数据
     */
    const handleDelete = (param) => {
        dispatch({
    		type: 'teachingmanage/deleteBook',
    		payload: param.id
    	})
    }

    /**
     * 同步教材
     * @param  {object} 列数据
     */
    const handleSendBook = (param) => {
        dispatch({
    		type: 'teachingmanage/sendBook',
    		payload: param.id
    	})
    }

    /**
     * 同步教材版本
     * @param  {object} 列数据
     */
    const handleSendVersion = (param) => {
        dispatch({
    		type: 'teachingmanage/sendVersion',
    		payload: param.id
    	})
    }

    /**
     * 同步年级
     * @param  {object} 列数据
     */
    const handleSendGrade = (param) => {
        dispatch({
    		type: 'teachingmanage/sendGrade',
    		payload: param.id
    	})
    }

    /**
     * 锁定教材
     * @param  {object} 列数据
     */
    const handleLock = (param) => {
        dispatch({
    		type: 'teachingmanage/lockBook',
    		payload: {
                textbookId: param.id,
                canLock: param.canLock === 1 ? 2 : 1
            }
    	})
    }

    // 搜索
    const handleSearch = () => {
     	dispatch({ type: 'teachingmanage/getBook'})
    }

    // 添加书籍
    const handleSubmit = () => {
        dispatch({
        	type: 'teachingmanage/addBook',
        	payload: filterObj({
                name: getFieldValue('name'),
                icon: getFieldValue('icon'),
                gradeId: getFieldValue('gradeId'),
                bookVersionId: getFieldValue('bookVersionId')
            })
        })
    }

    // 添加年级、教材版本
    const handleAdd = (param) => {
        let _name = (param === 'Grade') ? gradeName : bookVersionName;
        if (_name.trim()) {
            dispatch({
                type: 'teachingmanage/add' + param,
                payload: _name
            })
        } else {
            let _msg = (param === 'Grade') ? '年级' : '教材版本';
            message.warning(`请输入${_msg}名称`)
        }
    }

    // 表单取消
    const handleReset  = () => {
        resetFields()
        dispatch({
    		type: 'teachingmanage/setParam',
    		payload: {
    			modalShow: false
    		}
    	})
    }

    // 选择下拉框
    const changeSelect = (v) => {
    	dispatch({
    		type: 'teachingmanage/setParam',
    		payload: v
    	})
    }

    // 展示modal
    const changeModalState = (flag, show) => {
        dispatch({
        	type: 'teachingmanage/setParam',
        	payload: {
                [flag]: show
            }
        })
    }

    // 选择时间框
    const datepickerChange = (d, t) => {
        dispatch({
        	type: 'teachingmanage/setParam',
        	payload: {
                startTime: t[0] ? t[0] + ':00' : '',
                endTime: t[1] ? t[1] + ':00' : ''
            }
        })
    }

    // 切换tabs
    const handleTabChange = (key = 'book') => {
        dispatch({
    		type: 'teachingmanage/setParam',
    		payload: {
                activeKey: key,
                pageSize: 10,
                pageNum: 1
            }
    	})
        if (key === 'grade') {
            dispatch({ type: 'teachingmanage/getGrade' })
        } else if (key === 'version') {
            dispatch({ type: 'teachingmanage/getVersion' })
        } else if (key === 'book') {
            dispatch({ type: 'teachingmanage/getBook'})
        }
    }

    // 文件上传成功
    const uploadSuccess = (url) => {
        setFieldsValue({'icon': url})
    }

    // 存入输入框值
	const handleInput = (e, paramName) => {
		dispatch({
			type: 'teachingmanage/setParam',
			payload: {
				[paramName]: e.target.value
			}
		})
    }

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'teachingmanage/setParam',
    		payload: param
        })
        dispatch({ type: 'teachingmanage/getBook' })
    }

	return (
		<div>
            <Tabs
                animated={false}
                activeKey={activeKey}
                onChange={handleTabChange}
            >
            <TabPane tab="书籍管理" key="book">
                <FormInlineLayout>
                    <Form layout="inline" style={{ marginLeft: 15 }}>
                        {/*时间*/}
                        <FormItem label="时间">
                            <RangePicker
                                format="YYYY-MM-DD HH:mm"
                                showTime={{
                                    hideDisabledOptions: true,
                                    defaultValue: [moment('00:00', 'HH:mm'), moment('11:59', 'HH:mm')],
                                }}
                                format="YYYY-MM-DD HH:mm"
                                onChange={datepickerChange}
                                />
                        </FormItem>

                        {/*年级*/}
                        <FormItem label="年级">
                            <Select
                                showSearch
                                placeholder="请选择年级"
                                onFocus={() => dispatch({type: 'teachingmanage/getGrade'})}
                                onChange={v => changeSelect({gradeId: v})}
                                >
                                {
                                    [{id: '', gradeName: '全部'}, ...gradeList].map(item =>
                                        <Option key={item.id} value={item.id}>{item.gradeName}</Option>
                                    )
                                }
                            </Select>
                        </FormItem>

                        {/*教材版本*/}
                        <FormItem label="教材版本">
                            <Select
                                showSearch
                                placeholder="请选择教材版本"
                                onFocus={() => dispatch({type: 'teachingmanage/getVersion'})}
                                onChange={v => changeSelect({bookVersionId: v})}
                                >
                                {
                                    [{id: '0', name: '全部'}, ...versionList].map(item =>
                                        <Option key={item.id} value={item.id}>{item.name}</Option>
                                    )
                                }
                            </Select>
                        </FormItem>

                        <FormItem>
                            <Button type="primary" icon="search" onClick={handleSearch}>搜索</Button>
                        </FormItem>

                        <FormItem>
                            <Button type="primary" onClick={() => changeModalState('modalShow', true)}>添加教材</Button>
                        </FormItem>

                    </Form>
                </FormInlineLayout>

                <Modal
                    title="新增教材"
                    visible={modalShow}
                    onCancel= { () => changeModalState('modalShow',false) }
                    okText="确认"
                    cancelText="取消"
                    footer={null}
                    >
                    <Form>
                        <FormItem
                            label="教材名称"
                            {...formItemLayout}
                            >
                            {getFieldDecorator('name', {
                                rules: [{ required: true, message: '请输入教材名!', whitespace: true }],
                            })(
                                <Input placeholder="请输入教材名"/>
                            )}
                        </FormItem>

                        <FormItem
                            label="教材封面图"
                            {...formItemLayout}
                            >
                            {getFieldDecorator('icon', {
                                rules: [{
                                    message: '请上传书本素材!',
                                    whitespace: true
                                }],
                            })(
                                <MyUpload uploadSuccess={uploadSuccess}></MyUpload>
                            )}
                        </FormItem>

                        <FormItem
                            label="年级"
                            hasFeedback
                            {...formItemLayout}
                            >
                            {getFieldDecorator('gradeId', {
                                rules: [{ required: true, message: '请选择年级!' }],
                            })(
                                <Select
                                    placeholder="请选择年级"
                                    showSearch
                                    onFocus={() => dispatch({type: 'teachingmanage/getGrade'})}
                                    >
                                    {
                                        gradeList.map(item =>
                                            <Option key={item.id} value={item.id}>{item.gradeName}</Option>
                                        )
                                    }
                                </Select>
                            )}
                        </FormItem>

                        <FormItem
                            label="教材版本"
                            hasFeedback
                            {...formItemLayout}
                            >
                            {getFieldDecorator('bookVersionId', {
                                rules: [{ required: true, message: '请选择教材版本!' }],
                            })(
                                <Select
                                    placeholder="请选择教材版本"
                                    showSearch
                                    onFocus={() => dispatch({type: 'teachingmanage/getVersion'})}
                                    >
                                    {
                                        versionList.map(item =>
                                            <Option key={item.id} value={item.id}>{item.name}</Option>
                                        )
                                    }
                                </Select>
                            )}
                        </FormItem>

                        <FormItem
                            {...formItemLayout}>
                            <Button type="primary" onClick={handleSubmit} style={{ marginLeft: 75 }}>提交</Button>
                            <Button onClick={handleReset} style={{ marginLeft: 15 }}>取消</Button>
                        </FormItem>
                    </Form>
                </Modal>
            </TabPane>

            <TabPane tab="年级管理" key="grade">
                <FormInlineLayout>
                    <Form layout="inline" style={{ marginLeft: 15 }}>
                        <FormItem>
                            <Input placeholder="请输入年级名称" onChange={(e) => handleInput(e, 'gradeName')}/>
                        </FormItem>

                        <FormItem>
                            <Button type="primary" onClick={() => handleAdd('Grade')}>添加年级</Button>
                        </FormItem>
                    </Form>
                </FormInlineLayout>
            </TabPane>

            <TabPane tab="教材版本" key="version">
                <FormInlineLayout>
                    <Form layout="inline" style={{ marginLeft: 15 }}>
                        <FormItem>
                            <Input placeholder="请输入教材版本" onChange={(e) => handleInput(e, 'bookVersionName')}/>
                        </FormItem>

                        <FormItem>
                            <Button type="primary" onClick={() => handleAdd('Version')}>添加教材版本</Button>
                        </FormItem>
                    </Form>
                </FormInlineLayout>
            </TabPane>
        </Tabs>

            <TableLayout
                pagination={false}
                loading={ loading.effects['teachingmanage/getBook'] || loading.effects['teachingmanage/getVersion'] }
                dataSource={columnsOpt[activeKey + 'List']}
                allColumns={columnsOpt[activeKey + 'Columns']}
                scrollX={true}
                />
            {
                activeKey === 'book' &&
                <PaginationLayout
                    total={teachingmanage.totalCount}
                    onChange={(page, pageSize) => handleChange({
                        pageNum: page,
                        pageSize
                    })}
                    onShowSizeChange={(current, pageSize) => handleChange({
                        pageNum: 1,
                        pageSize
                    })}
                    current={teachingmanage.pageNum}
                    pageSize={teachingmanage.pageSize} />
            }
		</div>
	)
};

TeachingManage.propTypes = {
    teachingmanage: PropTypes.object
};

export default connect(({ teachingmanage, loading }) => ({ teachingmanage, loading }))(Form.create()(TeachingManage));
