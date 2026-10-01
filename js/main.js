import{UPGRADES,LORE,ENDINGS,REGIONS}from"./data.js?v=596182a6";import{loadSave,saveGame,defaults,makeExport,parseImport,clearSave,saveLabel}from"./save.js?v=596182a6";import{TASKS,STORY,initStory,applyChoice,nodesAtWave,getEnding,canShow}from"./story.js?v=596182a6";
const $=id=>document.getElementById(id),c=$("game"),x=c.getContext("2d");let W,H,d=1,last=0,run=0,pause=0,wave=1,spawn=0,wait=0,shake=0,bossLive=0,player,en=[],shots=[],loot=[],fx=[],keys={},mouse={x:0,y:0,down:0},move={x:0,y:0},aim={x:1,y:0,active:0},dashOK=1,dashT=0,skillT=0,saveDirty=0,hudClock=0,bgCanvas,bgCtx,bgW=0,bgH=0;const save=initStory(loadSave());let secret=!!save.flags.secretUnlocked,found=!!save.flags.secretFound;
function rebuildBackground(){
  bgCanvas=document.createElement("canvas");bgCanvas.width=Math.max(1,Math.ceil(W));bgCanvas.height=Math.max(1,Math.ceil(H));bgCtx=bgCanvas.getContext("2d");
  const g=bgCtx.createRadialGradient(W/2,H/2,10,W/2,H/2,Math.max(W,H)*.72);g.addColorStop(0,"#111d33");g.addColorStop(1,"#04060d");bgCtx.fillStyle=g;bgCtx.fillRect(0,0,W,H);
  bgCtx.strokeStyle="#142039";bgCtx.globalAlpha=.55;for(let a=-40;a<W+40;a+=56){bgCtx.beginPath();bgCtx.moveTo(a,0);bgCtx.lineTo(a,H);bgCtx.stroke()}for(let a=-40;a<H+40;a+=56){bgCtx.beginPath();bgCtx.moveTo(0,a);bgCtx.lineTo(W,a);bgCtx.stroke()}bgCtx.globalAlpha=1;bgW=W;bgH=H
}
function resize(){W=innerWidth;H=innerHeight;d=Math.min(devicePixelRatio||1,1.75);c.width=W*d;c.height=H*d;x.setTransform(d,0,0,d,0,0);rebuildBackground()}addEventListener("resize",resize);resize();
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
  player.x=W/2;player.y=H/2;player.last=0;player.invuln=700;if(player.hp<=0){player.hp=player.maxHp;player.shield=player.maxShield;player.energy=player.maxEnergy}
}
function start(fresh=true){
  try{
    if(fresh){Object.assign(save,defaults());save.stats.runs=1;save.tasks.signal="active";secret=false;found=false}
    else{save.stats.runs++;secret=!!save.flags.secretUnlocked;found=!!save.flags.secretFound}
    restorePlayer();en=[];shots=[];loot=[];fx=[];wave=fresh?1:Math.max(1,save.wave||1);spawn=0;wait=0;dashOK=1;dashT=0;skillT=0;run=1;pause=0;delete save.flags.ending;save.wave=wave;
    for(const q of document.querySelectorAll(".screen,.panel"))q.classList.add("hidden");
    $("hud").style.display="block";$("touch").style.display="block";
    sync();renderCharacter();renderHUD();persist();next();
  }catch(err){
    run=0;pause=0;$("hud").style.display="none";$("touch").style.display="none";
    showBootError(new Error("开始运行失败：\\n"+(err?.stack||err?.message||String(err))));
  }
}
function next(){
  spawn=wave%5?Math.min(38,6+wave):0;wait=0;bossLive=0;
  const r=wave<=15?REGIONS.r1:REGIONS.r2;save.wave=wave;snapshot();persist();
  $("region").textContent=r.name+" · "+r.subtitle;$("wave").textContent="WAVE "+wave;
  let objective=wave%5?(wave<=15?"清除区域内敌群。":"穿过镜原城区。"):"高能目标接近。";
  if(save.flags.route==="fast"&&wave<=15)objective="沿红色信标推进。";
  if(save.flags.route==="side"&&wave<=15)objective="寻找主路线之外的入口。";
  if(wave>=7&&wave<15&&!save.flags.watchedAdaptation&&!save.flags.changedAdaptation)objective="注意敌人的移动方式。";
  if(wave>=16&&wave<25)objective=save.flags.changedHabit?"不要重复刚才的路线。":"观察敌人如何布置位置。";
  if(wave>=25)objective="击破前方防御单位。";
  $("objectiveText").textContent=objective;
  if(wave%5===0){boss();bossLive=1}
  const ns=nodesAtWave(save,wave).filter(n=>!save.flags["seen_"+n.id]);if(ns.length)setTimeout(()=>comm(ns[0]),120);
  const secretChance=save.flags.route==="side"?.58:save.flags.route==="fast"?.16:.3;
  if(wave>=7&&!secret&&Math.random()<secretChance)secretRoom();renderCharacter()
}
function enemy(){
  let s=Math.floor(Math.random()*4),m=35,X=s<2?R(0,W):s==2?-m:W+m,Y=s<2?(s?-m:H+m):R(0,H);
  let roll=Math.random(),type=wave>=10&&roll<.14?"striker":wave>=6&&roll<.34?"tank":wave>=3&&roll<.62?"hunter":"drone";
  if(save.flags.route==="fast"&&wave<=15&&Math.random()<.22)type="striker";
  if(save.flags.route==="side"&&wave<=15&&Math.random()<.28)type="hunter";
  if(save.flags.changedHabit&&wave>=16&&Math.random()<.2)type="striker";
  if(save.flags.resistedObservation&&wave>=20&&Math.random()<.18)type="tank";
  let hp=type=="tank"?90+wave*10:type=="hunter"?34+wave*5:type=="striker"?48+wave*6:26+wave*4;
  if(!save.flags["seen_"+type]){save.flags["seen_"+type]=1;save.flags["fragment_"+type]=1}
  en.push({x:X,y:Y,r:type=="tank"?22:type=="striker"?17:14,type,hp,maxHp:hp,speed:type=="tank"?55:type=="hunter"?120:type=="striker"?150:78,shot:R(400,1500),dash:R(900,1800),flash:0})
}
function boss(){let hp=500+wave*70;en.push({x:W/2,y:-60,r:42,type:"boss",boss:1,hp,maxHp:hp,speed:45,shot:700,pattern:0,adaptive:!save.flags.unlearnedEcho})}
function fire(){
  let now=performance.now();if(now-player.last<player.fireRate)return;
  let t=null,best=1e9;if(save.settings.autoAim)for(const e of en){let q=D(player,e);if(q<best)best=q,t=e}
  let a=aim.active?Math.atan2(aim.y,aim.x):t?A(player,t):save.settings.autoAim?0:Math.atan2(aim.y,aim.x);if(!t&&!save.settings.autoAim&&!aim.active)a=Math.atan2(mouse.y-player.y,mouse.x-player.x);
  let cr=Math.random()<player.crit;shots.push({x:player.x+Math.cos(a)*18,y:player.y+Math.sin(a)*18,vx:Math.cos(a)*680,vy:Math.sin(a)*680,r:4,damage:player.damage*(cr?2:1),pierce:player.pierce,hit:[],life:900,cr});
  player.last=now;save.stats.shots++;vib(7)
}
function skill(){
  if(!player||player.energy<35||skillT>0)return;
  player.energy-=35;skillT=900;shake=10;vib([15,30,50]);burst(player.x,player.y,30);
  for(const e of [...en]){let q=D(player,e);if(q<155){e.hp-=player.skillPower;burst(e.x,e.y,8);if(e.hp<=0)kill(e)}}
}
function dash(){if(!dashOK)return;let dx=move.x||((keys.d?1:0)-(keys.a?1:0)),dy=move.y||((keys.s?1:0)-(keys.w?1:0));let q=N(dx||((aim.active?aim.x:0)),dy||((aim.active?aim.y:-1)));player.x=Math.max(18,Math.min(W-18,player.x+q.x*170));player.y=Math.max(18,Math.min(H-18,player.y+q.y*170));player.invuln=380;dashOK=0;dashT=player.dashCooldown;shake=6;vib([18,25,30]);burst(player.x,player.y,18)}
function hit(n){if(player.invuln>0)return;player.invuln=450;save.stats.damageTaken+=n;if(player.shield){let z=Math.min(player.shield,n);player.shield-=z;n-=z}player.hp-=n;shake=8;vib([20,30]);burst(player.x,player.y,8);if(player.hp<=0)die()}
function kill(e){save.stats.kills++;if(e.boss){save.flags["boss_"+wave]=1;if(wave===25)save.flags.fragment_boss=1}let gain=e.boss?25:e.type=="tank"?4:e.type=="striker"?3:1;save.core+=gain;player.xp+=e.boss?40:5;if(player.xp>=player.level*100){player.xp-=player.level*100;player.level++;player.maxHp+=8;player.hp=player.maxHp;player.maxEnergy+=8;player.energy=player.maxEnergy;vib([20,35,60])}for(let i=0;i<(e.boss?12:3);i++)loot.push({x:e.x+R(-8,8),y:e.y+R(-8,8),v:R(20,90)});burst(e.x,e.y,e.boss?30:10);en.splice(en.indexOf(e),1);saveDirty=1}
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
    if(!b.enemy)for(const e of [...en])if(!b.hit.includes(e)&&D(b,e)<b.r+e.r){b.hit.push(e);e.hp-=b.damage;save.stats.damage+=b.damage;burst(e.x,e.y,b.cr?7:3);if(e.hp<=0)kill(e);if(b.pierce)b.pierce--;else b.life=0}
    if(b.life<=0||b.x<-50||b.x>W+50||b.y<-50||b.y>H+50)shots.splice(i,1)
  }
  for(const e of en){
    let a=A(e,player),dist=D(e,player);e.shot-=dt*1000;e.dash-=dt*1000;
    let mx=Math.cos(a),my=Math.sin(a);
    if(e.boss){
      const orbit=e.adaptive?Math.sin(performance.now()/900+e.pattern)*.65:Math.sin(performance.now()/520+e.pattern)*.25;mx=Math.cos(a+orbit);my=Math.sin(a+orbit);
      if(dist>250){e.x+=mx*e.speed*dt;e.y+=my*e.speed*dt}else{e.x-=mx*e.speed*.35*dt;e.y-=my*e.speed*.35*dt}
      if(e.shot<0){e.shot=850;for(let j=0;j<12;j++){let aa=j*Math.PI/6+e.pattern*.16;shots.push({enemy:1,x:e.x,y:e.y,vx:Math.cos(aa)*190,vy:Math.sin(aa)*190,r:5,damage:12,life:3200})}e.pattern++}
    }else if(e.type==="hunter"){
      const dir=dist<250?-1:dist>340?1:0;e.x+=mx*e.speed*dir*dt;e.y+=my*e.speed*dir*dt;
      if(e.shot<0){e.shot=1200;shots.push({enemy:1,x:e.x,y:e.y,vx:Math.cos(a)*300,vy:Math.sin(a)*300,r:5,damage:10,life:2500})}
    }else if(e.type==="striker"){
      const orbit=Math.sin(performance.now()/350+e.x)*.5;e.x+=Math.cos(a+orbit)*e.speed*.7*dt;e.y+=Math.sin(a+orbit)*e.speed*.7*dt;
      if(e.dash<0&&dist<520){e.dash=2100;e.flash=260;e.x+=mx*120;e.y+=my*120;burst(e.x,e.y,6)}
    }else{
      e.x+=mx*e.speed*dt;e.y+=my*e.speed*dt;
    }
    if(D(e,player)<e.r+player.r)hit(e.boss?20:e.type==="striker"?12:8)
  }
  for(let i=shots.length-1;i>=0;i--){let b=shots[i];if(b.enemy&&D(b,player)<b.r+player.r){hit(b.damage);shots.splice(i,1)}}
  for(let i=loot.length-1;i>=0;i--){let z=loot[i],q=D(z,player);if(q<player.magnet){let a=A(z,player);z.v+=300*dt;z.x+=Math.cos(a)*z.v*dt;z.y+=Math.sin(a)*z.v*dt}if(q<18){save.core++;loot.splice(i,1);saveDirty=1}}
  for(let i=fx.length-1;i>=0;i--){let p=fx[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt*1000;if(p.life<0)fx.splice(i,1)}
  if(player.shield<player.maxShield)player.shield=Math.min(player.maxShield,player.shield+dt*2);
  save.stats.playTime+=dt;hudClock-=dt;if(hudClock<=0){hudClock=.08;renderHUD()}
  $("hp").textContent="HP "+Math.max(0,Math.ceil(player.hp))+(player.shield?" +"+Math.ceil(player.shield):"");
  $("core").textContent="CORE "+save.core;
  
  if(saveDirty&&Math.random()<.04){snapshot();persist();saveDirty=0}
}function burst(x,y,n){if(save.settings.lowFx)n=Math.min(4,n);else n=Math.min(18,n);for(let i=0;i<n;i++)fx.push({x,y,vx:R(-100,100),vy:R(-100,100),life:R(250,650),r:R(1,3)});if(fx.length>180)fx.splice(0,fx.length-180)}
function draw(){
  if(bgW!==W||bgH!==H)rebuildBackground();
  x.drawImage(bgCanvas,0,0);
  let shaken=shake>0;if(shaken){shake*=.88;if(shake<.2)shake=0;x.save();x.translate(R(-shake,shake),R(-shake,shake))}
  const low=save.settings.lowFx;
for(const z of loot){x.fillStyle="#bd8cff";x.beginPath();x.arc(z.x,z.y,4,0,7);x.fill()}for(const b of shots){x.fillStyle=b.enemy?"#ff668a":b.cr?"#fff2a6":"#6ce7ff";x.beginPath();x.arc(b.x,b.y,b.r,0,7);x.fill()}for(const e of en){x.fillStyle=e.boss?"#ff668a":e.type=="tank"?"#c48cff":e.type=="striker"?"#ff4fa3":e.type=="hunter"?"#ffb86b":"#6ce7ff";x.beginPath();x.arc(e.x,e.y,e.r,0,7);x.fill();x.fillStyle="#111";x.fillRect(e.x-e.r,e.y-e.r-8,e.r*2,3);x.fillStyle="#7dffb2";x.fillRect(e.x-e.r,e.y-e.r-8,e.r*2*Math.max(0,e.hp/e.maxHp),3)}if(player){if(player.invuln>0)x.globalAlpha=.55+.45*Math.sin(performance.now()/45);x.shadowBlur=18;x.shadowColor="#6ce7ff";x.fillStyle="#e9fbff";x.beginPath();x.arc(player.x,player.y,player.r,0,7);x.fill();x.shadowBlur=0;x.globalAlpha=1}for(const p of fx){if(!low){x.globalAlpha=p.life/650;x.fillStyle="#8defff";x.fillRect(p.x,p.y,p.r,p.r)}}x.globalAlpha=1;if(shaken)x.restore()}
function loop(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;upd(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
function upgrades(){pause=1;let box=$("upgradeChoices");box.innerHTML="";[...UPGRADES].sort(()=>Math.random()-.5).slice(0,3).forEach(u=>{let b=document.createElement("button");b.innerHTML="<b>"+u[1]+"</b><small>"+u[2]+"</small>";b.onclick=()=>{u[3](player);save.upgrades.push(u[0]);save.flags.upgradeCount=(save.flags.upgradeCount||0)+1;save.flags.lastUpgrade=u[0];if(save.flags.upgradeCount===1)save.flags.fragment_upgrade=1;if(u[0]==="speed"||u[0]==="dash")save.flags.mobileBuild=1;if(u[0]==="power"||u[0]==="firerate"||u[0]==="caliber")save.flags.fireBuild=1;persist();$("upgrade").classList.add("hidden");pause=0;next()};box.appendChild(b)});$("upgradeWave").textContent="WAVE "+wave;$("upgrade").classList.remove("hidden")}
function comm(node){pause=1;if(node.id==="comm2")save.tasks.signal="active";if(node.id==="comm4")save.tasks.aster="active";if(node.id==="comm6"||node.id==="comm8")save.tasks.mira="active";if(node.id==="comm10"||node.id==="comm12"||node.id==="comm14"||node.id==="r2_16"||node.id==="r2_27"||node.id==="r2_29"||node.id==="final")save.tasks.protocol="active";save.flags["seen_"+node.id]=1;persist();$("dialogue").classList.remove("hidden");$("speaker").textContent=node.speaker;$("commId").textContent=node.id.toUpperCase();$("dialogueText").textContent=node.text;let box=$("choices");box.innerHTML="";const opts=node.choices.filter(ch=>(ch.conditions||[]).every(c=>canShow(save,{conditions:[c]})));if(!opts.length){box.innerHTML="<p>当前状态下没有可用回应。</p>"}opts.forEach(ch=>{let b=document.createElement("button");b.textContent=ch.label;b.onclick=()=>{const ending=applyChoice(save,node,ch);persist();renderTasks();box.innerHTML="<p>选择已记录。你的经历将进入下一阶段。</p>";if(ending){setTimeout(()=>finish(),250)}};box.appendChild(b)});$("closeDialogue").onclick=()=>{$("dialogue").classList.add("hidden");pause=0;if(node.id==="final"&&!save.flags.ending)save.flags.ending=getEnding(save,wave);persist();if(node.id==="final")finish()}}function secretRoom(){secret=1;save.flags.secretUnlocked=1;save.flags.fragment_room=1;persist();pause=1;$("secret").classList.remove("hidden");$("secretText").textContent=found?"终端仍在等待。":"房间里只有一台没有型号的终端。CORE似乎能让它启动。"}
$("takeSecret").onclick=()=>{found=1;save.flags.secretFound=1;save.flags.coreTruth=1;save.flags.fragment_coordinate=1;save.tasks.core="done";persist();$("secretText").textContent="终端亮起了一秒。没有坐标，只有一条新的路线。";$("takeSecret").disabled=1;vib([15,30,45])};$("leaveSecret").onclick=()=>{$("secret").classList.add("hidden");pause=0};
function finish(){snapshot();run=0;const k=getEnding(save,wave)||"survivor";save.flags.ending=k;const e=ENDINGS[k]||ENDINGS.survivor;$("death").classList.add("hidden");$("endingTitle").textContent=e[0];$("endingText").textContent=e[1];$("ending").classList.remove("hidden");$("touch").style.display="none";persist()}
function die(){snapshot();run=0;$("deathReason").textContent="生命信号丢失。你到达 WAVE "+wave+"，回收 CORE "+save.core+"。";$("death").classList.remove("hidden");$("touch").style.display="none";persist()}
function renderTasks(){if(!$("taskList"))return;const labels={active:"进行中",done:"已完成","":"未开始"};$("taskList").innerHTML=Object.entries(TASKS).map(([k,t])=>{const st=save.tasks[k]||"";return "<div class='loreItem'><b>"+t.title+" · "+labels[st]+"</b><p>"+t.desc+"</p></div>"}).join("")}
function tasks(){pause=1;renderTasks();$("tasks").classList.remove("hidden")}
function lore(){pause=1;$("lore").classList.remove("hidden");const foundFragments=[["fragment_drone","敌方单位","它们会改变路线。"],["fragment_hunter","追踪单位","它们会等待你改变方向。"],["fragment_tank","重型单位","它们会封锁你已经使用过的位置。"],["fragment_striker","突击单位","它们会在你犹豫时靠近。"],["fragment_upgrade","第一次升级","你的第一次强化被记录了。"],["fragment_room","隐藏房间","房间似乎一直在等一个合适的CORE。"],["fragment_coordinate","终端残留","它没有给出答案，只改变了你的路线。"],["fragment_boss","防御者","它会重复你已经使用过的东西。"]];const unlocked=foundFragments.filter(a=>save.flags[a[0]]);$("loreList").innerHTML=unlocked.length?unlocked.map(a=>"<div class='loreItem'><b>"+a[1]+"</b><p>"+a[2]+"</p></div>").join(""):"<div class='loreItem'><b>暂无记录</b><p>战斗中发现的异常会在这里留下碎片。</p></div>"}
function renderCharacter(){
  if(!player)return;
  $("charRank").textContent="RANK "+String(player.level).padStart(2,"0");
  $("charLevel").textContent="LEVEL "+player.level+" · XP "+Math.floor(player.xp)+"/"+player.level*100;
  $("charHp").textContent=Math.ceil(player.hp)+" / "+player.maxHp;
  $("charShield").textContent=Math.ceil(player.maxShield)+" · 回充";
  $("charDamage").textContent=Math.round(player.damage);
  $("charFire").textContent=Math.round(player.fireRate)+"ms";
  $("charSpeed").textContent=Math.round(player.speed);
  $("charCrit").textContent=Math.round(player.crit*100)+"%";
  const upgrades=Array.isArray(save.upgrades)?save.upgrades:[];
  save.upgrades=upgrades;
  const loadout=$("loadout");
  if(loadout)loadout.replaceChildren(...(upgrades.length?upgrades.map(id=>{const el=document.createElement("span");el.textContent=String(id);return el}):[Object.assign(document.createElement("span"),{textContent:"基础武装"})]));
}
function renderHUD(){
  if(!player)return;
  $("hp").textContent="HP "+Math.max(0,Math.ceil(player.hp))+(player.shield?" +"+Math.ceil(player.shield):"");
  $("core").textContent="CORE "+save.core;
  $("hpBar").style.width=Math.max(0,player.hp/player.maxHp*100)+"%";
  $("energyBar").style.width=Math.max(0,player.energy/player.maxEnergy*100)+"%";
  $("dashState").textContent=dashOK?"READY":Math.ceil(Math.max(0,dashT)/100)/10+"s";
  $("skillState").textContent=skillT>0?Math.ceil(skillT/100)/10+"s":Math.floor(player.energy)+"/35";
  const b=en.find(e=>e.boss);$("bossBar").classList.toggle("hidden",!b);if(b){const pct=Math.max(0,b.hp/b.maxHp*100);$("bossName").textContent="BOSS · "+(wave<=15?"GREY TIDE":"MIRRORPLAIN");$("bossHpText").textContent=Math.ceil(pct)+"%";$("bossHpBar").style.width=pct+"%"}
  $("combatHint").style.display=save.settings.showHints?"block":"none";
}
function renderSavePanel(){
  $("saveInfo").textContent=(hasSaveLabel?saveLabel(save):"暂无存档")+"\n"+(save.checkpoint||"wave-1")+"\n击杀 "+save.stats.kills+" · 运行 "+save.stats.runs+" · 游戏时间 "+Math.floor(save.stats.playTime/60)+" 分钟";
}
function sync(){["vibrate","autoAim","autoFire","leftHand","lowFx","showHints"].forEach(k=>$(k).checked=!!save.settings[k]);$("sensitivity").value=save.settings.sensitivity*100;$("sensValue").textContent=Math.round(save.settings.sensitivity*100)+"%";$("touch").classList.toggle("left",save.settings.leftHand);renderCharacter()}
const hasSaveLabel=true;
let saveErrorShown=false;
function persist(){
  try{saveGame(save);saveErrorShown=false;return true}
  catch(err){
    console.error("VOID//RUN save failed",err);
    if(!saveErrorShown){
      saveErrorShown=true;
      const box=$("saveInfo");
      if(box)box.textContent="本机存储暂时不可用。游戏仍可运行，但当前进度可能无法保存。";
    }
    return false
  }
}
function showBootError(err){
  console.error("VOID//RUN boot error",err);
  const box=document.createElement("div");
  box.style.cssText="position:fixed;inset:16px;z-index:99999;padding:18px;background:#120914;color:#ffd8e3;border:1px solid #ff668a;border-radius:14px;font:13px/1.7 monospace;white-space:pre-wrap;overflow:auto";
  box.textContent="VOID//RUN 启动异常\\n\\n"+(err?.stack||err?.message||String(err));
  document.body.appendChild(box)
}
addEventListener("error",e=>{if(e.error)showBootError(e.error)});
addEventListener("unhandledrejection",e=>showBootError(e.reason));

$("newGame").onclick=()=>{start(true);if(run&&save.settings.showHints){pause=1;$("help").classList.remove("hidden")}};
$("helpBtn").onclick=()=>{pause=1;$("help").classList.remove("hidden")};$("closeHelp").onclick=()=>{$("help").classList.add("hidden");pause=0};
$("continueGame").onclick=()=>start(false);
$("retry").onclick=()=>start(false);
$("tasksBtn").onclick=tasks;
$("characterBtn").onclick=()=>{pause=1;renderCharacter();$("character").classList.remove("hidden")};
$("closeCharacter").onclick=()=>{$("character").classList.add("hidden");pause=0};
$("saveBtn").onclick=()=>{pause=1;renderSavePanel();$("savePanel").classList.remove("hidden")};
$("closeSave").onclick=()=>{$("savePanel").classList.add("hidden");pause=0};
$("manualSave").onclick=()=>{snapshot();persist();saveDirty=0;renderSavePanel();vib([15,25])};
$("exportSave").onclick=()=>{snapshot();persist();const blob=new Blob([makeExport(save)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="voidrun-save-wave-"+wave+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);renderSavePanel()};
$("importSave").onclick=()=>$("saveFile").click();
$("saveFile").onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const imported=parseImport(await file.text());Object.assign(save,imported);persist();alert("存档导入成功。");renderSavePanel();start(false)}catch{alert("存档文件无效或已损坏。")}e.target.value=""};
$("clearSave").onclick=()=>{if(confirm("确定删除本机存档？导出的JSON不会受影响。")){clearSave();Object.assign(save,defaults());renderSavePanel()}};
$("pauseBtn").onclick=()=>{if(!run)return;pause=!pause;$("pauseMenu").classList.toggle("hidden",!pause);$("touch").style.display=pause?"none":"block"};
$("resumeBtn").onclick=()=>{pause=0;$("pauseMenu").classList.add("hidden");$("touch").style.display="block"};
$("pauseSaveBtn").onclick=()=>{snapshot();persist();run=0;pause=0;$("pauseMenu").classList.add("hidden");$("touch").style.display="none";$("hud").style.display="none";$("menu").classList.remove("hidden")};
$("pauseMenuBtn").onclick=()=>{run=0;pause=0;$("pauseMenu").classList.add("hidden");$("touch").style.display="none";$("hud").style.display="none";$("menu").classList.remove("hidden")};
$("skill").onclick=skill;
$("closeTasks").onclick=()=>{$("tasks").classList.add("hidden");pause=0};$("loreBtn").onclick=lore;$("closeLore").onclick=()=>{$("lore").classList.add("hidden");pause=0};$("settingsBtn").onclick=()=>{$("settings").classList.remove("hidden");pause=1;sync()};$("closeSettings").onclick=()=>{$("settings").classList.add("hidden");pause=0};$("deathMenu").onclick=()=>{$("death").classList.add("hidden");$("menu").classList.remove("hidden");$("hud").style.display="none"};$("endingMenu").onclick=()=>{$("ending").classList.add("hidden");$("menu").classList.remove("hidden");$("hud").style.display="none"};["vibrate","autoAim","autoFire","leftHand","lowFx","showHints"].forEach(k=>$(k).onchange=()=>{save.settings[k]=$(k).checked;persist();sync()});$("sensitivity").oninput=e=>{save.settings.sensitivity=+e.target.value/100;persist();sync()};addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=1;if(e.key==" ")dash()});addEventListener("keyup",e=>keys[e.key.toLowerCase()]=0);c.onpointermove=e=>{mouse.x=e.clientX;mouse.y=e.clientY};c.onpointerdown=e=>{mouse.down=1;mouse.x=e.clientX;mouse.y=e.clientY};addEventListener("pointerup",()=>mouse.down=0);
function stick(el,type){let on=0,s={x:0,y:0};el.onpointerdown=e=>{on=1;s={x:e.clientX,y:e.clientY};el.setPointerCapture(e.pointerId);el.classList.add("active")};el.onpointermove=e=>{if(!on)return;let sens=save.settings.sensitivity||1;let a=(e.clientX-s.x)/52*sens,b=(e.clientY-s.y)/52*sens,l=Math.hypot(a,b);if(l>1){a/=l;b/=l}if(type=="m")move={x:a,y:b};else{aim={x:a,y:b};aim.active=l>.12}};el.onpointerup=()=>{on=0;el.classList.remove("active");if(type=="m")move={x:0,y:0};else aim.active=0}}stick($("moveStick"),"m");stick($("aimStick"),"a");$("dash").onclick=dash;
document.addEventListener("visibilitychange",()=>{if(document.hidden&&run){snapshot();persist()}});addEventListener("beforeunload",()=>{if(run){snapshot();persist()}});sync();renderHUD();renderTasks();renderSavePanel();$("hud").style.display="none";$("touch").style.display="none";