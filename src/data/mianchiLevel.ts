import charLinxiangru from "@/assets/char-linxiangru.jpg";
import charQinwang from "@/assets/char-qinwang.jpg";
import charZhaowang from "@/assets/char-zhaowang.jpg";
import sceneHall from "@/assets/scene-mianchi-hall.jpg";
import sceneCamp from "@/assets/scene-camp.jpg";
import sceneRoad from "@/assets/scene-road.jpg";

export interface Choice {
  text: string;
  textEn: string;
  nextScene: string;
  points: number;
  feedback: string;
  feedbackEn: string;
}

export interface GameScene {
  id: string;
  background: string;
  title: string;
  titleEn: string;
  narration: string;
  narrationEn: string;
  dialogues: {
    speaker: string;
    speakerEn: string;
    avatar: string;
    text: string;
    textEn: string;
    emotion: string;
    hint: string;
    hintEn: string;
  }[];
  puzzle?: {
    question: string;
    questionEn: string;
    choices: Choice[];
  };
  nextScene?: string; // auto-advance if no puzzle
}

export const characters = {
  linxiangru: { name: "藺相如", nameEn: "Lin Xiangru", avatar: charLinxiangru },
  qinwang: { name: "秦王", nameEn: "King of Qin", avatar: charQinwang },
  zhaowang: { name: "趙王", nameEn: "King of Zhao", avatar: charZhaowang },
};

