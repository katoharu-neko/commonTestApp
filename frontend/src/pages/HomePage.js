import React from "react";

function HomePage() {
  const token = localStorage.getItem("token");

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>ログイン成功 🎉</h1>
      <p>JWTトークン:</p>
      <textarea value={token} readOnly rows={4} cols={60}></textarea>
    </div>
  );
}

export default HomePage;
