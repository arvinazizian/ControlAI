import {useEffect,useMemo,useState} from "react";
import type {Dataset} from "./dataAdvisor";
import type {Language} from "./i18n";
import {approveRelationship,findRelationships,type ApprovedRelationship} from "./relationshipAdvisor";
export default function RelationshipReview({datasets,language}:{datasets:Dataset[];language:Language}){
 const [confirmed,setConfirmed]=useState<Record<string,boolean>>({});const [approved,setApproved]=useState<Record<string,ApprovedRelationship>>({});const [error,setError]=useState("");
 const suggestions=useMemo(()=>findRelationships(datasets),[datasets]);
 useEffect(()=>{setConfirmed({});setApproved({});setError("");},[datasets]);
 const fa=language==="fa";const title=fa?"بررسی ارتباط واقعی جدول‌ها":"Validated table relationships";
 return <section className="panel import"><h2>{title}</h2><p>{fa?"کلیدهای مشترک، تعداد تطابق‌ها، رکوردهای بدون ارتباط و احتمال چندبرابر شدن ردیف‌ها بررسی می‌شوند. هیچ JOIN یا تغییری در داده اصلی اجرا نمی‌شود.":"Shared keys, matches, orphan records and fan-out risks are inspected. No joins or source changes are executed."}</p>
 {datasets.length<2?<p>{fa?"برای بررسی ارتباط، حداقل دو جدول وارد کنید.":"Import at least two tables."}</p>:suggestions.length===0?<p>{fa?"ستون مشترک مناسبی پیدا نشد. امکان تعریف نگاشت دستی ستون‌ها هنوز پیاده‌سازی نشده است.":"No shared column names detected. Manual key mapping is pending."}</p>:suggestions.map(r=><div key={r.id} className="wizard-option" style={{display:"block",marginBottom:12}}>
 <strong>{r.left} [{r.leftColumn}] ↔ {r.right} [{r.rightColumn}]</strong>
 <p>{r.cardinality.split("_").join(" → ")} · {fa?"تطابق":"Matches"}: {r.matchedLeft}/{r.leftRows} ↔ {r.matchedRight}/{r.rightRows} · {fa?"بدون تطابق":"Orphans"}: {r.leftOrphans} / {r.rightOrphans} · {fa?"کلید خالی":"Missing keys"}: {r.leftNulls} / {r.rightNulls}</p>
 {r.reasons.map((reason,i)=><p key={i}>{reason}</p>)}
 {r.status==="unsafe"&&<p role="alert" className="bad">{fa?"ارتباط ناامن؛ تأیید غیرفعال است.":"Unsafe candidate; approval blocked."}</p>}
 <label className="check"><input type="checkbox" checked={!!confirmed[r.id]} onChange={e=>setConfirmed(old=>({...old,[r.id]:e.target.checked}))}/>{fa?"معنای کلید و سطح هر ردیف را بررسی کرده‌ام.":"I verified the business meaning of the key and the grain of both tables."}</label>
 <button className="secondary" disabled={r.status==="unsafe"||!confirmed[r.id]||!!approved[r.id]} onClick={()=>{try{const a=approveRelationship(r,!!confirmed[r.id]);setApproved(old=>({...old,[r.id]:a}));setError("");}catch(e){setError(String(e));}}}>{approved[r.id]?(fa?"تأیید شد":"Approved"):(fa?"تأیید ارتباط پیشنهادی":"Approve candidate")}</button>
 </div>)}
 {error&&<p role="alert" className="bad">{error}</p>}
 {Object.keys(approved).length>0&&<><h3>{fa?"مدل ارتباطی تأییدشده (پیش‌نویس)":"Approved relationship metadata (draft)"}</h3><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{JSON.stringify(Object.values(approved).map(({id,left,right,leftColumn,rightColumn,cardinality,approvedAt})=>({id,left,right,leftColumn,rightColumn,cardinality,approvedAt})),null,2)}</pre><p>{fa?"هنوز رابطه اجرایی، JOIN و اتصال به نمودار ساخته نشده است.":"Executable joins, semantic model and charts are not connected yet."}</p></>}
 </section>;
}
