import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { BarChart3, Download, RotateCcw, Sparkles } from "lucide-react";
import { sampleProjects, type Project } from "./data";
import ExcelImport from "./ExcelImport";
import CompanyGlossary from "./CompanyGlossary";
import ManualAIExchange from "./ManualAIExchange";
import { loadTerms, type Term } from "./terminology";

type Metric = "forecast" | "actual";
type Direction = "horizontal" | "vertical";
const palettes = { ocean: ["#528DFF", "#F3AF66"], emerald: ["#2BC4A6", "#B3DA6A"], violet: ["#9B83FF", "#F48AC0"] } as const;
type Palette = keyof typeof palettes;
const initial = { metric: "forecast" as Metric, direction: "horizontal" as Direction, palette: "ocean" as Palette, showLabels: true, sort: "name" };
function parseCSV(text: string): Project[] {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (lines.length < 2) throw Error("CSV is empty");
  const headers = lines[0].split(",").map(x => x.trim().toLowerCase());
  const required = ["id", "name", "budget", "forecast", "actual"];
  if (!required.every(h => headers.includes(h))) throw Error("Required columns: id,name,budget,forecast,actual");
  return lines.slice(1).filter(Boolean).map(line => {
    const parts = line.split(",");
    const value = (name: string) => (parts[headers.indexOf(name)] ?? "").trim();
    const project = { id: value("id"), name: value("name"), budget: Number(value("budget")), forecast: Number(value("forecast")), actual: Number(value("actual")) };
    if (!project.id || !project.name || ![project.budget,project.forecast,project.actual].every(Number.isFinite)) throw Error("Invalid CSV row");
    return project;
  });
}
export default function App() {
  const [settings,setSettings] = useState(initial);
  const [terms,setTerms] = useState<Term[]>(loadTerms);
  function saveTerms(next:Term[]){setTerms(next);localStorage.setItem("controlai-glossary-v1",JSON.stringify(next));}
  const [projects,setProjects] = useState<Project[]>(sampleProjects);
  const [selected,setSelected] = useState<string | null>("P-102");
  const [error,setError] = useState("");
  const [prompt,setPrompt] = useState("");
  const [notice,setNotice] = useState("");
  const palette = palettes[settings.palette];
  const data = useMemo(() => [...projects].sort((a,b) => settings.sort === "variance" ? (b.forecast-b.budget)-(a.forecast-a.budget) : a.name.localeCompare(b.name)),[projects,settings.sort]);
  const active = projects.find(p => p.id === selected);
  const update = (changes: Partial<typeof initial>) => setSettings(prev => ({...prev,...changes}));
  const option = {
    backgroundColor:"transparent", color:palette,
    tooltip:{trigger:"axis",axisPointer:{type:"shadow"},valueFormatter:(v:unknown)=>"€"+Number(v).toFixed(2)+"M"},
    legend:{top:0,textStyle:{color:"#a7b4ca"}},
    grid:{top:60,left:settings.direction==="horizontal"?90:50,right:28,bottom:55,containLabel:true},
    xAxis: settings.direction==="horizontal" ? {type:"value",axisLabel:{color:"#a7b4ca",formatter:"€{value}M"},splitLine:{lineStyle:{color:"#26344b"}}} : {type:"category",data:data.map(p=>p.name),axisLabel:{color:"#a7b4ca"},axisLine:{lineStyle:{color:"#50607b"}}},
    yAxis: settings.direction==="horizontal" ? {type:"category",data:data.map(p=>p.name),axisLabel:{color:"#a7b4ca"},axisLine:{lineStyle:{color:"#50607b"}}} : {type:"value",axisLabel:{color:"#a7b4ca",formatter:"€{value}M"},splitLine:{lineStyle:{color:"#26344b"}}},
    series:[{name:"Budget",type:"bar",data:data.map(p=>p.budget),barMaxWidth:20,label:{show:settings.showLabels,position:settings.direction==="horizontal"?"right":"top",color:"#d9e5f8",formatter:(v:{value:number})=>v.value.toFixed(1)}},{name:settings.metric==="forecast"?"Forecast":"Actual",type:"bar",data:data.map(p=>p[settings.metric]),barMaxWidth:20,label:{show:settings.showLabels,position:settings.direction==="horizontal"?"right":"top",color:"#d9e5f8",formatter:(v:{value:number})=>v.value.toFixed(1)}}],
    animationDuration:450
  };
  function applyPrompt() {
    const s=prompt.toLowerCase(); const change:Partial<typeof initial>={};
    if (/vertical|عمودی/.test(s)) change.direction="vertical";
    if (/horizontal|افقی/.test(s)) change.direction="horizontal";
    if (/actual|واقعی/.test(s)) change.metric="actual";
    if (/forecast|پیش.?بینی/.test(s)) change.metric="forecast";
    if (/green|سبز/.test(s)) change.palette="emerald";
    if (/purple|بنفش/.test(s)) change.palette="violet";
    if (/blue|آبی/.test(s)) change.palette="ocean";
    if (/variance|انحراف|مرتب/.test(s)) change.sort="variance";
    if (/hide labels|مخفی.*مقدار/.test(s)) change.showLabels=false;
    if (/show labels|نمایش.*مقدار/.test(s)) change.showLabels=true;
    if (!Object.keys(change).length) {setNotice("Prototype supports keyword commands only. AI connection comes next.");return;}
    update(change);setNotice("Visual updated using local keyword rules (not AI).");
  }
  function download() {
    const payload={type:"comparison-bars",version:1,settings,dataSource:"local",projects};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="controlai-visual.json";a.click();URL.revokeObjectURL(url);
  }
  return <div className="app">
    <aside className="sidebar"><div className="brand"><BarChart3 size={25}/><span>Control<span className="accent">AI</span></span></div><div className="nav active">▦ &nbsp; Visual Studio</div><div className="nav muted">◫ &nbsp; Dashboards <small>soon</small></div><div className="nav muted">◇ &nbsp; Data Sources <small>soon</small></div><div className="sidebottom">MVP v0.1<br/>Local sample data · No cloud connection</div></aside>
    <main><header><div><div className="eyebrow">WORKSPACE / VISUAL STUDIO</div><h1>Comparison Bars <span className="chip">Visual B</span></h1><p>Build, customize and explore your project financials.</p></div><button className="primary" onClick={download}><Download size={16}/> Export visual JSON</button></header>
    <section className="stats"><div className="stat"><span>Total Budget</span><strong>€{projects.reduce((a,p)=>a+p.budget,0).toFixed(1)}M</strong></div><div className="stat"><span>Total Forecast</span><strong>€{projects.reduce((a,p)=>a+p.forecast,0).toFixed(1)}M</strong></div><div className="stat"><span>Forecast Variance</span><strong className={projects.reduce((a,p)=>a+p.forecast-p.budget,0)>0?"bad":"good"}>€{projects.reduce((a,p)=>a+p.forecast-p.budget,0).toFixed(1)}M</strong></div></section>
    <div className="workspace"><section className="panel chart"><div className="panelhead"><div><h2>Project Financial Comparison</h2><p>Click a bar to drill down into a project</p></div><span className="chip">€ Million</span></div><ReactECharts option={option} style={{height:380,width:"100%"}} onEvents={{click:(event:{dataIndex:number})=>setSelected(data[event.dataIndex]?.id??null)}} notMerge={true}/>{active&&<div className="drill"><div className="drillhead"><strong>{active.name} — Project detail</strong><span>{active.id}</span></div><div className="drillstats"><div>Budget<strong>€{active.budget.toFixed(2)}M</strong></div><div>Forecast<strong>€{active.forecast.toFixed(2)}M</strong></div><div>Variance<strong className={active.forecast>active.budget?"bad":"good"}>€{(active.forecast-active.budget).toFixed(2)}M</strong></div></div></div>}</section>
    <section className="panel controls"><h2>Visual properties</h2><p>Every setting updates the chart instantly.</p><label>Compare budget with</label><select value={settings.metric} onChange={e=>update({metric:e.target.value as Metric})}><option value="forecast">Forecast</option><option value="actual">Actual Cost</option></select><label>Orientation</label><select value={settings.direction} onChange={e=>update({direction:e.target.value as Direction})}><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select><label>Sort projects</label><select value={settings.sort} onChange={e=>update({sort:e.target.value})}><option value="name">Project name</option><option value="variance">Largest forecast variance</option></select><label>Color theme</label><div className="swatches">{(Object.keys(palettes) as Palette[]).map(k=><button key={k} aria-label={k} title={k} className={settings.palette===k?"chosen":""} style={{background:palettes[k][0]}} onClick={()=>update({palette:k})}/>)}</div><label className="check"><input type="checkbox" checked={settings.showLabels} onChange={e=>update({showLabels:e.target.checked})}/> Show value labels</label><button className="secondary" onClick={()=>setSettings(initial)}><RotateCcw size={15}/> Reset visual</button></section></div>
    <section className="panel ai"><div className="panelhead"><div><h2><Sparkles size={18}/> Visual command</h2><p>Prototype: local keyword rules only — no AI model connected yet.</p></div><span className="chip">Experimental</span></div><div className="prompt"><input value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")applyPrompt()}} placeholder="e.g. Make it vertical, use green, sort by variance"/><button className="primary" onClick={applyPrompt}>Apply</button></div>{notice&&<p className="notice">{notice}</p>}</section>
    <section className="panel import"><h2>Load CSV data</h2><p>Columns: id,name,budget,forecast,actual. Values in € millions. Simple comma-separated CSV without quoted commas.</p><input type="file" accept=".csv,text/csv" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{const rows=parseCSV(await file.text());setProjects(rows);setSelected(rows[0]?.id??null);setError("");}catch(err){setError(err instanceof Error?err.message:"Unable to parse file");}}}/>{error&&<p className="bad">{error}</p>}<button className="secondary" onClick={()=>{setProjects(sampleProjects);setSelected("P-102");setError("");}}>Restore sample data</button></section>
    <ExcelImport terms={terms} onImport={rows=>{setProjects(rows);setSelected(rows[0]?.id??null);}}/>
    <CompanyGlossary terms={terms} onChange={saveTerms}/>
    <ManualAIExchange terms={terms} onApply={update}/>
    <footer>ControlAI MVP · Free & open-source visualization stack · All default values are demo data</footer></main></div>;
}
