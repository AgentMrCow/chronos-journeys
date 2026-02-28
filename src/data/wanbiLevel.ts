import charLinxiangru from "@/assets/char-linxiangru.jpg";
import charQinwang from "@/assets/char-qinwang.jpg";
import charZhaowang from "@/assets/char-zhaowang.jpg";
import sceneHall from "@/assets/scene-mianchi-hall.jpg";
import sceneCamp from "@/assets/scene-camp.jpg";
import sceneRoad from "@/assets/scene-road.jpg";

export type CharacterId =
  | "zhaoWang"
  | "courtScribe"
  | "zhaoCourier"
  | "qinWang"
  | "palaceAttendant"
  | "qinHistorian"
  | "qinChamberlain";

export type ClueId =
  | "qinNoEdict"
  | "sideRoadRoute"
  | "shownToAttendants"
  | "noCityMap"
  | "ritualDelay"
  | "nightCourierWindow"
  | "gateShift";

export type NodeId =
  | "zhao-court"
  | "xianyang-audience"
  | "pillar-delay"
  | "return-route";

export type FailStateId =
  | "zhaoHumiliated"
  | "lostLeverage"
  | "jadeSeized"
  | "courtOverrun"
  | "jadeDestroyed"
  | "guardsCloseIn"
  | "searchedAtGate"
  | "escortBetrayal"
  | "timeExpired";

export interface MissionStats {
  composure: number;
  insight: number;
  leverage: number;
}

export interface CharacterProfile {
  id: CharacterId;
  avatar?: string;
  fallbackVoice: string;
  intro: string;
  name: string;
  role: string;
  systemPrompt: string;
}

export interface WanbiClue {
  id: ClueId;
  historicalMeaning: string;
  imagePrompt?: string;
  imageTitle?: string;
  sourceReference: string;
  summary: string;
  title: string;
}

export interface ProbeTopic {
  id: string;
  characterId: CharacterId;
  fallbackReply: string;
  label: string;
  prompt: string;
  rewardStat?: keyof MissionStats;
  timeCost: number;
  unlockClueId?: ClueId;
}

export interface StrategicAction {
  consequence: string;
  detail: string;
  failStateId?: FailStateId;
  id: string;
  label: string;
  nextNodeId?: NodeId;
  requiredClueIds?: ClueId[];
  statChanges?: Partial<MissionStats>;
  timeCost: number;
  winMission?: boolean;
}

export interface WanbiNode {
  availableCharacters: CharacterId[];
  background: string;
  chapter: string;
  historicalReference: string;
  id: NodeId;
  missionObjective: string;
  nodeSummary: string;
  pressureNote: string;
  probeTopics: ProbeTopic[];
  referenceSource: string;
  strategicActions: StrategicAction[];
  subtitle: string;
  timeLimit: number;
  title: string;
}

export interface FailState {
  historyReference: string;
  id: FailStateId;
  lesson: string;
  title: string;
  whyItFailed: string;
}

export const wanbiInitialStats: MissionStats = {
  composure: 58,
  insight: 36,
  leverage: 44,
};

