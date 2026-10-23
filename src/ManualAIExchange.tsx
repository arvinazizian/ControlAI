import { useState } from "react";
import type { Term } from "./terminology";
import type { Language } from "./i18n";

export type VisualChange = { metric?: "forecast"|"actual"; direction?: "horizontal"|"vertical"; palette?: "ocean"|"emerald"|"violet"; showLabels?: boolean; sort?: "name"|"variance" };
const allowed = ["metric","direction","palette","showLabels","sort"];
function parseResponse(raw:string):VisualChange {
 const parsed:unknown=JSON.parse(raw);
 if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw Error("Response must be a JSON object");
 const p=parsed as Record<string,unknown>;
 if(Object.keys(p).some(k=>!allowed.includes(k)))throw Error("Unexpected property: "+Object.keys(p).filter(k=>!allowed.includes(k)).join(", "));
 if(!Object.keys(p).length)throw Error("Response has no changes");
 if(p.metric!==undefined&&!["forecast","actual"].includes(String(p.metric)))throw Error("Invalid metric");
 if(p.direction!==undefined&&!["horizontal","vertical"].includes(String(p.direction)))throw Error("Invalid direction");
 if(p.palette!==undefined&&!["ocean","emerald","violet"].includes(String(p.palette)))throw Error("Invalid palette");
 if(p.sort!==undefined&&!["name","variance"].includes(String(p.sort)))throw Error("Invalid sort");
 if(p.showLabels!==undefined&&typeof p.showLabels!=="boolean")throw Error("showLabels must be boolean");
 return p as VisualChange;
}
type Props={terms:Term[];language:Language;onApply:(change:VisualChange)=>void};
export default function ManualAIExchange({terms,language,onApply}:Props){
 const labels={"en":["Manual AI exchange — Copy / Paste","Copy prompt","Validate and apply response"],"nl":["Handmatige AI-uitwisseling","Prompt kopiëren","Antwoord controleren en toepassen"],"fa":["ارتباط دستی با هوش مصنوعی","کپی پرامپت","بررسی و اعمال پاسخ"],"ar":["تبادل يدوي مع الذكاء الاصطناعي","نسخ الطلب","التحقق من الاستجابة وتطبيقها"],"tr":["Manuel AI alışverişi","İstemi kopyala","Yanıtı doğrula ve uygula"]};
 const ui=labels[language];
 const [request,setRequest]=useState("Compare Budget with EAC. Make the bars horizontal and sort by variance.");
 const [response,setResponse]=useState("");
 const [message,setMessage]=useState("");
 const glossary=terms.filter(t=>["budget","forecast","actual","etc","vac"].includes(t.key)).map(t=>({key:t.key,label:t.label,definition:t.description,formula:t.formula}));
 const outgoing=JSON.stringify({task:"Convert the user's request into chart settings for ControlAI. Return only a JSON object with supported fields. Do not invent data or calculate financial metrics.",userRequest:request,companyTerminology:glossary,allowedFields:{metric:["forecast","actual"],direction:["horizontal","vertical"],palette:["ocean","emerald","violet"],sort:["name","variance"],showLabels:"boolean"},exampleResponse:{metric:"forecast",direction:"horizontal",sort:"variance"}},null,2);
 async function copy(){try{await navigator.clipboard.writeText(outgoing);setMessage("Prompt copied. Paste it into an approved AI service.");}catch{setMessage("Clipboard unavailable. Select and copy the prompt text manually.");}}
 function apply(){try{const change=parseResponse(response.trim().replace(/^\x60{3}(?:json)?\s*/i,"").replace(/\s*\x60{3}$/,""));onApply(change);setMessage("Validated changes applied to the chart.");}catch(e){setMessage(e instanceof Error?e.message:"Invalid response");}}
 return <section className="panel import"><h2>{ui[0]}</h2><p>Use this when a company GPT or Copilot has no approved API connection. No automatic requests are sent.</p>
 <label>1. What should AI do?<textarea rows={3} value={request} onChange={e=>setRequest(e.target.value)}/></label>
 <label>2. Copy this prompt to your approved company AI<textarea rows={10} readOnly value={outgoing}/></label>
 <div className="actions"><button className="primary" onClick={()=>void copy()}>{ui[1]}</button></div>
 <label>3. Paste the AI response here (JSON only)<textarea rows={6} value={response} onChange={e=>setResponse(e.target.value)} placeholder={'{"metric":"forecast","direction":"horizontal","sort":"variance"}'}/></label>
 <div className="actions"><button className="primary" onClick={apply}>{ui[2]}</button><button className="secondary" onClick={()=>setResponse("")}>Clear response</button></div>
 {message&&<p className="notice" role="status">{message}</p>}
 <p><strong>Privacy:</strong> Review prompt content before copying it to an external service. Do not transfer company data without authorization. Only supported visual settings can be applied; code, SQL and dataset modifications are rejected.</p>
 </section>;
}
