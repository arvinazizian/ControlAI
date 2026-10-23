import type {Dataset} from "./dataAdvisor";
export type BridgeSuggestion={kind:"manual_mapping"|"lookup_table"|"derived_key"|"missing_source";title:string;explanation:string;question:string};
const norm=(v:string)=>v.toLowerCase().replace(/[\s_-]/g,"");
const keylike=(v:string)=>/(id|code|key|nummer|number|reference|ref|شناسه|کد)/i.test(v);
export function bridgeSuggestions(left:Dataset,right:Dataset):BridgeSuggestion[]{
 const names=left.columns.filter(a=>right.columns.some(b=>norm(a)===norm(b)));
 const leftKeys=left.columns.filter(keylike),rightKeys=right.columns.filter(keylike);
 const out:BridgeSuggestion[]=[];
 if(!names.length||!leftKeys.length||!rightKeys.length)out.push({kind:"manual_mapping",title:"Columns may have different names",explanation:"Two files can share an identifier named differently, such as ProjectCode and Project Number.",question:"Which column in each table identifies the same business item?"});
 out.push({kind:"lookup_table",title:"A reference or mapping table may be missing",explanation:"A separate table can map source-specific identifiers to one common identifier. Do not invent the mapping.",question:"Do you have a master list or another file that maps these IDs?"});
 out.push({kind:"derived_key",title:"A derived key might be possible",explanation:"A new column can be created in a working copy using an explicitly selected existing column. This does not create missing real-world matches.",question:"Should we preview a new normalized key column from an existing field?"});
 out.push({kind:"missing_source",title:"More data may be needed",explanation:"Some tables have no valid common business entity or time grain and should remain separate.",question:"Is there another source with project/customer/product IDs or a shared calendar?"});
 return out;
}
export function previewDerivedKey(dataset:Dataset,source:string,newName:string):Dataset{
 if(!dataset.columns.includes(source))throw Error("Select a source column");
 const name=newName.trim();if(!name||dataset.columns.includes(name))throw Error("New column name must be non-empty and unique");
 return {...dataset,columns:[...dataset.columns,name],rows:dataset.rows.map(row=>({...row,[name]:row[source]===null||row[source]===undefined?"":String(row[source]).trim().toLowerCase()}))};
}
export function inspectManualMapping(a:Dataset,ac:string,b:Dataset,bc:string){
 if(!a.columns.includes(ac)||!b.columns.includes(bc))throw Error("Choose existing columns");
 const vals=(d:Dataset,c:string)=>d.rows.map(r=>r[c]==null?"":String(r[c]).trim()).filter(Boolean);
 const x=vals(a,ac),y=vals(b,bc),xs=new Set(x),ys=new Set(y);
 const matched=x.filter(v=>ys.has(v)).length;
 return {leftRows:a.rows.length,rightRows:b.rows.length,leftMatched:matched,rightMatched:y.filter(v=>xs.has(v)).length,leftUnmatched:x.length-matched,rightUnmatched:y.filter(v=>!xs.has(v)).length,leftUnique:new Set(x).size===x.length&&x.length===a.rows.length,rightUnique:new Set(y).size===y.length&&y.length===b.rows.length,fanoutRisk:new Set(x).size<x.length&&new Set(y).size<y.length,canPropose:matched>0&&!(new Set(x).size<x.length&&new Set(y).size<y.length)};
}
