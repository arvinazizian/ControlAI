import { useState } from "react";
import type { Language } from "./i18n";
import ExcelJS from "exceljs";
import { resolveTerm, type Term } from "./terminology";
import type { Project } from "./data";
type Field = "id"|"name"|"budget"|"forecast"|"actual";
const fields: Field[]=["id","name","budget","forecast","actual"];
const defaults:Record<Field,string[]>={id:["id","project id","project_id","project code","wbs"],name:["name","project","project name","project_name"],budget:["budget","bac"],forecast:["forecast","eac","fac"],actual:["actual","actuals","ac"]};
type Props={terms:Term[];language?:Language;onImport:(projects:Project[])=>void};
function toNumber(value:unknown):number {if(typeof value==="number")return value;if(typeof value==="string"){const cleaned=value.trim().replace(/\s/g,"");const normalized=cleaned.includes(",")&&!cleaned.includes(".")?cleaned.replace(",","."):cleaned.replace(/,/g,"");return Number(normalized);}return NaN;}
function cellValue(value:ExcelJS.CellValue):string|number {if(value===null||value===undefined)return "";if(typeof value==="string"||typeof value==="number")return value;if(value instanceof Date)return value.toISOString();if("result" in value)return cellValue(value.result as ExcelJS.CellValue);if("text" in value)return value.text;if("richText" in value)return value.richText.map(t=>t.text).join("");return "";}
export default function ExcelImport({terms,language="en",onImport}:Props){
 const labels={"en":["Excel import & column mapping","Worksheet","Header row","Input cost units","Select column","Use mapped data in chart"],"nl":["Excel importeren en kolommen koppelen","Werkblad","Koprij","Eenheid van kosten","Selecteer kolom","Gegevens in grafiek gebruiken"],"fa":["ورود اکسل و تطبیق ستون‌ها","برگه اکسل","ردیف عنوان‌ها","واحد هزینه","انتخاب ستون","نمایش داده‌ها در نمودار"],"ar":["استيراد Excel وربط الأعمدة","ورقة العمل","صف العناوين","وحدة التكلفة","اختر العمود","استخدام البيانات في الرسم"],"tr":["Excel içe aktar ve sütun eşleştir","Çalışma sayfası","Başlık satırı","Maliyet birimi","Sütun seç","Verileri grafikte kullan"]};
 const ui=labels[language];
 const [sheets,setSheets]=useState<{name:string;rows:(string|number)[][]}[]>([]);
 const [sheet,setSheet]=useState(0);const [headerRow,setHeaderRow]=useState(1);
 const [mapping,setMapping]=useState<Record<Field,string>>({id:"",name:"",budget:"",forecast:"",actual:""});
 const [error,setError]=useState("");const [unit,setUnit]=useState("1");
 const current=sheets[sheet];const headers=(current?.rows[headerRow-1]??[]).map((h,i)=>({value:String(i),label:String(h||"Column "+(i+1))}));
 function guess(rows:(string|number)[][],header:number):Record<Field,string>{
  const h=rows[header-1]??[];const result={} as Record<Field,string>;
  for(const field of fields){const candidates=[...defaults[field],...terms.filter(t=>t.key===field).flatMap(t=>[t.label,...t.aliases])];const found=h.findIndex(x=>candidates.some(a=>a.toLowerCase().replace(/[\s_-]/g,"")===String(x).toLowerCase().replace(/[\s_-]/g,""))||(resolveTerm(String(x),terms)===field));result[field]=found>=0?String(found):"";}return result;
 }
 async function upload(file:File){
  setError("");if(file.size>5*1024*1024){setError("File exceeds 5 MB prototype limit");return;}
  try{const workbook=new ExcelJS.Workbook();await workbook.xlsx.load(await file.arrayBuffer() as never);
   const loaded=workbook.worksheets.map(ws=>({name:ws.name,rows:Array.from({length:Math.min(ws.rowCount,5001)},(_,i)=>{const r=ws.getRow(i+1);return Array.from({length:Math.min(ws.columnCount,100)},(_,j)=>cellValue(r.getCell(j+1).value));})})).filter(s=>s.rows.length>0);
   if(!loaded.length)throw Error("No worksheets with data");setSheets(loaded);setSheet(0);setHeaderRow(1);setMapping(guess(loaded[0].rows,1));
  }catch(e){setError(e instanceof Error?e.message:"Could not read XLSX");}
 }
 function importData(){if(!current)return;const chosen=fields.map(f=>mapping[f]);if(chosen.some(v=>v==="")||new Set(chosen).size!==chosen.length){setError("Map all five fields to different columns");return;}
  const multiplier=Number(unit);const result:Project[]=[];for(let i=headerRow;i<current.rows.length;i++){const row=current.rows[i];if(row.every(v=>String(v).trim()===""))continue;
   const get=(field:Field)=>row[Number(mapping[field])];const budget=toNumber(get("budget"))/multiplier,forecast=toNumber(get("forecast"))/multiplier,actual=toNumber(get("actual"))/multiplier;
   if(!String(get("name")??"").trim()||![budget,forecast,actual].every(Number.isFinite)){setError("Invalid row "+(i+1)+": missing project or non-numeric cost");return;}
   result.push({id:String(get("id")??"").trim()||"row-"+i,name:String(get("name")),budget,forecast,actual});
  }if(!result.length){setError("No data rows found");return;}onImport(result);setError("");}
 return <section className="panel import"><h2>{ui[0]}</h2><p>Load XLSX locally in your browser. No file is uploaded to a server. Maximum 5 MB / 5,000 rows per sheet.</p><input type="file" accept=".xlsx" onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f);}}/>
 {current&&<><div className="formgrid"><label>{ui[1]}<select value={sheet} onChange={e=>{const n=Number(e.target.value);setSheet(n);setHeaderRow(1);setMapping(guess(sheets[n].rows,1));}}>{sheets.map((s,i)=><option key={i} value={i}>{s.name}</option>)}</select></label><label>{ui[2]}<select value={headerRow} onChange={e=>{const n=Number(e.target.value);setHeaderRow(n);setMapping(guess(current.rows,n));}}>{current.rows.slice(0,Math.min(10,current.rows.length)).map((_,i)=><option key={i} value={i+1}>Row {i+1}</option>)}</select></label><label>{ui[3]}<select value={unit} onChange={e=>setUnit(e.target.value)}><option value="1">EUR millions</option><option value="1000">EUR thousands</option><option value="1000000">EUR</option></select></label></div>
 <div className="formgrid">{fields.map(field=><label key={field}>{field.toUpperCase()}{field==="forecast"?" (EAC)":""}<select value={mapping[field]} onChange={e=>setMapping(m=>({...m,[field]:e.target.value}))}><option value="">{ui[4]}</option>{headers.map(h=><option key={h.value} value={h.value}>{h.label}</option>)}</select></label>)}</div><p>Preview: {current.rows.slice(headerRow,headerRow+3).map(row=>row.slice(0,6).join(" | ")).join(" · ")}</p><button className="primary" onClick={importData}>{ui[5]}</button></>}
 {error&&<p className="bad">{error}</p>}</section>;
}
