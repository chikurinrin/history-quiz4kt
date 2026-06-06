// ═══════════════════════════════════════════════════════
//  UNITS
// ═══════════════════════════════════════════════════════
const UNITS = [
  { id:1, name:'幼児の体の発達',         short:'体の発達',   color:'#1e3a8a', pages:'p.28-29' },
  { id:2, name:'幼児の心の発達',         short:'心の発達',   color:'#166534', pages:'p.30-31' },
  { id:3, name:'おとなの役割と生活習慣', short:'おとなの役割', color:'#581c87', pages:'p.32-33' },
  { id:4, name:'子どもの権利',           short:'子どもの権利', color:'#991b1b', pages:'p.54-55' },
];

// ═══════════════════════════════════════════════════════
//  QUESTIONS
//  a: 正解（choices の中の1つ）
//  exp: 解説
// ═══════════════════════════════════════════════════════
const QUESTIONS = [

  // ──── Unit 1: 幼児の体の発達 ────
  { id:101, unit:1, q:'出生時の平均身長はおよそ何cmか。', a:'約50cm', choices:['約50cm','約40cm','約60cm','約30cm'], exp:'出生時の平均身長は約50cm。1歳で約75cm（出生時の約1.5倍）、4歳で約100cm（出生時の約2倍）になる。' },
  { id:102, unit:1, q:'出生時の平均体重はおよそ何kgか。', a:'約3kg', choices:['約3kg','約2kg','約4kg','約5kg'], exp:'出生時の平均体重は約3kg。1歳で約9kg（出生時の約3倍）、4歳で約15kgになる。' },
  { id:103, unit:1, q:'1歳時の平均身長はおよそ何cmか。', a:'約75cm', choices:['約75cm','約60cm','約90cm','約50cm'], exp:'1歳では出生時（約50cm）の約1.5倍の約75cmになる。' },
  { id:104, unit:1, q:'4歳時の平均身長はおよそ何cmか。', a:'約100cm', choices:['約100cm','約80cm','約120cm','約90cm'], exp:'4歳では出生時（約50cm）の約2倍の約100cmになる。' },
  { id:105, unit:1, q:'1歳時の平均体重はおよそ何kgか。', a:'約9kg', choices:['約9kg','約6kg','約12kg','約5kg'], exp:'1歳では出生時（約3kg）の約3倍の約9kgになる。' },
  { id:106, unit:1, q:'4歳時の平均体重はおよそ何kgか。', a:'約15kg', choices:['約15kg','約10kg','約20kg','約12kg'], exp:'4歳では約15kg。乳幼児期は身長・体重ともに急速に増加する時期。' },
  { id:107, unit:1, q:'「発達」とはどのようなことか。', a:'心と体が成長し、いろいろなことができたり深く考えたりするようになっていくこと', choices:['心と体が成長し、いろいろなことができたり深く考えたりするようになっていくこと','身長と体重が増えること','年齢を重ねること','病気が治ること'], exp:'発達とは誕生から死ぬまで心と体が成長し、いろいろなことができたり深く考えたりするようになっていくことをいう。' },
  { id:108, unit:1, q:'体や運動機能の発達の「方向性」とはどのようなことか。', a:'頭部から下部へ・からだの中心から末端へ一定の方向に進んでいくこと', choices:['頭部から下部へ・からだの中心から末端へ一定の方向に進んでいくこと','発達の速度が一定であること','体が均等に成長すること','年齢に比例して発達すること'], exp:'方向性とは頭部から下部へ・中心から末端へなど、一定の方向に進んでいくこと。例：首がすわる→座る→立つ、の順。' },
  { id:109, unit:1, q:'体や運動機能の発達の「順序性」とはどのようなことか。', a:'首がすわり・座れるようになり・立つなど、発達が現れる順番がきまっていること', choices:['首がすわり・座れるようになり・立つなど、発達が現れる順番がきまっていること','早い子から順に発達すること','男女で発達の順番が異なること','すべての子が同時に発達すること'], exp:'順序性とは発達が現れる順番がきまっていること。例：首すわり→寝返り→お座り→はいはい→一人歩き の順で進む。' },
  { id:110, unit:1, q:'方向性・順序性とは別に、発達が現れる時期や期間に見られる違いを何というか。', a:'個人差', choices:['個人差','方向性','順序性','成長差'], exp:'方向性と順序性は同じだが、発達が現れる時期や期間には個人差が見られる。早い子も遅い子も最終的には発達する。' },
  { id:111, unit:1, q:'幼児の脈拍数は1分間に約何回か。', a:'約110回', choices:['約110回','約60回','約80回','約150回'], exp:'幼児の脈拍数は1分間に110回くらい。おとなは60〜80回。幼児は代謝が活発なため脈拍・呼吸数ともに多い。' },
  { id:112, unit:1, q:'幼児の脈拍数・呼吸数はおとなと比べてどうか。', a:'多い', choices:['多い','少ない','同じ','ゆっくりになっていく'], exp:'幼児の脈拍数（約110回/分）・呼吸数はおとな（脈拍60〜80回）より多い。体が小さく代謝が活発なため。' },
  { id:113, unit:1, q:'乳幼児はおとなと比べて頭の割合が大きいか・小さいか。', a:'大きい', choices:['大きい','小さい','同じ','成長とともに小さくなる'], exp:'乳幼児は体の大きさに比べて頭が大きいため、バランスが取りにくく、視野が狭い。事故に注意が必要。' },
  { id:114, unit:1, q:'全身の運動機能の発達で「はいはいする」はどの時期か。', a:'お座りができるようになった後・一人で歩く前', choices:['お座りができるようになった後・一人で歩く前','首がすわる前','寝返りの前','スキップの後'], exp:'発達順序：首がすわる→寝返り→お座り→はいはいする→一人で歩く→けんけんする→スキップする。' },
  { id:115, unit:1, q:'全身の運動機能の発達の順序として正しいものはどれか。', a:'首がすわる→寝返り→お座り→はいはい→一人歩き→けんけん→スキップ', choices:['首がすわる→寝返り→お座り→はいはい→一人歩き→けんけん→スキップ','寝返り→首がすわる→お座り→はいはい→一人歩き→スキップ→けんけん','首がすわる→お座り→寝返り→はいはい→けんけん→一人歩き→スキップ','お座り→首がすわる→寝返り→一人歩き→はいはい→けんけん→スキップ'], exp:'正しい順序：首がすわる（オ）→寝返り（イ）→お座り（ウ）→はいはいする（ア）→一人で歩く（キ）→けんけんする（カ）→スキップする（エ）。' },
  { id:116, unit:1, q:'手先の器用さの発達で最初に現れるのはどれか。', a:'にぎる', choices:['にぎる','スプーンで食べる','はさみを使う','箸が上手に使える'], exp:'手先の発達順序：にぎる（ウ）→両手でコップをもつ（イ）→スプーンで食べる（オ）→はさみを使う（エ）→箸が上手に使える（ア）。' },
  { id:117, unit:1, q:'手先の器用さの発達の順序として正しいものはどれか。', a:'にぎる→両手でコップをもつ→スプーンで食べる→はさみを使う→箸が上手に使える', choices:['にぎる→両手でコップをもつ→スプーンで食べる→はさみを使う→箸が上手に使える','箸→はさみ→スプーン→コップ→にぎる','スプーン→コップ→にぎる→はさみ→箸','にぎる→はさみ→スプーン→コップ→箸'], exp:'粗大運動（全身）から微細運動（手先）へ、また粗い動き（にぎる）から細かい動き（箸）へと発達する。' },
  { id:118, unit:1, q:'体の発達には方向性・順序性があるが、発達が現れる時期や期間には何があるか。', a:'個人差', choices:['個人差','地域差','性別差','年齢差'], exp:'方向性と順序性は一定だが、時期・期間には個人差がある。個人差を理解し、一人ひとりの発達を大切にすることが重要。' },

  // ──── Unit 2: 幼児の心の発達 ────
  { id:201, unit:2, q:'乳児とはどのように定義されるか。', a:'満1歳に満たない者', choices:['満1歳に満たない者','満2歳に満たない者','小学校入学前の子ども','満3歳に満たない者'], exp:'乳児：満1歳未満。幼児：満1歳から小学校就学前。' },
  { id:202, unit:2, q:'幼児とはどのように定義されるか。', a:'満1歳から小学校就学の始期に達するまでの者', choices:['満1歳から小学校就学の始期に達するまでの者','満2歳から満6歳まで','生後6ヶ月から満5歳まで','満3歳から小学校入学まで'], exp:'幼児は満1歳から小学校就学前まで。この時期は心も体も最も著しく発達する。' },
  { id:203, unit:2, q:'幼児の心の発達を4つの面からとらえるとき、その4つはどれか。', a:'言語・認知・情緒・社会性', choices:['言語・認知・情緒・社会性','言語・知識・感情・道徳','思考・記憶・感情・行動','言語・運動・感覚・感情'], exp:'心の発達の4側面：言語（コミュニケーション）・認知（世界の捉え方）・情緒（感情）・社会性（人とかかわる力）。これらは互いに関連して発達する。' },
  { id:204, unit:2, q:'生後2ヶ月ごろから機嫌の良いときに喉の奥からやわらかい発声をすることを何というか。', a:'クーイング', choices:['クーイング','喃語','一語文','二語文'], exp:'クーイングは「ア〜」「ウ〜」のような柔らかい発声。言語発達の最初のステップ。' },
  { id:205, unit:2, q:'生後6ヶ月以降に「パパパ」「マママ」のような子音と母音の連続を発するようになることを何というか。', a:'喃語（なんご）', choices:['喃語（なんご）','クーイング','一語文','言語爆発'], exp:'喃語は「バブバブ」「マンマンマン」のような子音と母音の繰り返し。コミュニケーションの前段階。' },
  { id:206, unit:2, q:'1歳ごろから「マンマ」「ワンワン」「ブーブー」などの一語文を話しはじめる。二語文を話すようになるのはいつごろか。', a:'2歳ごろ', choices:['2歳ごろ','1歳ごろ','3歳ごろ','4歳ごろ'], exp:'1歳→一語文、2歳→二語文（「マンマ チョウダイ」）、3歳→言葉のやりとり・「なんで？」の質問が増える。' },
  { id:207, unit:2, q:'1歳ごろに話しはじめる「ワンワン」「マンマ」のような言葉の形式を何というか。', a:'一語文', choices:['一語文','二語文','喃語','クーイング'], exp:'一語文は1単語で意味を伝える。「マンマ」＝「ごはんを食べたい」のように、一語に多くの意味が含まれる。' },
  { id:208, unit:2, q:'2歳ごろに話す「マンマ チョウダイ」のような言葉の形式を何というか。', a:'二語文', choices:['二語文','一語文','三語文','複合文'], exp:'二語文は2語を組み合わせて意思を伝える。「ブーブー キタ」「ワンワン イタ」など。2語つなげることで表現が豊かになる。' },
  { id:209, unit:2, q:'3歳ごろには何ができるようになるか。', a:'言葉のやりとり・「なんで？」「どうして？」の質問が増える', choices:['言葉のやりとり・「なんで？」「どうして？」の質問が増える','文字を読む','文章を書く','外国語を話す'], exp:'3歳になると日常会話が可能になり、「なんで？」「どうして？」という質問が多くなる。認知発達の表れ。' },
  { id:210, unit:2, q:'見知らぬ人があやそうとすると視線をそらしたり泣き叫んだりする乳児期の行動を何というか。', a:'人見知り（8ヶ月不安）', choices:['人見知り（8ヶ月不安）','分離不安','第一次反抗期','自己主張'], exp:'生後8ヶ月ごろから始まる。特定の人（主に母親）との愛着が形成され、見知らぬ人への不安が現れる。健全な発達のサイン。' },
  { id:211, unit:2, q:'人見知りは何ヶ月ごろから始まるか。', a:'8ヶ月ごろ', choices:['8ヶ月ごろ','3ヶ月ごろ','12ヶ月ごろ','2歳ごろ'], exp:'人見知り（8ヶ月不安）は生後8ヶ月ごろから。愛着関係が形成され、見知らぬ人と知っている人を区別できるようになった証拠。' },
  { id:212, unit:2, q:'2〜4歳にかけての「イヤイヤ期」を何というか。', a:'第一次反抗期', choices:['第一次反抗期','第二次反抗期','自我の芽生え期','社会性発達期'], exp:'第一次反抗期（2〜4歳）は自我が芽生え、「イヤ」「自分で」と言い張る時期。健全な自立への第一歩。' },
  { id:213, unit:2, q:'第一次反抗期は何が芽生えたことが原因か。', a:'自我（自己意識）', choices:['自我（自己意識）','知識','言語能力','運動能力'], exp:'自我が芽生え自己主張ができるようになった現れ。しかし言語発達が不十分なため気持ちをうまく伝えられず泣いたり暴れたりする。' },
  { id:214, unit:2, q:'情緒の発達で、幼児期末（4〜5歳）にはどのような変化があるか。', a:'自分の気持ちを抑え、相手の気持ちもわかるようになる', choices:['自分の気持ちを抑え、相手の気持ちもわかるようになる','第一次反抗期が始まる','大人と全く同じ感情が現れる','喜怒哀楽が消える'], exp:'4歳を過ぎると自分の気持ちを言葉で伝えたり、相手の気持ちを理解したりできるようになり、社会性も育つ。' },
  { id:215, unit:2, q:'花や木、月や太陽にも自分と同じように気持ちがあると考える幼児の思考を何というか。', a:'アニミズム', choices:['アニミズム','自己中心性','象徴的思考','直観的思考'], exp:'アニミズムは全ての物に生命・意識があるとみなす考え方。2〜3歳ごろに見られる認知発達の特徴。' },
  { id:216, unit:2, q:'「自分が好きなものは相手も好き」のように自分を中心に物事を考えることを何というか。', a:'自己中心性', choices:['自己中心性','アニミズム','第一次反抗期','象徴的思考'], exp:'幼児は自己中心的に物事を考える時期があるが、様々な経験を通して相手の立場でも考えられるようになる。' },
  { id:217, unit:2, q:'単語の音が入れ替わる言葉の間違いを何というか（例：エレベーター→エベレーター）。', a:'音位転換', choices:['音位転換','省略','置換','音韻錯誤'], exp:'音位転換は音の順序が入れ替わる間違い。エレベーター→エベレーター、などが例として挙げられる。' },
  { id:218, unit:2, q:'単語の子音を省略する言葉の間違いを何というか（例：スプーン→スプン）。', a:'省略', choices:['省略','音位転換','置換','脱落'], exp:'省略は単語の一部（特に子音）が抜ける間違い。スプーン→スプン、コップ→コプ など。' },
  { id:219, unit:2, q:'単語の音を言い換える言葉の間違いを何というか（例：タイヤ→テイヤ）。', a:'置換', choices:['置換','音位転換','省略','混合'], exp:'置換は音を別の音に言い換える間違い。「魚」→「おかな」→「おさかな」など。' },
  { id:220, unit:2, q:'子どもが言葉を言い誤った場合、おとなはどのように対応するとよいか。', a:'受けとめる（直接指摘せず自然に正しい表現で使う）', choices:['受けとめる（直接指摘せず自然に正しい表現で使う）','すぐに正しい言い方を教える','無視する','繰り返させる'], exp:'言い誤りは発達の過程で自然なもの。大人が正しい言葉でやりとりを続けることで自然に修正されていく。' },
  { id:221, unit:2, q:'社会性の発達には誰との関わりが重要か。', a:'身近な大人や友だちとの関わり', choices:['身近な大人や友だちとの関わり','同年齢の子どもだけとの関わり','テレビやスマホ','一人遊び'], exp:'社会性は身近な大人（親・保育士）のかかわりや友だちとの協力によって身についていく。' },
  { id:222, unit:2, q:'幼児の心の発達の4つの面（言語・認知・情緒・社会性）はどのような関係にあるか。', a:'それぞれ関連し合って発達する', choices:['それぞれ関連し合って発達する','別々に独立して発達する','順番に一つずつ発達する','社会性が最初に発達する'], exp:'言語・認知・情緒・社会性は互いに関連し合いながら発達する。例：言語が発達すると情緒をうまく伝えられるようになる。' },
  { id:223, unit:2, q:'思いや欲求を受けとめてもらう経験を重ねることで何が育つか。', a:'社会性', choices:['社会性','運動能力','言語能力','認知能力'], exp:'思いや欲求を受けとめてもらう経験を積むことで他者を受け入れられるようになり、社会性も育つ。' },

  // ──── Unit 3: おとなの役割と生活習慣 ────
  { id:301, unit:3, q:'食事・排せつ・睡眠・着脱衣・清潔などの生活行動を何というか。', a:'基本的生活習慣', choices:['基本的生活習慣','日常的生活習慣','社会的生活習慣','健康的生活習慣'], exp:'基本的生活習慣は健康に生きていくために欠かせない行動。幼児期はこれを身につけていく大切な時期。' },
  { id:302, unit:3, q:'幼児にとって遊びとは何か。', a:'学び（学習・発達の基盤）', choices:['学び（学習・発達の基盤）','時間つぶし','疲れを回復するもの','親との時間'], exp:'幼児は全身を動かして遊びながら、五感を働かせてものとかかわり、形・色・手触りなどの性質に気づいていく。遊びが学びの基盤。' },
  { id:303, unit:3, q:'幼児の生活の中心は何か。', a:'遊び', choices:['遊び','睡眠','食事','勉強'], exp:'幼児の生活の中心は遊び。遊ぶことを通して全身を動かし、五感をはたらかせ、周囲のものや人とかかわりながら発達する。' },
  { id:304, unit:3, q:'幼児が3回の食事以外に食べるおやつの役割は何か。', a:'胃が小さい幼児への栄養補給（補食）', choices:['胃が小さい幼児への栄養補給（補食）','お菓子を楽しむため','空腹を満たすだけのもの','特に意味がない'], exp:'幼児のおやつは単なるお菓子ではなく、一度にたくさん食べられない幼児への補食（栄養補給）として重要。' },
  { id:305, unit:3, q:'基本的生活習慣（食事・排せつ・睡眠・着脱衣・清潔）のうち「排せつ」で4歳ごろできるようになることは何か。', a:'一人でトイレに行き、排せつのしまつをする', choices:['一人でトイレに行き、排せつのしまつをする','オムツがとれる','夜尿がなくなる','排せつを大人に知らせる'], exp:'基本的生活習慣は運動機能の発達とともに一人でできることが増えていく。自分の力で行う達成感が自立の基盤となる。' },
  { id:306, unit:3, q:'成長のためのホルモンはいつ多く分泌されるか。', a:'睡眠中', choices:['睡眠中','食事中','運動中','起きている間'], exp:'成長ホルモンは睡眠中（特に深い眠り）に多く分泌される。幼児に昼寝が必要なのも夜の睡眠だけでは不十分なため。' },
  { id:307, unit:3, q:'生活のリズムを整えることの重要性は何か。', a:'心身の健やかな育ちを支え、他の生活習慣を習得する基盤となる', choices:['心身の健やかな育ちを支え、他の生活習慣を習得する基盤となる','早く大人になれる','友達が増える','成績が上がる'], exp:'生活リズム（睡眠・食事・遊びの規則正しいサイクル）を整えることが、幼児の心身発達と生活習慣習得の土台になる。' },
  { id:308, unit:3, q:'基本的生活習慣を身につける際に大切にするべきことは何か。', a:'幼児のやりたいという気持ちを大切にしながら支援すること', choices:['幼児のやりたいという気持ちを大切にしながら支援すること','大人が一方的に教えること','できるだけ早く習得させること','同年齢の子と同じ時期に習得させること'], exp:'子ども自身が必要性に気づき自分の力で行うことの達成感を味わいながら身につけていくことが大切。おとなの適切な支援が重要。' },
  { id:309, unit:3, q:'社会の一員として必要な生活習慣（あいさつ・安全のルール・公共のものを大切にする等）はどのように形成されるか。', a:'毎日の生活の積み重ねや人とのかかわりを通して次第に形成される', choices:['毎日の生活の積み重ねや人とのかかわりを通して次第に形成される','教科書で学ぶことで形成される','生まれつき持っているものである','大人に命令されることで形成される'], exp:'社会的な生活習慣はある日突然身につくものではなく、日々の生活の中での体験・人とのかかわりの積み重ねで徐々に形成される。' },
  { id:310, unit:3, q:'幼児が運動機能を発達させていくことで何ができるようになるか。', a:'自分の体を思うように動かせるようになり、身の回りのことを自分でしようとする', choices:['自分の体を思うように動かせるようになり、身の回りのことを自分でしようとする','他の子より早く走れるようになる','スポーツが得意になる','学校の勉強が得意になる'], exp:'運動機能が発達すると、自分の体をコントロールできるようになり、食事・着替え・トイレなど基本的生活習慣を自分でしようとする意欲が生まれる。' },

  // ──── Unit 4: 子どもの権利 ────
  { id:401, unit:4, q:'子どもの権利条約（児童の権利に関する条約）が国連で採択されたのはいつか。', a:'1989年', choices:['1989年','1979年','1999年','1945年'], exp:'1989年に国連総会で採択。子どもの人権を守り幸せに生活できることを目的とした世界初の国際的な条約。日本は1994年に批准。' },
  { id:402, unit:4, q:'日本が子どもの権利条約を批准したのはいつか。', a:'1994年', choices:['1994年','1989年','2000年','1951年'], exp:'日本は1994年に批准（世界158番目）。批准とは条約に正式に合意し国内でも守る義務を負うこと。' },
  { id:403, unit:4, q:'子どもの権利条約で定められた子どもの権利の4つとして正しいものはどれか。', a:'生きる権利・育つ権利・守られる権利・参加する権利', choices:['生きる権利・育つ権利・守られる権利・参加する権利','学ぶ権利・遊ぶ権利・働く権利・選ぶ権利','生きる権利・学ぶ権利・遊ぶ権利・自由の権利','食べる権利・住む権利・学ぶ権利・守られる権利'], exp:'①生きる権利（命を守られ健康に生きる）②育つ権利（教育を受け自分らしく育つ）③守られる権利（あらゆる虐待から守られる）④参加する権利（自由に意見を表明できる）。' },
  { id:404, unit:4, q:'「生きる権利」の内容として正しいものはどれか。', a:'防ぐことができる病気などで命を奪われないこと・病気やけがをしたら治療を受けられること', choices:['防ぐことができる病気などで命を奪われないこと・病気やけがをしたら治療を受けられること','自由に意見を表明できること','あらゆる種類の虐待から守られること','教育を受け休んだり遊んだりできること'], exp:'生きる権利：命の安全・医療を受ける権利。育つ権利：教育・遊び・休息。守られる権利：虐待・搾取からの保護。参加する権利：意見表明・集会の自由。' },
  { id:405, unit:4, q:'第二次世界大戦後の1951年5月5日（こどもの日）に制定された日本最初の子どもの権利宣言を何というか。', a:'児童憲章', choices:['児童憲章','児童福祉法','子どもの権利条約','少年法'], exp:'児童憲章（1951年）は日本国憲法の精神に基づき制定。「児童は人として尊ばれる」「社会の一員として重んぜられる」「よい環境の中で育てられる」の3条から成る。' },
  { id:406, unit:4, q:'児童福祉法で「全て児童は適切に養護され、健やかな成長・発達・自立が図られることを保障される権利を有する」と定めているが、この法律はいつ制定されたか。', a:'1947年', choices:['1947年','1951年','1989年','2000年'], exp:'児童福祉法は1947年に制定。戦後の子どもの福祉を守るための基本法。' },
  { id:407, unit:4, q:'児童虐待の防止に関する法律が施行されたのはいつか。', a:'2000年11月', choices:['2000年11月','1994年','1989年','2010年'], exp:'「児童虐待の防止等に関する法律」が2000年11月に施行。国・地方自治体の責任と義務、虐待を受けた子どもの保護が定められた。' },
  { id:408, unit:4, q:'子どもの相談窓口への連絡先電話番号（児童相談所全国共通ダイヤル）は何番か。', a:'189（いちはやく）', choices:['189（いちはやく）','110','119','120'], exp:'189（いちはやく）に電話すると近くの児童相談所につながる。子ども自身も、家族も、地域の人も誰でも相談できる。' },
  { id:409, unit:4, q:'フィンランドで妊婦に無料で支給される育児用品の詰め合わせを何というか。', a:'育児パッケージ（ベビーボックス）', choices:['育児パッケージ（ベビーボックス）','出産お見舞い金','育児補助金','子育て応援セット'], exp:'フィンランドの育児パッケージには約50点のベビー用品が入り、箱自体がベビーベッドとしても使える。社会全体で子育てを祝福するシンボル。' },
  { id:410, unit:4, q:'オレンジリボン運動の目的は何か。', a:'児童虐待防止', choices:['児童虐待防止','子どもの貧困防止','いじめ防止','孤独防止'], exp:'オレンジリボン運動はオレンジ色をシンボルカラーとして児童虐待の防止、撲滅に取り組む運動。' },
  { id:411, unit:4, q:'UNICEF（国連児童基金）の活動目的は何か。', a:'全ての子どもたちの権利が守られる世界の実現', choices:['全ての子どもたちの権利が守られる世界の実現','難民の支援','戦争の防止','貧困国への食料支援'], exp:'UNICEF（国連児童基金）は子どもたちの権利が守られる世界の実現のために、医療・教育・保護などの支援活動を行う。' },
  { id:412, unit:4, q:'日本版「ネウボラ（アドバイスの場）」は元々どの国の制度か。', a:'フィンランド', choices:['フィンランド','スウェーデン','ノルウェー','デンマーク'], exp:'フィンランドの「ネウボラ」は妊娠期から就学前まで、同じ担当者が継続的に子どもだけでなく家族全体をサポートする制度。日本でも取り組む自治体が増えている。' },
  { id:413, unit:4, q:'「守られる権利」の内容として正しいものはどれか。', a:'あらゆる種類の虐待・搾取・差別から守られること', choices:['あらゆる種類の虐待・搾取・差別から守られること','教育を受ける権利','自分の意見を発表できる権利','命が守られ健康でいられること'], exp:'守られる権利：虐待・搾取・差別からの保護。特に障がいのある子ども・少数民族の子どもなどは特別に守られる。' },
  { id:414, unit:4, q:'「参加する権利」の内容として正しいものはどれか。', a:'自由に意見を表したり・集まってグループをつくったり・自由な活動を行ったりできること', choices:['自由に意見を表したり・集まってグループをつくったり・自由な活動を行ったりできること','給付金をもらえること','学校に行かなくてよいこと','投票ができること'], exp:'参加する権利：意見表明の自由・集会・結社の自由。子どもが自分の生活に関わる事柄について意見を言える権利。' },
];

