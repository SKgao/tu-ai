import { Link } from 'react-router-dom';
import { Button, Image, Popconfirm, Space, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { formatDateTime } from '@/app/lib/dateTime';
import type { CourseBagCourseRecord } from '../types';

type CreateCourseBagCourseColumnsOptions = {
  onEdit: (course: CourseBagCourseRecord) => void;
  onToggleStatus: (course: CourseBagCourseRecord) => void | Promise<void>;
  onDelete: (course: CourseBagCourseRecord) => void | Promise<void>;
  submitting: boolean;
};

export function createCourseBagCourseColumns({
  onEdit,
  onToggleStatus,
  onDelete,
  submitting,
}: CreateCourseBagCourseColumnsOptions): TableColumnsType<CourseBagCourseRecord> {
  return [
    { title: '课程名称', dataIndex: 'name', render: (value) => value || '-' },
    {
      title: '封面',
      dataIndex: 'icon',
      render: (value, row) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={value}
            alt={row.name || 'course'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value) => (
        <Tag color={Number(value) === 1 ? 'success' : 'warning'}>
          {Number(value) === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    { title: '排序', dataIndex: 'sort', render: (value) => value ?? '-' },
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => formatDateTime(value) },
    {
      title: '链路',
      key: 'links',
      render: (_, course) => (
        <Space size="small" wrap>
          <Link to={`/material/units?textBookId=${course.id}`} className="ant-btn ant-btn-link">
            查看单元
          </Link>
          <Link to={`/material/sessions?textbookId=${course.id}`} className="ant-btn ant-btn-link">
            查看大关卡
          </Link>
          <Link to={`/material/custom-passes?textbookId=${course.id}`} className="ant-btn ant-btn-link">
            查看小关卡
          </Link>
          <Link
            to={`/course/course-bag-activities?id=${course.id}&courseName=${encodeURIComponent(course.name || '')}`}
            className="ant-btn ant-btn-link"
          >
            查看活动
          </Link>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, course) => (
        <Space size="small" wrap>
          <Button type="link" onClick={() => onEdit(course)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => onToggleStatus(course)}
            disabled={submitting}
            style={{ paddingInline: 0 }}
          >
            {Number(course.status) === 1 ? '禁用' : '启用'}
          </Button>
          <Popconfirm
            title={`确认删除课程 ${course.name || course.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(course)}
            disabled={submitting}
          >
            <Button type="link" danger disabled={submitting} style={{ paddingInline: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
