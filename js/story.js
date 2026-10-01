export const TASKS={
 signal:{title:"追踪异常信号",desc:"在断层中回收足够的CORE，定位未知通讯源。",steps:{start:"未开始",active:"追踪中",done:"已定位"}},
 aster:{title:"Aster的信任",desc:"决定是否相信Aster提供的事故记录。",steps:{active:"等待决定",done:"已决定"}},
 mira:{title:"Mira的警告",desc:"调查Mira提到的隐藏区域。",steps:{active:"等待调查",done:"已决定"}},
 archive:{title:"保存事故证据",desc:"在关键节点选择保存原始记录。",steps:{active:"等待证据",done:"已保存"}},
 core:{title:"CORE接入协议",desc:"找到隐藏房间并决定是否接入CORE。",steps:{active:"等待接入",done:"已接入"}},
 protocol:{title:"ECHO PROTOCOL",desc:"在最终波次前确认你究竟在记录什么。",steps:{active:"等待最终选择",done:"已完成"}}
};
export const STORY={
 comm2:{id:"comm2",wave:2,speaker:"ASTER",title:"第一份回声",text:"“先别急着把它当成敌袭。那些目标出现以前，系统已经把它们写进了记录。”\n“如果你能回收CORE，我可以告诉你谁先看见了它们。”",choices:[
  {id:"ask_core",label:"“那就告诉我CORE是什么。”",set:{choices:{coreQuestion:"ask_core"}}},
  {id:"stay_silent",label:"“我只负责活下来。”",set:{choices:{coreQuestion:"stay_silent"}}}
 ]},
 comm4:{id:"comm4",wave:4,speaker:"ASTER",title:"事故报告",text:"“官方报告说，事故发生在第一次断层开启之后。”\n“但我手里的原始时间戳，比事故早了十七分钟。”",choices:[
  {id:"trust_aster",label:"相信Aster，接受她的时间戳",set:{choices:{route:"trust"},flags:{asterTrusted:true}},task:{aster:"done"}},
  {id:"archive_report",label:"保存原始记录，暂不相信任何人",set:{choices:{route:"archive"},flags:{evidenceSaved:true}},task:{archive:"done"}}
 ]},
 comm6:{id:"comm6",wave:6,speaker:"MIRA",title:"不存在的入口",text:"“Aster没有告诉你一件事。”\n“地图上的第七码头根本不存在，但我的信号就是从那里发出来的。”\n“如果你要进去，别让系统知道你进去过。”",conditions:[{flag:"asterTrusted",equals:false}],choices:[
  {id:"enter_shadow",label:"追踪Mira的信号",set:{choices:{route:"shadow"},flags:{miraFollowed:true}},task:{mira:"done"}},
  {id:"keep_distance",label:"记录坐标，不立即进入",set:{choices:{route:"archive"},flags:{miraRecorded:true}},task:{mira:"done",archive:"done"}}
 ]},
 comm8:{id:"comm8",wave:8,speaker:"MIRA",title:"门后的声音",text:"“如果你已经看见那扇门，就说明你不是第一次来到这里。”\n“别相信系统给你的运行次数。”\n“更不要把CORE交给Aster。”",conditions:[{flag:"miraFollowed"}],choices:[
  {id:"accept_core_truth",label:"相信Mira，接入隐藏CORE",set:{choices:{route:"shadow",coreChoice:"accept"},flags:{coreTruth:true}},task:{core:"active"}},
  {id:"record_warning",label:"保存这段通讯",set:{choices:{route:"archive",coreChoice:"record"},flags:{warningRecorded:true}},task:{archive:"done"}}
 ]},
 comm10:{id:"comm10",wave:10,speaker:"SYSTEM",title:"观察者协议",text:"“观察者已记录。”\n“请确认：你是否愿意让ECHO PROTOCOL继续记录你的选择？”\n“拒绝不会终止运行，只会终止可验证的历史。”",choices:[
  {id:"accept_protocol",label:"允许协议继续记录",set:{choices:{final:"accept"},flags:{protocolAccepted:true}},task:{protocol:"done"}},
  {id:"reject_protocol",label:"拒绝协议，保留未知",set:{choices:{final:"reject"},flags:{protocolRejected:true}},task:{protocol:"done"}}
 ]},
 comm12:{id:"comm12",wave:12,speaker:"ASTER",title:"最后一次通讯",text:"“如果你还在听，说明我们之前做出的每个选择都被保留下来了。”\n“现在轮到你决定：把记录带出去，还是让它留在这里。”",conditions:[{flag:"asterTrusted"}],choices:[
  {id:"leave_with_record",label:"带着记录离开",set:{choices:{final:"leave"},flags:{recordEscaped:true}},task:{archive:"done",protocol:"done"}},
  {id:"stay_with_echo",label:"留下，与回声一起继续",set:{choices:{final:"stay"},flags:{stayWithEcho:true}},task:{protocol:"done"}}
 ]},
 final:{id:"final",wave:15,speaker:"ECHO",title:"运行终点",text:"“你已经抵达可验证边界。”\n“最后一个问题不属于系统。”\n“你要让谁决定下一次运行？”",choices:[
  {id:"trust_route",label:"相信Aster留下的路线",conditions:[{flag:"asterTrusted"}],set:{ending:"trust"},task:{protocol:"done"}},
  {id:"archive_route",label:"带走所有证据",conditions:[{flag:"evidenceSaved"}],set:{ending:"archive"},task:{protocol:"done"}},
  {id:"shadow_route",label:"进入不存在的第七码头",conditions:[{flag:"miraFollowed"},{flag:"coreTruth"}],set:{ending:"shadow"},task:{protocol:"done"}}
 ]}}
export function initStory(save){save.choices??={};save.choiceLog??=[];save.flags??={};save.tasks??={};for(const k of Object.keys(TASKS))save.tasks[k]??="";return save}
function cond(save,c){if(!c)return true;if(c.flag)return c.equals===undefined?!!save.flags[c.flag]:!!save.flags[c.flag]===c.equals;if(c.choice)return save.choices[c.choice]===c.equals;if(c.task)return save.tasks[c.task]===c.equals;return true}
export function canShow(save,node){return (node.conditions||[]).every(c=>cond(save,c))}
export function markTask(save,id,status){if(TASKS[id])save.tasks[id]=status}
export function applyChoice(save,node,ch){const s=ch.set||{};if(s.choices)Object.assign(save.choices,s.choices);if(s.flags)Object.assign(save.flags,s.flags);if(s.task)for(const[k,v]of Object.entries(s.task))markTask(save,k,v);if(s.ending)save.flags.ending=s.ending;save.choiceLog.push({node:node.id,choice:ch.id,at:Date.now()});return s.ending||null}
export function nodesAtWave(save,wave){return Object.values(STORY).filter(n=>n.wave===wave&&canShow(save,n))}
export function getEnding(save,wave){if(save.flags.ending)return save.flags.ending;if(wave<15)return null;if(save.flags.miraFollowed&&save.flags.coreTruth)return"shadow";if(save.flags.asterTrusted)return"trust";if(save.flags.evidenceSaved)return"archive";return"survivor"}
