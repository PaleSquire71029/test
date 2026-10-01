const choice=(id,label,set={},conditions=[])=>({id,label,...(conditions.length?{conditions}:{}),set});

export const TASKS={
 signal:{title:"追踪异常信号",desc:"确认这场事故究竟是突然发生，还是早已被人看见。",steps:{start:"未开始",active:"调查中",done:"已确认"}},
 aster:{title:"Aster的证词",desc:"判断一份提前十七分钟出现的事故记录是否值得相信。",steps:{active:"等待决定",done:"已决定"}},
 mira:{title:"Mira的警告",desc:"追查被从地图和公开记录中删除的第七码头。",steps:{active:"等待调查",done:"已决定"}},
 archive:{title:"保存事故证据",desc:"在真相尚未完整时，保留原始记录，而不是替它下结论。",steps:{active:"等待证据",done:"已保存"}},
 core:{title:"CORE接入协议",desc:"决定是否读取一段可能属于逝者、也可能属于自己的记忆。",steps:{active:"等待接入",done:"已接入"}},
 responsibility:{title:"责任链",desc:"查清事故发生后，谁修改了记录、谁保持沉默，以及为什么。",steps:{active:"调查中",done:"已确认"}},
 protocol:{title:"ECHO PROTOCOL",desc:"决定记录究竟应该服务于真相、秩序，还是下一次实验。",steps:{active:"等待最终选择",done:"已完成"}}
};

