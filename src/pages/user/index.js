import PropTypes from 'prop-types';
import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';
import PaginationLayout from '@/components/PaginationLayout';
import TablePopoverLayout from '@/components/TablePopoverLayout';
import MyUpload from '@/components/UploadComponent';
import VaildForm from './VaildForm';
import moment from 'moment';
import { filterObj } from '@/utils/tools';

import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { DatePicker, Input, Button, Popconfirm, message, Modal, Badge } from 'antd';
import { Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const UserSetting = ({
    userSetting,
    loading,
    ...props
}) => {
    let { dispatch, form } = props;
    let { getFieldDecorator, validateFieldsAndScroll, resetFields } = form;
    let { tableData, account, startTime, endTime, modalShow, modal2Show, avatar, roleList, pageNum, pageSize, totalCount } = userSetting;
    const columns = [
        {
            title: '用户名',
            dataIndex: 'account',
            sorter: true
        }, {
        	title: '用户头像',
            dataIndex: 'avatar',
            render: (text) => {
                let url = (text && text !== 'string') ? text : '//web.chengxuyuantoutiao.com/static/tutu_logo.png'
                return (text && text !== 'string') ? <a href={ url } target='_blank' rel="nofollow noopener noreferrer">
                    <img alt="" src={ url } style={{ width: 55, height: 45 }}/>
                </a> : '无'
            }
        }, {
        	title: '手机号',
            dataIndex: 'phone',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改手机号'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'userSetting/updateUser',
							payload: {
								id: record.id,
								phone: v
							}
						})
					}/>
        }, {
        	title: '邮箱',
            dataIndex: 'email',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改邮箱'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'userSetting/updateUser',
							payload: {
								id: record.id,
								email: v
							}
						})
					}/>
        }, {
        	title: '姓名',
            dataIndex: 'name',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改姓名'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'userSetting/updateUser',
							payload: {
								id: record.id,
								name: v
							}
						})
					}/>
        }, {
        	title: '性别',
            dataIndex: 'sex',
        	sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
                    title={'修改性别'}
                    optionKey={'id'}
					optionItem={'name'}
					valueData={[{
                        id: 1,
                        name: '男'
                    }, {
                        id: 2,
                        name: '女'
                    }]}
					defaultValue={ (text == 1) ? '男' : (text == 2) ? '女' : '未知' }
					onOk={v =>
						dispatch({
							type: 'userSetting/updateUser',
							payload: {
								id: record.id,
								sex: v
							}
						})
					}/>
        }, {
        	title: '用户角色',
        	dataIndex: 'roleId',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改用户角色'}
					valueData={roleList}
					focusSelect={() => dispatch({type: 'userSetting/getRoleList'})}
					optionKey={'id'}
					optionItem={'name'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'userSetting/updateUser',
							payload: {
								id: record.id,
								roleid: v - 0
							}
						})
					}/>
        }, {
        	title: '角色名称',
        	dataIndex: 'roleName'
        }, {
        	title: '创建时间',
        	dataIndex: 'createtime'
        }, {
        	title: '用户状态',
            dataIndex: 'status',
            render: (val) => {
                const opt = [
                    { val: 1, status: 'processing', text: '正常' },
                    { val: 2, status: 'warning', text: '冻结' },
                    { val: 3, status: 'error', text: '已删除' }
                ].filter(e => e.val === val)
                return <Badge status={opt.status} text={opt.text}/>;
			}
        },
        {
        	title: '上传头像',
        	dataIndex: 'updateicon',
            render: (text, record, index) => {
                return <MyUpload uploadTxt={'选择图片'} uploadSuccess={(url) => {
                    changeIcon(url, record)
                }}></MyUpload>
            }
        },
        {
        	title: '操作',
            dataIndex: 'action',
            render: (txt, record, index) => {
                return <span>
                    {
                        record.status !== 1 &&
                        <Button
                           type="primary"
                           size="small"
                           onClick={() => handleUsing(record)}>
                           { record.status === 2 ? '启用' : '恢复' }
                        </Button>
					}
					{
                        record.status === 1 && <Button size="small" style={{ marginLeft: 5 }} onClick={() => handleForbidden(record)}>禁用</Button>
                    }

                    <Button size="small" style={{ marginLeft: 5 }} onClick={() => {
                        dispatch({
                            type: 'userSetting/setParam',
                            payload: {
                                userid: record.id
                            }
                        })
                        changeModalState('modal2Show', true)
                    }}>修改密码</Button>

                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(record)}>
                        <Button icon="delete" type="danger" size="small" style={{ marginLeft: 5 }}>删除</Button>
                    </Popconfirm>
                </span>
            }
        }
    ]

    // 修改用户头像
    const changeIcon = (url, record) => {
        dispatch({
    		type: 'userSetting/updateUser',
    		payload: {
                id: record.id,
                avatar: url
            }
    	})
    }

    /**
     * 删除用户
     * @param  {object} 列数据
     */
    const handleDelete = (param) => {
        dispatch({
    		type: 'userSetting/deleteUser',
    		payload: param.id
    	})
    }

    /**
     * 启用
     * @param  {object} 列数据
     */
    const handleUsing = (param) => {
    	dispatch({
    		type: 'userSetting/usingUser',
    		payload: param.id
    	})
    }

    /**
     * 禁用
     * @param  {object} 列数据
     */
    const handleForbidden = (param) => {
    	dispatch({
    		type: 'userSetting/forbiddenUser',
    		payload: param.id
    	})
    }

    // 输入用户名
    const handleInput = (e) => {
        dispatch({
    		type: 'userSetting/setParam',
    		payload: {
                account: e.target.value
            }
    	})
    }

    // 选择时间框
    const datepickerChange = (d, t) => {
        dispatch({
        	type: 'userSetting/setParam',
        	payload: {
                startTime: t[0] ? t[0] + ':00' : '',
                endTime: t[1] ? t[1] + ':00' : ''
            }
        })
    }

    // 搜索
    const handleSearch = () => {
        dispatch({
    		type: 'userSetting/setParam',
    		payload: {
                pageNum: 1,
                pageSize: 10
            }
        })
     	dispatch({
    		type: 'userSetting/getUser',
    		payload: { account, startTime, endTime, pageNum: 1, pageSize: 10 }
    	})
    }

    // 展示modal
    const changeModalState = (modal, show) => {
        dispatch({
        	type: 'userSetting/setParam',
        	payload: {
                [modal]: show
            }
        })
    }

    // 提交表单
    const submitForm = (userinfo) => {
        avatar && (userinfo.avatar = avatar);
        dispatch({
        	type: 'userSetting/addUser',
        	payload: filterObj(userinfo)
        })
    }

    // 获取角色列表
    const getRoleList = () => {
        dispatch({ type: 'userSetting/getRoleList' })
    }

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'userSetting/setParam',
    		payload: param
        })
        dispatch({
            type: 'userSetting/getUser',
            payload: { account, startTime, endTime, ...param }
        })
    }

    // 表单取消
	const handleReset = () => {
		resetFields()
		dispatch({
			type: 'userSetting/setParam',
			payload: {
				modal2Show: false
			}
		})
    }

    // 修改密码
	const handlePassword = (e) => {
		e.preventDefault();
		validateFieldsAndScroll((err, values) => {
			if (!err) {
				if (values.password2 !== values.password) {
                    message.warning('两次密码输入不一样！')
                } else {
                    dispatch({
                        type: 'userSetting/updateUser',
                        payload: {
                            id: userSetting.userid,
                            password: values.password
                        }
                    })
                    handleReset()
                }
			}
		});
	}

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

                    {/*用户名*/}
                    <FormItem label="用户名">
                        <Input placeholder="输入用户名" value={account} onChange={(e) => handleInput(e)}/>
                    </FormItem>

                    <FormItem>
                        <Button type="primary" icon="search" onClick={handleSearch}>搜索</Button>
                    </FormItem>

                    <FormItem>
                        <Button type="primary" onClick={() => changeModalState('modalShow', true)}>添加用户</Button>
                    </FormItem>

                </Form>
            </FormInlineLayout>

            <Modal
                title="新增用户"
                visible={modalShow}
                onOk={ () => changeModalState('modalShow', false) }
                onCancel= { () => changeModalState('modalShow', false) }
                okText="确认"
                cancelText="取消"
                footer={null}
                >
                <VaildForm
                    submitForm={submitForm}
                    getRoleList={getRoleList}
                    roleList={roleList}
                    resetForm={() => ('modalShow', false)}
                    >
                </VaildForm>
            </Modal>

            <Modal
                title="修改密码"
                visible={modal2Show}
                onOk={ () => changeModalState('modal2Show', false) }
                onCancel= { () => changeModalState('modal2Show', false) }
                okText="确认"
                cancelText="取消"
                footer={null}
                >
                <Form>
                    {/*App类型*/}
                    <FormItem
                        label="密码"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: '请重新输入密码!' }],
                        })(
                            <Input type="password" placeholder="请输入密码"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="确认密码"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('password2', {
                            rules: [{ required: true, message: '请确认密码!', whitespace: false }],
                        })(
                            <Input type="password" placeholder="请再次输入密码！"/>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}>
                        <Button type="primary" onClick={handlePassword} style={{ marginLeft: 75 }}>提交</Button>
                        <Button onClick={handleReset} style={{ marginLeft: 15 }}>取消</Button>
                    </FormItem>
                </Form>
            </Modal>

            <TableLayout
                pagination={false}
                loading={ loading.effects['userSetting/getUser'] }
                dataSource={tableData}
                allColumns={columns}
                scrollX={true}
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

UserSetting.propTypes = {
    userSetting: PropTypes.object
};

export default connect(({ userSetting, loading }) => ({ userSetting, loading }))(Form.create()(UserSetting));
