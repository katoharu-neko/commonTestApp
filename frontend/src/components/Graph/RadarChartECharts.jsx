// frontend/src/components/Graph/RadarChartECharts.jsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

/**
 * props:
 *  - scores: [{subject, score, createdAt?}, ...]  // 1年分に絞った配列を渡す
 *  - fullScoreMap: { japanese?:number, math?:number, ... } // 省略時100
 *  - title?: string
 */
const RadarChartECharts = ({ scores = [], fullScoreMap, title = 'Radar' }) => {
  const elRef = useRef(null);
  const chartRef = useRef(null);

  const full = {
    japanese: 100, math: 100, english: 100, science: 100, social: 100,
    ...fullScoreMap,
  };

  // 表示軸（必要に応じて編集）
  const subjects = ['japanese', 'math', 'english', 'science', 'social'];

  // 同一科目に複数値がある時は最新を採用
  const latestBySubject = {};
  for (const s of scores) {
    const key = s.subject;
    if (!latestBySubject[key]) {
      latestBySubject[key] = s;
    } else {
      const prev = latestBySubject[key];
      const prevTime = prev.createdAt ? new Date(prev.createdAt).getTime() : 0;
      const curTime = s.createdAt ? new Date(s.createdAt).getTime() : 0;
      if (curTime >= prevTime) latestBySubject[key] = s;
    }
  }

  const indicator = subjects.map((subj) => ({
    name: subj,
    max: full[subj] || 100,
  }));

  const values = subjects.map((subj) =>
    latestBySubject[subj] ? latestBySubject[subj].score : 0
  );

  useEffect(() => {
    if (!elRef.current) return;
    if (!chartRef.current) {
      chartRef.current = echarts.init(elRef.current);
      const onResize = () => chartRef.current && chartRef.current.resize();
      window.addEventListener('resize', onResize);
    }

    const option = {
      title: { text: title, left: 'center' },
      tooltip: {},
      radar: {
        indicator,
        splitNumber: 5,
        radius: '65%',
      },
      series: [
        {
          type: 'radar',
          data: [{ value: values, name: 'Scores' }],
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 2 },
          symbolSize: 6,
        },
      ],
    };

    chartRef.current.setOption(option);
  }, [title, JSON.stringify(indicator), JSON.stringify(values)]);

  return <div ref={elRef} style={{ width: '100%', height: 420 }} />;
};

export default RadarChartECharts;