export const STORY={
 comm2:{id:"comm2",wave:2,speaker:"ASTER",title:"第一份回声",text:"“先别急着把它当成敌袭。那些目标出现以前，系统已经把它们写进了记录。”\n\n“如果你能回收CORE，我可以告诉你谁先看见了它们。”\n\n她停了很久：\n“有时候，最危险的不是不知道真相，而是太早相信一个完整的故事。”",choices:[
  choice("ask_core","“那就告诉我CORE是什么。”",{choices:{coreQuestion:"ask_core"},flags:{route:"trust"}}),
  choice("stay_silent","“我只负责活下来。”",{choices:{coreQuestion:"stay_silent"},flags:{route:"survive"}})
 ]},
 comm3:{id:"comm3",wave:3,speaker:"SYSTEM",title:"删除记录",text:"“日志完整性：99.7%。”\n\n你发现事故发生前，有43秒监控被删除。\n\n删除者拥有管理员权限，却没有留下身份。\n\n系统建议：忽略缺口，以保证任务效率。\n\n这是第一次，系统把‘不知道’定义成了一种效率。",choices:[
  choice("flag_gap","标记43秒缺口",{choices:{gap:"flagged"},flags:{recordGap:true},task:{responsibility:"active"}}),
  choice("ignore_gap","接受系统建议，继续行动",{choices:{gap:"ignored"},flags:{recordGapIgnored:true},task:{responsibility:"active"}})
 ]},
 comm4:{id:"comm4",wave:4,speaker:"ASTER",title:"事故报告",text:"“官方报告说，事故发生在第一次断层开启之后。”\n“但我手里的原始时间戳，比事故早了十七分钟。”\n\n“如果这是真的，事故就不是从断层开始的。”\n“它从某个人决定隐瞒什么的那一刻开始。”",choices:[
  choice("trust_aster","相信Aster的时间戳",{choices:{route:"trust"},flags:{asterTrusted:true},task:{aster:"done"}}),
  choice("archive_report","保存原始记录，不急着判断",{choices:{route:"archive"},flags:{evidenceSaved:true},task:{archive:"done"}})
 ]},
 comm5:{id:"comm5",wave:5,speaker:"ASTER",title:"一个名字",text:"“CORE不是能源。”\n“它保存的是人在事故发生前最后一次确认过的东西。”\n\n“所以它很危险。一个人最后相信什么，和一个人最后知道什么，从来不是一回事。”\n\n通讯结束前，她说出了一个名字：‘林舟。’\n那是事故名单上唯一被标记为‘主动离场’的人。",conditions:[{choice:"coreQuestion",equals:"ask_core"}],choices:[
  choice("ask_linzhu","追查林舟的离场记录",{flags:{linzhouInvestigated:true},task:{responsibility:"active"}}),
  choice("leave_linzhu","不追查个人，只保留事故记录",{flags:{personalCaseAvoided:true},task:{archive:"done"}})
 ]},
 comm6:{id:"comm6",wave:6,speaker:"MIRA",title:"不存在的入口",text:"“Aster没有告诉你一件事。”\n“地图上的第七码头根本不存在，但我的信号就是从那里发出来的。”\n\n“事故后，有人把整个区域从公开地图删掉了。”\n\n“如果你要进去，别让系统知道你进去过。”\n\n“但被删除的地方，不一定代表那里从未存在。”",conditions:[{flag:"asterTrusted",equals:false}],choices:[
  choice("enter_shadow","追踪Mira的信号",{flags:{miraFollowed:true},task:{mira:"done"}}),
  choice("keep_distance","记录坐标，不立即进入",{flags:{miraRecorded:true},task:{mira:"done",archive:"done"}})
 ]},
 comm7:{id:"comm7",wave:7,speaker:"MIRA",title:"谁应该被记住",text:"“我找到了一份幸存者名单。”\n“名单上有17个人。”\n“原始名单上是18个。”\n\n“被删掉的那个人叫林舟。”\n\n她没有说他是不是英雄，也没有说他是不是叛徒。\n“我只知道，后来所有人都被要求用同一个词描述他：‘失踪。’”\n\n“当一个人被从记录里删除，我们也就失去了讨论他究竟做过什么的机会。”",conditions:[{flag:"miraFollowed"}],choices:[
  choice("restore_name","恢复林舟的名字",{flags:{nameRestored:true},task:{responsibility:"done"}}),
  choice("keep_unknown","保留官方记录，同时标记疑点",{flags:{nameLeftUnknown:true},task:{archive:"done"}})
 ]},
 comm8:{id:"comm8",wave:8,speaker:"MIRA",title:"门后的声音",text:"“如果你已经看见那扇门，就说明你不是第一次来到这里。”\n\n门后传来一段录音：\n“如果有人正在听见这段话，请不要急着替我们判断谁是好人。”\n“我们只希望有人把完整的记录留下来。”\n\nMira最后说：\n“真相不是把坏人找出来。真相是让所有人都有机会面对发生过的事。”",conditions:[{flag:"miraFollowed"}],choices:[
  choice("accept_core_truth","接入隐藏CORE",{flags:{coreTruth:true},task:{core:"active"}}),
  choice("record_warning","保存这段通讯",{flags:{warningRecorded:true},task:{archive:"done"}})
 ]},
 comm9:{id:"comm9",wave:9,speaker:"CORE",title:"最后一个瞬间",text:"“记录读取中……”\n\n你看到林舟最后一次操作：他没有关闭系统。\n他只是把一份原始事故档案复制到了一个无人拥有权限的存储区。\n\n系统警告：\n‘未经授权保存完整记录，将导致责任无法归属。’\n\n林舟回答：\n‘那就别急着归属。先让人知道发生过什么。’",conditions:[{flag:"coreTruth"}],choices:[
  choice("protect_record","保护原始档案",{flags:{recordProtected:true},task:{archive:"done",responsibility:"done"}}),
  choice("return_core","退出CORE，不继续读取",{flags:{coreWithdrawn:true}})
 ]},
 comm10:{id:"comm10",wave:10,speaker:"SYSTEM",title:"观察者协议",text:"“观察者已记录。”\n“请确认：你是否愿意让ECHO PROTOCOL继续记录你的选择？”\n\n“接受：系统将保留你的完整决策链。”\n“拒绝：系统仍会运行，但历史将失去可验证的连续性。”\n\n系统补充：\n“记录也意味着责任。”",choices:[
  choice("accept_protocol","允许协议继续记录",{choices:{final:"accept"},flags:{protocolAccepted:true},task:{protocol:"active"}}),
  choice("reject_protocol","拒绝协议，保留未知",{choices:{final:"reject"},flags:{protocolRejected:true},task:{protocol:"active"}})
 ]},
 comm11:{id:"comm11",wave:11,speaker:"SYSTEM",title:"责任链",text:"“发现三次记录修改。”\n“第一次：删除事故前43秒。”\n“第二次：修改幸存者名单。”\n“第三次：将林舟标记为主动离场。”\n\n“执行者身份：均已隐藏。”\n\n系统询问：\n“是否需要一个责任人？”\n\n你忽然意识到，它问的并不是‘谁做了这些事’，而是‘你是否需要一个人来承担全部故事’。",conditions:[{task:"responsibility",equals:"active"}],choices:[
  choice("trace_chain","继续追查完整责任链",{flags:{chainTraced:true},task:{responsibility:"done"}}),
  choice("refuse_scapegoat","拒绝寻找替罪羊，只保存证据",{flags:{scapegoatRefused:true},task:{archive:"done",responsibility:"done"}})
 ]},
 comm12:{id:"comm12",wave:12,speaker:"ASTER",title:"最后一次通讯",text:"“我以前以为，记录是为了证明我没有错。”\n\n“后来我才明白，真正困难的是留下那些能证明自己也错过的东西。”\n\n“你不需要相信我。”\n“只要别让任何一个人的版本，成为唯一留下来的版本。”",conditions:[{flag:"asterTrusted"}],choices:[
  choice("leave_with_record","带着完整记录离开",{flags:{recordEscaped:true},task:{archive:"done",protocol:"active"}}),
  choice("stay_with_echo","留下继续核对记录",{flags:{stayWithEcho:true},task:{protocol:"active"}})
 ]},
 comm13:{id:"comm13",wave:13,speaker:"MIRA",title:"没有英雄",text:"“我终于明白林舟为什么把档案留下。”\n\n“他不是想证明自己正确。”\n“他只是害怕下一批人看到一份被整理得很漂亮的谎言，然后重复同样的错误。”\n\n“如果完整真相让所有人都不舒服，你还会留下它吗？”",conditions:[{flag:"miraFollowed"}],choices:[
  choice("publish_truth","留下完整真相，即使它没有英雄",{flags:{truthKept:true},task:{archive:"done"}}),
  choice("protect_people","隐藏部分细节，优先保护仍然活着的人",{flags:{peopleProtected:true}})
 ]},
 comm14:{id:"comm14",wave:14,speaker:"CORE",title:"最后一块拼图",text:"“如果你已经走到这里，前面的记录应该已经足够让你产生怀疑。”\n\n“43秒被删除过。\n事故时间被提前过。\n第七码头被从地图上抹去。\n林舟被重新定义成‘主动离场’。\n而你自己的选择，也已经被写进协议。”\n\nCORE停顿了一秒。\n\n“但这些还不能组成真相。”\n\n“因为每一份记录都只描述了发生过的一部分。”\n\n“最后一轮开放后，系统会把所有原始记录放在一起。那时你会看见：不是谁单独制造了事故，而是许多看似合理的决定，怎样共同把事情推向了无法挽回的方向。”\n\n“到那时，不要再问哪条路线才是真的。”\n\n“问你自己：如果所有版本都是真的一部分，你愿意留下什么？””,choices:[choice("enter_final","进入最终记录",{task:{protocol:"active"}})]},\n final:{id:"final",wave:15,speaker:"ECHO",title:"终章 · 回声协议",text:"“现在，所有路线汇合。\n\nAster的证词、Mira找到的名字、林舟留下的档案、被删除的43秒，以及你的选择，被放进同一份记录。\n\n第一层：时间。\n事故发生前十七分钟，系统已经出现异常；随后43秒被删除。没有一个画面能直接告诉你‘谁是凶手’，只有一连串普通决定。\n\n第二层：名字。\n林舟不是英雄，也不是叛徒。他犯过错，也试图纠正错误。真正让他第二次消失的，是后来没有人再提起他的名字。\n\n第三层：选择。\n你相信过人，也怀疑过系统；你追查过被删除的地方，也有过为了继续前进而放弃追问的时候。没有一种选择能抹掉另一种选择。\n\n最后，所有记录互相矛盾，也互相补充。它们没有替你选出一个唯一的恶人，也没有给你一个可以轻易接受的答案。\n\nECHO最后问：\n‘当真相不再需要你相信，它仍然需要你负责吗？’”,choices:[choice("accept_truth","接受完整记录",{ending:"truth",choices:{endingRoute:"accepted"},task:{protocol:"done"}})]}}
