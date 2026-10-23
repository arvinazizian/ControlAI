export type HeaderSuggestion={rowIndex:number;confidence:number;reasons:string[];previewHeaders:string[];ignoredLeadingRows:number[];needsReview:true};
const normalized=(x:string)=>x.trim().toLowerCase();
const looksNumeric=(x:string)=>x.trim()!==""&&Number.isFinite(Number(x.replace(/,/g,"")));
const looksDate=(x:string)=>/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(x.trim());
const generic=/^(project|project id|projectid|date|datum|budget|actual|forecast|cost|name|description|amount|quantity|department|category|status|id|code|تاریخ|پروژه|هزینه|بودجه)$/i;
export function suggestHeader(rows:string[][]):HeaderSuggestion|null{
 const candidates=rows.slice(0,Math.min(rows.length,12)).map((row,i)=>{
  const values=row.map(v=>v.trim()).filter(Boolean);const filled=values.length;const unique=new Set(values.map(normalized)).size;
  const width=Math.max(1,row.length);const text=values.filter(v=>!looksNumeric(v)&&!looksDate(v)).length;
  const known=values.filter(v=>generic.test(v)).length;
  const next=rows.slice(i+1,i+4).filter(r=>r.some(v=>v.trim()));
  const dataBelow=next.some(r=>r.some((v,j)=>values.length>1&&j<row.length&&v.trim()!==""&&(looksNumeric(v)||looksDate(v))));
  const score=filled<2?0:Math.min(1,0.2+0.22*(filled/width)+0.16*(unique/filled)+0.12*(text/filled)+Math.min(0.18,known*0.09)+(dataBelow?0.16:0));
  return{rowIndex:i,confidence:Number(score.toFixed(2)),reasons:[filled+" populated cells",unique===filled?"distinct labels":"repeated labels",known?"recognized field names":"field names not recognized",dataBelow?"typed values below candidate":"no typed values detected below"],previewHeaders:row.map((v,j)=>v.trim()||"Column "+(j+1)),ignoredLeadingRows:Array.from({length:i},(_,j)=>j),needsReview:true as const};
 }).sort((a,b)=>b.confidence-a.confidence);
 return candidates[0]?.confidence>=0.4?candidates[0]:null;
}
export type PreparationQuestion={id:string;title:string;description:string;options:string[];suggested:string;requiresApproval:true};
export function proposePreparation(rows:string[][]):PreparationQuestion[]{
 const questions:PreparationQuestion[]=[];const header=suggestHeader(rows);
 if(header)questions.push({id:"header",title:"Which row contains the column headers?",description:"Row "+(header.rowIndex+1)+" is a candidate ("+Math.round(header.confidence*100)+"% heuristic score). "+header.reasons.join("; ")+". Preview: "+header.previewHeaders.join(" | "),options:[...Array.from({length:Math.min(12,rows.length)},(_,i)=>"Row "+(i+1)),"Keep original headers"],suggested:"Row "+(header.rowIndex+1),requiresApproval:true});
 if(header&&header.rowIndex>0)questions.push({id:"leading",title:"What should happen to rows above the header?",description:header.ignoredLeadingRows.length+" leading rows may contain a report title, notes, or metadata. Keep the original file unchanged.",options:["Exclude from data table (retain in source)","Keep all rows","Review each row"],suggested:"Exclude from data table (retain in source)",requiresApproval:true});
 const blank=rows.filter(r=>r.every(v=>!v.trim())).length;
 if(blank)questions.push({id:"blank",title:"Should completely empty rows be excluded?",description:blank+" completely empty rows detected. This does not include partially empty records.",options:["Exclude from data table","Keep empty rows","Show examples"],suggested:"Exclude from data table",requiresApproval:true});
 const total=rows.map((r,i)=>({r,i})).filter(({r,i})=>i!==(header?.rowIndex??-1)&&r.some(v=>/^(grand total|subtotal|total|جمع کل|مجموع|totaal)$/i.test(v.trim())));
 if(total.length)questions.push({id:"totals",title:"Are summary or total rows part of the raw data?",description:total.length+" rows appear to contain total/subtotal labels. Including them in calculations may double count.",options:["Exclude summary rows from facts","Keep them as data","Review rows individually"],suggested:"Review rows individually",requiresApproval:true});
 return questions;
}