// ═══════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════
// progress[id]: 'ok' | 'ng' | 'un' | 'ex' | undefined
const state = {
  screen: 'home',
  questions: [],
  index: 0,
  results: {},   // { id: 'ok'|'ng'|'un'|'ex' } for current session
  cardState: 'front',  // 'front' | 'flipped' | 'quiz'
  hintUsed: false,
  progress: {},
};

const STORAGE_KEY = 'katei-exam-v1';

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Progress calc ──
function unitProgress(uid) {
  const qs = QUESTIONS.filter(q => q.unit === uid);
  const done = qs.filter(q => state.progress[q.id] === 'ok').length;
  return { total: qs.length, done };
}
function overallProgress() {
  const total = QUESTIONS.length;
  const done  = QUESTIONS.filter(q => state.progress[q.id] === 'ok').length;
  return { total, done };
}

// ── Header stats ──
function updateHeaderStats() {
  const ok = Object.values(state.progress).filter(v => v === 'ok').length;
  const ng = Object.values(state.progress).filter(v => v === 'ng').length;
  const un = Object.values(state.progress).filter(v => v === 'un').length;
  document.getElementById('hstat-ok').textContent = ok;
  document.getElementById('hstat-ng').textContent = ng;
  document.getElementById('hstat-un').textContent = un;
}

