const KEY="voidrun-save-v5";
const D={
  version:5,
  createdAt:0,
  updatedAt:0,
  wave:1,
  core:0,
  choices:{},
  choiceLog:[],
  flags:{},
  tasks:{},
  stats:{kills:0,runs:0,shots:0,damage:0,damageTaken:0,waves:0,playTime:0},
  upgrades:[],
  player:null,
  settings:{vibrate:true,autoAim:true,autoFire:true,leftHand:false,sensitivity:1,lowFx:false,showHints:true},
  checkpoint:"wave-1"
};
function clone(v){return typeof structuredClone==="function"?structuredClone(v):JSON.parse(JSON.stringify(v))}
export function defaults(){return clone(D)}
function merge(base,src){
  if(!src||typeof src!=="object")return base;
  for(const k of Object.keys(src)){
    if(src[k]&&typeof src[k]==="object"&&!Array.isArray(src[k])&&base[k]&&typeof base[k]==="object")merge(base[k],src[k]);
    else if(src[k]!==undefined)base[k]=src[k];
  }
  return base
}
function read(key){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null}catch{return null}}
export function loadSave(){
  const raw=read(KEY)||read(KEY+"-backup");
  if(!raw)return clone(D);
  const s=merge(clone(D),raw);
  s.version=5;
  if(!Array.isArray(s.upgrades))s.upgrades=[];
  if(!s.player||typeof s.player!=="object"||Array.isArray(s.player))s.player=null;
  s.settings=merge(clone(D.settings),s.settings);
  return s
}
export function saveGame(s){
  if(!s.createdAt)s.createdAt=Date.now();
  s.updatedAt=Date.now();
  const raw=JSON.stringify(s);
  try{
    const previous=localStorage.getItem(KEY);
    if(previous)localStorage.setItem(KEY+"-backup",previous);
    localStorage.setItem(KEY,raw)
  }catch{
    throw new Error("SAVE_FAILED")
  }
}
export function hasSave(){return !!(read(KEY)||read(KEY+"-backup"))}
export function clearSave(){localStorage.removeItem(KEY);localStorage.removeItem(KEY+"-backup")}
export function saveLabel(s){
  const when=s.updatedAt?new Date(s.updatedAt).toLocaleString("zh-CN",{hour12:false}):"无记录";
  return "WAVE "+(s.wave||1)+" · CORE "+(s.core||0)+" · "+when
}
export function makeExport(s){
  const payload={format:"VOID//RUN SAVE",version:5,exportedAt:new Date().toISOString(),game:"VOID//RUN — 虚空回响",save:clone(s)};
  return JSON.stringify(payload,null,2)
}
export function parseImport(text){
  if(typeof text!=="string"||text.length>2_000_000)throw new Error("INVALID_SAVE_SIZE");const p=JSON.parse(text);
  const s=p&&p.save?p.save:p;
  if(!s||typeof s!=="object"||typeof s.wave!=="number"||!Number.isFinite(s.wave)||s.wave<1||s.wave>999)throw new Error("INVALID_SAVE");
  const out=merge(clone(D),s);if(!Array.isArray(out.upgrades))out.upgrades=[];return out
}
export function saveKey(){return KEY}