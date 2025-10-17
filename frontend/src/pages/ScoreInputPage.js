import React, { useState } from "react";
import axios from "axios";

function ScoreInputPage() {
  const [subject, setSubject] = useState("");
  const [score, setScore] = useState("");
  const [year, setYear] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8080/api/scores",
        { subject, score, year },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("登録成功！ 🎉");
    } catch (err) {
      setMessage("エラーが発生しました。");
    }
  };

  return (
    <div style={{ width: "300px", margin: "100px auto" }}>
      <h2>スコア登録</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="教科"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        /><br/>
        <input
          type="number"
          placeholder="点数"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          required
        /><br/>
        <input
          type="number"
          placeholder="年度"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        /><br/>
        <button type="submit">登録</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ScoreInputPage;
