export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>DeedSense UI</h1>
      <p style={{ marginTop: 8 }}>UI is running ✅</p>
      <p style={{ marginTop: 8 }}>
        Backend Health:{" "}
        <a href="https://deedsense-api.onrender.com/health" target="_blank">
          /health
        </a>
      </p>
    </div>
  );
}
