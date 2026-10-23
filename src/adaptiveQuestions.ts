import type {Dataset} from "./dataAdvisor";
export type LearningAnswer={id:string;value:string;sourceSignature:string;at:string};
export type AdaptiveQuestion={id:string;priority:number;reason:string;prompt:string;options:string[];suggested?:string};
const norm=(s:string)=>s.toLowerCase().replace(/[\s_-]/g,"");
export const signature=(data:Dataset[])=>data.map(d=>d.columns.map(norm).sort().join(",")).sort().join("|");
export function nextQuestions(data:Dataset[],answers:LearningAnswer[],level:"beginner"|"intermediate"|"advanced"="beginner"):AdaptiveQuestion[]{
 const answered=new Set(answers.filter(a=>a.sourceSignature===signature(data)).map(a=>a.id));
 const cols=data.flatMap(d=>d.columns.map(norm));const has=(patterns:string[])=>cols.some(c=>patterns.some(p=>c.includes(p)));
 const simple=level==="beginner";
 const q:AdaptiveQuestion[]=[];
 const add=(id:string,priority:number,reason:string,prompt:string,options:string[],suggested?:string)=>{if(!answered.has(id))q.push({id,priority,reason,prompt,options,suggested});};
 if(!data.length)add("sources",100,"No source tables have been uploaded",simple?"اطلاعات شما در چه فایل یا سیستمی است؟":"Which source systems contain the required datasets?",["Excel / CSV","SQL","SAP / Planview","I need help finding data"]);
 else{
 if(!has(["date","datum","month","period","تاریخ"]))add("date",85,"No obvious time column",simple?"برای گزارش ماهانه، تاریخ‌ها در کدام فایل هستند؟":"Identify the source and grain of reporting dates",["In another file","Not needed","Help me find it"]);
 if(!has(["projectid","projectcode","customerid","productid","شناسه"]))add("key",90,"No obvious business identifier",simple?"کدام ستون مشخص می‌کند دو ردیف مربوط به یک پروژه یا مورد هستند؟":"Choose the business entity identifier and verify grain",["Show my columns","Another table has it","Not sure"]);
 if(data.length>1)add("join",95,"Multiple datasets need relationship validation",simple?"این فایل‌ها چه چیزی را با هم مشترک دارند؟":"What business key links these sources?",["Same ID with different names","A mapping table exists","No common key","Not sure"]);
 const blanks=data.reduce((n,d)=>n+d.rows.filter(r=>d.columns.some(c=>r[c]===null||r[c]===undefined||String(r[c]).trim()==="")).length,0);
 if(blanks)add("missing",75,blanks+" rows contain at least one missing cell",simple?"بعضی خانه‌ها خالی هستند. چه کاری انجام دهیم؟":"Choose a missing-value policy for each affected column",["Show examples","Keep and flag","Ask me column by column"]);
 if(!has(["actual","budget","amount","quantity","cost","value","revenue","مبلغ","هزینه"]))add("measure",65,"No obvious numeric metric by column name",simple?"کدام ستون مقدار اصلی گزارش شماست؟":"Identify measures and units",["Show columns","Another file","Not sure"]);
 }
 return q.sort((a,b)=>b.priority-a.priority);
}
export function rememberAnswer(existing:LearningAnswer[],answer:LearningAnswer){return [...existing.filter(a=>!(a.id===answer.id&&a.sourceSignature===answer.sourceSignature)),answer];}
export function learnedSuggestions(answers:LearningAnswer[],data:Dataset[]){return answers.filter(a=>a.sourceSignature===signature(data));}
