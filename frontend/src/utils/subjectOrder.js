function normalizeKey(value) {
  if (value === null || value === undefined) return null;
  return String(value);
}

function resolveSubjectShortName(subject) {
  if (!subject) return null;
  if (subject.shortName && typeof subject.shortName === 'string') {
    return subject.shortName;
  }
  if (subject.short_name && typeof subject.short_name === 'string') {
    return subject.short_name;
  }
  return null;
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
    const shortName = resolveSubjectShortName(subject);
    if (shortName) {
      const shortKey = normalizeKey(shortName);
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
    let id = Number.POSITIVE_INFINITY;
    if (resolved && typeof resolved.id === 'number') {
      id = resolved.id;
    } else if (normalized !== null) {
      const numericId = Number(normalized);
      if (Number.isFinite(numericId)) {
        id = numericId;
      }
    }
    return { key, id, subject: resolved };
  });

  const localeComparator = function (a, b) {
    const labelA = a.subject
      ? (resolveSubjectShortName(a.subject) || a.subject.name || a.key)
      : a.key;
    const labelB = b.subject
      ? (resolveSubjectShortName(b.subject) || b.subject.name || b.key)
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
  const shortName = resolveSubjectShortName(subject);
  if (shortName) return shortName;
  if (subject && subject.name) return subject.name;
  if (typeof subjectKey === 'string') return subjectKey;
  return '';
}

export {
  createSubjectLookup,
  sortSubjectNamesByCategory,
  getSubjectDisplayName,
};