// ═══════════════════════════════════════════════════════
//  SCREEN
// ═══════════════════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ═══════════════════════════════════════════════════════
//  HOME
// ═══════════════════════════════════════════════════════
function renderHome() {
  const { total, done } = overallProgress();
  const pct = total ? Math.round(done / total * 100) : 0;
  document.getElementById('overall-pct').textContent   = pct + '%';
  document.getElementById('overall-done').textContent  = done;
  document.getElementById('overall-total').textContent = total;
  document.getElementById('overall-bar').style.width   = pct + '%';

  // Unit grid
  const grid = document.getElementById('unit-grid');
  grid.innerHTML = '';
  UNITS.forEach(u => {
    const prog = unitProgress(u.id);
    const upct = prog.total ? Math.round(prog.done / prog.total * 100) : 0;
    const btn = document.createElement('button');
    btn.className = 'unit-card';
    btn.style.background = u.color;
    btn.innerHTML = `
      <div class="unit-num">UNIT ${u.id}　${u.pages}</div>
      <div class="unit-name">${u.name}</div>
      <div class="unit-sub">${prog.done} / ${prog.total} 問マスター</div>
      <div class="unit-prog"><div class="unit-prog-fill" style="width:${upct}%"></div></div>
    `;
    btn.addEventListener('click', () => startQuiz([u.id]));
    grid.appendChild(btn);
  });

  // Stats chart
  renderChart();
  updateHeaderStats();
}

