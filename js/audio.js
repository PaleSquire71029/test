/* ETHERIA 音频：环境底噪 + 动作音效 + 场景氛围随位置变化 */
let audioCtx=null;
let master=null;
let ambientStarted=false;
let enabled=true;
let noiseGainRef=null,filterRef=null,droneRef=null;

const AudioContextCtor=window.AudioContext||window.webkitAudioContext;

function ensureContext(){
  if(!AudioContextCtor)return null;
  if(!audioCtx){
    audioCtx=new AudioContextCtor();
    master=audioCtx.createGain();
    master.gain.value=enabled?.18:0;
    master.connect(audioCtx.destination);
  }
  if(audioCtx.state==="suspended")audioCtx.resume().catch(()=>{});
  return audioCtx;
}

function tone(freq,duration,type="sine",volume=.08,slide=0,when=0){
  if(!enabled)return;
  const c=ensureContext();
  if(!c||!master)return;
  const t=c.currentTime+when;
  const osc=c.createOscillator();
  const gain=c.createGain();
  osc.type=type;
  osc.frequency.setValueAtTime(Math.max(20,freq),t);
  if(slide)osc.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),t+duration);
  gain.gain.setValueAtTime(.0001,t);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume),t+.006);
  gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t);
  osc.stop(t+duration+.02);
}

function init(){
  const c=ensureContext();
  if(!c||ambientStarted)return;
  ambientStarted=true;

  const bufferSize=c.sampleRate*2;
  const buffer=c.createBuffer(1,bufferSize,c.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++)data[i]=(Math.random()*2-1)*.35;

  const noise=c.createBufferSource();
  const filter=c.createBiquadFilter();
  const gain=c.createGain();
  noise.buffer=buffer;
  noise.loop=true;
  filter.type="lowpass";
  filter.frequency.value=850;
  filter.Q.value=.35;
  gain.gain.value=.018;
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  noise.start();
  filterRef=filter;noiseGainRef=gain;

  const drone=c.createOscillator();
  const droneGain=c.createGain();
  drone.type="sine";
  drone.frequency.value=92;
  droneGain.gain.value=.009;
  drone.connect(droneGain);
  droneGain.connect(master);
  drone.start();
  droneRef=drone;
}

/* water 0..1 靠近湖面；ruin 0..1 靠近遗迹/神殿 */
function setScene(water,ruin){
  if(!audioCtx||!filterRef)return;
  const t=audioCtx.currentTime;
  filterRef.frequency.setTargetAtTime(850+water*2400,t,.4);
  noiseGainRef.gain.setTargetAtTime(.018+water*.05,t,.4);
  droneRef.frequency.setTargetAtTime(92-ruin*36+water*8,t,.6);
}

function setEnabled(on){
  enabled=on;
  if(master)master.gain.setTargetAtTime(on?.18:0,audioCtx.currentTime,.1);
}

function hit(){
  tone(240,.045,"triangle",.11,90);
  tone(560,.025,"square",.045,-80,.008);
}

function pickup(){
  tone(620,.09,"sine",.07,90);
  tone(920,.12,"sine",.055,120,.055);
}

function levelUp(){
  tone(520,.11,"triangle",.08,120);
  tone(760,.13,"triangle",.075,150,.07);
  tone(1040,.18,"sine",.065,220,.14);
}

function hurt(){
  tone(115,.12,"sawtooth",.08,-45);
  tone(72,.16,"triangle",.055,-20,.025);
}

function shard(){
  tone(880,.14,"sine",.06,160);
  tone(1320,.22,"sine",.05,220,.09);
}

function dispose(){
  if(audioCtx){
    audioCtx.close().catch(()=>{});
    audioCtx=null;master=null;ambientStarted=false;
    noiseGainRef=filterRef=droneRef=null;
  }
}

window.EtheriaAudio={init,hit,pickup,levelUp,hurt,shard,setScene,setEnabled,dispose};
