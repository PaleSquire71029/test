import{UPGRADES,LORE,ENDINGS,REGIONS}from"./data.js";import{loadSave,saveGame,defaults,makeExport,parseImport,clearSave,saveLabel}from"./save.js";import{TASKS,STORY,initStory,applyChoice,nodesAtWave,getEnding,canShow}from"./story.js";
const $=id=>document.getElementById(id),c=$("game"),x=c.getContext("2d");let W,H,d=1,last=0,run=0,pause=0,wave=1,spawn=0,wait=0,shake=0,bossLive=0,player,en=[],shots=[],loot=[],fx=[],keys={},mouse={x:0,y:0,down:0},move={x:0,y:0},aim={x:1,y:0,active:0},dashOK=1,dashT=0,skillT=0,saveDirty=0;const save=initStory(loadSave());let secret=!!save.flags.secretUnlocked,found=!!save.flags.secretFound;
function resize(){W=innerWidth;H=innerHeight;d=Math.min(devicePixelRatio||1,2);c.width=W*d;c.height=H*d;x.setTransform(d,0,0,d,0,0)}addEventListener("resize",resize);resize();
const vib=p=>save.settings.vibrate&&navigator.vibrate&&navigator.vibrate(p),R=(a,b)=>a+Math.random()*(b-a),N=(a,b)=>{let l=Math.hypot(a,b)||1;return{x:a/l,y:b/l}},D=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),A=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
function basePlayer(){
  return{x:W/2,y:H/2,r:15,hp:100,maxHp:100,shield:0,maxShield:30,energy:100,maxEnergy:100,energyRegen:12,speed:230,damage:18,fireRate:210,last:0,pierce:0,crit:.08,dashCooldown:1800,magnet:70,level:1,xp:0,invuln:0,skillPower:70}
}
function snapshot(){
  if(!player)return;
  save.player={hp:player.hp,maxHp:player.maxHp,shield:player.shield,maxShield:player.maxShield,energy:player.energy,maxEnergy:player.maxEnergy,energyRegen:player.energyRegen,speed:player.speed,damage:player.damage,fireRate:player.fireRate,pierce:player.pierce,crit:player.crit,dashCooldown:player.dashCooldown,magnet:player.magnet,level:player.level,xp:player.xp,skillPower:player.skillPower};
  save.checkpoint="wave-"+wave;
}
function restorePlayer(){
  player=basePlayer();
  if(save.player)Object.assign(player,save.player);
  player.x=W/2;player.y=H/2;player.last=0;player.invuln=700;
}
function start(fresh=true){
  if(fresh){Object.assign(save,defaults());save.stats.runs=1;save.tasks.signal="active"}
  restorePlayer();en=[];shots=[];loot=[];fx=[];wave=fresh?1:Math.max(1,save.wave||1);spawn=0;wait=0;dashOK=1;dashT=0;skillT=0;run=1;pause=0;delete save.flags.ending;save.wave=wave;saveGame(save);
  for(const q of document.querySelectorAll(".screen,.panel"))q.classList.add("hidden");
  $("hud").style.display="block";$("touch").style.display="block";sync();renderCharacter();next()
}
function next(){
  spawn=wave%5?6+wave*2:0;wait=0;bossLive=0;
  const r=wave<=15?REGIONS.r1:REGIONS.r2;save.wave=wave;snapshot();saveGame(save);
  $("region").textContent=r.name+" · "+r.subtitle;$("wave").textContent="WAVE "+wave;
  $("objective").textContent=wave%5?(wave<=15?"清除灰潮湾区域并回收CORE。":"穿越镜原城区并回收CORE。"):"警告：高能目标接近。";
  if(!wave%5){}else{if(wave%5===0){boss();bossLive=1}}
  const ns=nodesAtWave(save,wave).filter(n=>!save.flags["seen_"+n.id]);if(ns.length)setTimeout(()=>comm(ns[0]),120);
  if(wave>=7&&!secret&&Math.random()<.3)secretRoom();renderCharacter()
}
function enemy(){
  let s=Math.floor(Math.random()*4),m=35,X=s<2?R(0,W):s==2?-m:W+m,Y=s<2?(s?-m:H+m):R(0,H);
  let roll=Math.random(),type=wave>=10&&roll<.14?"striker":wave>=6&&roll<.34?"tank":wave>=3&&roll<.62?"hunter":"drone";
  let hp=type=="tank"?90+wave*10:type=="hunter"?34+wave*5:type=="striker"?48+wave*6:26+wave*4;
  en.push({x:X,y:Y,r:type=="tank"?22:type=="striker"?17:14,type,hp,maxHp:hp,speed:type=="tank"?55:type=="hunter"?120:type=="striker"?150:78,shot:R(400,1500),dash:R(900,1800),flash:0})
}
function boss(){let hp=500+wave*70;en.push({x:W/2,y:-60,r:42,type:"boss",boss:1,hp,maxHp:hp,speed:45,shot:700,pattern:0})}
function fire(){
  let now=performance.now();if(now-player.last<player.fireRate)return;
  let t=null,best=1e9;if(save.settings.autoAim)for(const e of en){let q=D(player,e);if(q<best)best=q,t=e}
  let a=t?A(player,t):save.settings.autoAim?0:Math.atan2(aim.y,aim.x);if(!t&&!save.settings.autoAim&&!aim.active)a=Math.atan2(mouse.y-player.y,mouse.x-player.x);
  let cr=Math.random()<player.crit;shots.push({x:player.x+Math.cos(a)*18,y:player.y+Math.sin(a)*18,vx:Math.cos(a)*680,vy:Math.sin(a)*680,r:4,damage:player.damage*(cr?2:1),pierce:player.pierce,hit:[],life:900,cr});
  player.last=now;save.stats.shots++;vib(7)
}
function skill(){
  if(!player||player.energy<35||skillT>0)return;
  player.energy-=35;skillT=900;shake=10;vib([15,30,50]);burst(player.x,player.y,30);
  for(const e of [...en]){let q=D(player,e);if(q<155){e.hp-=player.skillPower;burst(e.x,e.y,8);if(e.hp<=0)kill(e)}}
}
function dash(){if(!dashOK)return;let q=N(move.x||((keys.d?1:0)-(keys.a?1:0)),move.y||((keys.s?1:0)-(keys.w?1:0)));player.x=Math.max(18,Math.min(W-18,player.x+q.x*170));player.y=Math.max(18,Math.min(H-18,player.y+q.y*170));player.invuln=380;dashOK=0;dashT=player.dashCooldown;shake=6;vib([18,25,30]);burst(player.x,player.y,18)}
function hit(n){if(player.invuln>0)return;player.invuln=450;save.stats.damageTaken+=n;if(player.shield){let z=Math.min(player.shield,n);player.shield-=z;n-=z}player.hp-=n;shake=8;vib([20,30]);burst(player.x,player.y,8);if(player.hp<=0)die()}
function kill(e){save.stats.kills++;let gain=e.boss?25:e.type=="tank"?4:e.type=="striker"?3:1;save.core+=gain;player.xp+=e.boss?40:5;if(player.xp>=player.level*100){player.xp-=player.level*100;player.level++;player.maxHp+=8;player.hp=player.maxHp;player.maxEnergy+=8;player.energy=player.maxEnergy;vib([20,35,60])}for(let i=0;i<(e.boss?12:3);i++)loot.push({x:e.x+R(-8,8),y:e.y+R(-8,8),v:R(20,90)});burst(e.x,e.y,e.boss?30:10);en.splice(en.indexOf(e),1);saveDirty=1}
function upd(dt){
  if(!run||pause)return;
  player.invuln=Math.max(0,player.invuln-dt*1000);dashT-=dt*1000;skillT-=dt*1000;if(dashT<=0)dashOK=1;
  player.energy=Math.min(player.maxEnergy,player.energy+player.energyRegen*dt);
  let q=N(move.x||((keys.d?1:0)-(keys.a?1:0)),move.y||((keys.s?1:0)-(keys.w?1:0)));
  player.x=Math.max(18,Math.min(W-18,player.x+q.x*player.speed*dt));player.y=Math.max(18,Math.min(H-18,player.y+q.y*player.speed*dt));
  if(save.settings.autoFire||mouse.down||aim.active)fire();
  if(spawn>0){wait-=dt*1000;if(wait<=0){enemy();spawn--;wait=R(250,600)}}
  else if(!en.length){
    if(bossLive){bossLive=0;if(wave>=30){const ns=nodesAtWave(save,30).filter(n=>!save.flags["seen_"+n.id]);if(ns.length)comm(ns[0]);else finish()}else{wave++;save.stats.waves++;upgrades()}}
    else if(wave>=30)finish();else{wave++;save.stats.waves++;upgrades()}
  }
  for(let i=shots.length-1;i>=0;i--){let b=shots[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt*1000;
    for(const e of [...en])if(!b.hit.includes(e)&&D(b,e)<b.r+e.r){b.hit.push(e);e.hp-=b.damage;save.stats.damage+=b.damage;burst(e.x,e.y,b.cr?7:3);if(e.hp<=0)kill(e);if(b.pierce)b.pierce--;else b.life=0}
    if(b.life<=0||b.x<-50||b.x>W+50||b.y<-50||b.y>H+50)shots.splice(i,1)
  }
  for(const e of en){
    let a=A(e,player);e.x+=Math.cos(a)*e.speed*dt;e.y+=Math.sin(a)*e.speed*dt;e.shot-=dt*1000;e.dash-=dt*1000;
    if(e.type==="striker"&&e.dash<0){e.dash=1800;e.flash=260;e.x+=Math.cos(a)*90;e.y+=Math.sin(a)*90;burst(e.x,e.y,6)}
    if(e.boss&&e.shot<0){e.shot=900;for(let j=0;j<10;j++){let aa=j*Math.PI/5+e.pattern*.12;shots.push({enemy:1,x:e.x,y:e.y,vx:Math.cos(aa)*180,vy:Math.sin(aa)*180,r:5,damage:12,life:3000});}e.pattern++}
    if(e.type=="hunter"&&e.shot<0){e.shot=1100;shots.push({enemy:1,x:e.x,y:e.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,r:5,damage:10,life:2500})}
    if(D(e,player)<e.r+player.r)hit(e.boss?20:e.type==="striker"?12:8)
  }
  for(let i=shots.length-1;i>=0;i--){let b=shots[i];if(b.enemy&&D(b,player)<b.r+player.r){hit(b.damage);shots.splice(i,1)}}
  for(let i=loot.length-1;i>=0;i--){let z=loot[i],q=D(z,player);if(q<player.magnet){let a=A(z,player);z.v+=300*dt;z.x+=Math.cos(a)*z.v*dt;z.y+=Math.sin(a)*z.v*dt}if(q<18){save.core++;loot.splice(i,1);saveDirty=1}}
  for(let i=fx.length-1;i>=0;i--){let p=fx[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt*1000;if(p.life<0)fx.splice(i,1)}
  if(player.shield<player.maxShield)player.shield=Math.min(player.maxShield,player.shield+dt*2);
  save.stats.playTime+=dt;
  $("hp").textContent="HP "+Math.max(0,Math.ceil(player.hp))+(player.shield?" +"+Math.ceil(player.shield):"");
  $("core").textContent="CORE "+save.core;
  $("hpBar").style.width=Math.max(0,player.hp/player.maxHp*100)+"%";
  $("energyBar").style.width=Math.max(0,player.energy/player.maxEnergy*100)+"%";
  $("dashState").textContent=dashOK?"READY":Math.ceil(Math.max(0,dashT)/100)/10+"s";
  $("skillState").textContent=skillT>0?Math.ceil(skillT/100)/10+"s":Math.floor(player.energy)+"/35";
  if(saveDirty&&Math.random()<.04){snapshot();saveGame(save);saveDirty=0}
}function burst(x,y,n){for(let i=0;i<n;i++)fx.push({x,y,vx:R(-100,100),vy:R(-100,100),life:R(250,650),r:R(1,3)})}
function draw(){x.fillStyle="#050711";x.fillRect(0,0,W,H);let g=x.createRadialGradient(W/2,H/2,10,W/2,H/2,Math.max(W,H)*.7);g.addColorStop(0,"#111d33");g.addColorStop(1,"#04060d");x.fillStyle=g;x.fillRect(0,0,W,H);x.strokeStyle="#142039";for(let a=-40;a<W+40;a+=48){x.beginPath();x.moveTo(a,0);x.lineTo(a,H);x.stroke()}for(let a=-40;a<H+40;a+=48){x.beginPath();x.moveTo(0,a);x.lineTo(W,a);x.stroke()}for(const z of loot){x.fillStyle="#bd8cff";x.beginPath();x.arc(z.x,z.y,4,0,7);x.fill()}for(const b of shots){x.fillStyle=b.enemy?"#ff668a":b.cr?"#fff2a6":"#6ce7ff";x.beginPath();x.arc(b.x,b.y,b.r,0,7);x.fill()}for(const e of en){x.fillStyle=e.boss?"#ff668a":e.type=="tank"?"#c48cff":e.type=="hunter"?"#ffb86b":"#6ce7ff";x.beginPath();x.arc(e.x,e.y,e.r,0,7);x.fill();x.fillStyle="#111";x.fillRect(e.x-e.r,e.y-e.r-8,e.r*2,3);x.fillStyle="#7dffb2";x.fillRect(e.x-e.r,e.y-e.r-8,e.r*2*Math.max(0,e.hp/e.maxHp),3)}if(player){x.shadowBlur=18;x.shadowColor="#6ce7ff";x.fillStyle="#e9fbff";x.beginPath();x.arc(player.x,player.y,player.r,0,7);x.fill();x.shadowBlur=0}for(const p of fx){x.globalAlpha=p.life/650;x.fillStyle="#8defff";x.fillRect(p.x,p.y,p.r,p.r)}x.globalAlpha=1}
function loop(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;upd(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
function upgrades(){pause=1;let box=$("upgradeChoices");box.innerHTML="";[...UPGRADES].sort(()=>Math.random()-.5).slice(0,3).forEach(u=>{let b=document.createElement("button");b.innerHTML="<b>"+u[1]+"</b><small>"+u[2]+"</small>";b.onclick=()=>{u[3](player);save.upgrades.push(u[0]);saveGame(save);$("upgrade").classList.add("hidden");pause=0;next()};box.appendChild(b)});$("upgradeWave").textContent="WAVE "+wave;$("upgrade").classList.remove("hidden")}
function comm(node){pause=1;if(node.id==="comm2")save.tasks.signal="active";if(node.id==="comm4")save.tasks.aster="active";if(node.id==="comm6"||node.id==="comm8")save.tasks.mira="active";if(node.id==="comm10"||node.id==="comm12"||node.id==="comm14"||node.id==="r2_16"||node.id==="r2_27"||node.id==="r2_29"||node.id==="final")save.tasks.protocol="active";save.flags["seen_"+node.id]=1;saveGame(save);$("dialogue").classList.remove("hidden");$("speaker").textContent=node.speaker;$("commId").textContent=node.id.toUpperCase();$("dialogueText").textContent=node.text;let box=$("choices");box.innerHTML="";const opts=node.choices.filter(ch=>(ch.conditions||[]).every(c=>canShow(save,{conditions:[c]})));if(!opts.length){box.innerHTML="<p>当前状态下没有可用回应。</p>"}opts.forEach(ch=>{let b=document.createElement("button");b.textContent=ch.label;b.onclick=()=>{const ending=applyChoice(save,node,ch);saveGame(save);renderTasks();box.innerHTML="<p>选择已记录。你的经历将进入下一阶段。</p>";if(ending){setTimeout(()=>finish(),250)}};box.appendChild(b)});$("closeDialogue").onclick=()=>{$("dialogue").classList.add("hidden");pause=0;if(node.id==="final"&&!save.flags.ending)save.flags.ending=getEnding(save,wave);saveGame(save);if(node.id==="final")finish()}}function secretRoom(){secret=1;save.flags.secretUnlocked=1;saveGame(save);pause=1;$("secret").classList.remove("hidden");$("secretText").textContent=found?"CORE已接入。":"房间里只有一台没有型号的终端：是否接入CORE？"}
$("takeSecret").onclick=()=>{found=1;save.flags.secretFound=1;save.flags.coreTruth=1;save.tasks.core="done";saveGame(save);$("secretText").textContent="接入成功。你获得了一段无法解释的坐标。";$("takeSecret").disabled=1;vib([15,30,45])};$("leaveSecret").onclick=()=>{$("secret").classList.add("hidden");pause=0};
function finish(){run=0;const k=getEnding(save,wave)||"survivor";save.flags.ending=k;const e=ENDINGS[k]||ENDINGS.survivor;$("death").classList.add("hidden");$("endingTitle").textContent=e[0];$("endingText").textContent=e[1];$("ending").classList.remove("hidden");$("touch").style.display="none";saveGame(save)}
function die(){run=0;$("deathReason").textContent="生命信号丢失。你到达 WAVE "+wave+"，回收 CORE "+save.core+"。";$("death").classList.remove("hidden");$("touch").style.display="none";saveGame(save)}
function renderTasks(){if(!$("taskList"))return;const labels={active:"进行中",done:"已完成","":"未开始"};$("taskList").innerHTML=Object.entries(TASKS).map(([k,t])=>{const st=save.tasks[k]||"";return "<div class='loreItem'><b>"+t.title+" · "+labels[st]+"</b><p>"+t.desc+"</p></div>"}).join("")}
function tasks(){pause=1;renderTasks();$("tasks").classList.remove("hidden")}
function lore(){pause=1;$("lore").classList.remove("hidden");$("loreList").innerHTML=LORE.map(a=>"<div class='loreItem'><b>"+a[0]+"</b><p>"+a[1]+"</p></div>").join("")}
function sync(){["vibrate","autoAim","autoFire","leftHand"].forEach(k=>$(k).checked=save.settings[k]);$("sensitivity").value=save.settings.sensitivity*100;$("sensValue").textContent=Math.round(save.settings.sensitivity*100)+"%";$("touch").classList.toggle("left",save.settings.leftHand)}
$("newGame").onclick=start;$("tasksBtn").onclick=tasks;$("closeTasks").onclick=()=>{$("tasks").classList.add("hidden");pause=0};$("retry").onclick=start;$("continueGame").onclick=()=>{start();wave=Math.max(1,save.wave||1);next()};$("loreBtn").onclick=lore;$("closeLore").onclick=()=>{$("lore").classList.add("hidden");pause=0};$("settingsBtn").onclick=()=>{$("settings").classList.remove("hidden");pause=1;sync()};$("closeSettings").onclick=()=>{$("settings").classList.add("hidden");pause=0};$("deathMenu").onclick=()=>{$("death").classList.add("hidden");$("menu").classList.remove("hidden");$("hud").style.display="none"};$("endingMenu").onclick=()=>{$("ending").classList.add("hidden");$("menu").classList.remove("hidden");$("hud").style.display="none"};["vibrate","autoAim","autoFire","leftHand"].forEach(k=>$(k).onchange=()=>{save.settings[k]=$(k).checked;saveGame(save);sync()});$("sensitivity").oninput=e=>{save.settings.sensitivity=+e.target.value/100;saveGame(save);sync()};addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=1;if(e.key==" ")dash()});addEventListener("keyup",e=>keys[e.key.toLowerCase()]=0);c.onpointermove=e=>{mouse.x=e.clientX;mouse.y=e.clientY};c.onpointerdown=e=>{mouse.down=1;mouse.x=e.clientX;mouse.y=e.clientY};addEventListener("pointerup",()=>mouse.down=0);
function stick(el,type){let on=0,s={x:0,y:0};el.onpointerdown=e=>{on=1;s={x:e.clientX,y:e.clientY};el.setPointerCapture(e.pointerId);el.classList.add("active")};el.onpointermove=e=>{if(!on)return;let a=(e.clientX-s.x)/52,b=(e.clientY-s.y)/52,l=Math.hypot(a,b);if(l>1){a/=l;b/=l}if(type=="m")move={x:a,y:b};else{aim={x:a,y:b};aim.active=l>.12}};el.onpointerup=()=>{on=0;el.classList.remove("active");if(type=="m")move={x:0,y:0};else aim.active=0}}stick($("moveStick"),"m");stick($("aimStick"),"a");$("dash").onclick=dash;sync();renderTasks();$("hud").style.display="none";$("touch").style.display="none";