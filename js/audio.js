let ctx=null;
let master=null;
let ambientStarted=false;

const AudioContextCtor=window.AudioContext||window.webkitAudioContext;

function ensureContext(){
  if(!AudioContextCtor)return null;
  if(!ctx){
    ctx=new AudioContextCtor();
    master=ctx.createGain();
    master.gain.value=.18;
    master.connect(ctx.destination);
  }
  if(ctx.state==="suspended")ctx.resume().catch(()=>{});
  return ctx;
}

function tone(freq,duration,type="sine",volume=.08,slide=0,when=0){
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

export function init(){
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

  const drone=c.createOscillator();
  const droneGain=c.createGain();
  drone.type="sine";
  drone.frequency.value=92;
  droneGain.gain.value=.009;
  drone.connect(droneGain);
  droneGain.connect(master);
  drone.start();
}

export function hit(){
  tone(240,.045,"triangle",.11,90);
  tone(560,.025,"square",.045,-80,.008);
}

export function pickup(){
  tone(620,.09,"sine",.07,90);
  tone(920,.12,"sine",.055,120,.055);
}

export function levelUp(){
  tone(520,.11,"triangle",.08,120);
  tone(760,.13,"triangle",.075,150,.07);
  tone(1040,.18,"sine",.065,220,.14);
}

export function hurt(){
  tone(115,.12,"sawtooth",.08,-45);
  tone(72,.16,"triangle",.055,-20,.025);
}

export function ambient(){
  init();
}

export function dispose(){
  if(ctx){
    ctx.close().catch(()=>{});
    ctx=null;
    master=null;
    ambientStarted=false;
  }
}
