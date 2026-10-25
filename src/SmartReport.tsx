import {useMemo,useState} from "react";
import ReactECharts from "echarts-for-react";
import type {Dataset} from "./dataAdvisor";
import type {Language} from "./i18n";
import {sampleProjects} from "./data";

const demo:Dataset={name:"Sample projects (EUR millions)",columns:["Project","Budget","Forecast","Actual"],rows:sampleProjects.map(p=>({Project:p.name,Budget:p.budget,Forecast:p.forecast,Actual:p.actual}))};
const number=(v:unknown):number|null=>{if(typeof v==="number")return Number.isFinite(v)?v:null;if(v==null)return null;let s=String(v).trim().replace(/\s/g,"");if(!s)return null;if(/^[-+]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s))s=s.replace(/,/g,"");else if(/^[-+]?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s))s=s.replace(/\./g,"").replace(",",".");else if(/^[-+]?\d+,\d+$/.test(s))s=s.replace(",",".");const n=Number(s);return Number.isFinite(n)?n:null;};
export default function SmartReport({datasets,language,reportOnly=false}:{datasets:Dataset[];language:Language;reportOnly?:boolean}){
 const fa=language==="fa";const available=datasets.length?datasets:[demo];
 const [source,setSource]=useState("");const [dimension,setDimension]=useState("");const [measure,setMeasure]=useState("");const [chart,setChart]=useState<"bar"|"line">("bar");
 const table=available.find(d=>d.name===source)||available[0];
 const profile=useMemo(()=>{const numeric=table.columns.filter(c=>table.rows.length>0&&table.rows.filter(r=>number(r[c])!==null).length/table.rows.length>=.6);const dimensions=table.columns.filter(c=>!numeric.includes(c));return {numeric,dimensions};},[table]);
 const x=table.columns.includes(dimension)?dimension:profile.dimensions[0]||table.columns[0];
 const y=profile.numeric.includes(measure)?measure:profile.numeric[0];
 const groups=useMemo(()=>{const map=new Map<string,{sum:number,count:number}>();if(!x||!y)return [];for(const row of table.rows){const key=String(row[x]??"").trim(),value=number(row[y]);if(!key||value===null)continue;const v=map.get(key)||{sum:0,count:0};v.sum+=value;v.count++;map.set(key,v);}return [...map].slice(0,40).map(([name,v])=>({name,value:v.sum}));},[table,x,y]);
 const option={backgroundColor:"transparent",tooltip:{trigger:"axis"},grid:{left:55,right:20,top:30,bottom:70,containLabel:true},xAxis:{type:"category",data:groups.map(g=>g.name),axisLabel:{color:"#b8c7dd",rotate:groups.length>7?35:0}},yAxis:{type:"value",axisLabel:{color:"#b8c7dd"}},series:[{name:y,type:chart,data:groups.map(g=>g.value),smooth:true}]};
 return <section className="panel import" aria-label="Smart report">
 {!reportOnly&&<><h2>✦ {fa?"تحلیل خودکار داده‌ها":"Automatic data analysis"}</h2><p>{fa?"ستون‌ها شناسایی شدند و پیش‌نمایش گزارش همزمان با تغییرات به‌روز می‌شود.":"Fields detected automatically; the preview updates as you edit."}</p>
 <div style={{display:"flex",gap:12,flexWrap:"wrap"}}><label>{fa?"منبع داده":"Source"}<select value={table.name} onChange={e=>{setSource(e.target.value);setDimension("");setMeasure("");}}>{available.map(d=><option key={d.name} value={d.name}>{d.name}</option>)}</select></label><label>{fa?"گروه‌بندی":"Group"}<select value={x} onChange={e=>setDimension(e.target.value)}>{table.columns.filter(c=>c!==y).map(c=><option key={c}>{c}</option>)}</select></label><label>{fa?"مقدار عددی":"Measure"}<select value={y||""} onChange={e=>setMeasure(e.target.value)}>{profile.numeric.map(c=><option key={c}>{c}</option>)}</select></label><label>{fa?"نمودار":"Visual"}<select value={chart} onChange={e=>setChart(e.target.value as "bar"|"line")}><option value="bar">{fa?"ستونی":"Bar"}</option><option value="line">{fa?"خطی":"Line"}</option></select></label></div>
 <p style={{opacity:.8}}>{table.rows.length} {fa?"ردیف":"rows"} · {profile.numeric.length} {fa?"ستون عددی":"numeric fields"} · {datasets.length===0?(fa?"داده نمونه":"Demo data"):(fa?"داده واردشده":"Imported data")}</p></>}
 {y&&groups.length?<><h2>{y} / {x}</h2><ReactECharts option={option} style={{height:350,width:"100%"}} notMerge={true}/><div style={{display:"flex",gap:12,flexWrap:"wrap"}}><strong>{fa?"جمع":"Total"}: {groups.reduce((s,g)=>s+g.value,0).toLocaleString()}</strong><span>{groups.length} {fa?"گروه":"groups"}</span></div>{!reportOnly&&<div style={{overflowX:"auto",maxHeight:240,overflowY:"auto"}}><table><thead><tr><th>{x}</th><th>{y}</th></tr></thead><tbody>{groups.map(g=><tr key={g.name}><td>{g.name}</td><td>{g.value.toLocaleString()}</td></tr>)}</tbody></table></div>}</>:<p role="status">{fa?"ستون عددی قابل‌اعتماد پیدا نشد؛ داده یا ستون دیگری انتخاب کنید.":"No reliable numeric field detected; choose another source."}</p>}
 </section>;
}