function renderChart() {
  const chart = document.getElementById('stats-chart');
  chart.innerHTML = `
    <div class="chart-legend">
      <div class="chart-legend-item"><div class="chart-dot ok"></div>正解</div>
      <div class="chart-legend-item"><div class="chart-dot ng"></div>不正解</div>
      <div class="chart-legend-item"><div class="chart-dot un"></div>自信なし</div>
    </div>
  `;
  UNITS.forEach(u => {
    const qs = QUESTIONS.filter(q => q.unit === u.id);
    const total = qs.length;
    const ok = qs.filter(q => state.progress[q.id] === 'ok').length;
    const ng = qs.filter(q => state.progress[q.id] === 'ng').length;
    const un = qs.filter(q => state.progress[q.id] === 'un').length;
    const okPct = total ? (ok / total * 100).toFixed(1) : 0;
    const ngPct = total ? (ng / total * 100).toFixed(1) : 0;
    const unPct = total ? (un / total * 100).toFixed(1) : 0;

    const row = document.createElement('div');
    row.className = 'chart-row';
    row.innerHTML = `
      <div class="chart-row-label">
        <span style="color:${u.color};font-weight:800;">Unit ${u.id}: ${u.short}</span>
        <span style="color:var(--muted);font-size:11px;">${ok+ng+un} / ${total} 回答済</span>
      </div>
      <div class="chart-bar-wrap">
        <div class="chart-seg ok" style="width:${okPct}%"></div>
        <div class="chart-seg ng" style="width:${ngPct}%"></div>
        <div class="chart-seg un" style="width:${unPct}%"></div>
      </div>
      <div class="chart-count">正解 ${ok}　不正解 ${ng}　自信なし ${un}　未回答 ${total - ok - ng - un}</div>
    `;
    chart.appendChild(row);
  });
}

