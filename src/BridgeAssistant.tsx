import {useMemo,useState} from "react";
import type {Dataset} from "./dataAdvisor";
import type {Language} from "./i18n";
import {bridgeSuggestions,inspectManualMapping,previewDerivedKey} from "./bridgeAdvisor";
import type {ExperienceProfile} from "./ExperienceOnboarding";
export default function BridgeAssistant({datasets,language,experience}:{datasets:Dataset[];language:Language;experience:ExperienceProfile|null}){
 const fa=language==="fa";const [left,setLeft]=useState("");const [right,setRight]=useState("");const [ac,setAc]=useState("");const [bc,setBc]=useState("");const [newName,setNewName]=useState("NormalizedKey");const [error,setError]=useState("");const [showPreview,setShowPreview]=useState(false);
 const a=datasets.find(d=>d.name===left),b=datasets.find(d=>d.name===right);
 const review=useMemo(()=>{if(!a||!b||!ac||!bc)return null;try{return inspectManualMapping(a,ac,b,bc);}catch{return null;}},[a,b,ac,bc]);
 const preview=useMemo(()=>{if(!a||!ac||!showPreview)return null;try{return previewDerivedKey(a,ac,newName);}catch{return null;}},[a,ac,newName,showPreview]);
 const suggestions=a&&b?bridgeSuggestions(a,b):[];
 return <section className="panel import"><h2>{fa?"دستیار اتصال جدول‌های بدون ارتباط":"Disconnected table assistant"}</h2><p>{fa?"اگر ارتباط پیدا نشود، با چند سؤال بررسی می‌کنیم آیا ستون مشترک با نام متفاوت، جدول واسط یا داده دیگری لازم است. هیچ شناسه‌ای از روی حدس ساخته نمی‌شود.":"If no join is found, explore differently named keys, a mapping table, or another source. No identifiers are fabricated."}</p>
 {datasets.length<2?<p>{fa?"حداقل دو جدول وارد کنید.":"Import at least two tables."}</p>:<>
 <label>{fa?"جدول اول":"First table"}<select value={left} onChange={e=>{setLeft(e.target.value);setAc("");setShowPreview(false);}}><option value="">—</option>{datasets.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}</select></label>
 <label>{fa?"جدول دوم":"Second table"}<select value={right} onChange={e=>{setRight(e.target.value);setBc("");}}><option value="">—</option>{datasets.filter(d=>d.name!==left).map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}</select></label>
 {a&&b&&<><h3>{fa?"پیشنهادهای سیستم":"Suggestions"}</h3>{suggestions.map(s=><div className="wizard-option" key={s.kind} style={{display:"block",marginBottom:8}}><strong>{s.title}</strong><p>{s.explanation}</p><p>{s.question}</p></div>)}
 <label>{fa?"کدام ستون جدول اول شناسه مشترک است؟":"First table matching column"}<select value={ac} onChange={e=>{setAc(e.target.value);setShowPreview(false);}}><option value="">—</option>{a.columns.map(c=><option key={c}>{c}</option>)}</select></label>
 <label>{fa?"کدام ستون جدول دوم همان شناسه است؟":"Second table matching column"}<select value={bc} onChange={e=>setBc(e.target.value)}><option value="">—</option>{b.columns.map(c=><option key={c}>{c}</option>)}</select></label>
 {review&&<div className="wizard-result"><p>{fa?"تطابق ردیف‌ها":"Matched rows"}: {review.leftMatched}/{review.leftRows} ↔ {review.rightMatched}/{review.rightRows}; {fa?"بدون تطابق":"Unmatched"}: {review.leftUnmatched}/{review.rightUnmatched}</p><p>{review.canPropose?(fa?"امکان بررسی بیشتر ارتباط وجود دارد؛ هنوز تأیید نشده.":"Candidate may be reviewed further; not approved."):(fa?"ارتباط مستقیم معتبر نیست؛ جدول واسط یا منبع دیگری را بررسی کنید.":"Direct link not valid; consider a mapping table or another source.")}</p></div>}
 {ac&&<><label>{fa?"نام ستون جدید در نسخه کاری":"New working-copy column name"}<input value={newName} onChange={e=>{setNewName(e.target.value);setShowPreview(false);}}/></label><button className="secondary" onClick={()=>{try{previewDerivedKey(a,ac,newName);setShowPreview(true);setError("");}catch(e){setError(String(e));}}}>{fa?"پیش‌نمایش ستون مشتق‌شده":"Preview derived column"}</button>{preview&&<pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{JSON.stringify(preview.rows.slice(0,3),null,2)}</pre>}</>}
 {error&&<p role="alert">{error}</p>}
 <p>{experience?.guidance==="technical"?"No inferred join or bridge table is written to any source.":fa?"برای جلوگیری از گزارش اشتباه، تغییرات فقط پیش‌نمایش هستند.":"All operations are previews to avoid incorrect reports."}</p></>}
 </>}</section>;
}
