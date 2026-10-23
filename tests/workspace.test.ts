import {describe,it,expect} from "vitest";
import {joinApprovedTables} from "../src/safeJoin";
import {approveRelationship} from "../src/relationshipAdvisor";
import {applyDataChange,editDataCell,initialHistory,redoDataChange,renameDataColumn,undoDataChange} from "../src/dataHistory";
import {findRelationships} from "../src/relationshipAdvisor";
import {previewDerivedKey,inspectManualMapping} from "../src/bridgeAdvisor";
import {validateAnswer} from "../src/answerValidation";
const a={name:"Projects",columns:["ProjectID","Name"],rows:[{ProjectID:"P1",Name:"One"},{ProjectID:"P2",Name:"Two"}]};
const b={name:"Costs",columns:["ProjectID","Cost"],rows:[{ProjectID:"P1",Cost:10},{ProjectID:"P1",Cost:20},{ProjectID:"P3",Cost:5}]};
describe("reversible data workspace",()=>{
 it("undoes and redoes edits without mutating original",()=>{
  const imported=applyDataChange(initialHistory,"import","import","",()=>[a]);
  const edited=applyDataChange(imported,"edit","edit","Projects",tables=>editDataCell(tables,"Projects",0,"Name","Changed"));
  expect(edited.present[0].rows[0].Name).toBe("Changed");
  expect(a.rows[0].Name).toBe("One");
  expect(undoDataChange(edited).present[0].rows[0].Name).toBe("One");
  expect(redoDataChange(undoDataChange(edited)).present[0].rows[0].Name).toBe("Changed");
 });
 it("rejects duplicate renamed columns",()=>expect(()=>renameDataColumn([a],"Projects","Name","ProjectID")).toThrow());
 it("creates normalized column without altering original",()=>{const out=previewDerivedKey(a,"ProjectID","key");expect(out.columns).toContain("key");expect(a.columns).not.toContain("key");});
});
describe("relationship and answer validation",()=>{
 it("detects orphan rows and one-to-many",()=>{const r=findRelationships([a,b])[0];expect(r.cardinality).toBe("one_to_many");expect(r.rightOrphans).toBe(1);});
 it("rejects unsafe many-to-many mappings",()=>{const x={...a,rows:[a.rows[0],a.rows[0]]};expect(inspectManualMapping(x,"ProjectID",b,"ProjectID").canPropose).toBe(false);});
 it("rejects nonexistent user key",()=>{const q={id:"key",priority:1,reason:"",prompt:"",options:[]};expect(validateAnswer(q,"madeUp",[a]).status).toBe("contradicted");});
});

describe("safe executable joins",()=>{
 it("preserves fact row count with an approved unique lookup",()=>{
  const lookup={name:"Projects",columns:["ProjectID","Name"],rows:[{ProjectID:"P1",Name:"One"},{ProjectID:"P2",Name:"Two"}]};
  const facts={name:"Costs",columns:["ProjectID","Cost"],rows:[{ProjectID:"P1",Cost:10},{ProjectID:"P1",Cost:20},{ProjectID:"P3",Cost:5}]};
  const candidate=findRelationships([lookup,facts])[0];
  const approved=approveRelationship(candidate,true);
  const result=joinApprovedTables([lookup,facts],approved,"right");
  expect(result.rows).toHaveLength(3);
  expect(result.rows[0]["Projects.Name"]).toBe("One");
  expect(result.rows[2]["Projects.Name"]).toBeNull();
  expect(facts.rows[0]).not.toHaveProperty("Projects.Name");
 });
 it("rejects an invalid fact direction that would fan out",()=>{
  const approved=approveRelationship(findRelationships([a,b])[0],true);
  expect(()=>joinApprovedTables([a,b],approved,"left")).toThrow("Lookup key must be unique");
 });
 it("rejects changed lookup data with duplicate keys",()=>{
  const approved=approveRelationship(findRelationships([a,b])[0],true);
  const duplicate={...a,rows:[a.rows[0],a.rows[0]]};
  expect(()=>joinApprovedTables([duplicate,b],approved,"right")).toThrow("duplicate keys");
 });
});
