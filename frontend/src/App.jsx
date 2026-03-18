import { useState, useRef } from "react";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";

const COLORS = ["#2563eb","#f59e0b","#10b981","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316"];
const NAV_ITEMS = ["Dashboard", "Analytics", "Reports", "Upload Data", "Support"];
const SAMPLE_QUERIES = [
  "Show total revenue by product category as a bar chart",
  "Show monthly revenue trend over time as a line chart",
  "Show revenue share by customer region as a pie chart",
  "Show top 5 categories by average rating as a bar chart",
  "Show orders by payment method as a pie chart",
];

function ChartCard({ result, index, onRemove, darkMode }) {
  const { chart_type, title, insight, data, x_axis, y_axis, question } = result;
  if (!data || data.length === 0) return (
    <div style={{ background: darkMode?"#1e1e2e":"#fff", borderRadius:16, padding:24, border:`1px solid ${darkMode?"#313244":"#e5e7eb"}` }}>
      <p style={{ color:"#ef4444" }}>No data found.</p>
    </div>
  );

  const total  = data.reduce((sum, r) => sum + (parseFloat(r[y_axis]) || 0), 0);
  const maxRow = data.reduce((b, r) => parseFloat(r[y_axis]) > parseFloat(b[y_axis]) ? r : b, data[0]);

  const tooltipStyle = { background: darkMode?"#1e1e2e":"#fff", border:`1px solid ${darkMode?"#313244":"#e5e7eb"}`, color: darkMode?"#cdd6f4":"#111827", borderRadius:8, fontSize:13 };

  const renderChart = () => {
    if (chart_type === "line") return (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode?"#313244":"#e5e7eb"}/>
        <XAxis dataKey={x_axis} tick={{ fontSize:11, fill: darkMode?"#888":"#6b7280" }}/>
        <YAxis tick={{ fontSize:11, fill: darkMode?"#888":"#6b7280" }}/>
        <Tooltip contentStyle={tooltipStyle}/>
        <Legend/>
        <Line type="monotone" dataKey={y_axis} stroke="#2563eb" dot={false} strokeWidth={2.5}/>
      </LineChart>
    );
    if (chart_type === "pie") return (
      <PieChart>
        <Pie data={data} dataKey={y_axis} nameKey={x_axis}
             cx="50%" cy="50%" outerRadius={110} innerRadius={50}
             paddingAngle={3}
             label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle}/>
        <Legend/>
      </PieChart>
    );
    return (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode?"#313244":"#e5e7eb"}/>
        <XAxis dataKey={x_axis} tick={{ fontSize:10, fill: darkMode?"#888":"#6b7280" }} angle={-25} textAnchor="end" height={60}/>
        <YAxis tick={{ fontSize:11, fill: darkMode?"#888":"#6b7280" }}/>
        <Tooltip contentStyle={tooltipStyle}/>
        <Bar dataKey={y_axis} radius={[6,6,0,0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
        </Bar>
      </BarChart>
    );
  };

  return (
    <div style={{ background: darkMode?"#1e1e2e":"#fff", borderRadius:16, padding:24, border:`1px solid ${darkMode?"#313244":"#e5e7eb"}`, boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            <span style={{ borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700, background:"#eff6ff", color:"#2563eb" }}>#{index+1}</span>
            <span style={{ borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700,
              background: chart_type==="bar"?"#fffbeb":chart_type==="line"?"#f0fdf4":"#f5f3ff",
              color: chart_type==="bar"?"#d97706":chart_type==="line"?"#16a34a":"#7c3aed"
            }}>
              {chart_type.toUpperCase()} CHART
            </span>
          </div>
          <h3 style={{ color: darkMode?"#cdd6f4":"#111827", margin:0, fontSize:17, fontWeight:700 }}>{title}</h3>
          <p style={{ color: darkMode?"#6c7086":"#9ca3af", fontSize:12, margin:"4px 0 0" }}>"{question}"</p>
        </div>
        <button onClick={() => onRemove(index)}
          style={{ background:"none", border:"none", color: darkMode?"#6c7086":"#9ca3af", cursor:"pointer", fontSize:18, padding:4 }}>
          ✕
        </button>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        {[
          { label:"TOTAL", value: total.toLocaleString(undefined,{maximumFractionDigits:0}) },
          { label:"TOP PERFORMER", value: String(maxRow[x_axis]).substring(0,18) },
          { label:"DATA POINTS", value: data.length },
        ].map((stat, i) => (
          <div key={i} style={{ background: darkMode?"#313244":"#f9fafb", borderRadius:10, padding:"10px 16px", minWidth:120, border:`1px solid ${darkMode?"#444":"#e5e7eb"}` }}>
            <div style={{ color: darkMode?"#888":"#9ca3af", fontSize:10, marginBottom:2, fontWeight:700 }}>{stat.label}</div>
            <div style={{ color: darkMode?"#cdd6f4":"#111827", fontSize:15, fontWeight:700 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>

      {insight && (
        <div style={{ marginTop:16, background: darkMode?"#1e3a5f":"#eff6ff", border:`1px solid ${darkMode?"#2563eb44":"#bfdbfe"}`, borderRadius:10, padding:"10px 16px", color: darkMode?"#93c5fd":"#1e40af", fontSize:13 }}>
          <strong>AI Insight:</strong> {insight}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode]     = useState(true);
  const [question, setQuestion]     = useState("");
  const [charts, setCharts]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [columns, setColumns]       = useState([
    "order_date","product_category","price","discount_percent",
    "quantity_sold","customer_region","payment_method","rating","total_revenue"
  ]);
  const [uploadMsg, setUploadMsg]   = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const fileRef = useRef();

  const bg      = darkMode ? "#11111b" : "#f8fafc";
  const navBg   = darkMode ? "#1e1e2e" : "#fff";
  const cardBg  = darkMode ? "#1e1e2e" : "#fff";
  const border  = darkMode ? "#313244" : "#e5e7eb";
  const text    = darkMode ? "#cdd6f4" : "#111827";
  const subText = darkMode ? "#6c7086" : "#6b7280";
  const inputBg = darkMode ? "#1f2937" : "#1f2937";

  const LOADING_MSGS = [
    "Understanding your question...",
    "Generating SQL query...",
    "Fetching data from database...",
    "Building your chart...",
  ];

  const handleAsk = async (q) => {
    const query = q || question;
    if (!query.trim()) return;
    setLoading(true); setError(""); setQuestion("");
    let i = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    const iv = setInterval(() => {
      i = (i+1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[i]);
    }, 1200);
    try {
      const res = await axios.post("/ask", { question: query });
      clearInterval(iv);
      if (res.data.error) setError(res.data.error);
      else setCharts(prev => [{ question: query, ...res.data }, ...prev]);
    } catch {
      clearInterval(iv);
      setError("Could not connect to backend. Make sure backend server is running.");
    }
    setLoading(false); setLoadingMsg("");
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadMsg("Uploading...");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/upload", formData);
      if (res.data.error) setUploadMsg("Error: " + res.data.error);
      else {
        setUploadMsg(`Loaded: ${res.data.filename} (${res.data.rows.toLocaleString()} rows)`);
        setColumns(res.data.columns);
      }
    } catch { setUploadMsg("Upload failed. Please try again."); }
  };

  return (
    <div style={{ minHeight:"100vh", background:bg, fontFamily:"'Segoe UI',sans-serif", color:text, transition:"all 0.3s" }}>

      {/* ── Navbar ── */}
      <nav style={{ background:navBg, borderBottom:`1px solid ${border}`, position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 3px rgba(0,0,0,0.08)", transition:"all 0.3s" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"#2563eb" }}/>
            <span style={{ fontSize:18, fontWeight:800, color:text, letterSpacing:"-0.5px" }}>Datawrapper</span>
          </div>

          {/* Desktop links */}
          <div style={{ display:"flex", gap:32, alignItems:"center" }}>
            {NAV_ITEMS.map((item, i) => (
              <a key={i} href="#" style={{ color:subText, fontSize:14, fontWeight:500, textDecoration:"none", transition:"color 0.2s" }}
                 onMouseEnter={e => e.target.style.color="#2563eb"}
                 onMouseLeave={e => e.target.style.color=subText}>
                {item}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button style={{ padding:"8px 18px", borderRadius:8, background:"#2563eb", color:"#fff", border:"none", cursor:"pointer", fontSize:13, fontWeight:600 }}
              onMouseEnter={e => e.target.style.background="#1d4ed8"}
              onMouseLeave={e => e.target.style.background="#2563eb"}>
              Sign In
            </button>

            {/* Hamburger = theme toggle */}
            <button onClick={() => setDarkMode(!darkMode)}
              style={{ display:"flex", flexDirection:"column", gap:4, background:"none", border:"none", cursor:"pointer", padding:4 }}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <span style={{ width:22, height:2, background:text, borderRadius:2, transition:"all 0.3s", display:"block" }}/>
              <span style={{ width:22, height:2, background:text, borderRadius:2, transition:"all 0.3s", display:"block" }}/>
              <span style={{ width:22, height:2, background:text, borderRadius:2, transition:"all 0.3s", display:"block" }}/>
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px" }}>

        {/* Hero */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <h1 style={{ fontSize:36, fontWeight:800, color:text, margin:"0 0 8px" }}>
            Business Intelligence Dashboard
          </h1>
          <p style={{ color:subText, fontSize:16, margin:0 }}>
            Ask any business question in plain English — get instant AI-powered charts
          </p>
        </div>

        {/* Search card */}
        <div style={{ background:cardBg, borderRadius:16, padding:"28px 32px", boxShadow:"0 1px 8px rgba(0,0,0,0.08)", marginBottom:20, border:`1px solid ${border}`, transition:"all 0.3s" }}>
          <p style={{ color:text, fontWeight:600, fontSize:15, margin:"0 0 12px", textAlign:"center" }}>
            Ask your business query
          </p>

          {/* Input */}
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key==="Enter" && handleAsk()}
              placeholder="Example: Show monthly sales trend"
              style={{ flex:1, padding:"12px 16px", borderRadius:10, border:`1px solid ${border}`, background:inputBg, color:"#fff", fontSize:14, outline:"none" }}
            />
            <button onClick={() => handleAsk()} disabled={loading}
              style={{ padding:"12px 24px", borderRadius:10, background:"#2563eb", color:"#fff", border:"none", cursor:"pointer", fontSize:14, fontWeight:600, minWidth:100 }}
              onMouseEnter={e => e.target.style.background="#1d4ed8"}
              onMouseLeave={e => e.target.style.background="#2563eb"}>
              {loading ? "..." : "Generate"}
            </button>
          </div>

          {/* Upload button */}
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <button onClick={() => fileRef.current.click()}
              style={{ padding:"10px 28px", borderRadius:10, background:"#22c55e", color:"#fff", border:"none", cursor:"pointer", fontSize:14, fontWeight:600 }}
              onMouseEnter={e => e.target.style.background="#16a34a"}
              onMouseLeave={e => e.target.style.background="#22c55e"}>
              Upload File
            </button>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display:"none" }}/>
            {uploadMsg && (
              <p style={{ color: uploadMsg.startsWith("Error")?"#ef4444":"#16a34a", fontSize:12, margin:"8px 0 0" }}>
                {uploadMsg}
              </p>
            )}
          </div>

          {/* Sample queries */}
          <div style={{ borderTop:`1px solid ${border}`, paddingTop:14 }}>
            <p style={{ color:subText, fontSize:12, margin:"0 0 8px" }}>Try a sample query:</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {SAMPLE_QUERIES.map((q, i) => (
                <button key={i} onClick={() => handleAsk(q)}
                  style={{ padding:"6px 12px", borderRadius:20, background:"transparent", color: darkMode?"#6366f1":"#374151", border:`1px solid ${border}`, cursor:"pointer", fontSize:12, transition:"all 0.2s" }}
                  onMouseEnter={e => { e.target.style.background="#eff6ff"; e.target.style.borderColor="#2563eb"; e.target.style.color="#2563eb"; }}
                  onMouseLeave={e => { e.target.style.background="transparent"; e.target.style.borderColor=border; e.target.style.color=darkMode?"#6366f1":"#374151"; }}>
                  {q.substring(0,36)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dataset info */}
        {columns.length > 0 && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:cardBg, borderRadius:10, padding:"10px 16px", marginBottom:16, border:`1px solid ${border}` }}>
            <span style={{ color:text, fontSize:13 }}>
              Active dataset: <strong>{columns.length} columns</strong> — {columns.slice(0,5).join(", ")}...
            </span>
            {charts.length > 0 && (
              <button onClick={() => setCharts([])}
                style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:12, fontWeight:600 }}
                onMouseEnter={e => e.target.style.color="#dc2626"}
                onMouseLeave={e => e.target.style.color="#ef4444"}>
                Clear all ({charts.length})
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ width:36, height:36, border:`3px solid ${border}`, borderTopColor:"#2563eb", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }}/>
            <p style={{ color:subText, marginTop:16, fontSize:14 }}>{loadingMsg}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: darkMode?"#2d1515":"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"14px 18px", color:"#dc2626", marginBottom:16, fontSize:14 }}>
            <strong>Error:</strong> {error}
            <p style={{ margin:"6px 0 0", fontSize:13 }}>
              Try: "Show total revenue by product category as a bar chart"
            </p>
          </div>
        )}

        {/* Charts grid */}
        <div style={{ display:"grid", gridTemplateColumns: charts.length>1?"1fr 1fr":"1fr", gap:20 }}>
          {charts.map((c, i) => (
            <ChartCard key={i} result={c} index={i} darkMode={darkMode}
              onRemove={idx => setCharts(p => p.filter((_,ii) => ii!==idx))}/>
          ))}
        </div>

        {/* Empty state */}
        {!loading && charts.length===0 && !error && (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={darkMode?"#313244":"#d1d5db"} strokeWidth="1.5" style={{ marginBottom:16 }}>
              <path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-6"/>
            </svg>
            <p style={{ fontSize:18, color:subText }}>Ask your first question to generate a chart</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; }
        a { text-decoration: none; }
      `}</style>
    </div>
  );
}