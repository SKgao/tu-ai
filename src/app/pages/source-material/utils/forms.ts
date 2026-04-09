import { toApiDateTime } from '@/app/lib/dateTime';
import type {
  ImportSourceMaterialFormValues,
  SourceMaterialFormValues,
  SourceMaterialQuery,
  SourceMaterialRecord,
  SourceMaterialSearchValues,
} from '../types';

export const PAGE_SIZE_OPTIONS = [10, 20, 50];
export const IS_PRODUCTION_API = false;

export const EMPTY_MATERIAL_FORM: SourceMaterialFormValues = {
  id: undefined,
  textbookId: undefined,
  text: '',
  icon: '',
  audio: '',
  translation: '',
  explainsArray: '',
};

export const EMPTY_IMPORT_FORM: ImportSourceMaterialFormValues = {
  textbookId: undefined,
  audioArray: [],
  imageArray: [],
  sentensArray: [],
};

export const SEARCH_MODE_OPTIONS = [
  { value: true, label: '模糊搜索' },
  { value: false, label: '精确搜索' },
];

export const IMPORT_FIELD_OPTIONS = [
  { field: 'audioArray', label: '单词音频' },
  { field: 'imageArray', label: '图片素材' },
  { field: 'sentensArray', label: '句子音频' },
] as const;

export const MATERIAL_UPLOAD_OPTIONS = [
  { field: 'icon', label: '上传图片', accept: 'image/*' },
  { field: 'audio', label: '上传音频', accept: 'audio/*' },
] as const;

export function getFileBaseName(fileName: string | null | undefined): string {
  const name = String(fileName || '').trim();
  const index = name.lastIndexOf('.');
  if (index <= 0) {
    return name;
  }
  return name.slice(0, index);
}

export function normalizeMaterialFormValues(
  item?: SourceMaterialRecord | null,
): SourceMaterialFormValues {
  if (!item) {
    return { ...EMPTY_MATERIAL_FORM };
  }

  return {
    id: Number(item.id),
    textbookId: item.textbookId ? String(item.textbookId) : undefined,
    text: String(item.text || ''),
    icon: String(item.icon || ''),
    audio: String(item.audio || ''),
    translation: String(item.translation || ''),
    explainsArray: String(item.explainsArray || ''),
  };
}

export function buildSourceMaterialSearchFilters(
  values: SourceMaterialSearchValues = {},
): Pick<SourceMaterialQuery, 'startTime' | 'endTime' | 'text' | 'openLike'> {
  return {
    startTime: toApiDateTime(values.startTime),
    endTime: toApiDateTime(values.endTime),
    text: values.text?.trim() || '',
    openLike: values.fuzzySearch ? '' : 1,
  };
}
