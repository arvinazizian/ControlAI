import {useMemo,useState} from "react";
import ReactECharts from "echarts-for-react";
import type {Dataset} from "./dataAdvisor";
import type {Language} from "./i18n";
import type {ConversationAnswers} from "./ChatOnboarding";

type Measure={name:string;column:string};
export type ReportResult={table:string;dimension:string;measures:Measure[];groups:{label:string;values:number[]}[];rowsUsed:number;rowsSkipped:number};
export function buildReport(table:Dataset,dimension:string,measures:Measure[]):ReportResult{
 if(!table.columns.includes(dimension)||!measures.length||measures.some(m=>!table.columns.includes(m.column)))throw Error("Choose valid columns");
 if(measures.some(m=>m.column===dimension))throw Error("Dimension and measure columns must differ");
 const grouped=new Map<string,number[]>();let rowsUsed=0,rowsSkipped=0;
 for(const row of table.rows){
  const key=String(row[dimension]??"").trim();
  const numbers=measures.map(m=>{const raw=row[m.column];if(raw===null||raw===undefined||String(raw).trim()==="")return NaN;const n=typeof raw==="number"?raw:Number(String(raw).trim());return Number.isFinite(n)?n:NaN;});
  if(!key||numbers.some(n=>!Number.isFinite(n))){rowsSkipped++;continue;}
  if(!grouped.has(key))grouped.set(key,measures.map(()=>0));
  const totals=grouped.get(key)!;numbers.forEach((n,i)=>totals[i]+=n);rowsUsed++;
 }
 if(!rowsUsed)throw Error("No valid numeric rows available for these columns");
 return {table:table.name,dimension,measures,groups:Array.from(grouped,([label,values])=>({label,values})),rowsUsed,rowsSkipped};
}
const norm=(s:string)=>s.toLowerCase().replace(/[\s_\-]/g,"");
const patterns:Record<string,string[]>={cost:["budget","actual","forecast","cost","bac","eac"],sales:["sales","revenue","amount"],inventory:["stock","qty","quantity"],executive:["budget","actual","revenue","amount"],schedule:["delay","duration","days"]};
export default function RealReportBuilder({datasets,answers,language}:{datasets:Dataset[];answers:ConversationAnswers;language:Language}){
 const fa=language==="fa";const [tableName,setTableName]=useState("");const [dimension,setDimension]=useState("");const [measureColumns,setMeasureColumns]=useState<string[]>([]);const [approved,setApproved]=useState(false);
 const table=datasets.find(d=>d.name===tableName)||datasets[0];const goal=answers.goal?.[0]||"executive";
 const candidates=useMemo(()=>table?.columns.filter(c=>(patterns[goal]||[]).some(p=>norm(c).includes(p)))||[],[table,goal]);
 const dimensionValue=dimension&&table?.columns.includes(dimension)?dimension:"";
 const selectedMeasures=measureColumns.filter(c=>table?.columns.includes(c)&&c!==dimensionValue);
 const report=useMemo(()=>{if(!approved||!table||!dimensionValue||!selectedMeasures.length)return null;try{return {data:buildReport(table,dimensionValue,selectedMeasures.map(c=>({name:c,column:c}))),error:""};}catch(e){return {data:null,error:e instanceof Error?e.message:String(e)};}},[approved,table,dimensionValue,selectedMeasures.join("|")]);
 const option=report?.data?{tooltip:{trigger:"axis"},legend:{top:0,textStyle:{color:"#c8d5e8"}},grid:{top:55,left:55,right:20,bottom:65,containLabel:true},xAxis:{type:"category",data:report.data.groups.map(g=>g.label),axisLabel:{color:"#c8d5e8",rotate:report.data.groups.length>6?35:0}},yAxis:{type:"value",axisLabel:{color:"#c8d5e8"}},series:report.data.measures.map((m,i)=>({name:m.name,type:"bar",data:report.data!.groups.map(g=>g.values[i])}))}:null;
 function exportCsv(){if(!report?.data)return;const lines=[[report.data.dimension,...report.data.measures.map(m=>m.name)],...report.data.groups.map(g=>[g.label,...g.values.map(String)])];const csv=lines.map(r=>r.map(x=>'"'+x.replace(/"/g,'""')+'"').join(",")).join("\r\n");const url=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="controlai-report.csv";a.click();URL.revokeObjectURL(url);}
 return <section className="panel import"><h2>{fa?"ساخت گزارش واقعی":"Build report from actual data"}</h2>
 {!datasets.length?<p>{fa?"برای ساخت گزارش ابتدا داده وارد کن. نمودار نمونه به‌جای داده واقعی نمایش داده نمی‌شود.":"Import data first. Sample charts are not substituted for your actual data."}</p>:<>
 <p>{fa?"ابتدا یک جدول و ستون دسته‌بندی را انتخاب کن. مقادیر عددی در همان جدول جمع می‌شوند؛ اتصال خودکار جدول‌ها هنوز انجام نمی‌شود.":"Select one table, a grouping column and numeric measures. This sums values in one table; automatic joins are not supported yet."}</p>
 <label>{fa?"جدول":"Table"}<select value={table?.name||""} onChange={e=>{setTableName(e.target.value);setDimension("");setMeasureColumns([]);setApproved(false);}}>{datasets.map((d,i)=><option key={i} value={d.name}>{d.name} ({d.rows.length})</option>)}</select></label>
 <label>{fa?"گروه‌بندی بر اساس":"Group by"}<select value={dimensionValue} onChange={e=>{setDimension(e.target.value);setApproved(false);}}><option value="">{fa?"انتخاب ستون":"Choose column"}</option>{table?.columns.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
 <strong>{fa?"ستون‌های عددی برای محاسبه":"Numeric measures"}</strong>
 <p>{fa?"پیشنهاد براساس هدف گفت‌وگو: ":"Suggested from your conversation goal: "}{candidates.join("، ")||"—"}</p>
 <div className="wizard-options">{table?.columns.filter(c=>c!==dimensionValue).map(c=><label className="wizard-option" key={c}><input type="checkbox" checked={selectedMeasures.includes(c)} onChange={e=>{setMeasureColumns(old=>e.target.checked?[...old,c]:old.filter(x=>x!==c));setApproved(false);}}/>{c}</label>)}</div>
 <button className="primary" disabled={!dimensionValue||!selectedMeasures.length} onClick={()=>setApproved(true)}>{fa?"تأیید ستون‌ها و ساخت نمودار":"Confirm columns and build chart"}</button>
 {report?.error&&<p role="alert" className="bad">{report.error}</p>}
 {report?.data&&<><p role="status">{fa?"ردیف‌های معتبر":"Valid rows"}: {report.data.rowsUsed} · {fa?"ردیف‌های کنارگذاشته‌شده":"Skipped rows"}: {report.data.rowsSkipped}</p>{report.data.rowsSkipped>0&&<p className="bad">{fa?"ردیف‌های دارای مقدار خالی یا غیرعددی در محاسبات وارد نشده‌اند.":"Rows with missing or nonnumeric values were excluded."}</p>}
 {report.data.groups.length>100?<p>{fa?"تعداد گروه‌ها زیاد است؛ خروجی CSV را بررسی کن.":"Too many groups for a readable chart; use the CSV export."}</p>:<ReactECharts option={option} style={{height:390,width:"100%"}}/>}
 <div style={{overflowX:"auto"}}><table><thead><tr><th>{report.data.dimension}</th>{report.data.measures.map(m=><th key={m.column}>{m.name}</th>)}</tr></thead><tbody>{report.data.groups.slice(0,100).map(g=><tr key={g.label}><td>{g.label}</td>{g.values.map((v,i)=><td key={i}>{v.toLocaleString()}</td>)}</tr>)}</tbody></table></div>
 <button className="secondary" onClick={exportCsv}>{fa?"دریافت CSV گزارش":"Export report CSV"}</button></>}
 </>}
 </section>;
}