// ═══════════════════════════════════════════════════════
//  QUIZ
// ═══════════════════════════════════════════════════════
function startQuiz(unitIds, filterMode = null) {
  // filterMode: null=全問, 'ng'=不正解のみ, 'ng-un'=不正解+自信なし
  let qs = QUESTIONS.filter(q => unitIds.includes(q.unit));
  if (filterMode === 'ng') {
    qs = qs.filter(q => state.progress[q.id] === 'ng');
  } else if (filterMode === 'ng-un') {
    qs = qs.filter(q => state.progress[q.id] === 'ng' || state.progress[q.id] === 'un');
  }

  if (qs.length === 0) {
    alert('対象の問題がありません。先に全問に取り組んでください。');
    return;
  }

  state.questions = shuffle(qs);
  state.index = 0;
  state.results = {};
  state.currentUnitIds = unitIds;
  state.currentFilterMode = filterMode;

  showScreen('screen-quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = state.questions[state.index];
  const total = state.questions.length;
  const idx = state.index;

  // Badge
  const unit = UNITS.find(u => u.id === q.unit);
  const badge = document.getElementById('quiz-badge');
  badge.textContent = unit ? unit.short : '';
  badge.style.background = unit ? unit.color : '#1e3a8a';

  // Count
  document.getElementById('quiz-count').textContent = `${idx + 1} / ${total}`;

  // Progress bar
  document.getElementById('quiz-prog-fill').style.width = ((idx / total) * 100) + '%';

  // Build card
  state.cardState = 'front';
  state.hintUsed = false;

  const area = document.getElementById('quiz-area');
  area.innerHTML = `
    <div class="q-card" id="q-card">
      <div class="q-keyword" style="background:${unit ? unit.color : '#1e3a8a'}">${unit ? unit.name : ''}</div>
      <div class="q-text" id="q-text">${q.q}</div>
    </div>
    <button class="btn-quiz-hint" id="btn-hint">💡 わからない？ 4択ヒントで解く</button>
    <button class="btn-reveal" id="btn-reveal">答えを見る</button>
  `;

  document.getElementById('btn-reveal').addEventListener('click', revealAnswer);
  document.getElementById('btn-hint').addEventListener('click', showHint);
}

function revealAnswer() {
  const q = state.questions[state.index];
  const unit = UNITS.find(u => u.id === q.unit);
  const area = document.getElementById('quiz-area');

  area.innerHTML = `
    <div class="q-card q-card-sm">
      <div class="q-text-sm">${q.q}</div>
    </div>
    <div class="answer-card">
      <div class="answer-label">答え</div>
      <div class="answer-text">${q.a}</div>
      <div class="answer-exp">${q.exp}</div>
    </div>
    ${state.hintUsed ? '<div class="quiz-hint-note">※ ヒント（4択）を使用しました</div>' : ''}
    <div class="self-rate-area">
      <div class="self-rate-label">この問題の結果を選んでください</div>
      <div class="self-rate-btns">
        <button class="self-btn ok" data-rate="ok">✓ 正解</button>
        <button class="self-btn ng" data-rate="ng">✗ 不正解</button>
        <button class="self-btn un" data-rate="un">△ 自信なし</button>
        <button class="self-btn ex" data-rate="ex">― 対象外</button>
      </div>
    </div>
  `;

  area.querySelectorAll('.self-btn').forEach(btn => {
    btn.addEventListener('click', () => rateQuestion(btn.dataset.rate));
  });
}

function showHint() {
  const q = state.questions[state.index];
  const unit = UNITS.find(u => u.id === q.unit);
  state.hintUsed = true;
  state.cardState = 'quiz';

  const shuffledChoices = shuffle(q.choices);
  const area = document.getElementById('quiz-area');

  area.innerHTML = `
    <div class="q-card flash-q-card">
      <div class="q-keyword" style="background:${unit ? unit.color : '#1e3a8a'}">${unit ? unit.name : ''}</div>
      <div class="q-text">${q.q}</div>
      <div class="quiz-hint-note">💡 4択ヒントを使用中</div>
    </div>
    <div class="choices" id="choices"></div>
    <div class="feedback" id="feedback"></div>
  `;

  const choicesEl = document.getElementById('choices');
  shuffledChoices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = c;
    btn.addEventListener('click', () => handleChoiceClick(btn, c, q));
    choicesEl.appendChild(btn);
  });
}

