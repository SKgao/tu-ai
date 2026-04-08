import { routerRedux } from 'dva/router';
import FormInlineLayout from '@/components/FormInlineLayout'; //import TableLayout from '@/components/TableLayout';
import PaginationLayout from '@/components/PaginationLayout';
import TablePopoverLayout from '@/components/TablePopoverLayout';
import MyUpload from '@/components/UploadComponent';
import { filterObj } from '@/utils/tools';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { Badge, Button, Input, Modal, Popconfirm, Table, message } from 'antd';
import { Icon, Form } from '@ant-design/compatible';
const FormItem = Form.Item;

const Session = ({
    session,
    ...props
}) => {
    let { dispatch, form } = props;
    let { sessionList, customList, passList, modalShow, modalShow2, pageNum, pageSize, textbookId, sessionTitle, partsId} = session;
    let { getFieldDecorator, validateFieldsAndScroll, resetFields, setFieldsValue } = form;

    const columns = [
        {
        	title: '大关卡id',
        	dataIndex: 'id',
            sorter: true
        },
        {
            title: '大关卡标题',
            dataIndex: 'title',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改大关卡标题'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'session/updateSession',
							payload: {
								id: record.id,
								title: v
							}
						})
					}/>
        }, {
        	title: '大关卡图标',
        	dataIndex: 'icon',
            render: (text, record, index) => {
                return (text) ? <a href={ text } target='_blank' rel="noopener noreferrer">
                    <img alt="" src={ text } style={{ width: 50, height: 35 }}/>
                </a> : <span>无</span>
            }
        }, {
            title: '状态',
            dataIndex: 'status',
            render: (txt) => {
                if (txt === 1) {
                    return <Badge status="processing" text="启用"/>;
                } else {
                    return <Badge status="warning" text="禁用"/>;
                }
            }
        }, {
        	title: '大关卡顺序',
        	dataIndex: 'sort',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改大关卡顺序'}
					valueData={text + '' || '无'}
					defaultValue={text + '' || '无'}
					onOk={v =>
						dispatch({
							type: 'session/updateSession',
							payload: {
								id: record.id,
								sort: v
							}
						})
					}/>
        }, {
            title: '上传大关卡图标',
            dataIndex: 'updateicon',
            render: (txt, record, index) => {
                return <MyUpload uploadTxt={'上传图片'} uploadSuccess={(url) => {
                    changeIcon(url, record)
                }}></MyUpload>
            }
        }, {
            title: '详情',
            dataIndex: 'link',
            render: (txt, record, index) => {
                return <span>
                    <TablePopoverLayout
                        title={'绑定小关卡'}
                        optionKey={'id'}
                        optionItem={'title'}
                        valueData={passList}
                        defaultValue={'绑定小关卡'}
                        onOk={v => {
                            bindToSession(record.id, v)
                        }}/>
                    <a onClick={() => checkCustomList(record)} style={{ marginLeft: 10 }}>已绑定小关卡</a>
                </span>
            }
        }, {
        	title: '操作',
            dataIndex: 'action',
            render: (txt, row, index) => {
                return <span>
                    {
                        partsId &&
                        <Button type="primary" size="small" onClick={() => linktoCustom(row)}>查看小关卡</Button>
                    }

                    <Button
                        type={row.status === 1 ? 'danger' : 'primary'}
                        size="small"
                        style={{ marginLeft: 10 }}
                        onClick={() => handleChangeStatus(row)}>
                        {row.status === 1 ? '禁用' : '启用'}
                    </Button>

                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(row)}>
                        <Button icon="delete" type="danger" size="small" style={{ marginLeft: 10 }}>删除</Button>
                    </Popconfirm>
                </span>
            }
        }
    ]

    const sourceCol = [
        {
            title: '小关卡标题',
            dataIndex: 'customTitle',
            render: (text) => <span>{ text + '' }</span>
        }, {
            title: '小关卡图标',
            dataIndex: 'icon',
            render: (text) => {
                return (!text) ? '无' : <img alt="" src={ text } style={{ width: 30, height: 40 }}/>
            }
        }, {
            title: '小关卡排序',
            dataIndex: 'sort',
            render: (text, record) =>
                <TablePopoverLayout
                    title={'修改小关卡顺序'}
                    valueData={text + '' || '无'}
                    defaultValue={text + '' || '无'}
                    onOk={v =>
                        dispatch({
                            type: 'session/sessionSort',
                            payload: {
                                id: record.id - 0,
                                sort: v - 0
                            }
                        })
                    }/>
        }, {
        	title: '操作',
            dataIndex: 'action',
            render: (txt, row, index) => {
                return <span>

                    <Popconfirm title="是否解除绑定小关卡?" onConfirm={() => handleUnbind(row)}>
                        <Button type="danger" size="small" style={{ marginLeft: 10 }}>解绑</Button>
                    </Popconfirm>
                </span>
            }
        }
    ]

    // key
    columns.map(e => e.key = `${e.dataIndex}_`)
    sourceCol.map(e => e.key = `_${e.dataIndex}`)

    // 调转到小关卡页面
    const linktoCustom = (record) => {
        dispatch(routerRedux.push({
            pathname: '/teachingManage/customPass',
            search: `textbookId=${textbookId}&sessionId=${record.id}&partsId=${partsId}`
        }));
    }

    /**
     * 绑定到大关卡
     * @param  {object} 列数据
     */
    const bindToSession = (sessionId, customPassId) => {
        dispatch({
    		type: 'session/sessionBind',
    		payload: {
                textbookId: textbookId - 0,
                sessionId: sessionId - 0,
                customPassId: customPassId - 0
            }
    	})
    }

    // 已绑定小关卡
    const checkCustomList = (record) => {
        dispatch({
    		type: 'session/setParam',
    		payload: {
                modalShow2: true,
                sessionTitle: record.title
    		}
    	}).then(() => {
            dispatch({
                type: 'session/getCustomList',
                payload: {
                    textbookId,
                    sessionId: record.id
                }
            })
        })
    }

    /**
     * 删除大关卡
     * @param  {object} 列数据
     */
    const handleDelete = (param) => {
        dispatch({
    		type: 'session/deleteSession',
    		payload: param.id - 0
    	})
    }

    /**
     * 解绑大关卡
     * @param  {object} 列数据
     */
    const handleUnbind = (param) => {
        dispatch({
    		type: 'session/sessionUnbind',
    		payload: param.id - 0
    	}).then(() => {
            dispatch({
                type: 'session/getCustomList',
                payload: {
                    textbookId,
                    sessionId: param.sessionId
                }
            })
        })
    }

    // 改变状态
    const handleChangeStatus = (row) => {
        dispatch({
            type: 'session/changeStatus',
            payload: {
                id: row.id - 0,
                status: row.status === 1 ? 2 : 1
            }
        })
    }

    // 修改素材
    const changeIcon = (url, record) => {
        dispatch({
    		type: 'session/updateSession',
    		payload: {
                id: record.id,
                icon: url
            }
    	})
    }

    // 展示modal
    const changeModalState = (field, show) => {
        dispatch({
        	type: 'session/setParam',
        	payload: {
                [field]: show
            }
        })
    }

    // 表单取消
    const handleReset  = (field) => {
        resetFields()
        dispatch({
    		type: 'session/setParam',
    		payload: {
    			[field]: false
    		}
    	})
    }

    // 添加大关卡
    const handleSubmit = (e) => {
        e.preventDefault()
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.id && (values.id = values.id - 0)
                values.textbookId && (values.textbookId = values.textbookId - 0)
                const idArr = sessionList.map(e => e.id)
                if (idArr.includes(values.id)) {
                    message.warning('大关卡id已存在！')
                } else {
                    dispatch({
                        type: 'session/addSession',
                        payload: filterObj(values)
                    }).then(() => {
                        handleReset('modalShow')
                    })
                }
            }
        })
    }

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'session/setParam',
    		payload: param
        }).then(() => {
            dispatch({ type: 'session/getSessionList' })
        })
    }

    // 文件上传成功
    const uploadSuccess = (url) => setFieldsValue({'icon': url})

    // 返回
    const goBack = () => dispatch(routerRedux.goBack(-1))

	return (
		<div>
			<FormInlineLayout>
			    <Form layout="inline" style={{ marginLeft: 15 }}>
                    <FormItem>
                        <Button type="primary" onClick={() => changeModalState('modalShow', true)}>添加大关卡</Button>
                    </FormItem>

                    <FormItem>
                        <a className={'link-back'} onClick={goBack}><Icon type="arrow-left"/>后退</a>
                    </FormItem>
                </Form>
            </FormInlineLayout>

            <Modal
                title="新增大关卡"
                visible={modalShow}
                onOk={ () => changeModalState('modalShow', false) }
                onCancel= { () => changeModalState('modalShow', false) }
                okText="确认"
                cancelText="取消"
                footer={null}
                >
                <Form>
                    <FormItem
                        label="教材id"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('textbookId', {
                            initialValue: textbookId,
                            rules: [{ required: true, message: '请输入教材id!' }],
                        })(
                            <Input disabled/>
                        )}
                    </FormItem>

                    <FormItem
                        label="大关卡id"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('id', {
                            rules: [{ required: true, message: '请输入大关卡id!' }],
                        })(
                            <Input  placeholder="请输入大关卡id"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="大关卡标题"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('title', {
                            rules: [{ required: true, message: '请输入大关卡标题!', whitespace: true }],
                        })(
                            <Input placeholder="请输入大关卡标题"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="大关卡图片"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('icon', {
                            rules: [{
                                message: '请上传大关卡图片!',
                                whitespace: true
                            }],
                        })(
                            <MyUpload uploadSuccess={uploadSuccess}></MyUpload>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}>
                        <Button type="primary" onClick={handleSubmit} style={{ marginLeft: 75 }}>提交</Button>
                        <Button onClick={() => handleReset('modalShow')} style={{ marginLeft: 15 }}>取消</Button>
                    </FormItem>
                </Form>
            </Modal>

            <Modal
                title={`${sessionTitle}--已绑定小关卡`}
                visible={modalShow2}
                onOk={ () => changeModalState('modalShow2', false) }
                onCancel= { () => changeModalState('modalShow2', false) }
                okText="确认"
                cancelText="取消"
                footer={null}
                >
                <Table
                    columns={sourceCol}
                    dataSource={customList}
                    pagination={false}
                />
            </Modal>

            <Table
                dataSource={sessionList}
                columns={columns}
                pagination={false}
                // onExpand={(expanded, record) => {
                //     if (expanded) {
                //         dispatch({
                //             type: 'session/getCustomList',
                //             payload: {
                //                 textbookId: textbookId,
                //                 sessionId: record.id - 0
                //             }
                //         })
                //     }
                //     dispatch({
                //         type: 'session/setParam',
                //         payload: {
                //             textbookId: textbookId,
                //             sessionId: record.id - 0
                //         }
                //     })
                // }}
                // expandedRowRender={(record, index) => expandedRowRender(record, index)}
                // expandRowByClick={false}
            />
            {
                !!session.totalCount &&
                <PaginationLayout
                    total={session.totalCount}
                    onChange={(page, pageSize) => handleChange({
                        pageNum: page,
                        pageSize
                    })}
                    onShowSizeChange={(current, pageSize) => handleChange({
                        pageNum: 1,
                        pageSize
                    })}
                    current={pageNum}
                    pageSize={pageSize} />
            }
		</div>
	)
};

Session.propTypes = {
    session: PropTypes.object
};

export default connect(({ session }) => ({ session }))(Form.create()(Session));
