// src/api/scoreApi.js
import apiClient from "./apiClient";

/**
 * 利用可能な年度一覧を取得
 * GET /api/scores/years
 * @returns Promise<number[]>
 */
export const getAvailableYears = async () => {
  const { data } = await apiClient.get("/api/scores/years");
  // 例: [2022, 2023, 2024]
  return data;
};

/**
 * レーダーチャート用のスコアを取得
 * GET /api/scores/radar?year=YYYY
 * @param {number|string} year
 * @returns Promise<Array<{category:string, score:number}>> など
 */
export const getRadarScoresByYear = async (year) => {
  const { data } = await apiClient.get("/api/scores/radar", {
    params: { year },
  });
  return data;
};
