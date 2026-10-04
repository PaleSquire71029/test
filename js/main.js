const $=id=>document.getElementById(id);
const EA=()=>window.EtheriaAudio;

/* ================= 状态 ================= */
const state={
 started:false,hp:820,maxHp:820,time:8.4,coins:126,
 quest:0,kills:0,clues:0,echoes:0,
 dialogue:false,menuOpen:false,panel:false,lore:false,
 combo:0,comboTimer:0,level:7,xp:0,nextXp:240,defeatedBoss:false,
 fishing:false,craft:false,buff:null,achievements:{},
 settings:{low:false,vib:true,sfx:true},
 bag:{sword:1,map:1,herb:3},
 equipment:{weapon:"旅者短剑",power:95}
};
const player={x:980,y:860,dir:0,speed:205,attack:0,inv:0,stamina:100,walk:0,vx:0,vy:0,dashT:0,dashDx:0,dashDy:0};
const camera={x:0,y:0,zoom:1,tz:1};
const mouse={x:0,y:0,down:false};
const keys=Object.create(null);

let dialogueTyping=false,dialogueFullText="",dialogueTypeTimer=0;
let pendingStart=false;

/* ================= 物品定义 ================= */
const ITEMS={
 sword:{name:"旅者短剑",cat:"equip"},
 blade:{name:"古代剑刃",cat:"equip",rare:1},
 potion:{name:"治疗药草",cat:"use",heal:200},
 berry:{name:"野果",cat:"use",heal:60},
 fish:{name:"鱼",cat:"use",heal:80,desc:"湖里的鲜鱼，烤一烤更香。恢复 80 点生命。"},
 grilledFish:{name:"烤鱼",cat:"use",heal:150,desc:"外焦里嫩的烤鱼，恢复 150 点生命。需要 鱼 + 木材 在营火合成。"},
 strengthPotion:{name:"力量药剂",cat:"use",buff:{atk:10,dur:60},desc:"攻击 +10，持续 60 秒。需要 晶矿 + 晨雾草 在营火合成。"},
 wood:{name:"木材",cat:"mat"},
 ore:{name:"铁矿",cat:"mat"},
 crystal:{name:"晶矿",cat:"mat",rare:1},
 stone:{name:"石材",cat:"mat"},
 herb:{name:"晨雾草",cat:"mat"},
 grass:{name:"水草",cat:"mat"},
 shell:{name:"贝壳",cat:"mat"},
 shard:{name:"回声碎片",cat:"quest",rare:1},
 badge:{name:"晨雾谷徽记",cat:"quest",rare:1},
 core:{name:"古龙核心",cat:"quest",rare:1},
 map:{name:"野外地图",cat:"quest"},
 scale:{name:"奇怪的鳞片",cat:"quest"}
};
const ICONS={
 sword:'<svg viewBox="0 0 24 24"><path d="M5 19l3-3M7 14l3 3M19 4l-9.5 9.5M19 4l-1 4M19 4l-4 1"/></svg>',
 blade:'<svg viewBox="0 0 24 24"><path d="M5 19l3-3M7 14l3 3M19 4l-9.5 9.5M19 4l-1 4M19 4l-4 1"/><circle cx="17" cy="7" r="1.2"/></svg>',
 potion:'<svg viewBox="0 0 24 24"><path d="M10 3h4M11 3v4l-4 9a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4l-4-9V3"/><path d="M8 14h8"/></svg>',
 berry:'<svg viewBox="0 0 24 24"><circle cx="9" cy="13" r="3"/><circle cx="15" cy="14" r="3"/><circle cx="12" cy="9" r="3"/><path d="M12 6V3"/></svg>',
 wood:'<svg viewBox="0 0 24 24"><rect x="4" y="9" width="16" height="7" rx="3"/><circle cx="8" cy="12.5" r="1.6"/><path d="M12 10v5M16 10v5"/></svg>',
 ore:'<svg viewBox="0 0 24 24"><path d="M7 18L5 11l5-6 7 2 2 7-5 4z"/><path d="M10 5l2 5 5-1"/></svg>',
 crystal:'<svg viewBox="0 0 24 24"><path d="M12 3l5 6-5 12-5-12z"/><path d="M12 3v18M7 9h10"/></svg>',
 stone:'<svg viewBox="0 0 24 24"><path d="M5 15l2-7 6-3 6 4v6l-5 4H8z"/></svg>',
 herb:'<svg viewBox="0 0 24 24"><path d="M12 21V10"/><path d="M12 12C12 8 9 6 5 6c0 4 3 6 7 6zM12 12c0-4 3-6 7-6 0 4-3 6-7 6zM12 18c0-3 2-5 5-5 0 3-2 5-5 5z"/></svg>',
 grass:'<svg viewBox="0 0 24 24"><path d="M6 21c0-6 2-9 2-13M12 21c0-7-1-10 0-15M18 21c0-6-2-9-2-13"/></svg>',
 shell:'<svg viewBox="0 0 24 24"><path d="M12 20a8 8 0 0 0-8-8c2-4 5-6 8-6s6 2 8 6a8 8 0 0 0-8 8z"/><path d="M12 20V6M7 13l5 7M17 13l-5 7"/></svg>',
 shard:'<svg viewBox="0 0 24 24"><path d="M12 3l5 9-5 9-5-9z"/></svg>',
 badge:'<svg viewBox="0 0 24 24"><circle cx="12" cy="11" r="7"/><path d="M12 7v4l3 2M9 21l3-3 3 3"/></svg>',
 core:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>',
 map:'<svg viewBox="0 0 24 24"><path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14M15 6v14"/></svg>',
 scale:'<svg viewBox="0 0 24 24"><path d="M12 3c4 4 6 8 6 11a6 6 0 0 1-12 0c0-3 2-7 6-11z"/></svg>',
 /* 新物品图标：鱼 / 烤鱼 / 力量药剂 */
 fish:'<svg viewBox="0 0 24 24"><path d="M3 12c3-4.5 7-6.5 10-6.5 3.5 0 6 2.5 8 6.5-2 4-4.5 6.5-8 6.5-3 0-7-2-10-6.5z"/><circle cx="16.5" cy="11" r="1"/><path d="M3 12l-2-3M3 12l-2 3"/></svg>',
 grilledFish:'<svg viewBox="0 0 24 24"><path d="M4 12c3-4 6.5-5.5 9.5-5.5 3 0 5 2 6.5 5.5-1.5 3.5-3.5 5.5-6.5 5.5-3 0-6.5-1.5-9.5-5.5z"/><path d="M4 12l-2-2.5M4 12l-2 2.5"/><path d="M9 9.5c1 1.5 1 3.5 0 5M13 9.5c1 1.5 1 3.5 0 5M17 9.5c1 1.5 1 3.5 0 5"/></svg>',
 strengthPotion:'<svg viewBox="0 0 24 24"><path d="M10 3h4M11 3v4l-4 9a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4l-4-9V3"/><path d="M8 14h8M12 16.5l1.2 1.6M12 16.5l-1.2 1.6"/></svg>'
};
function addItem(id,n=1){
 state.bag[id]=(state.bag[id]||0)+n;
}
function removeItem(id,n=1){
 if(!state.bag[id])return;
 state.bag[id]-=n;if(state.bag[id]<=0)delete state.bag[id];
}
function useItem(id){
 const it=ITEMS[id];if(!it||it.cat!=="use")return;
 if(it.heal&&state.hp>=state.maxHp){notify("生命值已满");return}
 if(it.heal){state.hp=Math.min(state.maxHp,state.hp+it.heal);updateHP();EA()?.pickup();notify("使用 "+it.name+" · 恢复 "+it.heal+" 生命");}
 /* 增益类物品（力量药剂）：限时提升攻击力 */
 if(it.buff){state.buff={atk:it.buff.atk,until:performance.now()+it.buff.dur*1000};EA()?.pickup();notify("使用 "+it.name+" · 攻击 +"+it.buff.atk+"，持续 "+it.buff.dur+" 秒");}
 removeItem(id);renderInventory();saveGame();
}

/* ================= 特效层 ================= */
function ensureFxLayer(){
 if($("fxLayer"))return;
 const layer=document.createElement("div");
 layer.id="fxLayer";
 layer.innerHTML='<div id="fxFlash"></div>';
 document.body.appendChild(layer);
}
function playNumberPop(el){
 if(!el)return;
 el.classList.remove("hud-number-pop");void el.offsetWidth;el.classList.add("hud-number-pop");
}
function playRewardFx(title,detail=""){
 ensureFxLayer();
 const flash=$("fxFlash");if(flash){flash.classList.remove("play");void flash.offsetWidth;flash.classList.add("play");}
 document.querySelector(".fx-reward-popup")?.remove();
 const p=document.createElement("div");
 p.className="fx-reward-popup";
 p.innerHTML="<small>NEW DISCOVERY</small><b>"+title+"</b>"+(detail?"<span>"+detail+"</span>":"");
 $("fxLayer").appendChild(p);
 setTimeout(()=>p.classList.add("out"),1050);
 setTimeout(()=>p.remove(),1420);
}
function triggerButtonFx(button,held=false){
 if(!button)return;
 if(held)button.classList.add("is-held");
 const ripple=document.createElement("i");
 ripple.className="game-action-ripple";
 button.appendChild(ripple);
 setTimeout(()=>ripple.remove(),520);
}
function vibrate(ms){if(state.settings.vib&&navigator.vibrate)navigator.vibrate(ms)}

/* ================= 画布与世界 ================= */
const canvas=document.createElement("canvas");
canvas.id="worldCanvas";
$("game").appendChild(canvas);
const ctx=canvas.getContext("2d",{alpha:false});
let W=innerWidth,H=innerHeight,DPR=Math.min(devicePixelRatio||1,2);
const world={w:3000,h:2200};

const particles=[],texts=[],enemies=[],npcs=[],landmarks=[],trees=[],rocks=[],grassTufts=[],flowers=[],fireflies=[],buildings=[],resources=[],chests=[],gates=[],echoes=[],campfires=[],clues=[];
let boss=null;
const bossRings=[],hazards=[];

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
function isLake(x,y){const dx=(x-2320)/620,dy=(y-1770)/480;return dx*dx+dy*dy<1}
function zoneAt(x,y){
 if(isLake(x,y)||(x>1700&&y>1250))return "暮潮湖畔";
 if(x<950)return "静谧森林";
 if(x>2050&&y<900)return "风痕高地";
 return "晨雾谷";
}
function isNight(){const h=state.time%24;return h<5.5||h>19}
function notify(s){
 const t=$("toast");if(!t)return;
 t.textContent=s;t.classList.add("show");clearTimeout(notify.t);
 notify.t=setTimeout(()=>t.classList.remove("show"),1900);
}

/* ---------- 世界坐标 <-> 屏幕坐标（带镜头缩放） ---------- */
function worldToScreen(x,y){return{x:x-camera.x+W/2,y:y-camera.y+H/2}}
/* 视觉坐标（含缩放）：用于 HUD 定位 */
function worldToVisual(x,y){return{x:(x-camera.x)*camera.zoom+W/2,y:(y-camera.y)*camera.zoom+H/2}}
function screenToWorld(x,y){return{x:(x-W/2)/camera.zoom+camera.x,y:(y-H/2)/camera.zoom+camera.y}}

/* ---------- 战争迷雾 ---------- */
const FOG_CELL=150,FOG_COLS=Math.ceil(world.w/FOG_CELL),FOG_ROWS=Math.ceil(world.h/FOG_CELL);
const exploredSet=new Set();
let fogLastCell=-1;
function markExplored(){
 const cx=Math.floor(player.x/FOG_CELL),cy=Math.floor(player.y/FOG_CELL);
 const idx=cx+cy*FOG_COLS;
 if(idx===fogLastCell)return;
 fogLastCell=idx;
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
  const x=cx+dx,y=cy+dy;
  if(x>=0&&y>=0&&x<FOG_COLS&&y<FOG_ROWS)exploredSet.add(x+y*FOG_COLS);
 }
 for(const l of landmarks)if(l.type!=="stone"&&dist(player,l)<330)l.seen=true;
 for(const f of campfires)if(dist(player,f)<320)f.seen=true;
 checkAchievements();
}

/* ---------- 生成世界 ---------- */
function addTree(x,y,s=1){trees.push({x,y,s,variant:Math.floor(rnd(0,3)),shade:rnd(.85,1.15)})}
function addRock(x,y,s=1){rocks.push({x,y,s,rot:rnd(0,Math.PI*2)})}
function addFlower(x,y,c){flowers.push({x,y,c})}
function addGrass(x,y){grassTufts.push({x,y,l:Math.floor(rnd(0,3)),p:rnd(0,6)})}
function addBuilding(x,y,w,h,type,name){buildings.push({x,y,w,h,type,name})}
function addNPC(x,y,name,role,color){npcs.push({x,y,name,role,color,phase:rnd(0,6)})}
function addEnemy(x,y,type="荒原狼"){
 const c=ETYPE[type];
 enemies.push({x,y,type,hp:c.hp,max:c.hp,homeX:x,homeY:y,phase:rnd(0,6),hit:0,dead:false,windup:0,recover:0,cd:0,wx:0,wy:0});
}
function addLandmark(x,y,type,name){landmarks.push({x,y,type,name,seen:false})}
function addResource(x,y,type){resources.push({x,y,type,taken:false,phase:rnd(0,6)})}
function addChest(x,y,kind="normal"){chests.push({x,y,kind,opened:false,found:kind!=="hidden",phase:rnd(0,6)})}
function addGate(x,y,name){gates.push({x,y,name,open:false})}
function addEcho(x,y){echoes.push({x,y,taken:false,phase:rnd(0,6)})}
function addCampfire(x,y,name="营火"){campfires.push({x,y,name,phase:rnd(0,6),seen:false})}
function addClue(x,y,type,name,lore,give){clues.push({x,y,type,name,lore,give,found:false,phase:rnd(0,6)})}

/* 敌人类型：攻击方式 + 行为特点 */
const ETYPE={
 "荒原狼":{hp:180,sp:56,aggro:320,range:52,wind:.5,cd:1.2,dmg:12,xp:40,coin:18,lunge:92,lv:5},
 "岩甲兽":{hp:360,sp:34,aggro:300,range:64,wind:.85,cd:1.8,dmg:24,xp:90,coin:30,lv:8},
 "岩甲兽·精英":{hp:560,sp:38,aggro:350,range:70,wind:.8,cd:1.5,dmg:30,xp:170,coin:60,elite:true,lv:10}
};

/* 回声碎片叙事：玩家不知道总数，每一块讲一点故事 */
const FRAG_LORE=[
 "“这里曾经有人来过。”",
 "“他们在寻找同一个声音。”",
 "“声音来自地下。”",
 "“有人在雾里留下了一盏灯。”",
 "“湖水记得每一次回响。”",
 "“岩石也在倾听。”",
 "“他们不是第一批旅人。”",
 "“回声越来越近了。”",
 "“当它醒来时，大陆会记得你的名字。”"
];

