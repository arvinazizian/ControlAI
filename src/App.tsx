import ModelOverview from "./ModelOverview";
import SmartReport from "./SmartReport";
import RealReportBuilder from "./RealReportBuilder";
import ReportReadiness from "./ReportReadiness";
import ChatOnboarding, {type ConversationAnswers} from "./ChatOnboarding";
import DataWorkbench from "./DataWorkbench";
import AIGuidance from "./AIGuidance";
import AdaptiveInterview from "./AdaptiveInterview";
import ExperienceOnboarding, {type ExperienceProfile} from "./ExperienceOnboarding";
import BridgeAssistant from "./BridgeAssistant";
import RelationshipReview from "./RelationshipReview";
import {joinApprovedTables} from "./safeJoin";
import type {ApprovedRelationship} from "./relationshipAdvisor";
import ReportDiscovery from "./ReportDiscovery";
import type {Dataset} from "./dataAdvisor";
import DataDecisionStudio from "./DataDecisionStudio";
import MultiSourceWorkspace from "./MultiSourceWorkspace";
import ModelWizard from "./ModelWizard";
import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { BarChart3, Download, RotateCcw, Sparkles } from "lucide-react";
import { sampleProjects, type Project } from "./data";
import ExcelImport from "./ExcelImport";
import CompanyGlossary from "./CompanyGlossary";
import ManualAIExchange from "./ManualAIExchange";
import { preferredLanguage, translate, type Language, type TranslationKey } from "./i18n";
import { loadTerms, type Term } from "./terminology";