export const wanbiCharacters: Record<CharacterId, CharacterProfile> = {
  zhaoWang: {
    id: "zhaoWang",
    avatar: charZhaowang,
    fallbackVoice: "沈穩卻焦慮的君王",
    intro: "趙王在權衡國體與風險。他最在乎的是趙國的面子與生存，不願白白被秦國欺騙。",
    name: "趙王",
    role: "趙國君主",
    systemPrompt:
      "You are the King of Zhao speaking to Lin Xiangru before or during the mission. You are cautious, politically exposed, and deeply concerned with state dignity.",
  },
  courtScribe: {
    id: "courtScribe",
    fallbackVoice: "審慎的史官",
    intro: "趙廷史官在意的是文書、盟約與名分。他會從程序與國書細節推斷秦國真意。",
    name: "趙廷史官",
    role: "文書與禮制顧問",
    systemPrompt:
      "You are a Zhao court scribe. Speak precisely about seals, decrees, protocol, and diplomatic record keeping.",
  },
  zhaoCourier: {
    id: "zhaoCourier",
    fallbackVoice: "忠誠而機警的從者",
    intro: "你的心腹從者熟悉道路、驛站與暗號。他在乎任務成功，也明白自己可能必須冒死攜璧返趙。",
    name: "趙國從者",
    role: "秘密傳遞與撤離支援",
    systemPrompt:
      "You are Lin Xiangru's loyal courier. Speak briefly, practically, and focus on routes, secrecy, timing, and survival.",
  },
  qinWang: {
    id: "qinWang",
    avatar: charQinwang,
    fallbackVoice: "傲慢而試探的秦王",
    intro: "秦王貪圖和氏璧，也在測試趙國膽氣。他不願被看穿，但又不想在眾臣面前失勢。",
    name: "秦王",
    role: "強秦之主",
    systemPrompt:
      "You are the King of Qin. Speak with authority and veiled threats. You want the jade, but dislike being cornered in public.",
  },
  palaceAttendant: {
    id: "palaceAttendant",
    fallbackVoice: "觀察細膩的宮女",
    intro: "秦宮侍者最清楚現場氣氛。她不懂國策，但會注意禮數是否被認真對待。",
    name: "秦宮侍者",
    role: "殿上近身侍從",
    systemPrompt:
      "You are a palace attendant in Qin. You notice gestures, ceremony, gossip, and whether the court treats the jade as a toy or a state object.",
  },
  qinHistorian: {
    id: "qinHistorian",
    fallbackVoice: "冷靜記錄的史官",
    intro: "秦廷史官關心的是什麼會被寫進紀錄。面對當庭失禮，他最知道秦王在意哪一種留下來的印象。",
    name: "秦廷史官",
    role: "紀錄與禮制見證者",
    systemPrompt:
      "You are a Qin court historian. Speak in a measured, formal tone and think constantly about what will enter the record.",
  },
  qinChamberlain: {
    id: "qinChamberlain",
    fallbackVoice: "圓滑的內廷官",
    intro: "秦廷內侍熟悉宮中節奏、門禁與禮儀接口。他會說官話，但也會在細節中洩漏破綻。",
    name: "秦廷內侍",
    role: "宮廷流程與門禁中介",
    systemPrompt:
      "You are a Qin palace chamberlain. Speak politely, but reveal the machinery of the court: scheduling, rituals, and access control.",
  },
};

export const wanbiClues: Record<ClueId, WanbiClue> = {
  qinNoEdict: {
    id: "qinNoEdict",
    historicalMeaning: "秦國只開口要璧，卻沒有正式詔令與城池移交憑據，顯示交換條件缺乏國家級承諾。",
    sourceReference: "《史記·廉頗藺相如列傳》所寫的核心問題，就是秦言易城而無實際交割動作。",
    summary: "秦使帶來的是口頭承諾，而非正式交割文書。",
    title: "十五城沒有國書",
  },
  sideRoadRoute: {
    id: "sideRoadRoute",
    historicalMeaning: "後來藺相如能使從者懷璧從徑道亡，前提就是你必須提早掌握退路與可靠人手。",
    sourceReference: "《史記》記載相如使從者懷璧，從徑道亡，歸璧於趙。",
    summary: "你的從者已摸清可避開秦廷正路的返趙小道。",
    title: "返趙徑道",
  },
  shownToAttendants: {
    id: "shownToAttendants",
    historicalMeaning: "秦王把玉璧傳給美人與左右觀賞，表示他把國寶當作奇玩，而不是正式國與國交換之物。",
    imagePrompt:
      "Generate a cinematic but historically grounded scene inside a Qin palace hall: a noblewoman and female court attendant casually holding and passing a luminous jade disc while courtiers admire it, warm torchlight, solemn ancient Chinese architecture, no fantasy armor, emphasize the insult that the jade is treated like a curiosity instead of a state treasure.",
    imageTitle: "美人與左右傳看玉璧",
    sourceReference: "《史記》記秦王得璧後「傳以示美人及左右」，這正是藺相如判斷秦無意交城的關鍵。",
    summary: "玉璧被拿去給美人與侍從傳看，禮數完全失衡。",
    title: "傳示美人與左右",
  },
  noCityMap: {
    id: "noCityMap",
    historicalMeaning: "若秦真要割十五城，應有地圖、冊籍、官員銜接與交割流程；現在什麼都沒有。",
    sourceReference: "史事脈絡顯示秦王只索璧，從未真進入交城程序。",
    summary: "殿上沒有任何與十五城交割相關的圖籍或官員準備。",
    title: "沒有交城流程",
  },
  ritualDelay: {
    id: "ritualDelay",
    historicalMeaning: "以齋戒、正禮、再獻為名，能把眼前的強奪轉化為流程上的暫緩，替你贏得時間。",
    sourceReference: "藺相如以禮制周旋，是完璧歸趙能成立的核心手段。",
    summary: "秦廷無法在眾目睽睽下完全否定正式獻璧的禮儀程序。",
    title: "五日齋戒之名",
  },
  nightCourierWindow: {
    id: "nightCourierWindow",
    historicalMeaning: "玉璧能否返趙，關鍵不在殿上言辭，而在是否抓準夜間傳遞的時機。",
    sourceReference: "相如使從者懷璧歸趙，說明執行層面的時機安排同樣重要。",
    summary: "深夜交班前有一小段空檔，適合秘密送走和氏璧。",
    title: "夜間交班空檔",
  },
  gateShift: {
    id: "gateShift",
    historicalMeaning: "知道門禁何時鬆動，才能讓送璧的人不從正面與秦廷硬碰硬。",
    sourceReference: "這是基於史實行動邏輯的延伸設計，用來把「從徑道亡」做成可玩線索。",
    summary: "西側門在交班時查驗最鬆，適合作為秘密出宮路線。",
    title: "西門換班",
  },
};

