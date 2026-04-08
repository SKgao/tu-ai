import React, { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { listMemberInfos } from '@/app/services/member-info';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { PageTableCard } from '@/app/components/PageTableCard';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { createMemberInfoColumns } from './configs/tableColumns';
import {
  selectMemberLevelOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const INITIAL_FILTERS = {
  registerStartTime: '',
  registerEndTime: '',
  payStartTime: '',
  payEndTime: '',
  expireStartTime: '',
  expireEndTime: '',
  userLevelIds: [],
  tutuNumber: '',
  mobile: '',
};

const INITIAL_QUERY = {
  pageNum: 1,
  pageSize: 10,
  userLevelIds: [],
  expireStartTime: '',
  expireEndTime: '',
  payStartTime: '',
  payEndTime: '',
  registerStartTime: '',
  registerEndTime: '',
  tutuNumber: '',
  mobile: '',
};

function toApiDateTime(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '';
}

export function MemberInfoManagementPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const didInitLevelsRef = useRef(false);
  const { feedback, showError } = useFeedbackState();
  const memberLevelOptions = useMemberCommerceOptionsStore(selectMemberLevelOptions);
  const ensureMemberLevelOptions = useMemberCommerceOptionsStore(
    (state) => state.ensureMemberLevelOptions,
  );
  const columns = useMemo(() => createMemberInfoColumns(), []);
  const {
    query,
    data: members,
    totalCount,
    totalPages,
    loading,
    applyFilters,
    patchQuery,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: INITIAL_QUERY,
    request: listMemberInfos,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (message) => showError(message || '会员信息列表加载失败'),
  });

  const levelOptions = memberLevelOptions.filter((item) => item.levelName !== '普通用户');

  useEffect(() => {
    ensureMemberLevelOptions().catch((error) => {
      showError(error?.message || '会员等级列表加载失败');
    });
  }, []);

  useEffect(() => {
    if (didInitLevelsRef.current || !levelOptions.length) {
      return;
    }

    const selectedLevelIds = levelOptions.map((item) => String(item.userLevel));

    setFilters((current) => ({
      ...current,
      userLevelIds: selectedLevelIds,
    }));
    patchQuery({
      userLevelIds: levelOptions.map((item) => Number(item.userLevel)),
    });
    didInitLevelsRef.current = true;
  }, [levelOptions, patchQuery]);

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSearch() {
    applyFilters({
      userLevelIds: filters.userLevelIds.map((item) => Number(item)),
      expireStartTime: toApiDateTime(filters.expireStartTime),
      expireEndTime: toApiDateTime(filters.expireEndTime),
      payStartTime: toApiDateTime(filters.payStartTime),
      payEndTime: toApiDateTime(filters.payEndTime),
      registerStartTime: toApiDateTime(filters.registerStartTime),
      registerEndTime: toApiDateTime(filters.registerEndTime),
      tutuNumber: filters.tutuNumber.trim(),
      mobile: filters.mobile.trim(),
    });
  }

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">会员信息</h2>
          <p className="page-copy">
            这一页对应旧版 `memberInfo` 模块，聚焦会员用户列表和已买课程相关筛选。
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="toolbar-grid toolbar-grid--books">
          <label className="form-field">
            <span>注册开始时间</span>
            <input
              type="datetime-local"
              value={filters.registerStartTime}
              onChange={(event) => updateFilter('registerStartTime', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>注册结束时间</span>
            <input
              type="datetime-local"
              value={filters.registerEndTime}
              onChange={(event) => updateFilter('registerEndTime', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>会员开始时间</span>
            <input
              type="datetime-local"
              value={filters.payStartTime}
              onChange={(event) => updateFilter('payStartTime', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>会员结束时间</span>
            <input
              type="datetime-local"
              value={filters.payEndTime}
              onChange={(event) => updateFilter('payEndTime', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>到期开始时间</span>
            <input
              type="datetime-local"
              value={filters.expireStartTime}
              onChange={(event) => updateFilter('expireStartTime', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>到期结束时间</span>
            <input
              type="datetime-local"
              value={filters.expireEndTime}
              onChange={(event) => updateFilter('expireEndTime', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>会员等级</span>
            <select
              multiple
              className="app-multiselect"
              value={filters.userLevelIds}
              onChange={(event) =>
                updateFilter(
                  'userLevelIds',
                  Array.from(event.target.selectedOptions).map((option) => option.value),
                )
              }
            >
              {levelOptions.map((item) => (
                <option key={item.userLevel} value={String(item.userLevel)}>
                  {item.levelName}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>图图号</span>
            <input
              value={filters.tutuNumber}
              onChange={(event) => updateFilter('tutuNumber', event.target.value)}
              placeholder="输入图图号"
            />
          </label>
          <label className="form-field">
            <span>手机号</span>
            <input
              value={filters.mobile}
              onChange={(event) => updateFilter('mobile', event.target.value)}
              placeholder="输入手机号"
            />
          </label>
          <div className="toolbar-actions">
            <button type="button" className="app-button app-button--primary" onClick={handleSearch}>
              搜索
            </button>
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={() => reload().catch(() => {})}
              disabled={loading}
            >
              {loading ? '刷新中...' : '刷新'}
            </button>
          </div>
        </div>
      </section>

      <PageTableCard
        title="会员信息列表"
        totalCount={totalCount}
        columns={columns}
        data={members}
        rowKey={(row) => row.userId || row.tutuNumber}
        loading={loading}
        minWidth={1280}
        pagination={{
          pageNum: query.pageNum,
          pageSize: query.pageSize,
          totalPages,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageChange: setPageNum,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
}
