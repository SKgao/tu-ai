import PropTypes from 'prop-types';
import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';
import TablePopoverLayout from '@/components/TablePopoverLayout';
import MyUpload from '@/components/UploadComponent';
import { filterObj } from '@/utils/tools';

import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { Input, Button, Modal, Popconfirm, message } from 'antd';
import { Form } from '@ant-design/compatible';
const FormItem = Form.Item;

const MemberLevel = ({
    memberLevel,
    loading,
    ...props
}) => {
    let { dispatch, form } = props;
    let { levelList, modalShow} = memberLevel;
    let { getFieldDecorator, validateFieldsAndScroll, setFieldsValue, resetFields } = form;

    const columns = [
        {
            title: '会员等级id',
            dataIndex: 'userLevel',
            sorter: true
        }, {
            title: '会员等级名称',
            dataIndex: 'levelName',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改会员等级名称'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'memberLevel/updateMemberLevel',
							payload: {
								userLevel: record.userLevel - 0,
								levelName: v
							}
						})
					}/>
        }, {
            title: '等级描述',
            dataIndex: 'explainInfo',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改等级描述'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'memberLevel/updateMemberLevel',
							payload: {
								userLevel: record.userLevel - 0,
								explainInfo: Number(v)
							}
						})
					}/>
        }, {
            title: '图标',
            dataIndex: 'icon'
        }, {
            title: '过期时间',
            dataIndex: 'exprieDays',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改过期时间'}
					valueData={ (text == 0) ? '永久有效' : text }
					defaultValue={ (text == 0) ? '永久有效' : text }
					onOk={v =>
						dispatch({
							type: 'memberLevel/updateMemberLevel',
							payload: {
								userLevel: record.userLevel - 0,
								exprieDays: Number(v)
							}
						})
					}/>
        }, {
            title: '原始价格',
            dataIndex: 'orgMoney',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改原始价格'}
					valueData={ (Number(text) / 100).toFixed(2) + '元' || '0元'}
					defaultValue={ (Number(text) / 100).toFixed(2) + '元' || '0元'}
					onOk={v =>
						dispatch({
							type: 'memberLevel/updateMemberLevel',
							payload: {
								userLevel: record.userLevel - 0,
								orgMoney: Number(v.replace(/元/g, '')) * 100
							}
						})
					}/>
        }, {
            title: '需充值金额',
            dataIndex: 'needMoney',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改需充值金额'}
					valueData={ (Number(text) / 100).toFixed(2) + '元' || '0元'}
					defaultValue={ (Number(text) / 100).toFixed(2) + '元' || '0元'}
					onOk={v =>
						dispatch({
							type: 'memberLevel/updateMemberLevel',
							payload: {
								userLevel: record.userLevel - 0,
								needMoney: Number(v.replace(/元/g, '')) * 100
							}
						})
					}/>
        }, {
        	title: '上传图标',
        	dataIndex: 'updateicon',
            render: (text, record, index) => {
                return <MyUpload uploadTxt={'选择图片'} uploadSuccess={(url) => {
                    changeIcon(url, record)
                }}></MyUpload>
            }
        }, {
        	title: '操作',
            dataIndex: 'action',
            render: (txt, record, index) => {
                return <span>
                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(record)}>
                        <Button type="danger" size="small" style={{ marginLeft: 5 }}>删除</Button>
                    </Popconfirm>
                </span>
            }
        }
    ]

    // 修改会员图标
    const changeIcon = (url, record) => {
        dispatch({
    		type: 'memberLevel/updateMemberLevel',
    		payload: {
                id: record.id,
                icon: url
            }
    	})
    }

    // 删除会员等级
    const handleDelete = (param) => {
        dispatch({
    		type: 'memberLevel/deleteMemberLevel',
    		payload: {
                userLevel: param.userLevel
            }
        })
    }

    // 选择下拉框
    const changeSelect = (v) => {
    	dispatch({
    		type: 'memberLevel/setParam',
    		payload: v
    	})
    }

    // 展示modal
    const changeModalState = (show) => {
        dispatch({
        	type: 'memberLevel/setParam',
        	payload: {
                modalShow: show
            }
        })
    }

    // 表单取消
    const handleReset  = () => {
        resetFields()
        dispatch({
    		type: 'memberLevel/setParam',
    		payload: {
                modalShow: false
    		}
    	})
    }

    // 添加版本信息
	const handleSubmit = (e) => {
		e.preventDefault()
		validateFieldsAndScroll((err, values) => {
			if (!err) {
                let arr = levelList.map(e => e.userLevel)
                values.exprieDays && (values.exprieDays = values.exprieDays - 0)
                values.orgMoney && (values.orgMoney =  Number(values.orgMoney) * 100)
                values.needMoney && (values.needMoney = Number(values.needMoney) * 100)
                values.userLevel && (values.userLevel = Number(values.userLevel))
                if (arr.includes(values.userLevel)) {
                    message.warning('等级id已存在, 请重新输入')
                } else {
                    dispatch({
                        type: 'memberLevel/addMemberLevel',
                        payload: filterObj(values)
                    })
                }
			}
		});
    }

   // 文件上传成功
   const uploadSuccess = (url) => setFieldsValue({'icon': url})

	return (
		<div>
			<FormInlineLayout>
			    <Form layout="inline" style={{ marginLeft: 15 }}>
                    <FormItem>
                        <Button type="primary" onClick={() => changeModalState(true)}>添加会员等级</Button>
                    </FormItem>
                </Form>
            </FormInlineLayout>

            <Modal
                title="新增会员等级"
                visible={modalShow}
                onCancel= { () => changeModalState(false) }
                okText="确认"
                cancelText="取消"
                footer={null}
                >
                <Form>
                    <FormItem
                        label="会员等级名称"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('levelName', {
                            rules: [{ required: true, message: '请输入会员等级名称!', whitespace: true }],
                        })(
                            <Input placeholder="请输入会员等级名称"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="会员等级id"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('userLevel', {
                            rules: [{ required: true, message: '请输入会员等级id!', whitespace: true }],
                        })(
                            <Input placeholder="请输入会员等级id"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="会员过期时间"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('exprieDays', {
                            rules: [{ required: true, message: '请输入会员过期时间!', whitespace: true }],
                        })(
                            <Input placeholder="以天为单位（0为永久有效）"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="原始价格"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('orgMoney', {
                            rules: [{ required: true, message: '请输入原始价格!', whitespace: true }],
                        })(
                            <Input placeholder="请输入原始价格"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="需充值金额"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('needMoney', {
                            rules: [{ required: true, message: '请输入需充值金额!', whitespace: true }],
                        })(
                            <Input placeholder="请输入需充值金额"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="图标"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('icon', {

                        })(
                            <MyUpload uploadSuccess={uploadSuccess} uploadTxt={'上传图片'}></MyUpload>
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
                scrollX={true}
                dataSource={levelList}
                allColumns={columns}
                loading={ loading.effects['memberLevel/getMemberLevel'] }
                />
		</div>
	)
};

MemberLevel.propTypes = {
    memberLevel: PropTypes.object
};

export default connect(({ memberLevel, loading }) => ({ memberLevel, loading }))(Form.create()(MemberLevel));
