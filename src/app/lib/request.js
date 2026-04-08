export function compactPayload(payload, options = {}) {
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
  );
}

export function appendQuery(url, payload = {}, options = {}) {
  const query = new URLSearchParams();

  Object.entries(compactPayload(payload, options)).forEach(([key, value]) => {
    query.append(key, value);
  });

  const queryString = query.toString();
  return queryString ? `${url}?${queryString}` : url;
}

export function createUploadFormData(file, fieldName = 'file') {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
}
