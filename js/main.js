const $=id=>document.getElementById(id);

const state={
 started:false,hp:820,maxHp:820,stamina:100,time:6.7,coins:126,wood:0,ore:0,herbs:3,
 quest:0,kills:0,enemy:null,dialogue:false,interacting:null,settings:{low:false},
 bag:["旅者短剑","野外地图","晨雾草 ×3"],equipment:{weapon:"旅者短剑",power:95},
 chestsOpened:0,level:7,xp:0,nextXp:240,defeatedBoss:false
};

const canvas=document.createElement("canvas");
canvas.id="worldCanvas";
$("game").appendChild(canvas);
const ctx=canvas.getContext("2d",{alpha:false});
let W=innerWidth,H=innerHeight,DPR=Math.min(devicePixelRatio||1,2);
const keys=Object.create(null);
const mouse={x:0,y:0,down:false};
const camera={x:0,y:0};
const player={x:980,y:860,dir:0,speed:185,attack:0,dash:0,inv:0,stamina:100,walk:0};
const particles=[];
const texts=[];
const enemies=[];
const npcs=[];
const landmarks=[];
const trees=[];
const rocks=[];
const flowers=[];
const fireflies=[];
const buildings=[];
const resources=[];
const chests=[];
const gates=[];
let boss=null;
const world={w:3000,h:2200};

const zones=[
 {x:0,y:0,w:3000,h:2200,c:"#76986f",name:"晨雾谷"},
 {x:0,y:0,w:950,h:2200,c:"#6e8f69",name:"静谧森林"},
 {x:2050,y:0,w:950,h:900,c:"#809c73",name:"风痕高地"},
 {x:1700,y:1250,w:1300,h:950,c:"#73937d",name:"暮潮湖畔"}
];

function resize(){
 W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);
 canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=W+"px";canvas.style.height=H+"px";
 ctx.setTransform(DPR,0,0,DPR,0,0);
}
addEventListener("resize",resize);resize();