export function initStory(save){save.choices??={};save.choiceLog??=[];save.flags??={};save.tasks??={};for(const k of Object.keys(TASKS))save.tasks[k]??="";return save}
function cond(save,c){if(!c)return true;if(c.flag)return c.equals===undefined?!!save.flags[c.flag]:!!save.flags[c.flag]===c.equals;if(c.choice)return save.choices[c.choice]===c.equals;if(c.task)return save.tasks[c.task]===c.equals;return true}
export function canShow(save,node){return (node.conditions||[]).every(c=>cond(save,c))}
export function markTask(save,id,status){if(TASKS[id])save.tasks[id]=status}
export function applyChoice(save,node,ch){const s=ch.set||{};if(s.choices)Object.assign(save.choices,s.choices);if(s.flags)Object.assign(save.flags,s.flags);if(s.task)for(const[k,v]of Object.entries(s.task))markTask(save,k,v);if(s.ending)save.flags.ending=s.ending;save.choiceLog.push({node:node.id,choice:ch.id,at:Date.now()});return s.ending||null}
export function nodesAtWave(save,wave){return Object.values(STORY).filter(n=>n.wave===wave&&canShow(save,n))}
export function getEnding(save,wave){if(save.flags.ending)return save.flags.ending;if(wave<15)return null;return"truth"}