export const mianchiScenes: Record<string, GameScene> = {
  // Scene 1: Prologue - Zhao camp
  intro: {
    id: "intro",
    background: sceneCamp,
    title: "第一幕：出發前夜",
    titleEn: "Act 1: The Night Before",
    narration:
      "公元前279年，秦王邀趙王於澠池相會。趙王心中不安，恐秦有詐。你穿越至此，化身為藺相如的謀士，陪同出使。",
    narrationEn:
      "279 BC. The King of Qin invites the King of Zhao to a summit at Mianchi. Zhao fears treachery. You have time-traveled here as Lin Xiangru's advisor.",
    dialogues: [
      {
        speaker: "趙王",
        speakerEn: "King of Zhao",
        avatar: charZhaowang,
        text: "秦王邀我赴澠池之會，吾恐其有詐，不欲赴也。卿以為如何？",
        textEn: "The King of Qin invites me to Mianchi. I fear treachery and wish not to go. What say you?",
        emotion: "😰 憂慮 Worried",
        hint: "趙王很擔心這是秦國的陰謀",
        hintEn: "The King is worried this might be a trap",
      },
      {
        speaker: "藺相如",
        speakerEn: "Lin Xiangru",
        avatar: charLinxiangru,
        text: "王不行，示趙弱且怯也。臣請從王赴會，必不辱趙！",
        textEn: "If you refuse, it shows Zhao is weak and fearful. I shall accompany you — Zhao will not be humiliated!",
        emotion: "😤 堅定 Resolute",
        hint: "藺相如認為不去反而示弱",
        hintEn: "Lin Xiangru believes refusing would show weakness",
      },
    ],
    puzzle: {
      question: "你作為謀士，會如何建議趙王？",
      questionEn: "As an advisor, what would you suggest to the King?",
      choices: [
        {
          text: "大王應當前往，但需做好萬全準備，帶精兵隨行",
          textEn: "Go, but prepare thoroughly with elite guards",
          nextScene: "journey",
          points: 30,
          feedback: "✅ 明智之舉！既不示弱，又有防備。",
          feedbackEn: "Wise! Neither weak nor unprepared.",
        },
        {
          text: "不去！秦王定有陰謀，我們堅守趙國",
          textEn: "Don't go! It must be a trap. Stay in Zhao.",
          nextScene: "journey",
          points: 5,
          feedback: "⚠️ 不去雖安全，但會讓秦國更加輕視趙國。",
          feedbackEn: "Safer, but Qin would see Zhao as weak.",
        },
        {
          text: "派使者代替趙王前往試探",
          textEn: "Send an envoy instead to test the waters",
          nextScene: "journey",
          points: 15,
          feedback: "🤔 有道理，但秦王指名趙王，派使者恐怕不妥。",
          feedbackEn: "Reasonable, but Qin specifically invited the King.",
        },
      ],
    },
  },

  // Scene 2: Journey
  journey: {
    id: "journey",
    background: sceneRoad,
    title: "第二幕：赴會之路",
    titleEn: "Act 2: The Journey",
    narration:
      "趙王決定赴會。廉頗率軍駐守邊境以防不測，藺相如隨趙王前往澠池。一路上，你觀察到藺相如神色自若。",
    narrationEn:
      "The King decides to go. General Lian Po stations troops at the border. Lin Xiangru accompanies the King to Mianchi. You notice Lin Xiangru appears calm throughout.",
    dialogues: [
      {
        speaker: "藺相如",
        speakerEn: "Lin Xiangru",
        avatar: charLinxiangru,
        text: "廉將軍已於邊境布下重兵。若秦有詐，三十日不還，則立太子為王。萬全之策也。",
        textEn: "General Lian Po has stationed troops at the border. If we don't return in 30 days, the Crown Prince will be enthroned. A failsafe plan.",
        emotion: "🧠 沉著 Composed",
        hint: "藺相如已做好最壞打算的準備",
        hintEn: "Lin Xiangru has prepared for the worst",
      },
    ],
    puzzle: {
      question: "🧩 歷史知識題：廉頗是趙國的什麼角色？",
      questionEn: "🧩 History Quiz: What was Lian Po's role in Zhao?",
      choices: [
        {
          text: "趙國名將，負責軍事防禦",
          textEn: "A famous general in charge of military defense",
          nextScene: "banquet_start",
          points: 25,
          feedback: "✅ 正確！廉頗是戰國四大名將之一。",
          feedbackEn: "Correct! Lian Po was one of the Four Great Generals of the Warring States.",
        },
        {
          text: "趙國丞相，負責政務",
          textEn: "The prime minister in charge of governance",
          nextScene: "banquet_start",
          points: 0,
          feedback: "❌ 不對，廉頗是武將而非文官。",
          feedbackEn: "Wrong. Lian Po was a military general, not a civil official.",
        },
        {
          text: "趙國使者，負責外交",
          textEn: "A diplomat in charge of foreign affairs",
          nextScene: "banquet_start",
          points: 0,
          feedback: "❌ 不對，負責外交的是藺相如。",
          feedbackEn: "Wrong. The diplomat was Lin Xiangru.",
        },
      ],
    },
  },

  // Scene 3: Banquet begins - Qin humiliates Zhao
  banquet_start: {
    id: "banquet_start",
    background: sceneHall,
    title: "第三幕：澠池宴會",
    titleEn: "Act 3: The Banquet at Mianchi",
    narration:
      "澠池會場，秦王設宴款待趙王。酒過三巡，秦王突然發難——",
    narrationEn:
      "At Mianchi, the King of Qin hosts a grand banquet. After several rounds of wine, the King of Qin suddenly makes a provocative demand—",
    dialogues: [
      {
        speaker: "秦王",
        speakerEn: "King of Qin",
        avatar: charQinwang,
        text: "寡人聞趙王善鼓瑟，請奏一曲以助酒興！",
        textEn: "I hear the King of Zhao is skilled at playing the se. Please play a tune to liven our feast!",
        emotion: "😏 傲慢 Arrogant",
        hint: "秦王想藉此羞辱趙王，讓趙王像樂師一樣表演",
        hintEn: "Qin wants to humiliate Zhao by making the King perform like a musician",
      },
      {
        speaker: "趙王",
        speakerEn: "King of Zhao",
        avatar: charZhaowang,
        text: "（趙王面露難色，不得已鼓瑟一曲）",
        textEn: "(Looking embarrassed, the King reluctantly plays a tune)",
        emotion: "😣 屈辱 Humiliated",
        hint: "趙王被迫演奏，這對國君而言是極大侮辱",
        hintEn: "Being forced to perform is a grave humiliation for a king",
      },
      {
        speaker: "秦王",
        speakerEn: "King of Qin",
        avatar: charQinwang,
        text: "（秦王令御史記錄）某年某月，秦王令趙王鼓瑟！哈哈哈！",
        textEn: '(Orders the historian to record) "On this day, the King of Qin ordered the King of Zhao to play the se!" Hahaha!',
        emotion: "😈 得意 Triumphant",
        hint: "秦王要把趙王的恥辱寫入史冊！",
        hintEn: "Qin wants to immortalize Zhao's humiliation in the historical records!",
      },
    ],
    puzzle: {
      question: "趙王被羞辱了！作為藺相如的謀士，你認為應該如何反擊？",
      questionEn: "The King of Zhao has been humiliated! How should Lin Xiangru respond?",
      choices: [
        {
          text: "要求秦王也演奏樂器，以牙還牙",
          textEn: "Demand the King of Qin also play an instrument — tit for tat",
          nextScene: "confrontation",
          points: 30,
          feedback: "✅ 妙計！這正是藺相如的歷史做法！",
          feedbackEn: "Brilliant! This is exactly what Lin Xiangru did historically!",
        },
        {
          text: "直接拔劍威脅秦王",
          textEn: "Draw a sword and threaten the King of Qin",
          nextScene: "confrontation",
          points: 10,
          feedback: "⚠️ 太莽撞了，容易引發戰爭。外交需要智慧。",
          feedbackEn: "Too reckless! This could start a war. Diplomacy requires wisdom.",
        },
        {
          text: "忍氣吞聲，保全性命要緊",
          textEn: "Swallow the insult — survival comes first",
          nextScene: "confrontation",
          points: 0,
          feedback: "❌ 國家尊嚴不容退讓！忍讓只會讓秦國更加囂張。",
          feedbackEn: "National dignity cannot be compromised! Submission would only embolden Qin.",
        },
      ],
    },
  },

  // Scene 4: Lin Xiangru confronts Qin
  confrontation: {
    id: "confrontation",
    background: sceneHall,
    title: "第四幕：以缶還瑟",
    titleEn: "Act 4: The Counterattack",
    narration:
      "藺相如挺身而出，走到秦王面前——",
    narrationEn:
      "Lin Xiangru steps forward, approaching the King of Qin—",
    dialogues: [
      {
        speaker: "藺相如",
        speakerEn: "Lin Xiangru",
        avatar: charLinxiangru,
        text: "趙王聞秦王善為秦聲，臣請奉盆缶，以相娛樂！",
        textEn: "I hear the King of Qin is skilled in Qin music. Please play the fou (clay pot) for our entertainment!",
        emotion: "😤 凜然 Fearless",
        hint: "藺相如要求秦王也演奏樂器來反擊",
        hintEn: "Lin Xiangru demands the King of Qin also play an instrument in retaliation",
      },
      {
        speaker: "秦王",
        speakerEn: "King of Qin",
        avatar: charQinwang,
        text: "大膽！寡人豈能為汝擊缶！",
        textEn: "Impudent! How dare you ask me to beat a clay pot!",
        emotion: "😡 憤怒 Furious",
        hint: "秦王被藺相如的要求激怒了",
        hintEn: "The King of Qin is enraged by the demand",
      },
      {
        speaker: "藺相如",
        speakerEn: "Lin Xiangru",
        avatar: charLinxiangru,
        text: "五步之內，相如請得以頸血濺大王矣！",
        textEn: "Within five paces, I shall spill my blood upon Your Majesty!",
        emotion: "🔥 視死如歸 Defiant",
        hint: "藺相如以死相逼，秦王如果不答應，他就拼命",
        hintEn: "Lin Xiangru threatens to fight to the death — forcing Qin's hand",
      },
      {
        speaker: "秦王",
        speakerEn: "King of Qin",
        avatar: charQinwang,
        text: "（秦王畏懼，不得已擊缶一下）",
        textEn: "(Intimidated, the King reluctantly beats the clay pot once)",
        emotion: "😤 不甘 Reluctant",
        hint: "秦王被迫讓步，敲了缶！",
        hintEn: "The King of Qin is forced to comply!",
      },
    ],
    puzzle: {
      question: "🧩 藺相如說「五步之內」是什麼意思？",
      questionEn: '🧩 What did Lin Xiangru mean by "within five paces"?',
      choices: [
        {
          text: "在五步距離內，我可以和你同歸於盡",
          textEn: "Within five paces, I can take us both down together",
          nextScene: "victory",
          points: 30,
          feedback: "✅ 正確！這是以死相逼的外交策略，展現了藺相如的勇氣。",
          feedbackEn: "Correct! This was a life-or-death diplomatic gambit showing Lin Xiangru's courage.",
        },
        {
          text: "只需走五步就能離開宴會",
          textEn: "He can leave the banquet in just five steps",
          nextScene: "victory",
          points: 0,
          feedback: "❌ 不是逃跑，而是威脅要拼命。",
          feedbackEn: "No — it's not about escaping, but threatening to fight.",
        },
        {
          text: "五步之內是安全距離",
          textEn: "Five paces is a safe distance",
          nextScene: "victory",
          points: 0,
          feedback: "❌ 恰恰相反，五步之內意味著致命的近距離。",
          feedbackEn: "The opposite — five paces means lethal close range.",
        },
      ],
    },
  },

  // Scene 5: Victory
  victory: {
    id: "victory",
    background: sceneHall,
    title: "第五幕：不辱使命",
    titleEn: "Act 5: Mission Accomplished",
    narration:
      "藺相如令趙國御史記錄：「某年月日，秦王為趙王擊缶。」秦王終不能加勝於趙，趙王安然歸國。",
    narrationEn:
      'Lin Xiangru orders the Zhao historian to record: "On this day, the King of Qin played the fou for the King of Zhao." Qin fails to gain any advantage, and the King of Zhao returns home safely.',
    dialogues: [
      {
        speaker: "藺相如",
        speakerEn: "Lin Xiangru",
        avatar: charLinxiangru,
        text: "臣不辱使命，趙國尊嚴已保全！",
        textEn: "I have not failed my mission — Zhao's honor is preserved!",
        emotion: "😊 欣慰 Satisfied",
        hint: "藺相如完成了保護趙國尊嚴的使命",
        hintEn: "Lin Xiangru has fulfilled his duty to protect Zhao's dignity",
      },
      {
        speaker: "趙王",
        speakerEn: "King of Zhao",
        avatar: charZhaowang,
        text: "相如功勞卓著！拜為上卿，位在廉頗之右！",
        textEn: "Xiangru's merit is outstanding! I appoint you as Senior Minister, above even Lian Po!",
        emotion: "🥹 感動 Moved",
        hint: "趙王封藺相如為高官，這也為後來「負荊請罪」的故事埋下伏筆",
        hintEn: "This promotion plants the seed for the later story of Lian Po's apology",
      },
    ],
    nextScene: "end",
  },

  // End
  end: {
    id: "end",
    background: sceneRoad,
    title: "通關完成！",
    titleEn: "Level Complete!",
    narration:
      "恭喜你完成了「澠池之會」關卡！你見證了藺相如以智勇保全趙國尊嚴的歷史故事。這段故事出自《史記·廉頗藺相如列傳》。",
    narrationEn:
      "Congratulations! You've completed the 'Meeting at Mianchi' level! You witnessed how Lin Xiangru used wisdom and courage to protect Zhao's dignity. This story is from Records of the Grand Historian.",
    dialogues: [],
  },
};
