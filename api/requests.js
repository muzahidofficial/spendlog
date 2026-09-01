const {db,admin}=require('./_db');
module.exports=async(req,res)=>{try{
  const id=req.query.id;
  const isCompletion=req.method==='PATCH'&&req.body?.action==='complete';
  if(req.query.admin==='1'||req.method==='DELETE'||(req.method==='PATCH'&&!isCompletion))admin(req);
  if(req.method==='GET'){
    const d=await db('item_requests?select=*&order=created_at.desc');
    return res.status(200).json(d);
  }
  if(req.method==='POST'){
    const b=req.body||{};
    const payload={item_name:b.item_name,requested_by:b.requested_by,quantity:Number(b.quantity||1),priority:b.priority||'Normal',notes:b.notes||'',status:'Pending'};
    const d=await db('item_requests',{method:'POST',body:JSON.stringify(payload)});
    return res.status(201).json(d[0]);
  }
  if(isCompletion&&id){
    const b=req.body||{},price=Number(b.purchase_price),boughtBy=String(b.bought_by||'').trim(),purchaseTime=String(b.purchase_time||''),purchaseDate=String(b.purchase_date||'');
    if(!Number.isFinite(price)||price<=0)return res.status(400).json({error:'Enter a valid price'});
    if(!boughtBy)return res.status(400).json({error:'Enter who bought the item'});
    if(!/^\d{2}:\d{2}$/.test(purchaseTime))return res.status(400).json({error:'Enter a valid time'});
    if(!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate))return res.status(400).json({error:'Invalid purchase date'});
    const current=await db(`item_requests?id=eq.${encodeURIComponent(id)}&select=*`);
    if(!current[0])return res.status(404).json({error:'Request not found'});
    if(current[0].status==='Completed')return res.status(409).json({error:'This item is already completed'});
    const expenseRows=await db('expenses',{method:'POST',body:JSON.stringify({reason:current[0].item_name,amount:price,spent_by:boughtBy,category:'Shopping',date:purchaseDate,time:purchaseTime,notes:`Requested item purchase${current[0].quantity?` · Qty ${current[0].quantity}`:''}`})});
    const expense=expenseRows[0];
    const updated=await db(`item_requests?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({status:'Completed',purchase_price:price,bought_by:boughtBy,purchase_date:purchaseDate,purchase_time:purchaseTime,expense_id:expense.id,updated_at:new Date().toISOString()})});
    return res.status(200).json({request:updated[0],expense:{...expense,spentBy:expense.spent_by}});
  }
  if(req.method==='PATCH'&&id){
    const allowed=['Pending','Approved','Purchased','Restocked','Completed','Rejected'];
    if(!allowed.includes(req.body?.status))return res.status(400).json({error:'Invalid status'});
    const d=await db(`item_requests?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({status:req.body.status,updated_at:new Date().toISOString()})});
    return res.status(200).json(d[0]);
  }
  if(req.method==='DELETE'&&id){await db(`item_requests?id=eq.${encodeURIComponent(id)}`,{method:'DELETE'});return res.status(200).json({ok:true})}
  return res.status(405).json({error:'Method not allowed'});
}catch(e){return res.status(e.status||500).json({error:e.message})}};
