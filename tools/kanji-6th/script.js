// =====================================================
// 小学6年生 配当漢字データ（191字より主要なものを収録）
// reading: 問題で答える読み（ひらがな）
// example: {} の中が対象の漢字
// =====================================================
const kanjiData = [
  // ── あ行 ──
  { kanji:'異', reading:'ことな',  example:'クラスで{異}なる意見を大切にした。',   meaning:'ちがう・めずらしい' },
  { kanji:'遺', reading:'のこ',    example:'科学者が{遺}した発明が今も使われる。', meaning:'あとに残す' },
  { kanji:'域', reading:'いき',    example:'この地{域}では昔から祭りが続く。',     meaning:'きまった場所・範囲' },
  { kanji:'宇', reading:'う',      example:'{宇}宙飛行士が宇宙に飛び立った。',    meaning:'そら・宇宙' },
  { kanji:'映', reading:'うつ',    example:'湖に山の景色が{映}っていた。',         meaning:'うつる・ひかりがあたる' },
  { kanji:'沿', reading:'そ',      example:'川に{沿}って桜の木が続いている。',     meaning:'川などのそばに続く' },
  // ── か行 ──
  { kanji:'我', reading:'われ',    example:'{我}ながらよくできたと思った。',       meaning:'じぶん' },
  { kanji:'灰', reading:'はい',    example:'焚き火の後に{灰}が残った。',           meaning:'もえたあとのかす' },
  { kanji:'拡', reading:'ひろ',    example:'研究の範囲が{拡}大した。',             meaning:'ひろがる・ひろめる' },
  { kanji:'革', reading:'かわ',    example:'{革}のかばんを大切に使っている。',     meaning:'けものの皮・あらためる' },
  { kanji:'閣', reading:'かく',    example:'内{閣}総理大臣が会見を開いた。',       meaning:'たかどの・内閣' },
  { kanji:'割', reading:'わ',      example:'スイカを六つに{割}って食べた。',       meaning:'わる・きる' },
  { kanji:'株', reading:'かぶ',    example:'庭の桜の{株}から新芽が出た。',         meaning:'きりかぶ・会社の株' },
  { kanji:'干', reading:'ほ',      example:'洗濯物をベランダに{干}した。',         meaning:'かわかす・ひぼし' },
  { kanji:'巻', reading:'ま',      example:'包帯を傷口に{巻}いた。',               meaning:'まく・かん（本の巻）' },
  { kanji:'看', reading:'かん',    example:'入院中の友人の{看}護をした。',         meaning:'みる・めんどうをみる' },
  { kanji:'簡', reading:'かん',    example:'{簡}単な問題から始めてみよう。',       meaning:'てみじか・かんたん' },
  { kanji:'危', reading:'あぶ',    example:'川の近くは{危}ないので注意しよう。',   meaning:'あぶない・きけん' },
  { kanji:'机', reading:'つくえ',  example:'勉強{机}の上をきれいに片付けた。',     meaning:'つくえ' },
  { kanji:'揮', reading:'き',      example:'先生が指{揮}棒を振って演奏を始めた。', meaning:'ふるう・さしずする' },
  { kanji:'貴', reading:'き',      example:'時間は{貴}重なものだから大切にしよう。', meaning:'とうとい・たいせつ' },
  { kanji:'疑', reading:'うたが',  example:'話の内容を{疑}問に思って質問した。',   meaning:'うたがう' },
  { kanji:'吸', reading:'す',      example:'深呼{吸}して気持ちを落ち着かせた。',   meaning:'すう・とりいれる' },
  { kanji:'供', reading:'そな',    example:'お墓に花を{供}えてお参りした。',       meaning:'そなえる・おともする' },
  { kanji:'胸', reading:'むね',    example:'{胸}がドキドキするほど緊張した。',     meaning:'むね' },
  { kanji:'郷', reading:'ふるさと',example:'夏休みに{郷}里に帰省した。',           meaning:'ふるさと・故郷' },
  { kanji:'勤', reading:'つと',    example:'父は銀行に{勤}めています。',           meaning:'つとめる・はたらく' },
  { kanji:'筋', reading:'すじ',    example:'話の{筋}道がよくわかった。',           meaning:'すじ・きんにく' },
  { kanji:'敬', reading:'うやま',  example:'目上の人を{敬}う気持ちが大切だ。',     meaning:'うやまう・けいい' },
  { kanji:'系', reading:'けい',    example:'太陽{系}には八つの惑星がある。',       meaning:'つながり・系統' },
  { kanji:'警', reading:'けい',    example:'{警}察官が交差点で誘導していた。',     meaning:'いましめる・けいかい' },
  { kanji:'劇', reading:'げき',    example:'学芸会で{劇}の主役を演じた。',         meaning:'しばい・はげしい' },
  { kanji:'激', reading:'はげ',    example:'{激}しい雨が一時間降り続いた。',       meaning:'はげしい・つよい' },
  { kanji:'穴', reading:'あな',    example:'くつ下に{穴}があいてしまった。',       meaning:'あな' },
  { kanji:'絹', reading:'きぬ',    example:'{絹}でできたスカーフはなめらかだ。',   meaning:'きぬ（シルク）' },
  { kanji:'権', reading:'けん',    example:'すべての子どもに学ぶ{権}利がある。',   meaning:'けんり・けんい' },
  { kanji:'憲', reading:'けん',    example:'日本国{憲}法は三原則を柱にしている。', meaning:'きまり・のり' },
  { kanji:'源', reading:'みなもと',example:'この川の{源}流は高い山にある。',       meaning:'みなもと・もと' },
  { kanji:'厳', reading:'きび',    example:'先生の{厳}しい指導のおかげで上達した。', meaning:'きびしい・おごそか' },
  { kanji:'己', reading:'おのれ',  example:'{己}の力を信じてあきらめなかった。',   meaning:'じぶん' },
  { kanji:'呼', reading:'よ',      example:'名前を{呼}ばれたので手を挙げた。',     meaning:'よぶ・いきをする' },
  { kanji:'誤', reading:'あやま',  example:'計算を{誤}ってしまい、やり直した。',   meaning:'まちがえる' },
  { kanji:'孝', reading:'こう',    example:'親への{孝}行として家事を手伝った。',   meaning:'おやによくつかえる' },
  { kanji:'皇', reading:'こう',    example:'天{皇}陛下のお誕生日をお祝いした。',   meaning:'てんのう・おうさま' },
  { kanji:'紅', reading:'くれない',example:'秋の{紅}葉が山を赤く染めた。',         meaning:'あか・べに' },
  { kanji:'降', reading:'ふ',      example:'雪が静かに{降}り積もっていた。',       meaning:'ふる・おりる' },
  { kanji:'鋼', reading:'はがね',  example:'丈夫な{鋼}鉄で橋が作られている。',     meaning:'はがね（スチール）' },
  { kanji:'刻', reading:'きざ',    example:'石碑に文字を{刻}んだ。',               meaning:'きざむ・じこく' },
  { kanji:'骨', reading:'ほね',    example:'体の{骨}は体を支える役割を持っている。', meaning:'ほね' },
  { kanji:'困', reading:'こま',    example:'わからない問題に{困}ってしまった。',   meaning:'こまる' },
  // ── さ行 ──
  { kanji:'砂', reading:'すな',    example:'海岸に白い{砂}浜が広がっている。',     meaning:'すな' },
  { kanji:'座', reading:'すわ',    example:'先生の前の{座}席に静かに座った。',     meaning:'すわる・せき' },
  { kanji:'済', reading:'す',      example:'宿題が{済}んだので遊びに出かけた。',   meaning:'おわる・すむ' },
  { kanji:'裁', reading:'さい',    example:'生地を{裁}断してスカートを作った。',   meaning:'たつ・さばく' },
  { kanji:'策', reading:'さく',    example:'問題を解決する{策}を考えた。',         meaning:'はかりごと・作戦' },
  { kanji:'冊', reading:'さつ',    example:'夏休みに本を十{冊}読んだ。',           meaning:'ほんをかぞえることば' },
  { kanji:'蚕', reading:'かいこ',  example:'{蚕}が糸を出して繭を作った。',         meaning:'かいこ（絹糸を作る虫）' },
  { kanji:'私', reading:'わたし',  example:'{私}の将来の夢は医者になることです。', meaning:'わたし・プライベート' },
  { kanji:'姿', reading:'すがた',  example:'颯爽とした{姿}で舞台に登場した。',     meaning:'すがた・かたち' },
  { kanji:'磁', reading:'じ',      example:'{磁}石で砂鉄を集める実験をした。',     meaning:'じしゃく' },
  { kanji:'射', reading:'い',      example:'弓で的に{射}た。',                     meaning:'いる・うつ' },
  { kanji:'捨', reading:'す',      example:'古いノートを{捨}てて整理した。',       meaning:'すてる' },
  { kanji:'若', reading:'わか',    example:'{若}い頃の努力が今の自分を作っている。', meaning:'わかい' },
  { kanji:'樹', reading:'き',      example:'公園に大きな{樹}木が立っている。',     meaning:'き・たちき' },
  { kanji:'収', reading:'おさ',    example:'農家の人が米を{収}穫した。',           meaning:'おさめる・とりいれる' },
  { kanji:'宗', reading:'しゅう',  example:'世界にはさまざまな{宗}教がある。',     meaning:'しゅうきょう・おおもと' },
  { kanji:'就', reading:'つ',      example:'卒業後にいい仕事に{就}きたい。',       meaning:'つく（仕事に）' },
  { kanji:'衆', reading:'しゅう',  example:'大{衆}に向けた演説を行った。',         meaning:'おおぜい・みんな' },
  { kanji:'従', reading:'したが',  example:'ルールに{従}って行動することが大切だ。', meaning:'したがう' },
  { kanji:'縦', reading:'たて',    example:'紙を{縦}に折った。',                   meaning:'たて（上下方向）' },
  { kanji:'縮', reading:'ちぢ',    example:'地図を{縮}小してわかりやすくした。',   meaning:'ちぢむ・ちいさくする' },
  { kanji:'熟', reading:'じゅく',  example:'よく{熟}した柿はとても甘い。',         meaning:'うれる・じゅくれん' },
  { kanji:'純', reading:'じゅん',  example:'{純}粋な気持ちで友だちに接した。',     meaning:'まじりけがない・じゅんすい' },
  { kanji:'処', reading:'しょ',    example:'ゴミを正しく{処}分することが大切だ。', meaning:'しょぶん・ところ' },
  { kanji:'諸', reading:'しょ',    example:'{諸}問題を解決するために話し合った。', meaning:'いろいろな' },
  { kanji:'除', reading:'のぞ',    example:'草を{除}いて畑をきれいにした。',       meaning:'のぞく・とりのぞく' },
  { kanji:'将', reading:'しょう',  example:'{将}来はスポーツ選手になりたい。',     meaning:'これから・たいしょう' },
  { kanji:'傷', reading:'きず',    example:'転んで足に{傷}を作ってしまった。',     meaning:'きず・いためる' },
  { kanji:'蒸', reading:'む',      example:'野菜を{蒸}してヘルシーに食べた。',     meaning:'むす・じょうき' },
  { kanji:'針', reading:'はり',    example:'時計の{針}が十二時を指している。',     meaning:'はり・ポインター' },
  { kanji:'垂', reading:'た',      example:'枝が地面まで{垂}れ下がっていた。',     meaning:'たれる・たらす' },
  { kanji:'推', reading:'すい',    example:'証拠から犯人を{推}理した。',           meaning:'おす・おしはかる' },
  { kanji:'盛', reading:'も',      example:'お皿にご飯をたっぷり{盛}ってくれた。', meaning:'もる・さかん' },
  { kanji:'聖', reading:'せい',    example:'この山は{聖}なる場所とされてきた。',   meaning:'とうとい・かみさまにかかわる' },
  { kanji:'誠', reading:'まこと',  example:'{誠}実な態度で相手と向き合った。',     meaning:'まこと・まじめ' },
  { kanji:'舌', reading:'した',    example:'辛いものを食べて{舌}がしびれた。',     meaning:'した（口の中の）' },
  { kanji:'宣', reading:'せん',    example:'校長先生が開会を{宣}言した。',         meaning:'のべる・せんげん' },
  { kanji:'専', reading:'せん',    example:'{専}門の先生に教えてもらった。',       meaning:'もっぱら・せんもん' },
  { kanji:'泉', reading:'いずみ',  example:'山の{泉}から冷たい水が湧いている。',   meaning:'いずみ・わき水' },
  { kanji:'洗', reading:'あら',    example:'食事の前に手を{洗}った。',             meaning:'あらう・きれいにする' },
  { kanji:'染', reading:'そ',      example:'藍色に{染}めた布は美しい。',           meaning:'そめる・しみる' },
  { kanji:'善', reading:'よ',      example:'{善}意を持って行動することが大切だ。', meaning:'よい・よいこと' },
  { kanji:'奏', reading:'かな',    example:'ピアノで美しい曲を{奏}でた。',         meaning:'かなでる・えんそう' },
  { kanji:'窓', reading:'まど',    example:'{窓}から外の景色を眺めた。',           meaning:'まど' },
  { kanji:'装', reading:'よそお',  example:'式典に参加するために正{装}した。',     meaning:'よそおう・みなり' },
  { kanji:'臓', reading:'ぞう',    example:'心{臓}は体中に血液を送っている。',     meaning:'からだの中の器官' },
  { kanji:'存', reading:'そん',    example:'恐竜はもう{存}在していない。',         meaning:'ある・そんざい' },
  { kanji:'尊', reading:'そん',    example:'相手の意見を{尊}重することが大切だ。', meaning:'うやまう・たいせつにする' },
  // ── た行 ──
  { kanji:'宅', reading:'たく',    example:'今日は{宅}急便が届く予定だ。',         meaning:'うち・じたく' },
  { kanji:'担', reading:'にな',    example:'重い荷物を{担}いで山道を登った。',     meaning:'になう・たんとう' },
  { kanji:'探', reading:'さが',    example:'図書館で資料を{探}した。',             meaning:'さがす・さぐる' },
  { kanji:'誕', reading:'たん',    example:'今日は私の{誕}生日です。',             meaning:'うまれる・たんじょう' },
  { kanji:'段', reading:'だん',    example:'階{段}を一段一段ゆっくり上った。',     meaning:'きざはし・ステップ・段階' },
  { kanji:'暖', reading:'あたた',  example:'春になって{暖}かい日が続いている。',   meaning:'あたたかい・ぬくもり' },
  { kanji:'値', reading:'ね',      example:'野菜の{値}段が季節によって変わる。',   meaning:'ねだん・かち' },
  { kanji:'宙', reading:'ちゅう',  example:'{宙}返りの技を練習して成功した。',     meaning:'そら・くうちゅう' },
  { kanji:'忠', reading:'ちゅう',  example:'犬は飼い主に{忠}実な動物だ。',         meaning:'まごころ・ちゅうじつ' },
  { kanji:'著', reading:'いちじる',example:'練習の成果が{著}しく現れた。',         meaning:'いちじるしい・ちょさく' },
  { kanji:'庁', reading:'ちょう',  example:'都{庁}の展望台から東京を一望した。',   meaning:'お役所・かんちょう' },
  { kanji:'頂', reading:'いただ',  example:'山の{頂}上から美しい景色を眺めた。',   meaning:'いただき・てっぺん' },
  { kanji:'潮', reading:'しお',    example:'干{潮}の時は砂浜が広がる。',           meaning:'しお・ちょうりゅう' },
  { kanji:'賃', reading:'ちん',    example:'電車の運{賃}を調べてから出発した。',   meaning:'ちんぎん・料金' },
  { kanji:'痛', reading:'いた',    example:'転んでひざが{痛}くなった。',           meaning:'いたい・つらい' },
  { kanji:'典', reading:'てん',    example:'日本の古{典}文学を授業で学んだ。',     meaning:'てんけい・ふるい文献' },
  { kanji:'敵', reading:'てき',    example:'試合の{敵}チームは今年とても強い。',   meaning:'かたき・てき' },
  { kanji:'展', reading:'てん',    example:'美術館で絵画の{展}覧会が開かれた。',   meaning:'ひろがる・てんらんかい' },
  { kanji:'討', reading:'とう',    example:'みんなで問題について{討}議した。',     meaning:'うつ・はなしあう' },
  { kanji:'党', reading:'とう',    example:'選挙では各{党}の政策を調べた。',       meaning:'グループ・せいとう' },
  { kanji:'糖', reading:'とう',    example:'砂{糖}の取りすぎには気をつけよう。',   meaning:'さとう・あまいもの' },
  { kanji:'届', reading:'とど',    example:'友だちにプレゼントを{届}けた。',       meaning:'とどける・とどく' },
  // ── な行 ──
  { kanji:'難', reading:'むずか',  example:'{難}しい問題でも諦めずに考えた。',     meaning:'むずかしい・なん（困難）' },
  { kanji:'乳', reading:'ちち',    example:'赤ちゃんは{乳}を飲んで育つ。',         meaning:'ちち・ミルク' },
  { kanji:'認', reading:'みと',    example:'自分の間違いを素直に{認}めた。',       meaning:'みとめる・にんしき' },
  { kanji:'納', reading:'おさ',    example:'税金をきちんと{納}めることが大切だ。', meaning:'おさめる・いれる' },
  { kanji:'脳', reading:'のう',    example:'{脳}を鍛えるためにいろいろな勉強をした。', meaning:'のう・あたま' },
  // ── は行 ──
  { kanji:'派', reading:'は',      example:'二つの{派}に分かれて意見を出した。',   meaning:'グループ・ながれ' },
  { kanji:'俳', reading:'はい',    example:'{俳}句は日本の伝統的な詩の形式だ。',   meaning:'はいく・こゆうな' },
  { kanji:'拝', reading:'おが',    example:'神様に{拝}んでお願いをした。',         meaning:'おがむ・うやまう' },
  { kanji:'背', reading:'せ',      example:'{背}筋を伸ばして正しい姿勢で座った。', meaning:'せ・うしろ・はいけい' },
  { kanji:'肺', reading:'はい',    example:'体の中で{肺}は呼吸をする器官だ。',     meaning:'はい（呼吸する器官）' },
  { kanji:'否', reading:'ひ',      example:'提案が議会で{否}決された。',           meaning:'いいえ・みとめない' },
  { kanji:'批', reading:'ひ',      example:'友だちの作品を丁寧に{批}評した。',     meaning:'ひひょう・よしあしを言う' },
  { kanji:'秘', reading:'かく',    example:'{秘}密の場所に大切なものを隠した。',   meaning:'かくす・ひみつ' },
  { kanji:'腹', reading:'はら',    example:'お{腹}がすいたので早く家に帰った。',   meaning:'おなか・はら' },
  { kanji:'奮', reading:'ふる',    example:'最後まで{奮}起して全力を出した。',     meaning:'ふるいたつ・はりきる' },
  { kanji:'並', reading:'なら',    example:'桜並木の木が一列に{並}んでいた。',     meaning:'ならぶ・ならべる' },
  { kanji:'閉', reading:'と',      example:'店が{閉}まる前に急いで入った。',       meaning:'とじる・しまる' },
  { kanji:'片', reading:'かた',    example:'{片}方の手袋をなくしてしまった。',     meaning:'かたほう・かけら' },
  { kanji:'補', reading:'おぎな',  example:'不足している栄養を{補}うために食べた。', meaning:'おぎなう・たす' },
  { kanji:'宝', reading:'たから',  example:'家族はかけがえのない{宝}物だ。',       meaning:'たから・だいじなもの' },
  { kanji:'訪', reading:'たず',    example:'友だちの家を{訪}問した。',             meaning:'たずねる・おとずれる' },
  { kanji:'亡', reading:'な',      example:'{亡}くなった祖父の思い出を語った。',   meaning:'しぬ・なくなる' },
  { kanji:'忙', reading:'いそが',  example:'テスト前で{忙}しい毎日が続いた。',     meaning:'いそがしい' },
  { kanji:'棒', reading:'ぼう',    example:'旗を{棒}にくくりつけて運んだ。',       meaning:'ぼう（長い丸い木や金属）' },
  { kanji:'盟', reading:'めい',    example:'二つの国が同{盟}を結んだ。',           meaning:'ちかい・どうめい' },
  { kanji:'模', reading:'も',      example:'本物に{模}した工芸品が展示されていた。', meaning:'かたち・まねる' },
  // ── や・ら・わ行 ──
  { kanji:'訳', reading:'やく',    example:'英語の文章を日本語に{訳}した。',       meaning:'ほんやく・わけ' },
  { kanji:'優', reading:'やさ',    example:'{優}しい心で小さな子の面倒を見た。',   meaning:'やさしい・すぐれる' },
  { kanji:'郵', reading:'ゆう',    example:'{郵}便局で手紙に切手を貼った。',       meaning:'ゆうびん・てがみ' },
  { kanji:'幼', reading:'おさな',  example:'{幼}い頃の思い出は今でもなつかしい。', meaning:'おさない・ようじ' },
  { kanji:'欲', reading:'ほ',      example:'もっと上手くなりたいという{欲}を持って練習した。', meaning:'ほしがる・よくきゅう' },
  { kanji:'翌', reading:'よく',    example:'{翌}日の授業の準備を前日にした。',     meaning:'つぎの日・よくじつ' },
  { kanji:'乱', reading:'みだ',    example:'台風で海が{乱}れていた。',             meaning:'みだれる・こんらん' },
  { kanji:'卵', reading:'たまご',  example:'ニワトリの{卵}を朝ごはんに食べた。',   meaning:'たまご' },
  { kanji:'裏', reading:'うら',    example:'プリントの{裏}に答えを書いた。',       meaning:'うら・うしろ' },
  { kanji:'律', reading:'りつ',    example:'自{律}して毎日勉強する習慣をつけた。', meaning:'きまり・じりつ' },
  { kanji:'臨', reading:'りん',    example:'{臨}機応変に対応することが求められた。', meaning:'のぞむ・りんきおうへん' },
  { kanji:'論', reading:'ろん',    example:'クラスで意見を{論}じ合った。',         meaning:'ろんじる・いろんぱつ' },
];

