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
import { isPro } from '@/configs/request';
import { Badge, Button, DatePicker, Input, Modal, Popconfirm, Select } from 'antd';
import { Icon, Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;

const BookUnit = ({
    bookUnit,
    ...props
}) => {
    let { dispatch, form } = props;
    let { tableData, modalShow, textBookId, bookList, pageNum, pageSize, totalCount} = bookUnit;
    let { getFieldDecorator, validateFieldsAndScroll, resetFields, setFieldsValue } = form;

    const columns = [
        {
            title: '单元名',
            dataIndex: 'text',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改单元名'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'bookUnit/updateUnit',
							payload: {
								id: record.id,
								text: v
							}
						})
					}/>
        }, {
        	title: '封面图',
        	dataIndex: 'icon',
            render: (text, record, index) => {
                return (text) ? <a href={ text } target='_blank' rel="nofollow noopener noreferrer">
                    <img alt="" src={ text } style={{ width: 50, height: 35 }}/>
                </a> : <span>无</span>
            }
        }, {
        	title: '单元排序',
            dataIndex: 'sort',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改单元排序'}
					valueData={text + '' || '无'}
					defaultValue={text + '' || '无'}
					onOk={v =>
						dispatch({
							type: 'bookUnit/updateUnit',
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
        	title: '上传封面图',
        	dataIndex: 'updateicon',
            render: (text, record, index) => {
                return <MyUpload uploadTxt={'上传封面图'} uploadSuccess={(url) => {
                    changeIcon(url, record)
                }}></MyUpload>
            }
        }, {
        	title: '创建时间',
        	dataIndex: 'createdAt'
        }, {
        	title: '操作',
            dataIndex: 'action',
            render: (txt, record, index) => {
                let islock = record.canLock === 1 ? '锁定' : '解锁'
                return <span>
                    <Popconfirm title={`是否${islock}该单元？`} onConfirm={() => handleLock(record)}>
                        <Button
                            icon={record.canLock === 1 ? 'lock' : 'unlock'}
                            size="small"
                            style={{ marginLeft: 10 }}>
                            { islock }
                        </Button>
                    </Popconfirm>

                    {
                        isPro ? null : <Popconfirm title="是否同步该单元?" onConfirm={() => handleSendUnit(record)}>
                            <Button icon="reload" type="primary" size="small" style={{ marginLeft: 10 }}>同步</Button>
                        </Popconfirm>
                    }

                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(record)}>
                        <Button icon="delete" type="danger" size="small" style={{ marginLeft: 10 }}>删除</Button>
                    </Popconfirm>

                    <Button type="primary" size="small" onClick={() => linktoPart(record)} style={{ marginLeft: 10 }}>查看part</Button>
                </span>
            }
        }
    ]

    /**
     * 删除单元
     * @param  {object} 列数据
     */
    const handleDelete = (param) => {
        dispatch({
    		type: 'bookUnit/deleteUnit',
    		payload: param.id
    	})
    }

    /**
     * 同步教材单元
     * @param  {object} 列数据
     */
    const handleSendUnit = (param) => {
        dispatch({
    		type: 'bookUnit/sendUnit',
    		payload: param.id
    	})
    }

    /**
     * 锁定单元
     * @param  {object} 列数据
     */
    const handleLock = (param) => {
        dispatch({
    		type: 'bookUnit/lockUnit',
    		payload: {
                unitId: param.id,
                canLock: param.canLock === 1 ? 2 : 1
            }
    	})
    }

    // 修改素材
    const changeIcon = (url, record) => {
        dispatch({
    		type: 'bookUnit/updateUnit',
    		payload: {
                id: record.id,
                icon: url
            }
    	})
    }

    // 调转到part页面
    const linktoPart = (record) => {
        dispatch(routerRedux.push({
            pathname: '/teachingManage/part',
            search: `unitId=${record.id}&textBookId=${textBookId}`
        }));
    }

    // 搜索
    const handleSearch = () => {
     	dispatch({ type: 'bookUnit/getUnit' })
    }

    // 展示modal
    const changeModalState = (show) => {
        dispatch({
        	type: 'bookUnit/setParam',
        	payload: {
                modalShow: show
            }
        })
    }

    // 选择时间框
    const datepickerChange = (d, t) => {
        dispatch({
        	type: 'bookUnit/setParam',
        	payload: {
                startTime: t[0] + ':00',
                endTime: t[1] + ':00'
            }
        })
    }

    // 选择下拉框
    const changeSelect = (v) => {
    	dispatch({
    		type: 'bookUnit/setParam',
    		payload: v
    	})
    }

    // 表单取消
    const handleReset  = () => {
        resetFields()
        dispatch({
    		type: 'bookUnit/setParam',
    		payload: {
    			modalShow: false
    		}
    	})
    }

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'bookUnit/setParam',
    		payload: param
        })
        dispatch({ type: 'bookUnit/getUnit' })
    }

    // 添加单元
    const handleSubmit = (e) => {
        e.preventDefault();
        validateFieldsAndScroll((err, values) => {
            // values.icon = 'http://img.chengxuyuantoutiao.com/group1/M00/00/02/rBDnNluNLnmAJ1csAABHdhAtFfs693.png'
            !err && dispatch({
                type: 'bookUnit/addUnit',
                payload: filterObj(values)
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
                    {/*时间*/}
                    <FormItem label="时间">
                        <RangePicker
                            format="YYYY-MM-DD HH:mm"
                            showTime={{
                                hideDisabledOptions: true,
                                defaultValue: [moment('00:00', 'HH:mm'), moment('11:59', 'HH:mm')],
                            }}
                            onChange={datepickerChange}
                            />
                    </FormItem>

                    {/*教材*/}
                    <FormItem label="教材">
                        <Select
                            showSearch
                            placeholder="请选择教材"
                            onFocus={() => dispatch({type: 'bookUnit/getBook'})}
                            onChange={v => changeSelect({textBookId: v})}
                            >
                            {
                                [{id: '', name: '全部'}, ...bookList].map(item =>
                                    <Option key={item.id} value={item.id}>{item.name}</Option>
                                )
                            }
                        </Select>
                    </FormItem>

                    <FormItem>
                        <Button type="primary" icon="search" onClick={handleSearch}>搜索</Button>
                    </FormItem>

                    <FormItem>
                        <Button type="primary" onClick={() => changeModalState(true)}>添加单元</Button>
                    </FormItem>

                    <FormItem>
                        <a className={'link-back'} onClick={goBack}><Icon type="arrow-left"/>后退</a>
                    </FormItem>

                </Form>
            </FormInlineLayout>

            <Modal
                title="新增单元"
                visible={modalShow}
                onOk={ () => changeModalState(false) }
                onCancel= { () => changeModalState(false) }
                okText="确认"
                cancelText="取消"
                footer={null}
                >
                <Form>
                    <FormItem
                        label="单元名称"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('text', {
                            rules: [{ required: true, message: '请输入单元名称!', whitespace: true }],
                        })(
                            <Input placeholder="请输入单元名称"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="单元封面图"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('icon', {
                            rules: [{
                                message: '请上传单元封面图!',
                                whitespace: true
                            }],
                        })(
                            <MyUpload uploadSuccess={uploadSuccess}></MyUpload>
                        )}
                    </FormItem>

                    <FormItem
                        label="教材"
                        hasFeedback
                        {...formItemLayout}
                        >
                        {getFieldDecorator('textBookId', {
                            rules: [{ required: true, message: '请选择教材!' }],
                        })(
                            <Select
                                showSearch
                                onFocus={() => dispatch({type: 'bookUnit/getBook'})}
                                >
                                {
                                    bookList.map(item =>
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
                pagination={false}
                dataSource={tableData}
                allColumns={columns}
                />
            <PaginationLayout
                total={totalCount}
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

BookUnit.propTypes = {
    bookUnit: PropTypes.object
};

export default connect(({ bookUnit }) => ({ bookUnit }))(Form.create()(BookUnit));
