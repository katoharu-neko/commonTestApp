// src/components/dashboard/RecentScoresRadar.jsx
import React, { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../../api/apiClient';

const MAX_PERCENT = 100;

const RecentScoresRadar = () => {
  const [scores, setScores] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
<<<<<<< ours
  const [activeKey, setActiveKey] = useState('');
=======
>>>>>>> theirs

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [scoresRes, subjectsRes] = await Promise.all([
          api.get('/api/scores/me'),
          api.get('/api/subjects'),
        ]);

        if (!mounted) return;

        const scoresData = Array.isArray(scoresRes.data) ? scoresRes.data : [];
        const subjectsData = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];

        setScores(scoresData);
        setSubjects(subjectsData);

<<<<<<< ours
        const uniqueYears = Array.from(new Set(scoresData.map((item) => item.year)))
          .filter((year) => typeof year === 'number' || typeof year === 'string')
          .map((year) => Number(year))
          .filter((year) => !Number.isNaN(year))
          .sort((a, b) => b - a);

        if (uniqueYears.length > 0) {
          setActiveKey(String(uniqueYears[0]));
        } else {
          setActiveKey('');
        }
=======
>>>>>>> theirs
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

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const fullScoreMap = useMemo(() => {
    const map = new Map();
    subjects.forEach((subject) => {
      if (subject?.name) {
        map.set(subject.name, subject.fullScore || MAX_PERCENT);
      }
    });
    return map;
  }, [subjects]);

  const groupedByYear = useMemo(() => {
    const map = new Map();
    scores.forEach((item) => {
      const year = Number(item?.year);
      if (!year || Number.isNaN(year)) return;
      if (!map.has(year)) map.set(year, []);
      map.get(year).push(item);
    });

    return map;
  }, [scores]);

  const sortedYears = useMemo(() => {
    return Array.from(groupedByYear.keys()).sort((a, b) => b - a);
  }, [groupedByYear]);

  const yearOptions = useMemo(() => {
    if (!sortedYears.length) return [];

    const recent = sortedYears.slice(0, 3).map((year) => ({
      key: String(year),
      label: String(year),
      years: [year],
    }));

    const olderYears = sortedYears.slice(3);
    if (olderYears.length) {
      recent.push({
        key: 'others',
        label: 'それ以前',
        years: olderYears,
      });
    }

    return recent;
  }, [sortedYears]);

<<<<<<< ours
  useEffect(() => {
    if (yearOptions.length === 0) {
      setActiveKey('');
      return;
    }

    const hasCurrent = yearOptions.some((option) => option.key === activeKey);
    if (!hasCurrent) {
      setActiveKey(yearOptions[0].key);
    }
  }, [yearOptions, activeKey]);

  const selectedOption = yearOptions.find((option) => option.key === activeKey);

  const chartData = useMemo(() => {
    if (!selectedOption) return { indicator: [], values: [] };

    const dataRows = selectedOption.years
      .flatMap((year) => groupedByYear.get(year) ?? [])
      .sort((a, b) => {
        if (a.year !== b.year) return Number(a.year) - Number(b.year);
        return String(a.subject).localeCompare(String(b.subject));
      });

    if (!dataRows.length) return { indicator: [], values: [] };

    const subjectsSet = new Set();
    dataRows.forEach((row) => {
      if (row?.subject) subjectsSet.add(row.subject);
    });

    const subjectList = Array.from(subjectsSet).sort((a, b) => a.localeCompare(b, 'ja'));

    const values = subjectList.map((subjectName) => {
      const rows = dataRows.filter((row) => row.subject === subjectName);
      if (!rows.length) return 0;

      const fullScore = fullScoreMap.get(subjectName) || MAX_PERCENT;

      const avg =
        rows.reduce((sum, row) => sum + Number(row.score || 0), 0) / rows.length;
      const percent = fullScore > 0 ? (avg / fullScore) * 100 : 0;
      const capped = Math.min(Math.max(percent, 0), MAX_PERCENT);
      return Math.round(capped * 10) / 10;
    });

    const indicator = subjectList.map((name) => ({ name, max: MAX_PERCENT }));

    return { indicator, values };
  }, [selectedOption, groupedByYear, fullScoreMap]);

  const chartOption = useMemo(() => {
    return {
      tooltip: {},
      radar: {
        indicator: chartData.indicator,
        name: {
          color: '#0f172a',
          fontSize: 13,
        },
        splitLine: {
          lineStyle: { color: ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6'] },
        },
        splitArea: {
          areaStyle: { color: ['rgba(59,130,246,0.08)', 'rgba(59,130,246,0.02)'] },
        },
        axisLine: {
          lineStyle: { color: 'rgba(59,130,246,0.45)' },
        },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: chartData.values,
              name: selectedOption?.key === 'others' ? '平均（それ以前）' : `${selectedOption?.label} 平均`,
              areaStyle: { color: 'rgba(59,130,246,0.25)' },
              lineStyle: { color: '#2563eb', width: 2 },
              itemStyle: { color: '#2563eb' },
            },
          ],
          symbol: 'circle',
          symbolSize: 5,
        },
      ],
    };
  }, [chartData, selectedOption]);

  return (
    <div className="card dashboard-card">
      <div className="dashboard-card__header">
        <h2 className="section-title">直近のテスト結果</h2>
        {yearOptions.length > 0 && (
          <div className="dashboard-card__tabs">
            {yearOptions.map((option) => {
              const isActive = option.key === activeKey;
              return (
                <button
                  key={option.key}
                  type="button"
                  className={`dashboard-tab${isActive ? ' dashboard-tab--active' : ''}`}
                  onClick={() => setActiveKey(option.key)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <p className="dashboard-card__message">読み込み中です...</p>
      ) : error ? (
        <p className="dashboard-card__message dashboard-card__message--error">{error}</p>
      ) : chartData.indicator.length === 0 ? (
        <p className="dashboard-card__message">表示できるテスト結果がまだありません。</p>
      ) : (
        <ReactECharts option={chartOption} style={{ width: '100%', minHeight: 360 }} />
      )}
    </div>
  );
=======
  const cardConfigs = useMemo(() => {
    const configs = [];

    yearOptions.forEach((option) => {
      const dataRows = option.years
        .flatMap((year) => groupedByYear.get(year) ?? [])
        .sort((a, b) => {
          if (a.year !== b.year) return Number(a.year) - Number(b.year);
          return String(a.subject).localeCompare(String(b.subject));
        });

      if (!dataRows.length) return;

      const subjectsSet = new Set();
      dataRows.forEach((row) => {
        if (row?.subject) subjectsSet.add(row.subject);
      });

      const subjectList = Array.from(subjectsSet).sort((a, b) => a.localeCompare(b, 'ja'));

      if (!subjectList.length) return;

      const values = subjectList.map((subjectName) => {
        const rows = dataRows.filter((row) => row.subject === subjectName);
        if (!rows.length) return 0;

        const fullScore = fullScoreMap.get(subjectName) || MAX_PERCENT;

        const avg =
          rows.reduce((sum, row) => sum + Number(row.score || 0), 0) / rows.length;
        const percent = fullScore > 0 ? (avg / fullScore) * 100 : 0;
        const capped = Math.min(Math.max(percent, 0), MAX_PERCENT);
        return Math.round(capped * 10) / 10;
      });

      const indicator = subjectList.map((name) => ({ name, max: MAX_PERCENT }));

      const chartOption = {
        tooltip: {},
        radar: {
          indicator,
          name: {
            color: '#0f172a',
            fontSize: 13,
          },
          splitLine: {
            lineStyle: { color: ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6'] },
          },
          splitArea: {
            areaStyle: { color: ['rgba(59,130,246,0.08)', 'rgba(59,130,246,0.02)'] },
          },
          axisLine: {
            lineStyle: { color: 'rgba(59,130,246,0.45)' },
          },
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: values,
                name:
                  option.key === 'others' ? '平均（それ以前）' : `${option.label} 平均`,
                areaStyle: { color: 'rgba(59,130,246,0.25)' },
                lineStyle: { color: '#2563eb', width: 2 },
                itemStyle: { color: '#2563eb' },
              },
            ],
            symbol: 'circle',
            symbolSize: 5,
          },
        ],
      };

      configs.push({
        key: option.key,
        label: option.label,
        chartOption,
      });
    });

    return configs;
  }, [yearOptions, groupedByYear, fullScoreMap]);

  if (loading) {
    return [
      <div key="loading" className="card dashboard-card recent-scores-card">
        <div className="recent-scores-card__header">
          <span className="recent-scores-card__label">直近のテスト結果</span>
          <h2 className="recent-scores-card__title">読み込み中です...</h2>
        </div>
      </div>,
    ];
  }

  if (error) {
    return [
      <div key="error" className="card dashboard-card recent-scores-card">
        <div className="recent-scores-card__header">
          <span className="recent-scores-card__label">直近のテスト結果</span>
          <h2 className="recent-scores-card__title">エラーが発生しました</h2>
        </div>
        <p className="dashboard-card__message dashboard-card__message--error">{error}</p>
      </div>,
    ];
  }

  if (!cardConfigs.length) {
    return [
      <div key="empty" className="card dashboard-card recent-scores-card">
        <div className="recent-scores-card__header">
          <span className="recent-scores-card__label">直近のテスト結果</span>
          <h2 className="recent-scores-card__title">表示できるデータがありません</h2>
        </div>
        <p className="dashboard-card__message">表示できるテスト結果がまだありません。</p>
      </div>,
    ];
  }

  return cardConfigs.map((config) => {
    return (
      <div key={config.key} className="card dashboard-card recent-scores-card recent-scores-card--chart">
        <div className="recent-scores-card__header">
          <span className="recent-scores-card__label">直近のテスト結果</span>
          <h2 className="recent-scores-card__title">
            {config.label === 'それ以前' ? config.label : `${config.label}年`}
          </h2>
        </div>
        <ReactECharts option={config.chartOption} style={{ width: '100%', height: 320 }} />
      </div>
    );
  });
>>>>>>> theirs
};

export default RecentScoresRadar;
