// src/utils/statistics.js

export const createAveragePercentLookup = (statsByYear) => {
  const lookup = new Map();

  if (!statsByYear || !statsByYear.forEach) {
    return lookup;
  }

  statsByYear.forEach((rows, yearKey) => {
    const subjectMap = new Map();
    if (Array.isArray(rows)) {
      rows.forEach((row) => {
        if (!row) return;
        const fullScore = Number(row.fullScore);
        const averageScore = Number(row.averageScore);
        if (!Number.isFinite(fullScore) || fullScore <= 0) return;
        if (!Number.isFinite(averageScore)) return;
        const percent = Math.min(Math.max((averageScore / fullScore) * 100, 0), 100);
        const rounded = Math.round(percent * 10) / 10;
        if (row.subjectId !== undefined && row.subjectId !== null) {
          subjectMap.set(String(row.subjectId), rounded);
        }
        if (row.officialName) {
          subjectMap.set(row.officialName, rounded);
        }
      });
    }
    lookup.set(String(yearKey), subjectMap);
  });

  return lookup;
};
