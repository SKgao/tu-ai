import { useState } from 'react';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { getErrorMessage } from '@/app/lib/errors';
import { listGrades, listVersions } from '@/app/services/material/books';
import type { GradeRecord, VersionRecord } from '../types';

export type UseBookGradeVersionDataOptions = {
  /** 首次加载失败时的提示出口（通常是页面的 antd `message.error`）。 */
  onError?: (message: string) => void;
};

export type UseBookGradeVersionDataResult = {
  grades: GradeRecord[];
  versions: VersionRecord[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  reloadGrades: () => Promise<void>;
  reloadVersions: () => Promise<void>;
  reloadAll: () => Promise<void>;
};

/**
 * 「教材 / 年级 / 教材版本」页里两个基础资源列表（年级、教材版本）的状态与加载逻辑。
 *
 * 只负责取数、存数、维护列表 loading 开关，不碰弹窗、表单和提示文案以外的 UI。
 * 注意：`reload*` 系列**不会**自己开/关 `loading`，因为调用方场景不同：
 * - 挂载与「刷新」按钮需要整段转圈（由本 hook 的挂载逻辑 / 页面调用 `setLoading` 控制）；
 * - 弹窗提交、删除后的静默刷新不需要转圈（保持原有行为）；
 * - `reload*` 失败会向上抛出，由调用方决定提示文案（保持原有行为）。
 */
export function useBookGradeVersionData({
  onError,
}: UseBookGradeVersionDataOptions = {}): UseBookGradeVersionDataResult {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  async function reloadGrades(): Promise<void> {
    const data = await listGrades();
    setGrades(Array.isArray(data) ? (data as GradeRecord[]) : []);
  }

  async function reloadVersions(): Promise<void> {
    const data = await listVersions();
    setVersions(Array.isArray(data) ? (data as VersionRecord[]) : []);
  }

  async function reloadAll(): Promise<void> {
    // 与原来的 Promise.all([loadGradesData(), loadVersionsData()]) 等价：
    // 任一失败都会让整体 reject，但另一路请求仍然会跑完。
    await Promise.all([reloadGrades(), reloadVersions()]);
  }

  useMountEffect(async () => {
    setLoading(true);
    try {
      await reloadAll();
    } catch (loadError) {
      onError?.(getErrorMessage(loadError, '基础资源加载失败'));
    } finally {
      setLoading(false);
    }
  });

  return {
    grades,
    versions,
    loading,
    setLoading,
    reloadGrades,
    reloadVersions,
    reloadAll,
  };
}
