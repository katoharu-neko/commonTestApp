function normalizeKey(value) {
  if (value === null || value === undefined) return null;
  return String(value);
}

function createSubjectLookup(subjects) {
  const map = new Map();
  if (!Array.isArray(subjects)) return map;
  subjects.forEach(function (subject) {
    if (!subject) return;
    const idKey = normalizeKey(subject.id);
    if (idKey !== null) {
      map.set(idKey, subject);
    }
    if (subject.name) {
      map.set(subject.name, subject);
    }
    if (subject.short_name) {
      const shortKey = normalizeKey(subject.short_name);
      if (shortKey !== null && !map.has(shortKey)) {
        map.set(shortKey, subject);
      }
    }
  });
  return map;
}

function sortSubjectNamesByCategory(subjectNames, subjectLookup) {
  if (!Array.isArray(subjectNames)) return [];

  const withSortKey = subjectNames.map(function (key) {
    const normalized = normalizeKey(key);
    const subject = normalized !== null
      ? subjectLookup.get(normalized)
      : undefined;
    const fallbackSubject = (!subject && typeof key === 'string')
      ? subjectLookup.get(key)
      : undefined;
    const resolved = subject || fallbackSubject;
    const id = resolved && typeof resolved.id === 'number'
      ? resolved.id
      : Number.POSITIVE_INFINITY;
    return { key, id, subject: resolved };
  });

  const localeComparator = function (a, b) {
    const labelA = a.subject && a.subject.short_name
      ? a.subject.short_name
      : a.subject && a.subject.name
        ? a.subject.name
        : a.key;
    const labelB = b.subject && b.subject.short_name
      ? b.subject.short_name
      : b.subject && b.subject.name
        ? b.subject.name
        : b.key;
    return String(labelA).localeCompare(String(labelB), 'ja');
  };

  withSortKey.sort(function (a, b) {
    if (Number.isFinite(a.id) && Number.isFinite(b.id)) {
      if (a.id !== b.id) return a.id - b.id;
      return localeComparator(a, b);
    }
    if (Number.isFinite(a.id)) return -1;
    if (Number.isFinite(b.id)) return 1;
    return localeComparator(a, b);
  });

  return withSortKey.map(function (item) { return item.key; });
}

function getSubjectDisplayName(subjectKey, subjectLookup) {
  const normalized = normalizeKey(subjectKey);
  let subject = normalized !== null ? subjectLookup.get(normalized) : undefined;
  if (!subject && typeof subjectKey === 'string') {
    subject = subjectLookup.get(subjectKey);
  }
  if (subject && subject.short_name) return subject.short_name;
  if (subject && subject.name) return subject.name;
  if (typeof subjectKey === 'string') return subjectKey;
  return '';
}

export {
  createSubjectLookup,
  sortSubjectNamesByCategory,
  getSubjectDisplayName,
};
