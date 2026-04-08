import { routerRedux } from 'dva/router';
import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';
import PaginationLayout from '@/components/PaginationLayout';
import TablePopoverLayout from '@/components/TablePopoverLayout';
import MyUpload from '@/components/UploadComponent';
import AddProject from '../customPass/AddProject';
import { filterObj } from '@/utils/tools';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { Button, Input, Modal, message } from 'antd';
import { Form, Icon } from '@ant-design/compatible';
const FormItem = Form.Item;

const CustomPass = ({
    customPass,
    ...props
}) => {
    let { dispatch, form } = props;
    let { passList, modalShow, modalShow3, pageNum, pageSize, textbookId, partsId, sessionId} = customPass;
    let { getFieldDecorator, validateFieldsAndScroll, resetFields, setFieldsValue } = form;

    const columns = [
        {
        	title: '小关卡id',
        	dataIndex: 'id',
            sorter: true
        },
        {
            title: '小关卡标题',
            dataIndex: 'title',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改小关卡标题'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'customPass/updatePass',
							payload: {
                                textbookId: textbookId - 0,
								id: record.id,
                                title: v,
                                icon: record.icon,
                                tmpTitle: record.tmpTitle
							}
						})
					}/>
        }, {
            title: '小关卡过渡标题',
            dataIndex: 'tmpTitle',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改小关卡过渡标题'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'customPass/updatePass',
							payload: {
                                textbookId: textbookId - 0,
								id: record.id,
                                tmpTitle: v,
                                title: record.title,
                                icon: record.icon
							}
						})
					}/>
        }, {
        	title: '小关卡图标',
        	dataIndex: 'icon',
            render: (text, record, index) => {
                return (text) ? <a href={ text } target='_blank' rel="noopener noreferrer"><img alt="" src={ text } style={{ width: 50, height: 35 }}/></a> : <span>无</span>
            }
        }, {
        	title: '小关卡顺序',
        	dataIndex: 'sort',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改关卡顺序'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'customPass/updatePass',
							payload: {
								id: record.id,
								sort: v
							}
						})
					}/>
        }, {
        	title: '创建时间',
        	dataIndex: 'createdAt'
        }, {
        	title: '修改小关卡图标',
        	dataIndex: 'updateicon',
            render: (text, record, index) => {
                return <MyUpload uploadSuccess={(url) => {
                    changeIcon(url, record)
                }}></MyUpload>
            }
        }, {
        	title: '操作',
            dataIndex: 'action',
            render: (txt, record, index) => {
                return <span>

                    {/* <Popconfirm title="是否删除?" onConfirm={() => handleDelete(record)}>
                        <Button icon="delete" type="danger" size="small" style={{ marginLeft: 10 }}>删除</Button>
                    </Popconfirm> */}

                    {
                        partsId &&
                        <Button type="primary" size="small" onClick={() => linktoProject(record)} style={{ marginLeft: 10 }}>查看题目</Button>
                    }
                </span>
            }
        }
    ]

    // 调转到关卡页面
    const linktoProject = (record) => {
        dispatch(routerRedux.push({
            pathname: '/subjects',
            search: `customsPassId=${record.id}&partsId=${partsId}&sessionId=${sessionId}`
        }));
    }

    /**
     * 删除小关卡
     * @param  {object} 列数据
     */
    const handleDelete = (param) => {
        dispatch({
    		type: 'customPass/deletePass',
    		payload: {
                textbookId: textbookId,
                id: param.id
            }
    	})
    }

    // 修改图片
    const changeIcon = (url, record) => {
        dispatch({
    		type: 'customPass/updatePass',
    		payload: {
                textbookId: textbookId - 0,
                id: record.id,
                icon: url,
                title: record.title,
                tmpTitle: record.tmpTitle
            }
    	})
    }

    // 展示modal
    const changeModalState = (field, show) => {
        dispatch({
        	type: 'customPass/setParam',
        	payload: {
                [field]: show
            }
        })
    }

    // 表单取消
    const handleReset  = () => {
        resetFields()
        dispatch({
    		type: 'customPass/setParam',
    		payload: {
    			modalShow: false
    		}
    	})
    }

    // 添加小关卡
    const handleSubmit = (e) => {
        e.preventDefault();
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.id && (values.id = values.id - 0)
                values.textbookId && (values.textbookId = values.textbookId - 0)
                const idArr = passList.map(e => e.id)
                if (idArr.includes(values.id)) {
                    message.warning('小关卡id已存在！')
                } else {
                    dispatch({
                        type: 'customPass/addPass',
                        payload: filterObj(values)
                    }).then(() => {
                        handleReset()
                    })
                }
            }
        });
    }

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'customPass/setParam',
    		payload: param
        }).then(() => {
            dispatch({ type: 'customPass/getPassList' })
        });
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
                        <Button type="primary" onClick={() => changeModalState('modalShow', true)}>添加小关卡</Button>
                    </FormItem>

                    {
                        !!partsId
                        ? <FormItem>
                            <Button type="primary" onClick={() => changeModalState('modalShow3', true)}>添加题目</Button>
                        </FormItem>
                        : null
                    }

                    <FormItem>
                        <a className={'link-back'} onClick={goBack}><Icon type="arrow-left"/>后退</a>
                    </FormItem>
                </Form>
            </FormInlineLayout>

            <Modal
                title="新增小关卡"
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
                        label="小关卡id"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('id', {
                            rules: [{ required: true, message: '请输入小关卡id!' }],
                        })(
                            <Input placeholder="请输入小关卡id"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="小关卡标题"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('title', {
                            rules: [{ required: true, message: '请输入小关卡标题!', whitespace: true }],
                        })(
                            <Input placeholder="请输入小关卡标题"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="过渡标题"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('tmpTitle ', {
                            rules: [{ required: true, message: '请输入小关卡过渡标题!', whitespace: true }],
                        })(
                            <Input placeholder="请输入小关卡过渡标题"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="小关卡图片"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('icon', {
                            rules: [{
                                message: '请上传关卡图片!',
                                whitespace: true
                            }],
                        })(
                            <MyUpload uploadSuccess={uploadSuccess}></MyUpload>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}>
                        <Button type="primary" onClick={handleSubmit} style={{ marginLeft: 75 }}>提交</Button>
                        <Button onClick={handleReset} style={{ marginLeft: 15 }}>取消</Button>
                    </FormItem>
                </Form>
            </Modal>

            <Modal
                title="添加题目"
                visible={modalShow3}
                onOk={ () => changeModalState('modalShow3', false) }
                onCancel= { () => changeModalState('modalShow3', false) }
                okText="确认"
                cancelText="取消"
                footer={null}
                >
                <AddProject></AddProject>
            </Modal>

            <TableLayout
                dataSource={passList}
                allColumns={columns}
                scrollX={true}
                />
            {
                !!customPass.totalCount &&
                <PaginationLayout
                    total={customPass.totalCount}
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

CustomPass.propTypes = {
    customPass: PropTypes.object
};

export default connect(({ customPass }) => ({ customPass }))(Form.create()(CustomPass));
