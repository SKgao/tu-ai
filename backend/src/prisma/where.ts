type WhereFragment = Record<string, unknown> | undefined | null | false;

export function composeWhere<T extends object>(...fragments: WhereFragment[]): T {
  return Object.assign({}, ...fragments.filter(Boolean)) as T;
}

export function eq<TKey extends string, TValue>(
  field: TKey,
  value: TValue | undefined,
): Partial<Record<TKey, TValue>> | undefined {
  if (value === undefined) {
    return undefined;
  }

  return { [field]: value } as Partial<Record<TKey, TValue>>;
}

export function contains<TKey extends string>(
  field: TKey,
  value: string | null | undefined,
): Partial<Record<TKey, { contains: string }>> | undefined {
  if (!value) {
    return undefined;
  }

  return {
    [field]: {
      contains: value,
    },
  } as Partial<Record<TKey, { contains: string }>>;
}

export function inArray<TKey extends string, TValue>(
  field: TKey,
  values: TValue[] | undefined | null,
): Partial<Record<TKey, { in: TValue[] }>> | undefined {
  if (!values?.length) {
    return undefined;
  }

  return {
    [field]: {
      in: values,
    },
  } as Partial<Record<TKey, { in: TValue[] }>>;
}

export function dateRange<TKey extends string>(
  field: TKey,
  startTime: Date | null | undefined,
  endTime: Date | null | undefined,
): Partial<Record<TKey, { gte?: Date; lte?: Date }>> | undefined {
  if (!startTime && !endTime) {
    return undefined;
  }

  return {
    [field]: {
      ...(startTime ? { gte: startTime } : {}),
      ...(endTime ? { lte: endTime } : {}),
    },
  } as Partial<Record<TKey, { gte?: Date; lte?: Date }>>;
}

export function nested<TKey extends string, TValue extends object>(
  field: TKey,
  value: TValue | undefined | null,
): Partial<Record<TKey, TValue>> | undefined {
  if (!value || !Object.keys(value).length) {
    return undefined;
  }

  return { [field]: value } as Partial<Record<TKey, TValue>>;
}
