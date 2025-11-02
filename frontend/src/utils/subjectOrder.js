function createSubjectLookup(subjects) {
  const map = new Map();
  if (!Array.isArray(subjects)) return map;
  subjects.forEach(function (subject) {
    if (!subject) return;
    if (typeof subject.id === 'number') {
      map.set(subject.id, subject);
      map.set(String(subject.id), subject);
    }
    if (subject.name && !map.has(subject.name)) {
      map.set(subject.name, subject);
    }
    if (subject.short_name && !map.has(subject.short_name)) {
      map.set(subject.short_name, subject);
    }
  });
  return map;
}

function sortSubjectIdsByCategory(subjectIds, subjectLookup) {
  if (!Array.isArray(subjectIds)) return [];

  const collator = new Intl.Collator('ja');

  const withSortKey = subjectIds.map(function (id) {
    const subject = subjectLookup.get(id);
    const numericId = typeof id === 'number' ? id : Number(id);
    const sortKey = subject && typeof subject.id === 'number'
      ? subject.id
      : Number.isFinite(numericId)
        ? numericId
        : Number.POSITIVE_INFINITY;
    const label = subject && subject.short_name
      ? subject.short_name
      : subject && subject.name
        ? subject.name
        : String(id);
    return { id, sortKey, label };
  });

  withSortKey.sort(function (a, b) {
    if (Number.isFinite(a.sortKey) && Number.isFinite(b.sortKey)) {
      if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
      return collator.compare(a.label, b.label);
    }
    if (Number.isFinite(a.sortKey)) return -1;
    if (Number.isFinite(b.sortKey)) return 1;
    return collator.compare(a.label, b.label);
  });

  return withSortKey.map(function (item) { return item.id; });
}

function getSubjectDisplayName(subjectKey, subjectLookup) {
  const subject = subjectLookup.get(subjectKey);
  if (subject && subject.short_name) return subject.short_name;
  if (subject && subject.name) return subject.name;
  return String(subjectKey ?? '');
}

export {
  createSubjectLookup,
  sortSubjectIdsByCategory,
  getSubjectDisplayName,
};
