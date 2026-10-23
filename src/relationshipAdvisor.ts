import type {Dataset} from "./dataAdvisor";
export type RelationshipCandidate={id:string;left:string;right:string;leftColumn:string;rightColumn:string;cardinality:"one_to_many"|"many_to_one"|"one_to_one"|"many_to_many";matchedLeft:number;matchedRight:number;leftRows:number;rightRows:number;leftOrphans:number;rightOrphans:number;leftNulls:number;rightNulls:number;leftUnique:boolean;rightUnique:boolean;fanoutRisk:boolean;status:"review"|"unsafe";reasons:string[]};
const norm=(s:string)=>s.trim().toLowerCase().replace(/[\s_-]/g,"");
const value=(v:unknown)=>v===null||v===undefined?"":String(v).trim();
function stats(d:Dataset,c:string){const vals=d.rows.map(r=>value(r[c]));const present=vals.filter(Boolean);return{vals,present,set:new Set(present),nulls:vals.length-present.length,unique:present.length>0&&new Set(present).size===present.length&&present.length===vals.length};}
export function findRelationships(datasets:Dataset[]):RelationshipCandidate[]{
 const out:RelationshipCandidate[]=[];
 for(let i=0;i<datasets.length;i++)for(let j=i+1;j<datasets.length;j++){
 const a=datasets[i],b=datasets[j];if(a.name===b.name)continue;
 for(const ac of a.columns){const bc=b.columns.find(c=>norm(c)===norm(ac));if(!bc)continue;
 const x=stats(a,ac),y=stats(b,bc);
 if(!x.present.length||!y.present.length)continue;
 const matchedLeft=x.present.filter(v=>y.set.has(v)).length,matchedRight=y.present.filter(v=>x.set.has(v)).length;
 const leftOrphans=x.present.length-matchedLeft,rightOrphans=y.present.length-matchedRight;
 const cardinality=x.unique?(y.unique?"one_to_one":"one_to_many"):(y.unique?"many_to_one":"many_to_many");
 const fanoutRisk=!x.unique&&!y.unique;
 const reasons:string[]=[];
 if(fanoutRisk)reasons.push("Both sides repeat keys; direct join can multiply rows");
 if(leftOrphans||rightOrphans)reasons.push("Unmatched non-empty keys exist");
 if(x.nulls||y.nulls)reasons.push("Missing join keys exist");
 if(!matchedLeft&&!matchedRight)reasons.push("No matching values between these columns");
 if(!reasons.length)reasons.push("Matching key values detected; still verify row grain and business meaning");
 out.push({id:JSON.stringify([a.name,ac,b.name,bc]),left:a.name,right:b.name,leftColumn:ac,rightColumn:bc,cardinality,matchedLeft,matchedRight,leftRows:a.rows.length,rightRows:b.rows.length,leftOrphans,rightOrphans,leftNulls:x.nulls,rightNulls:y.nulls,leftUnique:x.unique,rightUnique:y.unique,fanoutRisk,status:fanoutRisk||!matchedLeft||!matchedRight?"unsafe":"review",reasons});
 }
 }
 return out.sort((a,b)=>Number(a.status==="unsafe")-Number(b.status==="unsafe")||b.matchedLeft+b.matchedRight-a.matchedLeft-a.matchedRight);
}
export type ApprovedRelationship=RelationshipCandidate&{approvedAt:string;status:"approved"};
export function approveRelationship(r:RelationshipCandidate,confirmedGrain:boolean):ApprovedRelationship{
 if(r.status==="unsafe"||!confirmedGrain)throw Error("Relationship is unsafe or row grain is not confirmed");
 return {...r,status:"approved",approvedAt:new Date().toISOString()};
}
