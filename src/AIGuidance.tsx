import {useState} from "react";
import type {Dataset} from "./dataAdvisor";
import type {Language} from "./i18n";
import type {ExperienceProfile} from "./ExperienceOnboarding";
type Stage="discovery"|"data_quality"|"relationships"|"model"|"report";
type Reply={question:string;options:string[];reason:string;evidenceNeeded:string[];confidence:number;proposedActions:string[];requiresApproval:true;executed:false};
export default function AIGuidance({datasets,language,experience}:{datasets:Dataset[];language:Language;experience:ExperienceProfile|null}){
 const [stage,setStage]=useState<Stage>("discovery");const [reply,setReply]=useState<Reply|null>(null);const [answer,setAnswer]=useState("");const [history,setHistory]=useState<{question:string;answer:string}[]>([]);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 const fa=language==="fa";
 async function ask(previous=history){
  setBusy(true);setError("");
  try{
   // Only schema and aggregate statistics leave the browser; never raw row values.
   const metadata=datasets.map(d=>({name:d.name.slice(0,100),columns:d.columns.slice(0,100).map(c=>c.slice(0,100)),rowCount:d.rows.length,missingByColumn:d.columns.slice(0,100).map(c=>({column:c,missing:d.rows.filter(r=>r[c]==null||String(r[c]).trim()==="").length}))}));
   const response=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({stage,profile:{language,level:experience?.level??"beginner",guidance:experience?.guidance??"guided",tools:experience?.tools??[]},metadata,previous})});
   const result=await response.json();if(!response.ok)throw Error(result.error||"AI unavailable");
   if(typeof result.question!=="string"||!Array.isArray(result.options))throw Error("Invalid response");
   setReply(result as Reply);setAnswer("");
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
 }
 function next(){if(!reply||!answer.trim())return;const nextHistory=[...history,{question:reply.question,answer:answer.trim()}].slice(-12);setHistory(nextHistory);void ask(nextHistory);}
 return <section className="panel import"><h2>{fa?"راهنمای هوشمند AI در تمام مراحل":"AI guidance throughout the workflow"}</h2><p>{fa?"AI بر اساس ساختار جدول‌ها و پاسخ‌های قبلی سؤال تازه پیشنهاد می‌دهد. داده‌های ردیف‌ها ارسال نمی‌شوند؛ فقط نام ستون‌ها و آمار کلی ارسال می‌شود.":"AI proposes new questions from table structure and prior answers. Raw rows are not sent, only schema and aggregate counts."}</p>
 <label>{fa?"مرحله کار":"Workflow stage"}<select value={stage} onChange={e=>{setStage(e.target.value as Stage);setReply(null);}}><option value="discovery">Discovery</option><option value="data_quality">Data quality</option><option value="relationships">Relationships</option><option value="model">Semantic model</option><option value="report">Report design</option></select></label>
 <button className="primary" disabled={busy} onClick={()=>void ask()}>{busy?(fa?"در حال تحلیل…":"Analyzing…"):(fa?"پرسیدن سؤال هوشمند":"Generate next AI question")}</button>
 {error&&<p role="alert" className="bad">{error}</p>}
 {reply&&<div className="wizard-result"><h3>{reply.question}</h3><p>{reply.reason}</p><p>{fa?"اطمینان پیشنهادی":"Estimated confidence"}: {Math.round(reply.confidence*100)}%</p><div className="wizard-options">{reply.options.map((option,i)=><label className="wizard-option" key={i}><input type="radio" checked={answer===option} onChange={()=>setAnswer(option)}/>{option}</label>)}</div><label>{fa?"پاسخ یا توضیح دیگر":"Your answer / additional context"}<textarea value={answer} onChange={e=>setAnswer(e.target.value)}/></label><button className="secondary" disabled={busy||!answer.trim()} onClick={next}>{fa?"ثبت پاسخ و سؤال بعدی":"Continue with next question"}</button><p>{fa?"شواهد موردنیاز":"Evidence needed"}: {reply.evidenceNeeded.join(" · ")}</p><p>{fa?"اقدامات پیشنهادی (اجرا نشده)":"Suggested actions (not executed)"}: {reply.proposedActions.join(" · ")}</p></div>}
 <p>{fa?"AI ممکن است اشتباه کند؛ هیچ تغییر یا ارتباطی بدون اعتبارسنجی و تأیید اجرا نمی‌شود.":"AI can be wrong. Nothing is executed without validation and approval."}</p></section>;
}