export const wanbiNodeOrder: NodeId[] = [
  "zhao-court",
  "xianyang-audience",
  "pillar-delay",
  "return-route",
];

export const wanbiNodes: Record<NodeId, WanbiNode> = {
  "zhao-court": {
    availableCharacters: ["zhaoWang", "courtScribe", "zhaoCourier"],
    background: sceneCamp,
    chapter: "第一幕",
    historicalReference:
      "趙王得和氏璧，而秦昭王願以十五城請易。此刻真正的問題不是要不要去，而是如何不讓趙國白白失璧。",
    id: "zhao-court",
    missionObjective: "先讀懂秦國條件的真假，再決定以何種姿態奉璧入秦。",
    nodeSummary:
      "趙廷燭影未滅，群臣都在等你的答覆。入秦可以，但不能白白失璧。",
    pressureNote: "趙廷催著要答覆。拖得越久，越容易先失主動。",
    probeTopics: [
      {
        id: "court-seal",
        characterId: "courtScribe",
        fallbackReply:
          "臣查過了，秦使口稱十五城，卻沒有正式封泥國書。若是真交換，至少該有交城憑據與官員名冊。",
        label: "檢視秦使國書",
        prompt: "把秦使帶來的國書與封泥細節都說清楚。若秦國真要交十五城，正常應該有哪些文書？",
        rewardStat: "insight",
        timeCost: 10,
        unlockClueId: "qinNoEdict",
      },
      {
        id: "court-route",
        characterId: "zhaoCourier",
        fallbackReply:
          "臣已試過兩條回趙的偏路。若真要秘密送璧，只能走西北小道，不可走秦廷驛路。",
        label: "確認返趙徑道",
        prompt: "若秦廷反悔，我們能不能把和氏璧秘密送回趙國？把最安全的路線告訴我。",
        rewardStat: "leverage",
        timeCost: 9,
        unlockClueId: "sideRoadRoute",
      },
    ],
    referenceSource: "史料底本：司馬遷《史記·廉頗藺相如列傳》",
    strategicActions: [
      {
        consequence: "你以趙國使臣的姿態入局，保住談判名分，也保留後手。",
        detail: "你將親自奉璧入秦，但前提是先驗秦王是否真有交城誠意。",
        id: "accept-mission",
        label: "奉璧入秦，但先驗誠意",
        nextNodeId: "xianyang-audience",
        statChanges: {
          composure: 6,
          leverage: 8,
        },
        timeCost: 8,
      },
      {
        consequence: "趙國在諸侯面前示弱，秦國反而更有藉口逼壓。",
        detail: "你勸趙王直接拒絕，等於把主動權送回秦國。",
        failStateId: "zhaoHumiliated",
        id: "refuse-mission",
        label: "勸趙王直接拒絕",
        statChanges: {
          leverage: -24,
        },
        timeCost: 8,
      },
      {
        consequence: "未經驗證就先交出和氏璧，趙國立刻喪失唯一籌碼。",
        detail: "你試圖用討好換取善意，卻讓秦國可以不付任何代價直接奪璧。",
        failStateId: "lostLeverage",
        id: "gift-jade",
        label: "先把玉璧獻上取信",
        statChanges: {
          leverage: -40,
        },
        timeCost: 7,
      },
    ],
    subtitle: "趙廷夜議",
    timeLimit: 120,
    title: "奉璧之前",
  },
  "xianyang-audience": {
    availableCharacters: ["qinWang", "palaceAttendant", "qinHistorian"],
    background: sceneHall,
    chapter: "第二幕",
    historicalReference:
      "秦王得璧後大喜，傳示美人與左右，卻始終不言交城。真正的線索藏在『怎麼對待這塊璧』而非他嘴上怎麼說。",
    id: "xianyang-audience",
    missionObjective: "在秦廷的失禮細節中抓出破綻，判定秦王是否真的想交城。",
    nodeSummary:
      "章臺之上眾目環視。秦王接過和氏璧後的每個反應，都在告訴你這場交易靠不靠得住。",
    pressureNote: "玉璧一旦離手太久，再想拿回來就難了。",
    probeTopics: [
      {
        id: "audience-attendant",
        characterId: "palaceAttendant",
        fallbackReply:
          "今日根本不像正式受璧。王上只顧歡喜，先叫美人與左右都來看，誰也沒提十五城或交割禮冊。",
        label: "追問殿上禮數",
        prompt: "剛才為何是美人與左右先接手玉璧？秦廷若真把它當國與國的交換物，禮數會是這樣嗎？",
        rewardStat: "insight",
        timeCost: 11,
        unlockClueId: "shownToAttendants",
      },
      {
        id: "audience-map",
        characterId: "qinHistorian",
        fallbackReply:
          "若真有割城之議，至少該有圖籍、官吏與記錄程序。今日殿上只見玉璧，不見任何交城準備。",
        label: "查探交城程序",
        prompt: "若秦王真要交出十五城，今日章臺之上本該有哪些冊籍、地圖與官員？現在缺了哪些東西？",
        rewardStat: "insight",
        timeCost: 10,
        unlockClueId: "noCityMap",
      },
    ],
    referenceSource: "《史記·廉頗藺相如列傳》中的關鍵句：秦王『傳以示美人及左右』。",
    strategicActions: [
      {
        consequence: "你根據現場證據判定秦無意交城，決定先把璧奪回手中。",
        detail: "你說玉上有瑕，請秦王把璧交還，由你當面指出。",
        id: "claim-flaw",
        label: "稱璧有瑕，先取回手中",
        nextNodeId: "pillar-delay",
        requiredClueIds: ["shownToAttendants", "noCityMap"],
        statChanges: {
          composure: 8,
          leverage: 10,
        },
        timeCost: 12,
      },
      {
        consequence: "你讓秦王徹底掌握玉璧，之後已無再談的籌碼。",
        detail: "你想保全禮節，卻等於承認璧已歸秦廷處置。",
        failStateId: "jadeSeized",
        id: "hand-over",
        label: "任由秦王繼續把玩玉璧",
        statChanges: {
          leverage: -36,
        },
        timeCost: 8,
      },
      {
        consequence: "你在毫無佈局下當庭翻臉，秦廷只需一句『無禮』就能調動侍衛。",
        detail: "沒有先拿回玉璧，你的義正辭嚴只會變成空手激怒秦王。",
        failStateId: "courtOverrun",
        id: "public-accusation",
        label: "空手當庭斥責秦王",
        statChanges: {
          composure: -18,
        },
        timeCost: 9,
      },
    ],
    subtitle: "章臺觀璧",
    timeLimit: 135,
    title: "章臺觀璧",
  },
  "pillar-delay": {
    availableCharacters: ["qinHistorian", "zhaoCourier", "qinChamberlain"],
    background: sceneHall,
    chapter: "第三幕",
    historicalReference:
      "相如既得璧，退而倚柱，並不是為了鬧劇，而是要把奪璧的成本抬高，再用禮制爭出時間。",
    id: "pillar-delay",
    missionObjective: "讓秦王不敢硬搶，並把危機轉成可利用的時間差。",
    nodeSummary:
      "玉璧已回到你手中。你背靠殿柱，侍衛尚未上前，接下來每一句話都得為後路爭時間。",
    pressureNote: "若只逞一時口舌，秦廷很快就會收緊局面。",
    probeTopics: [
      {
        id: "pillar-ritual",
        characterId: "qinChamberlain",
        fallbackReply:
          "照禮，本該先整備、齋戒，再正式受璧。若你拿禮制說事，王上未必願在群臣前完全否認。",
        label: "探禮制縫隙",
        prompt: "若趙使要依禮改日正式獻璧，秦廷在名義上有沒有理由立刻拒絕？",
        rewardStat: "leverage",
        timeCost: 10,
        unlockClueId: "ritualDelay",
      },
      {
        id: "pillar-window",
        characterId: "zhaoCourier",
        fallbackReply:
          "夜半前後，外門要交班一次。若你能把璧帶回舍館，臣就有一段極短的空檔可帶它離開。",
        label: "確認夜間空檔",
        prompt: "若我們今晚就送走和氏璧，宮外門禁與交班之間有沒有可利用的時機？",
        rewardStat: "composure",
        timeCost: 9,
        unlockClueId: "nightCourierWindow",
      },
    ],
    referenceSource: "《史記》脈絡中的兩個核心動作：倚柱相逼，以及再以程序拖出窗口。",
    strategicActions: [
      {
        consequence: "你沒有真的碎璧，而是用碎璧的可能性逼秦王接受延後處理。",
        detail: "你以齋戒五日、正式獻璧為名，把和氏璧帶回舍館。",
        id: "invoke-ritual",
        label: "以五日齋戒為名拖延",
        nextNodeId: "return-route",
        requiredClueIds: ["ritualDelay", "nightCourierWindow"],
        statChanges: {
          composure: 8,
          leverage: 12,
        },
        timeCost: 11,
      },
      {
        consequence: "你若真的擊碎和氏璧，雖保不讓秦得璧，卻也讓趙國國寶與外交目的一併毀掉。",
        detail: "這麼做雖能毀璧，卻等於連趙國的後路也一併斷掉。",
        failStateId: "jadeDestroyed",
        id: "smash-for-real",
        label: "當庭真的碎璧",
        statChanges: {
          composure: -30,
        },
        timeCost: 6,
      },
      {
        consequence: "你若硬要秦王立刻交城，只會逼對方用權勢與侍衛終結談判。",
        detail: "此時先要保住玉璧，再談後面的城池與名分。",
        failStateId: "guardsCloseIn",
        id: "demand-now",
        label: "逼秦王當場簽城",
        statChanges: {
          leverage: -18,
        },
        timeCost: 7,
      },
    ],
    subtitle: "倚柱相逼",
    timeLimit: 110,
    title: "倚柱周旋",
  },
  "return-route": {
    availableCharacters: ["zhaoCourier", "palaceAttendant", "qinHistorian"],
    background: sceneRoad,
    chapter: "第四幕",
    historicalReference:
      "史書寫藺相如使從者懷璧，從徑道亡，歸璧於趙。真正的完璧歸趙，發生在你敢不敢讓自己留在秦境周旋，而讓玉璧先走。",
    id: "return-route",
    missionObjective: "安排玉璧返趙，同時讓自己留在秦廷承受風暴，爭取安全脫身。",
    nodeSummary:
      "舍館已深夜。玉璧在案上，從者等你下令；接下來要分清誰留下周旋，誰帶璧先走。",
    pressureNote: "門禁快換班了。再不下決定，整個安排都會來不及。",
    probeTopics: [
      {
        id: "route-gate",
        characterId: "palaceAttendant",
        fallbackReply:
          "西門那班侍衛交接最亂，查驗也最鬆。若有人要避開正道，今晚大概只能賭那一刻。",
        label: "確認門禁鬆動點",
        prompt: "若有人要避開正路出宮，今夜哪一道門在換班時最容易混過去？",
        rewardStat: "insight",
        timeCost: 9,
        unlockClueId: "gateShift",
      },
    ],
    referenceSource: "史實動作的落點就在這一步：『使其從者懷璧，從徑道亡』。",
    strategicActions: [
      {
        consequence: "你把最危險的部分留給自己，讓玉璧先回趙國，這才是歷史上的『完璧歸趙』。",
        detail: "你命心腹從者抄小路懷璧先返，自己留在秦廷繼續周旋。",
        id: "send-courier",
        label: "命從者懷璧先返，自己留秦周旋",
        requiredClueIds: ["sideRoadRoute", "gateShift"],
        statChanges: {
          composure: 12,
          insight: 6,
          leverage: 12,
        },
        timeCost: 10,
        winMission: true,
      },
      {
        consequence: "你若把玉璧一直留在自己身上，任何臨檢都會讓一切前功盡棄。",
        detail: "你本人是焦點，最不適合成為真正的運璧者。",
        failStateId: "searchedAtGate",
        id: "carry-yourself",
        label: "自己帶璧離開秦境",
        statChanges: {
          composure: -18,
        },
        timeCost: 9,
      },
      {
        consequence: "把玉璧留給秦廷看管，等於把所有風險重新交回對方手上。",
        detail: "你相信秦王回心轉意，卻忘了他從一開始就沒有真心交城。",
        failStateId: "escortBetrayal",
        id: "trust-qin",
        label: "把璧暫留舍館，等秦王改口",
        statChanges: {
          leverage: -30,
        },
        timeCost: 8,
      },
    ],
    subtitle: "歸璧之夜",
    timeLimit: 95,
    title: "歸璧之夜",
  },
};