// =====================================================
// ゲーム状態
// =====================================================
const LS_STATS = 'kanji6_stats';
const LS_MISS  = 'kanji6_miss';

let state = {
  mode: null,
  questions: [],
  current: 0,
  correct: 0,
  sessionMiss: [],  // このセッションで間違えた kanji
  answered: false,
};

// =====================================================
// localStorage ユーティリティ
// =====================================================
function loadStats() {
  try { return JSON.parse(localStorage.getItem(LS_STATS)) || { total: 0, correct: 0 }; }
  catch { return { total: 0, correct: 0 }; }
}
function saveStats(stats) { localStorage.setItem(LS_STATS, JSON.stringify(stats)); }

function loadMiss() {
  try { return JSON.parse(localStorage.getItem(LS_MISS)) || []; }
  catch { return []; }
}
function saveMiss(arr) { localStorage.setItem(LS_MISS, JSON.stringify(arr)); }

// =====================================================
// 画面切替
// =====================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

// =====================================================
// ホーム
// =====================================================
function goHome() {
  updateHomeStats();
  showScreen('home');
}

function updateHomeStats() {
  const stats = loadStats();
  const miss  = loadMiss();
  document.getElementById('home-total').textContent   = stats.total;
  document.getElementById('home-correct').textContent =
    stats.total > 0 ? Math.round(stats.correct / stats.total * 100) + '%' : '–';
  document.getElementById('home-miss').textContent    = miss.length;
}

