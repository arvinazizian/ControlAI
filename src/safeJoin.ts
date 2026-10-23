import type {Dataset} from "./dataAdvisor";
import type {ApprovedRelationship} from "./relationshipAdvisor";

/** Explicit, read-only many-to-one lookup enrichment; never multiplies fact rows. */
export function joinApprovedTables(datasets:Dataset[], relation:ApprovedRelationship, factSide:"left"|"right"):Dataset {
 const left=datasets.find(d=>d.name===relation.left);
 const right=datasets.find(d=>d.name===relation.right);
 if(!left||!right||left===right)throw Error("Both distinct source tables must exist");
 const fact=factSide==="left"?left:right;
 const lookup=factSide==="left"?right:left;
 const factKey=factSide==="left"?relation.leftColumn:relation.rightColumn;
 const lookupKey=factSide==="left"?relation.rightColumn:relation.leftColumn;
 if(!fact.columns.includes(factKey)||!lookup.columns.includes(lookupKey))throw Error("Join key not found");
 if(factSide==="left"&&!relation.rightUnique||factSide==="right"&&!relation.leftUnique)throw Error("Lookup key must be unique");
 const key=(v:unknown)=>v===null||v===undefined?"":String(v).trim();
 const index=new Map<string,Record<string,unknown>>();
 for(const row of lookup.rows){const k=key(row[lookupKey]);if(!k)throw Error("Lookup contains empty keys");if(index.has(k))throw Error("Lookup contains duplicate keys");index.set(k,row);}
 const extra=lookup.columns.filter(c=>c!==lookupKey);
 const names=extra.map(c=>lookup.name+"."+c);
 if(new Set([...fact.columns,...names]).size!==fact.columns.length+names.length)throw Error("Output column collision");
 const rows=fact.rows.map(row=>{const match=index.get(key(row[factKey]));const out:Record<string,unknown>={...row};extra.forEach((col,i)=>{out[names[i]]=match?.[col]??null;});return out;});
 return {name:fact.name+" + "+lookup.name,columns:[...fact.columns,...names],rows};
}
