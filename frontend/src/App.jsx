import { useState } from "react";
import axios from "axios";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
         XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6","#ec4899"];

function ChartWidget({ result }) {
  const { chart_type, title, data, x_axis, y_axis } = result;
  if (!data || data.length === 0) return <p style={{color:"#888"}}>No data found.</p>;

  return (
    <div style={{ background: "#1e1e2e", borderRadius: 12, padding: 20, margin: "16px 0" }}>
      <h3 style={{ color: "#cdd6f4", marginBottom: 16 }}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {chart_type === "line" ? (
          <LineChart data={data}>
            <XAxis dataKey={x_axis} stroke="#888" tick={{fontSize:11}}/>
            <YAxis stroke="#888" tick={{fontSize:11}}/>
            <Tooltip contentStyle={{background:"#313244",border:"none",color:"#cdd6f4"}}/>
            <Legend/>
            <Line type="monotone" dataKey={y_axis} stroke="#6366f1" dot={false} strokeWidth={2}/>
          </LineChart>
        ) : chart_type === "pie" ? (
          <PieChart>
            <Pie data={data} dataKey={y_axis} nameKey={x_axis} cx="50%" cy="50%" outerRadius={100} label>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
            </Pie>
            <Tooltip contentStyle={{background:"#313244",border:"none",color:"#cdd6f4"}}/>
            <Legend/>
          </PieChart>
        ) : (
          <BarChart data={data}>
            <XAxis dataKey={x_axis} stroke="#888" tick={{fontSize:10}} angle={-30} textAnchor="end" height={60}/>
            <YAxis stroke="#888" tick={{fontSize:11}}/>
            <Tooltip contentStyle={{background:"#313244",border:"none",color:"#cdd6f4"}}/>
            <Bar dataKey={y_axis} fill="#6366f1" radius={[4,4,0,0]}/>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default function App() {
  const [question, setQuestion] = useState("");
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/ask", { question });
      if (res.data.error) setError(res.data.error);
      else setCharts(prev => [...prev, { question, ...res.data }]);
    } catch (e) {
      setError("Could not connect to backend.");
    }
    setLoading(false);
    setQuestion("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#11111b", color: "#cdd6f4",
                  fontFamily: "sans-serif", padding: "40px 60px", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>📊 Business Intelligence Dashboard</h1>
      <p style={{ color: "#888", marginBottom: 32 }}>Ask any question about your Amazon sales data in plain English.</p>

      <div style={{ display: "flex", gap: 12 }}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAsk()}
          placeholder='e.g. "Show total revenue by product category"'
          style={{ flex: 1, padding: "14px 18px", borderRadius: 10, border: "1px solid #313244",
                   background: "#1e1e2e", color: "#cdd6f4", fontSize: 15, outline: "none" }}
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          style={{ padding: "14px 28px", borderRadius: 10, background: "#6366f1",
                   color: "#fff", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {loading && (
        <div style={{ marginTop: 24, color: "#888", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 18, height: 18, border: "2px solid #6366f1",
                        borderTopColor: "transparent", borderRadius: "50%",
                        animation: "spin 0.8s linear infinite" }}/>
          Generating your dashboard...
        </div>
      )}

      {error && <p style={{ color: "#ef4444", marginTop: 16 }}>Error: {error}</p>}

      {charts.length > 0 && (
        <button onClick={() => setCharts([])}
          style={{ marginTop: 16, padding: "8px 16px", borderRadius: 8, background: "transparent",
                   color: "#888", border: "1px solid #313244", cursor: "pointer", fontSize: 13 }}>
          Clear all charts
        </button>
      )}

      {charts.map((c, i) => (
        <div key={i}>
          <p style={{ color: "#888", marginTop: 24, fontSize: 13 }}>💬 "{c.question}"</p>
          <ChartWidget result={c}/>
        </div>
      ))}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