function generateWorld(){
 // 森林
 for(let i=0;i<145;i++)addTree(rnd(70,900),rnd(80,2080),rnd(.75,1.35));
 // 高地树木
 for(let i=0;i<55;i++)addTree(rnd(2000,2940),rnd(80,980),rnd(.7,1.15));
 for(let i=0;i<95;i++)addRock(rnd(80,2920),rnd(80,2100),rnd(.6,1.25));
 for(let i=0;i<180;i++)addFlower(rnd(70,2920),rnd(70,2080),["#d6b86a","#e8d9a2","#b6d19c","#d98f86"][i%4]);
 // 三层草
 for(let i=0;i<240;i++){const x=rnd(60,2940),y=rnd(60,2140);if(!isLake(x,y))addGrass(x,y)}
 // 村庄
 addBuilding(1120,770,170,125,"house","村长宅邸");
 addBuilding(1330,735,145,110,"house","旅店");
 addBuilding(1120,990,150,105,"house","工坊");
 addBuilding(1350,990,130,100,"house","杂货铺");
 addBuilding(1500,825,100,80,"well","村井");
 addBuilding(1270,575,210,95,"hall","晨雾谷礼堂");
 // 道路石
 for(let i=0;i<24;i++)addLandmark(1050+i*42,roadY(1050+i*42),"stone","道路");
 // 地标
 addLandmark(430,420,"ruin","旧灯塔");
 addLandmark(720,1590,"ruin","藤蔓遗迹");
 addLandmark(1550,430,"shrine","回声神殿");
 addLandmark(2050,1420,"shrine","潮汐祭坛");
 // 钓鱼点：湖边浅水，靠近可垂钓
 addLandmark(2200,1350,"fishing","湖畔钓点");
 // NPC
 addNPC(1260,820,"艾琳","村庄向导","#e7b85b");
 addNPC(1390,900,"诺安","铁匠","#b87b62");
 addNPC(1190,1040,"米娅","杂货商","#86a98e");
 addNPC(1510,760,"莱恩","巡林者","#7895ae");
 // 敌人：普通 / 强敌 / 精英
 addEnemy(520,650,"荒原狼");addEnemy(650,780,"荒原狼");addEnemy(800,520,"荒原狼");
 addEnemy(620,1450,"荒原狼");addEnemy(840,1660,"荒原狼");
 addEnemy(1900,1160,"荒原狼");addEnemy(2250,1190,"荒原狼");addEnemy(2700,430,"荒原狼");
 addEnemy(2220,520,"岩甲兽");addEnemy(2450,720,"岩甲兽");
 addEnemy(2560,540,"岩甲兽·精英");
 // 资源按生态分布：森林木材草药野果 / 山地铁矿晶矿石材 / 湖边水草贝壳
 for(let i=0;i<16;i++)addResource(rnd(120,900),rnd(140,2000),["wood","herb","berry"][i%3]);
 for(let i=0;i<14;i++)addResource(rnd(2060,2920),rnd(120,960),["ore","crystal","stone"][i%3]);
 for(let i=0;i<12;i++){const a=rnd(0,Math.PI*2),r=rnd(1.05,1.25);addResource(2320+Math.cos(a)*620*r,1770+Math.sin(a)*480*r,i%2?"grass":"shell")}
 for(let i=0;i<14;i++)addResource(rnd(1000,1750),rnd(300,1900),["herb","wood","ore"][i%3]);
 // 宝箱：普通 / 精致（精英看守） / 隐藏（不显示）
 addChest(560,360);addChest(880,1380);addChest(1020,620);addChest(1580,1840);addChest(1660,1180);addChest(2100,1580);
 addChest(2580,470,"rare");
 addChest(690,1665,"hidden");addChest(2760,1450,"hidden");
 // 石门
 addGate(930,1120,"森林石门");
 addGate(1760,1250,"湖畔古门");
 // 9 枚回声碎片
 [[300,300],[880,310],[1020,1510],[1480,390],[1640,1060],[2010,1040],[2380,930],[2700,900],[2820,1420]].forEach(p=>addEcho(p[0],p[1]));
 // 营火（恢复 + 传送点）
 addCampfire(1040,920,"晨雾谷营火");addCampfire(2020,1180,"湖畔营火");addCampfire(2570,760,"高地营火");
 // 环境叙事线索（第一章）
 addClue(610,545,"claw","树上的抓痕","树干上留着三道深深的抓痕，边缘泛着微弱的光。有什么东西从这里经过。",null);
 addClue(775,700,"camp","被毁的营地","营地被翻得一片狼藉。熄灭的火堆旁，散落着几枚奇怪的鳞片。","scale");
 // Boss
 addLandmark(2700,1650,"boss","古龙巢穴");
 boss={x:2700,y:1650,type:"暮岩古龙",hp:1800,max:1800,hit:0,phase:0,active:false,dead:false,attackCd:0,ringCd:3,hazardCd:2};
 // 萤火虫
 for(let i=0;i<70;i++)fireflies.push({x:rnd(300,1800),y:rnd(250,1900),p:rnd(0,6),s:rnd(.4,1)});
}
generateWorld();
markExplored();

/* ================= 加载屏 ================= */
function setLoading(){
 const bar=$("loadBar"),txt=$("loadText"),loading=$("loading");
 if(!loading)return;
 let p=0,finished=false;
 const finish=()=>{if(finished)return;finished=true;loading.classList.add("hidden");loading.setAttribute("aria-hidden","true")};
 const timer=setInterval(()=>{
  p=Math.min(100,p+20);
  if(bar)bar.style.width=p+"%";
  if(txt)txt.textContent=p<45?"正在绘制晨雾谷…":p<80?"正在唤醒居民与野兽…":"世界已准备完成";
  if(p>=100){clearInterval(timer);finish();}
 },80);
 setTimeout(()=>{clearInterval(timer);finish();},1400);
}
setLoading();

/* ================= 任务系统（第一章：晨雾谷的回声） ================= */
const QUESTS=[
 {t:"初见晨雾谷",h:"与艾琳交谈，了解晨雾谷最近的异常",d:"晨雾谷最近总能听见森林深处传来奇怪的回声。村庄向导艾琳似乎知道些什么。"},
 {t:"森林异动",h:"调查森林中的异常痕迹",d:"森林里出现了不属于任何野兽的痕迹。顺着小径往深处走，看看那里留下了什么。"},
 {t:"森林中的威胁",h:"击败森林中的荒原狼",d:"狼群被某种声音惊扰，变得狂躁。让它们安静下来。"},
 {t:"旧灯塔",h:"前往森林深处的旧灯塔",d:"抓痕的尽头指向一座熄灭的旧灯塔。那里是最早出现异常的地方。"},
 {t:"回声的源头",h:"前往潮汐祭坛，寻找回声的源头",d:"灯塔的回声指向湖的另一边。潮汐祭坛在等你。"},
 {t:"回到晨雾谷",h:"回到晨雾谷，向艾琳报告发现",d:"祭坛的回声比想象中更深。先回村庄，把发现告诉艾琳。"},
 {t:"新的回声",h:"第一章已完成 · 继续自由探索这片大陆",d:"晨雾谷的调查暂告一段落，但更远的回声还在路上。"}
];
function questTitle(){return QUESTS[state.quest].t}
function questHint(){return QUESTS[state.quest].h}
function questDesc(){return QUESTS[state.quest].d}
function questProg(){
 if(state.quest===1)return state.clues+" / 2";
 if(state.quest===2)return state.kills+" / 3";
 return "";
}
function questTarget(){
 if(state.quest===0||state.quest===5)return npcs.find(n=>n.name==="艾琳")||null;
 if(state.quest===1){const l=clues.filter(c=>!c.found);return l.sort((a,b)=>dist(player,a)-dist(player,b))[0]||null}
 if(state.quest===2){const l=enemies.filter(e=>!e.dead&&e.type==="荒原狼");return l.sort((a,b)=>dist(player,a)-dist(player,b))[0]||null}
 if(state.quest===3)return landmarks.find(l=>l.name==="旧灯塔")||null;
 if(state.quest===4)return landmarks.find(l=>l.name==="潮汐祭坛")||null;
 return null;
}
function questObjectives(){
 const q=state.quest;
 if(q===0)return[["与艾琳交谈",false,""]];
 if(q===1)return[["调查树上的抓痕",clues[0]?.found,""],["调查被毁的营地",clues[1]?.found,""]];
 if(q===2)return[["击败荒原狼",state.kills>=3,state.kills+" / 3"]];
 if(q===3)return [["查看旧灯塔",false,""]];
 if(q===4)return [["查看潮汐祭坛",false,""]];
 if(q===5)return [["向艾琳报告",false,""]];
 return [["自由探索",false,""],["收集回声碎片",false,state.echoes+""]];
}
function advanceQuest(n,msg){
 state.quest=n;
 const qt=$("questTrack");
 if(qt){qt.classList.remove("flash");void qt.offsetWidth;qt.classList.add("flash")}
 notify(msg||("任务更新："+questTitle()));
 checkAchievements(); /* 任务奖励金币可能触发财富成就 */
 updateQuestUI();saveGame();
}
function updateQuestUI(){
 const t=$("questTitle"),h=$("questHint"),p=$("questProg");
 if(t)t.textContent=questTitle();
 if(h)h.textContent=questHint();
 if(p){const s=questProg();p.textContent=s;p.style.display=s?"":"none"}
 const lt=$("levelText");if(lt)lt.textContent="Lv. "+state.level;
}

/* ================= 对话 ================= */
let dialogueQueue=[];
function talk(npc){
 state.dialogue=true;
 if(npc.name==="艾琳"){
  /* 艾琳：按任务阶段推进的对话树 */
  if(state.quest===0){
   dialogueQueue=[
    ["艾琳","村庄向导","你终于来了。晨雾谷最近总能听见森林深处传来奇怪的回声。"],
    ["艾琳","村庄向导","先别急着追问。顺着西边的小径往森林里走，留意树干和地面——异常最先出现在那里。"],
    ["艾琳","村庄向导","如果遇到野兽，看清它们的动作再出手。它们扑上来之前，总会先压低身子。"]
   ];
  }else if(state.quest===1){
   dialogueQueue=[
    ["艾琳","村庄向导","西边森林查得怎么样了？抓痕、营地，任何细节都别放过。"],
    ["艾琳","村庄向导","那些痕迹出现的地方，草叶都会在夜里微微发光。跟着光走。"]
   ];
  }else if(state.quest===2){
   dialogueQueue=[
    ["艾琳","村庄向导","狼群只是被那个声音吓坏了。让它们安静下来，村里人才敢进林砍柴。"],
    ["艾琳","村庄向导","小心它们的扑击——看清红色的预兆再闪避，别逞强。"]
   ];
  }else if(state.quest===3){
   dialogueQueue=[
    ["艾琳","村庄向导","旧灯塔在森林最深处。塔灯熄了很多年，可最近有人说看见塔顶在夜里发光。"],
    ["艾琳","村庄向导","到塔顶去看看。如果回声真有源头，那里一定留着什么。"]
   ];
  }else if(state.quest===4){
   dialogueQueue=[
    ["艾琳","村庄向导","回声不在风里，在水下……那就去潮汐祭坛。沿湖往东，别绕进高地。"],
    ["艾琳","村庄向导","湖边新支了个钓点，路过时可以甩两竿，烤条鱼再上路。"]
   ];
  }else if(state.quest===5){
   dialogueQueue=[
    ["艾琳","村庄向导","你回来了。脸色这么难看……祭坛那边，你看到了什么？"],
    ["艾琳","村庄向导","湖底的声音……原来回声不是从森林里来的。它一直都在更深的地方。"],
    ["艾琳","村庄向导","拿着这个。晨雾谷欠你一次。以后无论走到哪里，这里都是你的村庄。"]
   ];
  }else{
   /* 第一章完成后的日常对话（轮换） */
   const daily=[
    ["艾琳","村庄向导","村里一切都好。要是累了，去营火边烤条鱼，比什么都强。"],
    ["艾琳","村庄向导","湖畔钓点最近收获不错，去试试手气？钓上来的鱼还能烤着吃。"],
    ["艾琳","村庄向导","回声碎片还在大陆的各处沉睡。收集得越多，这个世界的故事就越完整。"]
   ];
   dialogueQueue=[daily[Math.floor(Math.random()*daily.length)]];
  }
 }else if(npc.name==="诺安"){
  /* 诺安：根据玩家背包里的矿石变化 */
  const hasOre=(state.bag.ore||0)>0,hasCrystal=(state.bag.crystal||0)>0;
  if(hasOre&&hasCrystal){
   dialogueQueue=[
    ["诺安","铁匠","铁矿和晶矿都带来了？好料子！这成色，打一把好剑绰绰有余。"],
    ["诺安","铁匠","对了——用一块晶矿配两株晨雾草，在营火上能调一剂力量药剂。要拼命的时候，喝它。"]
   ];
  }else if(hasOre){
   dialogueQueue=[
    ["诺安","铁匠","铁矿不错，是好底子。可要打出真正的好剑，还差晶矿——高地上发蓝光的那些就是。"],
    ["诺安","铁匠","风痕高地往北走。小心岩甲兽，它们挥下来之前，地面会先红。"]
   ];
  }else if(hasCrystal){
   dialogueQueue=[
    ["诺安","铁匠","哟，晶矿！成色真好。再挖几块铁矿来，我就能替你开工。"],
    ["诺安","铁匠","铁矿也在高地上，灰蓝色的石头，一眼就能认出来。"]
   ];
  }else{
   dialogueQueue=[
    ["诺安","铁匠","你的剑刃磨损得厉害。野外可不是只有风景。"],
    ["诺安","铁匠","高地上能挖到铁矿和晶矿。攒够了材料，我替你打一把真正的剑。"]
   ];
  }
 }else if(npc.name==="米娅"){
  /* 米娅：根据背包里是否有晨雾草变化 */
  if((state.bag.herb||0)>0){
   dialogueQueue=[
    ["米娅","杂货商","嗯？你身上有晨雾草的味道。夜里发光的花瓣，磨成粉能安神，也能入药。"],
    ["米娅","杂货商","留两株在身上——听说配着晶矿在营火上熬，能调出让人力大无穷的药剂。"]
   ];
  }else{
   dialogueQueue=[
    ["米娅","杂货商","晨雾草在湖畔也能找到。它们的花瓣在夜里会发光。"],
    ["米娅","杂货商","湖边的贝壳别嫌多，总有人愿意收。要是钓上鱼来，我这里也收。"]
   ];
  }
 }else{
  /* 莱恩：根据玩家等级变化 */
  if(state.level<8){
   dialogueQueue=[
    ["莱恩","巡林者","别往北面的高地走太深。那里的岩甲兽比看起来更难对付。"],
    ["莱恩","巡林者","以你现在的身手，还不足以应付高地的家伙。先在森林和湖畔多历练历练吧。"],
    ["莱恩","巡林者","听到岩石滚动的声音就闪开。它们挥下来之前，地面会先红。"]
   ];
  }else{
   dialogueQueue=[
    ["莱恩","巡林者","看你的眼神就知道，你已经是个老手了。高地以北的路，你可以走。"],
    ["莱恩","巡林者","要是遇到古龙，记住：它积蓄冲击波的时候，跑得越远越好。"]
   ];
  }
 }
 renderDialogue();
}
function renderDialogue(){
 if(!dialogueQueue.length){endDialogue();return}
 const d=dialogueQueue[0];
 $("dialogueRole").textContent=d[1];$("dialogueName").textContent=d[0];typeDialogueText(d[2]);
 $("dialogue").classList.remove("hidden");document.body.classList.add("dialogue-open");
}
function typeDialogueText(text){
 clearInterval(dialogueTypeTimer);
 const el=$("dialogueText");if(!el)return;
 dialogueTyping=true;dialogueFullText=text;el.classList.add("dialogue-text-typing");el.textContent="";
 let i=0;
 const step=()=>{
  i++;
  el.textContent=text.slice(0,i);
  if(i>=text.length){clearInterval(dialogueTypeTimer);dialogueTyping=false;el.classList.remove("dialogue-text-typing")}
 };
 dialogueTypeTimer=setInterval(step,Math.max(16,Math.min(42,900/Math.max(1,text.length))));
}
function endDialogue(){
 state.dialogue=false;document.body.classList.remove("dialogue-open");$("dialogue")?.classList.add("hidden");
 if(state.quest===0)advanceQuest(1);
 else if(state.quest===5){
  state.coins+=120;addItem("badge");
  playRewardFx("晨雾谷徽记","第一章 · 晨雾谷的回声 完成 · +120 金币");
  advanceQuest(6,"第一章完成：晨雾谷的回声");
 }
}
function nextDialogue(){
 if(dialogueTyping){
  clearInterval(dialogueTypeTimer);
  $("dialogueText").textContent=dialogueFullText;
  $("dialogueText").classList.remove("dialogue-text-typing");
  dialogueTyping=false;return;
 }
 dialogueQueue.shift();
 renderDialogue();
}

