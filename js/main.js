import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js";

const el=id=>document.getElementById(id);
const state={started:false,hp:820,maxHp:820,stamina:100,time:6.7,coins:126,wood:0,ore:0,herbs:3,quest:0,bag:["旅者短剑","野外地图","晨雾草×3"],settings:{low:false},enemy:null,interacting:null};
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9fb8bd);
scene.fog=new THREE.FogExp2(0x9fb8bd,.012);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,600);
camera.position.set(0,8,13);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
el("game").appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.enablePan=false;controls.minDistance=5;controls.maxDistance=18;controls.maxPolarAngle=Math.PI*.46;controls.minPolarAngle=.25;
controls.target.set(0,1,0);
renderer.domElement.addEventListener("contextmenu",e=>e.preventDefault());

const hemi=new THREE.HemisphereLight(0xc9e1dc,0x4d4439,2.1);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe4b2,3.1);sun.position.set(-40,65,25);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-70;sun.shadow.camera.right=70;sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70;scene.add(sun);

const world=new THREE.Group();scene.add(world);
const colliders=[];
const interactables=[];
const enemies=[];
const keys={};
const clock=new THREE.Clock();
const player=new THREE.Group();player.position.set(0,0,12);world.add(player);

function mat(color,rough=.8,metal=0){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});}
function mesh(g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;world.add(o);return o;}
function rand(a,b){return a+Math.random()*(b-a);}
function terrainHeight(x,z){return Math.sin(x*.055)*1.8+Math.cos(z*.045)*1.4+Math.sin((x+z)*.025)*1.1;}
function addTree(x,z,s=1){
 const y=terrainHeight(x,z);
 const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.32,2.4,8),mat(0x66503c));trunk.position.y=1.2;trunk.castShadow=true;g.add(trunk);
 for(let i=0;i<3;i++){const crown=new THREE.Mesh(new THREE.ConeGeometry(1.35-i*.22,2.5,9),mat(i===0?0x365c4c:0x416c54));crown.position.y=2.4+i*1.0;crown.castShadow=true;g.add(crown)}
 world.add(g);
}
function addRock(x,z,s=1){
 const y=terrainHeight(x,z);const r=mesh(new THREE.DodecahedronGeometry(rand(.35,.8)*s,0),mat(0x737a76),x,y+.3*s,z);r.scale.y=.65;r.rotation.set(rand(0,2),rand(0,2),rand(0,2));
}
function addHouse(x,z,scale=1){
 const y=terrainHeight(x,z),g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);
 const body=new THREE.Mesh(new THREE.BoxGeometry(5,3.2,4.2),mat(0xc9b38b));body.position.y=1.6;body.castShadow=true;body.receiveShadow=true;g.add(body);
 const roof=new THREE.Mesh(new THREE.ConeGeometry(3.7,2.4,4),mat(0x6b5147));roof.rotation.y=Math.PI/4;roof.position.y=4.4;roof.castShadow=true;g.add(roof);
 const door=new THREE.Mesh(new THREE.BoxGeometry(.9,1.7,.12),mat(0x3e3330));door.position.set(0,.85,2.12);g.add(door);
 world.add(g);colliders.push({x,z,r:3.2*scale});
}
function addLantern(x,z){
 const y=terrainHeight(x,z);const g=new THREE.Group();g.position.set(x,y,z);
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.045,.07,2.2,6),mat(0x282e2e));pole.position.y=1.1;g.add(pole);
 const lamp=new THREE.Mesh(new THREE.OctahedronGeometry(.22),new THREE.MeshStandardMaterial({color:0xffcf72,emissive:0xff9e32,emissiveIntensity:2}));lamp.position.y=2.2;g.add(lamp);world.add(g);
 const l=new THREE.PointLight(0xffb95f,1.2,7);l.position.set(x,y+2.2,z);world.add(l);
}
function makeTerrain(){
 const geo=new THREE.PlaneGeometry(180,180,80,80);geo.rotateX(-Math.PI/2);
 const p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,terrainHeight(x,z)-1.2)}
 geo.computeVertexNormals();
 const ground=new THREE.Mesh(geo,mat(0x7d9b7b));ground.receiveShadow=true;world.add(ground);
 const pathMat=mat(0xb7a47c);
 const road=new THREE.Mesh(new THREE.PlaneGeometry(7,110),pathMat);road.rotation.x=-Math.PI/2;road.position.set(0,-.03,0);road.receiveShadow=true;world.add(road);
 const road2=new THREE.Mesh(new THREE.PlaneGeometry(5,70),pathMat);road2.rotation.x=-Math.PI/2;road2.rotation.z=Math.PI/2;road2.position.set(-2,-.01,-12);world.add(road2);
 const water=new THREE.Mesh(new THREE.CircleGeometry(22,48),new THREE.MeshStandardMaterial({color:0x5b91a0,roughness:.22,metalness:.05,transparent:true,opacity:.9}));
 water.rotation.x=-Math.PI/2;water.position.set(43,-1.0,31);world.add(water);
}
function buildWorld(){
 makeTerrain();
 for(let i=0;i<90;i++){let x=rand(-75,75),z=rand(-72,72);if(Math.hypot(x,z)<18|| (x>28&&z>10))continue;addTree(x,z,rand(.75,1.3))}
 for(let i=0;i<55;i++){let x=rand(-78,78),z=rand(-76,76);if(Math.hypot(x,z)<15)continue;addRock(x,z,rand(.7,1.4))}
 addHouse(-8,-13,1);addHouse(8,-17,.82);addHouse(-15,-23,.72);
 [-12,-5,3,11].forEach(x=>addLantern(x,-8));
 const sign=mesh(new THREE.BoxGeometry(2.4,1.3,.12),mat(0x806348),0,terrainHeight(0,2)+1,2);
 sign.name="村口告示牌";interactables.push({obj:sign,name:"村口告示牌",text:"木牌上写着：向北是旧森林，向东是银潮湖。"});
 addNPC(-3,-8,"艾琳",0xead7bb);
 addNPC(18,3,"罗安",0x9bb9c8);
 for(let i=0;i<7;i++)spawnEnemy(rand(-30,30),rand(-42,34),i%2?"荒原狼":"岩甲兽");
 addShrine(24,-25);
}
function addNPC(x,z,name,color){
 const g=new THREE.Group();g.position.set(x,terrainHeight(x,z),z);
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.38,.5,1.35,10),mat(color));body.position.y=.8;body.castShadow=true;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.38,16,12),mat(0xd7ad8d));head.position.y=1.75;head.castShadow=true;g.add(head);
 const marker=new THREE.Mesh(new THREE.OctahedronGeometry(.16),new THREE.MeshStandardMaterial({color:0xe5bc62,emissive:0x9a6724,emissiveIntensity:1.3}));marker.position.y=2.6;g.add(marker);
 world.add(g);interactables.push({obj:g,name,text:name==="艾琳"?"“你是刚到这里的旅者吧？森林里的回声最近越来越近了。”":"“银潮湖以东有一座废弃遗迹，别在雾里迷路。”",npc:true});
}
function addShrine(x,z){
 const y=terrainHeight(x,z);const g=new THREE.Group();g.position.set(x,y,z);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.8,.6,8),mat(0x66737a));base.position.y=.3;g.add(base);
 const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.75),new THREE.MeshStandardMaterial({color:0x79b5bd,emissive:0x3b9aa5,emissiveIntensity:1.4,transparent:true,opacity:.88}));crystal.position.y=1.5;g.add(crystal);
 world.add(g);interactables.push({obj:g,name:"潮汐祭坛",text:"晶石里传出低沉的回响。你的地图被点亮了一片新的区域。",shrine:true});
}
function spawnEnemy(x,z,type){
 const y=terrainHeight(x,z);const g=new THREE.Group();g.position.set(x,y,z);
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.8,5,10),mat(type==="荒原狼"?0x6c625a:0x68787a));body.position.y=.85;body.castShadow=true;g.add(body);
 const head=new THREE.Mesh(new THREE.ConeGeometry(.52,.75,6),mat(type==="荒原狼"?0x57504a:0x58696b));head.rotation.x=-Math.PI/2;head.position.set(0,1.15,.55);head.castShadow=true;g.add(head);
 const eyeMat=new THREE.MeshBasicMaterial({color:0xe06a4f});for(const sx of [-.16,.16]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.055,8,8),eyeMat);eye.position.set(sx,1.32,.86);g.add(eye)}
 world.add(g);enemies.push({obj:g,hp:type==="荒原狼"?140:220,max:type==="荒原狼"?140:220,name:type,damage:type==="荒原狼"?34:48,home:new THREE.Vector3(x,y,z),cool:rand(0,2)});
}
function buildPlayer(){
 const cloak=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.95,6,12),mat(0x263e48));cloak.position.y=1;cloak.castShadow=true;player.add(cloak);
 const coat=new THREE.Mesh(new THREE.CylinderGeometry(.5,.38,1.05,8),mat(0x9d7a50));coat.position.y=1.05;coat.castShadow=true;player.add(coat);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),mat(0xe0b495));head.position.y=1.9;head.castShadow=true;player.add(head);
 const hair=new THREE.Mesh(new THREE.ConeGeometry(.38,.65,8),mat(0x303238));hair.position.y=2.2;hair.rotation.y=.3;player.add(hair);
 const sword=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,1.5),mat(0xd9dce0,.25,.7));sword.position.set(.65,1.15,.15);sword.rotation.x=-.3;sword.rotation.z=-.4;player.add(sword);
}
buildWorld();buildPlayer();

