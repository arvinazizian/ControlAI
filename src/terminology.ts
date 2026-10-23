export type Term = { key: string; label: string; aliases: string[]; description: string; formula?: string };
export const standardTerms: Term[] = [
 {key:"budget",label:"Budget / BAC",aliases:["budget","bac","baseline budget","approved budget","بودجه"],description:"Budget at Completion: approved total budget"},
 {key:"actual",label:"Actual Cost / AC",aliases:["actual","actuals","ac","acwp","spent","هزینه واقعی"],description:"Actual cost incurred to date"},
 {key:"etc",label:"Estimate to Complete / ETC",aliases:["etc","remaining forecast","remaining cost","باقیمانده"],description:"Estimated additional cost to finish the work"},
 {key:"forecast",label:"Estimate at Completion / EAC",aliases:["forecast","eac","fac","estimate at completion","total forecast","پیش بینی نهایی"],description:"Forecast total cost at completion",formula:"EAC = AC + ETC (when ETC is a bottom-up remaining estimate)"},
 {key:"ev",label:"Earned Value / EV",aliases:["ev","bcwp","earned value"],description:"Budgeted value of work performed"},
 {key:"pv",label:"Planned Value / PV",aliases:["pv","bcws","planned value"],description:"Budgeted value of planned work"},
 {key:"cpi",label:"Cost Performance Index / CPI",aliases:["cpi"],description:"EV / AC (if AC is nonzero)",formula:"CPI = EV / AC"},
 {key:"spi",label:"Schedule Performance Index / SPI",aliases:["spi"],description:"EV / PV (if PV is nonzero)",formula:"SPI = EV / PV"},
 {key:"vac",label:"Variance at Completion / VAC",aliases:["vac"],description:"BAC - EAC",formula:"VAC = BAC - EAC"},
 {key:"wbs",label:"Work Breakdown Structure / WBS",aliases:["wbs"],description:"Hierarchical project scope breakdown"}
];
export const normalize = (v: string) => v.trim().toLowerCase().replace(/[\s_\-()]+/g,"");
export function resolveTerm(input: string, terms: Term[]): string | null {
 const needle=normalize(input);
 const matches=terms.filter(t=>[t.key,t.label,...t.aliases].some(a=>normalize(a)===needle));
 return matches.length===1?matches[0].key:null;
}
export function validateTerms(terms: Term[]): string[] {
 const errors:string[]=[];const seen=new Map<string,string>();
 for(const term of terms){if(!term.key||!term.label)errors.push("Each term needs a key and label");
  for(const alias of [term.key,term.label,...term.aliases]){const n=normalize(alias);if(!n)continue;const owner=seen.get(n);if(owner&&owner!==term.key)errors.push('Ambiguous alias "'+alias+'" for '+owner+' and '+term.key);else seen.set(n,term.key);}
 }return errors;
}
export function loadTerms(): Term[] {try{const s=localStorage.getItem("controlai-glossary-v1");if(!s)return standardTerms;const data:unknown=JSON.parse(s);if(Array.isArray(data)&&data.every(t=>t&&typeof t.key==="string"&&typeof t.label==="string"&&Array.isArray(t.aliases)&&t.aliases.every((a:unknown)=>typeof a==="string")&&typeof t.description==="string"))return data as Term[];}catch{}return standardTerms;}
