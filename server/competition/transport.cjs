const {CompetitionService}=require('./sessionService.cjs');
const cookieToken=headers=>String(headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('hcm_host='))?.slice(9)||'';
function createCompetitionTransport(options={}) {
 let io;
 const owners=new Map();
 const pendingCodes=new Set();
 const broadcast=code=>{
   if(!io)return;const snapshot=service.snapshot(code);
   for(const socket of io.sockets.sockets.values())if(socket.data.compCode===code){
     if(socket.data.compHost){try{service.auth(service.get(code),socket.data.compHost);}catch{socket.data.compCode=null;socket.emit('comp:revoked',{error:'Quyền chủ phòng đã được khôi phục ở nơi khác.'});continue;}}
     socket.emit('comp:snapshot',snapshot);
   }
 };
 const service=new CompetitionService({...options,onChange:code=>pendingCodes.add(code)});
 const timer=setInterval(()=>{service.tick();for(const code of pendingCodes)broadcast(code);pendingCodes.clear();},250);timer.unref();
 function http(req,res){
   if(req.url.split('?')[0]!=='/competition-api')return false;
   res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
   const respond=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data));};
   if(req.method!=='POST'){respond(405,{ok:false,error:'Chỉ hỗ trợ POST.'});return true;}
   const origin=req.headers.origin;const host=req.headers['x-forwarded-host']||req.headers.host;
   try{if(origin&&new URL(origin).host!==host){respond(403,{ok:false,error:'Nguồn yêu cầu không hợp lệ.'});return true;}}catch{respond(403,{ok:false,error:'Nguồn yêu cầu không hợp lệ.'});return true;}
   let body='';let overflow=false;
   req.on('data',chunk=>{body+=chunk;if(Buffer.byteLength(body)>16384){overflow=true;body='';}});
   req.on('end',()=>{
     if(overflow){respond(413,{ok:false,error:'Yêu cầu quá lớn.'});return;}
     try{
       const input=JSON.parse(body);if(!input||typeof input!=='object')throw Error('Yêu cầu không hợp lệ.');
       service.tick();const credential=cookieToken(req.headers);let result={};
       switch(input.action){
         case 'create': result=service.create(input);break;
         case 'recover':result=service.recover(input.code,input.recoveryCode,req.socket.remoteAddress);break;
         case 'hostSnapshot':service.auth(service.get(input.code),credential);break;
         case 'questions':result.questions=service.questions(input.code,credential);break;
         case 'start':service.start(input.code,credential);break;
         case 'end':service.end(input.code,credential,input.reason);break;
         case 'withdraw':service.withdraw(input.code,credential,input.participantId,input.reason);break;
         default:throw Error('Thao tác không hợp lệ.');
       }
       if(result.hostToken){res.setHeader('Set-Cookie',`hcm_host=${result.hostToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${req.headers['x-forwarded-proto']==='https'?'; Secure':''}`);delete result.hostToken;}
       respond(200,{ok:true,...result,session:result.session||service.snapshot(input.code)});
     }catch(error){respond(400,{ok:false,error:error instanceof SyntaxError?'JSON không hợp lệ.':error.message});}
   });return true;
 }
 function attach(server){io=server;io.on('connection',socket=>{
   function release(){const code=socket.data.compCode,credential=socket.data.compToken;if(credential&&owners.get(credential)===socket.id){owners.delete(credential);try{service.connected(code,credential,false);}catch{}}socket.data.compCode=null;socket.data.compToken=null;socket.data.compHost=null;}
   function identity(){const code=socket.data.compCode,credential=socket.data.compToken;if(!credential||owners.get(credential)!==socket.id)throw Error('Vui lòng nối lại danh tính thí sinh.');service.player(service.get(code),credential);return {code,credential};}
   let windowAt=0,calls=0;
   const bind=(event,handler)=>socket.on(event,(input,ack)=>{try{if(Date.now()-windowAt>1000){windowAt=Date.now();calls=0;}if(++calls>90)throw Error('Vui lòng thao tác chậm hơn.');const result=handler(input&&typeof input==='object'?input:{});if(typeof ack==='function')ack({ok:true,...result});}catch(error){if(typeof ack==='function')ack({ok:false,error:error.message});}});
   bind('comp:public',input=>{service.tick();const session=service.snapshot(input.code);release();socket.data.compCode=session.code;return {session};});
   bind('comp:host-watch',input=>{const credential=cookieToken(socket.handshake.headers);const s=service.get(input.code);service.auth(s,credential);const origin=socket.handshake.headers.origin;if(origin&&new URL(origin).hostname!==String(socket.handshake.headers.host).split(':')[0])throw Error('Nguồn yêu cầu không hợp lệ.');release();socket.data.compHost=credential;socket.data.compCode=s.code;return {session:service.snapshot(s.code)};});
   bind('comp:join',input=>{const result=service.join(input.code,input);release();const previous=owners.get(result.participantToken);if(previous&&previous!==socket.id){const old=io.sockets.sockets.get(previous);if(old){old.data.compCode=null;old.data.compToken=null;old.emit('comp:revoked',{error:'Danh tính này đang được sử dụng ở tab khác.'});}}owners.set(result.participantToken,socket.id);socket.data.compCode=result.session.code;socket.data.compToken=result.participantToken;service.connected(result.session.code,result.participantToken,true);return {...result,session:service.snapshot(result.session.code)};});
   bind('comp:ready',input=>{const {code,credential}=identity();service.ready(code,credential,input.ready);return {session:service.snapshot(code)};});
   bind('comp:room',input=>{const {code,credential}=identity();service.room(code,credential,input.roomId);return {session:service.snapshot(code)};});
   bind('comp:position',input=>{const {code,credential}=identity();service.position(code,credential,input);return {};});
   bind('comp:question',input=>{const {code,credential}=identity();return {session:service.snapshot(code),question:service.question(code,credential,input.roomId,input.questionId)};});
   bind('comp:answer',input=>{const {code,credential}=identity();const result=service.answer(code,credential,input);return {...result,session:service.snapshot(code)};});
   bind('comp:leave',()=>{const code=socket.data.compCode;release();return {session:code?service.snapshot(code):null};});
   socket.on('disconnect',release);
 });}
 return {http,attach,service,close:()=>clearInterval(timer)};
}
module.exports={createCompetitionTransport};