function dist(a,b){return a.position.distanceTo(b.position)}
function nearestEnemy(){
 let best=null,bd=8;for(const e of enemies){if(e.hp<=0)continue;const d=dist(player,e.obj);if(d<bd){bd=d;best=e}}return best;
}
function attack(){
 const e=nearestEnemy();if(!e){toast("附近没有敌人");return}
 e.hp-=95;state.enemy=e;showCombat(e);
 player.rotation.y=Math.atan2(e.obj.position.x-player.position.x,e.obj.position.z-player.position.z);
 toast("斩击命中 · -95");
 if(e.hp<=0){e.obj.visible=false;state.coins+=18;state.wood++;state.quest=Math.min(2,state.quest+1);toast("击败 "+e.name+" · 获得 18 金币");updateQuest()}
}
function dash(){
 if(state.stamina<25)return toast("体力不足");
 state.stamina-=25;const f=new THREE.Vector3(0,0,-1).applyQuaternion(player.quaternion);player.position.addScaledVector(f,5);toast("疾行");
}
function useSkill(){
 const hit=enemies.filter(e=>e.hp>0&&dist(player,e.obj)<7);if(!hit.length)return toast("没有目标进入元素技范围");
 hit.forEach(e=>e.hp-=150);toast("回响爆发 · "+hit.length+" 个目标受创");state.quest=Math.min(2,state.quest+hit.filter(e=>e.hp<=0).length);updateQuest();
 hit.filter(e=>e.hp<=0).forEach(e=>{e.obj.visible=false;state.coins+=20});
}
function move(dt){
 const v=new THREE.Vector3((keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),0,(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0));
 if(v.lengthSq()){v.normalize();const speed=keys.shift&&state.stamina>0?9:4.6;player.position.addScaledVector(v,speed*dt);player.position.y=terrainHeight(player.position.x,player.position.z);if(keys.shift)state.stamina=Math.max(0,state.stamina-22*dt);else state.stamina=Math.min(100,state.stamina+14*dt);player.rotation.y=Math.atan2(v.x,v.z)}
 else state.stamina=Math.min(100,state.stamina+18*dt);
 player.position.x=THREE.MathUtils.clamp(player.position.x,-82,82);player.position.z=THREE.MathUtils.clamp(player.position.z,-82,82);
}
function updateEnemies(dt){
 for(const e of enemies){if(e.hp<=0)continue;const d=dist(player,e.obj);e.cool-=dt;if(d<12){const dir=player.position.clone().sub(e.obj.position);dir.y=0;dir.normalize();e.obj.position.addScaledVector(dir,dt*(d>2.2?1.5:0));e.obj.position.y=terrainHeight(e.obj.position.x,e.obj.position.z);e.obj.rotation.y=Math.atan2(dir.x,dir.z);if(d<2.5&&e.cool<=0){state.hp=Math.max(0,state.hp-e.damage);e.cool=1.5;updateHP();toast("受到 "+e.damage+" 点伤害");if(state.hp<=0)state.hp=state.maxHp}}else{const h=e.home.clone().sub(e.obj.position);h.y=0;if(h.length()>7){h.normalize();e.obj.position.addScaledVector(h,dt);}}}
}
function updateCamera(){
 const target=player.position.clone();target.y+=1;
 controls.target.lerp(target,.12);
 const offset=camera.position.clone().sub(controls.target);if(offset.length()>18)offset.setLength(18);if(offset.length()<5)offset.setLength(5);
 camera.position.copy(controls.target).add(offset);
}
function updateDay(dt){
 state.time=(state.time+dt*.018)%24;const a=(state.time/24)*Math.PI*2-Math.PI/2;
 sun.position.set(Math.cos(a)*55,Math.sin(a)*65,25);
 const daylight=THREE.MathUtils.clamp(Math.sin(a)*.8+.35,.12,1);
 hemi.intensity=1.1+daylight;sun.intensity=1.2+daylight*2;
 const sky=new THREE.Color().setHSL(.53,.18,.27+daylight*.23);scene.background.copy(sky);scene.fog.color.copy(sky);
 el("clock").textContent=String(Math.floor(state.time)).padStart(2,"0")+":"+String(Math.floor((state.time%1)*60)).padStart(2,"0");
}
function updateHP(){el("hpFill").style.width=(state.hp/state.maxHp*100)+"%";el("hpText").textContent=Math.ceil(state.hp)+" / "+state.maxHp}
function showCombat(e){el("combat").classList.remove("hidden");el("enemyName").textContent=e.name;el("enemyLevel").textContent="Lv. "+(e.name==="荒原狼"?5:7);el("enemyHp").style.width=Math.max(0,e.hp/e.max*100)+"%"}
function updateQuest(){const q=[["初见晨雾谷","跟随金色光标前往村庄"],["森林中的威胁","击败 2 个荒原生物"],["回声的源头","前往东北方的潮汐祭坛"]][state.quest];el("questTitle").textContent=q[0];el("questHint").textContent=q[1];if(state.quest===2)el("regionName").textContent="银潮湖畔"}
function toast(t){const x=el("toast");x.textContent=t;x.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>x.classList.remove("show"),1800)}
function interact(){
 let best=null,bd=4;for(const a of interactables){const d=dist(player,a.obj);if(d<bd){bd=d;best=a}}
 if(!best)return toast("附近没有可以互动的目标");
 el("dialogueName").textContent=best.name;el("dialogueRole").textContent=best.npc?"NPC":"世界交互";el("dialogueText").textContent=best.text;el("dialogue").classList.remove("hidden");
 if(best.npc&&best.name==="艾琳"&&state.quest===0){state.quest=1;updateQuest();toast("新任务：森林中的威胁")}
}
function save(){localStorage.setItem("etheria-save",JSON.stringify({hp:state.hp,coins:state.coins,quest:state.quest,time:state.time}));toast("旅行记录已保存")}
function load(){try{const s=JSON.parse(localStorage.getItem("etheria-save"));if(s){Object.assign(state,s);updateHP();updateQuest();toast("旅行记录已恢复")}}catch{}}
function menu(tab="map"){
 el("menu").classList.remove("hidden");document.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
 const c=el("tabContent");
 if(tab==="map")c.innerHTML='<div class="tab-body"><div class="map-box"><i class="map-pin" style="left:48%;top:62%"></i><i class="map-pin" style="left:76%;top:28%"></i></div><h3>晨雾谷</h3><div class="stat-row"><span>已探索</span><b>18%</b></div><div class="stat-row"><span>发现地点</span><b>3 / 16</b></div><div class="stat-row"><span>世界等级</span><b>Ⅰ</b></div></div>';
 if(tab==="bag")c.innerHTML='<div class="tab-body"><div class="item"><strong>旅者短剑</strong><span class="tag">装备</span></div><div class="item"><strong>野外地图</strong><span class="tag">任务</span></div><div class="item"><strong>晨雾草 ×3</strong><span class="tag">素材</span></div><div class="item"><strong>银潮矿 ×'+state.ore+'</strong><span class="tag">素材</span></div><div class="stat-row"><span>金币</span><b>'+state.coins+'</b></div></div>';
 if(tab==="quests")c.innerHTML='<div class="tab-body"><div class="quest-row"><div><b>主线 · 回声大陆</b><small>'+el("questTitle").textContent+' · '+el("questHint").textContent+'</small></div><span class="tag">进行中</span></div><div class="quest-row"><div><b>晨雾谷的传闻</b><small>与村民交谈，了解这片土地</small></div><span class="tag">支线</span></div></div>';
 if(tab==="settings")c.innerHTML='<div class="tab-body settings"><label>低性能模式 <input id="lowToggle" type="checkbox"></label><label>自动保存 <input type="checkbox" checked></label><label>镜头灵敏度 <input type="range" min="1" max="10" value="5"></label><div class="stat-row"><span>本地存档</span><button id="saveNow">立即保存</button></div></div>';
 const saveNow=el("saveNow");if(saveNow)saveNow.onclick=save;
}
function start(){
 state.started=true;el("start").classList.add("hidden");el("hud").classList.remove("hidden");el("mobileControls").classList.toggle("hidden",innerWidth>700);updateQuest();load();toast("欢迎来到回声大陆");
}
el("startBtn").onclick=start;el("menuBtn").onclick=()=>menu();el("closeMenu").onclick=()=>el("menu").classList.add("hidden");
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>menu(b.dataset.tab));
el("dialogueNext").onclick=()=>el("dialogue").classList.add("hidden");
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(e.key===" "){e.preventDefault();dash()}if(e.key.toLowerCase()==="e")interact();if(e.key.toLowerCase()==="q")useSkill();if(e.key.toLowerCase()==="k")save()});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
renderer.domElement.addEventListener("click",()=>{if(state.started)attack()});
el("dashBtn")?.addEventListener("click",dash);el("skillBtn")?.addEventListener("click",useSkill);el("attackBtn")?.addEventListener("click",attack);
let dragging=false,lastX=0;
renderer.domElement.addEventListener("pointerdown",e=>{if(e.button===2){dragging=true;lastX=e.clientX}});
renderer.domElement.addEventListener("pointermove",e=>{if(!dragging)return;const dx=e.clientX-lastX;controls.rotateLeft(dx*.004);lastX=e.clientX});
renderer.domElement.addEventListener("pointerup",()=>dragging=false);
let progress=0;const loading=setInterval(()=>{progress=Math.min(100,progress+Math.random()*18);el("loadBar").style.width=progress+"%";if(progress>=100){clearInterval(loading);setTimeout(()=>el("loading").remove(),350)}},120);

function loop(){
 requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);
 if(state.started){move(dt);updateEnemies(dt);updateCamera();updateDay(dt);const near=interactables.find(a=>dist(player,a.obj)<4);el("interact").classList.toggle("hidden",!near);if(near)el("interactName").textContent=near.name;const e=nearestEnemy();el("combat").classList.toggle("hidden",!e);if(e)showCombat(e)}
 controls.update();renderer.render(scene,camera);
}
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7))});
loop();
