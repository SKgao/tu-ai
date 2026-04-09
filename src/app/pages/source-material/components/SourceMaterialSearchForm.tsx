import { Button, DatePicker, Form, Input, Select, Space, Typography } from 'antd';
import type { FormInstance, FormProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  EMPTY_IMPORT_FORM,
  IS_PRODUCTION_API,
  SEARCH_MODE_OPTIONS,
} from '../utils/forms';
import type {
  ImportSourceMaterialFormValues,
  SourceMaterialSearchValues,
} from '../types';

type SourceMaterialSearchFormProps = {
  form: FormInstance<SourceMaterialSearchValues>;
  totalCount: number;
  selectedCount: number;
  submitting: boolean;
  actionSubmitting: boolean;
  loading: boolean;
  importForm: FormInstance<ImportSourceMaterialFormValues>;
  onSearch: FormProps<SourceMaterialSearchValues>['onFinish'];
  onCreate: () => void;
  onOpenImport: () => void;
  onBatchDelete: () => void | Promise<void>;
  onBatchDownload: () => void | Promise<void>;
  onBatchSync: () => void | Promise<void>;
};

export function SourceMaterialSearchForm({
  form,
  totalCount,
  selectedCount,
  submitting,
  actionSubmitting,
  loading,
  importForm,
  onSearch,
  onCreate,
  onOpenImport,
  onBatchDelete,
  onBatchDownload,
  onBatchSync,
}: SourceMaterialSearchFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        startTime: undefined,
        endTime: undefined,
        text: '',
        fuzzySearch: true,
      }}
      onFinish={onSearch}
    >
      <div className="toolbar-grid">
        <Form.Item label="开始时间" name="startTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="结束时间" name="endTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="素材内容" name="text">
          <Input placeholder="请输入素材内容" />
        </Form.Item>
        <Form.Item label="搜索模式" name="fuzzySearch">
          <Select options={SEARCH_MODE_OPTIONS} />
        </Form.Item>
      </div>
      <div className="toolbar-grid toolbar-grid--compact subject-toolbar-actions">
        <Typography.Text type="secondary">
          当前共 {totalCount} 条素材，已选 {selectedCount} 条
        </Typography.Text>
        <Space wrap>
          <Button type="primary" htmlType="submit" loading={loading}>
            搜索
          </Button>
          <Button type="primary" ghost icon={<PlusOutlined />} onClick={onCreate}>
            添加素材
          </Button>
          <Button
            onClick={() => {
              importForm.setFieldsValue({ ...EMPTY_IMPORT_FORM });
              onOpenImport();
            }}
          >
            导入素材
          </Button>
          <Button danger onClick={() => void onBatchDelete()} disabled={!selectedCount || submitting || actionSubmitting}>
            批量删除
          </Button>
          <Button onClick={() => void onBatchDownload()} disabled={!selectedCount || submitting || actionSubmitting}>
            批量下载音频
          </Button>
          {!IS_PRODUCTION_API ? (
            <Button onClick={() => void onBatchSync()} disabled={!selectedCount || submitting || actionSubmitting}>
              批量同步
            </Button>
          ) : null}
        </Space>
      </div>
    </Form>
  );
}
