const DNA = ["A", "T", "G", "C"];

const cells = [
  document.getElementById("cell0"),
  document.getElementById("cell1"),
  document.getElementById("cell2"),
];

const stopBtns = [
  document.getElementById("stop0"),
  document.getElementById("stop1"),
  document.getElementById("stop2"),
];

const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");
const msg = document.getElementById("msg");

// ========= おみくじデータ =========
// 1) 3文字が同じ（AAAなど）→大吉系
// 2) ATG（開始コドン）→特別運
// 3) それ以外→ランダムに運勢
const OMK = {
  super: {
    fortune: "大吉",
    luckyItem: ["金のペン", "特別なノート", "キラキラシール", "新しいイヤホン"],
    future: [
      "集中力が爆上がり。今日やることが全部片付く。",
      "チャンスが向こうから来る日。遠慮しないで掴んでOK。",
      "ひらめきが強い。思いついたことをメモすると当たる。",
    ],
  },
  startCodon: {
    fortune: "超吉（ATG）",
    luckyItem: ["はじまりの鍵", "新しいマグカップ", "白い紙", "朝のコーヒー"],
    future: [
      "新しいことを始めると伸びる。最初の一歩が最強の日。",
      "“スタート”がテーマ。計画を立てるほど未来が良くなる。",
      "変化が追い風。迷ったらやってみるが正解。",
    ],
  },
  normal: [
    {
      fortune: "中吉",
      luckyItem: ["のど飴", "青いペン", "小さなメモ帳", "お気に入りの靴下"],
      future: ["焦らず進むと良い結果。ゆっくりで勝てる日。", "誰かの一言がヒントになる。聞く力が運を呼ぶ。"],
    },
    {
      fortune: "小吉",
      luckyItem: ["温かい飲み物", "付せん", "ハンドクリーム", "ガム"],
      future: ["小さな積み重ねが効く日。5分の努力が大きく返る。", "身の回りを整えると運気UP。机の上が鍵。"],
    },
    {
      fortune: "吉",
      luckyItem: ["おにぎり", "ストラップ", "イヤホンケース", "シャーペン"],
      future: ["いつも通りが一番強い。ルーティンが武器になる。", "人に優しくすると良いことが戻ってくる。"],
    },
    {
      fortune: "末吉",
      luckyItem: ["ティッシュ", "ハンカチ", "替え芯", "シンプルなリング"],
      future: ["後半に良くなる日。午前ダメでも午後で巻き返せる。", "慎重さが守ってくれる。確認を1回増やすと◎。"],
    },
  ],
};

// ========= スロット状態 =========
const reels = [
  { running: false, timer: null, value: "A" },
  { running: false, timer: null, value: "T" },
  { running: false, timer: null, value: "G" },
];

function pickDNA() {
  return DNA[Math.floor(Math.random() * DNA.length)];
}

function setCell(i, v) {
  reels[i].value = v;
  cells[i].textContent = v;
}

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function startReel(i) {
  if (reels[i].running) return;
  reels[i].running = true;

  // リールごとに速度差
  const interval = 70 + i * 25;
  reels[i].timer = setInterval(() => {
    setCell(i, pickDNA());
  }, interval);

  stopBtns[i].disabled = false;
}

function stopReel(i) {
  if (!reels[i].running) return;
  clearInterval(reels[i].timer);
  reels[i].timer = null;
  reels[i].running = false;

  stopBtns[i].disabled = true;
  checkDone();
}

function startAll() {
  msg.textContent = "";
  for (let i = 0; i < 3; i++) startReel(i);

  startBtn.disabled = true;
  resetBtn.disabled = false;
}

function resetAll() {
  for (let i = 0; i < 3; i++) {
    if (reels[i].timer) clearInterval(reels[i].timer);
    reels[i].timer = null;
    reels[i].running = false;
    setCell(i, pickDNA());
    stopBtns[i].disabled = true;
  }
  msg.textContent = "";
  startBtn.disabled = false;
  resetBtn.disabled = false;
}

// ========= ここが「おみくじ判定」 =========
function makeOmikuji(resultStr) {
  const [a, b, c] = resultStr.split("");

  // 3つ同じ
  if (a === b && b === c) {
    const o = OMK.super;
    return {
      fortune: o.fortune,
      luckyItem: randPick(o.luckyItem),
      future: randPick(o.future),
      bonus: "🎉 3つ揃いボーナス！",
    };
  }

  // ATG（開始コドン）を特別扱い
  if (resultStr === "ATG") {
    const o = OMK.startCodon;
    return {
      fortune: o.fortune,
      luckyItem: randPick(o.luckyItem),
      future: randPick(o.future),
      bonus: "🧬 開始コドンボーナス！",
    };
  }

  // それ以外はランダム
  const o = randPick(OMK.normal);
  return {
    fortune: o.fortune,
    luckyItem: randPick(o.luckyItem),
    future: randPick(o.future),
    bonus: "",
  };
}

function checkDone() {
  const allStopped = reels.every(r => !r.running);
  if (!allStopped) return;

  const result = reels.map(r => r.value).join("");

  const omk = makeOmikuji(result);

  // 表示（1行じゃなくて複数行にする）
  msg.innerHTML =
    `結果：<b>${result}</b>　${omk.bonus ? omk.bonus : ""}<br>` +
    `運勢：<b>${omk.fortune}</b><br>` +
    `ラッキーアイテム：<b>${omk.luckyItem}</b><br>` +
    `未来：${omk.future}`;

  startBtn.disabled = false;
}

// ========= イベント =========
startBtn.addEventListener("click", startAll);
resetBtn.addEventListener("click", resetAll);

stopBtns[0].addEventListener("click", () => stopReel(0));
stopBtns[1].addEventListener("click", () => stopReel(1));
stopBtns[2].addEventListener("click", () => stopReel(2));

// 初期化
resetAll();
