import {useEffect,useMemo,useState} from "react";
import type {Language} from "./i18n";
type Goal="cost"|"schedule"|"sales"|"inventory"|"executive"|"other";
type Question={id:string;title:string;options:{id:string;label:string}[];multi?:boolean};
const goals:Goal[]=["cost","schedule","sales","inventory","executive","other"];
const dictionary={
 fa:{hello:"سلام! 👋 من دستیار ControlAI هستم.",intro:"می‌توانم برایت گزارش و داشبورد بسازم، فایل‌ها را بررسی کنم و ارتباط داده‌ها را پیدا کنم. اول بگو چه کاری می‌خواهی انجام دهی؟",next:"ادامه",back:"سؤال قبل",reset:"شروع دوباره",custom:"یا پاسخ خودت را بنویس…",send:"ارسال",choose:"می‌توانی چند گزینه را انتخاب کنی.",done:"خوب است. حالا برای ساخت گزارش، داده‌هایت را وارد کن.",open:"رفتن به ورود داده و ساخت گزارش",goal:["گزارش هزینه و بودجه","گزارش زمان‌بندی","گزارش فروش","گزارش موجودی","داشبورد مدیریتی","کار دیگری دارم"],source:["فایل Excel یا CSV دارم","داده‌ها در سیستم یا پایگاه داده‌اند","فعلاً داده‌ای ندارم"],detail:["نمودار و داشبورد","جدول و خروجی گزارش","هر دو"],frequency:["یک گزارش برای همین حالا","گزارش دوره‌ای و قابل به‌روزرسانی"],other:"هدفت را با چند کلمه توضیح بده.",reply:"متوجه شدم:",pending:"این راهنما فعلاً بر اساس پاسخ‌ها سؤال بعدی را انتخاب می‌کند؛ تولید سؤال با مدل AI هنوز فعال و تأیید نشده است."},
 en:{hello:"Hi! 👋 I'm your ControlAI assistant.",intro:"I can help build reports and dashboards, inspect files and discover data relationships. What would you like to do?",next:"Continue",back:"Previous question",reset:"Start over",custom:"Or type your own answer…",send:"Send",choose:"You can choose more than one.",done:"Great. Next, bring in your data to build a report.",open:"Open data import and report builder",goal:["Cost and budget report","Schedule report","Sales report","Inventory report","Executive dashboard","Something else"],source:["I have Excel or CSV files","My data is in a system or database","I don't have data yet"],detail:["Charts and dashboard","Table and export","Both"],frequency:["One report now","Recurring, refreshable report"],other:"Describe what you want in a few words.",reply:"Got it:",pending:"Questions currently adapt using rules. AI-model-generated follow-ups are not yet enabled or verified."}
} as const;
export default function ChatOnboarding({language,onOpenWorkspace}:{language:Language;onOpenWorkspace:()=>void}){
 const ui=language==="fa"?dictionary.fa:dictionary.en;
 const [step,setStep]=useState(0),[selected,setSelected]=useState<string[]>([]),[free,setFree]=useState(""),[answers,setAnswers]=useState<Record<string,string[]>>({});
 const [visible,setVisible]=useState(0);
 const questions=useMemo<Question[]>(()=>{
  const first:Question={id:"goal",title:language==="fa"?"چه نوع گزارشی می‌خواهی بسازی؟":"What kind of report do you want to create?",multi:true,options:goals.map((id,i)=>({id,label:ui.goal[i]}))};
  const picked=answers.goal||[];
  const second:Question={id:"source",title:language==="fa"?"اطلاعات مورد نیازت الان کجاست؟":"Where is your data right now?",options:ui.source.map((label,i)=>({id:["file","system","none"][i],label}))};
  const specific=picked.includes("schedule")?(language==="fa"?"در گزارش زمان‌بندی بیشتر چه چیزی مهم است؟":"What matters most for the schedule report?"):picked.includes("cost")?(language==="fa"?"برای گزارش هزینه چه چیزی را می‌خواهی مقایسه کنی؟":"What should the cost report compare?"):language==="fa"?"خروجی را در چه شکلی می‌خواهی؟":"What output format do you prefer?";
  const third:Question={id:"detail",title:specific,options:picked.includes("schedule")?[{id:"milestones",label:language==="fa"?"تأخیرها و نقاط عطف":"Delays and milestones"},{id:"baseline",label:language==="fa"?"برنامه اولیه در برابر عملکرد واقعی":"Baseline versus actual"},{id:"both",label:ui.detail[2]}]:picked.includes("cost")?[{id:"budget",label:language==="fa"?"بودجه در برابر هزینه واقعی":"Budget versus actual"},{id:"forecast",label:language==="fa"?"پیش‌بینی هزینه نهایی":"Forecast at completion"},{id:"both",label:ui.detail[2]}]:ui.detail.map((label,i)=>({id:["chart","table","both"][i],label}))};
  const fourth:Question={id:"frequency",title:language==="fa"?"گزارش را چند وقت یک‌بار نیاز داری؟":"How often do you need this report?",options:ui.frequency.map((label,i)=>({id:["once","recurring"][i],label}))};
  return [first,...(picked.includes("other")?[{id:"other",title:ui.other,options:[]}]:[]),second,third,fourth];
 },[answers.goal,language]);
 const question=questions[step];const finished=step>=questions.length;
 const message=step===0?ui.intro:finished?ui.done:question.title;
 useEffect(()=>{setVisible(0);const interval=setInterval(()=>setVisible(n=>Math.min(message.length,n+2)),18);return()=>clearInterval(interval);},[message]);
 function submit(){if(!question)return;const values=[...selected,...(free.trim()?[free.trim()]:[])];if(!values.length)return;setAnswers(old=>({...old,[question.id]:values}));setSelected([]);setFree("");setStep(n=>n+1);}
 function previous(){if(step===0)return;const prev=questions[step-1];setStep(n=>n-1);setSelected(answers[prev?.id]||[]);setFree("");}
 return <div className="chat-app" dir={language==="fa"||language==="ar"?"rtl":"ltr"}>
  <header className="chat-top"><div className="chat-logo"><span>✦</span> ControlAI</div><div className="chat-top-actions"><select aria-label="Language" value={language} disabled title="Language is configured in workspace"><option value={language}>{language.toUpperCase()}</option></select><button className="chat-subtle" onClick={()=>{setStep(0);setAnswers({});setSelected([]);setFree("");}}>{ui.reset}</button></div></header>
  <main className="chat-center"><div className="chat-avatar">✦</div><h1>{ui.hello}</h1><p className="chat-message" aria-live="polite">{message.slice(0,visible)}<span className="chat-cursor" aria-hidden="true">▍</span></p>
   {!finished&&question&&<div className="chat-choice-area" key={question.id}>
    {question.multi&&<p className="chat-hint">{ui.choose}</p>}
    <div className="chat-choices">{question.options.map(o=><label className={"chat-choice "+(selected.includes(o.id)?"chosen":"")} key={o.id}><input type={question.multi?"checkbox":"radio"} name={question.id} checked={selected.includes(o.id)} onChange={()=>setSelected(old=>question.multi?(old.includes(o.id)?old.filter(x=>x!==o.id):[...old,o.id]):[o.id])}/><span>{o.label}</span></label>)}</div>
    <div className="chat-compose"><input value={free} onChange={e=>setFree(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")submit();}} placeholder={ui.custom} aria-label={ui.custom}/><button className="chat-send" onClick={submit} disabled={!selected.length&&!free.trim()}>{ui.next} →</button></div>
   </div>}
   {finished&&<div className="chat-finish"><div className="chat-summary">{Object.entries(answers).map(([id,values])=><p key={id}><strong>{id}:</strong> {values.map(v=>questions.find(q=>q.id===id)?.options.find(o=>o.id===v)?.label||v).join("، ")}</p>)}</div><button className="chat-send" onClick={onOpenWorkspace}>{ui.open} →</button></div>}
   {step>0&&<button className="chat-subtle chat-back" onClick={previous}>← {ui.back}</button>}
   <p className="chat-disclaimer">{ui.pending}</p>
  </main>
 </div>;
}
