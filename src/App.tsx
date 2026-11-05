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
  const [assistantOpen,setAssistantOpen] = useState(false);
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
  const [setupStep,setSetupStep]=useState<"upload"|"clean"|"questions"|"done">(()=>restoredSession.datasets.length?"clean":"upload");
  const [setupGoal,setSetupGoal]=useState("compare");
  const [setupPeriod,setSetupPeriod]=useState("monthly");
  const [setupMetric,setSetupMetric]=useState("cost");
  const [setupQuestion,setSetupQuestion]=useState(0);
  const quality=useMemo(()=>importedDatasets.map(d=>({name:d.name,rows:d.rows.length,empty:d.rows.reduce((n,row)=>n+d.columns.filter(c=>row[c]===null||row[c]===undefined||String(row[c]).trim()==="").length,0),duplicates:d.rows.length-new Set(d.rows.map(row=>JSON.stringify(d.columns.map(c=>row[c])))).size})),[importedDatasets]);
  const [approvedRelationships,setApprovedRelationships]=useState<Record<string,ApprovedRelationship>>({});
  const reportDatasets=useMemo(()=>{const joined:Dataset[]=[];for(const r of Object.values(approvedRelationships)){for(const side of (["left","right"] as const)){if(side==="left"&&!r.rightUnique||side==="right"&&!r.leftUnique)continue;try{joined.push(joinApprovedTables(importedDatasets,r,side));}catch(e){console.warn("Approved join unavailable",e);}}}return [...importedDatasets,...joined];},[importedDatasets,approvedRelationships]);
  const [experience,setExperience] = useState<ExperienceProfile|null>(()=>{try{const raw=localStorage.getItem("controlai-experience-v1");return raw?JSON.parse(raw) as ExperienceProfile:null;}catch{return null;}});
  const [selected,setSelected] = useState<string | null>("P-102");
  const [error,setError] = useState("");
  const [prompt,setPrompt] = useState("");
  const [listening,setListening] = useState(false);
  const [canvasContext,setCanvasContext]=useState<{kind:string;title:string;measure:string;dimension:string}[]>([]);
  const [visualCommand,setVisualCommand]=useState("");const [visualCommandVersion,setVisualCommandVersion]=useState(0);const [commandBusy,setCommandBusy]=useState(false);
  const [notice,setNotice] = useState("");
  const [chatMessages,setChatMessages]=useState<{role:"user"|"assistant";text:string}[]>([]);
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
  function startVoiceInput(){
    type SpeechResult={results:ArrayLike<ArrayLike<{transcript:string}>>};
    type SpeechEngine={lang:string;interimResults:boolean;onresult:((event:SpeechResult)=>void)|null;onerror:(()=>void)|null;onend:(()=>void)|null;start:()=>void};
    const browser=window as Window & {SpeechRecognition?:new()=>SpeechEngine;webkitSpeechRecognition?:new()=>SpeechEngine};
    const Speech=browser.SpeechRecognition||browser.webkitSpeechRecognition;
    if(!Speech){setNotice(language==="fa"?"مرورگر شما تشخیص گفتار را پشتیبانی نمی‌کند. از Chrome یا Edge استفاده کنید.":"Speech recognition is unavailable in this browser.");return;}
    try{const recognition=new Speech();recognition.lang=language==="fa"?"fa-IR":language==="nl"?"nl-NL":language==="ar"?"ar-SA":language==="tr"?"tr-TR":"en-US";recognition.interimResults=false;recognition.onresult=event=>{const transcript=Array.from(event.results).map(result=>result[0]?.transcript||"").join(" ").trim();if(transcript)setPrompt(old=>[old,transcript].filter(Boolean).join(" "));};recognition.onerror=()=>{setListening(false);setNotice(language==="fa"?"صدای شما دریافت نشد؛ مجوز میکروفون را بررسی کنید.":"Microphone recognition failed. Check permission.");};recognition.onend=()=>setListening(false);recognition.start();setListening(true);}catch{setListening(false);setNotice(language==="fa"?"میکروفون قابل راه‌اندازی نیست.":"Could not start microphone.");}
  }
  async function applyPrompt() {
    const input=prompt.trim();if(!input||commandBusy)return;
    const history=[...chatMessages,{role:"user" as const,text:input}];
    setChatMessages(history);setPrompt("");setCommandBusy(true);setNotice("");
    try{
      const response=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({stage:"chat",profile:{language},metadata:{command:input,canvasVisuals:canvasContext,datasets:reportDatasets.map(d=>({name:d.name,columns:d.columns,rowCount:d.rows.length}))},previous:history.slice(-10)})});
      const result=await response.json();if(!response.ok)throw Error(result.detail||result.error||"AI unavailable");
      if(result.action!=="none"&&["add_visual","edit_visual","delete_visual","move_visual","change_visual"].includes(result.action)){
        setVisualCommand("canvas_json:"+JSON.stringify({action:result.action,kind:result.kind,target:result.target,text:result.text,title:result.title,position:result.position,width:result.width,height:result.height}));
        setVisualCommandVersion(v=>v+1);
        setChatMessages(prev=>[...prev,{role:"assistant",text:String(result.reply||"")||"…"}]);
      }else setChatMessages(prev=>[...prev,{role:"assistant",text:String(result.reply||"Please clarify your request.")}]);
    }catch(e){setChatMessages(prev=>[...prev,{role:"assistant",text:(language==="fa"?"خطای اتصال: ":"Connection error: ")+(e instanceof Error?e.message:String(e))}]);}
    finally{setCommandBusy(false);}
  }
  function download() {
    const payload={type:"comparison-bars",version:1,settings,dataSource:"local",projects};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="controlai-visual.json";a.click();URL.revokeObjectURL(url);
  }
  if(!showWorkspace)return <ChatOnboarding language={language} onLanguageChange={changeLanguage} onOpenWorkspace={answers=>{setConversation(answers);setTab(answers.source?.includes("none")?"report":"sources");setShowWorkspace(true);}}/>;
  return <div className="app">
    <aside className="sidebar"><div className="brand"><BarChart3 size={25}/><span>Control<span className="accent">AI</span></span></div>    <nav className="workspace-tabs side-workspace-tabs" aria-label={language==="fa"?"بخش‌های محیط کار":"Workspace sections"}>
      {([{id:"report",fa:"▦ گزارش",en:"▦ Report"},{id:"data",fa:"▤ داده‌ها",en:"▤ Data"},{id:"model",fa:"◇ نمای مدل",en:"◇ Model"},{id:"relationships",fa:"↔ مدیریت روابط",en:"↔ Relationships"},{id:"sources",fa:"+ فایل‌ها",en:"+ Sources"},{id:"preview",fa:"◫ نمایش نهایی",en:"◫ Final view"},{id:"settings",fa:"⚙ تنظیمات",en:"⚙ Settings"}] as const).map(item=><button key={item.id} className={tab===item.id?"workspace-tab active":"workspace-tab"} onClick={()=>setTab(item.id)} aria-current={tab===item.id?"step":undefined}>{language==="fa"?item.fa:item.en}</button>)}
    </nav><div className="sidebottom">ControlAI Studio</div></aside>
    <main className={setupStep==="done"?"":"setup-active"}><button className="secondary" onClick={()=>setShowWorkspace(false)}>{language==="fa"?"← بازگشت به گفت‌وگو":"← Back to conversation"}</button><div className="language-picker"><label htmlFor="language-select">{t("language")}</label><select id="language-select" value={language} onChange={e=>changeLanguage(e.target.value as Language)}><option value="en">English</option><option value="nl">Nederlands</option><option value="fa">فارسی</option><option value="ar">العربية</option><option value="tr">Türkçe</option></select></div><header><div><div className="eyebrow">{t("workspace")}</div><h1>{t("comparison")} <span className="chip">Visual B</span></h1><p>{t("intro")}</p></div><button className="primary" onClick={download}><Download size={16}/> {t("export")}</button></header>

    {setupStep!=="done"&&<section className="panel" style={{maxWidth:960,margin:"16px auto",padding:20}}><h2>{language==="fa"?"استودیوی طراحی گزارش":"Report design studio"}</h2><p>{language==="fa"?"برای طراحی گزارش، می‌توانی با صفحه خالی شروع کنی یا فایل‌های داده را وارد کنی.":"Start with a blank report canvas or import data."}</p><button className="primary" onClick={()=>{setSetupStep("done");setTab("report");}}>{language==="fa"?"شروع طراحی با صفحه خالی":"Start blank report"}</button> <button className="secondary" onClick={()=>setTab("sources")}>{language==="fa"?"بارگذاری فایل‌ها":"Upload files"}</button></section>}
    {setupStep!=="done"&&<section className="panel setup-flow" style={{maxWidth:960,margin:"16px auto",padding:24}}><div className="eyebrow">{language==="fa"?"شروع سریع ControlAI":"ControlAI quick start"} · {setupStep==="upload"?"1/3":setupStep==="clean"?"2/3":"3/3"}</div><h2>{setupStep==="upload"?(language==="fa"?"اول فایل‌های داده را وارد کن":"First, import your files"):setupStep==="clean"?(language==="fa"?"بررسی و پاک‌سازی داده":"Review data quality"):language==="fa"?"گزارش موردنظرت را مشخص کنیم":"Tell us what report you need"}</h2>{setupStep==="upload"?<><p>{language==="fa"?"فایل‌های Excel یا CSV را از بخش فایل‌ها اضافه کن. بعد از ورود فایل‌ها به مرحله بررسی کیفیت می‌رویم.":"Add Excel or CSV files under Sources, then review data quality."}</p><button className="primary" onClick={()=>setTab("sources")}>{language==="fa"?"ورود فایل‌ها":"Import files"}</button>{importedDatasets.length>0&&<button className="secondary" onClick={()=>setSetupStep("clean")}>{language==="fa"?"ادامه به بررسی داده":"Review data"}</button>}</>:setupStep==="clean"?<><p>{language==="fa"?"این بررسی فقط مشکلات احتمالی را نشان می‌دهد و هیچ داده‌ای بدون تأیید تغییر نمی‌کند.":"This is a non-destructive quality check; no changes are applied without approval."}</p><div style={{overflowX:"auto"}}><table style={{width:"100%"}}><thead><tr><th>{language==="fa"?"جدول":"Table"}</th><th>{language==="fa"?"ردیف":"Rows"}</th><th>{language==="fa"?"سلول خالی":"Empty cells"}</th><th>{language==="fa"?"ردیف تکراری":"Duplicate rows"}</th></tr></thead><tbody>{quality.map(q=><tr key={q.name}><td>{q.name}</td><td>{q.rows}</td><td>{q.empty}</td><td>{q.duplicates}</td></tr>)}</tbody></table></div><p>{language==="fa"?"برای اصلاح موارد مشکوک به تب داده‌ها برو؛ یا پس از بررسی، ادامه بده.":"Open Data to correct issues, or continue after reviewing."}</p><button className="secondary" onClick={()=>setTab("data")}>{language==="fa"?"بررسی و اصلاح در Data":"Inspect in Data"}</button> <button className="primary" onClick={()=>{setSetupStep("questions");setTab("report");}}>{language==="fa"?"بررسی کردم، ادامه":"Reviewed, continue"}</button></>:<><p>{language==="fa"?"هر بار فقط به یک سؤال پاسخ بده.":"Answer one question at a time."}</p>{setupQuestion===0?<><label htmlFor="setup-goal">{language==="fa"?"چه گزارشی می‌خواهی؟":"What is your report goal?"}</label><select id="setup-goal" value={setupGoal} onChange={e=>setSetupGoal(e.target.value)}><option value="compare">{language==="fa"?"مقایسه پروژه‌ها":"Compare projects"}</option><option value="trend">{language==="fa"?"روند زمانی":"Time trends"}</option><option value="risk">{language==="fa"?"ریسک و تأخیر":"Risk and delays"}</option></select></>:setupQuestion===1?<><label htmlFor="setup-period">{language==="fa"?"گزارش برای چه بازه‌ای باشد؟":"Which reporting period?"}</label><select id="setup-period" value={setupPeriod} onChange={e=>setSetupPeriod(e.target.value)}><option value="monthly">{language==="fa"?"ماهانه":"Monthly"}</option><option value="quarterly">{language==="fa"?"سه‌ماهه":"Quarterly"}</option><option value="yearly">{language==="fa"?"سالانه":"Yearly"}</option></select></>:<><label htmlFor="setup-metric">{language==="fa"?"چه شاخصی مهم‌تر است؟":"Which metric matters most?"}</label><select id="setup-metric" value={setupMetric} onChange={e=>setSetupMetric(e.target.value)}><option value="cost">{language==="fa"?"بودجه و هزینه":"Budget and cost"}</option><option value="progress">{language==="fa"?"پیشرفت پروژه":"Project progress"}</option><option value="both">{language==="fa"?"هر دو":"Both"}</option></select></>}{setupQuestion>0&&<button className="secondary" onClick={()=>setSetupQuestion(n=>n-1)}>{language==="fa"?"قبلی":"Back"}</button>} <button className="primary" onClick={()=>{if(setupQuestion<2)setSetupQuestion(n=>n+1);else{setSetupStep("done");setTab("report");setPrompt(language==="fa"?`برای داده‌های واردشده، گزارش ${setupGoal} با دوره ${setupPeriod} و شاخص ${setupMetric} پیشنهاد بده و بگو کدام نمودارها مناسب‌اند.`:`Suggest a ${setupGoal} report with ${setupPeriod} period and ${setupMetric} metric using imported datasets.`);}}}>{setupQuestion===2?(language==="fa"?"رفتن به طراحی گزارش":"Start report design"):(language==="fa"?"سؤال بعدی":"Next question")}</button></>}</section>}
    {setupStep==="done"&&<button className="secondary" onClick={()=>{setSetupStep(importedDatasets.length?"clean":"upload");setTab("sources");}}>{language==="fa"?"شروع تحلیل جدید":"New analysis"}</button>}
    {tab==="report"&&conversation.goal?.length>0&&<section className="conversation-brief" aria-label="Report request">
      <strong>{language==="fa"?"درخواست گزارش شما":"Your report request"}</strong>
      <p>{conversation.goal.join(" · ")} · {conversation.detail?.join(", ")||""} · {conversation.frequency?.join(", ")||""}</p>
      <small>{language==="fa"?"این انتخاب‌ها ذخیره شده‌اند و برای تنظیم گزارش استفاده خواهند شد؛ گزارش خودکار هنوز به اعتبارسنجی داده نیاز دارد.":"Preferences captured. Actual report generation requires source-data validation."}</small>
    </section>}
    <div className="workspace-stage">
      {tab!=="preview"&&tab!=="report"&&tab!=="model"&&<div className="stage-heading"><h2>{tab==="sources"?(language==="fa"?"ورود و آماده‌سازی داده":"Import and prepare data"):tab==="data"?(language==="fa"?"بررسی و ویرایش داده":"Explore and edit data"):tab==="relationships"?(language==="fa"?"مدل و ارتباط جدول‌ها":"Model and relationships"):(language==="fa"?"تنظیمات و ابزارهای پیشرفته":"Settings and advanced tools")}</h2><p>{language==="fa"?"فقط ابزارهای مربوط به این مرحله نمایش داده می‌شوند. راهنمای هوشمند پایین محیط کار در دسترس است.":"Only tools for this step are shown. The assistant stays available at the top."}</p></div>}
      {tab==="model"&&<ModelOverview datasets={importedDatasets} approved={approvedRelationships} language={language} onNavigate={setTab}/>}
      {setupStep==="done"&&(tab==="preview"||tab==="report")&&<SmartReport datasets={reportDatasets} language={language} reportOnly={tab==="preview"} externalCommand={visualCommand} commandVersion={visualCommandVersion} onCommandResult={setNotice} onVisualsChange={setCanvasContext}/>}
    <div style={{display:tab==="sources"?"block":"none"}}><MultiSourceWorkspace language={language} onDatasets={next=>{setApprovedRelationships({});setImportedDatasets(old=>[...old,...next]);setSetupStep("clean");}}/><ReportReadiness language={language} datasets={importedDatasets} answers={conversation}/></div>
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
    {tab==="report"&&<section className="panel" style={{marginTop:16,padding:16}} aria-label="Report command chat"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}><strong>✦ {language==="fa"?"دستیار طراحی گزارش":"Report design assistant"}</strong><span style={{fontSize:12,opacity:.7}}>{language==="fa"?"تغییرات سریع با فرمان متنی؛ اجرای خودکار AI هنوز فعال نیست":"Chat with AI · select a chart to change it"}</span></div><div style={{maxHeight:260,overflowY:"auto",display:"grid",gap:8,marginTop:12}} aria-live="polite">{chatMessages.map((m,i)=><div key={i} style={{padding:10,borderRadius:10,background:m.role==="user"?"#173765":"#1e293b",maxWidth:"90%",justifySelf:m.role==="user"?"end":"start",whiteSpace:"pre-wrap"}}><small style={{display:"block",opacity:.7}}>{m.role==="user"?"You":"ControlAI"}</small>{m.text}</div>)}{commandBusy&&<span>AI …</span>}</div><div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}><textarea style={{flex:"1 1 300px",minHeight:64}} value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void applyPrompt();}}} aria-label={language==="fa"?"پیام به دستیار، Enter برای ارسال و Shift+Enter برای خط جدید":"Assistant message, Enter to send"} placeholder={language==="fa"?"مثلاً: نمودار عمودی، مقدار واقعی، رنگ سبز":"e.g. vertical chart, actual values, green palette"}/><button className="secondary" disabled={listening||commandBusy} onClick={startVoiceInput} title={language==="fa"?"تبدیل گفتار به متن":"Speak your request"}>{listening?"●": "🎙"} {language==="fa"?(listening?"در حال شنیدن":"صحبت کن"):(listening?"Listening":"Speak")}</button><button className="primary" disabled={!prompt.trim()||commandBusy} onClick={()=>void applyPrompt()}>{language==="fa"?"اعمال تغییر":"Apply change"}</button><button className="secondary" onClick={()=>setAssistantOpen(v=>!v)} aria-expanded={assistantOpen}>{language==="fa"?(assistantOpen?"بستن ابزارهای راهنما":"ابزارهای راهنما"):(assistantOpen?"Hide guidance tools":"Guidance tools")}</button></div>{notice&&<p role="status" style={{marginTop:8}}>{notice}</p>}{assistantOpen&&<div className="assistant-dock-body" style={{marginTop:16,borderTop:"1px solid #334155",paddingTop:14}}><p style={{margin:"0 0 12px",opacity:.8}}>{language==="fa"?"ابزارهای راهنمای هوشمند در همین دستیار یکپارچه شده‌اند.":"AI guidance tools are integrated into this assistant."}</p>{!experience?<ExperienceOnboarding language={language} onComplete={profile=>{setExperience(profile);localStorage.setItem("controlai-experience-v1",JSON.stringify(profile));}}/>:<>
          <div className="assistant-mode-tabs"><button className={assistantMode==="questions"?"active":""} onClick={()=>setAssistantMode("questions")}>{language==="fa"?"سؤال بعدی":"Next question"}</button><button className={assistantMode==="ai"?"active":""} onClick={()=>setAssistantMode("ai")}>AI</button><button className={assistantMode==="discovery"?"active":""} onClick={()=>setAssistantMode("discovery")}>{language==="fa"?"هدف گزارش":"Report goals"}</button></div>
          {assistantMode==="questions"&&<AdaptiveInterview language={language} datasets={importedDatasets} experience={experience}/>}
          {assistantMode==="ai"&&<AIGuidance language={language} datasets={importedDatasets} experience={experience} reportIntent={conversation}/>}
          {assistantMode==="discovery"&&<ReportDiscovery language={language} datasets={importedDatasets}/>}
          <button className="secondary" onClick={()=>setExperience(null)}>{language==="fa"?"تغییر سطح راهنمایی":"Change guidance level"}</button>
        </>}
</div>}</section>}
    <footer>ControlAI MVP · Free & open-source visualization stack · All default values are demo data</footer></main></div>;
}
