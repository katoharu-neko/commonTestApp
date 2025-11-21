// src/components/dashboard/OverallDeviationTrend.jsx
import React, { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../../api/apiClient';

const formatDeviationValue = (value) => {
  if (!Number.isFinite(value)) return '-';
  const rounded = Math.round(value * 10) / 10;
  const formatOptions = Number.isInteger(rounded)
    ? { maximumFractionDigits: 0 }
    : { minimumFractionDigits: 1, maximumFractionDigits: 1 };
  return new Intl.NumberFormat('ja-JP', formatOptions).format(rounded);
};

const formatAttemptLabel = (attemptNumber) => `${attemptNumber}回目`;

const buildYearlyDeviationSeries = (scores) => {
  if (!Array.isArray(scores) || !scores.length) return [];

  const yearMap = new Map();

  scores.forEach((row) => {
    const yearValue = Number(row?.year);
    if (!Number.isFinite(yearValue)) return;
    const attemptRaw = Number(row?.attemptNumber ?? 1);
    const attemptNumber = Number.isFinite(attemptRaw) && attemptRaw > 0
      ? Math.trunc(attemptRaw)
      : 1;

    const yearKey = String(yearValue);
    if (!yearMap.has(yearKey)) {
      yearMap.set(yearKey, new Map());
    }
    const attemptMap = yearMap.get(yearKey);
    if (!attemptMap.has(attemptNumber)) {
      attemptMap.set(attemptNumber, new Map());
    }

    const subjectMap = attemptMap.get(attemptNumber);
    let subjectKey = null;
    if (row?.subjectId !== undefined && row?.subjectId !== null) {
      subjectKey = `id:${row.subjectId}`;
    } else if (row?.subjectName) {
      subjectKey = `name:${row.subjectName}`;
    } else if (row?.subject) {
      subjectKey = `sub:${row.subject}`;
    }

    if (subjectKey) {
      subjectMap.set(subjectKey, row);
    }
  });

  const summaries = [];

  yearMap.forEach((attemptMap, yearKey) => {
    attemptMap.forEach((subjectMap, attemptNumber) => {
      if (!subjectMap.size) return;

      const deviationValues = [];
      subjectMap.forEach((row) => {
        const deviationRaw = Number(row && row.deviationValue !== undefined ? row.deviationValue : null);
        if (Number.isFinite(deviationRaw)) {
          deviationValues.push(deviationRaw);
        }
      });

      const totalDeviation = deviationValues.length
        ? Math.round((deviationValues.reduce((sum, value) => sum + value, 0) / deviationValues.length) * 10) / 10
        : null;

      summaries.push({
        year: Number(yearKey),
        attempt: attemptNumber,
        totalDeviation,
      });
    });
  });

  return summaries.sort((a, b) => {
    if (a.year === b.year) {
      return a.attempt - b.attempt;
    }
    return a.year - b.year;
  });
};

const OverallDeviationTrend = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchScores = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/api/scores/me');
        if (!mounted) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        setScores(rows);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError('テスト結果を読み込めませんでした。時間をおいて再度お試しください。');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchScores();

    return () => {
      mounted = false;
    };
  }, []);

  const seriesData = useMemo(() => buildYearlyDeviationSeries(scores), [scores]);

  const chartOption = useMemo(() => {
    const categories = seriesData.map((item) => `${item.year}年度${formatAttemptLabel(item.attempt)}`);
    const values = seriesData.map((item) => (Number.isFinite(item.totalDeviation) ? item.totalDeviation : null));
    const validValues = values.filter((value) => Number.isFinite(value));
    const minDeviation = validValues.length ? Math.min.apply(null, validValues) : 0;
    const yMin = Math.max(0, Math.floor(minDeviation) - 5);

    return {
      grid: { left: 48, right: 16, top: 48, bottom: 70 },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          if (!params || !params.length) return '';
          const first = params[0];
          const index = first.dataIndex;
          const target = seriesData[index];
          if (!target) return '';
          const deviationLabel = Number.isFinite(first.data)
            ? formatDeviationValue(first.data)
            : '-';
          return `${target.year}年度 ${formatAttemptLabel(target.attempt)}<br />総合偏差値 ${deviationLabel}`;
        },
      },
      xAxis: {
        type: 'category',
        data: categories,
        name: '演習年度',
        nameLocation: 'end',
        nameGap: 30,
        axisLabel: {
          rotate: -35,
        },
      },
      yAxis: {
        type: 'value',
        name: '偏差値',
        min: yMin,
        splitLine: { lineStyle: { color: '#e5e7eb' } },
      },
      series: [
        {
          name: '総合偏差値',
          type: 'line',
          data: values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: '#2563eb', width: 3 },
          itemStyle: { color: '#2563eb' },
          areaStyle: { color: 'rgba(37,99,235,0.12)' },
        },
      ],
      color: ['#2563eb'],
    };
  }, [seriesData]);

  if (loading) {
    return (
      <div className="card dashboard-card recent-scores-card">
        <div className="recent-scores-card__header">
          <span className="recent-scores-card__label">総合レポート</span>
          <h2 className="recent-scores-card__title">読み込み中です...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card dashboard-card recent-scores-card">
        <div className="recent-scores-card__header">
          <span className="recent-scores-card__label">総合レポート</span>
          <h2 className="recent-scores-card__title">エラーが発生しました</h2>
        </div>
        <p className="dashboard-card__message dashboard-card__message--error">{error}</p>
      </div>
    );
  }

  if (!seriesData.length) {
    return (
      <div className="card dashboard-card recent-scores-card">
        <div className="recent-scores-card__header">
          <span className="recent-scores-card__label">総合レポート</span>
          <h2 className="recent-scores-card__title">表示できるデータがありません</h2>
        </div>
        <p className="dashboard-card__message">表示できるテスト結果がまだありません。</p>
      </div>
    );
  }

  return (
    <div className="card dashboard-card recent-scores-card recent-scores-card--chart deviation-trend-card">
      <div className="recent-scores-card__header">
        <h2 className="recent-scores-card__title">総合偏差値の推移</h2>
      </div>
      <ReactECharts option={chartOption} style={{ width: '100%', height: 360 }} notMerge />
    </div>
  );
};

export default OverallDeviationTrend;
