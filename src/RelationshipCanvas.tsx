import {useEffect,useMemo,useRef,useState} from "react";
import type {Dataset} from "./dataAdvisor";
import type {Language} from "./i18n";
import type {RelationshipCandidate,ApprovedRelationship} from "./relationshipAdvisor";
type Position={x:number;y:number};
export default function RelationshipCanvas({datasets,relationships,approved,language,onSelect}:{datasets:Dataset[];relationships:RelationshipCandidate[];approved:Record<string,ApprovedRelationship>;language:Language;onSelect?:(id:string)=>void}){
 const fa=language==="fa";
 const [positions,setPositions]=useState<Record<string,Position>>({});
 const [active,setActive]=useState("");
 const drag=useRef<{id:string;startX:number;startY:number;x:number;y:number}|null>(null);
 const names=datasets.map(d=>d.name);
 const layout=useMemo(()=>Object.fromEntries(names.map((n,i)=>[n,{x:28+(i%3)*285,y:30+Math.floor(i/3)*350}])),[names.join("|")]);
 const pos=(n:string)=>positions[n]||layout[n]||{x:28,y:30};
 const width=Math.max(940,...names.map(n=>pos(n).x+280));
 const height=Math.max(440,Math.ceil(names.length/3)*350+40,...names.map(n=>pos(n).y+320));
 useEffect(()=>{const move=(e:PointerEvent)=>{const d=drag.current;if(!d)return;setPositions(old=>({...old,[d.id], [d.id]:{x:Math.max(0,d.x+e.clientX-d.startX),y:Math.max(0,d.y+e.clientY-d.startY)}}));};const up=()=>{drag.current=null;};window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);return()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);};},[]);
 function start(e:React.PointerEvent,id:string){const p=pos(id);drag.current={id,startX:e.clientX,startY:e.clientY,x:p.x,y:p.y};e.preventDefault();}
 return <div style={{margin:"16px 0 24px"}}>
 <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:10}}><h3 style={{margin:0}}>{fa?"نمای مدل ارتباطی":"Relationship model view"}</h3><button type="button" className="secondary" onClick={()=>setPositions({})}>{fa?"بازنشانی چیدمان":"Reset layout"}</button></div>
 <p style={{fontSize:13}}>{fa?"کارت‌ها را از سربرگ با انگشت یا ماوس جابه‌جا کن. روی خط بزن تا جزئیات رابطه را در پایین ببینی. ساخت رابطه جدید از فرم زیر انجام می‌شود.":"Drag cards by their headers. Select a line to inspect the relationship below. Create new links using the form below."}</p>
 <div style={{overflow:"auto",maxWidth:"100%",border:"1px solid #53627c",borderRadius:14,background:"#102036"}}>
 <div style={{position:"relative",width,height,minHeight:440}}>
 <svg width={width} height={height} style={{position:"absolute",inset:0,pointerEvents:"none"}} aria-label={fa?"خطوط ارتباط":"Relationship lines"}>
 {relationships.map(r=>{const a=pos(r.left),b=pos(r.right);const ax=a.x+118,ay=a.y+118,bx=b.x+118,by=b.y+118;const color=approved[r.id]?"#40d6a2":r.status==="unsafe"?"#f58585":"#83afff";return <g key={r.id}><path d={`M ${ax} ${ay} C ${(ax+bx)/2} ${ay}, ${(ax+bx)/2} ${by}, ${bx} ${by}`} fill="none" stroke={color} strokeWidth={active===r.id?5:3} strokeDasharray={approved[r.id]?undefined:"8 5"}/><circle cx={ax} cy={ay} r={11} fill="#102036" stroke={color}/><text x={ax} y={ay+4} fill={color} fontSize={12} textAnchor="middle">{r.leftUnique?"1":"*"}</text><circle cx={bx} cy={by} r={11} fill="#102036" stroke={color}/><text x={bx} y={by+4} fill={color} fontSize={12} textAnchor="middle">{r.rightUnique?"1":"*"}</text></g>})}
 </svg>
 {relationships.map(r=>{const a=pos(r.left),b=pos(r.right);const mx=(a.x+b.x)/2+118,my=(a.y+b.y)/2+118;return <button type="button" key={r.id} title={r.leftColumn+" ↔ "+r.rightColumn} onClick={()=>{setActive(r.id);onSelect?.(r.id);}} style={{position:"absolute",left:mx-12,top:my-12,width:25,height:25,borderRadius:20,border:"1px solid #9ca9c0",background:active===r.id?"#436cb2":"#203650",color:"white",cursor:"pointer",zIndex:2}}>↔</button>})}
 {datasets.map(d=>{const p=pos(d.name);return <div key={d.name} style={{position:"absolute",left:p.x,top:p.y,width:236,background:"#1b2d47",border:"1px solid #6a82a6",borderRadius:9,boxShadow:"0 6px 14px #0004",overflow:"hidden",zIndex:3}}>
 <div onPointerDown={e=>start(e,d.name)} style={{padding:"10px 12px",background:"#315078",fontWeight:700,cursor:"grab",touchAction:"none",userSelect:"none",overflowWrap:"anywhere"}}>⠿ {d.name}</div>
 <div style={{padding:"5px 10px",fontSize:12,opacity:.8}}>{d.rows.length} {fa?"ردیف":"rows"}</div>
 <div style={{maxHeight:210,overflowY:"auto"}}>{d.columns.map(col=><div key={col} style={{borderTop:"1px solid #364b67",padding:"6px 10px",fontSize:13,overflowWrap:"anywhere"}}>{relationships.some(r=>(r.left===d.name&&r.leftColumn===col)||(r.right===d.name&&r.rightColumn===col))?"🔑 ":""}{col}</div>)}</div>
 </div>})}
 </div></div>
 <p style={{fontSize:12,marginTop:8}}><span style={{color:"#40d6a2"}}>●</span> {fa?"تأییدشده":"Approved"}　<span style={{color:"#83afff"}}>●</span> {fa?"پیشنهادی":"Suggested"}　<span style={{color:"#f58585"}}>●</span> {fa?"ناامن":"Unsafe"}</p>
 </div>;
}
