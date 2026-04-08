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

const BagActivity = ({
    bagActivity,
    loading,
    ...props
}) => {
	let { dispatch, form } = props;
	let { tableList, bookList, modalShow, saleBeginAt, pageSize, pageNum, type } = bagActivity;
	let { getFieldDecorator, resetFields, validateFieldsAndScroll } = form;

    const columns = [
        {
            title: '课程id',
            dataIndex: 'id'
        },
        {
            title: '课程名称',
            dataIndex: 'textbookName',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改课程名称'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'bagActivity/updateActivity',
							payload: {
								id: record.id,
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
							type: 'bagActivity/updateActivity',
							payload: {
								id: record.id,
								teacher: v
							}
						})
					}/>
        }, {
            title: '详情图',
            dataIndex: 'iconDetail',
            render: (text) => {
                return (text) ? <a href={ text } target='_blank'  rel="nofollow noopener noreferrer">
                    <img alt="" src={ text } style={{ width: 50, height: 35 }}/>
                </a> : <span>无</span>
            }
        }, {
            title: '优惠卷图',
            dataIndex: 'iconTicket',
            render: (text) => {
               return (text) ? <a href={ text } target='_blank'  rel="nofollow noopener noreferrer">
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
							type: 'bagActivity/updateActivity',
							payload: {
								id: record.id,
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
							type: 'bagActivity/updateActivity',
							payload: {
								id: record.id,
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
							type: 'bagActivity/updateActivity',
							payload: {
								id: record.id,
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
                    }, {
                        id: 3,
                        name: '闯关解锁'
                    }]}
					optionKey={'id'}
                    optionItem={'name'}
					defaultValue={text === 1 ? '统一开课' : text === 2 ? '购买生效' : '闯关解锁'}
					onOk={v =>
						dispatch({
							type: 'bagActivity/updateActivity',
							payload: {
								id: record.id,
                                type: v - 0,
                                beginAt: (v == 1) ? record.beginAt : '',
                                endAt: (v == 1) ? record.endAt : ''
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
							type: 'bagActivity/updateActivity',
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
							type: 'bagActivity/updateActivity',
							payload: {
								id: record.id,
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
							type: 'bagActivity/updateActivity',
							payload: {
								id: record.id,
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
							type: 'bagActivity/updateActivity',
							payload: {
								id: record.id,
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
        }, {
        	title: '修改优惠卷图',
        	dataIndex: 'updateicon2',
            render: (text, record, index) => {
                return <MyUpload uploadTxt={'选择图片'} uploadSuccess={(url) => {
                    changeIcon(url, record, 'iconTicket')
                }}></MyUpload>
            }
        }, {
        	title: '操作',
            dataIndex: 'action',
            render: (txt, row, index) => {
                return <span>
                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(row)}>
                        <Button type="danger" size="small" style={{ marginLeft: 5 }}>删除</Button>
                    </Popconfirm>
                </span>
            }
        }
    ]

    // 删除
    const handleDelete = (row) => {
        dispatch({
            type: 'bagActivity/deleteActivity',
            payload: {
                id: row.id - 0
            }
        })
    }

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'bagActivity/setParam',
    		payload: param
        })
        dispatch({ type: 'bagActivity/getActivity' })
    }

    // 修改图片
    const changeIcon = (url, record, filed) => {
        dispatch({
    		type: 'bagActivity/updateActivity',
    		payload: {
                id: record.id,
                [filed]: url
            }
    	})
	}

	// 添加版本信息
	const handleSubmit = (e) => {
		e.preventDefault();
		validateFieldsAndScroll((err, values) => {
			if (!err) {
                const { beginAt, iconDetail, iconTicket, alldate, alldate2 } = bagActivity;
                values.orgAmt && (values.orgAmt = values.orgAmt * 100);
                values.amt && (values.amt = values.amt * 100);
                values.num && (values.num = values.num - 0);
                values.type && (values.type = values.type - 0);
                values.status && (values.status = values.status - 0);
                values.textbookId && (values.textbookId = values.textbookId - 0);
                values.iconDetail = iconDetail;
                values.iconTicket = iconTicket;
                // 开课截止时间
                let _begin = new Date(beginAt).getTime()
                let _end = _begin + alldate2 * (1000 * 3600 * 24)
                const endDate = moment(new Date(_end)).format('YYYY-MM-DD HH:mm:ss')
                // 预售截止时间
                let _begin2 = new Date(saleBeginAt).getTime()
                let _end2 = _begin2 + alldate * (1000 * 3600 * 24)
                const endDate2 = moment(new Date(_end2)).format('YYYY-MM-DD HH:mm:ss')
                const idArr = tableList.map(e => e.id)
                if (idArr.includes(values.id)) {
                    message.warning('课程活动id已存在！')
                } else {
                    if (values.type === 1) {
                        values.beginAt = beginAt
                        values.endAt = endDate
                    } else {
                        values.beginAt = ''
                        values.endAt = ''
                    }
                    values.saleBeginAt = saleBeginAt
                    values.saleEndAt = endDate2
                    delete values.alldate
                    dispatch({
                        type: 'bagActivity/addActivity',
                        payload: filterObj(values)
                    })
                }
			}
		});
	}

	// 展示modal
    const changeModalState = (flag, show) => {
        dispatch({
        	type: 'bagActivity/setParam',
        	payload: {
                [flag]: show
            }
        })
    }

    // 表单取消
    const handleReset  = () => {
        resetFields()
        dispatch({
    		type: 'bagActivity/setParam',
    		payload: {
                modalShow: false,
                addStatus: 1
    		}
    	})
	}

	// 设置表单时间
    const onChangeDate = (a, b, c) => {
        dispatch({
    		type: 'bagActivity/setParam',
    		payload: {
    			[c]: b
    		}
        })
    }

	// 文件上传成功
    const uploadSuccess = (url, filed) => {
        //setFieldsValue({[filed]: url})
        dispatch({
    		type: 'bagActivity/setParam',
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
                    {/* <FormItem>
                        <Button type="primary" icon="search" onClick={handleSearch}>搜索</Button>
                    </FormItem> */}

                    <FormItem>
                        <Button type="primary" onClick={() => changeModalState('modalShow', true)}>添加课程活动</Button>
                    </FormItem>

                    <FormItem>
                        <a className={'link-back'} onClick={goBack}><Icon type="arrow-left"/>后退</a>
                    </FormItem>

                </Form>

                <Modal
                    title="新增精品课程活动"
                    visible={modalShow}
                    onCancel= { () => changeModalState('modalShow', false) }
                    okText="确认"
                    cancelText="取消"
                    footer={null}
                    >
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="教材id"
                            >
                            {getFieldDecorator('textbookId', {
                                rules: [{ required: true, message: '请选择教材id!' }],
                            })(
                                <Select
                                    showSearch
                                    onFocus={() => dispatch({type: 'bagActivity/getBooklist'})}
                                    placeholder="请选择教材"
                                    >
                                    {
                                        bookList.map(item =>
                                            <Option key={item.textbookId} value={item.textbookId}>{item.textbookName + ''}</Option>
                                        )
                                    }
                                </Select>
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
                            label="预售持续时间"
                            {...formItemLayout}
                            >
                            {getFieldDecorator('alldate', {
                                //initialValue: bagActivity.id,
                                rules: [{ required: true, message: '请输入持续时间!' }],
                            })(
                                <Input placeholder="请输入持续时间(以天为单位)" onChange={ (e) => onChangeDate('', e.target.value, 'alldate')}/>
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
                                    <Radio value="3" key="3">闯关解锁</Radio>
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
                                label="开课持续时间"
                                {...formItemLayout}
                                >
                                {getFieldDecorator('alldate2', {
                                    //initialValue: bagActivity.id,
                                    rules: [{ required: true, message: '请输入持续时间!' }],
                                })(
                                    <Input placeholder="请输入持续时间(以天为单位)" onChange={ (e) => onChangeDate('', e.target.value, 'alldate2')}/>
                                )}
                            </FormItem>
                        }

                        {/* {
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
                        } */}

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
                                //rules: [{ required: true, message: '请输入微信号!' }],
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
                dataSource={tableList}
                allColumns={columns}
                loading={ loading.effects['courseList/getCourseList'] }
                scrollX={true}
                />
            <PaginationLayout
                total={bagActivity.totalCount}
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

BagActivity.propTypes = {
    bagActivity: PropTypes.object
};

export default connect(({ bagActivity, loading }) => ({ bagActivity, loading }))(Form.create()(BagActivity));