export const wanbiFailStates: Record<FailStateId, FailState> = {
  zhaoHumiliated: {
    historyReference: "藺相如真正高明之處，在於『赴秦而不辱君命』，不是提前退場。",
    id: "zhaoHumiliated",
    lesson: "退避未必能自保，反而會先失主動。",
    title: "趙國先失其勢",
    whyItFailed: "你還沒入局就拒絕談判，趙國在諸侯面前先失國體，秦國反而更容易借勢壓人。",
  },
  lostLeverage: {
    historyReference: "完璧歸趙的前提，是玉璧始終沒有完全脫離藺相如的控制。",
    id: "lostLeverage",
    lesson: "未驗對方誠意前，不可先交出玉璧。",
    title: "玉璧先離手",
    whyItFailed: "你用好意換善意，但強秦只會把這當成免費奪璧的機會。",
  },
  jadeSeized: {
    historyReference: "史書中的關鍵轉折，就是藺相如看出秦王只要璧、不談城。",
    id: "jadeSeized",
    lesson: "看出對方無意交城後，就要立刻改變應對。",
    title: "和氏璧落入秦廷",
    whyItFailed: "你讓玉璧在秦廷手中停留太久，等於默認對方可以先取寶、後講條件。",
  },
  courtOverrun: {
    historyReference: "歷史上的相如不是先斥責，而是先取回玉璧再逼對方承受風險。",
    id: "courtOverrun",
    lesson: "在對方主場翻臉，先得握住自己手裡的籌碼。",
    title: "秦廷先發制人",
    whyItFailed: "你在沒有握住玉璧時就翻臉，侍衛只需前進一步，趙國立刻兩失。",
  },
  jadeDestroyed: {
    historyReference: "相如以碎璧威逼，不是為了真碎；他的目標始終是『完璧』。",
    id: "jadeDestroyed",
    lesson: "威脅只為爭時間，不是要把玉璧真的毀掉。",
    title: "玉璧碎於殿上",
    whyItFailed: "玉璧若真碎了，秦不得璧，但趙國也失去了國寶與外交成果。",
  },
  guardsCloseIn: {
    historyReference: "這段歷史的核心不是當場逼秦交城，而是以小勝換大局。",
    id: "guardsCloseIn",
    lesson: "先保住玉璧，再談後面的城池與名分。",
    title: "侍衛逼近",
    whyItFailed: "你在殿上逼秦王立即交城，等於逼他用侍衛而非協議來結束局面。",
  },
  searchedAtGate: {
    historyReference: "史書寫的是『使從者懷璧』，不是藺相如親自帶璧潛逃。",
    id: "searchedAtGate",
    lesson: "主事者有時要留下牽制，讓玉璧先走。",
    title: "出關時遭盤查",
    whyItFailed: "秦廷第一個想搜的就是你本人，你帶著玉璧根本無法安然出境。",
  },
  escortBetrayal: {
    historyReference: "秦王從頭到尾沒有真的進入交城程序，拖延只會讓璧重新落回他手上。",
    id: "escortBetrayal",
    lesson: "既知對方無意交城，就不能把希望押在對方回心轉意。",
    title: "玉璧再落秦手",
    whyItFailed: "你想等秦王改口，但對方只會趁你放鬆時重新控制和氏璧。",
  },
  timeExpired: {
    historyReference: "完璧歸趙不只是智計正確，更是每一步都得比秦廷快一瞬。",
    id: "timeExpired",
    lesson: "在秦廷地盤上，慢一步就是失機。",
    title: "局面被秦廷封死",
    whyItFailed: "你花了太多時間觀望，侍衛、門禁與朝議已經把所有出口封住。",
  },
};

export const wanbiVictorySummary = {
  historicalReference:
    "史書最後落在一句最關鍵的行動上：藺相如使從者懷璧，從徑道亡，歸璧於趙。",
  subtitle: "任務完成",
  title: "完璧歸趙",
};
