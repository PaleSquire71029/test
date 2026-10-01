const choice=(id,label,set={},conditions=[])=>({id,label,...(conditions.length?{conditions}:{}),set});

export const TASKS={
 signal:{title:"跟着异常走",desc:"战斗中出现了一个不符合常规的信号。先别急着解释它。",steps:{active:"追踪中",done:"已记录"}},
 core:{title:"回收CORE",desc:"继续战斗，看看这些掉落物会把你带到哪里。",steps:{active:"回收中",done:"已记录"}},
 route:{title:"选择路线",desc:"有些路会更快，有些路会让你看到更多东西。",steps:{active:"选择中",done:"已确定"}},
 mirror:{title:"进入镜原",desc:"新的区域正在使用熟悉的战斗规则。找出差异。",steps:{active:"推进中",done:"已进入"}},
 echo:{title:"异常重复",desc:"你开始在战场里看到一些熟悉的东西。",steps:{active:"观察中",done:"已确认"}}
};

export const STORY={
 comm2:{id:"comm2",wave:2,speaker:"ASTER",title:"第一次异常",text:"“别急着清场。”\n\n“看它们。”\n\n你停下半秒。敌群没有去追最近的目标，所有单位都在改变方向，朝你靠拢。\n\n“正常维护机不会这样。”\n\n“继续打。别问为什么，先看看它们会不会一直跟着你。”",choices:[
 choice("keep_moving","继续移动，观察敌人的路线",{flags:{observedTracking:true},task:{signal:"active"}}),
 choice("hold_ground","停在原地，把它们全部清掉",{flags:{testedTracking:true},task:{signal:"active"}})
 ]},
 comm5:{id:"comm5",wave:5,speaker:"ASTER",title:"潮汐母机",text:"Boss倒下以后，所有敌人同时停了一瞬。\n\n没有庆祝，也没有新的指令。\n\n只是停顿。\n\n随后，远处重新亮起一排红色信标。\n\nAster没有解释。\n\n“你刚才选的走法，会被留下。”\n\n“继续吧。”",choices:[
 choice("fast_route","沿着红色信标前进",{flags:{route:"fast"},task:{route:"active"}}),
 choice("side_route","绕开信标，搜索别的入口",{flags:{route:"side"},task:{route:"active"}})
 ]},
 comm7:{id:"comm7",wave:7,speaker:"ASTER",title:"熟悉的东西",text:"你已经升级过几次。\n\n刚进入新的战斗区，一台敌机突然使用了与你相似的移动节奏。\n\nAster沉默了几秒。\n\n“别停。”\n\n“看看它下一步会不会继续学。”",choices:[
 choice("watch","保持原来的打法",{flags:{watchedAdaptation:true}}),
 choice("change","故意改变打法",{flags:{changedAdaptation:true}})
 ]},
 comm10:{id:"comm10",wave:10,speaker:"ASTER",title:"第二次复刻",text:"重型单位出现。\n\n它没有立刻攻击。\n\n它先后退、转向，然后在与你刚才冲刺过的角度上重新调整位置。\n\n这一次你很确定：\n\n它不是随机移动。\n\n“别把它当成普通Boss。”\n\n“想想你刚才是怎么赢的。”",choices:[
 choice("repeat","继续使用已经验证过的打法",{flags:{repeatedPattern:true}}),
 choice("break","故意改变节奏",{flags:{brokenPattern:true}})
 ]},
 comm12:{id:"comm12",wave:12,speaker:"SYSTEM",title:"地图没有变",text:"地图坐标没有变化。\n\n但你刚才走过的路线，在地图上留下了一条原本不存在的亮线。\n\n它没有指向任务目标。\n\n它指向你下一次最可能经过的位置。\n\n系统没有解释。\n\nAster只说了一句：\n\n“现在你知道为什么它们总能找到你了。”",choices:[
 choice("follow","沿着亮线走",{flags:{followPrediction:true}}),
 choice("break_line","离开亮线，自己找路",{flags:{breakPrediction:true}})
 ]},
 comm15:{id:"comm15",wave:15,speaker:"ASTER",title:"门",text:"最后一个大型单位倒下。\n\n它留下的不是普通CORE。\n\n那枚核心接入终端后，地图上出现一扇门。\n\n门的另一侧没有标注地区名称。\n\n只有一句很短的提示：\n\n“已根据当前行动习惯生成入口。”\n\nAster问：\n\n“进去，还是现在回头？”",choices:[
 choice("enter","进去",{flags:{enterMirror:true},task:{mirror:"active"}}),
 choice("wait","暂缓进入，在门外观察",{flags:{waitedAtGate:true},task:{route:"done"}})
 ]},
 r2_16:{id:"r2_16",wave:16,speaker:"SYSTEM",title:"镜原",text:"这里的敌人没有灰潮湾那么混乱。\n\n它们甚至显得有些熟悉。\n\n第一波、第二波、第三波……\n\n你很快发现一个细节：\n\n它们出现的位置，刚好避开了你最常停留的位置。\n\n像是有人提前看过你的战斗。",choices:[
 choice("stay_pattern","继续按照原来的习惯战斗",{flags:{keptHabit:true},task:{mirror:"active"}}),
 choice("change_pattern","刻意改变自己的习惯",{flags:{changedHabit:true},task:{mirror:"active"}})
 ]},
 r2_20:{id:"r2_20",wave:20,speaker:"SERA",title:"不是预言",text:"“你是不是以为它们在预测你？”\n\nSera笑了一下。\n\n“没那么神奇。”\n\n“它们只是在不断记录。”\n\n“你往哪里走，什么时候冲刺，什么时候停下来，什么时候选择更强的武器。”\n\n“记录得足够久以后，看起来就像提前知道。”\n\n通讯中断。\n\n下一波敌人已经出现。",choices:[
 choice("accept","继续战斗",{flags:{acceptedObservation:true}}),
 choice("resist","刻意做出自己平时不会做的选择",{flags:{resistedObservation:true}})
 ]},
 r2_22:{id:"r2_22",wave:22,speaker:"ECHO",title:"同样的战场",text:"“你还记得第一次进入这里时怎么打的吗？”\n\n没有回答。\n\n因为你已经看见了。\n\n场上的敌人正在使用你曾经用过的路线。\n\n不是完全一样。\n\n只是足够像。\n\n“我没有命令它们。”\n\n“它们只是从留下来的东西里学会了。”",choices:[
 choice("continue","继续战斗，不改变自己的选择",{flags:{echoSeen:true},task:{echo:"active"}}),
 choice("change_again","再次改变打法",{flags:{echoChallenged:true},task:{echo:"active"}})
 ]},
 r2_25:{id:"r2_25",wave:25,speaker:"ECHO",title:"防御者",text:"巨大的防御单位启动。\n\n它没有新的武器。\n\n它只有你的旧习惯。\n\n你第一次冲刺，它提前转身。\n你第二次靠近，它已经在等。\n你改变方向，它也改变。\n\n战斗持续得越久，它越像你。\n\n屏幕上没有Boss名称。\n\n只有一个不断变化的数值：\n\n“相似度。”",choices:[
 choice("fight","继续用自己的方式击败它",{flags:{defeatedEcho:true}}),
 choice("unlearn","放弃熟悉的节奏，重新开始一套打法",{flags:{unlearnedEcho:true}})
 ]},
 r2_28:{id:"r2_28",wave:28,speaker:"ECHO",title:"更远处",text:"防御者倒下以后，地图没有打开新的任务。\n\n只是多出了一小块黑色区域。\n\n里面没有名字，没有说明。\n\n只有你的战斗轨迹还在闪。\n\n你突然意识到：\n\n这张地图记录的可能从来不只是道路。",choices:[
 choice("keep_trace","保留轨迹",{flags:{keptTrace:true}}),
 choice("erase_trace","删除当前轨迹",{flags:{erasedTrace:true}})
 ]},
 r2_29:{id:"r2_29",wave:29,speaker:"ASTER",title:"最后一波之前",text:"“还有一件事。”\n\n“从你第一次进入灰潮湾开始，系统就在变。”\n\n“敌人变了，路线变了，你也变了。”\n\n“我们一直以为是在控制战场。”\n\n“现在看来，战场也在反过来塑造我们。”\n\nAster没有继续说。\n\n前方的门打开了。",choices:[
 choice("forward","进入最后一波",{flags:{finalRun:true}}),
 choice("wait","站在门外，再看一次自己的记录",{flags:{lookBack:true}})
 ]},
 final:{id:"final",wave:30,speaker:"ECHO",title:"回声",text:"最后一个单位倒下。\n\n没有新的坐标。\n没有新的命令。\n\n只有一段很短的记录：\n\n“你所做的每一个选择，都曾经改变过下一场战斗。”\n\n你看向自己的武器。\n\n那些升级不是凭空出现的。\n\n你看向地图。\n\n那些路线也不是一开始就存在。\n\n你看向沉默的终端。\n\n它没有告诉你应该相信什么。\n\n它只把你走过的路留在那里。\n\n屏幕最后出现一句话：\n\n“如果一个系统只记得你过去做过什么，它最终会把你变成什么？”\n\n然后，屏幕熄灭。\n\n没有答案。\n\n只有下一次运行的按钮。",choices:[
 choice("run_again","再次运行",{ending:"truth"})
 ]}};

