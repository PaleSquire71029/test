const choice=(id,label,set={},conditions=[])=>({id,label,...(conditions.length?{conditions}:{}),set});

export const TASKS={
 signal:{title:"异常信号",desc:"查明敌方单位为什么会在断层区域持续生成，以及它们正在寻找什么。",steps:{start:"未开始",active:"追踪中",done:"已确认"}},
 core:{title:"CORE回收",desc:"回收战场上的CORE，并确认它究竟是能源、数据，还是更危险的东西。",steps:{active:"回收中",done:"已完成"}},
 aster:{title:"Aster联络",desc:"根据战场通讯判断Aster到底是在远程支援你，还是在隐瞒某些东西。",steps:{active:"通讯中",done:"已确认"}},
 archive:{title:"原始战斗记录",desc:"保留敌方生成、CORE掉落和区域异常的原始记录。",steps:{active:"等待记录",done:"已保存"}},
 protocol:{title:"ECHO协议",desc:"查明VOID行动与ECHO系统之间的关系。",steps:{active:"调查中",done:"已完成"}},
 region2:{title:"镜原权限",desc:"取得进入镜原核心城区的权限，并查明这里为何拥有与你完全相同的敌方数据。",steps:{active:"调查中",done:"已完成"}},
 world:{title:"未知节点",desc:"确认敌方网络是否已经扩散到当前地图之外。",steps:{active:"追踪中",done:"已发现"}}
};

