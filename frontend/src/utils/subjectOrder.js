function createSubjectLookup(subjects) {
  const map = new Map();
  if (!Array.isArray(subjects)) return map;
  subjects.forEach(function (subject) {
    if (!subject) return;
    if (subject.name) {
      map.set(subject.name, subject);
    }
    if (subject.short_name && !map.has(subject.short_name)) {
      map.set(subject.short_name, subject);
    }
  });
  return map;
}

function sortSubjectNamesByCategory(subjectNames, subjectLookup) {
  if (!Array.isArray(subjectNames)) return [];

  const withSortKey = subjectNames.map(function (name) {
    const subject = subjectLookup.get(name);
    const id = subject && typeof subject.id === 'number' ? subject.id : Number.POSITIVE_INFINITY;
    return { name, id, subject };
  });

  const localeComparator = function (a, b) {
    const labelA = a.subject && a.subject.short_name
      ? a.subject.short_name
      : a.subject && a.subject.name
        ? a.subject.name
        : a.name;
    const labelB = b.subject && b.subject.short_name
      ? b.subject.short_name
      : b.subject && b.subject.name
        ? b.subject.name
        : b.name;
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

  return withSortKey.map(function (item) { return item.name; });
}

function getSubjectDisplayName(subjectName, subjectLookup) {
  const subject = subjectLookup.get(subjectName);
  if (subject && subject.short_name) return subject.short_name;
  if (subject && subject.name) return subject.name;
  return subjectName;
}

export {
  createSubjectLookup,
  sortSubjectNamesByCategory,
  getSubjectDisplayName,
};
