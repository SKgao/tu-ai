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
import { Badge, Button, Input, Modal, Popconfirm } from 'antd';
import { Icon, Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const { TextArea } = Input;

const UnitPart = ({
    unitPart,
    location,
    ...props
}) => {
    let { dispatch, form } = props;
    let { partList, modalShow, pageNum, pageSize, textBookId} = unitPart;
    let { getFieldDecorator, validateFieldsAndScroll, resetFields, setFieldsValue } = form;

    const columns = [
        {
            title: 'part名称',
            dataIndex: 'title',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改part名称'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'unitPart/updatePart',
							payload: {
								id: record.id,
								title: v
							}
						})
					}/>
        }, {
            title: '图片',
            dataIndex: 'icon',
            render: (text) => {
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
            title: 'part描述',
            dataIndex: 'tips',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改part描述'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'unitPart/updatePart',
							payload: {
								id: record.id,
								tips: v
							}
						})
					}/>
        }, {
        	title: 'part排序',
            dataIndex: 'sort',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改part排序'}
					valueData={text + '' || '无'}
					defaultValue={text + '' || '无'}
					onOk={v =>
						dispatch({
							type: 'unitPart/updatePart',
							payload: {
								id: record.id,
								sort: v
							}
						})
					}/>
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
        	title: '操作',
            dataIndex: 'action',
            render: (txt, record, index) => {
                let islock = record.canLock === 1 ? '锁定' : '解锁'
                return <span>
                    <Popconfirm title={`是否${islock}该part？`} onConfirm={() => handleLock(record)}>
                        <Button
                            icon={record.canLock === 1 ? 'lock' : 'unlock'}
                            size="small"
                            style={{ marginLeft: 10 }}>
                            { islock }
                        </Button>
                    </Popconfirm>

                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(record)}>
                        <Button icon="delete" type="danger" size="small" style={{ marginLeft: 10 }}>删除</Button>
                    </Popconfirm>

                    <Button type="primary" size="small" onClick={() => linktoPass(record)} style={{ marginLeft: 10 }}>查看关卡</Button>
                </span>
            }
        }
    ]

    /**
     * 锁定part
     * @param  {object} 列数据
     */
    const handleLock = (param) => {
        dispatch({
    		type: 'unitPart/updatePart',
    		payload: {
                id: param.id,
                canLock: param.canLock === 1 ? 2 : 1
            }
    	})
    }

    /**
     * 删除part
     * @param  {object} 列数据
     */
    const handleDelete = (param) => {
        dispatch({
    		type: 'unitPart/deletePart',
    		payload: param.id
    	})
    }

    // 调转到小关卡页面
    const linktoPass = (record) => {
        dispatch(routerRedux.push({
            pathname: '/teachingManage/session',
            search: `partsId=${record.id}&textbookId=${textBookId}`
        }));
    }

    // 修改素材
    const changeIcon = (url, record) => {
        dispatch({
    		type: 'unitPart/updatePart',
    		payload: {
                id: record.id,
                icon: url
            }
    	})
    }

    // 展示modal
    const changeModalState = (show) => {
        dispatch({
        	type: 'unitPart/setParam',
        	payload: {
                modalShow: show
            }
        })
    }

    // 表单取消
    const handleReset  = () => {
        resetFields()
        dispatch({
    		type: 'unitPart/setParam',
    		payload: {
    			modalShow: false
    		}
    	})
    }

    // 添加part
    const handleSubmit = (e) => {
        e.preventDefault();
        validateFieldsAndScroll((err, values) => {
            values.unitsId && (values.unitsId = values.unitsId - 0);
            !err && dispatch({
                type: 'unitPart/addPart',
                payload: filterObj(values)
            })
        });
    }

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'unitPart/setParam',
    		payload: param
        }).then(() => {
            dispatch({ type: 'unitPart/getPart' })
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
                        <Button type="primary" onClick={() => changeModalState(true)}>添加Part</Button>
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
                        label="part名称"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('title', {
                            rules: [{ required: true, message: '请输入part名称!', whitespace: true }],
                        })(
                            <Input placeholder="请输入part名称"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="part图片"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('icon', {
                            rules: [{
                                message: '请上传part图片!',
                                whitespace: true
                            }],
                        })(
                            <MyUpload uploadSuccess={uploadSuccess}></MyUpload>
                        )}
                    </FormItem>

                    <FormItem
                        label="单元id"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('unitsId', {
                            initialValue: unitPart.unitId,
                            rules: [{ required: true, message: '请输入单元id!', whitespace: true }],
                        })(
                            <Input/>
                        )}
                    </FormItem>

                    <FormItem
                        label="part描述"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('tips', {
                            rules: [{ required: true, message: '请输入part描述!', whitespace: true }],
                        })(
                            <TextArea placeholder="请输入part描述!" autosize={{ minRows: 3, maxRows: 6 }} />
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
                pagination={false}
                dataSource={partList}
                allColumns={columns}
                />
            <PaginationLayout
                total={unitPart.totalCount}
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
		</div>
	)
};

UnitPart.propTypes = {
    unitPart: PropTypes.object
};

export default connect(({ unitPart }) => ({ unitPart }))(Form.create()(UnitPart));
