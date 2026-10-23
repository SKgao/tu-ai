import { useState } from 'react';
import type { FormInstance } from 'antd';
import { EMPTY_RESOURCE_FORM, normalizeResourceFormValues } from '../utils/forms';
import type { ResourceFormValues, GradeRecord, ResourceType, VersionRecord } from '../types';

export type ResourceRecord = GradeRecord | VersionRecord;

export type UseResourceModalOptions = {
  /** 年级 / 教材版本共用同一个表单实例，仍由页面持有。 */
  form: FormInstance<ResourceFormValues>;
  /** 页面正在提交（教材或资源）时禁止关闭弹窗，保持原有行为。 */
  submitting?: boolean;
};

export type UseResourceModalResult = {
  /** 弹窗可见性。 */
  resourceModalOpen: boolean;
  /** 当前弹窗对应的资源类型（年级 / 教材版本）。 */
  resourceType: ResourceType;
  /** 切 tab 时同步类型并清空表单。 */
  switchResourceTab: (type: ResourceType) => void;
  /** 打开弹窗：新增（不传 item）与编辑（传 item）共用。 */
  openResourceModal: (type: ResourceType, item?: ResourceRecord) => void;
  /** 用户取消：提交中会被忽略。 */
  closeResourceModal: () => void;
  /** 提交成功后的关闭：无视提交中状态（原逻辑是直接 setOpen(false)）。 */
  closeResourceModalAfterSubmit: () => void;
};

/**
 * 「资源弹窗」（新增 / 编辑年级或教材版本）的状态与开关动作。
 *
 * 故意不包含提交逻辑：提交要同时协调 service 调用、资源列表刷新和提示文案，
 * 那部分留在页面里，本 hook 只保证「打开时表单被正确预填」「提交中不可关闭」。
 */
export function useResourceModal({
  form,
  submitting = false,
}: UseResourceModalOptions): UseResourceModalResult {
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceType, setResourceType] = useState<ResourceType>('grade');

  function switchResourceTab(type: ResourceType): void {
    setResourceType(type);
    form.setFieldsValue({ ...EMPTY_RESOURCE_FORM });
  }

  function openResourceModal(type: ResourceType, item?: ResourceRecord): void {
    setResourceType(type);
    form.setFieldsValue(normalizeResourceFormValues(type, item));
    setResourceModalOpen(true);
  }

  function closeResourceModal(): void {
    if (submitting) {
      return;
    }

    setResourceModalOpen(false);
  }

  function closeResourceModalAfterSubmit(): void {
    setResourceModalOpen(false);
  }

  return {
    resourceModalOpen,
    resourceType,
    switchResourceTab,
    openResourceModal,
    closeResourceModal,
    closeResourceModalAfterSubmit,
  };
}
