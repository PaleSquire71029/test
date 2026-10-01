const choice=(id,label,set={},conditions=[])=>({id,label,...(conditions.length?{conditions}:{}),set});

export const TASKS={
 signal:{title:"追踪异常信号",desc:"确认这场事故究竟是突然发生，还是早已被人看见。",steps:{start:"未开始",active:"调查中",done:"已确认"}},
 aster:{title:"Aster的证词",desc:"判断一份提前十七分钟出现的事故记录是否值得相信。",steps:{active:"等待决定",done:"已决定"}},
 mira:{title:"Mira的警告",desc:"追查被从地图和公开记录中删除的第七码头。",steps:{active:"等待调查",done:"已决定"}},
 archive:{title:"保存事故证据",desc:"在真相尚未完整时，保留原始记录，而不是替它下结论。",steps:{active:"等待证据",done:"已保存"}},
 core:{title:"CORE接入协议",desc:"决定是否读取一段可能属于逝者、也可能属于自己的记忆。",steps:{active:"等待接入",done:"已接入"}},
 responsibility:{title:"责任链",desc:"查清事故发生后，谁修改了记录、谁保持沉默，以及为什么。",steps:{active:"调查中",done:"已确认"}},
 protocol:{title:"ECHO PROTOCOL",desc:"理解两个地区的记录为何被连接，并决定是否进入未知地区。",steps:{active:"等待最终记录",done:"已完成"}},
 region2:{title:"进入镜原",desc:"追查灰潮湾事故为何会出现在另一个地区的风险系统里。",steps:{active:"调查中",done:"已完成"}},
 world:{title:"世界档案",desc:"确认ECHO究竟连接了多少地区，以及谁在维护这些协议。",steps:{active:"追踪中",done:"已发现"}}
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
 comm14:{id:"comm14",wave:14,speaker:"CORE",title:"最后一块拼图",text:"“灰潮湾的记录已经无法再被单独解释。”\\n\\n“43秒、提前十七分钟的时间戳、第七码头、林舟，以及你的选择，都指向同一个问题。”\\n\\n“但还有一份数据没有在这里产生。”\\n\\nCORE显示一组遥远坐标。\\n\\n“事故发生后，灰潮湾的风险数据被发送到了另一个地区。”\\n“那里没有港口，也没有断层。”\\n“那里的人相信，只要把世界变成足够清晰的数据，就能让下一场事故不再发生。”\\n\\n“你现在看到的不是答案。”\\n“是下一扇门。”",choices:[choice("cross_region","前往第二地区",{flags:{region2Unlocked:true},task:{protocol:"active",region2:"active"}})]},
 r2_16:{id:"r2_16",wave:16,speaker:"ECHO",title:"第二地区 · 镜原",text:"“灰潮湾之后，你第一次看见没有海的地平线。”\\n\\n远处是一座被白色高塔包围的城市。\\n\\n这里没有人谈论‘事故报告’。\\n他们使用另一个词：‘风险事件’。\\n\\n每个人都有一份持续更新的风险档案。\\n系统会告诉他们哪里安全、什么工作适合自己、什么时候应该离开某个区域。”\\n\\nECHO只留下一句：\\n“这里没有人删除你。”\\n“他们只会重新定义你。”",choices:[choice("enter_mirror","进入镜原城区",{flags:{mirrorEntered:true},task:{region2:"active"}})]},
 r2_17:{id:"r2_17",wave:17,speaker:"SERA",title:"白塔的标准答案",text:"“我是Sera，镜原公共风险署的记录员。”\\n\\n“你带来的灰潮湾档案，在这里已经被处理过三次。”\\n\\n“第一次，43秒被标记为低价值数据。”\\n“第二次，林舟被归类为‘高风险个体’。”\\n“第三次，事故被重新定义为‘可接受损失范围内的系统异常’。”\\n\\n她没有替系统辩护。\\n\\n“最可怕的不是有人撒谎。”\\n“是所有人都可以拿着一份真实的数据，最后得到一个没有人愿意负责的答案。”",choices:[choice("inspect_model","查看原始模型",{flags:{modelInspected:true},task:{region2:"active"}}),choice("challenge_standard","质疑标准答案",{flags:{standardChallenged:true},task:{region2:"active"}})]},
 r2_18:{id:"r2_18",wave:18,speaker:"SYSTEM",title:"七分钟之前",text:"镜原系统自动播放一段记录。\\n\\n“灰潮湾异常发生前七分钟，镜原已经收到风险预测。”\\n\\n预测准确率：68%。\\n置信度：不足以触发警报。\\n\\n系统没有做错任何一条规则。\\n\\n但如果提前七分钟知道那里可能出事的人，是你呢？\\n\\n你会把68%的不确定性变成一次警报，还是接受剩下32%的错误成本？\\n\\n现实从来不会把决定写成‘正确答案’。它只会把代价留给做决定的人。”",choices:[choice("alarm_anyway","以后遇到同类情况，宁愿多报一次",{flags:{riskAlarm:true}}),choice("follow_threshold","继续遵守阈值规则",{flags:{riskThreshold:true}})]},
 r2_19:{id:"r2_19",wave:19,speaker:"SERA",title:"没有被删除的人",text:"“你们那里把人从名单里删掉。”\\n\\n“镜原很少这么做。”\\n\\n她打开一份迁移名单。\\n\\n一个来自灰潮湾的幸存者仍然存在于系统里。\\n姓名、照片、医疗记录全部完整。\\n\\n只是他的职业资格被降低，居住区域被限制，信用等级被重新计算。\\n\\n‘没有人删除我。’他对Sera说。\\n‘但最后，哪里都不再需要我。’\\n\\n这一次，系统没有留下一个明显的坏人。”",choices:[choice("restore_access","恢复他的完整权限",{flags:{personRestored:true}}),choice("record_case","保存案例，不直接修改系统",{flags:{caseRecorded:true}})]},
 r2_20:{id:"r2_20",wave:20,speaker:"ECHO",title:"第二种沉默",text:"“灰潮湾的沉默，是删掉一部分。”\\n“镜原的沉默，是让剩下的部分看起来足够合理。”\\n\\n“一个社会不一定需要禁止人说话。”\\n“只要它决定什么信息值得被看见，什么信息会被淹没在无数正确的数据里。”\\n\\nECHO问：\\n“当所有数字都是真的，你还需要追问数字之外的人吗？”",choices:[choice("follow_people","继续追查人的经历",{flags:{peopleFirst:true}}),choice("follow_data","继续追查系统模型",{flags:{dataFirst:true}})]},
 r2_21:{id:"r2_21",wave:21,speaker:"SERA",title:"训练集",text:"“现在告诉你一个不该出现在这里的东西。”\\n\\nSera调出模型来源。\\n\\n其中一份训练集名称：\\n‘GRAYTIDE / INCIDENT-07’\\n\\n灰潮湾事故不是只被记录过。\\n它被用来训练镜原的风险系统。\\n\\n更奇怪的是，训练集里缺少了林舟的原始档案，也缺少那43秒。\\n\\n系统学会的不是完整事故。\\n系统学会的是一个被整理过的事故。”\\n\\n“如果机器只学习我们留下的版本，它最后学到的，到底是现实，还是我们对现实的筛选？”",choices:[choice("restore_training","要求加入原始记录",{flags:{trainingRestored:true},task:{world:"active"}}),choice("leave_training","暂不修改训练集，继续调查来源",{flags:{trainingSource:true},task:{world:"active"}})]},
 r2_22:{id:"r2_22",wave:22,speaker:"SYSTEM",title:"第三方维护者",text:"“协议维护权限：ECHO节点1、ECHO节点2。”\\n\\n你第一次看见一个无法解释的字段：\\n‘维护者：NODE-00’\\n\\n镜原不是ECHO的起点。\\n灰潮湾也不是。\\n\\n两个地区都只是节点。”\\n\\n系统随即删除字段显示权限。\\n\\n你只来得及看到一句：\\n‘NODE-00不属于任何已登记地区。’",choices:[choice("trace_node00","追踪NODE-00",{flags:{node00Traced:true},task:{world:"active"}}),choice("save_node00","只保存NODE-00记录",{flags:{node00Saved:true},task:{world:"active"}})]},
 r2_23:{id:"r2_23",wave:23,speaker:"SERA",title:"白塔之下",text:"“镜原最早的建筑不是白塔。”\\n\\nSera带你进入城市地下。\\n\\n这里有一座更老的服务器大厅。\\n墙上没有地区名称，只有连续编号：01、02、03……\\n\\n01对应灰潮湾。\\n02对应镜原。\\n03的位置被涂黑。\\n\\n“如果这些编号真的代表地区，”Sera说，“那我们从一开始就不是两个孤立的地方。”",choices:[choice("open_03","尝试读取03",{flags:{node03Opened:true},task:{world:"active"}}),choice("leave_03","保留03的存在，不强行打开",{flags:{node03Known:true},task:{world:"active"}})]},
 r2_24:{id:"r2_24",wave:24,speaker:"CORE",title:"两个地区，同一个问题",text:"CORE将两地记录并列。\\n\\n灰潮湾问：‘为了稳定，我们可以删除多少？’\\n镜原问：‘为了安全，我们可以交给系统多少？’\\n\\n答案都没有停留在制度里。\\n它们最终落在人身上。\\n\\n有人因为记录被抹去。\\n有人因为模型被重新定义。\\n有人因为相信效率而没有发出警报。\\n也有人知道问题，却认为自己没有资格改变它。\\n\\n这不是一个坏人造成的世界。\\n这是许多人一次次把判断交出去之后形成的世界。",choices:[choice("keep_both","保留两地全部矛盾",{flags:{twoRegionTruth:true},task:{world:"done"}})]},
 r2_25:{id:"r2_25",wave:25,speaker:"ECHO",title:"没有终点的地图",text:"地图第一次完整展开。\\n\\n灰潮湾：NODE-01。\\n镜原：NODE-02。\\n\\n其余区域全部显示为未知。\\n\\n但有三个信号正在同时闪烁。\\n\\n其中一个来自北方。\\n一个来自地下。\\n还有一个——来自地图之外。\\n\\n系统提示：\\n‘当前权限不足以确认其余地区是否仍然存在。’\\n\\n你突然明白：所谓‘世界’可能只是你目前有权限看到的部分。”",choices:[choice("continue_map","继续追踪未知信号",{flags:{worldMapSeen:true},task:{world:"done"}})]},
 r2_26:{id:"r2_26",wave:26,speaker:"SERA",title:"一个现实的问题",text:"“如果你知道一个系统会让大多数人更安全，却也会让少数人永远失去选择，你会不会关闭它？”\\n\\nSera没有等你的答案。\\n\\n“别急着回答。”\\n“现实里的问题很少允许你只付出一种代价。”\\n\\n“我们真正需要问的，也许不是‘系统有没有错’，而是：谁能监督它？谁能修改它？谁承担它判断错误的后果？”\\n\\n她把权限卡递给你。\\n\\n“从这里开始，你拿到的不是答案，是进入更深处的资格。”",choices:[choice("take_key","接受权限卡",{flags:{seraKey:true}}),choice("leave_key","拒绝额外权限，只保存记录",{flags:{seraRefusedKey:true}})]},
 r2_27:{id:"r2_27",wave:27,speaker:"SYSTEM",title:"NODE-00",text:"“访问成功。”\\n\\n屏幕只出现四个字：\\n‘维护者不存在。’\\n\\n下一行却自动出现：\\n‘如果你能看到这句话，说明你已经完成两个地区的交叉验证。’\\n\\n最后一行被迅速覆盖：\\n‘第三地区：准备唤醒。’\\n\\n你第一次确定，前面的事故从来不是故事的中心。\\n它只是某个更大系统留下的一次痕迹。",choices:[choice("record_message","保存这条信息",{flags:{thirdRegionHint:true},task:{world:"done"}})]},
 r2_28:{id:"r2_28",wave:28,speaker:"CORE",title:"世界档案的缺页",text:"“你现在拥有两个地区的原始记录。”\\n\\n“但世界档案不是由两个地区组成。”\\n\\nCORE显示一页被撕掉的目录：\\nNODE-03、NODE-04、NODE-05……\\n\\n名称全部缺失。\\n\\n唯一保留下来的不是地点，而是一句规则：\\n‘每个地区都必须完成一次记录校正，才能继续向下一地区开放。’\\n\\n“这不是旅程的终点。”\\n“甚至还不能称为真相。”",choices:[choice("accept_unknown","接受未知，继续向前",{flags:{unknownAccepted:true},task:{protocol:"active"}})]},
 r2_29:{id:"r2_29",wave:29,speaker:"ECHO",title:"终章之前",text:"“你在灰潮湾寻找一个被删除的人。”\\n“在镜原寻找一个被重新定义的人。”\\n\\n“现在你终于看见，两地真正共享的不是技术，而是一种习惯：把困难的判断交给某种更大的东西。”\\n\\n“灰潮湾交给了档案。”\\n“镜原交给了模型。”\\n“而你，也曾经把一部分判断交给过它们。”\\n\\n“明天你会去第三个节点。”\\n“但今晚，你必须先决定自己带什么离开。”",choices:[choice("carry_record","带走全部记录",{flags:{carryRecord:true},task:{protocol:"active"}})]},
 final:{id:"final",wave:30,speaker:"ECHO",title:"阶段终章 · 回声协议",text:"“现在，两个地区的记录第一次被放进同一个窗口。”\\n\\n灰潮湾的港口事故、43秒的缺口、林舟被删除的名字。\\n镜原的风险模型、七分钟前的预测、被系统重新定义的人。\\n以及你一路做出的选择。\\n\\n你终于看见它们之间真正的联系：\\n不是某一个人控制了所有事情。\\n而是一套又一套看似合理的系统，在不同地区承担了人们不愿独自承担的判断。\\n\\n有人用‘稳定’解释沉默。\\n有人用‘效率’解释删减。\\n有人用‘安全’解释限制。\\n有人用‘数据’解释一个人的命运。\\n\\n这些理由并不全是假的。\\n也正因为如此，它们才危险。\\n\\nECHO没有告诉你哪个地区正确。\\n它只让你看见一个现实问题：\\n当一个系统替我们决定什么值得记住、谁值得被相信、什么风险可以接受时，我们是否也把自己的责任一起交了出去？\\n\\n终端忽然亮起。\\n\\nNODE-01：已校正。\\nNODE-02：已校正。\\nNODE-03：等待唤醒。\\n\\n你以为自己完成了一次任务。\\n其实，你只是第一次看见这个世界的轮廓。\\n\\n屏幕最后留下：\\n‘下一地区：坐标隐藏。’",choices:[choice("accept_truth","保存两地完整记录",{ending:"truth",choices:{endingRoute:"phase1"},task:{protocol:"done"}})]}}