// =====================================================
// クイズ開始
// =====================================================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz(mode) {
  const miss = loadMiss();

  if (mode === 'review' && miss.length === 0) {
    const msgEl = document.getElementById('miss-empty-msg');
    if (msgEl) { msgEl.style.display = 'block'; setTimeout(() => msgEl.style.display = 'none', 2500); }
    return;
  }

  state.mode = mode;
  state.current = 0;
  state.correct = 0;
  state.sessionMiss = [];
  state.answered = false;

  const pool = buildPool(mode, miss);
  state.questions = shuffle(pool).slice(0, 15);

  showScreen('quiz');
  renderQuestion();
}

function buildPool(mode, miss) {
  const pool = [];

  if (mode === 'read') {
    kanjiData.forEach(e => pool.push({ entry: e, type: 'read' }));
  } else if (mode === 'write') {
    kanjiData.forEach(e => pool.push({ entry: e, type: 'write' }));
  } else if (mode === 'random') {
    kanjiData.forEach(e => {
      pool.push({ entry: e, type: 'read' });
      pool.push({ entry: e, type: 'write' });
    });
  } else if (mode === 'review') {
    const missEntries = kanjiData.filter(e => miss.includes(e.kanji));
    missEntries.forEach(e => {
      pool.push({ entry: e, type: 'read' });
      pool.push({ entry: e, type: 'write' });
    });
  }
  return pool;
}

