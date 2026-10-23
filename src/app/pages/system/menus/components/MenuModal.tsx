import { Form, Input, InputNumber, Modal, Select, Typography } from 'antd';
import type { FormInstance, FormProps } from 'antd';
import type { FormModalMode } from '@/app/hooks/useFormModal';
import { MENU_ICON_OPTIONS, MenuIcon } from '@/app/lib/menuIcons';
import type { MenuFormValues, MenuParentOption, MenuSelectOption } from '../types';

type MenuModalProps = {
  open: boolean;
  mode: FormModalMode;
  form: FormInstance<MenuFormValues>;
  emptyForm: MenuFormValues;
  parentOptions: MenuParentOption[];
  menuScopeOptions: MenuSelectOption[];
  statusOptions: MenuSelectOption[];
  submitting: boolean;
  onCancel: () => void;
  onSubmit: FormProps<MenuFormValues>['onFinish'];
};

const iconSelectOptions = MENU_ICON_OPTIONS.map((option) => ({
  value: option.value,
  label: (
    <span className="menu-icon-option">
      <MenuIcon name={option.value} />
      {option.label}
    </span>
  ),
}));

export function MenuModal({
  open,
  mode,
  form,
  emptyForm,
  parentOptions,
  menuScopeOptions,
  statusOptions,
  submitting,
  onCancel,
  onSubmit,
}: MenuModalProps) {
  return (
    <Modal
      title={mode === 'create' ? '新增菜单' : '编辑菜单'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === 'create' ? '创建' : '保存'}
      cancelText="取消"
      confirmLoading={submitting}
      width={820}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        菜单名称、父级目录、图标和排序会直接决定左侧导航的展示结构。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={emptyForm} onFinish={onSubmit}>
        <div className="form-grid">
          <Form.Item label="菜单名称" name="menuName" rules={[{ required: true, message: '请输入菜单名称' }]}>
            <Input placeholder="请输入菜单名称" />
          </Form.Item>
          <Form.Item label="上级目录" name="parentId" rules={[{ required: true, message: '请选择上级目录' }]}>
            <Select
              options={[{ value: 0, label: '顶级菜单' }, ...parentOptions]}
              placeholder="请选择上级目录"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="排序值" name="sortValue" rules={[{ required: true, message: '请输入排序值' }]}>
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="数字越小越靠前" />
          </Form.Item>
          <Form.Item label="作用" name="menuScope" rules={[{ required: true, message: '请选择作用' }]}>
            <Select options={menuScopeOptions} />
          </Form.Item>
          <Form.Item label="路径" name="path" rules={[{ required: true, message: '请输入路径' }]}>
            <Input placeholder="例如 /course/special-courses" />
          </Form.Item>
          <Form.Item label="图标" name="icon" rules={[{ required: true, message: '请选择图标' }]}>
            <Select
              options={iconSelectOptions}
              placeholder="请选择图标"
              showSearch
              optionFilterProp="value"
            />
          </Form.Item>
          <Form.Item label="接口地址" name="url" className="form-field--full">
            <Input placeholder="可选，接口地址" />
          </Form.Item>
          {mode === 'edit' ? (
            <Form.Item label="状态" name="status">
              <Select options={statusOptions} />
            </Form.Item>
          ) : null}
        </div>
      </Form>
    </Modal>
  );
}