/* ================= 探索成就系统 ================= */
const ACHIEVEMENTS=[
 {id:"firstKill",name:"首次击杀",desc:"击败第一只荒原狼"},
 {id:"collect3",name:"收集者 · 初识",desc:"收集 3 个回声碎片"},
 {id:"collect6",name:"收集者 · 渐入",desc:"收集 6 个回声碎片"},
 {id:"collect9",name:"收集者 · 圆满",desc:"收集 9 个回声碎片"},
 {id:"explore25",name:"探险家 · 一隅",desc:"探索 25% 的地图"},
 {id:"explore50",name:"探险家 · 半壁",desc:"探索 50% 的地图"},
 {id:"explore75",name:"探险家 · 远方",desc:"探索 75% 的地图"},
 {id:"gold500",name:"财富 · 小有积蓄",desc:"拥有 500 金币"},
 {id:"gold1000",name:"财富 · 富甲一方",desc:"拥有 1000 金币"}
];
/* 解锁成就：金色卡片从右上角滑入 */
function unlockAch(id){
 if(state.achievements[id])return;
 const a=ACHIEVEMENTS.find(x=>x.id===id);if(!a)return;
 state.achievements[id]=true;
 showAchCard(a);EA()?.levelUp?.();saveGame();
}
/* 条件检查：在击杀 / 拾取 / 探索 / 金币变动等时机调用 */
function checkAchievements(){
 if(state.kills>=1)unlockAch("firstKill");
 if(state.echoes>=3)unlockAch("collect3");
 if(state.echoes>=6)unlockAch("collect6");
 if(state.echoes>=9)unlockAch("collect9");
 const exp=exploredSet.size/(FOG_ROWS*FOG_COLS)*100;
 if(exp>=25)unlockAch("explore25");
 if(exp>=50)unlockAch("explore50");
 if(exp>=75)unlockAch("explore75");
 if(state.coins>=500)unlockAch("gold500");
 if(state.coins>=1000)unlockAch("gold1000");
}
function showAchCard(a){
 let layer=$("achLayer");
 if(!layer){layer=document.createElement("div");layer.id="achLayer";document.body.appendChild(layer)}
 const card=document.createElement("div");
 card.className="ach-card";
 card.innerHTML='<i>◆</i><div class="ach-card-text"><small>成就解锁</small><b>'+a.name+'</b><span>'+a.desc+'</span></div>';
 layer.appendChild(card);
 requestAnimationFrame(()=>card.classList.add("in"));
 setTimeout(()=>card.classList.add("out"),2600);
 setTimeout(()=>card.remove(),3150);
}
/* 任务面板底部的成就列表 */
function renderAchievements(){
 const main=document.querySelector("#questPanel .quest-main");if(!main)return;
 let sec=$("achSection");
 if(!sec){
  sec=document.createElement("section");
  sec.id="achSection";sec.className="quest-log ach-section";
  sec.innerHTML='<small>成就</small><div id="achList" class="ach-list"></div>';
  main.appendChild(sec);
 }
 $("achList").innerHTML=ACHIEVEMENTS.map(a=>{
  const un=!!state.achievements[a.id];
  return '<div class="ach-row'+(un?" done":"")+'"><i>'+(un?"✓":"○")+'</i><b>'+a.name+'</b><span>'+a.desc+'</span></div>';
 }).join("");
}

/* ================= 钓鱼系统 ================= */
let fishingTimer=0;
function showFishingUI(text){
 hideFishingUI();
 const ui=document.createElement("div");
 ui.id="fishingUI";
 ui.innerHTML='<div class="fishing-panel"><div class="fishing-bobber"></div><span>'+text+'</span></div>';
 document.body.appendChild(ui);
}
function hideFishingUI(){$("fishingUI")?.remove()}
function cancelFishing(){
 if(!state.fishing)return;
 clearTimeout(fishingTimer);state.fishing=false;hideFishingUI();notify("收起了鱼竿");
}
function startFishing(){
 if(state.fishing)return;
 state.fishing=true;
 showFishingUI("等待鱼儿上钩…");
 EA()?.pickup?.();
 /* 等待 2-4 秒后判定，70% 成功率 */
 fishingTimer=setTimeout(()=>{
  state.fishing=false;hideFishingUI();
  if(Math.random()<.7){
   /* 收获：水草 ×2 / 贝壳 ×1 / 鱼 ×1 */
   const roll=Math.random();let gain;
   if(roll<.4){addItem("grass",2);gain="水草 ×2"}
   else if(roll<.7){addItem("shell",1);gain="贝壳 ×1"}
   else{addItem("fish",1);gain="鱼 ×1"}
   playRewardFx("钓获 "+gain,"湖畔钓点 · 垂钓成功");
   notify("钓到了："+gain);
   emit(player.x,player.y,"#8ecfe0",18);EA()?.shard?.();
  }else{
   notify("鱼儿溜走了…");
  }
  renderInventory();saveGame();
 },rnd(2000,4000));
}

/* ================= 合成系统（营火） ================= */
const RECIPES={
 grilledFish:{name:"烤鱼",icon:"grilledFish",cost:{fish:1,wood:1},desc:"鱼 ×1 + 木材 ×1 · 恢复 150 生命"},
 strengthPotion:{name:"力量药剂",icon:"strengthPotion",cost:{crystal:1,herb:2},desc:"晶矿 ×1 + 晨雾草 ×2 · 攻击 +10（60 秒）"}
};
function canCraft(id){const r=RECIPES[id];return Object.keys(r.cost).every(k=>(state.bag[k]||0)>=r.cost[k])}
function openCraft(fire){
 state.craft=true;
 renderCraft(fire);
}
function renderCraft(fire){
 let p=$("craftPanel");
 if(!p){p=document.createElement("div");p.id="craftPanel";document.body.appendChild(p)}
 p.innerHTML='<div class="craft-box"><small>CAMPFIRE · '+(fire?fire.name:"营火")+'</small><h3>营火 · 合成</h3><div class="craft-list">'+
  Object.keys(RECIPES).map(id=>{
   const r=RECIPES[id],ok=canCraft(id);
   return '<button class="craft-row" data-craft="'+id+'"'+(ok?"":" disabled")+'>'+
    '<span class="craft-icon">'+ICONS[r.icon]+'</span>'+
    '<span class="craft-info"><b>'+r.name+'</b><em>'+r.desc+'</em></span>'+
    '<span class="craft-act">'+(ok?"合成":"材料不足")+'</span></button>';
  }).join("")+
  '</div><button class="craft-leave" data-craft-leave>离开营火</button></div>';
 p.querySelectorAll("[data-craft]").forEach(b=>b.addEventListener("click",()=>craft(b.dataset.craft)));
 p.querySelector("[data-craft-leave]").addEventListener("click",closeCraft);
}
function craft(id){
 const r=RECIPES[id];if(!r)return;
 if(!canCraft(id)){notify("材料不足");return}
 for(const k in r.cost)removeItem(k,r.cost[k]);
 addItem(id);
 emit(player.x,player.y,"#f0cf72",20);EA()?.pickup();
 playRewardFx("合成 "+r.name,r.desc);
 renderInventory();saveGame();
 renderCraft(); /* 刷新材料可用状态 */
}
function closeCraft(){state.craft=false;$("craftPanel")?.remove()}

/* ================= 回声碎片叙事卡 ================= */
function showLore(text,after){
 state.lore=true;
 $("loreText").textContent=text;
 $("lore").classList.remove("hidden");
 $("loreOk").onclick=()=>{
  $("lore").classList.add("hidden");state.lore=false;
  if(after)after();
 };
}

/* ================= 面板（第三层） ================= */
const PANELS=["characterPanel","inventoryPanel","questPanel","mapPanel"];
let invCat="all";
function openFullPanel(id){
 closeMenu();
 state.panel=true;
 PANELS.forEach(x=>$(x)?.classList.add("hidden"));
 $(id)?.classList.remove("hidden");
 if(id==="characterPanel")renderCharacter();
 if(id==="inventoryPanel")renderInventory();
 if(id==="questPanel")renderQuestPanel();
 if(id==="mapPanel")drawMapPanel();
}
function closeFullPanel(id){
 $(id)?.classList.add("hidden");
 if(!PANELS.some(x=>!$(x)?.classList.contains("hidden")))state.panel=false;
}
function closeAllPanels(){PANELS.forEach(x=>$(x)?.classList.add("hidden"));state.panel=false}

function renderCharacter(){
 const zone=zoneAt(player.x,player.y);
 $("charLevel").textContent="Lv. "+state.level+" · "+zone+"的旅人";
 $("charHp").textContent=Math.ceil(state.hp)+" / "+state.maxHp;
 $("charPower").textContent=state.equipment.power;
 $("charSp").textContent=Math.floor(player.stamina);
 $("charXp").textContent=state.xp+" / "+state.nextXp;
 $("charEcho").textContent=state.echoes;
 $("charWeapon").textContent=state.equipment.weapon;
 const xf=$("charXpFill");if(xf)xf.style.width=Math.min(100,state.xp/state.nextXp*100)+"%";
 const mn=$("charMapName");if(mn)mn.textContent=zone;
 const titles=["雾谷初行者","林间访客","灯塔守望人","回声拾遗者"];
 const ti=$("charTitle");if(ti)ti.textContent=titles[Math.min(titles.length-1,Math.floor(state.echoes/3))];
}
const INV_CAP=30,CAT_NAMES={equip:"装备",use:"消耗品",mat:"材料",quest:"任务"};
let invSorted=false;
function renderInventory(){
 const box=$("invGrid");if(!box)return;
 let ids=Object.keys(state.bag).filter(id=>ITEMS[id]&&(invCat==="all"||ITEMS[id].cat===invCat));
 if(invSorted){const order={equip:0,use:1,mat:2,quest:3};ids.sort((a,b)=>order[ITEMS[a].cat]-order[ITEMS[b].cat]||ITEMS[a].name.localeCompare(ITEMS[b].name,"zh"))}
 const cap=$("invCap");if(cap)cap.textContent=Object.keys(state.bag).length+" / "+INV_CAP;
 const used=ids.length,emptyCount=invCat==="all"?Math.max(0,Math.min(INV_CAP-used,6)):0;
 if(!ids.length){box.innerHTML='<div class="inv-empty">这一栏还空着</div>';return}
 box.innerHTML=ids.map(id=>{
  const it=ITEMS[id],n=state.bag[id];
  return '<div class="inv-slot'+(it.cat==="use"?" inv-use":"")+(it.rare?" inv-rare":"")+'" data-item="'+id+'" title="'+(it.cat==="use"?"点击使用":"")+'">'+ICONS[id]+'<span class="inv-name">'+it.name+'</span>'+(n>1?'<span class="inv-n">×'+n+'</span>':"")+'</div>';
 }).join("")+Array.from({length:emptyCount},()=>'<div class="inv-slot inv-blank" aria-hidden="true"></div>').join("");
 const tip=$("invTip");
 box.querySelectorAll("[data-item]").forEach(el=>{
  el.addEventListener("click",()=>useItem(el.dataset.item));
  el.addEventListener("mouseenter",()=>{
   const it=ITEMS[el.dataset.item];if(!it||!tip)return;
   $("invTipName").textContent=it.name;
   $("invTipType").textContent=CAT_NAMES[it.cat]+(it.rare?" · 稀有":"");
   /* 新物品优先显示定义描述，再按旧逻辑兜底 */
   $("invTipDesc").textContent=it.desc?it.desc:(it.heal?("恢复 "+it.heal+" 点生命。"):(it.rare?"泛着微光的珍稀之物，似乎与回声有关。":"旅途中的寻常物资。"));
   $("invTipCount").textContent="持有 × "+state.bag[el.dataset.item];
   tip.classList.remove("hidden");
  });
  el.addEventListener("mousemove",e=>{
   if(!tip)return;
   const px=Math.min(innerWidth-220,e.clientX+16),py=Math.min(innerHeight-140,e.clientY+16);
   tip.style.left=px+"px";tip.style.top=py+"px";
  });
  el.addEventListener("mouseleave",()=>tip&&tip.classList.add("hidden"));
 });
}
function renderQuestPanel(){
 $("qpTitle").textContent=questTitle();
 $("qpDesc").textContent=questDesc();
 $("qpObjectives").innerHTML=questObjectives().map(o=>'<div class="'+(o[1]?"done":"")+'"><i>'+(o[1]?"✓":"○")+'</i>'+o[0]+(o[2]?"<em>"+o[2]+"</em>":"")+"</div>").join("");
 const rw=[];
 if(state.quest===2)rw.push("经验","金币","材料");
 if(state.quest>=3&&state.quest<=5)rw.push("回声线索","金币");
 $("qpRewards").textContent=rw.length?("可能的收获："+rw.join(" · ")):"";
 const seen=landmarks.filter(l=>l.seen&&l.type!=="stone");
 const log=seen.map(l=>"<span>"+l.name+"</span>").join("")+'<span>回声碎片 × '+state.echoes+"</span>";
 $("exploreLog").innerHTML=log||"<span>还没有探索记录</span>";
 document.querySelectorAll("#questChapters li").forEach(li=>{
  const q=+li.dataset.qc,ic=li.querySelector("i");
  li.classList.toggle("done",q<state.quest);
  li.classList.toggle("now",q===state.quest);
  if(ic)ic.textContent=q<state.quest?"✓":(q===state.quest?"◆":"·");
 });
 renderAchievements(); /* 面板底部：成就列表 */
}

/* ================= 系统菜单（第四层） ================= */
function openMenu(){
 closeAllPanels();
 state.menuOpen=true;
 $("menu")?.classList.remove("hidden");
 $("menuHelp")?.classList.add("hidden");
 $("menuPaneDefault")?.classList.remove("hidden");
 document.querySelectorAll(".menu-list button").forEach((x,i)=>x.classList.toggle("active",i===0));
 const lt=$("lowToggle");if(lt)lt.checked=state.settings.low;
 const vt=$("vibToggle");if(vt)vt.checked=state.settings.vib;
 const st=$("sfxToggle");if(st)st.checked=state.settings.sfx;
}
function closeMenu(){
 state.menuOpen=false;$("menu")?.classList.add("hidden");
}

