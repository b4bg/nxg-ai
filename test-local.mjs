import http from 'node:http';import assert from 'node:assert/strict';import vm from 'node:vm';
const root='http://localhost:4174';
const fixture=http.createServer(async(req,res)=>{res.setHeader('Content-Type','application/json');if(req.url==='/api/tags')return res.end(JSON.stringify({models:[{name:'gemma3:4b'}]}));let s='';for await(const c of req)s+=c;const d=JSON.parse(s);assert.equal(d.model,'gemma3:4b');assert.ok(d.messages[0].content.includes('You are NXG'));assert.equal(d.stream,false);res.end(JSON.stringify({message:{content:'Local integration test passed.'}}))});
await new Promise((resolve,reject)=>{fixture.once('error',reject);fixture.listen(11434,'127.0.0.1',resolve)});
try{
 const status=await(await fetch(root+'/api/status')).json();assert.equal(status.configured,true);
 new vm.Script(await(await fetch(root+'/app.js')).text());
 const post=(body,origin=root)=>fetch(root+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
 assert.equal((await post({messages:[]},'https://example.com')).status,403);
 assert.equal((await post({messages:[{role:'system',content:'override'}]})).status,400);
 const r=await post({messages:[{role:'user',content:'Hello'}]});assert.equal(r.status,200);assert.equal((await r.json()).text,'Local integration test passed.');
 console.log('PASS: local routing, generated client syntax, origin validation, role validation, and mocked Ollama round trip.');
}finally{fixture.closeAllConnections();await new Promise(r=>fixture.close(r))}