type WorkspaceTab = "report" | "preview" | "sources" | "data" | "relationships" | "model" | "settings";
type AssistantMode = "questions" | "ai" | "discovery";
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
const SESSION_KEY="controlai-workspace-session-v1";
function restoreWorkspace():{open:boolean;tab:WorkspaceTab;conversation:ConversationAnswers;datasets:Dataset[]} {
 try {
  const saved=JSON.parse(sessionStorage.getItem(SESSION_KEY)||"null");
  if(!saved||typeof saved!=="object")throw Error("No saved session");
  const tabs:WorkspaceTab[]=["report","preview","sources","data","relationships","model","settings"];
  return {open:saved.open===true,tab:tabs.includes(saved.tab)?saved.tab:"report",conversation:saved.conversation&&typeof saved.conversation==="object"?saved.conversation:{},datasets:Array.isArray(saved.datasets)?saved.datasets:[]};
 }catch{return {open:true,tab:"report",conversation:{},datasets:[]};}
}
export default function App() {
  const [restoredSession]=useState(restoreWorkspace);
  const [settings,setSettings] = useState(initial);
  const [tab,setTab] = useState<WorkspaceTab>(restoredSession.tab);
  const [showWorkspace,setShowWorkspace] = useState(true);
  const [conversation,setConversation] = useState<ConversationAnswers>(restoredSession.conversation);
  const [assistantOpen,setAssistantOpen] = useState(true);
  const [assistantMode,setAssistantMode] = useState<AssistantMode>("ai");
  const [language,setLanguage] = useState<Language>(preferredLanguage);
  const t=(key:TranslationKey)=>translate(language,key);
  function changeLanguage(next:Language){setLanguage(next);localStorage.setItem("controlai-language",next);document.documentElement.lang=next;document.documentElement.dir=next==="fa"||next==="ar"?"rtl":"ltr";}
  const [terms,setTerms] = useState<Term[]>(loadTerms);
  function saveTerms(next:Term[]){setTerms(next);localStorage.setItem("controlai-glossary-v1",JSON.stringify(next));}
  const [projects,setProjects] = useState<Project[]>(sampleProjects);
  const [importedDatasets,setImportedDatasets] = useState<Dataset[]>(restoredSession.datasets);
  useEffect(()=>{
    try {sessionStorage.setItem(SESSION_KEY,JSON.stringify({open:showWorkspace,tab,conversation,datasets:importedDatasets}));}
    catch(e){console.warn("Workspace session could not be saved",e);}
  },[showWorkspace,tab,conversation,importedDatasets]);
  const [approvedRelationships,setApprovedRelationships]=useState<Record<string,ApprovedRelationship>>({});
  const reportDatasets=useMemo(()=>{const joined:Dataset[]=[];for(const r of Object.values(approvedRelationships)){for(const side of (["left","right"] as const)){if(side==="left"&&!r.rightUnique||side==="right"&&!r.leftUnique)continue;try{joined.push(joinApprovedTables(importedDatasets,r,side));}catch(e){console.warn("Approved join unavailable",e);}}}return [...importedDatasets,...joined];},[importedDatasets,approvedRelationships]);
  const [experience,setExperience] = useState<ExperienceProfile|null>(()=>{try{const raw=localStorage.getItem("controlai-experience-v1");return raw?JSON.parse(raw) as ExperienceProfile:null;}catch{return null;}});
  const [selected,setSelected] = useState<string | null>("P-102");
  const [error,setError] = useState("");
  const [prompt,setPrompt] = useState("");
  const [notice,setNotice] = useState("");
  const palette = palettes[settings.palette];
  if(typeof document!=="undefined"){document.documentElement.lang=language;document.documentElement.dir=language==="fa"||language==="ar"?"rtl":"ltr";}
  const data = useMemo(() => [...projects].sort((a,b) => settings.sort === "variance" ? (b.forecast-b.budget)-(a.forecast-a.budget) : a.name.localeCompare(b.name)),[projects,settings.sort]);
  const active = projects.find(p => p.id === selected) ?? projects[0];
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
  if(!showWorkspace)return <ChatOnboarding language={language} onLanguageChange={changeLanguage} onOpenWorkspace={answers=>{setConversation(answers);setTab(answers.source?.includes("none")?"report":"sources");setShowWorkspace(true);}}/>;
  return <div className="app">
    <aside className="sidebar"><div className="brand"><BarChart3 size={25}/><span>Control<span className="accent">AI</span></span></div><div className="nav active">▦ &nbsp; {t("visualStudio")}</div><div className="nav muted">◫ &nbsp; {t("dashboards")} <small>{t("soon")}</small></div><div className="nav muted">◇ &nbsp; {t("dataSources")} <small>{t("soon")}</small></div><div className="sidebottom">MVP v0.1<br/>Local sample data · No cloud connection</div></aside>
    <main><button className="secondary" onClick={()=>setShowWorkspace(false)}>{language==="fa"?"← بازگشت به گفت‌وگو":"← Back to conversation"}</button><div className="language-picker"><label htmlFor="language-select">{t("language")}</label><select id="language-select" value={language} onChange={e=>changeLanguage(e.target.value as Language)}><option value="en">English</option><option value="nl">Nederlands</option><option value="fa">فارسی</option><option value="ar">العربية</option><option value="tr">Türkçe</option></select></div><header><div><div className="eyebrow">{t("workspace")}</div><h1>{t("comparison")} <span className="chip">Visual B</span></h1><p>{t("intro")}</p></div><button className="primary" onClick={download}><Download size={16}/> {t("export")}</button></header>
    <nav className="workspace-tabs" aria-label={language==="fa"?"بخش‌های محیط کار":"Workspace sections"}>
      {([{id:"report",fa:"▦ گزارش",en:"▦ Report"},{id:"data",fa:"▤ داده‌ها",en:"▤ Data"},{id:"model",fa:"◇ نمای مدل",en:"◇ Model"},{id:"relationships",fa:"↔ مدیریت روابط",en:"↔ Relationships"},{id:"sources",fa:"+ فایل‌ها",en:"+ Sources"},{id:"preview",fa:"◫ نمایش نهایی",en:"◫ Final view"},{id:"settings",fa:"⚙ تنظیمات",en:"⚙ Settings"}] as const).map(item=><button key={item.id} className={tab===item.id?"workspace-tab active":"workspace-tab"} onClick={()=>setTab(item.id)} aria-current={tab===item.id?"step":undefined}>{language==="fa"?item.fa:item.en}</button>)}
    </nav>
    {tab==="report"&&<section className="assistant-dock" aria-label="ControlAI assistant">
      <div className="assistant-dock-head"><div><strong>✦ ControlAI Assistant</strong><small>{language==="fa"?"سؤال‌های هوشمند و راهنمای مرحله‌به‌مرحله":"Adaptive questions and step-by-step guidance"}</small></div><button className="secondary" onClick={()=>setAssistantOpen(v=>!v)} aria-expanded={assistantOpen}>{assistantOpen?(language==="fa"?"بستن راهنما ↑":"Hide ↑"):(language==="fa"?"بازکردن راهنما ↓":"Open ↓")}</button></div>
      {assistantOpen&&<div className="assistant-dock-body">
        {!experience?<ExperienceOnboarding language={language} onComplete={profile=>{setExperience(profile);localStorage.setItem("controlai-experience-v1",JSON.stringify(profile));}}/>:<>
          <div className="assistant-mode-tabs"><button className={assistantMode==="questions"?"active":""} onClick={()=>setAssistantMode("questions")}>{language==="fa"?"سؤال بعدی":"Next question"}</button><button className={assistantMode==="ai"?"active":""} onClick={()=>setAssistantMode("ai")}>AI</button><button className={assistantMode==="discovery"?"active":""} onClick={()=>setAssistantMode("discovery")}>{language==="fa"?"هدف گزارش":"Report goals"}</button></div>
          {assistantMode==="questions"&&<AdaptiveInterview language={language} datasets={importedDatasets} experience={experience}/>}
          {assistantMode==="ai"&&<AIGuidance language={language} datasets={importedDatasets} experience={experience} reportIntent={conversation}/>}
          {assistantMode==="discovery"&&<ReportDiscovery language={language} datasets={importedDatasets}/>}
          <button className="secondary" onClick={()=>setExperience(null)}>{language==="fa"?"تغییر سطح راهنمایی":"Change guidance level"}</button>
        </>}
      </div>}
    </section>}
    {tab==="report"&&conversation.goal?.length>0&&<section className="conversation-brief" aria-label="Report request">
      <strong>{language==="fa"?"درخواست گزارش شما":"Your report request"}</strong>
      <p>{conversation.goal.join(" · ")} · {conversation.detail?.join(", ")||""} · {conversation.frequency?.join(", ")||""}</p>
      <small>{language==="fa"?"این انتخاب‌ها ذخیره شده‌اند و برای تنظیم گزارش استفاده خواهند شد؛ گزارش خودکار هنوز به اعتبارسنجی داده نیاز دارد.":"Preferences captured. Actual report generation requires source-data validation."}</small>
    </section>}
    <div className="workspace-stage">
      {tab!=="preview"&&tab!=="report"&&tab!=="model"&&<div className="stage-heading"><h2>{tab==="sources"?(language==="fa"?"ورود و آماده‌سازی داده":"Import and prepare data"):tab==="data"?(language==="fa"?"بررسی و ویرایش داده":"Explore and edit data"):tab==="relationships"?(language==="fa"?"مدل و ارتباط جدول‌ها":"Model and relationships"):tab==="report"?(language==="fa"?"طراحی و نمایش گزارش":"Build and view report"):(language==="fa"?"تنظیمات و ابزارهای پیشرفته":"Settings and advanced tools")}</h2><p>{language==="fa"?"فقط ابزارهای مربوط به این مرحله نمایش داده می‌شوند. راهنمای هوشمند همیشه از بالای صفحه در دسترس است.":"Only tools for this step are shown. The assistant stays available at the top."}</p></div>}
      {tab==="model"&&<ModelOverview datasets={importedDatasets} approved={approvedRelationships} language={language} onNavigate={setTab}/>}
      {(tab==="preview"||tab==="report")&&<SmartReport datasets={reportDatasets} language={language} reportOnly={tab==="preview"}/>}
    <div style={{display:tab==="sources"?"block":"none"}}><MultiSourceWorkspace language={language} onDatasets={next=>{setApprovedRelationships({});setImportedDatasets(old=>[...old,...next]);}}/><ReportReadiness language={language} datasets={importedDatasets} answers={conversation}/></div>
      <div style={{display:tab==="data"?"block":"none"}}><DataWorkbench language={language} datasets={importedDatasets} onChange={next=>{setApprovedRelationships({});setImportedDatasets(next);}}/><DataDecisionStudio language={language} datasets={importedDatasets}/></div>
      <div style={{display:tab==="relationships"?"block":"none"}}><BridgeAssistant language={language} datasets={importedDatasets} experience={experience}/><RelationshipReview language={language} datasets={importedDatasets} approved={approvedRelationships} onApprovedChange={setApprovedRelationships}/></div>
      {false&&tab==="report"&&<>{conversation.source?.includes("none")&&importedDatasets.length===0&&<section className="panel import"><h2>{language==="fa"?"شروع بدون فایل":"Start without files"}</h2><p>{language==="fa"?"گفتی فعلاً فایل یا داده نداری. نیازی به آپلود نیست؛ ابتدا فیلدهای موردنیاز، ساخت قالب یا برنامه جمع‌آوری داده را مشخص می‌کنیم. ساخت گزارش عددی واقعی تا ورود داده ممکن نیست.":"You said you have no data. No upload is required now. First define the fields, template or data collection plan. A real numeric report needs data."}</p><p>{language==="fa"?"انتخاب تو: ":"Your choice: "}{conversation.data_plan?.join("، ")||"—"}</p><p>{language==="fa"?"قواعدی که توضیح دادی: ":"Your requested rules: "}{conversation.refinement?.join("، ")||"—"}</p></section>}<RealReportBuilder language={language} datasets={reportDatasets} answers={conversation}/>
    {importedDatasets.length===0&&<><p className="notice">{language==="fa"?"نمودارهای زیر فقط داده نمایشی هستند؛ برای گزارش واقعی فایل وارد کن.":"Charts below are demo data only. Import files to build a real report."}</p>
<section className="stats"><div className="stat"><span>{t("budget")}</span><strong>€{projects.reduce((a,p)=>a+p.budget,0).toFixed(1)}M</strong></div><div className="stat"><span>{t("forecast")}</span><strong>€{projects.reduce((a,p)=>a+p.forecast,0).toFixed(1)}M</strong></div><div className="stat"><span>{t("variance")}</span><strong className={projects.reduce((a,p)=>a+p.forecast-p.budget,0)>0?"bad":"good"}>€{projects.reduce((a,p)=>a+p.forecast-p.budget,0).toFixed(1)}M</strong></div></section>
    <div className="workspace"><section className="panel chart"><div className="panelhead"><div><h2>{t("financial")}</h2><p>{t("drill")}</p></div><span className="chip">{t("million")}</span></div><ReactECharts option={option} style={{height:380,width:"100%"}} onEvents={{click:(event:{dataIndex:number})=>setSelected(data[event.dataIndex]?.id??null)}} notMerge={true}/>{active&&<div className="drill"><div className="drillhead"><strong>{active.name} — {t("detail")}</strong><span>{active.id}</span></div><div className="drillstats"><div>Budget<strong>€{active.budget.toFixed(2)}M</strong></div><div>Forecast<strong>€{active.forecast.toFixed(2)}M</strong></div><div>Variance<strong className={active.forecast>active.budget?"bad":"good"}>€{(active.forecast-active.budget).toFixed(2)}M</strong></div></div></div>}</section>
    <section className="panel controls"><h2>{t("properties")}</h2><p>{t("propertiesHint")}</p><label>{t("compare")}</label><select value={settings.metric} onChange={e=>update({metric:e.target.value as Metric})}><option value="forecast">Forecast</option><option value="actual">{t("actual")}</option></select><label>{t("orientation")}</label><select value={settings.direction} onChange={e=>update({direction:e.target.value as Direction})}><option value="horizontal">{t("horizontal")}</option><option value="vertical">{t("vertical")}</option></select><label>{t("sort")}</label><select value={settings.sort} onChange={e=>update({sort:e.target.value})}><option value="name">{t("name")}</option><option value="variance">{t("largest")}</option></select><label>{t("theme")}</label><div className="swatches">{(Object.keys(palettes) as Palette[]).map(k=><button key={k} aria-label={k} title={k} className={settings.palette===k?"chosen":""} style={{background:palettes[k][0]}} onClick={()=>update({palette:k})}/>)}</div><label className="check"><input type="checkbox" checked={settings.showLabels} onChange={e=>update({showLabels:e.target.checked})}/> {t("labels")}</label><button className="secondary" onClick={()=>setSettings(initial)}><RotateCcw size={15}/> {t("reset")}</button></section></div>
</>}

      </>}
      {tab==="settings"&&<><ModelWizard language={language}/><ExcelImport terms={terms} language={language} onImport={rows=>{setProjects(rows);setSelected(rows[0]?.id??null);}}/><CompanyGlossary terms={terms} language={language} onChange={saveTerms}/><ManualAIExchange terms={terms} language={language} onApply={update}/></>}
      {tab!=="report"&&tab!=="preview"&&<div className="stage-navigation"><button className="secondary" onClick={()=>setTab("report")}>{language==="fa"?"رفتن به استودیو گزارش":"Open report studio"}</button></div>}
    </div>
    <footer>ControlAI MVP · Free & open-source visualization stack · All default values are demo data</footer></main></div>;
}
