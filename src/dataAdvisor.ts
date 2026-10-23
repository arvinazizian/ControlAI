/** Deterministic, read-only diagnostics; proposed actions always need approval. */
export type DataIssue={id:string;severity:"info"|"warning";title:string;question:string;choices:string[];recommended:string;column?:string};
export type Dataset={name:string;columns:string[];rows:Record<string,unknown>[]};
const normalized=(s:string)=>s.toLowerCase().replace(/[\s_-]/g,"");
export function adviseDataset(dataset:Dataset):DataIssue[]{
 const issues:DataIssue[]=[];const {columns,rows}=dataset;
 for(const column of columns){
  const values=rows.map(r=>r[column]);const missing=values.filter(v=>v===null||v===undefined||String(v).trim()==="").length;
  if(missing)issues.push({id:"missing:"+column,severity:"warning",title:missing+" missing values in "+column,question:"How should missing values be handled?",choices:["Keep missing and flag","Exclude affected rows from this report","Replace with a value I choose","Explain options"],recommended:"Keep missing and flag",column});
 }
 const candidate=columns.find(c=>/^(id|projectid|projectcode|key)$/i.test(normalized(c)));
 if(candidate&&rows.length){const values=rows.map(r=>String(r[candidate]??""));const duplicate=values.length-new Set(values).size;if(duplicate)issues.push({id:"duplicates:"+candidate,severity:"info",title:"Repeated "+candidate+" values ("+duplicate+")",question:"Does each row represent a transaction, period, or one project?",choices:["Transactions","Monthly snapshots","One project","Not sure"],recommended:"Not sure",column:candidate});}
 const date=columns.find(c=>/(date|datum|تاریخ)/i.test(c));
 if(!date)issues.push({id:"date-missing",severity:"info",title:"No obvious date column",question:"Do you need time-based reporting, such as the last three months?",choices:["Yes, date is in another table","Yes, help me find the date","No","Not sure"],recommended:"Not sure"});
 else {const invalid=rows.filter(r=>{const v=r[date];return v!==null&&v!==undefined&&String(v).trim()!==""&&!(v instanceof Date)&&Number.isNaN(Date.parse(String(v)))}).length;if(invalid)issues.push({id:"invalid-date",severity:"warning",title:invalid+" unrecognized dates",question:"How should these dates be interpreted?",choices:["Show examples and formats","Keep as text","Exclude from date-based reports","Not sure"],recommended:"Show examples and formats",column:date});}
 if(date)issues.push({id:"calendar",severity:"info",title:"Date dimension may help time-based reporting",question:"Do you want monthly, quarterly or rolling three-month comparisons?",choices:["Monthly","Quarterly","Last 3 months","No date analysis"],recommended:"Monthly",column:date});
 return issues;
}
export type FormulaDraft={name:string;expression:string;engine:"semantic"|"sql"|"dax";status:"draft";requiresValidation:true};
export function proposeMeasure(kind:"EAC"|"VAC"|"Variance"|"Custom",custom?:string):FormulaDraft{
 const expressions={EAC:"[Actual Cost] + [ETC]",VAC:"[BAC] - [EAC]",Variance:"[Actual Cost] - [Budget]",Custom:custom?.trim()||""};
 if(!expressions[kind])throw Error("Enter a formula");
 return{name:kind,expression:expressions[kind],engine:"semantic",status:"draft",requiresValidation:true};
}