// =====================================================
// 問題レンダリング
// =====================================================
function renderQuestion() {
  const q = state.questions[state.current];
  const total = state.questions.length;
  const idx   = state.current;

  // プログレス
  document.getElementById('progress-fill').style.width = (idx / total * 100) + '%';
  document.getElementById('quiz-count').textContent = `${idx + 1} / ${total}`;

  // バッジ
  const badge = document.getElementById('q-type-badge');
  badge.textContent = q.type === 'read' ? '📖 読み問題' : '✏️ 書き問題';
  badge.className = 'q-type-badge ' + q.type;

  // 問題文（例文）
  const sentEl = document.getElementById('q-sentence');
  const raw = q.entry.example;
  if (q.type === 'read') {
    // {} の中をハイライト表示
    sentEl.innerHTML = raw.replace(/\{(.+?)\}/g, '<span class="target-kanji">$1</span>');
  } else {
    // {} 内の漢字を読みに差し替え
    sentEl.innerHTML = raw.replace(/\{(.+?)\}/g,
      `<span class="target-reading">（${q.entry.reading}）</span>`);
  }

  // 指示文
  const promptEl = document.getElementById('q-prompt');
  if (q.type === 'read') {
    promptEl.textContent = `「${q.entry.kanji}」の読み方は？`;
  } else {
    promptEl.textContent = `（${q.entry.reading}）に当てはまる漢字は？`;
  }

  // 選択肢
  const choices = makeChoices(q);
  const grid = document.getElementById('choices-grid');
  grid.innerHTML = '';
  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = c;
    btn.onclick = () => checkAnswer(c, q, btn);
    grid.appendChild(btn);
  });

  // フィードバックを隠す
  document.getElementById('feedback-panel').classList.add('hidden');
  state.answered = false;
}