function handleChoiceClick(btn, choice, q) {
  const allBtns = document.querySelectorAll('.choice-btn');
  allBtns.forEach(b => {
    b.disabled = true;
    if (b.textContent === q.a) b.classList.add('show-correct');
  });

  const isCorrect = choice === q.a;
  btn.classList.add(isCorrect ? 'correct' : 'wrong');

  const fb = document.getElementById('feedback');
  fb.className = `feedback show ${isCorrect ? 'ok' : 'ng'}`;
  fb.innerHTML = `
    <div class="feedback-label">${isCorrect ? '✓ 正解！' : '✗ 不正解'}</div>
    <div>正解：<strong>${q.a}</strong></div>
    <div class="feedback-exp">${q.exp}</div>
  `;

  // 4択のあとに自己採点ボタンを表示
  setTimeout(() => {
    const area = document.getElementById('quiz-area');
    const rateDiv = document.createElement('div');
    rateDiv.className = 'self-rate-area';
    rateDiv.innerHTML = `
      <div class="self-rate-label">この問題の結果を選んでください</div>
      <div class="self-rate-btns">
        <button class="self-btn ok" data-rate="ok">✓ 正解</button>
        <button class="self-btn ng" data-rate="ng">✗ 不正解</button>
        <button class="self-btn un" data-rate="un">△ 自信なし</button>
        <button class="self-btn ex" data-rate="ex">― 対象外</button>
      </div>
    `;
    area.appendChild(rateDiv);
    rateDiv.querySelectorAll('.self-btn').forEach(b => {
      b.addEventListener('click', () => rateQuestion(b.dataset.rate));
    });
  }, 400);
}