export function initStory(save){save.choices??={};save.choiceLog??=[];save.flags??={};save.tasks??={};if(save.storyVersion!==3){for(const k of Object.keys(save.flags))if(k.startsWith("seen_"))delete save.flags[k];delete save.flags.ending;save.choices={};save.choiceLog=[];for(const k of Object.keys(TASKS))save.tasks[k]="";save.storyVersion=3}for(const k of Object.keys(TASKS))save.tasks[k]??="";return save}
function cond(save,c){if(!c)return true;if(c.flag)return c.equals===undefined?!!save.flags[c.flag]:!!save.flags[c.flag]===c.equals;if(c.choice)return save.choices[c.choice]===c.equals;if(c.task)return save.tasks[c.task]===c.equals;return true}
export function canShow(save,node){return (node.conditions||[]).every(c=>cond(save,c))}
export function markTask(save,id,status){if(TASKS[id])save.tasks[id]=status}
export function applyChoice(save,node,ch){const s=ch.set||{};if(s.choices)Object.assign(save.choices,s.choices);if(s.flags)Object.assign(save.flags,s.flags);if(s.task)for(const[k,v]of Object.entries(s.task))markTask(save,k,v);if(s.ending)save.flags.ending=s.ending;save.choiceLog.push({node:node.id,choice:ch.id,at:Date.now()});return s.ending||null}
export function nodesAtWave(save,wave){return Object.values(STORY).filter(n=>n.wave===wave&&canShow(save,n))}
export function getEnding(save,wave){if(save.flags.ending)return save.flags.ending;if(wave<30)return null;return"truth"}
