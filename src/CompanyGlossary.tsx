import { useState } from "react";
import type { Language } from "./i18n";
import { type Term, standardTerms, validateTerms } from "./terminology";
type Props={terms:Term[];language?:Language;onChange:(terms:Term[])=>void};
export default function CompanyGlossary({terms,language="en",onChange}:Props){
 const labels={"en":["Company terminology & AI context","Workspace label","Validate & save glossary","Reset draft"],"nl":["Bedrijfsterminologie en AI-context","Werkruimtenaam","Begrippenlijst controleren en opslaan","Concept herstellen"],"fa":["اصطلاحات سازمان و زمینه هوش مصنوعی","نام فضای کاری","بررسی و ذخیره واژه‌نامه","بازنشانی پیش‌نویس"],"ar":["مصطلحات الشركة وسياق الذكاء الاصطناعي","اسم مساحة العمل","التحقق من المصطلحات وحفظها","إعادة ضبط المسودة"],"tr":["Şirket terimleri ve AI bağlamı","Çalışma alanı adı","Terimleri doğrula ve kaydet","Taslağı sıfırla"]};
 const ui=labels[language];
 const [draft,setDraft]=useState(JSON.stringify(terms,null,2));const [error,setError]=useState("");const [name,setName]=useState("Default workspace");
 function save(){try{const parsed:unknown=JSON.parse(draft);if(!Array.isArray(parsed)||!parsed.every(t=>t&&typeof t.key==="string"&&typeof t.label==="string"&&Array.isArray(t.aliases)&&t.aliases.every((a:unknown)=>typeof a==="string")&&typeof t.description==="string"))throw Error("Invalid glossary JSON structure");const errors=validateTerms(parsed as Term[]);if(errors.length)throw Error(errors.join("; "));onChange(parsed as Term[]);setError("");}catch(e){setError(e instanceof Error?e.message:"Invalid JSON");}}
 function loadPrompt(file:File){if(file.size>100000){setError("Text file too large");return;}void file.text().then(t=>{setDraft(t);setError("Text loaded for review. Convert to glossary JSON before saving. No automatic AI prompt execution.");});}
 return <section className="panel import"><h2>{ui[0]}</h2><p>Customize definitions and aliases per workspace. Example: EAC = Actual Cost + Estimate to Complete. Company-specific terms override labels only after review.</p>
 <label>{ui[1]} <input value={name} onChange={e=>setName(e.target.value)} placeholder="Company / team"/></label>
 <div className="termcards">{terms.filter(t=>["budget","actual","etc","forecast"].includes(t.key)).map(t=><div key={t.key}><strong>{t.label}</strong><small>{t.description}</small><small>{t.formula??""}</small></div>)}</div>
 <p>Edit JSON definitions and aliases below. Duplicate aliases across different metrics are rejected. This version saves locally in this browser only.</p><textarea rows={10} value={draft} onChange={e=>setDraft(e.target.value)} spellCheck={false}/>
 <div className="actions"><button className="primary" onClick={save}>{ui[2]}</button><button className="secondary" onClick={()=>{setDraft(JSON.stringify(standardTerms,null,2));setError("");}}>{ui[3]}</button></div>
 <p>Company AI prompt / glossary export: you may select a JSON glossary file to review here. This does not connect to any enterprise AI service.</p><input type="file" accept=".json,.txt" onChange={e=>{const f=e.target.files?.[0];if(f)loadPrompt(f);}}/>
 {error&&<p className="bad">{error}</p>}</section>;
}
