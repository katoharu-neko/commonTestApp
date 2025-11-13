// src/api/statisticsApi.js
import apiClient from './apiClient';

export const getOfficialStatisticsByYear = async (year) => {
  const { data } = await apiClient.get('/api/statistics/official', {
    params: { year },
  });
  return Array.isArray(data) ? data : [];
};

export const getOfficialStatisticsForYears = async (years) => {
  const uniqueYears = Array.from(
    new Set((years || []).map((year) => (year == null ? null : Number(year))).filter((year) => Number.isFinite(year)))
  );

  if (!uniqueYears.length) {
    return new Map();
  }

  const entries = await Promise.all(
    uniqueYears.map(async (year) => {
      try {
        const stats = await getOfficialStatisticsByYear(year);
        return [String(year), stats];
      } catch (error) {
        console.error('Failed to fetch official statistics for year', year, error);
        return [String(year), []];
      }
    })
  );

  return new Map(entries);
};