function rnd(a,b){return a+Math.random()*(b-a)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function hash(x,y){const n=Math.sin(x*12.9898+y*78.233)*43758.5453;return n-Math.floor(n)}
function roadY(x){return 1050+Math.sin(x*.002)*80}
function roadX(y){return 1180+Math.sin(y*.0025)*70}
function isLake(x,y){return x>1830&&y>1350}
function zoneAt(x,y){
 if(isLake(x,y))return "暮潮湖畔";
 if(x<950)return "静谧森林";
 if(x>2050&&y<900)return "风痕高地";
 return "晨雾谷";
}
function notify(s){
 const t=$("toast");if(!t)return;
 t.textContent=s;t.classList.add("show");clearTimeout(notify.t);
 notify.t=setTimeout(()=>t.classList.remove("show"),1800);
}

function addTree(x,y,s=1){
 trees.push({x,y,s,variant:Math.floor(rnd(0,3)),shade:rnd(.85,1.15)});
}
function addRock(x,y,s=1){rocks.push({x,y,s,rot:rnd(0,Math.PI*2)})}
function addFlower(x,y,c){flowers.push({x,y,c})}
function addBuilding(x,y,w,h,type,name){
 buildings.push({x,y,w,h,type,name});
}
function addNPC(x,y,name,role,color){
 npcs.push({x,y,name,role,color,phase:rnd(0,6),homeX:x,homeY:y});
}
function addEnemy(x,y,type="荒原狼"){
 enemies.push({x,y,type,hp:type==="岩甲兽"?360:180,max:type==="岩甲兽"?360:180,homeX:x,homeY:y,phase:rnd(0,6),hit:0,dead:false});
}
function addLandmark(x,y,type,name){
 landmarks.push({x,y,type,name});
}
function addResource(x,y,type){
 resources.push({x,y,type,taken:false,phase:rnd(0,6)});
}
function addChest(x,y,rare=false){
 chests.push({x,y,opened:false,rare,phase:rnd(0,6)});
}
function addGate(x,y,name){
 gates.push({x,y,name,open:false});
}

function generateWorld(){
 // forest
 for(let i=0;i<145;i++)addTree(rnd(70,900),rnd(80,2080),rnd(.75,1.35));
 // highland trees / rocks
 for(let i=0;i<55;i++)addTree(rnd(2000,2940),rnd(80,980),rnd(.7,1.15));
 for(let i=0;i<95;i++)addRock(rnd(80,2920),rnd(80,2100),rnd(.6,1.25));
 for(let i=0;i<180;i++)addFlower(rnd(70,2920),rnd(70,2080),["#d6b86a","#e8d9a2","#b6d19c","#d98f86"][i%4]);
 // village
 addBuilding(1120,770,170,125,"house","村长宅邸");
 addBuilding(1330,735,145,110,"house","旅店");
 addBuilding(1120,990,150,105,"house","工坊");
 addBuilding(1350,990,130,100,"house","杂货铺");
 addBuilding(1500,825,100,80,"well","村井");
 addBuilding(1270,575,210,95,"hall","晨雾谷礼堂");
 // roads
 for(let i=0;i<24;i++)addLandmark(1050+i*42,roadY(1050+i*42),"stone","道路");
 // landmarks
 addLandmark(430,420,"ruin","旧灯塔");
 addLandmark(720,1590,"ruin","藤蔓遗迹");
 addLandmark(1550,430,"shrine","回声神殿");
 addLandmark(2150,1500,"shrine","潮汐祭坛");
 // NPCs
 addNPC(1260,820,"艾琳","村庄向导","#e7b85b");
 addNPC(1390,900,"诺安","铁匠","#b87b62");
 addNPC(1190,1040,"米娅","杂货商","#86a98e");
 addNPC(1510,760,"莱恩","巡林者","#7895ae");
 // enemies
 addEnemy(520,650,"荒原狼");addEnemy(650,780,"荒原狼");addEnemy(800,520,"荒原狼");
 addEnemy(620,1450,"荒原狼");addEnemy(840,1660,"荒原狼");
 addEnemy(2220,520,"岩甲兽");addEnemy(2450,720,"岩甲兽");addEnemy(2700,430,"荒原狼");
 addEnemy(1900,1160,"荒原狼");addEnemy(2250,1190,"荒原狼");
 // resources / chests / gates
 for(let i=0;i<42;i++)addResource(rnd(180,1750),rnd(180,1980),i%3===0?"ore":i%3===1?"wood":"herb");
 for(let i=0;i<8;i++)addChest([560,880,1020,1580,1660,2100,2500,2780][i],[360,1380,620,1840,1180,1580,640,820][i],i>5);
 addGate(930,1120,"森林石门");
 addGate(1760,1250,"湖畔古门");
 addChest(2580,470,true);
 // Boss arena
 addLandmark(2700,1650,"boss","古龙巢穴");
 boss={x:2700,y:1650,type:"暮岩古龙",hp:1800,max:1800,hit:0,phase:0,active:false,dead:false,attackCd:0};
 // fireflies
 for(let i=0;i<70;i++)fireflies.push({x:rnd(300,1800),y:rnd(250,1900),p:rnd(0,6),s:rnd(.4,1)});
}
generateWorld();

function setLoading(){
 const bar=$("loadBar"),txt=$("loadText"),loading=$("loading");
 if(!loading)return;
 let p=0;const timer=setInterval(()=>{
   p+=18; if(bar)bar.style.width=Math.min(p,100)+"%";
   if(txt)txt.textContent=p<45?"正在绘制晨雾谷…":p<80?"正在唤醒居民与野兽…":"世界已准备完成";
   if(p>=100){clearInterval(timer);loading.classList.add("hidden");}
 },90);
}
setLoading();

function setupUI(){
 async function enterImmersiveMobile(){
 if(innerWidth>900&&!matchMedia("(pointer:coarse)").matches)return;
 try{
   if(!document.fullscreenElement) await (document.documentElement.requestFullscreen?.({navigationUI:"hide"})||Promise.resolve());
 }catch(e){}
 try{await screen.orientation?.lock?.("landscape");}catch(e){}
}
$("startBtn")?.addEventListener("click",async()=>{
   state.started=true;$("start")?.classList.add("hidden");$("hud")?.classList.remove("hidden");
   document.body.classList.add("game-running");
   await enterImmersiveMobile();
   $("mobileControls")?.classList.remove("hidden");
   syncMobileUI();loadGame();notify("欢迎来到晨雾谷");focusQuest();
 });
 $("menuBtn")?.addEventListener("click",()=>{$("menu")?.classList.remove("hidden");renderTab("map")});
 $("closeMenu")?.addEventListener("click",()=>$("menu")?.classList.add("hidden"));
 document.querySelectorAll(".tabs button").forEach(b=>b.addEventListener("click",()=>{
   document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderTab(b.dataset.tab);
 }));
 $("dialogueNext")?.addEventListener("click",nextDialogue);
 $("attackBtn")?.addEventListener("click",attack);
 $("dashBtn")?.addEventListener("click",dash);
 $("skillBtn")?.addEventListener("click",skill);
}
setupUI();

let dialogueQueue=[];
function talk(npc){
 state.dialogue=true;
 if(npc.name==="艾琳"){
   if(state.quest===0){
    dialogueQueue=[
      ["艾琳","村庄向导","你终于来了。晨雾谷最近总能听见森林深处传来奇怪的回声。"],
      ["艾琳","村庄向导","先别急着追问。去旧灯塔看看，那里是最早出现异常的地方。"],
      ["艾琳","村庄向导","如果遇到野兽，记得观察它们的行动，不要只顾着冲上去。"]
    ];
   }else{
    dialogueQueue=[
      ["艾琳","村庄向导","森林里的路最近安静了不少。可那个声音……还在。"],
      ["艾琳","村庄向导","顺着水边继续走吧。也许答案就在潮汐祭坛。"]
    ];
   }
 }else if(npc.name==="诺安"){
   dialogueQueue=[["诺安","铁匠","你的剑刃磨损得厉害。野外可不是只有风景。"],["诺安","铁匠","收集矿石和木材，我可以替你做些实用的东西。"]];
 }else if(npc.name==="米娅"){
   dialogueQueue=[["米娅","杂货商","晨雾草在湖畔也能找到。它们的花瓣在夜里会发光。"]];
 }else{
   dialogueQueue=[["莱恩","巡林者","别往北面的高地走太深。那里的岩甲兽比看起来更难对付。"]];
 }
 renderDialogue();
}
function renderDialogue(){
 if(!dialogueQueue.length){state.dialogue=false;$("dialogue")?.classList.add("hidden");return}
 const d=dialogueQueue[0];
 $("dialogueRole").textContent=d[1];$("dialogueName").textContent=d[0];$("dialogueText").textContent=d[2];
 $("dialogue").classList.remove("hidden");
}
function nextDialogue(){
 dialogueQueue.shift();
 if(!dialogueQueue.length){
   state.dialogue=false;$("dialogue").classList.add("hidden");
   if(state.quest===0){state.quest=1;notify("任务更新：清理森林中的威胁");updateQuestUI();}
 }else renderDialogue();
}

function renderTab(tab){
 const box=$("tabContent");if(!box)return;
 if(tab==="map")box.innerHTML='<div class="tab-body"><h3>晨雾谷</h3><div class="map-box" style="height:280px"><span class="map-pin" style="left:42%;top:38%"></span><span class="map-pin" style="left:69%;top:68%"></span><span class="map-pin" style="left:51%;top:49%"></span></div><div class="stat-row"><span>已探索区域</span><b>'+Math.round(exploredPercent())+'%</b></div><div class="stat-row"><span>当前位置</span><b>'+zoneAt(player.x,player.y)+'</b></div><p style="opacity:.65;line-height:1.7">穿过森林、村庄与湖畔，寻找散落在大陆上的回声。</p></div>';
 if(tab==="bag")box.innerHTML='<div class="tab-body"><h3>旅行者背包</h3>'+state.bag.map(x=>'<div class="item"><strong>'+x+'</strong><span class="tag">持有</span></div>').join("")+'<div class="stat-row"><span>金币</span><b>'+state.coins+'</b></div><div class="stat-row"><span>木材</span><b>'+state.wood+'</b></div><div class="stat-row"><span>矿石</span><b>'+state.ore+'</b></div></div>';
 if(tab==="quests")box.innerHTML='<div class="tab-body"><h3>任务记录</h3><div class="quest-row"><div><b>'+questTitle()+'</b><small>'+questHint()+'</small></div><span class="tag">进行中</span></div><div class="quest-row"><div><b>探索未知地标</b><small>发现旧灯塔、藤蔓遗迹与潮汐祭坛</small></div><span class="tag">'+landmarks.filter(l=>l.type!=="stone").length+'处</span></div></div>';
 if(tab==="settings")box.innerHTML='<div class="tab-body settings"><h3>设置</h3><label>低画质模式 <input type="checkbox" id="lowToggle" '+(state.settings.low?"checked":"")+'></label><label>屏幕震动 <input type="checkbox" id="vibToggle" checked></label><p style="opacity:.6;line-height:1.7">2D Canvas 模式不依赖 3D 引擎，适合移动设备运行。</p></div>';
 $("lowToggle")?.addEventListener("change",e=>state.settings.low=e.target.checked);
}
function exploredPercent(){
 const d=Math.hypot(player.x-980,player.y-860);
 return clamp(100-d/22,8,100);
}

function questTitle(){
 return state.quest===0?"初见晨雾谷":state.quest===1?"森林中的威胁":"回声的源头";
}
function questHint(){
 if(state.quest===0)return"与艾琳交谈，了解晨雾谷最近的异常";
 if(state.quest===1)return"击败森林中的野兽（"+state.kills+"/2）";
 return"前往潮汐祭坛，寻找回声的源头";
}
function updateQuestUI(){
 $("questTitle").textContent=questTitle();$("questHint").textContent=questHint();
}

function focusQuest(){
 updateQuestUI();
}

function worldToScreen(x,y){return{x:x-camera.x+W/2,y:y-camera.y+H/2}}
function screenToWorld(x,y){return{x:x-camera.x+W/2,y:y-camera.y+H/2}}

function drawBackground(){
 ctx.fillStyle="#708d72";ctx.fillRect(0,0,W,H);
 const sx=Math.floor(camera.x-W/2-100),sy=Math.floor(camera.y-H/2-100);
 // broad zone overlays
 ctx.save();ctx.translate(W/2-camera.x,H/2-camera.y);
 ctx.fillStyle="#678666";ctx.fillRect(0,0,950,world.h);
 ctx.fillStyle="#81976d";ctx.fillRect(2050,0,950,900);
 ctx.fillStyle="#789581";ctx.fillRect(1700,1250,1300,950);
 // lake
 const grad=ctx.createLinearGradient(1800,1350,2700,2200);grad.addColorStop(0,"#477e8c");grad.addColorStop(1,"#285f72");
 ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(2320,1770,620,480,0,0,Math.PI*2);ctx.fill();
 // shore
 ctx.strokeStyle="#c8bd8b";ctx.lineWidth=18;ctx.globalAlpha=.55;ctx.stroke();
 // roads
 ctx.globalAlpha=1;ctx.strokeStyle="#c0a679";ctx.lineWidth=48;ctx.beginPath();ctx.moveTo(-100,1050);ctx.quadraticCurveTo(1300,960,3100,1100);ctx.stroke();
 ctx.strokeStyle="#d3bc91";ctx.lineWidth=32;ctx.beginPath();ctx.moveTo(1180,-50);ctx.quadraticCurveTo(1250,650,1180,2250);ctx.stroke();
 ctx.restore();
 // texture dots
 ctx.globalAlpha=.11;for(let i=0;i<130;i++){const x=hash(i,3)*W,y=hash(i,7)*H;ctx.fillStyle=i%2?"#fff":"#244d38";ctx.fillRect(x,y,2,2)}ctx.globalAlpha=1;
}

function drawTree(t){
 const s=worldToScreen(t.x,t.y);if(s.x<-60||s.x>W+60||s.y<-100||s.y>H+100)return;
 const q=t.s;
 ctx.save();ctx.translate(s.x,s.y);
 ctx.fillStyle="#0005";ctx.beginPath();ctx.ellipse(0,16*q,25*q,9*q,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=t.variant===0?"#4d6f4c":t.variant===1?"#3f6848":"#56794f";
 ctx.beginPath();ctx.arc(0,-18*q,25*q,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#6d8d59";ctx.beginPath();ctx.arc(-12*q,-29*q,17*q,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#385c43";ctx.beginPath();ctx.arc(13*q,-25*q,16*q,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#6d503b";ctx.fillRect(-5*q,-2*q,10*q,25*q);
 ctx.restore();
}
function drawRock(r){
 const s=worldToScreen(r.x,r.y);if(s.x<-40||s.x>W+40||s.y<-40||s.y>H+40)return;
 ctx.save();ctx.translate(s.x,s.y);ctx.rotate(r.rot);ctx.fillStyle="#0004";ctx.beginPath();ctx.ellipse(0,7*r.s,18*r.s,7*r.s,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#777b76";ctx.beginPath();ctx.moveTo(-16*r.s,5*r.s);ctx.lineTo(-8*r.s,-11*r.s);ctx.lineTo(8*r.s,-15*r.s);ctx.lineTo(18*r.s,-1*r.s);ctx.lineTo(8*r.s,10*r.s);ctx.closePath();ctx.fill();
 ctx.fillStyle="#969b91";ctx.beginPath();ctx.moveTo(-8*r.s,-11*r.s);ctx.lineTo(8*r.s,-15*r.s);ctx.lineTo(2*r.s,-2*r.s);ctx.lineTo(-9*r.s,-2*r.s);ctx.closePath();ctx.fill();ctx.restore();
}
function drawResource(r){
 if(r.taken)return;
 const s=worldToScreen(r.x,r.y);if(s.x<-30||s.x>W+30||s.y<-30||s.y>H+30)return;
 const pulse=1+Math.sin(performance.now()/500+r.phase)*.12;
 ctx.save();ctx.translate(s.x,s.y);
 ctx.fillStyle="#0004";ctx.beginPath();ctx.ellipse(0,8,13,5,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=r.type==="ore"?"#7d8e9b":r.type==="wood"?"#7b5d42":"#6d9b69";
 if(r.type==="ore"){ctx.beginPath();ctx.moveTo(-10,5);ctx.lineTo(-5,-12);ctx.lineTo(5,-18);ctx.lineTo(13,-3);ctx.lineTo(5,8);ctx.closePath();ctx.fill();}
 else if(r.type==="wood"){ctx.fillRect(-5,-15,10,25);ctx.beginPath();ctx.arc(-9,-14,9,0,Math.PI*2);ctx.arc(8,-10,10,0,Math.PI*2);ctx.fill();}
 else {for(let i=0;i<5;i++){const a=i*1.25;ctx.beginPath();ctx.ellipse(Math.cos(a)*7,-7+Math.sin(a)*5,5,9,a,0,Math.PI*2);ctx.fill()}}
 if(dist(player,r)<58){ctx.fillStyle="#fff";ctx.font="11px sans-serif";ctx.textAlign="center";ctx.shadowColor="#000";ctx.shadowBlur=5;ctx.fillText("E 采集",0,28)}
 ctx.restore();
}
function drawChest(ch){
 const s=worldToScreen(ch.x,ch.y);if(s.x<-40||s.x>W+40||s.y<-40||s.y>H+40)return;
 ctx.save();ctx.translate(s.x,s.y);ctx.fillStyle="#0005";ctx.fillRect(-18,7,36,8);
 ctx.fillStyle=ch.opened?"#6e5d45":"#9a663d";ctx.fillRect(-20,-8,40,20);
 ctx.fillStyle=ch.opened?"#806d53":"#c18a4e";ctx.fillRect(-20,-15,40,10);
 ctx.fillStyle="#e2c56d";ctx.fillRect(-3,-4,6,10);
 if(ch.rare){ctx.shadowColor="#f1d16c";ctx.shadowBlur=18;ctx.fillStyle="#f0d16f";ctx.beginPath();ctx.arc(0,-20,4+Math.sin(performance.now()/300)*1.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
 if(!ch.opened&&dist(player,ch)<65){ctx.fillStyle="#fff";ctx.font="11px sans-serif";ctx.textAlign="center";ctx.fillText("E 开启",0,32)}
 ctx.restore();
}
function drawBoss(){
 if(!boss||boss.dead)return;
 const s=worldToScreen(boss.x,boss.y);if(s.x<-150||s.x>W+150||s.y<-150||s.y>H+150)return;
 const pulse=1+Math.sin(performance.now()/260)*.04;
 ctx.save();ctx.translate(s.x,s.y);ctx.scale(pulse,pulse);
 ctx.fillStyle="#0007";ctx.beginPath();ctx.ellipse(0,46,76,24,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#514c59";ctx.beginPath();ctx.moveTo(-70,25);ctx.lineTo(-55,-45);ctx.lineTo(-20,-72);ctx.lineTo(0,-55);ctx.lineTo(30,-78);ctx.lineTo(66,-38);ctx.lineTo(75,28);ctx.lineTo(30,55);ctx.lineTo(-30,55);ctx.closePath();ctx.fill();
 ctx.fillStyle="#796a7b";ctx.beginPath();ctx.moveTo(-42,-45);ctx.lineTo(-20,-92);ctx.lineTo(-5,-52);ctx.lineTo(-25,-28);ctx.closePath();ctx.fill();
 ctx.beginPath();ctx.moveTo(25,-48);ctx.lineTo(48,-88);ctx.lineTo(52,-34);ctx.lineTo(34,-20);ctx.closePath();ctx.fill();
 ctx.fillStyle="#e36a61";ctx.shadowColor="#e36a61";ctx.shadowBlur=14;ctx.beginPath();ctx.arc(-23,-27,6,0,Math.PI*2);ctx.arc(23,-27,6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle="#d6b56d";ctx.beginPath();ctx.moveTo(-8,-3);ctx.lineTo(0,14);ctx.lineTo(8,-3);ctx.closePath();ctx.fill();
 ctx.restore();
 const bw=150;ctx.fillStyle="#0009";ctx.fillRect(s.x-bw/2,s.y-115,bw,8);ctx.fillStyle="#c85e67";ctx.fillRect(s.x-bw/2,s.y-115,bw*clamp(boss.hp/boss.max,0,1),8);
 ctx.fillStyle="#fff";ctx.font="bold 12px sans-serif";ctx.textAlign="center";ctx.fillText("暮岩古龙 · Lv. 12",s.x,s.y-125);
}
function drawGate(g){
 const s=worldToScreen(g.x,g.y);ctx.save();ctx.translate(s.x,s.y);
 ctx.strokeStyle=g.open?"#91c7a0":"#615f65";ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-32,25);ctx.lineTo(-32,-30);ctx.quadraticCurveTo(0,-62,32,-30);ctx.lineTo(32,25);ctx.stroke();
 if(!g.open){ctx.strokeStyle="#c29d62";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-18,20);ctx.lineTo(18,-20);ctx.moveTo(18,20);ctx.lineTo(-18,-20);ctx.stroke()}
 ctx.restore();
}
function drawFlower(f){
 const s=worldToScreen(f.x,f.y);if(s.x<0||s.x>W||s.y<0||s.y>H)return;
 ctx.fillStyle=f.c;ctx.globalAlpha=.75;ctx.beginPath();ctx.arc(s.x,s.y,2.3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
}
function drawBuilding(b){
 const s=worldToScreen(b.x,b.y);if(s.x<-180||s.x>W+180||s.y<-150||s.y>H+150)return;
 ctx.save();ctx.translate(s.x,s.y);
 ctx.fillStyle="#0004";ctx.fillRect(-b.w/2+8,-b.h/2+10,b.w,b.h);
 if(b.type==="well"){
   ctx.fillStyle="#8d765c";ctx.beginPath();ctx.arc(0,0,38,0,Math.PI*2);ctx.fill();
   ctx.fillStyle="#416c78";ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.fill();
 }else{
   ctx.fillStyle=b.type==="hall"?"#d7c39a":"#cbb18a";ctx.fillRect(-b.w/2,-b.h/2,b.w,b.h);
   ctx.fillStyle=b.type==="hall"?"#745047":"#80564d";ctx.beginPath();ctx.moveTo(-b.w/2-12,-b.h/2);ctx.lineTo(0,-b.h/2-55);ctx.lineTo(b.w/2+12,-b.h/2);ctx.closePath();ctx.fill();
   ctx.fillStyle="#4b3832";ctx.fillRect(-13,b.h/2-42,26,42);
   ctx.fillStyle="#9ec1c2";ctx.fillRect(-b.w/2+18,-b.h/2+25,24,20);ctx.fillRect(b.w/2-42,-b.h/2+25,24,20);
 }
 if(b.name&&b.type!=="house"){ctx.font="12px 'Noto Serif SC',sans-serif";ctx.textAlign="center";ctx.fillStyle="#fff";ctx.shadowColor="#000";ctx.shadowBlur=5;ctx.fillText(b.name,0,b.h/2+25)}
 ctx.restore();
}

function drawLandmark(l){
 if(l.type==="stone")return;
 const s=worldToScreen(l.x,l.y);if(s.x<-100||s.x>W+100||s.y<-100||s.y>H+100)return;
 ctx.save();ctx.translate(s.x,s.y);
 ctx.fillStyle="#0004";ctx.beginPath();ctx.ellipse(0,22,42,13,0,0,Math.PI*2);ctx.fill();
 if(l.type==="shrine"){
   ctx.fillStyle="#8d8170";ctx.fillRect(-42,0,84,22);ctx.fillRect(-28,-18,56,18);
   ctx.fillStyle="#d9c36f";ctx.shadowColor="#ffe18a";ctx.shadowBlur=20;ctx.beginPath();ctx.moveTo(0,-65);ctx.lineTo(24,-22);ctx.lineTo(0,5);ctx.lineTo(-24,-22);ctx.closePath();ctx.fill();
 }else{
   ctx.fillStyle="#806e5c";ctx.fillRect(-22,-72,44,94);
   ctx.fillStyle="#9b896e";ctx.fillRect(-35,-84,70,18);ctx.fillStyle="#bba37c";ctx.fillRect(-14,-50,28,8);
   if(l.name==="旧灯塔"){ctx.fillStyle="#e6c66d";ctx.shadowColor="#ffd873";ctx.shadowBlur=25;ctx.beginPath();ctx.arc(0,-60,8,0,Math.PI*2);ctx.fill()}
 }
 if(dist(player,l)<100){ctx.font="13px 'Noto Serif SC'";ctx.textAlign="center";ctx.fillStyle="#fff";ctx.shadowColor="#000";ctx.shadowBlur=6;ctx.fillText(l.name,0,-100)}
 ctx.restore();
}

function drawNPC(n){
 const bob=Math.sin(performance.now()/500+n.phase)*2;
 const s=worldToScreen(n.x,n.y);if(s.x<-40||s.x>W+40||s.y<-70||s.y>H+70)return;
 ctx.save();ctx.translate(s.x,s.y+bob);
 ctx.fillStyle="#0005";ctx.beginPath();ctx.ellipse(0,18,18,7,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=n.color;ctx.beginPath();ctx.arc(0,-6,15,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#f0c9a0";ctx.beginPath();ctx.arc(0,-25,11,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#493b38";ctx.beginPath();ctx.arc(0,-29,11,Math.PI,Math.PI*2);ctx.fill();
 if(dist(player,n)<90){ctx.fillStyle="#fff";ctx.font="12px 'Noto Serif SC'";ctx.textAlign="center";ctx.shadowColor="#000";ctx.shadowBlur=5;ctx.fillText(n.name,0,-45);ctx.fillStyle="#e7c36f";ctx.font="10px sans-serif";ctx.fillText("E 互动",0,-31)}
 ctx.restore();
}

function drawEnemy(e){
 if(e.dead)return;const s=worldToScreen(e.x,e.y);if(s.x<-60||s.x>W+60||s.y<-60||s.y>H+60)return;
 const r=e.type==="岩甲兽"?25:20;
 ctx.save();ctx.translate(s.x,s.y);
 ctx.fillStyle="#0005";ctx.beginPath();ctx.ellipse(0,r*.55,r*1.1,r*.4,0,0,Math.PI*2);ctx.fill();
 if(e.type==="岩甲兽"){
   ctx.fillStyle="#66706e";ctx.beginPath();ctx.moveTo(-28,10);ctx.lineTo(-19,-22);ctx.lineTo(0,-31);ctx.lineTo(23,-18);ctx.lineTo(29,12);ctx.lineTo(10,25);ctx.lineTo(-16,22);ctx.closePath();ctx.fill();
   ctx.fillStyle="#8c9690";ctx.beginPath();ctx.moveTo(-12,-22);ctx.lineTo(3,-28);ctx.lineTo(13,-12);ctx.lineTo(-5,-9);ctx.closePath();ctx.fill();
 }else{
   ctx.fillStyle="#574c48";ctx.beginPath();ctx.ellipse(0,2,24,15,0,0,Math.PI*2);ctx.fill();
   ctx.fillStyle="#6c5b54";ctx.beginPath();ctx.moveTo(-19,-4);ctx.lineTo(-24,-25);ctx.lineTo(-7,-13);ctx.lineTo(4,-24);ctx.lineTo(13,-7);ctx.closePath();ctx.fill();
   ctx.fillStyle="#d65f55";ctx.fillRect(-10,-1,5,3);ctx.fillRect(5,-1,5,3);
 }
 if(e.hit>0){ctx.strokeStyle="#ffe6a0";ctx.lineWidth=3;ctx.strokeRect(-r-4,-r-4,r*2+8,r*2+8)}
 ctx.restore();
 // hp
 if(e.hp<e.max){const w=48;ctx.fillStyle="#0008";ctx.fillRect(s.x-w/2,s.y-r-13,w,4);ctx.fillStyle="#d9685d";ctx.fillRect(s.x-w/2,s.y-r-13,w*clamp(e.hp/e.max,0,1),4)}
}

function drawPlayer(){
 const s=worldToScreen(player.x,player.y);ctx.save();ctx.translate(s.x,s.y);
 const bob=Math.sin(player.walk)*2;
 ctx.fillStyle="#0006";ctx.beginPath();ctx.ellipse(0,20,22,8,0,0,Math.PI*2);ctx.fill();
 ctx.translate(0,bob);
 ctx.fillStyle="#182a35";ctx.beginPath();ctx.moveTo(-18,15);ctx.lineTo(-13,-12);ctx.lineTo(0,-23);ctx.lineTo(14,-12);ctx.lineTo(18,15);ctx.closePath();ctx.fill();
 ctx.fillStyle="#d8bd7c";ctx.beginPath();ctx.arc(0,-27,12,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#3b3432";ctx.beginPath();ctx.arc(0,-31,12,Math.PI,Math.PI*2);ctx.fill();
 ctx.fillStyle="#e5cc8a";ctx.fillRect(-17,-2,34,4);
 // sword
 ctx.save();ctx.rotate(player.dir);ctx.strokeStyle="#e9edf0";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(38,0);ctx.stroke();ctx.strokeStyle="#b48b4d";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(10,-7);ctx.lineTo(10,7);ctx.stroke();ctx.restore();
 if(player.attack>0){ctx.save();ctx.rotate(player.dir);ctx.strokeStyle="rgba(238,211,125,"+clamp(player.attack*4,0,1)+")";ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,47,-.8,.8);ctx.stroke();ctx.restore()}
 ctx.restore();
}

function drawParticles(){
 for(const p of particles){const s=worldToScreen(p.x,p.y);ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(s.x,s.y,p.size,0,Math.PI*2);ctx.fill()}
 ctx.globalAlpha=1;
 for(const t of texts){const s=worldToScreen(t.x,t.y);ctx.globalAlpha=clamp(t.life,0,1);ctx.font="bold 15px sans-serif";ctx.textAlign="center";ctx.fillStyle=t.color;ctx.fillText(t.text,s.x,s.y)}
 ctx.globalAlpha=1;
}

function emit(x,y,color="#f0c66f",n=12){
 for(let i=0;i<n;i++)particles.push({x,y,vx:rnd(-70,70),vy:rnd(-100,20),life:rnd(.35,.8),max:.8,size:rnd(1,4),color});
}
function floatText(x,y,text,color="#f5d27e"){texts.push({x,y,text,color,life:1.1})}

function blocked(x,y){
 if(x<35||y<35||x>world.w-35||y>world.h-35)return true;
 if(isLake(x,y))return true;
 for(const b of buildings){if(b.type!=="well"&&Math.abs(x-b.x)<b.w/2+22&&Math.abs(y-b.y)<b.h/2+22)return true}
 for(const t of trees){if(Math.hypot(x-t.x,y-t.y)<20*t.s+10)return true}
 for(const r of rocks){if(Math.hypot(x-r.x,y-r.y)<18*r.s+10)return true}
 for(const g of gates){if(!g.open&&Math.hypot(x-g.x,y-g.y)<42)return true}
 return false;
}
function move(){
 if(!state.started||state.dialogue)return;
 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
 let dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(dx||dy){
   const len=Math.hypot(dx,dy);dx/=len;dy/=len;
   const sprint=keys.shift&&player.stamina>3;
   const speed=player.speed*(sprint?1.72:1);
   const nx=player.x+dx*speed/60,ny=player.y+dy*speed/60;
   if(!blocked(nx,player.y))player.x=nx;
   if(!blocked(player.x,ny))player.y=ny;
   player.dir=Math.atan2(dy,dx);player.walk+=.25;
   if(sprint)player.stamina-=.7;else player.stamina=Math.min(100,player.stamina+.25);
 }else player.stamina=Math.min(100,player.stamina+.55);
 player.x=clamp(player.x,35,world.w-35);player.y=clamp(player.y,35,world.h-35);
}

function gainXp(v){
 state.xp+=v;
 while(state.xp>=state.nextXp){
   state.xp-=state.nextXp;state.level++;state.nextXp=Math.floor(state.nextXp*1.28);
   state.maxHp+=55;state.hp=state.maxHp;state.equipment.power+=12;
   notify("升级！ Lv."+state.level+" · 攻击力 +12");emit(player.x,player.y,"#f0cf72",24);
 }
}
function attack(){
 if(!state.started||state.dialogue||player.attack>0)return;
 let target=null,best=90;
 for(const e of enemies)if(!e.dead){const d=dist(player,e);if(d<best){best=d;target=e}}
 if(!target){emit(player.x+Math.cos(player.dir)*25,player.y+Math.sin(player.dir)*25,"#d9c17a",4);return}
 const damage=state.equipment.power;
 if(boss&&boss.active&&!boss.dead&&dist(player,boss)<115){
   boss.hp-=damage;boss.hit=.15;player.attack=.32;emit(boss.x,boss.y,"#f4d18a",14);floatText(boss.x,boss.y-90,"-"+damage,"#ffe1a1");
   if(boss.hp<=0){boss.dead=true;state.defeatedBoss=true;state.coins+=600;gainXp(520);state.bag.push("古龙核心");notify("暮岩古龙已击败！获得古龙核心");saveGame();}
   return;
 }
 target.hp-=damage;target.hit=.15;player.attack=.32;emit(target.x,target.y,"#f4d18a",10);floatText(target.x,target.y-32,"-"+damage,"#ffe1a1");
 if(target.hp<=0){target.dead=true;state.kills++;state.coins+=18;state.wood+=Math.random()<.35?1:0;floatText(target.x,target.y-50,"+18 金币","#f2d074");notify("击败 "+target.type);
   if(state.quest===1&&state.kills>=2){state.quest=2;notify("任务更新：前往潮汐祭坛");}
   updateQuestUI();
 }
}

function skill(){
 if(!state.started||state.dialogue||state.stamina<30)return;
 state.stamina-=30;player.attack=.5;
 emit(player.x,player.y,"#79c8d4",35);
 for(const e of enemies)if(!e.dead&&dist(player,e)<105){e.hp-=150;e.hit=.25;floatText(e.x,e.y-35,"元素爆发 -150","#8ee5ed");if(e.hp<=0){e.dead=true;state.kills++;state.coins+=18}}
 if(state.quest===1&&state.kills>=2){state.quest=2;notify("任务更新：前往潮汐祭坛");updateQuestUI()}
}

function dash(){
 if(!state.started||state.dialogue||player.stamina<22)return;
 let dx=(keys.d?1:0)-(keys.a?1:0),dy=(keys.s?1:0)-(keys.w?1:0);
 if(!dx&&!dy){dx=Math.cos(player.dir);dy=Math.sin(player.dir)}
 const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
 player.x=clamp(player.x+dx*115,35,world.w-35);player.y=clamp(player.y+dy*115,35,world.h-35);
 player.stamina-=22;player.inv=.35;emit(player.x,player.y,"#d7c47d",18);
}

function interact(){
 if(!state.started||state.dialogue)return;
 for(const r of resources){
   if(!r.taken&&dist(player,r)<58){
     r.taken=true;
     if(r.type==="ore"){state.ore++;state.bag.push("铁矿 ×1");notify("获得铁矿 ×1");}
     else if(r.type==="wood"){state.wood++;state.bag.push("木材 ×1");notify("获得木材 ×1");}
     else {state.herbs++;state.bag.push("晨雾草 ×1");notify("获得晨雾草 ×1");}
     emit(r.x,r.y,"#d6c27d",12);saveGame();return;
   }
 }
 for(const ch of chests){
   if(!ch.opened&&dist(player,ch)<65){
     ch.opened=true;state.chestsOpened++;
     if(ch.rare){state.equipment.power+=35;state.bag.push("古代剑刃");state.coins+=120;notify("开启稀有宝箱：古代剑刃 · 攻击力 +35");}
     else {state.coins+=35;state.herbs++;state.bag.push("治疗药草 ×1");notify("开启宝箱：获得 35 金币与药草");}
     emit(ch.x,ch.y,"#f0d47e",26);saveGame();return;
   }
 }
 for(const g of gates){
   if(dist(player,g)<72){
     if(g.open){notify(g.name+"已经开启");return}
     if(state.level>=8||state.ore>=3){g.open=true;notify(g.name+"已开启");emit(g.x,g.y,"#7dd1cf",22);saveGame();}
     else notify(g.name+"需要 Lv.8 或 3块矿石");
     return;
   }
 }
 let best=null,bd=95;
 for(const n of npcs){const d=dist(player,n);if(d<bd){bd=d;best=n}}
 if(best){talk(best);return}
 for(const l of landmarks){if(l.type!=="stone"&&dist(player,l)<100){if(l.type==="boss"&&!boss.dead){boss.active=true;notify("暮岩古龙苏醒了");emit(l.x,l.y,"#d8666a",30);return}notify(l.name+"：这里似乎留下了某种回声");emit(l.x,l.y,"#dfc56e",16);if(l.name==="潮汐祭坛"&&state.quest===2){state.quest=3;state.coins+=80;notify("任务完成：回声的源头");state.bag.push("回声碎片");updateQuestUI()}return}}
 for(const b of buildings){if(b.name&&dist(player,b)<90){notify(b.name+"：一座安静的建筑");return}}
}

function updateBoss(dt){
 if(!boss||boss.dead)return;
 const d=dist(player,boss);
 if(d<520&&state.started&&!state.dialogue){
   boss.active=true;boss.phase+=dt;boss.attackCd-=dt;
   const dx=(player.x-boss.x)/(d||1),dy=(player.y-boss.y)/(d||1);
   if(d>115){boss.x+=dx*22*dt;boss.y+=dy*22*dt}
   if(d<150&&boss.attackCd<=0&&player.inv<=0){
     boss.attackCd=1.5;state.hp-=38;player.inv=.9;floatText(player.x,player.y-45,"-38","#ef8b7f");emit(player.x,player.y,"#c45e6a",14);updateHP();
   }
   if(Math.sin(boss.phase*1.7)>0.985)emit(boss.x+dx*50,boss.y+dy*50,"#d8666a",16);
 }
}
function updateEnemies(dt){
 for(const e of enemies){
   if(e.dead)continue;e.hit=Math.max(0,e.hit-dt);
   const d=dist(player,e);
   if(d<310&&!state.dialogue){
     const dx=(player.x-e.x)/(d||1),dy=(player.y-e.y)/(d||1);
     const sp=e.type==="岩甲兽"?34:52;
     if(d>48){e.x+=dx*sp*dt;e.y+=dy*sp*dt}
     if(d<52&&player.inv<=0){state.hp-=e.type==="岩甲兽"?24:12;player.inv=.8;floatText(player.x,player.y-40,"-"+(e.type==="岩甲兽"?24:12),"#ef8b7f");emit(player.x,player.y,"#d9675e",8);updateHP()}
   }else{
     e.phase+=dt; e.x=e.homeX+Math.sin(e.phase*.55)*28;e.y=e.homeY+Math.cos(e.phase*.45)*22;
   }
 }
}
function updateHP(){
 const p=clamp(state.hp/state.maxHp,0,1);$("hpFill").style.width=(p*100)+"%";$("hpText").textContent=Math.max(0,Math.ceil(state.hp))+" / "+state.maxHp;
 if(state.hp<=0){state.hp=state.maxHp;player.x=1260;player.y=850;notify("你在村庄醒来，旅途还没有结束");}
}
function updateInteraction(){
 let near=null,bd=90;
 for(const r of resources)if(!r.taken&&dist(player,r)<bd){bd=dist(player,r);near=r}
 for(const ch of chests)if(!ch.opened&&dist(player,ch)<bd){bd=dist(player,ch);near=ch}
 for(const g of gates)if(dist(player,g)<bd){bd=dist(player,g);near=g}

 [...npcs,...landmarks,...buildings].forEach(o=>{if(o.name){const d=dist(player,o);if(d<bd){bd=d;near=o}}});
 const box=$("interact");
 if(near){box.classList.remove("hidden");$("interactName").textContent=near.name||({ore:"铁矿",wood:"木材",herb:"晨雾草"}[near.type]||"宝箱")}else box.classList.add("hidden");
 $("combat").classList.add("hidden");
 let en=enemies.find(e=>!e.dead&&dist(player,e)<170);
 if(en){$("combat").classList.remove("hidden");$("enemyName").textContent=en.type;$("enemyLevel").textContent=en.type==="岩甲兽"?"Lv. 8":"Lv. 5";$("enemyHp").style.width=(100*en.hp/en.max)+"%"}
}
function updateCamera(){
 const tx=clamp(player.x, W/2, world.w-W/2),ty=clamp(player.y,H/2,world.h-H/2);
 camera.x+=(tx-camera.x)*.12;camera.y+=(ty-camera.y)*.12;
}
function updateParticles(dt){
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=100*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1)}
 for(let i=texts.length-1;i>=0;i--){texts[i].y-=24*dt;texts[i].life-=dt;if(texts[i].life<=0)texts.splice(i,1)}
}

function drawAtmosphere(){
 const hour=state.time%24;
 let night=hour<5.5||hour>19;
 if(night){
   ctx.fillStyle="rgba(15,27,58,.48)";ctx.fillRect(0,0,W,H);
   for(const f of fireflies){const s=worldToScreen(f.x,f.y);if(s.x<0||s.x>W||s.y<0||s.y>H)continue;const a=.35+.3*Math.sin(performance.now()/700+f.p);ctx.globalAlpha=a;ctx.fillStyle="#f1df8b";ctx.shadowColor="#f1df8b";ctx.shadowBlur=10;ctx.beginPath();ctx.arc(s.x,s.y,1.7*f.s,0,Math.PI*2);ctx.fill()}ctx.shadowBlur=0;ctx.globalAlpha=1;
 }else if(hour<8||hour>17){
   ctx.fillStyle="rgba(235,180,105,.14)";ctx.fillRect(0,0,W,H);
 }
}
function saveGame(){
 localStorage.setItem("etheria-save",JSON.stringify({
  state:{hp:state.hp,maxHp:state.maxHp,stamina:state.stamina,time:state.time,coins:state.coins,wood:state.wood,ore:state.ore,herbs:state.herbs,quest:state.quest,kills:state.kills,bag:state.bag,equipment:state.equipment,chestsOpened:state.chestsOpened,level:state.level,xp:state.xp,nextXp:state.nextXp,defeatedBoss:state.defeatedBoss},
  player:{x:player.x,y:player.y}
 }));
}
function loadGame(){
 try{
  const s=JSON.parse(localStorage.getItem("etheria-save")||"null");if(!s)return;
  Object.assign(state,s.state||{});Object.assign(player,s.player||{});
  let n=0;for(const ch of chests)if(ch.opened)n++;
  chests.slice(0,n).forEach(x=>x.opened=true);
  updateHP();updateQuestUI();notify("已恢复上次旅程");
 }catch(e){}
}
function updateClock(dt){
 state.time=(state.time+dt*.22)%24;
 const hh=Math.floor(state.time),mm=Math.floor((state.time-hh)*60);
 $("clock").textContent=String(hh).padStart(2,"0")+":"+String(mm).padStart(2,"0");
 $("regionName").textContent=zoneAt(player.x,player.y);
 $("weatherDot").style.background=state.time>19||state.time<6?"#8299d6":"#dfc77e";
}

function render(){
 ctx.clearRect(0,0,W,H);
 drawBackground();
 // depth sort
 const list=[
  ...trees.map(x=>({y:x.y,fn:()=>drawTree(x)})),
  ...rocks.map(x=>({y:x.y,fn:()=>drawRock(x)})),
  ...flowers.map(x=>({y:x.y,fn:()=>drawFlower(x)})),
  ...resources.filter(x=>!x.taken).map(x=>({y:x.y,fn:()=>drawResource(x)})),
  ...chests.map(x=>({y:x.y,fn:()=>drawChest(x)})),
  ...gates.map(x=>({y:x.y,fn:()=>drawGate(x)})),
  ...buildings.map(x=>({y:x.y,fn:()=>drawBuilding(x)})),
  ...(boss&&!boss.dead?[{y:boss.y,fn:drawBoss}]:[]),
  ...landmarks.map(x=>({y:x.y,fn:()=>drawLandmark(x)})),
  ...npcs.map(x=>({y:x.y,fn:()=>drawNPC(x)})),
  ...enemies.filter(e=>!e.dead).map(x=>({y:x.y,fn:()=>drawEnemy(x)})),
  {y:player.y,fn:drawPlayer}
 ];
 list.sort((a,b)=>a.y-b.y);for(const o of list)o.fn();
 drawParticles();drawAtmosphere();
 // quest direction marker
 if(state.started&&state.quest===2){
   const target=landmarks.find(x=>x.name==="潮汐祭坛");if(target){
     const dx=target.x-player.x,dy=target.y-player.y,ang=Math.atan2(dy,dx);
     const cx=W/2+Math.cos(ang)*Math.min(W,H)*.32,cy=H/2+Math.sin(ang)*Math.min(W,H)*.32;
     ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);ctx.fillStyle="#e4c16f";ctx.shadowColor="#e4c16f";ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-10,-9);ctx.lineTo(-6,0);ctx.lineTo(-10,9);ctx.closePath();ctx.fill();ctx.restore();
   }
 }
}

function loop(t){
 const dt=Math.min(.033,(t-(loop.last||t))/1000);loop.last=t;
 move();updateEnemies(dt);updateBoss(dt);updateParticles(dt);updateCamera();
 player.attack=Math.max(0,player.attack-dt);player.inv=Math.max(0,player.inv-dt);
 updateClock(dt);updateInteraction();render();
 requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

addEventListener("keydown",e=>{
 const k=e.key.toLowerCase();keys[k]=true;
 if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(k))e.preventDefault();
 if(k==="e")interact();if(k==="q")skill();if(k==="k")saveGame();if(k===" "){attack()}
 if(k==="escape"){$("menu")?.classList.add("hidden");$("dialogue")?.classList.add("hidden");state.dialogue=false}
});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

canvas.addEventListener("mousemove",e=>{mouse.x=e.clientX;mouse.y=e.clientY});
canvas.addEventListener("mousedown",e=>{mouse.down=true;if(state.started&&e.button===0)attack()});
addEventListener("mouseup",()=>mouse.down=false);
canvas.addEventListener("click",e=>{
 if(!state.started||state.dialogue)return;
 const p=screenToWorld(e.clientX,e.clientY);player.dir=Math.atan2(p.y-player.y,p.x-player.x);
});

let joyTouch=null,joyOrigin=null;
const joy=$("joy"),JOY_R=48,JOY_DEAD=.12;
function setJoy(dx,dy){
 const d=Math.hypot(dx,dy)||1,mag=Math.min(d,JOY_R),nx=dx/d,ny=dy/d;
 const usable=Math.max(0,mag-JOY_R*JOY_DEAD)/(JOY_R*(1-JOY_DEAD));
 const ux=nx*usable,uy=ny*usable;
 keys.a=ux<-.08;keys.d=ux>.08;keys.w=uy<-.08;keys.s=uy>.08;
 const dot=joy?.querySelector("i");
 if(dot)dot.style.transform="translate("+nx*mag+"px,"+ny*mag+"px)";
}
joy?.addEventListener("pointerdown",e=>{
 if(!state.started)return;
 joyTouch=e.pointerId;joyOrigin={x:e.clientX,y:e.clientY};
 joy.setPointerCapture?.(e.pointerId);joy.classList.add("active");
 setJoy(0,0);e.preventDefault();
},{passive:false});
joy?.addEventListener("pointermove",e=>{
 if(e.pointerId!==joyTouch||!joyOrigin)return;
 setJoy(e.clientX-joyOrigin.x,e.clientY-joyOrigin.y);e.preventDefault();
},{passive:false});
function endJoy(){
 joyTouch=null;joyOrigin=null;joy?.classList.remove("active");
 ["a","d","w","s"].forEach(k=>keys[k]=false);
 const dot=joy?.querySelector("i");if(dot)dot.style.transform="";
}
joy?.addEventListener("pointerup",endJoy);
joy?.addEventListener("pointercancel",endJoy);
joy?.addEventListener("lostpointercapture",endJoy);

updateQuestUI();updateHP();
function enterImmersiveMobile(){
 if(innerWidth>900&&!matchMedia("(pointer:coarse)").matches)return;
 if(document.documentElement.requestFullscreen&&!document.fullscreenElement){
   document.documentElement.requestFullscreen({navigationUI:"hide"}).catch(()=>{});
 }
 if(screen.orientation?.lock)screen.orientation.lock("landscape").catch(()=>{});
}
function startGame(){
 if(state.started)return;
 state.started=true;
 $("start")?.classList.add("hidden");
 $("hud")?.classList.remove("hidden");
 document.body.classList.add("game-running");
 enterImmersiveMobile();
 $("mobileControls")?.classList.remove("hidden");
 loadGame();
 notify("欢迎来到晨雾谷");
 focusQuest();
 syncMobileUI();
}
$("startBtn")?.addEventListener("click",startGame);
$("attackBtn")?.addEventListener("pointerdown",e=>{e.preventDefault();attack()},{passive:false});
$("dashBtn")?.addEventListener("pointerdown",e=>{e.preventDefault();dash()},{passive:false});
$("skillBtn")?.addEventListener("pointerdown",e=>{e.preventDefault();skill()},{passive:false});
$("menuBtn")?.addEventListener("click",()=>{$("menu")?.classList.remove("hidden");renderTab("map")});
$("closeMenu")?.addEventListener("click",()=>{$("menu")?.classList.add("hidden")});
addEventListener("fullscreenchange",syncMobileUI);
addEventListener("resize",()=>{if(state.started&&(innerWidth<=900||matchMedia("(pointer:coarse)").matches))enterImmersiveMobile()});

function syncMobileUI(){
 const mobile=innerWidth<=900||matchMedia("(pointer:coarse)").matches;
 if(mobile)$("mobileControls")?.classList.remove("hidden");else $("mobileControls")?.classList.add("hidden");
 $("rotateHint")?.classList.toggle("show",mobile&&matchMedia("(orientation: portrait)").matches&&state.started);
}
addEventListener("resize",syncMobileUI);
addEventListener("orientationchange",()=>setTimeout(syncMobileUI,120));
syncMobileUI();