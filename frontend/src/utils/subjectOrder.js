const SUBJECT_CATEGORY_ORDER = {
  '外国語': 0,
  '数学': 1,
  '国語': 2,
  '理科': 3,
  '社会': 4,
  '情報': 5,
};

function createSubjectLookup(subjects) {
  const map = new Map();
  if (!Array.isArray(subjects)) return map;
  subjects.forEach(function (subject) {
    if (subject && subject.name) {
      map.set(subject.name, subject);
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
  return subjectNames.slice().sort(function (a, b) {
    const subjectA = subjectLookup.get(a);
    const subjectB = subjectLookup.get(b);

    const orderA = getSubjectCategoryOrder(subjectA);
    const orderB = getSubjectCategoryOrder(subjectB);
    if (orderA !== orderB) return orderA - orderB;

    const labelA = subjectA && subjectA.short_name ? subjectA.short_name : (subjectA && subjectA.name) ? subjectA.name : a;
    const labelB = subjectB && subjectB.short_name ? subjectB.short_name : (subjectB && subjectB.name) ? subjectB.name : b;
    return String(labelA).localeCompare(String(labelB), 'ja');
  });
}

function getSubjectDisplayName(subjectName, subjectLookup) {
  const subject = subjectLookup.get(subjectName);
  if (subject && subject.short_name) return subject.short_name;
  if (subject && subject.name) return subject.name;
  return subjectName;
}

export {
  SUBJECT_CATEGORY_ORDER,
  createSubjectLookup,
  sortSubjectNamesByCategory,
  getSubjectDisplayName,
};