/* ================= 雷达小地图（左上，只显示附近） ================= */
function drawRadar(){
 const c=$("miniMapCanvas");if(!c||!state.started||state.dialogue||state.menuOpen||state.panel)return;
 const m=c.getContext("2d"),S=c.width,cx=S/2,cy=S/2,R=380,k=(S/2-4)/R;
 m.clearRect(0,0,S,S);
 m.save();
 m.beginPath();m.arc(cx,cy,S/2-2,0,Math.PI*2);m.clip();
 m.fillStyle="#0b181f";m.fillRect(0,0,S,S);
 const toX=x=>cx+(x-player.x)*k,toY=y=>cy+(y-player.y)*k;
 // 地形色块
 for(const z of zones){m.globalAlpha=.55;m.fillStyle=z.c;m.fillRect(toX(z.x),toY(z.y),z.w*k,z.h*k)}
 m.globalAlpha=1;
 // 湖
 m.fillStyle="#2e6474";m.beginPath();m.ellipse(toX(2320),toY(1770),620*k,480*k,0,0,Math.PI*2);m.fill();
 // 道路
 m.strokeStyle="rgba(213,190,145,.5)";m.lineWidth=2;
 m.beginPath();m.moveTo(toX(0),toY(roadY(0)));for(let x=0;x<=world.w;x+=120)m.lineTo(toX(x),toY(roadY(x)));m.stroke();
 m.beginPath();m.moveTo(toX(roadX(0)),toY(0));for(let y=0;y<=world.h;y+=120)m.lineTo(toX(roadX(y)),toY(y));m.stroke();
 // 兴趣点
 const inR=o=>dist(player,o)<R+40;
 for(const f of campfires)if(inR(f)){m.fillStyle="#f3c65f";m.beginPath();m.arc(toX(f.x),toY(f.y),2.6,0,Math.PI*2);m.fill()}
 for(const n of npcs)if(inR(n)){m.fillStyle="#e7b85b";m.beginPath();m.arc(toX(n.x),toY(n.y),2.2,0,Math.PI*2);m.fill()}
 for(const e of enemies)if(!e.dead&&inR(e)){m.fillStyle="#d96a5e";m.beginPath();m.arc(toX(e.x),toY(e.y),2.2,0,Math.PI*2);m.fill()}
 for(const ch of chests)if(!ch.opened&&ch.found&&inR(ch)){m.fillStyle="#e8c77b";m.fillRect(toX(ch.x)-2,toY(ch.y)-2,4,4)}
 for(const e of echoes)if(!e.taken&&inR(e)){m.fillStyle="#8ee5ed";m.beginPath();m.arc(toX(e.x),toY(e.y),2,0,Math.PI*2);m.fill()}
 for(const l of landmarks)if(l.type!=="stone"&&l.seen&&inR(l)){m.fillStyle="#d8d4b8";m.beginPath();m.arc(toX(l.x),toY(l.y),2.4,0,Math.PI*2);m.fill()}
 if(boss&&!boss.dead&&inR(boss)){m.fillStyle="#b05a72";m.beginPath();m.arc(toX(boss.x),toY(boss.y),3.4,0,Math.PI*2);m.fill()}
 // 任务目标：金色菱形
 const t=questTarget();
 if(t){
  const x=clamp(toX(t.x),10,S-10),y=clamp(toY(t.y),10,S-10);
  const p=4+Math.sin(performance.now()/300)*1.2;
  m.strokeStyle="#f0cf75";m.lineWidth=1.6;
  m.beginPath();m.moveTo(x,y-p);m.lineTo(x+p,y);m.lineTo(x,y+p);m.lineTo(x-p,y);m.closePath();m.stroke();
 }
 // 玩家朝向
 m.save();m.translate(cx,cy);m.rotate(player.dir);
 m.fillStyle="#fff";m.beginPath();m.moveTo(6,0);m.lineTo(-4,4);m.lineTo(-2,0);m.lineTo(-4,-4);m.closePath();m.fill();
 m.restore();
 m.restore();
 // 外圈
 m.strokeStyle="rgba(232,199,123,.35)";m.lineWidth=1;
 m.beginPath();m.arc(cx,cy,S/2-2,0,Math.PI*2);m.stroke();
}

/* ================= 世界地图（迷雾） ================= */
function drawMapPanel(){
 const c=$("mapCanvas");if(!c)return;
 const m=c.getContext("2d"),mw=c.width,mh=c.height,k=mw/world.w;
 const toX=x=>x*k,toY=y=>y*k;
 m.clearRect(0,0,mw,mh);
 // 地形
 for(const z of zones){m.fillStyle=z.c;m.fillRect(toX(z.x),toY(z.y),z.w*k,z.h*k)}
 const grad=m.createLinearGradient(1800*k,1350*k,2700*k,2200*k);grad.addColorStop(0,"#477e8c");grad.addColorStop(1,"#285f72");
 m.fillStyle=grad;m.beginPath();m.ellipse(toX(2320),toY(1770),620*k,480*k,0,0,Math.PI*2);m.fill();
 // 道路
 m.strokeStyle="#c5a879";m.lineWidth=3;m.beginPath();m.moveTo(0,toY(roadY(0)));for(let x=0;x<=world.w;x+=80)m.lineTo(toX(x),toY(roadY(x)));m.stroke();
 m.strokeStyle="#d5be91";m.lineWidth=2;m.beginPath();m.moveTo(toX(roadX(0)),0);for(let y=0;y<=world.h;y+=80)m.lineTo(toX(roadX(y)),toY(y));m.stroke();
 // 迷雾：未探索区域保持未知
 m.fillStyle="rgba(5,11,15,.93)";
 for(let cy=0;cy<FOG_ROWS;cy++)for(let cx=0;cx<FOG_COLS;cx++){
  if(!exploredSet.has(cx+cy*FOG_COLS))m.fillRect(cx*FOG_CELL*k,cy*FOG_CELL*k,FOG_CELL*k+1,FOG_CELL*k+1);
 }
 // 已发现地点
 m.textAlign="center";m.font="11px 'Noto Serif SC',serif";
 for(const l of landmarks){
  if(l.type==="stone"||!l.seen)continue;
  m.fillStyle=l.type==="boss"?"#b05a72":"#f0e5ca";
  m.beginPath();m.arc(toX(l.x),toY(l.y),3,0,Math.PI*2);m.fill();
  m.shadowColor="#000";m.shadowBlur=4;m.fillText(l.name,toX(l.x),toY(l.y)-7);m.shadowBlur=0;
 }
 // NPC（已探索区域）
 for(const n of npcs){
  const ci=Math.floor(n.x/FOG_CELL)+Math.floor(n.y/FOG_CELL)*FOG_COLS;
  if(!exploredSet.has(ci))continue;
  m.fillStyle="#e7b85b";m.beginPath();m.arc(toX(n.x),toY(n.y),2.4,0,Math.PI*2);m.fill();
 }
 // 营火（传送点）
 for(const f of campfires){
  if(!f.seen)continue;
  m.fillStyle="#f3c65f";m.shadowColor="#f3c65f";m.shadowBlur=8;
  m.beginPath();m.arc(toX(f.x),toY(f.y),4,0,Math.PI*2);m.fill();m.shadowBlur=0;
  m.fillStyle="#f0e5ca";m.fillText(f.name,toX(f.x),toY(f.y)+14);
 }
 // 任务目标
 const t=questTarget();
 if(t){
  m.strokeStyle="#f0cf75";m.lineWidth=2;
  const x=toX(t.x),y=toY(t.y);
  m.beginPath();m.moveTo(x,y-7);m.lineTo(x+7,y);m.lineTo(x,y+7);m.lineTo(x-7,y);m.closePath();m.stroke();
 }
 // 玩家
 m.save();m.translate(toX(player.x),toY(player.y));m.rotate(player.dir);
 m.fillStyle="#fff";m.beginPath();m.moveTo(7,0);m.lineTo(-5,4.5);m.lineTo(-5,-4.5);m.closePath();m.fill();m.restore();
 // 面板状态：当前区域 + 探索度
 const rg=$("mapRegion");if(rg)rg.textContent="当前区域 · "+zoneAt(player.x,player.y);
 const total=FOG_ROWS*FOG_COLS,exp=Math.round(exploredSet.size/total*100);
 const et=$("mapExpText");if(et)et.textContent="探索度 "+exp+"%";
 const ef=$("mapExpFill");if(ef)ef.style.width=exp+"%";
}

