import type {Dataset} from "./dataAdvisor";
export type CleaningPlan={column:string;action:"trim"|"drop_empty"|"deduplicate";key?:string};
export type CleaningPreview={before:number;after:number;removed:number;changedCells:number;sample:Record<string,unknown>[];result:Dataset};
const missing=(v:unknown)=>v===null||v===undefined||String(v).trim()==="";
export function previewCleaning(input:Dataset,plan:CleaningPlan):CleaningPreview{
 if(!input.columns.includes(plan.column))throw Error("Unknown column");
 if(!["trim","drop_empty","deduplicate"].includes(plan.action))throw Error("Unsupported cleaning action");
 const rows=input.rows.map(row=>({...row}));let changedCells=0;
 if(plan.action==="trim"){for(const row of rows){const v=row[plan.column];if(typeof v==="string"&&v!==v.trim()){row[plan.column]=v.trim();changedCells++;}}}
 let result=rows;
 if(plan.action==="drop_empty")result=rows.filter(r=>!missing(r[plan.column]));
 if(plan.action==="deduplicate"){if(rows.some(r=>missing(r[plan.column])))throw Error("Deduplication requires a non-empty key; choose how to handle missing keys first");const seen=new Set<string>();result=rows.filter(r=>{const key=String(r[plan.column]);if(seen.has(key))return false;seen.add(key);return true;});}
 return{before:rows.length,after:result.length,removed:rows.length-result.length,changedCells,sample:result.slice(0,5),result:{...input,rows:result}};
}
