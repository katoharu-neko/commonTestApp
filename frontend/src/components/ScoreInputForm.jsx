// src/components/ScoreInputForm.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

/**
 * props:
 * - onScoresChange?: (scores: {subject: string, value: number, max?: number}[]) => void
 * - onSubmitted?: (savedList: any[]) => void
 */
export default function ScoreInputForm({ onScoresChange, onSubmitted }) {
  const [subjects, setSubjects] = useState([]); // [{id, category, name, fullScore, ...}]
  const [rows, setRows] = useState([]);         // [{subjectId, subjectName, score, max}]
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ① 科目マスタ取得
  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get("/api/subjects");
        setSubjects(data || []);
        // 初期行を3つほど用意（必要なら調整）
        const defaults = (data || []).slice(0, 3).map((s) => ({
          subjectId: s.id,
          subjectName: s.name,
          score: "",
          max: s.fullScore ?? 100,
        }));
        setRows(defaults);
      } catch (e) {
        console.error(e);
        setError("科目一覧の取得に失敗しました");
      }
    })();
  }, []);

  // ② rows が変わるたびにレーダーチャートへ反映
  useEffect(() => {
    if (!onScoresChange) return;
    const scores = rows
      .filter((r) => r.subjectName)
      .map((r) => ({
        subject: r.subjectName,
        value: r.score === "" ? 0 : Number(r.score),
        max: r.max ?? 100,
      }));
    onScoresChange(scores);
  }, [rows, onScoresChange]);

  // イベントハンドラ
  const changeSubject = (idx, subjectId) => {
    const s = subjects.find((x) => String(x.id) === String(subjectId));
    setRows((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        subjectId,
        subjectName: s?.name ?? "",
        max: s?.fullScore ?? 100,
      };
      return next;
    });
  };

  const changeScore = (idx, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], score: value };
      return next;
    });
  };

  const addRow = () =>
    setRows((prev) => [...prev, { subjectId: "", subjectName: "", score: "", max: 100 }]);

  const removeRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));

  // ③ 保存（バックエンドにPOST）
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const saved = [];
      for (const r of rows) {
        if (!r.subjectName || r.score === "") continue;
        const payload = {
          subject: r.subjectName,
          score: Number(r.score),
          year: new Date().getFullYear(),
          // userId はサーバ側で JWT から解決して保存する前提
        };
        const { data } = await apiClient.post("/api/scores", payload);
        saved.push(data);
      }
      onSubmitted && onSubmitted(saved);
      alert("保存しました");
    } catch (err) {
      console.error(err);
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {rows.map((row, idx) => (
        <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={row.subjectId ?? ""}
            onChange={(e) => changeSubject(idx, e.target.value)}
          >
            <option value="">科目を選択</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            max={row.max ?? 100}
            placeholder="得点"
            value={row.score}
            onChange={(e) => changeScore(idx, e.target.value)}
            style={{ width: 120 }}
          />
          <span style={{ color: "#666" }}>/ {row.max ?? 100}</span>

          <button type="button" onClick={() => removeRow(idx)}>
            削除
          </button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={addRow}>行を追加</button>
        <button type="submit" disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </form>
  );
}
