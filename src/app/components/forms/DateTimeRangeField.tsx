import { DatePicker, Form } from 'antd';
import type { FormInstance } from 'antd';
import type { Dayjs } from 'dayjs';

type DateTimeRangeFieldProps<TValues extends Record<string, unknown>> = {
  /** 目标表单实例 */
  form: FormInstance<TValues>;
  /** 开始时间字段名，默认 startTime */
  startName?: string;
  /** 结束时间字段名，默认 endTime */
  endName?: string;
  /** 两个占位符（原标签被移除后，用它说明含义） */
  placeholder?: [string, string];
  className?: string;
};

/**
 * 查询表单里的「时间范围」控件。
 *
 * 界面是**一个** `RangePicker`，但**提交字段仍然是 startTime / endTime 两个字段**，
 * 接口契约不变。实现要点：
 *
 * 1. antd 的 `onFinish` 只会带上**已注册字段**的值（内部走
 *    `getFieldsValue(已注册字段列表)`），所以必须用两个隐藏 Form.Item 把
 *    `startTime` / `endTime` 注册进去；`hidden` 在 antd 里是 `display:none`，
 *    不占布局。
 * 2. 范围选择器自身不挂 `name`，用 `value` / `onChange` 受控，把值写回上面两个字段，
 *    这样重置（`resetFields`）与提交都能正常工作。
 * 3. 不显示标签：占位符已说明含义，标签会让它在工具栏里单独占一行。
 *    配套样式见 `.form-field--span-2`。
 */
export function DateTimeRangeField<TValues extends Record<string, unknown>>({
  form,
  startName = 'startTime',
  endName = 'endTime',
  placeholder = ['开始时间', '结束时间'],
  className = 'form-field--span-2',
}: DateTimeRangeFieldProps<TValues>) {
  const startTime = Form.useWatch(startName, form) as Dayjs | undefined;
  const endTime = Form.useWatch(endName, form) as Dayjs | undefined;
  const rangeValue: [Dayjs | null, Dayjs | null] | null =
    startTime || endTime ? [startTime ?? null, endTime ?? null] : null;

  return (
    <>
      <Form.Item name={startName} hidden>
        <DatePicker />
      </Form.Item>
      <Form.Item name={endName} hidden>
        <DatePicker />
      </Form.Item>

      <Form.Item className={className}>
        <DatePicker.RangePicker
          showTime
          allowEmpty={[true, true]}
          style={{ width: '100%' }}
          placeholder={placeholder}
          value={rangeValue}
          onChange={(next) => {
            // 动态字段名无法被 TS 静态校验，这里断言成 setFieldsValue 的入参类型
            form.setFieldsValue({
              [startName]: next?.[0] ?? undefined,
              [endName]: next?.[1] ?? undefined,
            } as Parameters<FormInstance<TValues>['setFieldsValue']>[0]);
          }}
        />
      </Form.Item>
    </>
  );
}
