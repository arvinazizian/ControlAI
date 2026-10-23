import type {Dataset} from "./dataAdvisor";
export type DataAction={id:number;at:string;kind:"import"|"rename"|"derive"|"remove"|"edit";description:string;table:string;before:Dataset[];after:Dataset[]};
export type DataHistory={present:Dataset[];past:DataAction[];future:DataAction[];nextId:number};
export const initialHistory:DataHistory={present:[],past:[],future:[],nextId:1};
const copy=(tables:Dataset[]):Dataset[]=>tables.map(t=>({name:t.name,columns:[...t.columns],rows:t.rows.map(r=>({...r}))}));
export function applyDataChange(state:DataHistory,kind:DataAction["kind"],description:string,table:string,update:(draft:Dataset[])=>Dataset[]):DataHistory{
 const before=copy(state.present),after=update(copy(state.present));
 const action:DataAction={id:state.nextId,at:new Date().toISOString(),kind,description,table,before,after:copy(after)};
 return {present:after,past:[...state.past,action],future:[],nextId:state.nextId+1};
}
export function undoDataChange(state:DataHistory):DataHistory{const action=state.past[state.past.length-1];if(!action)return state;return {...state,present:copy(action.before),past:state.past.slice(0,-1),future:[action,...state.future]};}
export function redoDataChange(state:DataHistory):DataHistory{const action=state.future[0];if(!action)return state;return {...state,present:copy(action.after),past:[...state.past,action],future:state.future.slice(1)};}
export function restoreDataStep(state:DataHistory,count:number):DataHistory{let next=state;for(let i=0;i<count;i++)next=undoDataChange(next);return next;}
export function renameDataColumn(tables:Dataset[],table:string,from:string,to:string):Dataset[]{const name=to.trim();if(!name)throw Error("New column name is required");return tables.map(d=>{if(d.name!==table)return d;if(!d.columns.includes(from)||d.columns.includes(name))throw Error("Invalid or duplicate column");return {...d,columns:d.columns.map(c=>c===from?name:c),rows:d.rows.map(r=>{const row={...r};row[name]=row[from];delete row[from];return row;})};});}
export function editDataCell(tables:Dataset[],table:string,index:number,column:string,value:string):Dataset[]{return tables.map(d=>{if(d.name!==table)return d;if(!d.columns.includes(column)||index<0||index>=d.rows.length)throw Error("Invalid cell");return {...d,rows:d.rows.map((r,i)=>i===index?{...r,[column]:value}:r)};});}
