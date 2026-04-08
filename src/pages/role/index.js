import PropTypes from 'prop-types';
import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';

import { connect } from 'dva';
import { Input, Button, Popconfirm, Modal, Tree, message } from 'antd';
import { Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;

const RoleSetting = ({
    roleSetting,
    ...props
}) => {
    let { dispatch, form } = props;
    let { tableData, modalShow, modal2Show, account, siderList, defaultCheckedKeys, halfCheckedKeys } = roleSetting;
    let { getFieldDecorator, getFieldValue } = form;

    const columns = [
        {
            title: '角色名',
            dataIndex: 'name',
            sorter: true
        }, {
        	title: '操作',
            dataIndex: 'action',
            render: (txt, record, index) => {
                return <span>
                    <Button type="primary" size="small" onClick={() => getMenus(record)}>授权</Button>
                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(record)}>
                        <Button type="danger" size="small" style={{ marginLeft: 10 }}>删除</Button>
                    </Popconfirm>
                </span>
            }
        }
    ]

    // 渲染权限树列表
	const renderTree = item => {
		if (item.children && item.children.length) {
            return (
				<TreeNode title={item.name} key={item.id + ''}>
					{
						item.children.map(subitem => renderTree(subitem))
					}
				</TreeNode>
			)
		} else {
			return <TreeNode title={item.name} key={item.id + ''}/>
		}
    }

    // 点击权限数
    const checkTree = (checkedKeys, e) => {
        dispatch({
        	type: 'roleSetting/setParam',
        	payload: {
                defaultCheckedKeys: checkedKeys,
                halfCheckedKeys: Array.from(new Set(halfCheckedKeys.concat(e.halfCheckedKeys)))
            }
        })
    }

    // 获取左侧菜单数据
    const getMenus = (record) => {
        dispatch({
        	type: 'roleSetting/setParam',
        	payload: {
                roleid: record.id,
                rolename: record.name,
                defaultCheckedKeys: [],
                halfCheckedKeys: []
            }
        })
        dispatch({
            type: 'roleSetting/getMenus',
            payload: {
                id: record.id
            }
        })
    }

    /**
     * 删除角色
     * @param  {object} 列数据
     */
    const handleDelete = (param) => {
        dispatch({
    		type: 'roleSetting/deleteRole',
    		payload: param.id
    	})
    }

    /**
     * 给角色授权
     * @param  {object} 列数据
     */
    const rolesetAuthority = () => {
        if (defaultCheckedKeys.length > 0) {
            dispatch({
            	type: 'roleSetting/setauthRole',
            	payload: {
            		menuIds: Array.from(new Set(halfCheckedKeys.concat(defaultCheckedKeys))),
            		roleId: roleSetting.roleid
            	}
            })
        } else {
            message.warning('请选择菜单授权！')
        }
    }

    // 输入角色名
    const handleInput = (e) => {
        dispatch({
    		type: 'roleSetting/setParam',
    		payload: {
                account: e.target.value
            }
    	})
    }

    // 搜索
    const handleSearch = () => {
     	dispatch({
    		type: 'roleSetting/getRole',
    		payload: account
    	})
    }

    // 添加角色
    const handleSubmit = () => {
        dispatch({
        	type: 'roleSetting/addRole',
        	payload: getFieldValue('rolename')
        })
    }

    // 展示modal
    const changeModalState = (modal, show) => {
        dispatch({
        	type: 'roleSetting/setParam',
        	payload: {
                [modal]: show
            }
        })
    }

	return (
		<div>
			<FormInlineLayout>
			    <Form layout="inline" style={{ marginLeft: 15 }}>
                    {/*角色名*/}
                    <FormItem label="角色名">
                        <Input placeholder="输入角色名" value={account} onChange={(e) => handleInput(e)}/>
                    </FormItem>

                    <FormItem>
                        <Button type="primary" icon="search" onClick={handleSearch}>搜索</Button>
                    </FormItem>

                    <FormItem>
                        <Button type="primary" onClick={() => changeModalState('modalShow', true)}>添加角色</Button>
                    </FormItem>

                </Form>
            </FormInlineLayout>

            <Modal
                title="新增角色"
                visible={modalShow}
                onOk={ () => changeModalState('modalShow', false) }
                onCancel= { () => changeModalState('modalShow', false) }
                okText="确认"
                cancelText="取消"
                footer={null}
                >
                <Form>
                    <FormItem>
                        {getFieldDecorator('rolename', {
                            rules: [{ required: true, message: '请输入角色名!', whitespace: true }],
                        })(
                            <Input placeholder="请输入角色名"/>
                        )}
                    </FormItem>

                    <FormItem>
                        <Button type="primary" onClick={handleSubmit}>提交</Button>
                    </FormItem>
                </Form>
            </Modal>

            <Modal
                title={ roleSetting.rolename ? `给${roleSetting.rolename}授权` : '给当前角色授权' }
                visible={modal2Show}
                onOk={() => {
                    changeModalState('modal2Show', false)
                    rolesetAuthority()
                }}
                onCancel= { () => changeModalState('modal2Show', false) }
                okText="确认授权"
                cancelText="取消"
                >

                <div>
                    <Tree
                        checkable
                        checkedKeys={ roleSetting.defaultCheckedKeys }
                        onCheck={checkTree}
                    >
                        {
                            siderList.map(item => renderTree(item))
                        }
                    </Tree>
                </div>
            </Modal>

            <TableLayout
                dataSource={tableData}
                allColumns={columns}
            />
		</div>
	)
};

RoleSetting.propTypes = {
    roleSetting: PropTypes.object
};

export default connect(({ roleSetting }) => ({ roleSetting }))(Form.create()(RoleSetting));