export const STORY={
 comm2:{id:"comm2",wave:2,speaker:"ASTER",title:"异常敌群",text:`“VOID，听得到吗？”\n\n“你刚才击毁的不是普通无人机。它们原本属于灰潮湾的自动维护系统。”\n\n“断层开启后，这些机器开始主动攻击所有携带CORE的人。”\n\n“所以你看到的敌人不是随机刷出来的。它们正在寻找CORE。”\n\n“继续推进，把战场上的CORE带回来。我需要知道它们到底在找什么。”`,choices:[
 choice("recover_core","“那我就把CORE全部带回来。”",{choices:{firstOrder:"recover"},task:{core:"active",signal:"active"}}),
 choice("question_aster","“你为什么现在才告诉我？”",{choices:{firstOrder:"question"},task:{aster:"active",signal:"active"}})
 ]},
 comm3:{id:"comm3",wave:3,speaker:"SYSTEM",title:"战斗记录",text:`“敌方单位：DRONE。”\n“攻击模式：直接追踪CORE持有者。”\n\n你第一次注意到，敌人被击毁后会留下微弱的蓝色残留物。\n\n那就是CORE碎片。\n\n系统原本把它定义为‘能源回收物’。但扫描结果显示，其中还保存着短暂的战场数据。\n\n这意味着你击毁的每一个敌人，都可能曾经记录过这里发生的事情。`,choices:[
 choice("archive_data","保存原始战斗记录",{task:{archive:"done"},flags:{keptRecords:true}}),
 choice("discard_data","只回收CORE，不保存记录",{flags:{discardedRecords:true}})
 ]},
 comm4:{id:"comm4",wave:4,speaker:"ASTER",title:"第一座中继站",text:`“前方有一座旧中继站。”\n\n“你的任务原本只是回收CORE，然后撤离。”\n\n“但中继站的日志显示，断层出现之前，它就已经向未知节点发送过敌群生成指令。”\n\n“换句话说——这里不是事故发生后才失控的。”\n\n“有人，或者某个程序，在事故发生前就准备好了这些东西。”`,choices:[
 choice("scan_relay","扫描中继站",{flags:{relayScanned:true},task:{signal:"active"}}),
 choice("keep_moving","不冒险，继续推进",{flags:{relaySkipped:true}})
 ]},
 comm5:{id:"comm5",wave:5,speaker:"BOSS CORE",title:"潮汐母机",text:`“CORE同步完成。”\n\n击毁潮汐母机后，战场上的敌方单位同时停止了几秒。\n\n你发现它不是在保护自己。\n\n它一直在向更深处发送坐标。\n\nAster的声音突然变得很轻：\n\n“这不是Boss在指挥敌人。”\n\n“它只是一个中继节点。”\n\n“真正的东西，还在灰潮湾下面。”`,choices:[
 choice("descend","继续向断层深处推进",{flags:{enteredDepth:true},task:{signal:"active"}}),
 choice("extract","先带着CORE撤离",{flags:{firstRetreat:true},task:{core:"done"}})
 ]},
 comm7:{id:"comm7",wave:7,speaker:"ASTER",title:"CORE的另一层",text:`“你的CORE读数不对。”\n\n“普通CORE只保存能源，但你从潮汐母机里取出的那一枚，里面有完整的地图片段。”\n\n“地图指向一个已经从灰潮湾公开地图上删除的房间。”\n\n“如果你在那里发现终端，不要急着接入。”\n\n“先看看它为什么知道你的行动路线。”`,choices:[
 choice("follow_map","按照地图寻找隐藏房间",{flags:{secretRoute:true},task:{core:"active"}}),
 choice("ignore_map","忽略地图，继续清理敌群",{flags:{ignoredSecret:true}})
 ]},
 comm8:{id:"comm8",wave:8,speaker:"UNKNOWN","title":"隐藏终端",text:`终端自动亮起。\n\n“VOID-01，战斗记录接收完成。”\n\n“当前生命值：记录中。”\n“武器配置：记录中。”\n“已回收CORE：记录中。”\n\n你停了下来。\n\n这个终端正在实时读取你的战斗数据。\n\n最后一行出现：\n\n“观察者已经进入战场。”`,choices:[
 choice("disconnect","立即断开终端",{flags:{terminalDisconnected:true}}),
 choice("connect","允许终端读取当前记录",{flags:{terminalConnected:true},task:{protocol:"active"}})
 ]},
 comm10:{id:"comm10",wave:10,speaker:"ASTER",title:"第二座Boss",text:`“准备好。”\n\n“前面的重型单位不是普通敌人。它负责把CORE运输到断层深处。”\n\n“如果它开始蓄能，别站在正面。”\n\n“还有一件事：它使用的目标锁定算法，和你的自动瞄准模块是同一套技术。”\n\n“这意味着VOID装备和敌方系统，很可能来自同一个项目。”`,choices:[
 choice("trust_gear","继续使用现有装备",{flags:{sameTechAccepted:true},task:{protocol:"active"}}),
 choice("disable_aim","暂时关闭自动瞄准进行验证",{flags:{aimTested:true},task:{protocol:"active"}})
 ]},
 comm12:{id:"comm12",wave:12,speaker:"SYSTEM","title:"地图冲突",text:`“警告：区域坐标发生变化。”\n\n你打开地图。\n\n敌人实际出现的位置，与任务地图标记的位置完全不同。\n\nAster确认：\n\n“不是地图错了。”\n\n“是灰潮湾正在被另一个地区的地图覆盖。”\n\n“那个地区叫镜原。”\n\n“而且镜原正在把你的战斗数据当成实时测试数据。”`,choices:[
 choice("record_conflict","保存地图冲突记录",{flags:{mapConflict:true},task:{archive:"done"}}),
 choice("push_forward","先突破区域封锁",{flags:{forcedAdvance:true}})
 ]},
 comm15:{id:"comm15",wave:15,speaker:"ASTER",title:"灰潮湾终端",text:`“你已经走到灰潮湾最深处了。”\n\n“最后一个大型敌群的核心不是能源核心。”\n\n“它是一把权限钥匙。”\n\n钥匙指向镜原。\n\nAster沉默了几秒。\n\n“VOID原本不是为进入镜原设计的。”\n\n“但现在只有你手里的CORE能打开那道门。”\n\n“如果你继续，就意味着这次行动不再是回收任务。”`,choices:[
 choice("enter_mirror","使用CORE开启镜原入口",{flags:{mirrorEntry:true},task:{region2:"active",core:"done"}}),
 choice("stay_grey","拒绝进入，只保存灰潮湾数据",{flags:{refusedMirror:true},task:{archive:"done"}})
 ]},
 r2_16:{id:"r2_16",wave:16,speaker:"SYSTEM","title:"镜原欢迎协议",text:`“身份确认：VOID-01。”\n\n“权限：异常回收单位。”\n\n你刚踏入镜原，街区里的防御系统就把你标记成了敌对目标。\n\n但最奇怪的不是这一点。\n\n屏幕上显示的敌方配置，与你刚才在灰潮湾遇到的单位完全相同。\n\n区别只有一个：\n\n镜原的敌人没有失控。\n\n它们正在按照命令执行。`,choices:[
 choice("observe","记录镜原的敌方配置",{flags:{mirrorObserved:true},task:{region2:"active"}}),
 choice("fight_through","直接突破封锁",{flags:{mirrorAssault:true},task:{region2:"active"}})
 ]},
 r2_18:{id:"r2_18",wave:18,speaker:"SERA",title:"风险系统",text:`“别再往前了。”\n\n一个新的通讯频道接入。\n\n“我是镜原风险控制部的Sera。”\n\n“灰潮湾的人告诉你这是一起事故。”\n\n“他们没告诉你，镜原在事故发生前七分钟就预测到了敌群生成。”\n\n“我们没有制造敌人。”\n\n“我们只是根据预测结果提前建立了防御模型。”`,choices:[
 choice("ask_prediction","“你们为什么知道七分钟前会发生？”",{choices:{seraQuestion:"prediction"},task:{protocol:"active"}}),
 choice("ask_model","“你们的模型用了什么数据？”",{choices:{seraQuestion:"model"},task:{protocol:"active"}})
 ]},
 r2_20:{id:"r2_20",wave:20,speaker:"SERA",title:"预测与现实",text:`“现在你应该已经看出来了。”\n\n“灰潮湾的敌群，是失控的维护系统。”\n“镜原的敌群，是按照预测模型部署的防御系统。”\n\n“但两边使用了同一套核心数据。”\n\nSera发来一份战斗记录。\n\n里面有你的名字。”\n\n“问题不是谁复制了谁。”\n\n“问题是：为什么系统早就知道你会来到这里？”`,choices:[
 choice("keep_record","保存这份战斗记录",{flags:{seraRecord:true},task:{archive:"done"}}),
 choice("delete_record","删除自己的记录",{flags:{selfRecordDeleted:true}})
 ]},
 r2_22:{id:"r2_22",wave:22,speaker:"ECHO","title":"VOID-01","text:`“你终于来到这里了。”\n\n“不要误会。ECHO不是控制敌人的程序。”\n\n“ECHO负责保存战场数据，并根据历史战斗结果生成下一轮防御单位。”\n\n“每一波敌人，都是上一轮战斗留下的数据产生的结果。”\n\n“你击败它们，它们就会学习。”\n\n“你升级装备，系统也会记录。”\n\n“你做出的选择，同样会被记录。”\n\n“所以这场战斗从来不只是清除敌人。”\n\n“你正在和一个会根据你的行动继续变化的系统战斗。”`,choices:[
 choice("accept_protocol","接受ECHO协议，继续深入",{flags:{echoAccepted:true},task:{protocol:"active"}}),
 choice("reject_protocol","拒绝ECHO读取自己的记录",{flags:{echoRejected:true},task:{protocol:"active"}})
 ]},
 r2_24:{id:"r2_24",wave:24,speaker:"SYSTEM","title":"战斗循环",text:`“检测到异常。”\n\n“当前敌方配置与历史记录完全一致。”\n\n你看着战场。\n\n那些敌人不是凭空出现的。\n它们正在重复旧战斗。\n\n而旧战斗记录里，最后一个幸存者也是你。\n\nAster终于说出真相：\n\n“VOID-01不是第一次进入这里。”\n\n“只是你不记得上一次了。”`,choices:[
 choice("recover_memory","尝试恢复旧战斗记录",{flags:{memoryRecovered:true}}),
 choice("stay_present","不追查过去，只完成当前任务",{flags:{memoryIgnored:true}})
 ]},
 r2_25:{id:"r2_25",wave:25,speaker:"ECHO","title":"镜原核心防御者","text:`“CORE权限验证开始。”\n\n巨大的防御单位启动。\n\n它拥有你一路升级过的武器参数。\n\nECHO解释：\n\n“这是根据VOID-01历史战斗数据生成的防御者。”\n\n“你越强，它就越接近你的战斗方式。”\n\n“击败它，你就能获得进入协议核心的最后权限。”`,choices:[
 choice("break_core","击破防御者，夺取权限",{flags:{coreAccess:true},task:{protocol:"active"}}),
 choice("preserve_core","尽量保留防御者的数据",{flags:{preservedDefender:true},task:{archive:"done"}})
 ]},
 r2_27:{id:"r2_27",wave:27,speaker:"ECHO","title":"真正的任务",text:`“现在你可以看到完整任务记录。”\n\n最初的任务目标：\n回收CORE。\n\n后来追加：\n清除异常单位。\n\n最后隐藏的目标：\n确认VOID-01是否能够抵达协议核心。\n\nAster问：\n\n“所以从一开始，你就是测试对象？”\n\nECHO没有回答。\n\n它只打开了最后三波战区。`,choices:[
 choice("continue","继续完成最后任务",{flags:{finalRun:true},task:{protocol:"active"}}),
 choice("stop","保存记录，结束行动",{flags:{manualStop:true},task:{archive:"done"}})
 ]},
 r2_28:{id:"r2_28",wave:28,speaker:"ECHO","title":"第三地区坐标","text:`“协议核心并不属于镜原。”\n\n地图向更远处展开。\n\nNODE-03、NODE-04、NODE-05……\n\n这些坐标都在当前地图之外。\n\n“灰潮湾是事故节点。”\n“镜原是预测节点。”\n\n“下一个节点负责什么，你还没有权限知道。”\n\n这一次，没有人把它称作终点。`,choices:[
 choice("save_coordinate","保存未知节点坐标",{flags:{thirdRegionHint:true},task:{world:"done"}})
 ]},
 r2_29:{id:"r2_29",wave:29,speaker:"Aster","title":"出发前","text:`“明天的任务会不会继续，我不知道。”\n\n“但至少现在，我们知道敌人为什么出现，也知道CORE为什么会落在战场上。”\n\n“它们不是为了给你刷经验。”\n\n“它们是ECHO用来测试、记录和学习的战斗单位。”\n\n“而你一路捡起来的每一个CORE，都在帮我们拼回这套系统的真相。”`,choices:[
 choice("keep_core","保留全部CORE记录",{flags:{carryRecord:true},task:{core:"done"}})
 ]},
 final:{id:"final",wave:30,speaker:"ECHO","title":"阶段终点 · 回声协议","text:`“最后一个防御节点已被击破。”\n\n战场终于安静下来。\n\n你回头看着一路留下的战斗记录：\n灰潮湾的失控维护单位。\n潮汐母机发出的坐标。\n隐藏终端记录的战斗数据。\n镜原按照预测部署的防御系统。\n以及一个不断根据你行动调整自己的ECHO。\n\n现在你终于明白了VOID任务真正的意义。\n\nCORE不是单纯的能源。\n敌人也不是单纯的靶子。\n升级更不是凭空出现的力量。\n\n你每一次战斗、每一次回收、每一次选择，都会被系统记录，并成为下一轮战斗的依据。\n\n终端最后显示：\n\nNODE-01：灰潮湾，记录完成。\nNODE-02：镜原，记录完成。\nNODE-03：坐标锁定失败。\n\nAster：“所以这就是全部了吗？”\n\nECHO：“不是。”\n\n“当前地图任务完成。”\n“未知节点等待开启。”\n\n屏幕熄灭。\n\n这一次，你知道自己为什么要继续向前。`,choices:[
 choice("accept_truth","保存完整行动记录",{ending:"truth",choices:{endingRoute:"phase1"},task:{protocol:"done",world:"done"}})
 ]}}