function makeChoices(q) {
  if (q.type === 'read') {
    const correct = q.entry.reading;
    const pool = shuffle([...new Set(kanjiData.map(e => e.reading))].filter(r => r !== correct));
    const wrongs = pool.slice(0, 3);
    return shuffle([correct, ...wrongs]);
  } else {
    const correct = q.entry.kanji;
    const pool = shuffle(kanjiData.map(e => e.kanji).filter(k => k !== correct));
    const wrongs = pool.slice(0, 3);
    return shuffle([correct, ...wrongs]);
  }
}

// =====================================================
// 解答チェック
// =====================================================
function checkAnswer(selected, q, btn) {
  if (state.answered) return;
  state.answered = true;

  const correct = q.type === 'read' ? q.entry.reading : q.entry.kanji;
  const isCorrect = selected === correct;

  // ボタンの色分け
  document.querySelectorAll('.choice-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent === correct) b.classList.add('correct');
  });
  if (!isCorrect) btn.classList.add('wrong');

  // フィードバック
  if (isCorrect) {
    state.correct++;
  } else {
    state.sessionMiss.push(q.entry.kanji);
  }

  const panel = document.getElementById('feedback-panel');
  panel.classList.remove('hidden');
  panel.className = 'feedback-panel ' + (isCorrect ? 'correct' : 'wrong');

  document.getElementById('feedback-mark').textContent = isCorrect ? '⭕' : '❌';
  document.getElementById('feedback-text').textContent =
    isCorrect ? 'すごい！正解！' : `正解は「${correct}」`;
  document.getElementById('feedback-meaning').textContent =
    `「${q.entry.kanji}」…${q.entry.meaning}`;

  // 最後の問題なら「結果を見る」ボタン
  const nextBtn = document.getElementById('next-btn');
  if (state.current >= state.questions.length - 1) {
    nextBtn.textContent = '結果を見る 🏁';
  } else {
    nextBtn.textContent = '次の問題 →';
  }
}

