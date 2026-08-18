 "use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { addDoc, collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FileText, Plus, Printer, Save, X } from "lucide-react";

type Party = { id:string; name:string; address?:string; gstin?:string; state?:string; stateCode?:string; mobile?:string };
type Description = { id:string; text:string; hsn?:string; unit?:string };
type BillItem = { description:string; hsn:string; quantity:number; unit:string; rate:number };
type TaxMode = "none" | "igst" | "cgst_sgst";

const money=(n:number)=>`₹ ${Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

function numberToWords(n:number){
  const ones=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const under100=(x:number)=>x<20?ones[x]:tens[Math.floor(x/10)]+(x%10?" "+ones[x%10]:"");
  const under1000=(x:number)=>x<100?under100(x):(ones[Math.floor(x/100)]+" Hundred"+(x%100?" "+under100(x%100):""));
  const integer=Math.floor(Math.abs(n));
  if(integer===0) return "Zero Rupees Only";
  const parts:string[]=[];
  let x=integer;
  const crore=Math.floor(x/10000000); x%=10000000;
  const lakh=Math.floor(x/100000); x%=100000;
  const thousand=Math.floor(x/1000); x%=1000;
  if(crore) parts.push(under1000(crore)+" Crore");
  if(lakh) parts.push(under100(lakh)+" Lakh");
  if(thousand) parts.push(under100(thousand)+" Thousand");
  if(x) parts.push(under1000(x));
  return `${parts.join(" ")} Rupees Only`;
}

const today=()=>new Date().toISOString().slice(0,10);
const invoiceNo=()=>`SMC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

