"use client";
import { useState } from "react";

export default function TestAPIPage() {
  const [message, setMessage] = useState("");

  const callAPI = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ping`);
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Error connecting to API");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>API Test</h1>
      <button
        onClick={callAPI}
        style={{
          padding: "8px 16px",
          marginTop: "10px",
          background: "green",
          color: "white",
        }}
      >
        Call Backend
      </button>
      <p>{message}</p>
    </div>
  );
}