/* ================= 绘制：世界 ================= */
function drawBackground(){
 ctx.fillStyle="#708d72";ctx.fillRect(0,0,W,H);
 ctx.save();ctx.translate(W/2-camera.x,H/2-camera.y);
 ctx.fillStyle="#678666";ctx.fillRect(0,0,950,world.h);
 ctx.fillStyle="#81976d";ctx.fillRect(2050,0,950,900);
 ctx.fillStyle="#789581";ctx.fillRect(1700,1250,1300,950);
 // 湖：渐变 + 岸边 + 波纹
 const grad=ctx.createLinearGradient(1800,1350,2700,2200);grad.addColorStop(0,"#477e8c");grad.addColorStop(1,"#285f72");
 ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(2320,1770,620,480,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle="#c8bd8b";ctx.lineWidth=18;ctx.globalAlpha=.55;ctx.stroke();ctx.globalAlpha=1;
 // 湖面反光
 ctx.fillStyle="rgba(255,255,255,.06)";ctx.beginPath();ctx.ellipse(2180,1620,320,190,-.4,0,Math.PI*2);ctx.fill();
 // 波纹
 if(!state.settings.low){
  const t=performance.now()/1000;
  ctx.strokeStyle="rgba(220,240,240,.18)";ctx.lineWidth=2;
  for(let i=0;i<3;i++){
   const ph=(t*.35+i*.33)%1;
   ctx.globalAlpha=.22*(1-ph);
   ctx.beginPath();ctx.ellipse(2320,1770,620*(.35+.6*ph),480*(.35+.6*ph),0,0,Math.PI*2);ctx.stroke();
  }
  ctx.globalAlpha=1;
 }
 // 道路
 ctx.strokeStyle="#c0a679";ctx.lineWidth=48;ctx.beginPath();ctx.moveTo(-100,1050);ctx.quadraticCurveTo(1300,960,3100,1100);ctx.stroke();
 ctx.strokeStyle="#d3bc91";ctx.lineWidth=32;ctx.beginPath();ctx.moveTo(1180,-50);ctx.quadraticCurveTo(1250,650,1180,2250);ctx.stroke();
 ctx.restore();
 // 地面纹理
 if(!state.settings.low){ctx.globalAlpha=.1;for(let i=0;i<110;i++){const x=hash(i,3)*W,y=hash(i,7)*H;ctx.fillStyle=i%2?"#fff":"#244d38";ctx.fillRect(x,y,2,2)}ctx.globalAlpha=1}
}

function drawTree(t){
 const s=worldToScreen(t.x,t.y);if(s.x<-70||s.x>W+70||s.y<-120||s.y>H+120)return;
 const q=t.s;
 ctx.save();ctx.translate(s.x,s.y);
 // 地面阴影
 ctx.fillStyle="#0005";ctx.beginPath();ctx.ellipse(3,16*q,26*q,9*q,0,0,Math.PI*2);ctx.fill();
 // 树干
 ctx.fillStyle="#6d503b";ctx.beginPath();ctx.moveTo(-5*q,18*q);ctx.lineTo(-3*q,-8*q);ctx.lineTo(3*q,-8*q);ctx.lineTo(5*q,18*q);ctx.closePath();ctx.fill();
 // 枝杈
 ctx.strokeStyle="#634a37";ctx.lineWidth=2.4*q;ctx.lineCap="round";
 ctx.beginPath();ctx.moveTo(0,-4*q);ctx.lineTo(-11*q,-16*q);ctx.moveTo(1,-6*q);ctx.lineTo(11*q,-18*q);ctx.stroke();
 // 层次树冠
 const c0=t.variant===0?"#4d6f4c":t.variant===1?"#3f6848":"#56794f";
 ctx.fillStyle=c0;ctx.beginPath();ctx.arc(0,-26*q,24*q,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#6d8d59";ctx.beginPath();ctx.arc(-12*q,-36*q,16*q,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#385c43";ctx.beginPath();ctx.arc(13*q,-33*q,15*q,0,Math.PI*2);ctx.fill();
 // 顶部受光
 ctx.fillStyle="rgba(233,215,157,.35)";ctx.beginPath();ctx.arc(-5*q,-42*q,9*q,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
function drawRock(r){
 const s=worldToScreen(r.x,r.y);if(s.x<-50||s.x>W+50||s.y<-50||s.y>H+50)return;
 const q=r.s;
 ctx.save();ctx.translate(s.x,s.y);
 ctx.fillStyle="#15251d55";ctx.beginPath();ctx.ellipse(3,9*q,22*q,7*q,0,0,Math.PI*2);ctx.fill();
 ctx.translate(0,-5*q);
 const rot=r.rot*.35;ctx.rotate(rot);
 ctx.fillStyle="#5b625f";ctx.beginPath();ctx.moveTo(-18*q,7*q);ctx.lineTo(-14*q,-8*q);ctx.lineTo(-4*q,-17*q);ctx.lineTo(10*q,-14*q);ctx.lineTo(18*q,-2*q);ctx.lineTo(12*q,9*q);ctx.lineTo(-3*q,13*q);ctx.closePath();ctx.fill();
 ctx.fillStyle="#9ca095";ctx.beginPath();ctx.moveTo(-14*q,-8*q);ctx.lineTo(-4*q,-17*q);ctx.lineTo(10*q,-14*q);ctx.lineTo(3*q,-3*q);ctx.lineTo(-8*q,1*q);ctx.closePath();ctx.fill();
 ctx.fillStyle="#707772";ctx.beginPath();ctx.moveTo(10*q,-14*q);ctx.lineTo(18*q,-2*q);ctx.lineTo(12*q,9*q);ctx.lineTo(3*q,-3*q);ctx.closePath();ctx.fill();
 ctx.fillStyle="#c0c2b4";ctx.globalAlpha=.48;ctx.beginPath();ctx.moveTo(-5*q,-13*q);ctx.lineTo(3*q,-12*q);ctx.lineTo(0,-8*q);ctx.lineTo(-8*q,-9*q);ctx.closePath();ctx.fill();
 ctx.restore();
}
function drawGrass(g){
 const s=worldToScreen(g.x,g.y);if(s.x<-20||s.x>W+20||s.y<-20||s.y>H+20)return;
 const sway=Math.sin(performance.now()/900+g.p)*1.6;
 ctx.save();ctx.translate(s.x,s.y);
 if(g.l===0){ctx.strokeStyle="rgba(90,120,80,.5)";ctx.lineWidth=1}
 else if(g.l===1){ctx.strokeStyle="rgba(110,145,95,.7)";ctx.lineWidth=1.4}
 else{ctx.strokeStyle="rgba(139,170,110,.85)";ctx.lineWidth=1.8}
 ctx.beginPath();
 for(let i=-1;i<=1;i++){ctx.moveTo(i*3,0);ctx.quadraticCurveTo(i*3+sway,-6-g.l*2,i*4+sway,-9-g.l*3)}
 ctx.stroke();ctx.restore();
}
function drawFlower(f){
 const s=worldToScreen(f.x,f.y);if(s.x<0||s.x>W||s.y<0||s.y>H)return;
 ctx.fillStyle=f.c;ctx.globalAlpha=.75;ctx.beginPath();ctx.arc(s.x,s.y,2.3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
}
const RES_STYLE={
 ore:"#7d8e9b",crystal:"#8ee5ed",stone:"#8b8f8a",wood:"#7b5d42",herb:"#6d9b69",berry:"#c96a5e",grass:"#5fa8a0",shell:"#e0cfa8"
};
const RES_NAME={ore:"铁矿",crystal:"晶矿",stone:"石材",wood:"木材",herb:"晨雾草",berry:"野果",grass:"水草",shell:"贝壳"};
function drawResource(r){
 if(r.taken)return;
 const s=worldToScreen(r.x,r.y);if(s.x<-30||s.x>W+30||s.y<-30||s.y>H+30)return;
 const pulse=1+Math.sin(performance.now()/500+r.phase)*.1;
 ctx.save();ctx.translate(s.x,s.y);ctx.scale(pulse,pulse);
 ctx.fillStyle="#0004";ctx.beginPath();ctx.ellipse(0,8,13,5,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=RES_STYLE[r.type]||"#999";
 if(r.type==="ore"||r.type==="stone"){ctx.beginPath();ctx.moveTo(-10,5);ctx.lineTo(-5,-12);ctx.lineTo(5,-16);ctx.lineTo(13,-3);ctx.lineTo(5,8);ctx.closePath();ctx.fill()}
 else if(r.type==="crystal"){ctx.shadowColor="#8ee5ed";ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(0,-16);ctx.lineTo(7,-2);ctx.lineTo(0,8);ctx.lineTo(-7,-2);ctx.closePath();ctx.fill();ctx.shadowBlur=0}
 else if(r.type==="wood"){ctx.fillRect(-5,-14,10,24);ctx.beginPath();ctx.arc(-9,-13,8,0,Math.PI*2);ctx.arc(8,-10,9,0,Math.PI*2);ctx.fill()}
 else if(r.type==="berry"){for(let i=0;i<4;i++){const a=i*1.6;ctx.beginPath();ctx.arc(Math.cos(a)*6,-8+Math.sin(a)*4,4,0,Math.PI*2);ctx.fill()}ctx.fillStyle="#5a7a4e";ctx.beginPath();ctx.arc(0,-4,9,0,Math.PI,Math.PI*2);ctx.fill()}
 else if(r.type==="shell"){ctx.beginPath();ctx.moveTo(0,6);ctx.arc(0,6,11,Math.PI,Math.PI*2);ctx.closePath();ctx.fill();ctx.strokeStyle="#b8a67e";ctx.lineWidth=1;for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(0,6);ctx.lineTo(i*4.5,-4);ctx.stroke()}}
 else{for(let i=0;i<5;i++){const a=i*1.25;ctx.beginPath();ctx.ellipse(Math.cos(a)*7,-7+Math.sin(a)*5,5,9,a,0,Math.PI*2);ctx.fill()}}
 ctx.restore();
}
function drawChest(ch){
 if(!ch.found)return;
 const s=worldToScreen(ch.x,ch.y);if(s.x<-40||s.x>W+40||s.y<-40||s.y>H+40)return;
 ctx.save();ctx.translate(s.x,s.y);
 ctx.fillStyle="#0005";ctx.fillRect(-18,7,36,8);
 ctx.fillStyle=ch.opened?"#6e5d45":"#9a663d";ctx.fillRect(-20,-8,40,20);
 ctx.fillStyle=ch.opened?"#806d53":"#c18a4e";ctx.fillRect(-20,-15,40,10);
 ctx.fillStyle="#e2c56d";ctx.fillRect(-3,-4,6,10);
 if(ch.kind!=="normal"&&!ch.opened){ctx.shadowColor="#f1d16c";ctx.shadowBlur=16;ctx.fillStyle="#f0d16f";ctx.beginPath();ctx.arc(0,-20,4+Math.sin(performance.now()/300)*1.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
 ctx.restore();
}
function drawClue(c){
 if(c.found)return;
 const s=worldToScreen(c.x,c.y);if(s.x<-60||s.x>W+60||s.y<-60||s.y>H+60)return;
 ctx.save();ctx.translate(s.x,s.y);
 ctx.fillStyle="#0004";ctx.beginPath();ctx.ellipse(0,10,20,6,0,0,Math.PI*2);ctx.fill();
 if(c.type==="claw"){
  // 抓痕：三道发光的裂口
  ctx.strokeStyle="#cfe8dd";ctx.lineWidth=3;ctx.lineCap="round";ctx.shadowColor="#9cebd0";ctx.shadowBlur=8;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-12+i*9,-14);ctx.lineTo(-16+i*9,10);ctx.stroke()}
  ctx.shadowBlur=0;
 }else{
  // 被毁的营地：倒塌的木架 + 冷火堆
  ctx.strokeStyle="#5d4a3a";ctx.lineWidth=4;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(-14,8);ctx.lineTo(-4,-12);ctx.moveTo(14,8);ctx.lineTo(4,-12);ctx.stroke();
  ctx.fillStyle="#3a3f3d";ctx.beginPath();ctx.arc(0,6,7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#6f7d78";ctx.beginPath();ctx.arc(2,4,3,0,Math.PI*2);ctx.fill();
 }
 // 调查提示的微光
 const a=.4+.3*Math.sin(performance.now()/400+c.phase);
 ctx.globalAlpha=a;ctx.fillStyle="#f0cf75";ctx.beginPath();ctx.arc(0,-26,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 ctx.restore();
}
function drawGate(g){
 const s=worldToScreen(g.x,g.y);ctx.save();ctx.translate(s.x,s.y);
 ctx.strokeStyle=g.open?"#91c7a0":"#615f65";ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-32,25);ctx.lineTo(-32,-30);ctx.quadraticCurveTo(0,-62,32,-30);ctx.lineTo(32,25);ctx.stroke();
 if(!g.open){ctx.strokeStyle="#c29d62";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-18,20);ctx.lineTo(18,-20);ctx.moveTo(18,20);ctx.lineTo(-18,-20);ctx.stroke()}
 ctx.restore();
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
  // 夜晚亮灯
  const lit=isNight();
  ctx.fillStyle=lit?"#ffd98a":"#9ec1c2";
  if(lit){ctx.shadowColor="#ffce6a";ctx.shadowBlur=14}
  ctx.fillRect(-b.w/2+18,-b.h/2+25,24,20);ctx.fillRect(b.w/2-42,-b.h/2+25,24,20);
  ctx.shadowBlur=0;
 }
 if(b.name&&b.type!=="house"){ctx.font="12px 'Noto Serif SC',sans-serif";ctx.textAlign="center";ctx.fillStyle="#fff";ctx.shadowColor="#000";ctx.shadowBlur=5;ctx.fillText(b.name,0,b.h/2+25)}
 ctx.restore();
}
function drawLandmark(l){
 if(l.type==="stone")return;
 if(l.type==="fishing"){drawFishingSpot(l);return}
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
 ctx.restore();
}
/* 钓鱼点：水面涟漪扩散 + 浮标上下浮动 */
function drawFishingSpot(l){
 const s=worldToScreen(l.x,l.y);if(s.x<-90||s.x>W+90||s.y<-90||s.y>H+90)return;
 const t=performance.now()/1000;
 ctx.save();ctx.translate(s.x,s.y);
 // 水面涟漪：三道由内向外扩散的椭圆波纹
 if(!state.settings.low){
  ctx.lineWidth=2;
  for(let i=0;i<3;i++){
   const ph=(t*.45+i/3)%1;
   ctx.globalAlpha=.5*(1-ph);
   ctx.strokeStyle="rgba(225,245,245,.6)";
   ctx.beginPath();ctx.ellipse(0,0,14+ph*46,7+ph*22,0,0,Math.PI*2);ctx.stroke();
  }
  ctx.globalAlpha=1;
 }
 // 浮标：随波上下浮动，红白两节
 const bob=Math.sin(t*2.2)*3;
 ctx.strokeStyle="#8a6a45";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,bob-26);ctx.lineTo(0,bob-6);ctx.stroke();
 ctx.fillStyle="#d95f52";ctx.beginPath();ctx.arc(0,bob-4,5,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#f4ecd8";ctx.beginPath();ctx.arc(0,bob-4,5,Math.PI,Math.PI*2);ctx.fill();
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
 ctx.restore();
}
function drawEnemy(e){
 if(e.dead)return;
 const s=worldToScreen(e.x,e.y);if(s.x<-80||s.x>W+80||s.y<-80||s.y>H+80)return;
 const cfg=ETYPE[e.type];
 const elite=!!cfg.elite;
 const r=(e.type==="荒原狼"?20:25)*(elite?1.25:1);
 ctx.save();ctx.translate(s.x,s.y);
 ctx.fillStyle="#0005";ctx.beginPath();ctx.ellipse(0,r*.55,r*1.1,r*.4,0,0,Math.PI*2);ctx.fill();
 // 攻击前摇：红色范围提示，玩家可以躲
 if(e.windup>0){
  const p=1-e.windup/cfg.wind;
  ctx.globalAlpha=.25+.45*p;
  ctx.fillStyle="#d94f43";
  if(cfg.lunge){
   ctx.save();ctx.rotate(Math.atan2(e.wy,e.wx));
   ctx.beginPath();ctx.moveTo(0,-16);ctx.lineTo(cfg.range+cfg.lunge+18,-10);ctx.lineTo(cfg.range+cfg.lunge+18,10);ctx.lineTo(0,16);ctx.closePath();ctx.fill();
   ctx.restore();
  }else{
   ctx.beginPath();ctx.arc(0,0,cfg.range+16,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
 }
 if(e.type==="荒原狼"){
  ctx.fillStyle="#574c48";ctx.beginPath();ctx.ellipse(0,2,24,15,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#6c5b54";ctx.beginPath();ctx.moveTo(-19,-4);ctx.lineTo(-24,-25);ctx.lineTo(-7,-13);ctx.lineTo(4,-24);ctx.lineTo(13,-7);ctx.closePath();ctx.fill();
  ctx.fillStyle="#d65f55";ctx.fillRect(-10,-1,5,3);ctx.fillRect(5,-1,5,3);
 }else{
  ctx.scale(elite?1.25:1,elite?1.25:1);
  ctx.fillStyle=elite?"#5d5a6b":"#66706e";ctx.beginPath();ctx.moveTo(-28,10);ctx.lineTo(-19,-22);ctx.lineTo(0,-31);ctx.lineTo(23,-18);ctx.lineTo(29,12);ctx.lineTo(10,25);ctx.lineTo(-16,22);ctx.closePath();ctx.fill();
  ctx.fillStyle=elite?"#9d93b8":"#8c9690";ctx.beginPath();ctx.moveTo(-12,-22);ctx.lineTo(3,-28);ctx.lineTo(13,-12);ctx.lineTo(-5,-9);ctx.closePath();ctx.fill();
  if(elite){ctx.fillStyle="#e8c77b";ctx.beginPath();ctx.moveTo(0,-31);ctx.lineTo(6,-44);ctx.lineTo(10,-29);ctx.closePath();ctx.fill()}
 }
 if(e.hit>0){ctx.strokeStyle="#ffe6a0";ctx.lineWidth=3;ctx.strokeRect(-r-4,-r-4,r*2+8,r*2+8)}
 ctx.restore();
 if(e.hp<e.max){const w=48;ctx.fillStyle="#0008";ctx.fillRect(s.x-w/2,s.y-r-13,w,4);ctx.fillStyle="#d9685d";ctx.fillRect(s.x-w/2,s.y-r-13,w*clamp(e.hp/e.max,0,1),4)}
}
function drawEcho(e){
 const s=worldToScreen(e.x,e.y);if(s.x<-40||s.x>W+40||s.y<-40||s.y>H+40)return;
 const pulse=.75+.25*Math.sin(performance.now()/260+e.phase);
 ctx.save();ctx.translate(s.x,s.y);ctx.rotate(performance.now()/1800+e.phase);
 ctx.globalAlpha=.75*pulse;ctx.shadowColor="#8ee5ed";ctx.shadowBlur=18;
 ctx.fillStyle="#9cebf0";ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(7,0);ctx.lineTo(0,12);ctx.lineTo(-7,0);ctx.closePath();ctx.fill();
 ctx.restore();
}
function drawCampfire(f){
 const s=worldToScreen(f.x,f.y);if(s.x<-60||s.x>W+60||s.y<-60||s.y>H+60)return;
 const night=isNight();
 const pulse=.8+.2*Math.sin(performance.now()/180+f.phase);
 ctx.save();ctx.translate(s.x,s.y);
 ctx.globalAlpha=(night?.34:.16)*pulse;ctx.fillStyle="#f4c768";ctx.beginPath();ctx.arc(0,2,(night?46:30)*pulse,0,Math.PI*2);ctx.fill();
 ctx.globalAlpha=1;ctx.shadowColor="#ffbd55";ctx.shadowBlur=14;ctx.fillStyle="#f6c45f";ctx.beginPath();ctx.moveTo(0,-18*pulse);ctx.quadraticCurveTo(10,0,0,8);ctx.quadraticCurveTo(-10,0,0,-18*pulse);ctx.fill();
 ctx.fillStyle="#704b35";ctx.fillRect(-13,7,26,5);ctx.restore();
}
function drawPlayer(){
 const s=worldToScreen(player.x,player.y);
 ctx.save();ctx.translate(s.x,s.y);
 const t=performance.now()/1000;
 // 待机呼吸 vs 走路起伏
 const moving=Math.abs(player.vx)+Math.abs(player.vy)>20;
 const bob=moving?Math.sin(player.walk)*2.4:Math.sin(t*2.2)*.9;
 const legSwing=moving?Math.sin(player.walk)*3.5:0;
 // 阴影：随动作轻微缩放
 ctx.fillStyle="#0005";
 ctx.beginPath();ctx.ellipse(0,20,22-Math.abs(bob)*1.5,8-Math.abs(bob)*.5,0,0,Math.PI*2);ctx.fill();
 ctx.translate(0,bob);
 // 剑（身后侧，随方向）
 const swordAng=player.attack>0?-1.2+player.attack*4.5:Math.PI/6;
 ctx.save();ctx.rotate(player.dir+swordAng*.3);
 // 剑柄
 ctx.fillStyle="#8a6d4a";ctx.fillRect(8,-3,8,6);
 // 剑刃
 const bladeLen=player.attack>0?48:38;
 const grad=ctx.createLinearGradient(16,0,16+bladeLen,0);
 grad.addColorStop(0,"#e9edf0");grad.addColorStop(1,"#b8c5c9");
 ctx.fillStyle=grad;
 ctx.beginPath();ctx.moveTo(16,-2.5);ctx.lineTo(16+bladeLen,0);ctx.lineTo(16,2.5);ctx.closePath();ctx.fill();
 // 剑刃高光
 ctx.strokeStyle="#fff";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(16+bladeLen-4,0);ctx.stroke();
 ctx.restore();
 // 身体（斗篷）
 ctx.fillStyle="#1a2f3a";
 ctx.beginPath();
 ctx.moveTo(-16,16);ctx.lineTo(-11,-14);ctx.lineTo(0,-22);ctx.lineTo(12,-14);ctx.lineTo(16,16);
 ctx.closePath();ctx.fill();
 // 斗篷后摆（走路时飘动）
 if(moving){
  ctx.fillStyle="#16262f";
  ctx.beginPath();
  ctx.moveTo(-16,16);ctx.quadraticCurveTo(-8+legSwing,24,-4+legSwing,18);
  ctx.lineTo(-2,10);ctx.closePath();ctx.fill();
  ctx.beginPath();
  ctx.moveTo(16,16);ctx.quadraticCurveTo(8-legSwing,24,4-legSwing,18);
  ctx.lineTo(2,10);ctx.closePath();ctx.fill();
 }
 // 内衬
 ctx.fillStyle="#0f1e26";
 ctx.beginPath();ctx.moveTo(-10,14);ctx.lineTo(-6,-10);ctx.lineTo(0,-16);ctx.lineTo(7,-10);ctx.lineTo(10,14);ctx.closePath();ctx.fill();
 // 腿部（走路时露出）
 if(moving){
  ctx.fillStyle="#243842";
  ctx.beginPath();ctx.ellipse(-6+legSwing,12,4,7,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(6-legSwing,12,4,7,0,0,Math.PI*2);ctx.fill();
 }
 // 腰带
 ctx.fillStyle="#e5cc8a";
 ctx.beginPath();ctx.moveTo(-14,2);ctx.lineTo(14,2);ctx.lineTo(13,7);ctx.lineTo(-13,7);ctx.closePath();ctx.fill();
 // 头部
 ctx.fillStyle="#e8c898";ctx.beginPath();ctx.arc(0,-30,11,0,Math.PI*2);ctx.fill();
 // 头发
 ctx.fillStyle="#4a3f38";
 ctx.beginPath();ctx.arc(0,-33,11,Math.PI*1.05,Math.PI*1.95);ctx.fill();
 ctx.beginPath();ctx.ellipse(-6,-35,5,7,.4,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.ellipse(6,-35,5,7,-.4,0,Math.PI*2);ctx.fill();
 // 眼睛（朝向方向偏移）
 const eyeOff=Math.cos(player.dir)*2;
 ctx.fillStyle="#2a3438";
 ctx.beginPath();ctx.arc(-3.5+eyeOff,-28,1.6,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.arc(3.5+eyeOff,-28,1.6,0,Math.PI*2);ctx.fill();
 // 围巾/领巾
 ctx.fillStyle="#c9a86a";
 ctx.beginPath();ctx.moveTo(-8,-18);ctx.lineTo(0,-14);ctx.lineTo(8,-18);ctx.lineTo(6,-22);ctx.lineTo(-6,-22);ctx.closePath();ctx.fill();
 // 攻击弧光
 if(player.attack>0){
  ctx.save();ctx.rotate(player.dir);
  const p=1-player.attack/.32;
  ctx.strokeStyle="rgba(238,211,125,"+clamp(p,0,1)+")";
  ctx.lineWidth=6+3*p;
  ctx.beginPath();ctx.arc(0,0,50,-.9+p*.6,.9-p*.3);ctx.stroke();
  ctx.restore();
 }
 // 冲刺无敌帧残影
 if(player.inv>0){
  ctx.strokeStyle="rgba(142,229,237,"+clamp(player.inv*2,0,.8)+")";
  ctx.lineWidth=2;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.arc(0,-8,26,0,Math.PI*2);ctx.stroke();
  ctx.setLineDash([]);
 }
 ctx.restore();
}
function drawBoss(){
 if(!boss||boss.dead)return;
 const s=worldToScreen(boss.x,boss.y);if(s.x<-160||s.x>W+160||s.y<-160||s.y>H+160)return;
 const phase=bossPhase();
 const pulse=1+Math.sin(performance.now()/260)*.04;
 ctx.save();ctx.translate(s.x,s.y);ctx.scale(pulse,pulse);
 ctx.fillStyle="#0007";ctx.beginPath();ctx.ellipse(0,46,76,24,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=phase===3?"#5e4450":"#514c59";ctx.beginPath();ctx.moveTo(-70,25);ctx.lineTo(-55,-45);ctx.lineTo(-20,-72);ctx.lineTo(0,-55);ctx.lineTo(30,-78);ctx.lineTo(66,-38);ctx.lineTo(75,28);ctx.lineTo(30,55);ctx.lineTo(-30,55);ctx.closePath();ctx.fill();
 ctx.fillStyle="#796a7b";ctx.beginPath();ctx.moveTo(-42,-45);ctx.lineTo(-20,-92);ctx.lineTo(-5,-52);ctx.lineTo(-25,-28);ctx.closePath();ctx.fill();
 ctx.beginPath();ctx.moveTo(25,-48);ctx.lineTo(48,-88);ctx.lineTo(52,-34);ctx.lineTo(34,-20);ctx.closePath();ctx.fill();
 ctx.fillStyle=phase===3?"#ff8a5e":"#e36a61";ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=14;ctx.beginPath();ctx.arc(-23,-27,6,0,Math.PI*2);ctx.arc(23,-27,6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle="#d6b56d";ctx.beginPath();ctx.moveTo(-8,-3);ctx.lineTo(0,14);ctx.lineTo(8,-3);ctx.closePath();ctx.fill();
 ctx.restore();
 // 冲击波（第二阶段）
 for(const r of bossRings){
  const rs=worldToScreen(boss.x,boss.y);
  ctx.strokeStyle="rgba(224,110,90,"+clamp(1-r.r/260,0,1)+")";ctx.lineWidth=10;
  ctx.beginPath();ctx.arc(rs.x,rs.y,r.r,0,Math.PI*2);ctx.stroke();
 }
 // 落石（第三阶段）
 for(const h of hazards){
  const hs=worldToScreen(h.x,h.y);
  const p=clamp(1-h.t/1.1,0,1);
  ctx.fillStyle="rgba(217,79,67,"+(.2+.35*p)+")";ctx.beginPath();ctx.arc(hs.x,hs.y,55,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="rgba(255,160,120,.8)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(hs.x,hs.y,55,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle="#4a4640";ctx.beginPath();ctx.arc(hs.x,hs.y-140*(1-p),12,0,Math.PI*2);ctx.fill();
 }
 // 血条
 const bw=150;ctx.fillStyle="#0009";ctx.fillRect(s.x-bw/2,s.y-115,bw,8);ctx.fillStyle="#c85e67";ctx.fillRect(s.x-bw/2,s.y-115,bw*clamp(boss.hp/boss.max,0,1),8);
 ctx.fillStyle="#fff";ctx.font="bold 12px sans-serif";ctx.textAlign="center";ctx.shadowColor="#000";ctx.shadowBlur=4;
 ctx.fillText("暮岩古龙 · Lv. 12 · 第"+["一","二","三"][phase-1]+"阶段",s.x,s.y-125);ctx.shadowBlur=0;
}
function drawParticles(){
 for(const p of particles){const s=worldToScreen(p.x,p.y);ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(s.x,s.y,p.size,0,Math.PI*2);ctx.fill()}
 ctx.globalAlpha=1;
 for(const t of texts){const s=worldToScreen(t.x,t.y);ctx.globalAlpha=clamp(t.life,0,1);ctx.font="bold 15px sans-serif";ctx.textAlign="center";ctx.fillStyle=t.color;ctx.fillText(t.text,s.x,s.y)}
 ctx.globalAlpha=1;
}
function drawCombatFeedback(){
 if(!state.started||state.combo<=0)return;
 const a=clamp(state.comboTimer/.9,0,1);
 ctx.save();ctx.globalAlpha=.4+.5*a;ctx.textAlign="center";ctx.font="700 15px sans-serif";
 ctx.fillStyle="#f4d27e";ctx.shadowColor="#f4d27e";ctx.shadowBlur=12;
 ctx.fillText("连击 ×"+state.combo,W-110,H-140);
 ctx.restore();
}
function drawAtmosphere(){
 const hour=state.time%24;
 if(isNight()){
  ctx.fillStyle="rgba(15,27,58,.48)";ctx.fillRect(0,0,W,H);
  if(!state.settings.low){
   for(const f of fireflies){const s=worldToVisual(f.x,f.y);if(s.x<0||s.x>W||s.y<0||s.y>H)continue;const a=.35+.3*Math.sin(performance.now()/700+f.p);ctx.globalAlpha=a;ctx.fillStyle="#f1df8b";ctx.shadowColor="#f1df8b";ctx.shadowBlur=10;ctx.beginPath();ctx.arc(s.x,s.y,1.7*f.s,0,Math.PI*2);ctx.fill()}
   ctx.shadowBlur=0;ctx.globalAlpha=1;
  }
 }else if(hour<8||hour>17){
  ctx.fillStyle="rgba(235,180,105,.14)";ctx.fillRect(0,0,W,H);
 }
 // 森林雾气
 if(zoneAt(player.x,player.y)==="静谧森林"){
  ctx.fillStyle="rgba(190,210,200,.08)";ctx.fillRect(0,0,W,H);
  if(!state.settings.low){
   const t=performance.now()/10000;
   ctx.fillStyle="rgba(200,215,205,.06)";
   for(let i=0;i<4;i++){
    const fx=((hash(i,11)+t*(.05+i*.02))%1.2-.1)*W;
    const fy=(hash(i,17)*.7+.15)*H;
    ctx.beginPath();ctx.ellipse(fx,fy,190,44,0,0,Math.PI*2);ctx.fill();
   }
  }
 }
}
/* 任务目标：视野内世界标记 */
function drawQuestWorldMarker(){
 const t=questTarget();
 if(!t||state.dialogue||state.menuOpen||state.panel)return;
 const v=worldToVisual(t.x,t.y);
 if(v.x<-30||v.x>W+30||v.y<-30||v.y>H+30)return;
 const pulse=8+Math.sin(performance.now()/260)*2;
 ctx.save();ctx.translate(v.x,v.y-56);
 ctx.rotate(Math.PI/4);
 ctx.strokeStyle="#f0cf75";ctx.lineWidth=2;ctx.globalAlpha=.95;ctx.strokeRect(-pulse/2,-pulse/2,pulse,pulse);
 ctx.globalAlpha=.35;ctx.strokeRect(-pulse*.75,-pulse*.75,pulse*1.5,pulse*1.5);
 ctx.rotate(-Math.PI/4);
 ctx.globalAlpha=1;ctx.font="11px 'Noto Serif SC',serif";ctx.textAlign="center";ctx.fillStyle="#f0e5ca";ctx.shadowColor="#000";ctx.shadowBlur=6;
 ctx.fillText(t.name||t.type||"目标",0,-14);
 ctx.restore();
}
/* 最近可互动对象的世界内提示 */
function drawWorldLabel(){
 const t=nearestInteractable();
 if(!t||state.dialogue||state.menuOpen||state.panel||state.fishing||state.craft||!state.started)return;
 const p=worldToVisual(t.x,t.y);
 ctx.save();ctx.textAlign="center";
 ctx.font="600 12px 'Noto Serif SC',serif";ctx.fillStyle="#fff";ctx.shadowColor="#000";ctx.shadowBlur=6;
 ctx.fillText(t.name,p.x,p.y-46);
 ctx.font="10px sans-serif";ctx.fillStyle="#e7c36f";
 ctx.fillText(matchMedia("(pointer:coarse)").matches?t.verb:"E · "+t.verb,p.x,p.y-32);
 ctx.restore();
}

/* ================= 粒子 / 飘字 ================= */
function emit(x,y,color="#f0c66f",n=12){
 if(state.settings.low)n=Math.ceil(n/2);
 for(let i=0;i<n;i++)particles.push({x,y,vx:rnd(-70,70),vy:rnd(-100,20),life:rnd(.35,.8),max:.8,size:rnd(1,4),color});
}
function floatText(x,y,text,color="#f5d27e"){texts.push({x,y,text,color,life:1.1})}

/* ================= 碰撞 / 移动 ================= */
function blocked(x,y){
 if(x<35||y<35||x>world.w-35||y>world.h-35)return true;
 if(isLake(x,y))return true;
 for(const b of buildings){if(b.type!=="well"&&Math.abs(x-b.x)<b.w/2+22&&Math.abs(y-b.y)<b.h/2+22)return true}
 for(const t of trees){if(Math.hypot(x-t.x,y-t.y)<20*t.s+10)return true}
 for(const r of rocks){if(Math.hypot(x-r.x,y-r.y)<18*r.s+10)return true}
 for(const g of gates){if(!g.open&&Math.hypot(x-g.x,y-g.y)<42)return true}
 return false;
}
function recoverFromObstacle(){
 if(!blocked(player.x,player.y))return;
 const ox=player.x,oy=player.y;
 for(let radius=18;radius<=120;radius+=12){
  for(let a=0;a<Math.PI*2;a+=Math.PI/8){
   const x=clamp(ox+Math.cos(a)*radius,35,world.w-35);
   const y=clamp(oy+Math.sin(a)*radius,35,world.h-35);
   if(!blocked(x,y)){player.x=x;player.y=y;return}
  }
 }
}
function uiBlocking(){return state.dialogue||state.menuOpen||state.panel||state.lore||state.fishing||state.craft}
/* 模拟摇杆输出（带力度，非布尔） */
const joyVec={x:0,y:0,active:false};
function move(dt){
 if(!state.started||uiBlocking())return;
 recoverFromObstacle();
 // 输入：摇杆优先（模拟量），键盘退化为归一化八方向
 let ix=0,iy=0;
 if(joyVec.active){ix=joyVec.x;iy=joyVec.y}
 else{
  ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
  iy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
  const len=Math.hypot(ix,iy);if(len>1){ix/=len;iy/=len}
 }
 const mag=Math.min(1,Math.hypot(ix,iy));
 // 冲刺脉冲：短暂的高速度位移窗口
 let tvx,tvy;
 if(player.dashT>0){
  player.dashT-=dt;
  tvx=player.dashDx*760;tvy=player.dashDy*760;
 }else{
  const sprint=keys.shift&&player.stamina>2&&mag>.1;
  const spd=player.speed*(sprint?1.68:1);
  tvx=ix*spd;tvy=iy*spd;
  if(sprint)player.stamina=Math.max(0,player.stamina-16*dt);
 }
 // 惯性：速度向量平滑趋近目标速度（起步快、停止略缓）
 const rate=mag>.05||player.dashT>0?10:13;
 const blend=Math.min(1,rate*dt);
 player.vx+=(tvx-player.vx)*blend;
 player.vy+=(tvy-player.vy)*blend;
 // 撞墙滑动：分轴检测，被阻挡的轴衰减速度避免顶墙感
 const nx=player.x+player.vx*dt,ny=player.y+player.vy*dt;
 if(!blocked(nx,player.y))player.x=nx;else player.vx*=.35;
 if(!blocked(player.x,ny))player.y=ny;else player.vy*=.35;
 // 转向平滑（最短弧插值）
 if(mag>.05||player.dashT>0){
  const td=player.dashT>0?Math.atan2(player.dashDy,player.dashDx):Math.atan2(iy,ix);
  let dd=td-player.dir;
  while(dd>Math.PI)dd-=Math.PI*2;
  while(dd<-Math.PI)dd+=Math.PI*2;
  player.dir+=dd*Math.min(1,15*dt);
 }
 // 走路动画相位跟实际速度走
 const spd=Math.hypot(player.vx,player.vy);
 if(spd>12)player.walk+=spd*dt*.052;
 // 体力：不疾跑时回复
 if(!(keys.shift&&mag>.1&&player.stamina>0))player.stamina=Math.min(100,player.stamina+(spd>12?7:14)*dt);
 player.x=clamp(player.x,35,world.w-35);player.y=clamp(player.y,35,world.h-35);
 markExplored();
}

/* ================= 成长 ================= */
function gainXp(v){
 state.xp+=v;
 while(state.xp>=state.nextXp){
  state.xp-=state.nextXp;state.level++;state.nextXp=Math.floor(state.nextXp*1.28);
  state.maxHp+=55;state.hp=state.maxHp;state.equipment.power+=12;
  updateHP();playRewardFx("等级提升","Lv. "+state.level+" · 最大生命值 +55 · 攻击力 +12");
  EA()?.levelUp();emit(player.x,player.y,"#f0cf72",24);
 }
}

/* ================= 战斗 ================= */
function attack(){
 if(!state.started||uiBlocking()||player.attack>0)return;
 let target=null,best=90;
 for(const e of enemies)if(!e.dead){const d=dist(player,e);if(d<best){best=d;target=e}}
 const bossInRange=!!(boss&&boss.active&&!boss.dead&&dist(player,boss)<115);
 if(!target&&!bossInRange){emit(player.x+Math.cos(player.dir)*25,player.y+Math.sin(player.dir)*25,"#d9c17a",4);return}
 state.combo=state.comboTimer>0?Math.min(state.combo+1,5):1;state.comboTimer=.9;
 /* 力量药剂增益：有效期内攻击 +10 */
 const buffAtk=state.buff&&performance.now()<state.buff.until?state.buff.atk:0;
 const damage=Math.floor((state.equipment.power+buffAtk)*(1+Math.max(0,state.combo-1)*.12));
 player.attack=.32;
 if(bossInRange){
  boss.hp-=damage;boss.hit=.15;emit(boss.x,boss.y,"#f4d18a",14);floatText(boss.x,boss.y-90,"-"+damage,"#ffe1a1");EA()?.hit();
  if(boss.hp<=0){
   boss.dead=true;state.defeatedBoss=true;state.coins+=600;addItem("core");
   gainXp(520);playRewardFx("古龙核心","击败暮岩古龙 · +600 金币");
   notify("暮岩古龙已击败！获得古龙核心");checkAchievements();saveGame();
  }
  return;
 }
 target.hp-=damage;target.hit=.15;emit(target.x,target.y,"#f4d18a",10);floatText(target.x,target.y-32,"-"+damage,"#ffe1a1");EA()?.hit();
 if(target.hp<=0)killEnemy(target);
}
function killEnemy(e){
 const cfg=ETYPE[e.type];
 e.dead=true;
 if(e.type==="荒原狼")state.kills++;
 state.coins+=cfg.coin;
 state.combo=Math.min(state.combo+1,5);
 if(Math.random()<.35)addItem("wood");
 floatText(e.x,e.y-50,"+"+cfg.coin+" 金币","#f2d074");
 gainXp(cfg.xp);
 notify("击败 "+e.type);
 if(state.quest===2&&state.kills>=3)advanceQuest(3);
 checkAchievements(); /* 成就：首次击杀 / 财富 */
 updateQuestUI();saveGame();
}
function skill(){
 if(!state.started||uiBlocking()||player.stamina<30)return;
 player.stamina-=30;player.attack=.5;
 emit(player.x,player.y,"#79c8d4",35);EA()?.pickup();vibrate(20);
 for(const e of enemies)if(!e.dead&&dist(player,e)<105){
  e.hp-=150;e.hit=.25;floatText(e.x,e.y-35,"元素爆发 -150","#8ee5ed");
  if(e.hp<=0)killEnemy(e);
 }
 if(boss&&boss.active&&!boss.dead&&dist(player,boss)<130){boss.hp-=120;boss.hit=.2;floatText(boss.x,boss.y-90,"-120","#8ee5ed")}
}
function dash(){
 if(!state.started||uiBlocking()||player.stamina<22)return;
 let dx,dy;
 if(joyVec.active){dx=joyVec.x;dy=joyVec.y}
 else{dx=(keys.d?1:0)-(keys.a?1:0);dy=(keys.s?1:0)-(keys.w?1:0)}
 if(!dx&&!dy){dx=Math.cos(player.dir);dy=Math.sin(player.dir)}
 const len=Math.hypot(dx,dy)||1;
 // 冲刺改为速度脉冲：手感更顺滑，方向由 move() 持续控制
 player.dashDx=dx/len;player.dashDy=dy/len;
 player.dashT=.16;
 player.stamina-=22;player.inv=.35;
 emit(player.x,player.y,"#d7c47d",18);
}

/* ================= 敌人 AI（前摇 + 红色范围提示） ================= */
function hurtPlayer(dmg){
 state.hp-=dmg;player.inv=.8;
 floatText(player.x,player.y-40,"-"+dmg,"#ef8b7f");
 emit(player.x,player.y,"#d9675e",8);
 EA()?.hurt();vibrate(35);
 updateHP();
}
function updateEnemies(dt){
 for(const e of enemies){
  if(e.dead)continue;
  e.hit=Math.max(0,e.hit-dt);
  const cfg=ETYPE[e.type];
  const d=dist(player,e);
  if(e.windup>0){
   e.windup-=dt;
   if(e.windup<=0){
    // 出手瞬间判定：玩家已逃出范围则打空
    if(cfg.lunge){
     const nx=clamp(e.x+e.wx*cfg.lunge,35,world.w-35),ny=clamp(e.y+e.wy*cfg.lunge,35,world.h-35);
     e.x=nx;e.y=ny;
     if(dist(player,e)<cfg.range+18&&player.inv<=0)hurtPlayer(cfg.dmg);
    }else{
     if(dist(player,e)<cfg.range+16&&player.inv<=0)hurtPlayer(cfg.dmg);
    }
    e.recover=.55;e.cd=cfg.cd;
   }
   continue;
  }
  if(e.recover>0){e.recover-=dt;continue}
  if(d<cfg.aggro&&state.started&&!uiBlocking()){
   const dx=(player.x-e.x)/(d||1),dy=(player.y-e.y)/(d||1);
   e.cd-=dt;
   if(d>cfg.range){e.x+=dx*cfg.sp*dt;e.y+=dy*cfg.sp*dt}
   if(d<cfg.range+8&&e.cd<=0){e.windup=cfg.wind;e.wx=dx;e.wy=dy}
  }else{
   e.phase+=dt;e.x=e.homeX+Math.sin(e.phase*.55)*28;e.y=e.homeY+Math.cos(e.phase*.45)*22;
  }
 }
}
function bossPhase(){return boss.hp>1200?1:boss.hp>600?2:3}
function updateBoss(dt){
 if(!boss||boss.dead)return;
 const d=dist(player,boss);
 if(!boss.active&&d<520&&state.started&&!uiBlocking()){boss.active=true;notify("暮岩古龙苏醒了");emit(boss.x,boss.y,"#d8666a",30)}
 if(!boss.active||uiBlocking())return;
 const phase=bossPhase();
 boss.phase+=dt;boss.attackCd-=dt;boss.ringCd-=dt;boss.hazardCd-=dt;
 const dx=(player.x-boss.x)/(d||1),dy=(player.y-boss.y)/(d||1);
 const sp=phase===3?34:22;
 if(d>115){boss.x+=dx*sp*dt;boss.y+=dy*sp*dt}
 // 近战
 if(d<150&&boss.attackCd<=0&&player.inv<=0){
  boss.attackCd=phase===3?1.0:1.5;
  hurtPlayer(phase===3?46:38);
 }
 // 第二阶段：范围冲击波
 if(phase>=2&&boss.ringCd<=0){
  boss.ringCd=4;bossRings.push({r:40,hit:false});
  emit(boss.x,boss.y,"#d8666a",22);notify("古龙积蓄了冲击波——远离它！");
 }
 for(let i=bossRings.length-1;i>=0;i--){
  const r=bossRings[i];r.r+=260*dt;
  if(!r.hit&&Math.abs(dist(player,boss)-r.r)<22&&player.inv<=0){r.hit=true;hurtPlayer(30)}
  if(r.r>300)bossRings.splice(i,1);
 }
 // 第三阶段：场地落石
 if(phase===3&&boss.hazardCd<=0){
  boss.hazardCd=2.6;
  for(let i=0;i<3;i++)hazards.push({x:clamp(player.x+rnd(-160,160),60,world.w-60),y:clamp(player.y+rnd(-160,160),60,world.h-60),t:1.1});
 }
 for(let i=hazards.length-1;i>=0;i--){
  const h=hazards[i];h.t-=dt;
  if(h.t<=0){
   emit(h.x,h.y,"#8a8073",18);
   if(Math.hypot(player.x-h.x,player.y-h.y)<55&&player.inv<=0)hurtPlayer(34);
   hazards.splice(i,1);
  }
 }
}

/* ================= 互动 ================= */
function nearestInteractable(){
 let best=null,bd=Infinity;
 const consider=(o,r,name,verb)=>{const d=dist(player,o);if(d<r&&d<bd){bd=d;best={x:o.x,y:o.y,name,verb,obj:o}}};
 for(const e of echoes)if(!e.taken)consider(e,68,"回声碎片","拾取");
 for(const f of campfires)consider(f,82,f.name,"休息");
 /* 钓鱼点：湖边浅水处可垂钓 */
 for(const l of landmarks)if(l.type==="fishing")consider(l,90,l.name,"钓鱼");
 for(const r of resources)if(!r.taken)consider(r,58,RES_NAME[r.type],"采集");
 for(const ch of chests)if(!ch.opened&&ch.found)consider(ch,65,ch.kind==="rare"?"精致宝箱":"宝箱","开启");
 for(const g of gates)consider(g,76,g.name,g.open?"查看":"开启");
 for(const c of clues)if(!c.found)consider(c,72,c.name,"调查");
 for(const n of npcs)consider(n,95,n.name,"交谈");
 for(const l of landmarks)if(l.type!=="stone"&&l.type!=="fishing")consider(l,100,l.name,l.type==="boss"?"挑战":"查看");
 for(const b of buildings)if(b.name)consider(b,90,b.name,"查看");
 return best;
}
function interact(){
 if(!state.started||uiBlocking())return;
 const t=nearestInteractable();
 if(!t)return;
 const o=t.obj;
 // 回声碎片：每一块讲一点故事
 if(echoes.includes(o)){
  o.taken=true;state.echoes++;state.coins+=15;addItem("shard");
  emit(o.x,o.y,"#8ee5ed",28);EA()?.shard();
  gainXp(25);
  checkAchievements(); /* 成就：收集者 / 财富 */
  const idx=state.echoes-1;
  showLore(FRAG_LORE[idx]||FRAG_LORE[0],()=>{
   if(state.echoes>=9){
    state.coins+=180;state.equipment.power+=20;
    playRewardFx("神殿回应","九枚碎片彼此共鸣 · 攻击力 +20 · +180 金币");
   }
   saveGame();
  });
  updateQuestUI();return;
 }
 // 营火：恢复 + 打开合成界面
 if(campfires.includes(o)){
  state.hp=state.maxHp;player.stamina=100;
  emit(o.x,o.y,"#f1c96e",32);EA()?.pickup();
  notify(o.name+"：生命与体力已恢复");updateHP();
  openCraft(o);saveGame();return;
 }
 // 资源采集
 if(resources.includes(o)){
  o.taken=true;
  const map={ore:"ore",wood:"wood",herb:"herb",crystal:"crystal",stone:"stone",berry:"berry",grass:"grass",shell:"shell"};
  const id=map[o.type]||"herb";
  addItem(id);playRewardFx("获得"+ITEMS[id].name,"材料 +1");
  emit(o.x,o.y,"#d6c27d",12);EA()?.pickup();saveGame();return;
 }
 // 宝箱
 if(chests.includes(o)){
  if(o.kind==="rare"){
   const guard=enemies.find(e=>!e.dead&&ETYPE[e.type].elite&&dist(e,o)<320);
   if(guard){notify("宝箱被强大的岩甲兽看守着");return}
  }
  o.opened=true;state.chestsOpened++;
  if(o.kind==="rare"){
   state.equipment.power+=35;state.equipment.weapon="古代剑刃";addItem("blade");state.coins+=120;
   playRewardFx("古代剑刃","精致宝箱 · 攻击力 +35 · +120 金币");
  }else if(o.kind==="hidden"){
   state.coins+=80;addItem("crystal",2);
   playRewardFx("隐藏宝箱","晶矿 ×2 · +80 金币");
  }else{
   state.coins+=35;addItem("potion");
   playRewardFx("宝箱奖励","+35 金币 · 治疗药草 ×1");
  }
  emit(o.x,o.y,"#f0d47e",26);EA()?.pickup();checkAchievements();saveGame();return;
 }
 // 石门
 if(gates.includes(o)){
  if(o.open){notify(o.name+"已经开启");return}
  if(state.level>=8||(state.bag.ore||0)>=3){o.open=true;notify(o.name+"已开启");emit(o.x,o.y,"#7dd1cf",22);saveGame()}
  else notify(o.name+"需要 Lv.8 或 3 块铁矿");
  return;
 }
 // 环境叙事线索
 if(clues.includes(o)){
  o.found=true;state.clues++;
  emit(o.x,o.y,"#cfe8dd",18);EA()?.pickup();
  gainXp(30);
  showLore(o.lore,()=>{
   if(o.give){addItem(o.give);playRewardFx("获得"+ITEMS[o.give].name,"任务物品");}
   if(state.quest===1&&state.clues>=2)advanceQuest(2);
   saveGame();
  });
  updateQuestUI();return;
 }
 // NPC
 if(npcs.includes(o)){talk(o);return}
 // 地标
 if(landmarks.includes(o)){
  /* 钓鱼点：开始垂钓小游戏 */
  if(o.type==="fishing"){o.seen=true;startFishing();return}
  if(o.type==="boss"){
   if(!boss.dead){boss.active=true;notify("暮岩古龙苏醒了");emit(o.x,o.y,"#d8666a",30)}
   else notify("巢穴安静了下来。");
   return;
  }
  o.seen=true;
  emit(o.x,o.y,"#dfc56e",16);EA()?.pickup();
  if(o.name==="旧灯塔"&&state.quest===3){
   gainXp(50);
   showLore("灯塔顶端的灯芯早已熄灭，但石壁上刻着一行字：“回声不在风里，在水下。”",()=>advanceQuest(4));
   return;
  }
  if(o.name==="潮汐祭坛"&&state.quest===4){
   state.coins+=80;gainXp(80);
   playRewardFx("回声的源头","任务完成 · +80 金币");
   advanceQuest(5);
   return;
  }
  notify(o.name+"：这里似乎留下了某种回声");return;
 }
 // 建筑
 if(o.name)notify(o.name+"：一座安静的建筑");
}

/* ================= HUD 更新 ================= */
function updateHP(){
 const p=clamp(state.hp/state.maxHp,0,1);
 const fill=$("hpFill");
 if(fill)fill.style.width=(p*100)+"%";
 document.querySelector(".player-card")?.classList.toggle("low-health",p<=.3);
 if(state.hp<=0){
  state.hp=state.maxHp;player.x=1260;player.y=850;
  notify("你在村庄醒来，旅途还没有结束");
 }
}
function updateSP(){
 const sp=$("spFill");if(sp)sp.style.width=clamp(player.stamina,0,100)+"%";
}
function updateClockHUD(){
 const tag=$("regionTag");if(tag)tag.textContent=zoneAt(player.x,player.y);
}
function updateCombatHUD(){
 const box=$("combat");if(!box)return;
 let en=enemies.find(e=>!e.dead&&dist(player,e)<170);
 if(boss&&boss.active&&!boss.dead&&dist(player,boss)<260){
  box.classList.remove("hidden");
  $("enemyName").textContent="暮岩古龙";$("enemyLevel").textContent="Lv. 12";
  $("enemyHp").style.width=(100*clamp(boss.hp/boss.max,0,1))+"%";
  return;
 }
 if(en){
  const cfg=ETYPE[en.type];
  box.classList.remove("hidden");
  $("enemyName").textContent=en.type;$("enemyLevel").textContent="Lv. "+cfg.lv;
  $("enemyHp").style.width=(100*clamp(en.hp/en.max,0,1))+"%";
 }else box.classList.add("hidden");
}
/* 屏幕外目标：金色方向符号 + 真实游戏距离（世界坐标 1px ≈ 0.5m，符合玩家体感） */
function updateQuestGuide(){
 const guide=$("questGuide"),label=$("guideDistance"),t=questTarget();
 if(!guide||!label||!state.started||uiBlocking()||!t){guide?.classList.add("hidden");return}
 const v=worldToVisual(t.x,t.y);
 const onScreen=v.x>44&&v.x<W-44&&v.y>44&&v.y<H-44;
 const d=dist(player,t);
 if(onScreen||d<90){guide.classList.add("hidden");return}
 const ex=clamp(v.x,56,W-56),ey=clamp(v.y,64,H-64);
 guide.style.left=ex+"px";guide.style.top=ey+"px";
 guide.style.transform="translate(-50%,-50%)";
 // 距离取整到 5m 精度，并限制在合理范围
 const meters=Math.round(d*.5/5)*5;
 label.textContent=(t.name||t.type||"目标")+" · "+Math.max(5,Math.min(999,meters))+" m";
 guide.classList.remove("hidden");
}
/* 隐藏宝箱：靠近才会现身 */
function updateHiddenChests(){
 for(const ch of chests){
  if(ch.kind==="hidden"&&!ch.found&&dist(player,ch)<95){
   ch.found=true;emit(ch.x,ch.y,"#f0d47e",22);
   playRewardFx("发现隐藏宝箱","有些宝箱不会主动现身");EA()?.pickup();
  }
 }
}
/* 移动端互动按钮：只有靠近时才出现 */
function syncInteractButton(){
 const b=$("interactBtn");if(!b)return;
 const t=nearestInteractable();
 const show=!!t&&state.started&&!uiBlocking();
 b.classList.toggle("hidden",!show);
 if(show)b.textContent=t.verb;
}
function syncAudioScene(){
 const dx=(player.x-2320)/620,dy=(player.y-1770)/480;
 const water=clamp(1.35-Math.hypot(dx,dy),0,1);
 let ruin=0;
 for(const l of landmarks)if(l.type==="ruin"||l.type==="shrine")ruin=Math.max(ruin,clamp(1-dist(player,l)/380,0,1));
 EA()?.setScene(water,ruin);
}

/* ================= 镜头 ================= */
function inCombatView(){
 if(boss&&boss.active&&!boss.dead)return true;
 return enemies.some(e=>!e.dead&&dist(player,e)<300&&e.windup>=0&&dist(player,e)<ETYPE[e.type].aggro);
}
function updateCamera(){
 // 战斗拉远，Boss 战进一步拉远
 camera.tz=(boss&&boss.active&&!boss.dead)?0.8:(inCombatView()?0.92:1);
 camera.zoom+=(camera.tz-camera.zoom)*.05;
 const zw=W/(2*camera.zoom),zh=H/(2*camera.zoom);
 const tx=clamp(player.x,zw,world.w-zw),ty=clamp(player.y,zh,world.h-zh);
 camera.x+=(tx-camera.x)*.1;camera.y+=(ty-camera.y)*.1;
}

/* ================= 主循环 ================= */
let audioSceneTimer=0;
function loop(t){
 const dt=Math.min(.033,(t-(loop.last||t))/1000);loop.last=t;
 const portraitBlock=matchMedia("(pointer:coarse)").matches&&!matchMedia("(orientation: landscape)").matches&&state.started;
 if(!portraitBlock){
  move(dt);updateEnemies(dt);updateBoss(dt);updateHiddenChests();
  player.attack=Math.max(0,player.attack-dt);player.inv=Math.max(0,player.inv-dt);
  state.comboTimer=Math.max(0,state.comboTimer-dt);if(state.comboTimer<=0)state.combo=0;
  state.time=(state.time+dt*.22)%24;
  /* 力量药剂增益到期提示 */
  if(state.buff&&performance.now()>state.buff.until){state.buff=null;notify("力量药剂的效果消退了")}
  updateCamera();
  updateParticles2(dt);
  updateHP();updateSP();updateClockHUD();updateCombatHUD();updateQuestGuide();syncInteractButton();
  audioSceneTimer-=dt;if(audioSceneTimer<=0){audioSceneTimer=.4;syncAudioScene()}
 }
 render();
 requestAnimationFrame(loop);
}
function updateParticles2(dt){
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=100*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1)}
 for(let i=texts.length-1;i>=0;i--){texts[i].y-=24*dt;texts[i].life-=dt;if(texts[i].life<=0)texts.splice(i,1)}
}
function render(){
 ctx.clearRect(0,0,W,H);
 ctx.save();
 ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-W/2,-H/2);
 drawBackground();
 const list=[
  ...grassTufts.filter(g=>g.l===0).map(x=>({y:x.y,fn:()=>drawGrass(x)})),
  ...flowers.map(x=>({y:x.y,fn:()=>drawFlower(x)})),
  ...resources.filter(x=>!x.taken).map(x=>({y:x.y,fn:()=>drawResource(x)})),
  ...campfires.map(x=>({y:x.y,fn:()=>drawCampfire(x)})),
  ...echoes.filter(x=>!x.taken).map(x=>({y:x.y,fn:()=>drawEcho(x)})),
  ...chests.map(x=>({y:x.y,fn:()=>drawChest(x)})),
  ...gates.map(x=>({y:x.y,fn:()=>drawGate(x)})),
  ...buildings.map(x=>({y:x.y,fn:()=>drawBuilding(x)})),
  ...grassTufts.filter(g=>g.l>0).map(x=>({y:x.y,fn:()=>drawGrass(x)})),
  ...clues.map(x=>({y:x.y,fn:()=>drawClue(x)})),
  ...landmarks.map(x=>({y:x.y,fn:()=>drawLandmark(x)})),
  ...trees.map(x=>({y:x.y,fn:()=>drawTree(x)})),
  ...rocks.map(x=>({y:x.y,fn:()=>drawRock(x)})),
  ...(boss&&!boss.dead?[{y:boss.y,fn:drawBoss}]:[]),
  ...npcs.map(x=>({y:x.y,fn:()=>drawNPC(x)})),
  ...enemies.filter(e=>!e.dead).map(x=>({y:x.y,fn:()=>drawEnemy(x)})),
  {y:player.y,fn:drawPlayer}
 ];
 list.sort((a,b)=>a.y-b.y);for(const o of list)o.fn();
 drawParticles();drawCombatFeedback();
 ctx.restore();
 drawAtmosphere();
 drawQuestWorldMarker();drawWorldLabel();drawRadar();
}
requestAnimationFrame(loop);

/* ================= 输入 ================= */
addEventListener("keydown",e=>{
 const k=e.key.toLowerCase();keys[k]=true;
 if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(k))e.preventDefault();
 if(k==="e")interact();
 if(k==="q")skill();
 if(k===" ")attack();
 if(k==="m"&&state.started&&!uiBlocking())openFullPanel("mapPanel");
 else if(k==="m")closeAllPanels();
 if(k==="k"){saveGame();notify("进度已保存")}
 if(k==="escape"){
  if(state.lore){$("loreOk")?.click()}
  else if(state.fishing){cancelFishing()}
  else if(state.craft){closeCraft()}
  else if(state.dialogue){dialogueQueue=[];endDialogue()}
  else if(PANELS.some(x=>!$(x)?.classList.contains("hidden")))closeAllPanels();
  else if(state.menuOpen)closeMenu();
  else if(state.started)openMenu();
 }
});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
canvas.addEventListener("mousemove",e=>{mouse.x=e.clientX;mouse.y=e.clientY});
canvas.addEventListener("mousedown",e=>{mouse.down=true;if(state.started&&e.button===0)attack()});
addEventListener("mouseup",()=>mouse.down=false);
canvas.addEventListener("click",e=>{
 if(!state.started||uiBlocking())return;
 const p=screenToWorld(e.clientX,e.clientY);
 player.dir=Math.atan2(p.y-player.y,p.x-player.x);
});

/* 摇杆 */
let joyTouch=null,joyOrigin=null;
const joy=$("joy"),JOY_R=48,JOY_DEAD=.12;
function setJoy(dx,dy){
 const d=Math.hypot(dx,dy)||1,mag=Math.min(d,JOY_R),nx=dx/d,ny=dy/d;
 const usable=Math.max(0,mag-JOY_R*JOY_DEAD)/(JOY_R*(1-JOY_DEAD));
 const ux=nx*usable,uy=ny*usable;
 // 模拟量输出：摇杆轻推走、推满跑，不再是八方向布尔
 joyVec.x=ux;joyVec.y=uy;joyVec.active=usable>.02;
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
 joyVec.x=0;joyVec.y=0;joyVec.active=false;
 const dot=joy?.querySelector("i");if(dot)dot.style.transform="";
}
joy?.addEventListener("pointerup",endJoy);
joy?.addEventListener("pointercancel",endJoy);
joy?.addEventListener("lostpointercapture",endJoy);

/* 移动端按钮 */
$("attackBtn")?.addEventListener("pointerdown",e=>{e.preventDefault();attack()},{passive:false});
$("dashBtn")?.addEventListener("pointerdown",e=>{e.preventDefault();dash()},{passive:false});
$("skillBtn")?.addEventListener("pointerdown",e=>{e.preventDefault();skill()},{passive:false});
$("interactBtn")?.addEventListener("pointerdown",e=>{e.preventDefault();interact()},{passive:false});
document.addEventListener("pointerdown",e=>{
 const b=e.target.closest("button");
 if(!b)return;
 triggerButtonFx(b,false);
 if(b.closest(".mobile-actions"))triggerButtonFx(b,true);
},{passive:true});
document.addEventListener("pointerup",e=>e.target.closest("button")?.classList.remove("is-held"),{passive:true});
document.addEventListener("pointercancel",e=>e.target.closest("button")?.classList.remove("is-held"),{passive:true});

/* ================= 面板 / 菜单绑定 ================= */
function setupUI(){
 $("startBtn")?.addEventListener("click",startGame);
 $("characterBtn")?.addEventListener("click",()=>openFullPanel("characterPanel"));
 $("inventoryBtn")?.addEventListener("click",()=>openFullPanel("inventoryPanel"));
 $("questBtn")?.addEventListener("click",()=>openFullPanel("questPanel"));
 $("miniMap")?.addEventListener("click",()=>openFullPanel("mapPanel"));
 document.querySelectorAll("[data-close-panel]").forEach(b=>b.addEventListener("click",()=>closeFullPanel(b.dataset.closePanel)));
 $("menuBtn")?.addEventListener("click",openMenu);
 $("dialogueNext")?.addEventListener("click",nextDialogue);
 document.querySelectorAll("#invCats button").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll("#invCats button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");invCat=b.dataset.cat;renderInventory();
 }));
 document.querySelectorAll(".menu-list button").forEach(b=>b.addEventListener("click",()=>{
  const act=b.dataset.act;
  document.querySelectorAll(".menu-list button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  $("menuPaneDefault")?.classList.toggle("hidden",act==="help");
  $("menuHelp")?.classList.toggle("hidden",act!=="help");
  if(act==="resume")closeMenu();
  if(act==="save"){saveGame();notify("进度已保存")}
  if(act==="title"){saveGame();location.reload()}
 }));
 $("menu")?.addEventListener("click",e=>{if(e.target===$("menu"))closeMenu()});
 $("lowToggle")?.addEventListener("change",e=>state.settings.low=e.target.checked);
 $("vibToggle")?.addEventListener("change",e=>state.settings.vib=e.target.checked);
 $("sfxToggle")?.addEventListener("change",e=>{state.settings.sfx=e.target.checked;EA()?.setEnabled(e.target.checked)});
 // 角色标签
 document.querySelectorAll("[data-ctab]").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll("[data-ctab]").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  $("ctabEquip")?.classList.toggle("hidden",b.dataset.ctab!=="equip");
  $("ctabSkill")?.classList.toggle("hidden",b.dataset.ctab!=="skill");
 }));
 // 背包整理
 $("invSortBtn")?.addEventListener("click",()=>{invSorted=!invSorted;renderInventory()});
 // 地图缩放
 let mapScale=1;
 $("mapZoomIn")?.addEventListener("click",()=>{mapScale=Math.min(2,mapScale+.15);applyMapZoom()});
 $("mapZoomOut")?.addEventListener("click",()=>{mapScale=Math.max(.6,mapScale-.15);applyMapZoom()});
 function applyMapZoom(){const c=$("mapCanvas");if(!c)return;c.style.transform="scale("+mapScale+")";c.style.transformOrigin="center center"}
 // 地图传送：点击已点亮的营火
 $("mapCanvas")?.addEventListener("click",e=>{
  const c=$("mapCanvas"),r=c.getBoundingClientRect();
  const wx=(e.clientX-r.left)/r.width*c.width/(c.width/world.w);
  const wy=(e.clientY-r.top)/r.height*c.height/(c.height/world.h);
  for(const f of campfires){
   if(f.seen&&Math.hypot(wx-f.x,wy-f.y)<60){
    player.x=f.x;player.y=f.y+56;markExplored();
    closeAllPanels();notify("传送至 "+f.name);saveGame();return;
   }
  }
 });
}
setupUI();

/* ================= 存档（v2） ================= */
function saveGame(){
 try{
  localStorage.setItem("etheria-save-v2",JSON.stringify({
   v:2,
   state:{hp:state.hp,maxHp:state.maxHp,time:state.time,coins:state.coins,quest:state.quest,kills:state.kills,clues:state.clues,echoes:state.echoes,level:state.level,xp:state.xp,nextXp:state.nextXp,defeatedBoss:state.defeatedBoss,chestsOpened:state.chestsOpened,bag:state.bag,equipment:state.equipment,settings:state.settings,achievements:state.achievements},
   player:{x:player.x,y:player.y,stamina:player.stamina},
   echoTaken:echoes.map(x=>x.taken),
   chestOpened:chests.map(x=>x.opened),
   chestFound:chests.map(x=>x.found),
   clueFound:clues.map(x=>x.found),
   landmarkSeen:landmarks.map(x=>!!x.seen),
   campfireSeen:campfires.map(x=>!!x.seen),
   gateOpen:gates.map(x=>x.open),
   enemyDead:enemies.map(x=>x.dead),
   bossHp:boss?boss.hp:0,
   bossDead:boss?boss.dead:true,
   explored:[...exploredSet]
  }));
 }catch(e){}
}
function loadGame(){
 try{
  const s=JSON.parse(localStorage.getItem("etheria-save-v2")||"null");if(!s)return;
  Object.assign(state,s.state||{});
  state.dialogue=false;state.menuOpen=false;state.panel=false;state.lore=false;state.started=true;
  /* 瞬态状态不入档：钓鱼 / 合成 / 药剂增益读档后重置 */
  state.fishing=false;state.craft=false;state.buff=null;
  if(!state.achievements||typeof state.achievements!=="object")state.achievements={};
  if(s.player)Object.assign(player,s.player);
  s.echoTaken?.forEach((v,i)=>{if(echoes[i])echoes[i].taken=!!v});
  s.chestOpened?.forEach((v,i)=>{if(chests[i])chests[i].opened=!!v});
  s.chestFound?.forEach((v,i)=>{if(chests[i])chests[i].found=!!v});
  s.clueFound?.forEach((v,i)=>{if(clues[i])clues[i].found=!!v});
  s.landmarkSeen?.forEach((v,i)=>{if(landmarks[i])landmarks[i].seen=!!v});
  s.campfireSeen?.forEach((v,i)=>{if(campfires[i])campfires[i].seen=!!v});
  s.gateOpen?.forEach((v,i)=>{if(gates[i])gates[i].open=!!v});
  s.enemyDead?.forEach((v,i)=>{if(enemies[i])enemies[i].dead=!!v});
  if(boss){boss.dead=!!s.bossDead;if(!boss.dead&&typeof s.bossHp==="number")boss.hp=s.bossHp}
  if(Array.isArray(s.explored))s.explored.forEach(i=>exploredSet.add(i));
  EA()?.setEnabled(state.settings.sfx);
  updateHP();updateQuestUI();
  notify("已恢复上次旅程");
 }catch(e){}
}
setInterval(()=>{if(state.started&&!uiBlocking())saveGame()},20000);

/* ================= 移动端进入流程 ================= */
async function enterImmersiveMobile(){
 const touch=matchMedia("(pointer:coarse)").matches;
 if(!touch)return true;
 try{
  if(!document.fullscreenElement)await document.documentElement.requestFullscreen?.({navigationUI:"hide"});
 }catch(e){}
 try{await screen.orientation?.lock?.("landscape")}catch(e){}
 await new Promise(r=>setTimeout(r,180));
 return !touch||matchMedia("(orientation: landscape)").matches;
}
async function startGame(){
 if(state.started)return;
 const touch=matchMedia("(pointer:coarse)").matches;
 const landscape=matchMedia("(orientation: landscape)").matches;
 if(touch&&!landscape){
  const ready=await enterImmersiveMobile();
  if(!ready){pendingStart=true;$("rotateHint")?.classList.add("show");return}
 }
 beginWorld();
}
function beginWorld(){
 pendingStart=false;
 $("rotateHint")?.classList.remove("show");
 ensureFxLayer();
 state.started=true;
 $("start")?.classList.add("hidden");
 document.body.classList.add("game-running");
 EA()?.init();EA()?.setEnabled(state.settings.sfx);
 loadGame();
 notify("欢迎来到晨雾谷");
 updateQuestUI();updateHP();
 setTimeout(()=>$("hint")?.classList.add("fade"),7000);
 syncMobileUI();
}
function syncMobileUI(){
 const touch=matchMedia("(pointer:coarse)").matches;
 const landscape=matchMedia("(orientation: landscape)").matches;
 const playable=state.started&&(!touch||landscape);
 if(pendingStart&&touch&&landscape){beginWorld();return}
 if(touch&&state.started&&!landscape)$("rotateHint")?.classList.add("show");
 else if(!pendingStart)$("rotateHint")?.classList.remove("show");
 $("hud")?.classList.toggle("hidden",!playable);
 $("mobileControls")?.classList.toggle("hidden",!(playable&&touch));
}
addEventListener("resize",syncMobileUI);
addEventListener("orientationchange",()=>setTimeout(syncMobileUI,120));
addEventListener("fullscreenchange",syncMobileUI);

updateQuestUI();updateHP();syncMobileUI();