export default function BillPage(){
  const [sellers,setSellers]=useState<Party[]>([]);
  const [buyers,setBuyers]=useState<Party[]>([]);
  const [descriptions,setDescriptions]=useState<Description[]>([]);
  const [sellerId,setSellerId]=useState("");
  const [buyerId,setBuyerId]=useState("");
  const [seller,setSeller]=useState<Party>({id:"",name:"",address:"",gstin:"",state:"",stateCode:"",mobile:""});
  const [buyer,setBuyer]=useState<Party>({id:"",name:"",address:"",gstin:"",state:"",stateCode:"",mobile:""});
  const [newSeller,setNewSeller]=useState<Party>({id:"",name:"",address:"",gstin:"",state:"",stateCode:"",mobile:""});
  const [newBuyer,setNewBuyer]=useState<Party>({id:"",name:"",address:"",gstin:"",state:"",stateCode:"",mobile:""});
  const [newDescription,setNewDescription]=useState<Description>({id:"",text:"",hsn:"",unit:"PCS"});
  const [items,setItems]=useState<BillItem[]>([{description:"",hsn:"",quantity:0,unit:"PCS",rate:0}]);
  const [date,setDate]=useState(today());
  const [invoice,setInvoice]=useState(invoiceNo());
  const [deliveryNote,setDeliveryNote]=useState("");
  const [buyersOrder,setBuyersOrder]=useState("");
  const [dispatchDoc,setDispatchDoc]=useState("");
  const [dispatchedThrough,setDispatchedThrough]=useState("");
  const [destination,setDestination]=useState("");
  const [terms,setTerms]=useState("");
  const [remarks,setRemarks]=useState("");
  const [savedDispatchDocs,setSavedDispatchDocs]=useState<string[]>([]);
  const [savedDispatchedThrough,setSavedDispatchedThrough]=useState<string[]>([]);
  const [savedDestinations,setSavedDestinations]=useState<string[]>([]);
  const [taxMode,setTaxMode]=useState<TaxMode>("igst");
  const [taxRate,setTaxRate]=useState("18");
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{
    const u1=onSnapshot(collection(db,"billSellers"),s=>setSellers(s.docs.map(d=>({id:d.id,...d.data()} as Party))));
    const u2=onSnapshot(collection(db,"billBuyers"),s=>setBuyers(s.docs.map(d=>({id:d.id,...d.data()} as Party))));
    const u3=onSnapshot(collection(db,"billDescriptions"),s=>setDescriptions(s.docs.map(d=>({id:d.id,...d.data()} as Description))));
    const u4=onSnapshot(collection(db,"billDispatchDocs"),s=>setSavedDispatchDocs(s.docs.map(d=>String((d.data() as any).value||"")).filter(Boolean)));
    const u5=onSnapshot(collection(db,"billDispatchedThrough"),s=>setSavedDispatchedThrough(s.docs.map(d=>String((d.data() as any).value||"")).filter(Boolean)));
    const u6=onSnapshot(collection(db,"billDestinations"),s=>setSavedDestinations(s.docs.map(d=>String((d.data() as any).value||"")).filter(Boolean)));
    getDoc(doc(db,"billDefaults","global")).then(s=>{
      if(!s.exists()) return;
      const d=s.data() as any;
      setDeliveryNote(d.deliveryNote||"");
      setBuyersOrder(d.buyersOrder||"");
      setDispatchDoc(d.dispatchDoc||"");
      setDispatchedThrough(d.dispatchedThrough||"");
      setDestination(d.destination||"");
      setTerms(d.terms||"");
    }).catch(()=>{});
    return ()=>{u1();u2();u3();u4();u5();u6()};
  },[]);

  async function saveBillDefault(field:string,value:string){
    try{ await setDoc(doc(db,"billDefaults","global"),{[field]:value,updatedAt:serverTimestamp()},{merge:true}); }catch(e){}
  }
  async function saveReusableValue(collectionName:string,value:string){
    const v=value.trim();
    if(!v) return;
    try{ await addDoc(collection(db,collectionName),{value:v,createdAt:serverTimestamp()}); }catch(e){}
  }

  useEffect(()=>{ const x=sellers.find(v=>v.id===sellerId); if(x) setSeller(x); },[sellerId,sellers]);
  useEffect(()=>{ const x=buyers.find(v=>v.id===buyerId); if(x) setBuyer(x); },[buyerId,buyers]);

  const subtotal=useMemo(()=>items.reduce((n,x)=>n+Number(x.quantity||0)*Number(x.rate||0),0),[items]);
  const rate=Number(taxRate||0);
  const tax=taxMode==="none"?0:subtotal*rate/100;
  const igst=taxMode==="igst"?tax:0;
  const cgst=taxMode==="cgst_sgst"?tax/2:0;
  const sgst=taxMode==="cgst_sgst"?tax/2:0;
  const grandTotal=Math.round((subtotal+tax)*100)/100;

  function updateItem(i:number,key:keyof BillItem,value:string){
    setItems(a=>a.map((x,idx)=>idx===i?{...x,[key]:key==="description"||key==="hsn"||key==="unit"?value:Number(value)}:x));
  }
  function selectDescription(i:number,id:string){
    const d=descriptions.find(x=>x.id===id);
    if(!d) return;
    setItems(a=>a.map((x,idx)=>idx===i?{...x,description:d.text,hsn:d.hsn||"",unit:d.unit||"PCS"}:x));
  }
  async function saveParty(kind:"seller"|"buyer"){
    const p=kind==="seller"?newSeller:newBuyer;
    if(!p.name.trim()){setError(`${kind==="seller"?"Seller":"Buyer"} name dalo.`);return;}
    try{
      const ref=await addDoc(collection(db,kind==="seller"?"billSellers":"billBuyers"),{name:p.name.trim(),address:p.address?.trim()||"",gstin:p.gstin?.trim()||"",state:p.state?.trim()||"",stateCode:p.stateCode?.trim()||"",mobile:p.mobile?.trim()||"",createdAt:serverTimestamp()});
      if(kind==="seller"){setNewSeller({id:"",name:"",address:"",gstin:"",state:"",stateCode:"",mobile:""});setSellerId(ref.id);}
      else {setNewBuyer({id:"",name:"",address:"",gstin:"",state:"",stateCode:"",mobile:""});setBuyerId(ref.id);}
      setMessage(`${kind==="seller"?"Seller":"Buyer"} saved. Ab baar-baar details nahi likhni padegi.`);
    }catch(e:any){setError(e?.message||"Party save nahi hui.");}
  }
  async function saveDescription(){
    if(!newDescription.text.trim()){setError("Description dalo.");return;}
    try{
      const ref=await addDoc(collection(db,"billDescriptions"),{text:newDescription.text.trim(),hsn:newDescription.hsn?.trim()||"",unit:newDescription.unit?.trim()||"PCS",createdAt:serverTimestamp()});
      setNewDescription({id:"",text:"",hsn:"",unit:"PCS"});
      setMessage("Description saved.");
      if(items.length===1&&!items[0].description) selectDescription(0,ref.id);
    }catch(e:any){setError(e?.message||"Description save nahi hui.");}
  }
  async function saveBill(){
    setError("");setMessage("");
    if(!seller.name.trim()||!buyer.name.trim()){setError("Seller aur Buyer select/add karo.");return;}
    const valid=items.filter(x=>x.description.trim()&&Number(x.quantity)>0&&Number(x.rate)>=0);
    if(!valid.length){setError("Kam se kam 1 valid item dalo.");return;}
    setSaving(true);
    try{
      await setDoc(doc(db,"billDefaults","global"),{deliveryNote,buyersOrder,dispatchDoc,dispatchedThrough,destination,terms,updatedAt:serverTimestamp()},{merge:true});
      await addDoc(collection(db,"bills"),{
        invoiceNo:invoice,date,seller,buyer,items:valid,deliveryNote,buyersOrder,dispatchDoc,dispatchedThrough,destination,terms,remarks,
        taxMode,taxRate:rate,subtotal,igst,cgst,sgst,total:grandTotal,amountWords:numberToWords(grandTotal),createdAt:serverTimestamp()
      });
      setMessage("Bill saved successfully. Salary aur Stock par koi effect nahi hua.");
    }catch(e:any){setError(e?.message||"Bill save nahi hua.");}
    finally{setSaving(false)}
  }
  function printBill(){window.print();}

  return <AuthGuard allowedRoles={["admin"]}>
    <div className="bill-app" style={{display:"flex",minHeight:"100vh"}}>
      <div className="no-print"><Sidebar/></div>
      <main style={{flex:1,padding:"28px",minWidth:0}}>
        <div className="no-print" style={{maxWidth:1180,margin:"0 auto"}}>
          <div style={{color:"#168f67",fontWeight:800,fontSize:12,letterSpacing:2}}>SMC MANAGEMENT</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:15,flexWrap:"wrap"}}>
            <div><h1 style={{margin:"6px 0",color:"#082b68",fontSize:30}}>Bill / Tax Invoice</h1><p style={{margin:0,color:"#6d7d96"}}>Separate billing module — Salary aur Stock se independent.</p></div>
            <div style={{display:"flex",gap:8}}><button className="btn btn-primary" onClick={saveBill} disabled={saving}><Save size={16}/> Save Bill</button><button className="btn" onClick={printBill}><Printer size={16}/> Print / PDF</button></div>
          </div>
          {error&&<div style={{background:"#fff1f1",color:"#b42318",padding:12,borderRadius:10,marginTop:14}}>{error}</div>}
          {message&&<div style={{background:"#eaf9f2",color:"#168f67",padding:12,borderRadius:10,marginTop:14}}>{message}</div>}

          <section className="card" style={{padding:18,marginTop:18}}>
            <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr",gap:14}}>
              <div><label>Seller</label><select className="input" value={sellerId} onChange={e=>setSellerId(e.target.value)}><option value="">Select saved seller</option>{sellers.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
              <div><label>Invoice No.</label><input className="input" value={invoice} onChange={e=>setInvoice(e.target.value)}/></div>
              <div><label>Date</label><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14}}>
              <div style={{padding:14,background:"#f7faff",borderRadius:12}}>
                <b>Save new Seller</b>
                <div className="party-grid">
                  <input className="input" placeholder="Name" value={newSeller.name} onChange={e=>setNewSeller({...newSeller,name:e.target.value})}/>
                  <input className="input" placeholder="Mobile" value={newSeller.mobile} onChange={e=>setNewSeller({...newSeller,mobile:e.target.value})}/>
                  <input className="input" placeholder="Address" value={newSeller.address} onChange={e=>setNewSeller({...newSeller,address:e.target.value})}/>
                  <input className="input" placeholder="GSTIN/UIN" value={newSeller.gstin} onChange={e=>setNewSeller({...newSeller,gstin:e.target.value})}/>
                  <input className="input" placeholder="State" value={newSeller.state} onChange={e=>setNewSeller({...newSeller,state:e.target.value})}/>
                  <input className="input" placeholder="State Code" value={newSeller.stateCode} onChange={e=>setNewSeller({...newSeller,stateCode:e.target.value})}/>
                </div>
                <button className="btn btn-primary" style={{marginTop:9}} onClick={()=>saveParty("seller")}><Plus size={15}/> Save Seller</button>
              </div>
              <div style={{padding:14,background:"#f7faff",borderRadius:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:10}}>
                  <b>Buyer</b>
                  <select className="input" style={{maxWidth:260}} value={buyerId} onChange={e=>setBuyerId(e.target.value)}>
                    <option value="">Select saved buyer</option>
                    {buyers.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                </div>
                <b>Save new Buyer</b>
                <div className="party-grid">
                  <input className="input" placeholder="Name" value={newBuyer.name} onChange={e=>setNewBuyer({...newBuyer,name:e.target.value})}/>
                  <input className="input" placeholder="Mobile" value={newBuyer.mobile} onChange={e=>setNewBuyer({...newBuyer,mobile:e.target.value})}/>
                  <input className="input" placeholder="Address" value={newBuyer.address} onChange={e=>setNewBuyer({...newBuyer,address:e.target.value})}/>
                  <input className="input" placeholder="GSTIN/UIN" value={newBuyer.gstin} onChange={e=>setNewBuyer({...newBuyer,gstin:e.target.value})}/>
                  <input className="input" placeholder="State" value={newBuyer.state} onChange={e=>setNewBuyer({...newBuyer,state:e.target.value})}/>
                  <input className="input" placeholder="State Code" value={newBuyer.stateCode} onChange={e=>setNewBuyer({...newBuyer,stateCode:e.target.value})}/>
                </div>
                <button className="btn btn-primary" style={{marginTop:9}} onClick={()=>saveParty("buyer")}><Plus size={15}/> Save Buyer</button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:14}}>
              <input className="input" placeholder="Delivery Note" value={deliveryNote} onChange={e=>setDeliveryNote(e.target.value)} onBlur={e=>saveBillDefault("deliveryNote",e.target.value)}/>
              <input className="input" placeholder="Buyer's Order No." value={buyersOrder} onChange={e=>setBuyersOrder(e.target.value)} onBlur={e=>saveBillDefault("buyersOrder",e.target.value)}/>
              <div className="saved-field"><select className="input" value={savedDispatchDocs.includes(dispatchDoc)?dispatchDoc:"__custom__"} onChange={e=>{if(e.target.value!=="__custom__") setDispatchDoc(e.target.value)}}><option value="__custom__">New / custom Dispatch Doc No.</option>{savedDispatchDocs.map(v=><option key={v} value={v}>{v}</option>)}</select><input className="input" placeholder="Dispatch Doc No." value={dispatchDoc} onChange={e=>setDispatchDoc(e.target.value)}/><button className="btn save-small" onClick={async()=>{await saveReusableValue("billDispatchDocs",dispatchDoc);await saveBillDefault("dispatchDoc",dispatchDoc)}}>Save</button></div>
              <div className="saved-field"><select className="input" value={savedDispatchedThrough.includes(dispatchedThrough)?dispatchedThrough:"__custom__"} onChange={e=>{if(e.target.value!=="__custom__") setDispatchedThrough(e.target.value)}}><option value="__custom__">New / custom Dispatched Through</option>{savedDispatchedThrough.map(v=><option key={v} value={v}>{v}</option>)}</select><input className="input" placeholder="Dispatched Through" value={dispatchedThrough} onChange={e=>setDispatchedThrough(e.target.value)}/><button className="btn save-small" onClick={async()=>{await saveReusableValue("billDispatchedThrough",dispatchedThrough);await saveBillDefault("dispatchedThrough",dispatchedThrough)}}>Save</button></div>
              <div className="saved-field"><select className="input" value={savedDestinations.includes(destination)?destination:"__custom__"} onChange={e=>{if(e.target.value!=="__custom__") setDestination(e.target.value)}}><option value="__custom__">New / custom Destination</option>{savedDestinations.map(v=><option key={v} value={v}>{v}</option>)}</select><input className="input" placeholder="Destination" value={destination} onChange={e=>setDestination(e.target.value)}/><button className="btn save-small" onClick={async()=>{await saveReusableValue("billDestinations",destination);await saveBillDefault("destination",destination)}}>Save</button></div>
              <input className="input" placeholder="Terms of Delivery" value={terms} onChange={e=>setTerms(e.target.value)} onBlur={e=>saveBillDefault("terms",e.target.value)} style={{gridColumn:"span 3"}}/><input className="input" placeholder="Remarks" value={remarks} onChange={e=>setRemarks(e.target.value)} style={{gridColumn:"span 4"}}/>
              <div style={{gridColumn:"span 4",fontSize:11,color:"#168f67"}}>In teen fields mein saved values dropdown mein dikhenge. Aap purani value select kar sakte ho ya <b>New / custom</b> choose karke nayi value likh kar <b>Save</b> kar sakte ho.</div>
            </div>
          </section>

          <section className="card" style={{padding:18,marginTop:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}><h2 style={{margin:0,fontSize:18,color:"#17345f"}}>Items</h2><div style={{display:"flex",gap:8,alignItems:"center"}}><select className="input" style={{width:210}} value={taxMode} onChange={e=>setTaxMode(e.target.value as TaxMode)}><option value="igst">IGST</option><option value="cgst_sgst">CGST + SGST (Both)</option><option value="none">No Tax</option></select>{taxMode!=="none"&&<input className="input" type="number" min="0" style={{width:90}} value={taxRate} onChange={e=>setTaxRate(e.target.value)}/>}<span>%</span></div></div>
            <div style={{overflowX:"auto",marginTop:12}}>
              <table className="editor-table"><thead><tr><th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Amount</th><th></th></tr></thead>
              <tbody>{items.map((x,i)=><tr key={i}><td><select className="input" value={descriptions.find(d=>d.text===x.description)?.id||""} onChange={e=>selectDescription(i,e.target.value)}><option value="">Type / select description</option>{descriptions.map(d=><option key={d.id} value={d.id}>{d.text}</option>)}</select><input className="input" style={{marginTop:6}} value={x.description} placeholder="Description" onChange={e=>updateItem(i,"description",e.target.value)}/></td><td><input className="input" value={x.hsn} onChange={e=>updateItem(i,"hsn",e.target.value)}/></td><td><input className="input" type="number" min="0" value={x.quantity||""} onChange={e=>updateItem(i,"quantity",e.target.value)}/></td><td><input className="input" value={x.unit} onChange={e=>updateItem(i,"unit",e.target.value)}/></td><td><input className="input" type="number" min="0" value={x.rate||""} onChange={e=>updateItem(i,"rate",e.target.value)}/></td><td><b>{money(Number(x.quantity||0)*Number(x.rate||0))}</b></td><td><button className="icon-btn" onClick={()=>setItems(a=>a.length===1?a:a.filter((_,idx)=>idx!==i))}><X size={16}/></button></td></tr>)}</tbody></table>
            </div>
            <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}><button className="btn" onClick={()=>setItems(a=>[...a,{description:"",hsn:"",quantity:0,unit:"PCS",rate:0}])}><Plus size={15}/> Add Item</button><div style={{display:"flex",gap:8,alignItems:"center",marginLeft:"auto"}}><input className="input" placeholder="Save description" value={newDescription.text} onChange={e=>setNewDescription({...newDescription,text:e.target.value})}/><input className="input" style={{width:110}} placeholder="HSN" value={newDescription.hsn} onChange={e=>setNewDescription({...newDescription,hsn:e.target.value})}/><button className="btn" onClick={saveDescription}>Save Description</button></div></div>
          </section>
        </div>

        <div className="invoice-wrap">

          <div className="invoice">
            <div className="invoice-top"><div><div className="invoice-title">Tax Invoice</div><div className="copy-label">(ORIGINAL FOR RECIPIENT)</div></div><div style={{textAlign:"right"}}><b>Invoice No.: {invoice}</b><br/>Date: {date}<br/></div></div>
            <div className="invoice-meta"><div><div className="party-name">{seller.name||"—"}</div><div>{seller.address||"—"}</div><div>GSTIN/UIN: {seller.gstin||"—"}</div><div>State: {seller.state||"—"} &nbsp; Code: {seller.stateCode||"—"}</div></div><div><b>Buyer (Bill To)</b><div className="party-name">{buyer.name||"—"}</div><div>{buyer.address||"—"}</div><div>GSTIN/UIN: {buyer.gstin||"—"}</div><div>State: {buyer.state||"—"} &nbsp; Code: {buyer.stateCode||"—"}</div></div><div><div>Delivery Note: {deliveryNote||"—"}</div><div>Buyer's Order No.: {buyersOrder||"—"}</div><div>Dispatch Doc No.: {dispatchDoc||"—"}</div><div>Dispatched Through: {dispatchedThrough||"—"}</div><div>Destination: {destination||"—"}</div></div></div>
            <table className="invoice-table"><thead><tr><th>S.No.</th><th>Description of Goods</th><th>HSN/SAC</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{items.filter(x=>x.description.trim()).map((x,i)=><tr key={i}><td>{i+1}</td><td><b>{x.description}</b><div className="tax-inline">{taxMode==="igst"?`IGST @ ${rate}%`:taxMode==="cgst_sgst"?`CGST @ ${rate/2}% + SGST @ ${rate/2}%`:""}</div></td><td>{x.hsn}</td><td>{x.quantity} {x.unit}</td><td>{money(x.rate)}</td><td>{money(x.quantity*x.rate)}</td></tr>)}<tr><td colSpan={5} style={{textAlign:"right"}}><b>Taxable Value</b></td><td><b>{money(subtotal)}</b></td></tr>{igst>0&&<tr><td colSpan={5} style={{textAlign:"right"}}>IGST @ {rate}%</td><td>{money(igst)}</td></tr>}{cgst>0&&<tr><td colSpan={5} style={{textAlign:"right"}}>CGST @ {rate/2}%</td><td>{money(cgst)}</td></tr>}{sgst>0&&<tr><td colSpan={5} style={{textAlign:"right"}}>SGST @ {rate/2}%</td><td>{money(sgst)}</td></tr>}<tr><td colSpan={5} style={{textAlign:"right"}}><b>Grand Total</b></td><td><b>{money(grandTotal)}</b></td></tr></tbody></table>
            <div className="words"><b>Amount Chargeable (in words)</b><br/>{numberToWords(grandTotal)}</div>
            <div className="tax-summary"><div><b>Tax Summary</b></div><table><thead><tr><th>Taxable Value</th><th>Tax Rate</th><th>IGST</th><th>CGST</th><th>SGST</th><th>Total Tax</th></tr></thead><tbody><tr><td>{money(subtotal)}</td><td>{taxMode==="none"?0:rate}%</td><td>{money(igst)}</td><td>{money(cgst)}</td><td>{money(sgst)}</td><td>{money(tax)}</td></tr></tbody></table></div>
            <div className="invoice-bottom"><div><b>Tax Amount (in words)</b><br/>{numberToWords(tax)}<br/><br/><b>Remarks:</b><br/>{remarks||"—"}<br/><br/><b>Declaration</b><br/>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</div><div className="signature"><b>for {seller.name||"Seller"}</b><div>Authorised Signatory</div></div></div>
            <div className="generated">This is a Computer Generated Invoice</div>
          </div>

        <div className="copy-break"></div>

          <div className="invoice">
            <div className="invoice-top"><div><div className="invoice-title">Tax Invoice</div><div className="copy-label">(DUPLICATE FOR TRANSPORTER)</div></div><div style={{textAlign:"right"}}><b>Invoice No.: {invoice}</b><br/>Date: {date}<br/></div></div>
            <div className="invoice-meta"><div><div className="party-name">{seller.name||"—"}</div><div>{seller.address||"—"}</div><div>GSTIN/UIN: {seller.gstin||"—"}</div><div>State: {seller.state||"—"} &nbsp; Code: {seller.stateCode||"—"}</div></div><div><b>Buyer (Bill To)</b><div className="party-name">{buyer.name||"—"}</div><div>{buyer.address||"—"}</div><div>GSTIN/UIN: {buyer.gstin||"—"}</div><div>State: {buyer.state||"—"} &nbsp; Code: {buyer.stateCode||"—"}</div></div><div><div>Delivery Note: {deliveryNote||"—"}</div><div>Buyer's Order No.: {buyersOrder||"—"}</div><div>Dispatch Doc No.: {dispatchDoc||"—"}</div><div>Dispatched Through: {dispatchedThrough||"—"}</div><div>Destination: {destination||"—"}</div></div></div>
            <table className="invoice-table"><thead><tr><th>S.No.</th><th>Description of Goods</th><th>HSN/SAC</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{items.filter(x=>x.description.trim()).map((x,i)=><tr key={i}><td>{i+1}</td><td><b>{x.description}</b><div className="tax-inline">{taxMode==="igst"?`IGST @ ${rate}%`:taxMode==="cgst_sgst"?`CGST @ ${rate/2}% + SGST @ ${rate/2}%`:""}</div></td><td>{x.hsn}</td><td>{x.quantity} {x.unit}</td><td>{money(x.rate)}</td><td>{money(x.quantity*x.rate)}</td></tr>)}<tr><td colSpan={5} style={{textAlign:"right"}}><b>Taxable Value</b></td><td><b>{money(subtotal)}</b></td></tr>{igst>0&&<tr><td colSpan={5} style={{textAlign:"right"}}>IGST @ {rate}%</td><td>{money(igst)}</td></tr>}{cgst>0&&<tr><td colSpan={5} style={{textAlign:"right"}}>CGST @ {rate/2}%</td><td>{money(cgst)}</td></tr>}{sgst>0&&<tr><td colSpan={5} style={{textAlign:"right"}}>SGST @ {rate/2}%</td><td>{money(sgst)}</td></tr>}<tr><td colSpan={5} style={{textAlign:"right"}}><b>Grand Total</b></td><td><b>{money(grandTotal)}</b></td></tr></tbody></table>
            <div className="words"><b>Amount Chargeable (in words)</b><br/>{numberToWords(grandTotal)}</div>
            <div className="tax-summary"><div><b>Tax Summary</b></div><table><thead><tr><th>Taxable Value</th><th>Tax Rate</th><th>IGST</th><th>CGST</th><th>SGST</th><th>Total Tax</th></tr></thead><tbody><tr><td>{money(subtotal)}</td><td>{taxMode==="none"?0:rate}%</td><td>{money(igst)}</td><td>{money(cgst)}</td><td>{money(sgst)}</td><td>{money(tax)}</td></tr></tbody></table></div>
            <div className="invoice-bottom"><div><b>Tax Amount (in words)</b><br/>{numberToWords(tax)}<br/><br/><b>Remarks:</b><br/>{remarks||"—"}<br/><br/><b>Declaration</b><br/>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</div><div className="signature"><b>for {seller.name||"Seller"}</b><div>Authorised Signatory</div></div></div>
            <div className="generated">This is a Computer Generated Invoice</div>
          </div>

        </div>
      </main>
      <style jsx global>{`
        label{display:block;font-size:12px;font-weight:700;color:#71809a;margin-bottom:5px}
        .saved-field{display:flex;gap:6px;align-items:center}.saved-field .input{min-width:0;flex:1}.save-small{padding:8px 11px!important;font-size:12px!important;white-space:nowrap}
        .party-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
        .editor-table{width:100%;border-collapse:collapse;min-width:850px}.editor-table th,.editor-table td{padding:8px;border-bottom:1px solid #e7edf5;text-align:left}.editor-table th{font-size:12px;color:#64748b}.icon-btn{border:0;background:transparent;cursor:pointer}
        .invoice-wrap{width:min(100%,210mm);max-width:210mm;margin:30px auto}.invoice{background:#fff;color:#111;border:1px solid #222;padding:10mm;min-height:281mm;box-sizing:border-box;font-family:Arial,sans-serif;font-size:10px;line-height:1.35;box-shadow:0 5px 20px #0001}.invoice-top{display:flex;justify-content:space-between;border-bottom:1px solid #222;padding-bottom:8px}.invoice-title{text-align:center;font-size:18px;font-weight:800}.small{font-size:8px;letter-spacing:1px}.invoice-meta{display:grid;grid-template-columns:1.3fr 1.3fr 1fr;border-bottom:1px solid #222}.invoice-meta>div{padding:8px;border-right:1px solid #222;min-height:95px}.invoice-meta>div:last-child{border-right:0}.party-name{font-size:12px;font-weight:800;margin:2px 0}.invoice-table{width:100%;border-collapse:collapse}.invoice-table th,.invoice-table td{border:1px solid #222;padding:6px;vertical-align:top}.invoice-table th{font-size:9px}.invoice-table td:nth-child(1){width:35px;text-align:center}.invoice-table td:nth-child(3){width:70px}.invoice-table td:nth-child(4){width:85px}.invoice-table td:nth-child(5),.invoice-table td:nth-child(6){width:85px;text-align:right}.tax-inline{text-align:center;font-weight:700;margin-top:24px}.words{border:1px solid #222;border-top:0;padding:8px;min-height:42px}.tax-summary{border:1px solid #222;border-top:0;padding:7px}.tax-summary table{width:100%;border-collapse:collapse;margin-top:5px}.tax-summary th,.tax-summary td{border:1px solid #222;padding:4px;text-align:right}.invoice-bottom{display:grid;grid-template-columns:1.6fr 1fr;border:1px solid #222;border-top:0;min-height:120px}.invoice-bottom>div{padding:8px}.signature{border-left:1px solid #222;text-align:right;padding-top:65px!important}.generated{text-align:center;padding-top:7px;font-size:8px}.copy-label{text-align:right;font-size:8px;font-weight:700;margin-bottom:5px}.copy-break{display:block;height:14mm}
        @media print{html,body{background:#fff!important;margin:0!important;padding:0!important}.no-print{display:none!important}.bill-app{display:block!important;min-height:0!important}.bill-app main{padding:0!important}.invoice-wrap{width:210mm!important;max-width:210mm!important;margin:0 auto!important}.invoice{width:210mm!important;min-height:281mm!important;margin:0!important;padding:8mm!important;box-shadow:none!important;border:1px solid #222;break-inside:avoid;page-break-after:auto}.invoice-table{page-break-inside:auto}.invoice-table tr{page-break-inside:avoid}.invoice-bottom{page-break-inside:avoid}.copy-break{page-break-before:always;height:0!important}@page{size:A4 portrait;margin:8mm}}
      `}</style>
    </div>
  </AuthGuard>
}
