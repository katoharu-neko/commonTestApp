const SUBJECT_CATEGORY_SEQUENCE = ['外国語', '数学', '国語', '理科', '社会', '情報'];

const SUBJECT_CATEGORY_ORDER = SUBJECT_CATEGORY_SEQUENCE.reduce(function (acc, category, index) {
  acc[category] = index;
  return acc;
}, {});

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

function getSubjectCategoryOrder(subject) {
  const category = subject && subject.category ? subject.category : '';
  return Object.prototype.hasOwnProperty.call(SUBJECT_CATEGORY_ORDER, category)
    ? SUBJECT_CATEGORY_ORDER[category]
    : Number.MAX_SAFE_INTEGER;
}

function sortSubjectNamesByCategory(subjectNames, subjectLookup) {
  if (!Array.isArray(subjectNames)) return [];

  const grouped = new Map();
  subjectNames.forEach(function (name) {
    const subject = subjectLookup.get(name);
    const category = subject && subject.category ? subject.category : '';
    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category).push(name);
  });

  const labelComparator = function (a, b) {
    const subjectA = subjectLookup.get(a);
    const subjectB = subjectLookup.get(b);
    const labelA = subjectA && subjectA.short_name ? subjectA.short_name : (subjectA && subjectA.name) ? subjectA.name : a;
    const labelB = subjectB && subjectB.short_name ? subjectB.short_name : (subjectB && subjectB.name) ? subjectB.name : b;
    return String(labelA).localeCompare(String(labelB), 'ja');
  };

  const ordered = [];
  SUBJECT_CATEGORY_SEQUENCE.forEach(function (category) {
    const items = grouped.get(category);
    if (Array.isArray(items) && items.length) {
      ordered.push.apply(ordered, items.slice().sort(labelComparator));
    }
    grouped.delete(category);
  });

  if (grouped.size) {
    Array.from(grouped.values()).forEach(function (items) {
      ordered.push.apply(ordered, items.slice().sort(labelComparator));
    });
  }

  return ordered;
}

function getSubjectDisplayName(subjectName, subjectLookup) {
  const subject = subjectLookup.get(subjectName);
  if (subject && subject.short_name) return subject.short_name;
  if (subject && subject.name) return subject.name;
  return subjectName;
}

export {
  SUBJECT_CATEGORY_SEQUENCE,
  SUBJECT_CATEGORY_ORDER,
  createSubjectLookup,
  sortSubjectNamesByCategory,
  getSubjectDisplayName,
};
