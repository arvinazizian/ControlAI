import {useMemo,useState} from "react";
import type {Dataset} from "./dataAdvisor";
import type {Language} from "./i18n";
import type {ConversationAnswers} from "./ChatOnboarding";
const patterns:Record<string,{name:string;patterns:string[]}[]>={
 cost:[{name:"Budget",patterns:["budget","bac","بودجه"]},{name:"Actual",patterns:["actual","cost","ac","هزینه"]},{name:"Forecast",patterns:["forecast","eac","estimate","پیشبینی"]}],
 schedule:[{name:"Planned date",patterns:["baseline","planned","planstart","تاریخبرنامه"]},{name:"Actual date",patterns:["actualdate","actualfinish","finish","تاریخواقعی"]}],
 sales:[{name:"Sales amount",patterns:["sales","revenue","amount","total","فروش"]}],
 inventory:[{name:"Quantity",patterns:["quantity","stock","inventory","qty","موجودی"]}],
 executive:[{name:"Amount",patterns:["budget","actual","amount","revenue","value","cost"]}]
};
const normalize=(s:string)=>s.toLowerCase().replace(/[\s_\-]/g,"");
export default function ReportReadiness({datasets,answers,language}:{datasets:Dataset[];answers:ConversationAnswers;language:Language}){
 const fa=language==="fa";const [chosen,setChosen]=useState<Record<string,string>>({});
 const goals=(answers.goal||[]).filter(g=>g in patterns);const required=useMemo(()=>goals.flatMap(g=>patterns[g].map(p=>({id:g+":"+p.name,...p}))),[answers.goal?.join("|")]);
 const cols=datasets.flatMap(d=>d.columns.map(c=>({id:d.name+"."+c,name:c,table:d.name})));
 const found=required.map(r=>{const matched=cols.filter(c=>r.patterns.some(p=>normalize(c.name).includes(normalize(p))));const selected=chosen[r.id]||matched[0]?.id||"";return {...r,selected,matched};});
 const missing=found.filter(f=>!f.selected);const allReady=datasets.length>0&&required.length>0&&missing.length===0;
 return <section className="panel import"><h2>{fa?"بررسی آمادگی گزارش":"Report readiness"}</h2>
 <p>{fa?"براساس انتخاب‌های گفت‌وگو، ستون‌های لازم را در فایل‌ها بررسی می‌کنم. هیچ رابطه یا محاسبه‌ای بدون تأیید شما ساخته نمی‌شود.":"I check the imported columns against your conversation goals. No joins or calculations are applied without approval."}</p>
 {!datasets.length?<p>{fa?"ابتدا یک فایل Excel یا CSV وارد کن تا سؤال بعدی براساس داده واقعی مطرح شود.":"Upload Excel or CSV first; then the next questions can use actual data."}</p>:required.length===0?<p>{fa?"هدف سفارشی انتخاب شده؛ معیارهای گزارش باید مشخص شوند.":"A custom goal was selected; report metrics still need to be defined."}</p>:<><p>{datasets.length} {fa?"جدول وارد شده":"tables imported"} · {found.length-missing.length}/{found.length} {fa?"ستون پیشنهادی شناسایی شده":"candidate columns identified"}</p>
 {found.map(f=><label key={f.id} style={{display:"block",margin:"12px 0"}}><strong>{f.name}</strong><select value={f.selected} onChange={e=>setChosen(old=>({...old,[f.id]:e.target.value}))}><option value="">{fa?"ستون پیدا نشد؛ انتخاب کن":"Not found — select a column"}</option>{cols.map(c=><option key={c.id} value={c.id}>{c.id}</option>)}</select></label>)}
 <p role="status">{allReady?(fa?"ستون‌های پیشنهادی انتخاب شدند. پیش از ساخت گزارش، نوع داده، واحدها و ارتباط جدول‌ها باید بررسی شوند.":"Candidate columns selected. Validate data types, units and table relationships before building a report."):(fa?"برخی ستون‌ها مشخص نیستند. از منبع درست انتخابشان کن یا فایل مربوطه را وارد کن.":"Some columns are missing. Choose them or upload the missing source.")}</p></>}
 </section>;
}
