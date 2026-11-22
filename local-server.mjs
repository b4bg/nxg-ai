import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {instructions} from '../src/server.mjs';
const host='127.0.0.1',port=4174,origin=`http://localhost:${port}`;
const model='gemma3:4b';
const ollama='http://127.0.0.1:11434';
const html=await readFile(new URL('../src/index.html',import.meta.url),'utf8');
let js=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
js=js.replace('Messages are sent to OpenAI when you ask for a response.','Messages stay on this Mac and are processed by your local AI model.').replace('Astra’s AI connection','NXG’s AI connection').replace('NXG’s AI connection is configured. Send a message to begin.','NXG runs locally on this Mac using Gemma 3. No API credits are needed.').replace('AI replies need a secure OpenAI connection. Install the OpenAI Developers plugin in Codex, then ask to finish connecting NXG. Your workspace is ready in the meantime.','The local model is starting or unavailable. Wait a moment and try again.').replace("connected?'AI connected':'AI setup needed'","connected?'Local AI ready':'Local AI starting'").replace('NXG is ready for setup. Connect OpenAI to enable real AI replies; your draft stays here.','The local AI is starting. Please try again in a moment; your draft stays here.');
js=js.replace("fetch('/api/status').then", "function refreshStatus(){fetch('/api/status').then").replace("$('connection').textContent='Connection unavailable'});", "$('connection').textContent='Connection unavailable'});}refreshStatus();setInterval(refreshStatus,15000);");
let pending=0;
const server=http.createServer(async(req,res)=>{
 const json=(data,status=200)=>{if(res.destroyed)return;res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try{
  if(!['localhost:4174','127.0.0.1:4174'].includes(req.headers.host))return json({error:'Invalid host'},403);
  if(req.headers.origin&&!['http://localhost:4174','http://127.0.0.1:4174'].includes(req.headers.origin))return json({error:'Invalid origin'},403);
  const path=new URL(req.url,origin).pathname;
  if(req.method==='GET'&&(path==='/'||path==='/app.js')){res.writeHead(200,{'Content-Type':path==='/'?'text/html; charset=utf-8':'text/javascript; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});return res.end(path==='/'?html:js);}
  if(path==='/api/status'&&req.method==='GET'){try{const r=await fetch(ollama+'/api/tags',{signal:AbortSignal.timeout(3000)});const d=await r.json();return json({configured:r.ok&&d.models?.some(m=>m.name===model),provider:'local',model});}catch{return json({configured:false,provider:'local',model})}}
  if(path!=='/api/chat'||req.method!=='POST')return json({error:'Not found'},404);
  let body='';for await(const chunk of req){body+=chunk;if(body.length>150000)return json({error:'Conversation too long. Start a new chat.'},413)}
  let data;try{data=JSON.parse(body)}catch{return json({error:'Invalid request'},400)}
  if(!Array.isArray(data.messages)||!data.messages.length||data.messages.length>40||data.messages.some(m=>!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>24000))return json({error:'Invalid messages'},400);
  if(pending>=2)return json({error:'NXG is finishing another response. Please try again shortly.'},429);
  const depth=['brief','balanced','detailed'].includes(data.depth)?data.depth:'balanced';
  const mode=['Everyday','Write','Code','Research','Plan','Learn'].includes(data.mode)?data.mode:'Everyday';
  // Bound history to fit the local model context while retaining recent turns.
  let count=0,history=[];for(const m of [...data.messages].reverse()){if(count+m.content.length>18000){if(!history.length)return json({error:'This message is too long for the local model. Please shorten it.'},400);break}count+=m.content.length;history.unshift(m)}
  const controller=new AbortController();res.on('close',()=>{if(!res.writableEnded)controller.abort()});
  pending++;
  try{const r=await fetch(ollama+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages:[{role:'system',content:instructions+`\nYour name is NXG. Run locally. Focus: ${mode}. Response depth: ${depth}.`},...history],stream:false,keep_alive:'30m',options:{num_ctx:8192,num_predict:depth==='brief'?512:depth==='detailed'?2048:1024}}),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(600000)])});
   if(!r.ok)return json({error:'The local model could not answer. Check that Ollama is running.'},502);
   const result=await r.json();if(!result.message?.content)return json({error:'The model returned an empty response. Please try again.'},502);json({text:result.message.content});
  }catch{json({error:'Local AI connection interrupted. Please retry; your draft is preserved.'},503)}finally{pending--}
 }catch{json({error:'NXG could not complete this request. Please try again.'},500)}
});
server.requestTimeout=0;server.timeout=0;
server.on('error',err=>{console.error('NXG server:',err.code);process.exit(1)});
server.listen(port,host,()=>console.log(`NXG local app: ${origin}`));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
