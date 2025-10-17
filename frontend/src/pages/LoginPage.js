import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      navigate("/home");
    } catch (err) {
      setError("ログインに失敗しました。メールまたはパスワードを確認してください。");
    }
  };

  return (
    <div style={{ width: "300px", margin: "100px auto" }}>
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
}

export default LoginPage;
