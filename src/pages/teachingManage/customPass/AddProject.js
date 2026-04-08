import PropTypes from 'prop-types';
import { filterObj } from '@/utils/tools';
import MyUpload from '@/components/UploadComponent';
import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { Button, Input, Select, Tooltip } from 'antd';
import { Icon, Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const Option = Select.Option;

const AddProject = ({
    customPass,
    ...props
}) => {
    let { dispatch, form } = props;
    const { getFieldDecorator, validateFieldsAndScroll, resetFields, setFieldsValue } = form;

    // 添加题目
	const handleAddSubject = (e) => {
		e.preventDefault()
		validateFieldsAndScroll((err, values) => {
			if (!err) {
                const { sentenceAudio, sceneGraph, partsId, sessionId } = customPass;
                values.customsPassId && (values.customsPassId = values.customsPassId - 0);
                values.partId = partsId - 0;
                values.sessionId = sessionId - 0;
                values.sort && (values.sort = values.sort - 0);
                values.sentenceAudio = sentenceAudio;
                values.sceneGraph = sceneGraph;
                values.showIndex = values.showIndex ? values.showIndex.split(/\s+/g) : '';
                dispatch({
                    type: 'customPass/addTopic',
                    payload: filterObj(values)
                }).then(() => {
                    handleReset()
                })
			}
		});
    }

    // 重置表单
    const handleReset = (e) => {
        resetFields()
        dispatch({
    		type: 'customPass/setParam',
    		payload: {
    			modalShow3: false
    		}
    	})
    }

    // 选择下拉框
    const changeSelect = (v) => {
    	dispatch({
    		type: 'customPass/setParam',
    		payload: v
    	})
    }

    // 设置头像
    const uploadSuccess = (url, field) => {
        setFieldsValue({ [field]: url });
    }

	return (
        <div>
            <Form>
                <FormItem
                    label="小关卡"
                    {...formItemLayout}
                    >
                    {getFieldDecorator('customsPassId', {
                        rules: [{ required: true, message: '请选择小关卡!' }],
                    })(
                        <Select
                            showSearch
                            placeholder="请选择小关卡"
                            onChange={v => changeSelect({ customsPassId: v })}
                            >
                            {
                                customPass.passList.map(item =>
                                    <Option key={item.id} value={item.id}>{item.title + ''}</Option>
                                )
                            }
                        </Select>
                    )}
                </FormItem>

                <FormItem
                    label="题目内容"
                    {...formItemLayout}
                    >
                    {getFieldDecorator('sourceIds', {
                        rules: [{ required: true, message: '请输入题目内容!' }],
                    })(
                        <Input placeholder="请输入题目内容"/>
                    )}
                </FormItem>

                <FormItem
                    label="题目顺序"
                    {...formItemLayout}
                    >
                    {getFieldDecorator('sort', {
                        rules: [{ required: true, message: '请输入题目顺序!' }],
                    })(
                        <Input placeholder="请输入题目顺序"/>
                    )}
                </FormItem>

                <FormItem
                    label={(
                        <span>
                            挖空规则&nbsp;
                            <Tooltip title="听音拼写挖空规则1  2，表示第1个和第2个提示，例如：do_ dog拼写">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                        )}
                    {...formItemLayout}
                    >
                    {getFieldDecorator('showIndex', {
                        rules: [{ required: false, message: '请输入挖空规则, 数字之间用 空格 分隔开!' }],
                    })(
                        <Input placeholder="请输入挖空规则, 数字之间用 空格 分隔开!"/>
                    )}
                </FormItem>

                {
                    customPass.customsPassId == 8
                    ? <FormItem
                        label="场景图片"
                        {...formItemLayout}
                        >
                        <MyUpload uploadSuccess={url => uploadSuccess(url, 'sceneGraph')}></MyUpload>
                    </FormItem>
                    : null
                }

                <FormItem
                    label="题目图片"
                    {...formItemLayout}
                    >
                    <MyUpload uploadSuccess={url => uploadSuccess(url, 'icon')}></MyUpload>
                </FormItem>

                <FormItem
                    label="题目音频"
                    {...formItemLayout}
                    >
                    <MyUpload uploadSuccess={url => uploadSuccess(url, 'audio')}></MyUpload>
                </FormItem>

                <FormItem
                    label={(
                        <span>
                            句子音频&nbsp;
                            <Tooltip title="题目是句子+词组时导入">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                        )}
                    {...formItemLayout}
                    >
                    <MyUpload uploadSuccess={url => uploadSuccess(url, 'sentenceAudio')}></MyUpload>
                </FormItem>

                <FormItem
                    {...formItemLayout}>
                    <Button type="primary" onClick={handleAddSubject} style={{ marginLeft: 45 }}>提交</Button>
                    <Button onClick={() => handleReset('modalShow3')} style={{ marginLeft: 15 }}>取消</Button>
                </FormItem>
            </Form>
		</div>
	)
};

AddProject.propTypes = {
    customPass: PropTypes.object
};

export default connect(({ customPass }) => ({ customPass }))(Form.create()(AddProject));