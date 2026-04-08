import { routerRedux } from 'dva/router';
import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';
import PaginationLayout from '@/components/PaginationLayout';
import TablePopoverLayout from '@/components/TablePopoverLayout';
import MyUpload from '@/components/UploadComponent';
import moment from 'moment';
import { filterObj } from '@/utils/tools';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { Badge, Button, DatePicker, Input, Modal, Popconfirm, Radio, Select, message } from 'antd';
import { Form, Icon } from '@ant-design/compatible';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const SpecialCourse = ({
    specialCourse,
    loading,
    ...props
}) => {
    let { dispatch, form } = props;
    let { tableData, modalShow, bookList, saleBeginAt, saleEndAt, pageSize, pageNum, type, userId } = specialCourse;
    let { getFieldDecorator, resetFields, validateFieldsAndScroll } = form;

    const columns = [
        {
            title: '教材id',
            dataIndex: 'textbookId',
            sorter: true
        }, {
            title: '教材名称',
            dataIndex: 'textbookName',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改教材名称'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'specialCourse/updateCourse',
							payload: {
								textbookId: record.textbookId,
								textbookName: v
							}
						})
					}/>
        }, {
            title: '辅导老师',
            dataIndex: 'teacher',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改辅导老师'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'specialCourse/updateCourse',
							payload: {
								textbookId: record.textbookId,
								teacher: v
							}
						})
					}/>
        }, {
            title: '详情图',
            dataIndex: 'iconDetail',
            render: (text) => {
               return (text) ? <a href={ text } target='_blank' rel="nofollow noopener noreferrer">
                    <img alt="" src={ text } style={{ width: 50, height: 35 }}/>
                </a> : <span>无</span>
            }
        }, {
            title: '优惠卷图',
            dataIndex: 'iconTicket',
            render: (text) => {
               return (text) ? <a href={ text } target='_blank' rel="nofollow noopener noreferrer">
                    <img alt="" src={ text } style={{ width: 50, height: 35 }}/>
                </a> : <span>无</span>
            }
        }, {
            title: '原始金额',
            dataIndex: 'orgAmt',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改原始金额'}
					valueData={ (text || text == 0) ? (Number(text) / 100).toFixed(2) + '元' : '无'}
					defaultValue={ (text || text == 0) ? (Number(text) / 100).toFixed(2) + '元' : '无' }
					onOk={v =>
						dispatch({
							type: 'specialCourse/updateCourse',
							payload: {
								textbookId: record.textbookId,
								orgAmt: Number(v.replace(/元/g, '')) * 100
							}
						})
					}/>
        }, {
            title: '实际金额',
            dataIndex: 'amt',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改实际金额'}
					valueData={ (text || text == 0) ? (Number(text) / 100).toFixed(2) + '元' : '无'}
					defaultValue={ (text || text == 0) ? (Number(text) / 100).toFixed(2) + '元' : '无' }
					onOk={v =>
						dispatch({
							type: 'specialCourse/updateCourse',
							payload: {
								textbookId: record.textbookId,
								amt: Number(v.replace(/元/g, '')) * 100
							}
						})
					}/>
        }, {
            title: '课程数量',
            dataIndex: 'num',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改课程数量'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'specialCourse/updateCourse',
							payload: {
								textbookId: record.textbookId,
								num: v - 0
							}
						})
					}/>
        }, {
            title: '课程状态',
            dataIndex: 'status',
            sorter: true,
            render: (txt) => {
				switch (txt) {
					case 1:
						return <Badge status="processing" text="启动"/>;
					case 2:
                        return <Badge status="error" text="关闭"/>;
                    default:
                        return <Badge status="error" text="未知"/>;
				}
			}
        }, {
            title: '开课方式',
            dataIndex: 'type',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改开课方式'}
					valueData={[{
                       id: 1,
                       name: '统一开课'
                    }, {
                        id: 2,
                        name: '购买生效'
                    }]}
					optionKey={'id'}
                    optionItem={'name'}
					defaultValue={text === 1 ? '统一开课' : '购买生效'}
					onOk={v =>
						dispatch({
							type: 'specialCourse/updateCourse',
							payload: {
								textbookId: record.textbookId,
                                type: v - 0,
                                beginAt: (v === 1) ? record.beginAt : '',
                                endAt: (v === 1) ? record.endAt : ''
							}
						})
					}/>
        }, {
            title: '预售开始时间',
            dataIndex: 'saleBeginAt',
            render: (text, record) =>
				<TablePopoverLayout
                title={`修改预售开始时间`}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'specialCourse/updateCourse',
							payload: {
								textbookId: record.textbookId,
								saleBeginAt: v
							}
						})
					}/>
        }, {
            title: '预售截止时间',
            dataIndex: 'saleEndAt',
            render: (text, record) =>
				<TablePopoverLayout
                title={`修改预售截止时间`}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'specialCourse/updateCourse',
							payload: {
								textbookId: record.textbookId,
								saleEndAt: v
							}
						})
					}/>
        }, {
            title: '开课时间',
            dataIndex: 'beginAt',
            render: (text, record) =>
				<TablePopoverLayout
                title={`修改开课时间--格式如${moment().format("YYYY-MM-DD HH:mm:ss")}`}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'specialCourse/updateCourse',
							payload: {
								textbookId: record.textbookId,
								beginAt: v
							}
						})
					}/>
        }, {
            title: '结课时间',
            dataIndex: 'endAt',
            render: (text, record) =>
				<TablePopoverLayout
					title={`修改结课时间--格式如${moment().format("YYYY-MM-DD HH:mm:ss")}`}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'specialCourse/updateCourse',
							payload: {
								textbookId: record.textbookId,
								endAt: v
							}
						})
					}/>
        }, {
        	title: '修改详情图',
        	dataIndex: 'updateicon1',
            render: (text, record, index) => {
                return <MyUpload uploadTxt={'选择图片'} uploadSuccess={(url) => {
                    changeIcon(url, record, 'iconDetail')
                }}></MyUpload>
            }
        },{
        	title: '修改优惠卷图',
        	dataIndex: 'updateicon2',
            render: (text, record, index) => {
                return <MyUpload uploadTxt={'选择图片'} uploadSuccess={(url) => {
                    changeIcon(url, record, 'iconTicket')
                }}></MyUpload>
            }
        },{
        	title: '操作',
            dataIndex: 'action',
            render: (txt, record, index) => {
                return <span>
                    {
                        (!record.status || record.status === 2 ) && <Button type="primary" size="small" onClick={() => changeStatus(record, 1)}>上架</Button>
					}
					{/* {
                        record.status === 1 && <Button size="small" style={{ marginLeft: 5 }} onClick={() => changeStatus(record, 2)}>下架</Button>
					} */}
                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(record)}>
                        <Button type="danger" size="small" style={{ marginLeft: 5 }}>删除</Button>
                    </Popconfirm>
                </span>
            }
        }
    ]

    // 修改图片
    const changeIcon = (url, record, filed) => {
        dispatch({
    		type: 'specialCourse/updateCourse',
    		payload: {
                textbookId: record.textbookId,
                [filed]: url
            }
    	})
    }

    // 删除活动
    const handleDelete = (record) => {
        dispatch({
    		type: 'specialCourse/deleteCourse',
    		payload: {
                textbookId: record.textbookId
            }
    	})
    }

    // 上、下架
    const changeStatus = (record, status) => {
        dispatch({
    		type: 'specialCourse/changeCourse',
    		payload: {
                type: (status === 1) ? 'up' : 'down',
                textbookId: record.textbookId - 0,
            }
    	})
    }

    // 展示modal
    const changeModalState = (flag, show) => {
        dispatch({
        	type: 'specialCourse/setParam',
        	payload: {
                [flag]: show
            }
        })
    }

    // 表单取消
    const handleReset  = () => {
        resetFields()
        dispatch({
    		type: 'specialCourse/setParam',
    		payload: {
                modalShow: false,
                addStatus: 1
    		}
    	})
    }

    // 添加版本信息
	const handleSubmit = (e) => {
		e.preventDefault();
		validateFieldsAndScroll((err, values) => {
			if (!err) {
                const { beginAt, endAt, iconDetail, iconTicket } = specialCourse;
                values.orgAmt && (values.orgAmt = values.orgAmt * 100);
                values.amt && (values.amt = values.amt * 100);
                values.num && (values.num = values.num - 0);
                values.type && (values.type = values.type - 0);
                values.status && (values.status = values.status - 0);
                values.textbookId && (values.textbookId = values.textbookId - 0);
                values.iconDetail = iconDetail;
                values.iconTicket = iconTicket;
                let _begin = new Date(beginAt).getTime()
                let _end = new Date(endAt).getTime()
                let _begin2 = new Date(saleBeginAt).getTime()
                let _end2 = new Date(saleEndAt).getTime()
                if (_begin > _end) {
                    message.warning('开始时间不能大于结束时间')
                } else if (_begin2 > _end2) {
                    message.warning('预售开始时间不能大于预售结束时间')
                } else {
                    if (type === '1') {
                        values.beginAt = beginAt
                        values.endAt = endAt
                    } else {
                        values.beginAt = ''
                        values.endAt = ''
                    }
                    values.saleBeginAt = saleBeginAt
                    values.saleEndAt = saleEndAt
                    dispatch({
                        type: 'specialCourse/addCourse',
                        payload: filterObj(values)
                    })
                }
			}
		});
    }

    // 设置表单时间
    const onChangeDate = (a, b, c) => {
        dispatch({
    		type: 'specialCourse/setParam',
    		payload: {
    			[c]: b
    		}
        })
    }

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'specialCourse/setParam',
    		payload: param
        })
        dispatch({ type: 'specialCourse/getCourse' })
    }

    // 文件上传成功
    const uploadSuccess = (url, filed) => {
        //setFieldsValue({[filed]: url})
        dispatch({
    		type: 'specialCourse/setParam',
    		payload: {
    			[filed]: url
    		}
        })
    }

    // 返回
    const goBack = () => dispatch(routerRedux.goBack(-1))

	return (
		<div>
			<FormInlineLayout>
			    <Form layout="inline" style={{ marginLeft: 15 }}>
                    <FormItem>
                        <Button type="primary" onClick={() => changeModalState('modalShow', true)}>添加精品课程</Button>
                    </FormItem>

                    {
                        userId && <FormItem>
                            <a className={'link-back'} onClick={goBack}><Icon type="arrow-left"/>后退</a>
                        </FormItem>
                    }

                </Form>

                <Modal
                    title="新增精品课程"
                    visible={modalShow}
                    onCancel= { () => changeModalState('modalShow', false) }
                    okText="确认"
                    cancelText="取消"
                    footer={null}
                    >
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="课程id"
                            >
                            {getFieldDecorator('textbookId', {
                                rules: [{ required: true, message: '请选择课程id!' }],
                            })(
                                <Select
                                    showSearch
                                    onFocus={() => dispatch({type: 'specialCourse/getBooklist'})}
                                    placeholder="请选择课程"
                                    >
                                    {
                                        bookList.map(item =>
                                            <Option key={item.id} value={item.id}>{item.name + ''}</Option>
                                        )
                                    }
                                </Select>
                            )}
                        </FormItem>

                        <FormItem
                            label="教程名称"
                            {...formItemLayout}
                            >
                            {getFieldDecorator('textbookName', {
                                rules: [{ required: true, message: '请输入教程名称!' }],
                            })(
                                <Input placeholder="请输入教程名称"/>
                            )}
                        </FormItem>

                        <FormItem
                            label="预售开始时间"
                            {...formItemLayout}
                            >
                            {getFieldDecorator('saleBeginAt', {
                                rules: [{ required: true, message: '请选择预售开始时间!' }],
                            })(
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    placeholder="请选择预售开始时间"
                                    onChange={ (a, b) => onChangeDate(a, b, 'saleBeginAt') }
                                    />
                            )}
                        </FormItem>

                        <FormItem
                            label="预售截止时间"
                            {...formItemLayout}
                            >
                            {getFieldDecorator('saleEndAt', {
                                rules: [{ required: true, message: '请选择预售截止时间!' }],
                            })(
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    placeholder="请选择预售截止时间"
                                    onChange={ (a, b) => onChangeDate(a, b, 'saleEndAt') }
                                    />
                            )}
                        </FormItem>

                        <FormItem
                            label="辅导教师"
                            {...formItemLayout}
                            >
                            {getFieldDecorator('teacher', {
                                rules: [{ required: true, message: '请输入辅导教师!' }],
                            })(
                                <Input placeholder="请输入辅导教师"/>
                            )}
                        </FormItem>

                        <FormItem
                            {...formItemLayout}
                            label="课程状态"
                            >
                            {getFieldDecorator('status', {
                                initialValue: "1"
                            })(
                                <RadioGroup>
                                    <Radio value="1" key="1">正常</Radio>
                                    <Radio value="2" key="2">下架</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>

                        <FormItem
                            {...formItemLayout}
                            label="课程状态"
                            >
                            {getFieldDecorator('type', {
                                initialValue: type
                            })(
                                <RadioGroup onChange={ (e) => onChangeDate('', e.target.value, 'type') }>
                                    <Radio value="1" key="1">统一开课</Radio>
                                    <Radio value="2" key="2">购买生效</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>

                        {
                            type ===  '1' &&
                            <FormItem
                                label="开课时间"
                                {...formItemLayout}
                                >
                                {getFieldDecorator('beginAt', {
                                    rules: [{ required: true, message: '请选择开课时间!' }],
                                })(
                                    <DatePicker
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        placeholder="请选择开课时间"
                                        onChange={ (a, b) => onChangeDate(a, b, 'beginAt') }
                                        />
                                )}
                            </FormItem>
                        }

                        {
                            type ===  '1' &&
                            <FormItem
                                label="结课时间"
                                {...formItemLayout}
                                >
                                {getFieldDecorator('endAt', {
                                    rules: [{ required: true, message: '请选择结课时间!' }],
                                })(
                                    <DatePicker
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        placeholder="请选择结课时间"
                                        onChange={ (a, b) => onChangeDate(a, b, 'endAt') }
                                        />
                                )}
                            </FormItem>
                        }

                        <FormItem
                            label="原始金额"
                            {...formItemLayout}
                            >
                            {getFieldDecorator('orgAmt', {
                                rules: [{ required: true, message: '请输入原始金额!' }],
                            })(
                                <Input placeholder="请输入原始金额"/>
                            )}
                        </FormItem>

                        <FormItem
                            label="实际金额"
                            {...formItemLayout}
                            >
                            {getFieldDecorator('amt', {
                                rules: [{ required: true, message: '请输入实际金额!' }],
                            })(
                                <Input placeholder="请输入实际金额"/>
                            )}
                        </FormItem>

                        <FormItem
                            label="数量"
                            {...formItemLayout}
                            >
                            {getFieldDecorator('num', {
                                rules: [{ required: true, message: '请输入数量!' }],
                            })(
                                <Input placeholder="请输入数量"/>
                            )}
                        </FormItem>

                        <FormItem
                            label="微信号"
                            {...formItemLayout}
                            >
                            {getFieldDecorator('chatNo', {
                                rules: [{ required: false }],
                            })(
                                <Input placeholder="请输入微信号"/>
                            )}
                        </FormItem>

                        <FormItem
                            label="详情图片"
                            {...formItemLayout}
                            >
                            <MyUpload uploadSuccess={url => uploadSuccess(url, 'iconDetail')}></MyUpload>
                        </FormItem>

                        <FormItem
                            label="优惠券图"
                            {...formItemLayout}
                            >
                            <MyUpload uploadSuccess={url => uploadSuccess(url, 'iconTicket')}></MyUpload>
                        </FormItem>

                        <FormItem
                            {...formItemLayout}>
                            <Button type="primary" onClick={handleSubmit} style={{ marginLeft: 75 }}>提交</Button>
                            <Button onClick={handleReset} style={{ marginLeft: 15 }}>取消</Button>
                        </FormItem>
                    </Form>
                </Modal>
            </FormInlineLayout>

            <TableLayout
                pagination={false}
                scrollX={true}
                dataSource={tableData}
                allColumns={columns}
                loading={ loading.effects['specialCourse/getCourse'] || loading.effects['specialCourse/getCourse'] }
                />

            <PaginationLayout
                total={specialCourse.totalCount}
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

SpecialCourse.propTypes = {
    specialCourse: PropTypes.object
};

export default connect(({ specialCourse, loading }) => ({ specialCourse, loading }))(Form.create()(SpecialCourse));
