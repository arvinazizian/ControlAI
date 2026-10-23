import type {Dataset} from "./dataAdvisor";
import type {AdaptiveQuestion,LearningAnswer} from "./adaptiveQuestions";
export type AnswerValidation={status:"verified"|"needs_review"|"contradicted";reason:string;evidence:string[];mayApply:boolean};
const norm=(s:string)=>s.toLowerCase().replace(/[\s_-]/g,"");
const isBlank=(v:unknown)=>v===null||v===undefined||String(v).trim()==="";
export function validateAnswer(question:AdaptiveQuestion,answer:string,datasets:Dataset[]):AnswerValidation{
 const value=answer.trim();if(!value)return{status:"contradicted",reason:"Empty answers cannot be accepted.",evidence:[],mayApply:false};
 const columns=datasets.flatMap(d=>d.columns.map(c=>({table:d.name,column:c})));
 const find=(name:string)=>columns.filter(c=>norm(c.column)===norm(name));
 const evidence:string[]=[];
 if(question.id==="key"){
  const matches=find(value);if(matches.length){for(const m of matches){const d=datasets.find(x=>x.name===m.table)!;const vals=d.rows.map(r=>r[m.column]);const nonEmpty=vals.filter(v=>!isBlank(v)).map(String);const duplicates=nonEmpty.length-new Set(nonEmpty).size;const missing=vals.length-nonEmpty.length;evidence.push(m.table+": "+duplicates+" repeated values; "+missing+" missing values");if(duplicates||missing)return{status:"needs_review",reason:"Selected key is not unique or contains blanks. Confirm the row grain before any join.",evidence,mayApply:false};}return{status:"verified",reason:"Column exists and its non-empty keys are unique in sampled imported rows. Business meaning still needs review.",evidence,mayApply:false};}
  if(question.options.includes(value))return{status:"needs_review",reason:"A choice was recorded but does not identify a validated key.",evidence,mayApply:false};
  return{status:"contradicted",reason:"The named key column was not found in the imported tables.",evidence:columns.slice(0,20).map(c=>c.table+"."+c.column),mayApply:false};
 }
 if(question.id==="date"&&value==="Not needed")return{status:"needs_review",reason:"Date analysis preference is not verifiable from data; confirm report requirements.",evidence,mayApply:false};
 if(question.id==="join"&&value==="Same ID with different names")return{status:"needs_review",reason:"Select both actual columns and check matching values, uniqueness and fan-out before approval.",evidence,mayApply:false};
 if(question.id==="missing"){
  const count=datasets.reduce((n,d)=>n+d.rows.filter(r=>d.columns.some(c=>isBlank(r[c]))).length,0);
  evidence.push(count+" imported rows have at least one missing cell");
  return{status:"needs_review",reason:"Missing-value treatment requires column-level review and an approved preview.",evidence,mayApply:false};
 }
 if(question.id==="sources"&&datasets.length===0)return{status:"needs_review",reason:"Source type is a user statement until data is connected or uploaded.",evidence,mayApply:false};
 return{status:"needs_review",reason:"Answer recorded as an unverified user statement. Validate against source data or business rules before applying.",evidence,mayApply:false};
}
export type ValidatedAnswer=LearningAnswer&{validation:AnswerValidation};