export function initStory(save){save.choices??={};save.choiceLog??=[];save.flags??={};save.tasks??={};for(const k of Object.keys(TASKS))save.tasks[k]??="";return save}
function cond(save,c){if(!c)return true;if(c.flag)return c.equals===undefined?!!save.flags[c.flag]:!!save.flags[c.flag]===c.equals;if(c.choice)return save.choices[c.choice]===c.equals;if(c.task)return save.tasks[c.task]===c.equals;return true}
export function canShow(save,node){return (node.conditions||[]).every(c=>cond(save,c))}
export function markTask(save,id,status){if(TASKS[id])save.tasks[id]=status}
export function applyChoice(save,node,ch){const s=ch.set||{};if(s.choices)Object.assign(save.choices,s.choices);if(s.flags)Object.assign(save.flags,s.flags);if(s.task)for(const[k,v]of Object.entries(s.task))markTask(save,k,v);if(s.ending)save.flags.ending=s.ending;save.choiceLog.push({node:node.id,choice:ch.id,at:Date.now()});return s.ending||null}
export function nodesAtWave(save,wave){return Object.values(STORY).filter(n=>n.wave===wave&&canShow(save,n))}
export function getEnding(save,wave){if(save.flags.ending)return save.flags.ending;if(wave<15)return null;return"truth"}
