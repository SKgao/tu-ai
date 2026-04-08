import { routerRedux } from 'dva/router';
import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';
import PaginationLayout from '@/components/PaginationLayout';
import TablePopoverLayout from '@/components/TablePopoverLayout';
import MyUpload from '@/components/UploadComponent';
import { filterObj } from '@/utils/tools';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { Button, Input, Modal, Popconfirm, Select } from 'antd';
import { Icon, Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const Option = Select.Option;

const PartPass = ({
    partPass,
    ...props
}) => {
    let { dispatch, form } = props;
    let { tableData, modalShow, subjectList, pageNum, pageSize, partsId} = partPass;
    let { getFieldDecorator, validateFieldsAndScroll, resetFields, setFieldsValue } = form;

    const columns = [
        {
            title: '关卡标题',
            dataIndex: 'title',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改关卡标题'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'partPass/updatePass',
							payload: {
								id: record.id,
								title: v
							}
						})
					}/>
        }, {
        	title: '图片',
        	dataIndex: 'icon',
            render: (text, record, index) => {
                return (text) ? <a href={ text } target='_blank' rel="noopener noreferrer">
                    <img alt="" src={ text } style={{ width: 50, height: 35 }}/>
                </a> : <span>无</span>
            }
        }, {
        	title: '修改图片',
        	dataIndex: 'updateicon',
            render: (text, record, index) => {
                return <MyUpload uploadSuccess={(url) => {
                    changeIcon(url, record)
                }}></MyUpload>
            }
        }, {
        	title: '闯关人数',
        	dataIndex: 'customerNumber',
            sorter: true
        }, {
        	title: '关卡顺序',
        	dataIndex: 'sort',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改关卡顺序'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'partPass/updatePass',
							payload: {
								id: record.id,
								sort: v
							}
						})
					}/>
        }, {
        	title: '平均分',
        	dataIndex: 'totalScore',
            sorter: true
        }, {
        	title: '创建时间',
        	dataIndex: 'createdAt'
        }, {
        	title: '操作',
            dataIndex: 'action',
            render: (txt, record, index) => {
                return <span>
                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(record)}>
                        <Button icon="delete" type="danger" size="small" style={{ marginLeft: 10 }}>删除</Button>
                    </Popconfirm>

                    <Button type="primary" size="small" onClick={() => linktoProject(record)} style={{ marginLeft: 10 }}>查看题目</Button>
                </span>
            }
        }
    ]

    // 调转到关卡页面
    const linktoProject = (record) => {
        dispatch(routerRedux.push({
            pathname: '/subjects',
            search: `customsPassId=${record.id}`
        }));
    }

    /**
     * 删除角色
     * @param  {object} 列数据
     */
    const handleDelete = (param) => {
        dispatch({
    		type: 'partPass/deletePass',
    		payload: param.id
    	})
    }

    // 修改素材
    const changeIcon = (url, record) => {
        dispatch({
    		type: 'partPass/updatePass',
    		payload: {
                id: record.id,
                icon: url
            }
    	})
    }

    // 展示modal
    const changeModalState = (show) => {
        dispatch({
        	type: 'partPass/setParam',
        	payload: {
                modalShow: show
            }
        })
    }

    // 表单取消
    const handleReset  = () => {
        resetFields()
        dispatch({
    		type: 'partPass/setParam',
    		payload: {
    			modalShow: false
    		}
    	})
    }

    // 添加单元
    const handleSubmit = (e) => {
        e.preventDefault();
        validateFieldsAndScroll((err, values) => {
            !err && dispatch({
                type: 'partPass/addPass',
                payload: filterObj(values)
            })
        });
    }

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'partPass/setParam',
    		payload: param
        }).then(() => {
            dispatch({
                type: 'partPass/getPass',
                payload: {partsId, ...param}
            })
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
                        <Button type="primary" onClick={() => changeModalState(true)}>添加关卡</Button>
                    </FormItem>

                    <FormItem>
                        <a className={'link-back'} onClick={goBack}><Icon type="arrow-left"/>后退</a>
                    </FormItem>
                </Form>
            </FormInlineLayout>

            <Modal
                title="新增关卡"
                visible={modalShow}
                onOk={ () => changeModalState(false) }
                onCancel= { () => changeModalState(false) }
                okText="确认"
                cancelText="取消"
                footer={null}
                >
                <Form>
                    <FormItem
                        label="关卡标题"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('title', {
                            rules: [{ required: true, message: '请输入关卡标题!', whitespace: true }],
                        })(
                            <Input placeholder="请输入关卡标题"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="关卡图片"
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
                        label="partsId"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('partsId', {
                            initialValue: partPass.partsId,
                            rules: [{ required: true, message: '请输入partsId!', whitespace: true }],
                        })(
                            <Input/>
                        )}
                    </FormItem>

                    <FormItem
                        label="关卡顺序"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('sort', {
                            rules: [{ required: true, message: '请输入关卡顺序!', whitespace: true }],
                        })(
                            <Input placeholder="请输入关卡顺序"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="题型"
                        hasFeedback
                        {...formItemLayout}
                        >
                        {getFieldDecorator('subject', {
                            rules: [{ required: true, message: '请选择题型!' }],
                        })(
                            <Select
                                showSearch
                                onFocus={() => dispatch({type: 'partPass/getSubject'})}
                                >
                                {
                                    subjectList.map(item =>
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

            <TableLayout
                dataSource={tableData}
                allColumns={columns}
                />
            {
                partPass.totalCount &&
                <PaginationLayout
                    total={partPass.totalCount}
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

PartPass.propTypes = {
    partPass: PropTypes.object
};

export default connect(({ partPass }) => ({ partPass }))(Form.create()(PartPass));