function rateQuestion(rate) {
  const q = state.questions[state.index];
  state.results[q.id] = rate;
  state.progress[q.id] = rate;
  saveProgress();
  updateHeaderStats();

  state.index++;
  if (state.index >= state.questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

// ═══════════════════════════════════════════════════════
//  RESULT
// ═══════════════════════════════════════════════════════
function showResult() {
  const results = state.results;
  const ids = Object.keys(results);
  const ok = ids.filter(id => results[id] === 'ok').length;
  const ng = ids.filter(id => results[id] === 'ng').length;
  const un = ids.filter(id => results[id] === 'un').length;
  const ex = ids.filter(id => results[id] === 'ex').length;
  const counted = ok + ng + un;
  const pct = counted ? Math.round(ok / counted * 100) : 0;

  document.getElementById('res-pct').textContent = pct;
  document.getElementById('res-ok').textContent  = ok;
  document.getElementById('res-ng').textContent  = ng;
  document.getElementById('res-un').textContent  = un;
  document.getElementById('res-ex').textContent  = ex;

  let msg = '', sub = '';
  if (pct >= 90) { msg = '完璧です！ 本番も大丈夫！'; sub = 'すばらしい結果です。'; }
  else if (pct >= 70) { msg = 'よくできました！'; sub = '苦手な問題をもう一度復習しよう。'; }
  else if (pct >= 50) { msg = 'もう少し！'; sub = '間違えた問題を中心に復習しよう。'; }
  else { msg = 'まだまだこれから！'; sub = '繰り返し練習して覚えよう。'; }

  document.getElementById('res-msg').textContent = msg;
  document.getElementById('res-sub').textContent = sub;

  // Wrong / unsure list
  const list = document.getElementById('wrong-list');
  list.innerHTML = '';
  const ngUnItems = Object.entries(results)
    .filter(([, v]) => v === 'ng' || v === 'un')
    .map(([id, v]) => ({ q: QUESTIONS.find(q => q.id === parseInt(id)), rate: v }))
    .filter(item => item.q);

  if (ngUnItems.length === 0) {
    list.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:16px;">なし</div>';
  } else {
    ngUnItems.forEach(({ q, rate }) => {
      const item = document.createElement('div');
      item.className = `wrong-item ${rate}`;
      const badge = rate === 'ng'
        ? '<span class="wrong-badge ng">不正解</span>'
        : '<span class="wrong-badge un">自信なし</span>';
      item.innerHTML = `
        <div class="wrong-q">${q.q}${badge}</div>
        <div class="wrong-ans">正解：<span>${q.a}</span></div>
      `;
      list.appendChild(item);
    });
  }

  // Toggle retry buttons visibility
  const hasNg   = Object.values(results).some(v => v === 'ng');
  const hasNgUn = Object.values(results).some(v => v === 'ng' || v === 'un');
  document.getElementById('res-retry-ng').style.display    = hasNg    ? 'block' : 'none';
  document.getElementById('res-retry-ng-un').style.display = hasNgUn && (un > 0) ? 'block' : 'none';

  showScreen('screen-result');
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
function init() {
  state.progress = loadProgress();
  renderHome();
  showScreen('screen-home');

  // Home buttons
  document.getElementById('btn-all-flash').addEventListener('click', () => {
    startQuiz(UNITS.map(u => u.id));
  });
  document.getElementById('btn-weak-ng').addEventListener('click', () => {
    startQuiz(UNITS.map(u => u.id), 'ng');
  });
  document.getElementById('btn-weak-ng-un').addEventListener('click', () => {
    startQuiz(UNITS.map(u => u.id), 'ng-un');
  });

  // Quiz back button
  document.getElementById('quiz-back-btn').addEventListener('click', () => {
    renderHome();
    showScreen('screen-home');
  });

  // Result buttons
  document.getElementById('res-home-btn').addEventListener('click', () => {
    renderHome();
    showScreen('screen-home');
  });
  document.getElementById('res-retry-ng').addEventListener('click', () => {
    startQuiz(UNITS.map(u => u.id), 'ng');
  });
  document.getElementById('res-retry-ng-un').addEventListener('click', () => {
    startQuiz(UNITS.map(u => u.id), 'ng-un');
  });
}

init();
