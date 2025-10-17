import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      setMessage("ログイン成功！");
    } catch (error) {
      setMessage("ログイン失敗: " + (error.response?.data?.message || "エラー"));
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>ログイン</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>メールアドレス：</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <label>パスワード：</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button style={{ marginTop: "20px" }} type="submit">
          ログイン
        </button>
      </form>
      <p style={{ color: "red", marginTop: "15px" }}>{message}</p>
    </div>
  );
}

export default Login;