// =====================================================
// 次の問題
// =====================================================
function nextQuestion() {
  state.current++;
  if (state.current >= state.questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

// =====================================================
// 結果画面
// =====================================================
function showResult() {
  const total   = state.questions.length;
  const correct = state.correct;
  const pct     = Math.round(correct / total * 100);

  // 統計保存
  const stats = loadStats();
  stats.total   += total;
  stats.correct += correct;
  saveStats(stats);

  // 苦手リスト更新
  let miss = loadMiss();
  state.sessionMiss.forEach(k => { if (!miss.includes(k)) miss.push(k); });
  // 正解した漢字は苦手リストから外す
  state.questions.forEach(q => {
    if (!state.sessionMiss.includes(q.entry.kanji)) {
      miss = miss.filter(k => k !== q.entry.kanji);
    }
  });
  saveMiss(miss);

  // 表示
  document.getElementById('score-num').textContent = correct;
  document.getElementById('score-denom').textContent = `/ ${total} 問正解`;

  let stars, emoji, msg;
  if (pct === 100)      { stars = '⭐⭐⭐'; emoji = '🎉'; msg = 'かんぺき！すごすぎる！'; }
  else if (pct >= 80)   { stars = '⭐⭐';   emoji = '😊'; msg = 'すばらしい！'; }
  else if (pct >= 60)   { stars = '⭐';     emoji = '🙂'; msg = 'よくがんばりました！'; }
  else                  { stars = '';        emoji = '😤'; msg = 'もう一度チャレンジしよう！'; }

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-star').textContent  = stars;
  document.getElementById('result-msg').textContent   = msg;

  // 間違えた漢字リスト
  const missSection = document.getElementById('miss-section');
  const missList    = document.getElementById('miss-list');
  missList.innerHTML = '';

  if (state.sessionMiss.length > 0) {
    missSection.style.display = 'block';
    const uniqueMiss = [...new Set(state.sessionMiss)];
    uniqueMiss.forEach(k => {
      const entry = kanjiData.find(e => e.kanji === k);
      if (!entry) return;
      const item = document.createElement('div');
      item.className = 'miss-item';
      item.innerHTML = `<span class="miss-kanji">${k}</span><span class="miss-meaning">${entry.meaning}</span>`;
      missList.appendChild(item);
    });
  } else {
    missSection.style.display = 'none';
  }

  // 苦手ボタン表示制御
  document.getElementById('result-review-btn').style.display =
    state.sessionMiss.length > 0 ? 'block' : 'none';

  showScreen('result');
}

function retryQuiz() { startQuiz(state.mode); }

// =====================================================
// 初期化
// =====================================================
window.addEventListener('DOMContentLoaded', () => {
  updateHomeStats();
  showScreen('home');
});
