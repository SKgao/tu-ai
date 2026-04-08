export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const EMPTY_PASS_FORM = {
  id: undefined,
  textbookId: undefined,
  title: '',
  tmpTitle: '',
  icon: '',
  sort: undefined,
};

export const EMPTY_TOPIC_FORM = {
  customsPassId: undefined,
  sourceIds: '',
  sort: undefined,
  showIndex: '',
  icon: '',
  audio: '',
  sceneGraph: '',
  sentenceAudio: '',
  subject: undefined,
};

export const TOPIC_UPLOAD_OPTIONS = [
  { field: 'icon', label: '题目图片', accept: 'image/*' },
  { field: 'audio', label: '题目音频', accept: 'audio/*' },
  { field: 'sentenceAudio', label: '句子音频', accept: 'audio/*' },
  { field: 'sceneGraph', label: '场景图片', accept: 'image/*' },
];

export function normalizePassFormValues(pass, textbookId) {
  if (!pass) {
    return {
      ...EMPTY_PASS_FORM,
      textbookId: textbookId ? Number(textbookId) : undefined,
    };
  }

  return {
    id: Number(pass.id),
    textbookId: textbookId ? Number(textbookId) : undefined,
    title: pass.title || '',
    tmpTitle: pass.tmpTitle || '',
    icon: pass.icon || '',
    sort: pass.sort !== undefined && pass.sort !== null ? Number(pass.sort) : undefined,
  };
}
