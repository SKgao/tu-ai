import { routerRedux } from 'dva/router';
import TableLayout from '@/components/TableLayout';
import FormInlineLayout from '@/components/FormInlineLayout';
import PaginationLayout from '@/components/PaginationLayout';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Form, Icon } from '@ant-design/compatible';
const FormItem = Form.Item;

const LearningRecord = ({
    learningRecord,
    loading,
    ...props
}) => {
    let { dispatch } = props;
    let { list, pageNum, pageSize, totalCount } = learningRecord;

    const allColumns = [
        {
            title: '教材名称',
            dataIndex: 'textbookName'
        }, {
            title: '单元名称',
            dataIndex: 'unitName',
            render: (text) => <span>{ text ? text :  '无' }</span>
        }, {
            title: 'part名称',
            dataIndex: 'partName',
            render: (text) => <span>{ text ? text :  '无' }</span>
        }, {
            title: '关卡名称',
            dataIndex: 'sessionName',
            render: (text) => <span>{ text ? text :  '无' }</span>
        }, {
            title: '学习时间',
            dataIndex: 'createdAt'
        }
    ]

    // 操作分页
    const handleChange = (param) => {
        dispatch({
            type: 'learningRecord/setParam',
            payload: param
        }).then(() => {
            dispatch({ type: 'learningRecord/getRecord' })
        })
    }

    // 返回
    const goBack = () => dispatch(routerRedux.goBack(-1))

	return (
		<div>
            <FormInlineLayout>
			    <Form layout="inline" style={{ marginLeft: 15 }}>
                    <FormItem>
                        <a className={'link-back'} onClick={goBack}><Icon type="arrow-left"/>后退</a>
                    </FormItem>
                </Form>
            </FormInlineLayout>

            <TableLayout
                pagination={false}
                dataSource={list}
                allColumns={allColumns}
                loading={ loading.effects['learningRecord/getRecord'] }
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

LearningRecord.propTypes = {
  learningRecord: PropTypes.object
};

export default connect(({ learningRecord, loading }) => ({ learningRecord, loading }))(Form.create()(LearningRecord));
