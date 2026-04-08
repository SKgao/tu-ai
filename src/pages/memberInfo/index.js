import PropTypes from 'prop-types';
import { routerRedux } from 'dva/router';
import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';
import moment from 'moment';

import { connect } from 'dva';
import { Input, Button, DatePicker, Select, Pagination } from 'antd';
import { Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;

const MemberInfo = ({
    memberInfo,
    loading,
    ...props
}) => {
    let { dispatch } = props;
    let { memberList, pageNum, pageSize, totalCount} = memberInfo;

    const columns = [
        {
            title: '图图号',
            dataIndex: 'tutuNumber',
            sorter: true
        }, {
            title: '用户昵称',
            dataIndex: 'realName'
        }, {
            title: '用户头像',
            dataIndex: 'icon',
            render: (text) => {
                return (text) ? <a href={ text } target='_blank'><img src={ text } style={{ width: 50, height: 35 }}/></a> : <span>无</span>
            }
        }, {
            title: '会员等级',
            dataIndex: 'userLevelName'
        }, {
            title: '是否购买精品课程',
            dataIndex: 'hasBuyTextbook',
            sorter: true,
            render: (txt) => {
                return txt === 0 ? '未购买' : '已购买'
            }
        }, {
            title: '会员开始时间',
            dataIndex: 'payTime',
        }, {
            title: '会员到期时间',
            dataIndex: 'exprieTime',
        }, {
            title: '注册时间',
            dataIndex: 'createdAt'
        }, {
        	title: '操作',
            dataIndex: 'action',
            render: (txt, record, index) => {
                return <span>
                    {
                        record.hasBuyTextbook !==  0 &&
                        <Button type="primary" size="small" onClick={() => linktoCourse(record)} style={{ marginLeft: 10 }}>已买课程</Button>
                    }
                </span>
            }
        }
    ]

    // 调转到关卡页面
    const linktoCourse= (record) => {
        dispatch(routerRedux.push({
            pathname: '/specialCourse',
            search: `userId=${record.tutuNumber}`
        }))
    }

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'memberInfo/setParam',
    		payload: param
        }).then(() => {
            dispatch({ type: 'memberInfo/getMember' })
        })
    }

    // 搜索
    const handleSearch = (param) => {
        dispatch({
			type: 'memberInfo/setParam',
			payload: {
				pageSize: 10,
				pageNum: 1
			}
		}).then(() => {
            dispatch({ type: 'memberInfo/getMember' })
        })
    }

    // 选择下拉框
    const changeSelect = (v) => {
    	dispatch({
    		type: 'memberInfo/setParam',
    		payload: v
    	})
    }

    // 输入框
    const handleInput = (e, m) => {
        dispatch({
    		type: 'memberInfo/setParam',
    		payload: {
                [m]: e.target.value
            }
    	})
    }

    // 时间选择
    const datepickerChange = (d, t) => {
        dispatch({
        	type: 'memberInfo/setParam',
        	payload: {
                expireStartTime: t[0] ? t[0] + ':00' : '',
                expireEndTime: t[1] ? t[1] + ':00' : ''
            }
        })
    }

    // 时间选择
    const datepickerChange2 = (d, t) => {
        dispatch({
        	type: 'memberInfo/setParam',
        	payload: {
                payStartTime: t[0] ? t[0] + ':00' : '',
                payEndTime: t[1] ? t[1] + ':00' : ''
            }
        })
    }

    // 时间选择
    const datepickerChangeReg = (d, t) => {
        dispatch({
        	type: 'memberInfo/setParam',
        	payload: {
                registerStartTime: t[0] ? t[0] + ':00' : '',
                registerEndTime: t[1] ? t[1] + ':00' : ''
            }
        })
    }

	return (
		<div>
            <FormInlineLayout>
                <Form layout="inline" style={{ marginLeft: 15 }}>
                    <FormItem label="注册时间">
                        <RangePicker
                            format="YYYY-MM-DD HH:mm"
                            placeholder={['开始时间', '截止时间']}
                            showTime={{
                                hideDisabledOptions: true,
                                defaultValue: [moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')],
                            }}
                            onChange={datepickerChangeReg}
                            />
                    </FormItem>

                    <FormItem label="会员开始时间">
                        <RangePicker
                            format="YYYY-MM-DD HH:mm"
                            placeholder={['开始时间', '截止时间']}
                            showTime={{
                                hideDisabledOptions: true,
                                defaultValue: [moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')],
                            }}
                            onChange={datepickerChange2}
                            />
                    </FormItem>

                    <FormItem label="会员到期时间">
                        <RangePicker
                            format="YYYY-MM-DD HH:mm"
                            placeholder={['开始时间', '截止时间']}
                            showTime={{
                                hideDisabledOptions: true,
                                defaultValue: [moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')],
                            }}
                            onChange={datepickerChange}
                            />
                    </FormItem>

                    {/*会员等级*/}
                    <FormItem label="会员等级">
                        <Select
                            mode="multiple"
                            showSearch
                            value={memberInfo.userLevelIds}
                            onFocus={() => dispatch({type: 'memberInfo/getMemberLevel'})}
                            placeholder="请选择会员等级"
                            style={{ minWidth: 150, width: '100%' }}
                            onChange={v => changeSelect({ userLevelIds: v })}
                            >
                            {
                                memberInfo.memberLevelList.map(item =>
                                    <Option key={item.userLevel} value={item.userLevel}>{item.levelName}</Option>
                                )
                            }
                        </Select>
                    </FormItem>

                    {/*图图号*/}
                    <FormItem label="图图号">
                        <Input placeholder="输入图图号" value={memberInfo.tutuNumber} onChange={(e) => handleInput(e, 'tutuNumber')}/>
                    </FormItem>

                    {/*手机号*/}
                    <FormItem label="手机号">
                        <Input placeholder="输入手机号" value={memberInfo.mobile} onChange={(e) => handleInput(e, 'mobile')}/>
                    </FormItem>

                    <FormItem>
                        <Button type="primary" icon="search" onClick={handleSearch}>搜索</Button>
                    </FormItem>

                </Form>
            </FormInlineLayout>

            <TableLayout
                pagination={false}
                dataSource={memberList}
                allColumns={columns}
                loading={ loading.effects['memberInfo/getMember'] }
                scrollX={true}
                />
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

MemberInfo.propTypes = {
    memberInfo: PropTypes.object
};

export default connect(({ memberInfo, loading }) => ({ memberInfo, loading }))(Form.create()(MemberInfo));
