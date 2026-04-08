import { routerRedux } from 'dva/router';
import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import DragTableLayout from '@/components/DragTableLayout';
import { filterObj } from '@/utils/tools';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { Button, Input, Modal, Pagination, Radio, Select } from 'antd';
import { Icon, Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const CourseUser = ({
    courseUser,
    loading,
    ...props
}) => {
    let { dispatch, form } = props;
    let { tableList, pageNum, pageSize, totalCount, modalShow, bookList, courseButton, tutuNumber } = courseUser;
    let { getFieldDecorator, resetFields, validateFieldsAndScroll } = form;

    const allColumns = [
        {
            title: '精品课程名称',
            dataIndex: 'textbookName',
            sorter: true
        },
        {
            title: '图图号',
            dataIndex: 'tutuNumber',
            sorter: true
        }, {
            title: '手机号',
            dataIndex: 'mobile',
            sorter: true,
            render: (text) => <span>{ text ? text :  '无' }</span>
        }, {
            title: '用户名',
            dataIndex: 'realName',
            render: (text) => <span>{ text ? text :  '无' }</span>
        }, {
            title: '性别',
            dataIndex: 'sex',
            sorter: true,
            render: (text) => <span>{ text === 1 ? '男' :  '女' }</span>
        }, {
            title: '付款金额',
            dataIndex: 'payAmt',
            sorter: true,
            render: (text) => (Number(text) / 100).toFixed(2) + '元'
        }, {
            title: '购买时间',
            dataIndex: 'buyAt'
        }, {
            title: '开课时间',
            dataIndex: 'beginAt'
        }, {
            title: '结课时间',
            dataIndex: 'endAt'
        },
    ]

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'courseUser/setParam',
    		payload: param
        }).then(() => {
            dispatch({ type: 'courseUser/getUser' })
        })
    }

    // 搜索
    const handleSearch = (param) => {
        dispatch({
			type: 'courseUser/setParam',
			payload: {
				pageSize: 10,
				pageNum: 1
			}
        })
        dispatch({ type: 'courseUser/getUser' })
    }

    // 选择下拉框
    const changeSelect = (v) => {
    	dispatch({
    		type: 'courseUser/setParam',
    		payload: v
    	})
    }

    // 输入框
    const handleInput = (e, m) => {
        dispatch({
    		type: 'courseUser/setParam',
    		payload: {
                [m]: e.target.value
            }
    	})
    }

    // 展示modal
    const changeModalState = (flag, show) => {
        dispatch({
        	type: 'courseUser/setParam',
        	payload: {
                [flag]: show
            }
        })
    }

    // 添加用户信息
	const handleSubmit = (e) => {
		e.preventDefault();
		validateFieldsAndScroll((err, values) => {
			if (!err) {
                values.sex && (values.sex = values.sex - 0);
                values.textbookId && (values.textbookId = values.textbookId - 0);
                values.payAmt && (values.payAmt = values.payAmt * 100);
                dispatch({
                    type: 'courseUser/addMember',
                    payload: filterObj(values)
                }).then(() => {
                    handleReset()
                })
			}
		});
    }

    // 表单取消
    const handleReset  = () => {
        resetFields()
        dispatch({
    		type: 'courseUser/setParam',
    		payload: {
                modalShow: false
    		}
    	})
    }

    // 返回
    const goBack = () => dispatch(routerRedux.goBack(-1))

    // const SortingTable = DragDropContext(HTML5Backend)(DragTableLayout)

	return (
		<div>
            <FormInlineLayout>
                <Form layout="inline" style={{ marginLeft: 15 }}>
                    <FormItem label="精品课程">
                        <Select
                            showSearch
                            onFocus={() => dispatch({type: 'courseUser/getBooklist'})}
                            placeholder="请选择精品课程"
                            onChange={v => changeSelect({ textbookId: v })}
                            >
                            {
                                [{textbookId: '', textbookName: '全部'}, ...bookList].map(item =>
                                    <Option key={item.textbookId} value={item.textbookId}>{item.textbookName + ''}</Option>
                                )
                            }
                        </Select>
                    </FormItem>

                    <FormItem label="图图号">
                        <Input placeholder="输入图图号" value={courseUser.tutuNumber} onChange={(e) => handleInput(e, 'tutuNumber')}/>
                    </FormItem>

                    <FormItem label="手机号">
                        <Input placeholder="输入手机号" value={courseUser.mobile} onChange={(e) => handleInput(e, 'mobile')}/>
                    </FormItem>

                    <FormItem label="用户名">
                        <Input placeholder="输入用户名" value={courseUser.realName} onChange={(e) => handleInput(e, 'mobile')}/>
                    </FormItem>

                    <FormItem label="性别">
                        <Select
                            showSearch
                            placeholder="请选择性别"
                            onChange={v => changeSelect({ sex: v })}
                            >
                            <Option key={0} value={''}>全部</Option>
                            <Option key={1} value={1}>男</Option>
                            <Option key={2} value={2}>女</Option>
                        </Select>
                    </FormItem>

                    <FormItem>
                        <Button type="primary" icon="search" onClick={handleSearch}>搜索</Button>
                    </FormItem>

                    <FormItem>
                        <Button type="primary" onClick={() => changeModalState('modalShow', true)}>开通精品课程</Button>
                    </FormItem>

                    {
                        tutuNumber && <FormItem>
                            <a className={'link-back'} onClick={goBack}><Icon type="arrow-left"/>后退</a>
                        </FormItem>
                    }

                </Form>
            </FormInlineLayout>

            <Modal
                title="开通精品课程"
                visible={modalShow}
                onCancel= { () => changeModalState('modalShow', false) }
                okText="确认"
                cancelText="取消"
                footer={null}
                >
                <Form>
                    <FormItem
                        label="用户名"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('realName', {
                            rules: [{ required: true, message: '请输入用户名!' }],
                        })(
                            <Input placeholder="请输入用户名"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="手机号"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('mobile', {
                            rules: [{ required: true, message: '手机号格式有误!', pattern: /^[1][0-9]{10}$/ }],
                        })(
                            <Input placeholder="请输入手机号"/>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="性别"
                        >
                        {getFieldDecorator('sex', {
                            initialValue: '1'
                        })(
                            <RadioGroup>
                                <Radio value='1'>男</Radio>
                                <Radio value='2'>女</Radio>
                            </RadioGroup>
                        )}
                    </FormItem>

                    <FormItem
                        label="付款金额"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('payAmt', {
                            rules: [{ required: true, message: '请输入付款金额!' }],
                        })(
                            <Input placeholder="请输入付款金额"/>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="精品课程"
                        >
                        {getFieldDecorator('textbookId', {
                            rules: [{ required: true, message: '请选择精品课程!' }],
                        })(
                            <Select
                                showSearch
                                onFocus={() => dispatch({type: 'courseUser/getBooklist'})}
                                placeholder="请选择精品课程"
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
                        {...formItemLayout}>
                        <Button type="primary" onClick={handleSubmit} style={{ marginLeft: 75 }}>提交</Button>
                        <Button onClick={handleReset} style={{ marginLeft: 15 }}>取消</Button>
                    </FormItem>
                </Form>
            </Modal>

            <TableLayout
                pagination={false}
                dataSource={tableList}
                allColumns={allColumns}
                loading={ loading.effects['courseUser/getUser'] }
                scrollX={true}
                />

            {/* <SortingTable
                dataSource={[{
                    key: '1',
                    name: 'John Brown',
                    age: 32,
                }]}/> */}

            <div className="main-pagination">
                {
                    totalCount > 0 ? <div className="pagination-info">总人数 <span className="mr10">{totalCount}</span> 第 <span>{pageNum}</span> / {Math.ceil(totalCount/pageSize)} 页</div> : null
                }
                <Pagination
                    showSizeChanger
                    showQuickJumper
                    hideOnSinglePage
                    pageSizeOptions={['10', '20', '50', '100']}
                    onChange={(page, pageSize) => handleChange({
                        pageNum: page,
                        pageSize
                    })}
                    onShowSizeChange={(current, pageSize) => handleChange({
                        pageNum: 1,
                        pageSize
                    })}
                    total={totalCount}
                    current={pageNum}
                    pageSize={pageSize} />
            </div>
		</div>
	)
};

CourseUser.propTypes = {
    courseUser: PropTypes.object
};

export default connect(({ courseUser, loading }) => ({ courseUser, loading }))(Form.create()(CourseUser));