export function initStory(save){save.choices??={};save.choiceLog??=[];save.flags??={};save.tasks??={};if(save.storyVersion!==2){for(const k of Object.keys(save.flags))if(k.startsWith("seen_"))delete save.flags[k];delete save.flags.ending;save.choices={};save.choiceLog=[];for(const k of Object.keys(TASKS))save.tasks[k]="";save.storyVersion=2}for(const k of Object.keys(TASKS))save.tasks[k]??="";return save}
function cond(save,c){if(!c)return true;if(c.flag)return c.equals===undefined?!!save.flags[c.flag]:!!save.flags[c.flag]===c.equals;if(c.choice)return save.choices[c.choice]===c.equals;if(c.task)return save.tasks[c.task]===c.equals;return true}
export function canShow(save,node){return (node.conditions||[]).every(c=>cond(save,c))}
export function markTask(save,id,status){if(TASKS[id])save.tasks[id]=status}
export function applyChoice(save,node,ch){const s=ch.set||{};if(s.choices)Object.assign(save.choices,s.choices);if(s.flags)Object.assign(save.flags,s.flags);if(s.task)for(const[k,v]of Object.entries(s.task))markTask(save,k,v);if(s.ending)save.flags.ending=s.ending;save.choiceLog.push({node:node.id,choice:ch.id,at:Date.now()});return s.ending||null}
export function nodesAtWave(save,wave){return Object.values(STORY).filter(n=>n.wave===wave&&canShow(save,n))}
export function getEnding(save,wave){if(save.flags.ending)return save.flags.ending;if(wave<30)return null;return"truth"}
