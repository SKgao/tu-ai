type Primitive = string | number | boolean;
type PayloadValue = Primitive | Primitive[] | null | undefined;

export type RequestPayload = Record<string, PayloadValue>;
export type RequestOptions = Record<string, unknown>;

type CompactPayloadOptions = {
  keepEmptyArrays?: boolean;
};

export function compactPayload<T extends RequestPayload>(
  payload: T | null | undefined,
  options: CompactPayloadOptions = {},
): Partial<T> {
  const { keepEmptyArrays = false } = options;

  return Object.fromEntries(
    Object.entries(payload || {}).filter(([, value]) => {
      if (value === '' || value === null || value === undefined) {
        return false;
      }

      if (!keepEmptyArrays && Array.isArray(value) && value.length === 0) {
        return false;
      }

      return true;
    }),
  ) as Partial<T>;
}

export function appendQuery(url: string, payload: RequestPayload = {}, options: CompactPayloadOptions = {}): string {
  const query = new URLSearchParams();

  Object.entries(compactPayload(payload, options)).forEach(([key, value]) => {
    query.append(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `${url}?${queryString}` : url;
}

export function createUploadFormData(file: Blob, fieldName = 'file'): FormData {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
}
