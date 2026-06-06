const questions = [
  // ── カテゴリ1: 生物育成の基本 ──
  {
    cat: "生物育成の基本",
    q: "生物育成の技術は主に２つに分類される。「成長を管理する技術」と並ぶもう一つはどれか？",
    choices: ["環境を調節する技術", "品種改良の技術", "バイオテクノロジー", "養殖技術"],
    ans: 0,
    exp: "生物育成の技術は「成長を管理する技術」と「環境を調節する技術」の２つに分類される。"
  },
  {
    cat: "生物育成の基本",
    q: "「品種」の説明として最も正しいものはどれか？",
    choices: [
      "同じ種の中で、他の集団と区別できる形や性質を持つ１つの集団",
      "遺伝子を人工的に操作した生物",
      "同じ種の中で最も収穫量が多い個体",
      "自然に突然変異で生まれた新しい生物"
    ],
    ans: 0,
    exp: "品種とは、同じ種の作物や家畜の中で、ほかの集団とは明らかに区別できる形や性質を持つ１つの集団のこと。"
  },
  {
    cat: "生物育成の基本",
    q: "「成長を管理する技術」の例として正しいのはどれか？",
    choices: ["摘芽・摘しん", "温度管理", "湿度管理", "人工照明"],
    ans: 0,
    exp: "摘芽・摘しんは生物の成長段階に合わせて管理する「成長を管理する技術」。温度・湿度・人工照明は「環境を調節する技術」。"
  },
  {
    cat: "生物育成の基本",
    q: "ビニルハウスで栽培することは、どちらの技術に当たるか？",
    choices: ["環境を調節する技術", "成長を管理する技術", "品種改良の技術", "バイオテクノロジー"],
    ans: 0,
    exp: "ビニルハウスは作物の周りの温度・湿度・光などの環境を整える「環境を調節する技術」。"
  },

  // ── カテゴリ2: 環境の3要素 ──
  {
    cat: "環境の3要素",
    q: "次のうち「気象的な要素」に含まれるのはどれか？",
    choices: ["日照・採光・風", "害虫・病原菌・雑草", "養分・水分・空気", "農薬・牛乳・酢"],
    ans: 0,
    exp: "気象的な要素は気温・湿度・日照・採光・風・水分量・人工照明など。害虫は生物的要素、養分は土壌的要素。"
  },
  {
    cat: "環境の3要素",
    q: "「生物的な要素」に含まれるものはどれか？",
    choices: ["害虫・病原菌・雑草", "気温・湿度・日照", "養分・水分・性質", "温度・空気・採光"],
    ans: 0,
    exp: "生物的な要素は、害虫・病原菌・鳥・土中の生物・雑草など、作物の周りにいる生き物。"
  },
  {
    cat: "環境の3要素",
    q: "「土壌的な要素」に含まれるのはどれか？",
    choices: ["養分・水分・空気・温度・性質", "気温・湿度・日照・風", "害虫・病原菌・雑草", "農薬・肥料・農具"],
    ans: 0,
    exp: "土壌的な要素は、土の中の養分・水分・空気・温度・性質など。"
  },
  {
    cat: "環境の3要素",
    q: "「人工照明」は環境の3要素のうちどれに分類されるか？",
    choices: ["気象的な要素", "生物的な要素", "土壌的な要素", "化学的な要素"],
    ans: 0,
    exp: "人工照明は光（日照）の代わりになるものなので、気象的な要素に含まれる。"
  },
  // ── カテゴリ3: 土と培養液 ──
  {
    cat: "土と培養液",
    q: "作物の栽培方法として正しい組み合わせはどれか？",
    choices: ["容器栽培・溶液栽培・土耕栽培", "水耕栽培・砂耕栽培・岩耕栽培", "温室栽培・露地栽培・海中栽培", "有機栽培・化学栽培・自然栽培"],
    ans: 0,
    exp: "栽培方法は容器栽培・溶液栽培・土耕栽培の３種類。溶液栽培は土を使わず培養液で育てる。"
  },
  {
    cat: "土と培養液",
    q: "栽培に適した土の構造で、水はけや通気性が良い構造はどれか？",
    choices: ["団粒構造", "単粒構造", "層状構造", "網状構造"],
    ans: 0,
    exp: "団粒構造は土の粒が集まって小さな塊になった構造で、通気性・保水性・排水性がバランスよく優れている。単粒構造は隙間が少なく水はけが悪い。"
  },
  {
    cat: "土と培養液",
    q: "栽培に適した土の性質として正しくないのはどれか？",
    choices: ["強い酸性（pH3以下）", "通気性がある", "保水性・排水性がある", "保肥力がある"],
    ans: 0,
    exp: "栽培に適した土は中性（pH6～7程度）が多い。強酸性は多くの作物に不向き。通気性・保水性・排水性・保肥力は必要な性質。"
  },

  // ── カテゴリ4: 肥料 ──
  {
    cat: "肥料",
    q: "肥料の三要素として正しい組み合わせはどれか？",
    choices: ["窒素・リン・カリウム", "炭素・酸素・水素", "カルシウム・マグネシウム・硫黄", "鉄・亜鉛・マンガン"],
    ans: 0,
    exp: "肥料の三要素は窒素（N）・リン（P）・カリウム（K）。窒素は葉、リンは花・実、カリウムは根を育てるといわれる。"
  },
  {
    cat: "肥料",
    q: "肥料の種類の説明で正しいのはどれか？",
    choices: [
      "有機質肥料は動植物由来、化学肥料は化学的に合成したもの",
      "有機質肥料は速効性が高く、化学肥料は効きが遅い",
      "化学肥料は土壌を豊かにし、有機質肥料は即効性がある",
      "どちらも同じ成分で違いはない"
    ],
    ans: 0,
    exp: "有機質肥料は動植物由来（堆肥・魚粉など）で徐々に効く。化学肥料は化学的に合成し速効性がある。"
  },

  // ── カテゴリ5: 病害虫 ──
  {
    cat: "病害虫",
    q: "作物につく害虫として正しい組み合わせはどれか？",
    choices: ["アブラムシ・ヨトウムシ", "ミミズ・ダンゴムシ", "テントウムシ・ハチ", "蝶・トンボ"],
    ans: 0,
    exp: "アブラムシ・ヨトウムシが代表的な害虫。ミミズは土をよくする益虫。テントウムシはアブラムシを食べる天敵。"
  },
  {
    cat: "病害虫",
    q: "害虫対策（予防・対処）として使われないのはどれか？",
    choices: ["化学肥料", "防虫ネット", "コンパニオンプランツ", "酢"],
    ans: 0,
    exp: "害虫対策は防虫ネット・コンパニオンプランツ・農薬・牛乳・酢など。化学肥料は害虫対策ではなく肥料。"
  },
  {
    cat: "病害虫",
    q: "「コンパニオンプランツ」とは何か？",
    choices: [
      "一緒に植えると互いに良い影響を与え、害虫を防ぐ植物",
      "害虫を引き寄せるおとり植物",
      "化学薬品で作られた人工植物",
      "肥料の代わりに使う植物"
    ],
    ans: 0,
    exp: "コンパニオンプランツは一緒に植えることで害虫を追い払ったり病気を防いだりする相性の良い植物の組み合わせ。"
  },

  // ── カテゴリ6: 成長管理技術 ──
  {
    cat: "成長管理技術",
    q: "種を１粒ずつ間隔をあけてまく方法はどれか？",
    choices: ["点まき", "ばらまき", "すじまき", "重ねまき"],
    ans: 0,
    exp: "点まきは種を１か所に数粒、または１粒ずつ等間隔に置くまき方。大きな種に向いている。"
  },
  {
    cat: "成長管理技術",
    q: "種を条（すじ）に沿って連続してまく方法はどれか？",
    choices: ["すじまき", "点まき", "ばらまき", "条まき"],
    ans: 0,
    exp: "すじまきは溝（すじ）を作ってそこに種を連続してまく方法。小松菜やニンジンなどに使われる。"
  },
  {
    cat: "成長管理技術",
    q: "種を広い面積にまんべんなく散らしてまく方法はどれか？",
    choices: ["ばらまき", "点まき", "すじまき", "株まき"],
    ans: 0,
    exp: "ばらまきは種を広い面積に均一に散らしてまく方法。小さな種や芝生に適している。点まき・すじまきとあわせて種まき3種類として覚えよう。"
  },
  {
    cat: "成長管理技術",
    q: "「間引き」の目的として正しいのはどれか？",
    choices: [
      "密集した苗を減らし、丈夫な苗を育てるため",
      "わき芽を取り除き、実に栄養を集めるため",
      "種まきを均一に行うため",
      "土の水分を調節するため"
    ],
    ans: 0,
    exp: "間引きは種を多くまいた後、密集した状態から少数の丈夫な苗を残す作業。残った苗が大きく育つ。"
  },
  {
    cat: "成長管理技術",
    q: "「移植」とはどういう作業か？",
    choices: [
      "発芽した苗を別の場所や容器に植え替える",
      "苗を最終的に育てる畑などに植える",
      "密集した苗を間引いて減らす",
      "種を土の中に埋める"
    ],
    ans: 0,
    exp: "移植は発芽した苗を別の場所や容器に植え替えること。その後、最終的に育てる場所に植える「定植」と区別して覚えよう。"
  },
  {
    cat: "成長管理技術",
    q: "「定植」とはどういう作業か？",
    choices: [
      "苗を最終的に育てる場所（畑・プランターなど）に植えること",
      "発芽した苗を一時的に別の容器に移すこと",
      "密集した苗を間引くこと",
      "種を土の中に埋めること"
    ],
    ans: 0,
    exp: "定植は育てた苗を最終的に育てる場所に植えること。一時的に別の場所に植え替える「移植」と区別して覚えよう。"
  },
  {
    cat: "成長管理技術",
    q: "「摘芽（てきが）」とはどういう作業か？",
    choices: ["わき芽を摘み取ること", "花を摘み取ること", "実を摘み取ること", "枯れた葉を取り除くこと"],
    ans: 0,
    exp: "摘芽はわき芽（脇芽）を摘み取ること。必要な養分を目的の実や茎に集め、大きく育てる。"
  },
  {
    cat: "成長管理技術",
    q: "「摘しん（摘心）」とはどういう作業か？",
    choices: [
      "茎の先端（生長点）を摘み取り、わき芽を育てる",
      "わき芽を摘み取り、主茎に栄養を集める",
      "余分な実を摘み取り、残りの実を大きくする",
      "花を摘み取り、実に栄養を送る"
    ],
    ans: 0,
    exp: "摘しんは茎の先端（生長点）を摘み取ること。わき芽が育ち横に広がってたくさんの実がなる。わき芽を取る「摘芽」と混同しないよう注意。"
  },
  {
    cat: "成長管理技術",
    q: "「摘果（てきか）」とはどういう作業か？",
    choices: ["余分な実を摘み取り、残りの実を大きくすること", "花を摘み取ること", "わき芽を取ること", "根を切ること"],
    ans: 0,
    exp: "摘果は果実が多すぎる場合に余分な実を取り除いて、残りの実に養分を集めて大きな実にする作業。"
  },
  {
    cat: "成長管理技術",
    q: "同じ作物を同じ場所で毎年続けて栽培すると起こる問題を何というか？",
    choices: ["連作障害", "連続栽培障害", "土壌破壊", "養分欠乏症"],
    ans: 0,
    exp: "連作障害は同じ作物を同じ土地で繰り返し栽培すると病気や害虫が増え、生育が悪くなる問題。"
  },
  {
    cat: "成長管理技術",
    q: "「支柱立て・誘引」は何のために行うか？",
    choices: ["茎を支え、倒れるのを防ぐため", "実を大きくするため", "害虫を防ぐため", "根を育てるため"],
    ans: 0,
    exp: "支柱立て・誘引は茎を支柱に固定して、風などで倒れるのを防ぎ、日光が当たりやすくする作業。"
  },
  {
    cat: "成長管理技術",
    q: "「かん水」とはどういう作業か？",
    choices: ["根元に水をやること", "葉に水をかけること", "肥料水を与えること", "土を湿らせておくこと"],
    ans: 0,
    exp: "かん水は植物の根元に水を与えること。水は根から吸い上げられ茎・葉に行き渡る。"
  },

  // ── カテゴリ7: 乳牛・酪農 ──
  {
    cat: "乳牛・酪農",
    q: "乳牛の品種として正しい組み合わせはどれか？",
    choices: ["ホルスタイン種・ジャージー種", "アンガス種・ヘレフォード種", "チャロレー種・リムーザン種", "和牛・黒毛和種"],
    ans: 0,
    exp: "ホルスタイン種は白黒模様で乳量が多い代表的乳牛。ジャージー種は小型で乳脂肪分が高い。"
  },
  {
    cat: "乳牛・酪農",
    q: "乳牛から乳を搾る機械の名称はどれか？",
    choices: ["ミルカー", "ロータリパーラ", "インキュベーター", "フィーダー"],
    ans: 0,
    exp: "ミルカーは搾乳機のこと。乳房に取り付けて機械的に乳を搾る。"
  },
  {
    cat: "乳牛・酪農",
    q: "「ロータリパーラ（ロータリーミルキングパーラー）」とはどういう設備か？",
    choices: [
      "牛が回転台に乗り、連続的に搾乳できる回転式設備",
      "牛を自動で移動させる搬送設備",
      "牛の体重を自動計測する設備",
      "牛乳を殺菌処理する機器"
    ],
    ans: 0,
    exp: "ロータリパーラ（ロータリーミルキングパーラー）は、牛が乗る回転台を使い多頭数を効率よく搾乳する設備。"
  },
  {
    cat: "乳牛・酪農",
    q: "乳牛の生産を専門とする農業を何というか？",
    choices: ["酪農", "肉牛農業", "繁殖農業", "集約農業"],
    ans: 0,
    exp: "酪農は乳牛を飼育して牛乳・乳製品を生産する農業。"
  },
  {
    cat: "乳牛・酪農",
    q: "乳牛の環境を調節する技術として正しい組み合わせはどれか？",
    choices: ["温度管理・湿度管理", "明るさの管理・温度管理", "水温管理・塩分管理", "採光管理・風量管理"],
    ans: 0,
    exp: "乳牛は温度管理と湿度管理が重要。快適な環境を保つことで乳の生産量・品質が安定する。"
  },

  // ── カテゴリ8: 採卵鶏 ──
  {
    cat: "採卵鶏",
    q: "「採卵鶏」と「食用鶏」の違いとして正しいのはどれか？",
    choices: [
      "採卵鶏は卵を産ませる目的、食用鶏は肉を取る目的で飼育する",
      "採卵鶏は肉が柔らかく、食用鶏は卵の殻が薄い",
      "採卵鶏は野外で、食用鶏はケージで飼う",
      "採卵鶏は輸入品、食用鶏は国産品"
    ],
    ans: 0,
    exp: "採卵鶏は卵を産ませる目的で飼育する鶏。食用鶏（ブロイラー）は肉を取る目的で短期間に育てる。"
  },
  {
    cat: "採卵鶏",
    q: "採卵鶏の「明るさの管理」で使うものはどれか？",
    choices: ["人工照明", "ビニルハウス", "防虫ネット", "温風ヒーター"],
    ans: 0,
    exp: "採卵鶏は明るさ（照明時間）が産卵に影響する。人工照明で日照時間を調節し、安定した産卵を促す。"
  },
  {
    cat: "採卵鶏",
    q: "採卵鶏の健康を守るために行う作業はどれか？",
    choices: ["予防接種", "間引き", "摘芽", "支柱立て"],
    ans: 0,
    exp: "採卵鶏にはニワトリの病気を予防するための予防接種を行う。"
  },

  // ── カテゴリ9: ブタ ──
  {
    cat: "ブタ",
    q: "ブタを育てる目的による分類として正しいのはどれか？",
    choices: ["繁殖用・食肉用", "採卵用・食肉用", "乳用・繁殖用", "採毛用・食肉用"],
    ans: 0,
    exp: "ブタは繁殖用（子豚を産ませる）と食肉用（肉として出荷する）に分けて管理される。"
  },
  {
    cat: "ブタ",
    q: "ブタの環境を調節する技術で特に重要なのはどれか？",
    choices: ["温度管理", "明るさの管理", "塩分濃度の管理", "水深の管理"],
    ans: 0,
    exp: "ブタは体温調節が苦手なため、豚舎の温度管理が非常に重要。快適な温度環境で健康に育てる。"
  },

  // ── カテゴリ10: 水産生物 ──
  {
    cat: "水産生物",
    q: "水産生物を育てる環境調節の要素として正しい組み合わせはどれか？",
    choices: ["水温・塩分濃度・水槽", "温度・湿度・明るさ", "養分・空気・性質", "日照・風・採光"],
    ans: 0,
    exp: "水産生物の環境調節は水温・塩分濃度・水槽（水質）の管理が重要。"
  },
  {
    cat: "水産生物",
    q: "卵から育てた魚を海に放流して資源を守る取り組みを何というか？",
    choices: ["海洋保全", "完全養殖", "栽培漁業", "海洋牧場"],
    ans: 0,
    exp: "海洋保全は海の環境や水産資源を守る取り組み全般。稚魚の放流なども含まれる。"
  },
  {
    cat: "水産生物",
    q: "人工ふ化から育てた魚を親魚にして卵を産ませ、すべてを養殖で管理する技術を何というか？",
    choices: ["完全養殖", "半養殖", "海洋保全", "人工孵化技術"],
    ans: 0,
    exp: "完全養殖は天然の親魚を使わず、養殖魚を親にして次の世代も養殖で育てる技術。マグロで有名。"
  },
  {
    cat: "水産生物",
    q: "「完全養殖」に成功した魚として最も有名なのはどれか？",
    choices: ["マグロ", "サケ", "タイ", "カツオ"],
    ans: 0,
    exp: "マグロの完全養殖は日本の技術として有名。天然マグロに頼らず安定供給を目指している。"
  },

  // ── カテゴリ11: 品種改良・バイオテクノロジー ──
  {
    cat: "品種改良・バイオテクノロジー",
    q: "「バイオテクノロジー」の説明として正しいのはどれか？",
    choices: [
      "生物が持っている機能を引き出し、効率的に利用する技術",
      "機械を使って生物を大量生産する技術",
      "化学薬品で生物の遺伝子を破壊する技術",
      "人工知能で農業を自動化する技術"
    ],
    ans: 0,
    exp: "バイオテクノロジーは生物が持っている機能を引き出し、効率的に利用する技術。遺伝子組み換えや交配改良も含まれる。"
  },
  {
    cat: "品種改良・バイオテクノロジー",
    q: "「遺伝子組み換え食品」の説明として正しいのはどれか？",
    choices: [
      "別の生物の遺伝子を取り込んだ作物から生まれた食品",
      "有機農業で育てた自然食品",
      "放射線を使って品種改良した食品",
      "化学肥料を一切使わない食品"
    ],
    ans: 0,
    exp: "遺伝子組み換え食品は、別の生物の遺伝子を取り込んだ作物から生まれた食品。日本では商業栽培は行われていないが輸入は認められている。"
  },
  {
    cat: "品種改良・バイオテクノロジー",
    q: "ネットメロンを品種改良してビニルハウスでも育てやすくしたメロンはどれか？",
    choices: ["アンデスメロン", "プリンスメロン", "マスクメロン", "ハネデューメロン"],
    ans: 0,
    exp: "アンデスメロンはアールス系ネットメロンを改良したもの。ビニルハウスで安定して栽培でき、手ごろな価格で一般家庭に普及した。"
  },
  {
    cat: "品種改良・バイオテクノロジー",
    q: "切り花用に品種改良され、花粉が出ないようになったのはどの植物か？",
    choices: ["ヒマワリ", "バラ", "チューリップ", "菊"],
    ans: 0,
    exp: "切り花用のヒマワリは花粉が服に付かないよう品種改良されている。また花の寿命も長くなっている。"
  },
  {
    cat: "品種改良・バイオテクノロジー",
    q: "品種改良の主な方法として正しいのはどれか？",
    choices: ["交配", "接ぎ木", "挿し木", "分球"],
    ans: 0,
    exp: "品種改良の主な方法は「交配」。異なる品種を掛け合わせて優れた特性を持つ新しい品種を作る。"
  },
  {
    cat: "品種改良・バイオテクノロジー",
    q: "新しく開発された品種を知的財産として保護する法律はどれか？",
    choices: ["種苗法", "農業基本法", "食品衛生法", "遺伝子組み換え法"],
    ans: 0,
    exp: "種苗法は新品種を開発した人（育成者）の権利を保護する法律。無断での栽培・販売を禁止している。"
  },
  {
    cat: "品種改良・バイオテクノロジー",
    q: "日本から海外に流出し問題となっている農産物はどれか？",
    choices: ["イチゴ・サクランボ・ブドウ", "コメ・麦・大豆", "リンゴ・ナシ・柿", "キャベツ・レタス・ほうれん草"],
    ans: 0,
    exp: "日本が品種改良したイチゴ・サクランボ・ブドウなどが無断で海外に持ち出され、栽培されることが問題になっている。"
  },

  // ── カテゴリ12: 社会の発展と技術 ──
  {
    cat: "社会の発展と技術",
    q: "害虫駆除の自動化に活用されている最新技術はどれか？",
    choices: ["ドローン", "ロボット除草機", "AIカメラ", "センサーネット"],
    ans: 0,
    exp: "ドローンを使った害虫駆除の自動化が進んでいる。農薬散布の省力化・精密化が可能になった。"
  },
  {
    cat: "社会の発展と技術",
    q: "ビニルハウス栽培のプラス面として正しいのはどれか？",
    choices: [
      "気候に左右されず安定した生産ができる",
      "施設費用が安く初期投資が少ない",
      "連作障害が起きにくくなる",
      "害虫が一切入らない"
    ],
    ans: 0,
    exp: "ビニルハウスは外部の気候に左右されず、温度・湿度・光を管理して安定した生産が可能。害虫の侵入も防げる。"
  },
  {
    cat: "社会の発展と技術",
    q: "生物育成の技術のマイナス面として最も正しいのはどれか？",
    choices: [
      "新技術の導入には費用がかかり、経済的負担が大きい",
      "収穫量が必ず減少する",
      "品種が均一になり味が落ちる",
      "自然環境を一切利用できなくなる"
    ],
    ans: 0,
    exp: "生物育成の新技術は導入費用・維持費用が高く経済的負担が大きい。また環境への影響や生態系の乱れも懸念される。"
  },
  {
    cat: "社会の発展と技術",
    q: "寒冷地でイネを栽培できるようになったのは、どの技術のおかげか？",
    choices: ["品種改良", "完全養殖", "遺伝子組み換え", "ドローン技術"],
    ans: 0,
    exp: "「きらら397」など寒さに強いイネの品種改良により、北海道など寒冷地でのコメ栽培が可能になった。"
  },

  // ── P106-107 追加：乳牛の詳細 ──
  {
    cat: "乳牛・酪農",
    q: "乳牛の飼育に適した温度の範囲として正しいのはどれか？",
    choices: ["4〜20℃", "10〜30℃", "15〜25℃", "0〜10℃"],
    ans: 0,
    exp: "乳牛の飼育は4〜20℃の範囲が向いている。22℃以上になると暑さで乳牛がストレスを受け始める。"
  },

  // ── P108 追加：採卵鶏の詳細 ──
  {
    cat: "採卵鶏",
    q: "採卵鶏の代表的な品種はどれか？",
    choices: ["白色レグホン種", "ホルスタイン種", "ランドレース種", "デュロック種"],
    ans: 0,
    exp: "採卵鶏の代表的な品種は白色レグホン種。ヒナから4か月ほどで卵を産み始め、2年以上産み続ける。"
  },
  {
    cat: "採卵鶏",
    q: "採卵鶏が産卵するために必要な1日の明るい時間はどれか？",
    choices: ["10時間以上", "8時間以上", "12時間以上", "6時間以上"],
    ans: 0,
    exp: "産卵には1日10時間以上の明るい時間が必要。照明を用いて調節し、冬の間も採卵量を確保する。"
  },
  {
    cat: "採卵鶏",
    q: "採卵鶏の鶏舎の温度が上がって採卵量が下がるのを防ぐために使う設備はどれか？",
    choices: ["扇風機・ミスト", "人工照明", "ヒーター", "防虫ネット"],
    ans: 0,
    exp: "採卵鶏の鶏舎は18〜24℃が適温。室温が上がると採卵量が下がるため、扇風機やミストで室温を下げる。"
  },
  {
    cat: "採卵鶏",
    q: "採卵鶏の飼育方法として「1羽ずつケージに入れる」方法を何というか？",
    choices: ["ケージ飼い", "平飼い", "放し飼い", "群れ飼い"],
    ans: 0,
    exp: "採卵鶏の飼育方法には床に放す「平飼い」と、ケージに入れる「ケージ飼い」がある。採卵鶏では1羽ずつのケージ飼いが多い。"
  },

  // ── P109 追加：ブタの詳細 ──
  {
    cat: "ブタ",
    q: "ブタは汗腺がないため体温調節が苦手である。大人のブタの適温はどれか？",
    choices: ["18℃前後", "22℃前後", "28℃前後", "10℃前後"],
    ans: 0,
    exp: "ブタは汗腺がないため体温調節がうまくできない。大人のブタは18℃前後が適温。"
  },
  {
    cat: "ブタ",
    q: "生まれて間もない子ブタの適温はどれか？",
    choices: ["30℃前後", "20℃前後", "18℃前後", "25℃前後"],
    ans: 0,
    exp: "子ブタは皮下脂肪が少ないため30℃前後が適温。寒いときはヒーターで加温する。"
  },
  {
    cat: "ブタ",
    q: "食肉となるブタの品種改良でよく交配される3品種の組み合わせはどれか？",
    choices: [
      "ランドレース種・大ヨークシャー種・デュロック種",
      "ホルスタイン種・ジャージー種・アンガス種",
      "白色レグホン種・名古屋コーチン・烏骨鶏",
      "ヒラメ・マダイ・マグロ"
    ],
    ans: 0,
    exp: "食肉となるブタはランドレース種・大ヨークシャー種・デュロック種の3品種を交配することが多い。"
  },

  // ── P110-111 追加：水産生物の詳細 ──
  {
    cat: "水産生物",
    q: "「海洋保全」の意味として正しいのはどれか？",
    choices: [
      "生物が豊かに成長できるために、海洋を守っていくこと",
      "漁業の効率を上げるために海を管理すること",
      "海の汚染を化学的に除去する技術",
      "養殖魚の品種改良を進めること"
    ],
    ans: 0,
    exp: "海洋保全とは、生物が豊かに成長できるために海洋を守っていくこと。稚魚の放流などもその一環。"
  },

  // ── P99 追加：植物工場 ──
  {
    cat: "社会の発展と技術",
    q: "人工照明を使った「植物工場」の特徴として正しいのはどれか？",
    choices: [
      "天候に左右されず、病虫害もほとんどない",
      "土が必要で設備費用が低い",
      "屋外と同じ自然環境で栽培できる",
      "肥料が一切不要で低コストで生産できる"
    ],
    ans: 0,
    exp: "植物工場は室内で栽培に適した環境をつくり収穫する工場。人工照明を使うため天候に左右されず、病虫害もほとんどない。"
  }
];

// ── State ──
let pool = [];
let idx = 0;
let stats = {};        // { cat: { correct, wrong, skip } } — current session
let wrongPool = [];    // questions marked wrong in current session
let selectedCats = new Set(); // 空 = すべて選択

const STORAGE_KEY = "gijutsu-quiz-v1";
const uniqueCats = [...new Set(questions.map(q => q.cat))];
const $ = id => document.getElementById(id);

function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  $(id).classList.remove("hidden");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 永続化 (localStorage) ──
function loadResults() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

function saveResult(qIdx, result) {
  const r = loadResults();
  r[qIdx] = result;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
}

function clearAllStats() {
  if (!confirm("進捗をすべてリセットしますか？")) return;
  localStorage.removeItem(STORAGE_KEY);
  initHome();
}

// ── ホーム画面の進捗集計 ──
function getHomeStats() {
  const results = loadResults();
  let correct = 0, unsure = 0, wrong = 0, unanswered = 0;
  const byCat = {};
  questions.forEach((q, i) => {
    const r = results[i];
    if (!byCat[q.cat]) byCat[q.cat] = { correct: 0, unsure: 0, wrong: 0, unanswered: 0, total: 0 };
    byCat[q.cat].total++;
    if      (r === "correct") { correct++;    byCat[q.cat].correct++; }
    else if (r === "unsure")  { unsure++;     byCat[q.cat].unsure++; }
    else if (r === "wrong")   { wrong++;      byCat[q.cat].wrong++; }
    else                      { unanswered++; byCat[q.cat].unanswered++; }
    // 'skip' は未挑戦扱い
  });
  return { correct, unsure, wrong, unanswered, total: questions.length, byCat };
}

function renderHomeStats() {
  const s = getHomeStats();
  $("hs-correct").textContent    = s.correct;
  $("hs-unsure").textContent     = s.unsure;
  $("hs-wrong").textContent      = s.wrong;
  $("hs-unanswered").textContent = s.unanswered;

  // カテゴリ別バーグラフ（緑/黄/赤/灰）
  const barsEl = $("home-cat-bars");
  barsEl.innerHTML = "";
  Object.entries(s.byCat).forEach(([cat, cs]) => {
    const total = cs.total;
    const cPct = (cs.correct / total * 100).toFixed(1);
    const uPct = (cs.unsure  / total * 100).toFixed(1);
    const wPct = (cs.wrong   / total * 100).toFixed(1);

    const row = document.createElement("div");
    row.className = "cat-bar-row";
    if (cs.correct === total)           row.classList.add("bar-perfect");
    else if (cs.wrong > 0)              row.classList.add("bar-has-wrong");
    else if (cs.unsure > 0)             row.classList.add("bar-has-unsure");

    row.innerHTML = `
      <div class="cat-bar-name">${cat}</div>
      <div class="cat-bar-track">
        <div class="cat-bar-seg seg-correct" style="width:${cPct}%"></div>
        <div class="cat-bar-seg seg-unsure"  style="width:${uPct}%"></div>
        <div class="cat-bar-seg seg-wrong"   style="width:${wPct}%"></div>
      </div>
      <div class="cat-bar-counts">
        <span class="bc-c">${cs.correct}</span>
        <span class="bc-sep">/</span>
        <span class="bc-un">${cs.unsure}</span>
        <span class="bc-sep">/</span>
        <span class="bc-w">${cs.wrong}</span>
      </div>
    `;
    barsEl.appendChild(row);
  });

  // 復習ボタンの表示制御
  const retrySection = $("home-retry-section");
  const both = s.wrong + s.unsure;
  if (both > 0) {
    retrySection.classList.remove("hidden");
    $("home-retry-count-both").textContent  = `（${both}問）`;
    $("home-retry-count-wrong").textContent = `（${s.wrong}問）`;
    // 不正解0の場合は「不正解のみ」ボタンを非活性化
    const btnWrong = retrySection.querySelector(".retry-wrong");
    btnWrong.disabled = s.wrong === 0;
  } else {
    retrySection.classList.add("hidden");
  }
}

// ── ホームからの復習開始 ──
function startHomeRetry(mode) {
  const results = loadResults();
  const target = mode === "wrong"
    ? questions.filter((_, i) => results[i] === "wrong")
    : questions.filter((_, i) => results[i] === "wrong" || results[i] === "unsure");
  if (target.length === 0) return;
  pool = shuffle([...target]);
  stats = {};
  pool.forEach(q => { if (!stats[q.cat]) stats[q.cat] = { correct: 0, unsure: 0, wrong: 0, skip: 0 }; });
  wrongPool = [];
  idx = 0;
  renderQuestion();
  show("screen-quiz");
}

// ── Home ──
function updateCatButtons(container) {
  container.querySelectorAll(".cat-btn").forEach(btn => {
    const c = btn.dataset.cat;
    btn.classList.toggle("active",
      c === "すべて" ? selectedCats.size === 0 : selectedCats.has(c)
    );
  });
}

function initHome() {
  const container = $("category-list");
  container.innerHTML = "";

  // 「すべて」ボタン
  const allBtn = document.createElement("button");
  allBtn.textContent = "すべて";
  allBtn.className = "cat-btn" + (selectedCats.size === 0 ? " active" : "");
  allBtn.dataset.cat = "すべて";
  allBtn.onclick = () => { selectedCats.clear(); updateCatButtons(container); };
  container.appendChild(allBtn);

  // 個別カテゴリボタン（複数選択可）
  uniqueCats.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.className = "cat-btn" + (selectedCats.has(cat) ? " active" : "");
    btn.dataset.cat = cat;
    btn.onclick = () => {
      if (selectedCats.has(cat)) selectedCats.delete(cat);
      else selectedCats.add(cat);
      updateCatButtons(container);
    };
    container.appendChild(btn);
  });

  renderHomeStats();
  show("screen-home");
}

// ── Quiz start ──
function startQuiz(isRetry) {
  if (isRetry) {
    if (wrongPool.length === 0) return;
    pool = shuffle([...wrongPool]);
  } else {
    const base = selectedCats.size === 0
      ? [...questions]
      : questions.filter(q => selectedCats.has(q.cat));
    pool = shuffle(base);
  }
  // stats はプール内のカテゴリだけ初期化（全問題ではなくpool基準）
  stats = {};
  pool.forEach(q => {
    if (!stats[q.cat]) stats[q.cat] = { correct: 0, unsure: 0, wrong: 0, skip: 0 };
  });
  wrongPool = [];
  idx = 0;
  renderQuestion();
  show("screen-quiz");
}

function retryWrong() {
  startQuiz(true);
}

function goHome() {
  if (confirm("ホームに戻りますか？\n現在の進行状況は失われます。")) {
    initHome();
  }
}

// ── Render question ──
function renderQuestion() {
  const q = pool[idx];
  $("progress-bar").style.width = (idx / pool.length * 100) + "%";
  $("progress-text").textContent = `${idx + 1} / ${pool.length}`;
  $("category-badge").textContent = q.cat;
  $("question-text").textContent = q.q;
  $("user-answer").value = "";
  $("phase-input").classList.remove("hidden");
  $("phase-eval").classList.add("hidden");
  window.scrollTo(0, 0);
}

// ── Phase 1 → 2: reveal correct answer ──
function revealAnswer() {
  const q = pool[idx];
  const typed = $("user-answer").value.trim();
  $("user-answer-display").textContent = typed || "（未入力）";
  $("correct-answer-text").textContent = q.choices[q.ans];
  $("explanation-text").textContent = "💡 " + q.exp;
  $("phase-input").classList.add("hidden");
  $("phase-eval").classList.remove("hidden");
}

// ── Phase 2: self-evaluation ──
function markResult(result) {
  const q = pool[idx];
  // 永続保存：'skip'は既存の記録を上書きしない（その場限りのスキップ）
  const qIdx = questions.indexOf(q);
  if (qIdx !== -1 && result !== "skip") saveResult(qIdx, result);
  // セッション統計
  stats[q.cat][result]++;
  if (result === "wrong") wrongPool.push(q);
  idx++;
  if (idx >= pool.length) showResult();
  else renderQuestion();
}

// ── Result ──
function showResult() {
  let totalC = 0, totalU = 0, totalW = 0, totalS = 0;
  Object.values(stats).forEach(s => {
    totalC += s.correct; totalU += s.unsure || 0;
    totalW += s.wrong;   totalS += s.skip;
  });
  // 正答率 = 正解 / (正解+自信がない+不正解)
  const ev = totalC + totalU + totalW;
  const pct = ev > 0 ? Math.round(totalC / ev * 100) : 0;

  $("res-correct").textContent = totalC;
  $("res-unsure").textContent  = totalU;
  $("res-wrong").textContent   = totalW;
  $("res-rate").textContent    = ev > 0 ? pct + "%" : "-";

  let msg, cls;
  if (ev === 0)      { msg = "採点された問題なし";               cls = "msg-ok"; }
  else if (pct >= 90){ msg = "満点に近い！テストも大丈夫！";     cls = "msg-great"; }
  else if (pct >= 70){ msg = "よくできました！苦手を復習しよう"; cls = "msg-good"; }
  else if (pct >= 50){ msg = "もう少し！復習すれば必ず伸びる";   cls = "msg-ok"; }
  else               { msg = "間違えた問題を集中的に復習しよう"; cls = "msg-low"; }
  const msgEl = $("result-msg");
  msgEl.textContent = msg;
  msgEl.className = "result-msg " + cls;

  // カテゴリ別テーブル
  const tbody = $("cat-tbody");
  tbody.innerHTML = "";
  Object.entries(stats).forEach(([cat, s]) => {
    const u = s.unsure || 0;
    const catEv = s.correct + u + s.wrong;
    const rate = catEv > 0 ? Math.round(s.correct / catEv * 100) + "%" : "-";
    const tr = document.createElement("tr");
    if (s.wrong > 0)        tr.classList.add("row-has-wrong");
    else if (u > 0)         tr.classList.add("row-has-unsure");
    else if (catEv > 0)     tr.classList.add("row-perfect");
    tr.innerHTML = `<td>${cat}</td><td class="col-c">${s.correct}</td><td class="col-u">${u}</td><td class="col-w">${s.wrong}</td><td class="col-r">${rate}</td>`;
    tbody.appendChild(tr);
  });
  // 合計行（カテゴリが2つ以上の場合のみ）
  if (Object.keys(stats).length > 1) {
    const trTot = document.createElement("tr");
    const sumEv = totalC + totalU + totalW;
    const sumRate = sumEv > 0 ? Math.round(totalC / sumEv * 100) + "%" : "-";
    trTot.innerHTML = `<td>合計</td><td class="col-c">${totalC}</td><td class="col-u">${totalU}</td><td class="col-w">${totalW}</td><td class="col-r">${sumRate}</td>`;
    tbody.appendChild(trTot);
  }

  // Wrong list
  const wrongList = $("wrong-list");
  wrongList.innerHTML = "";
  if (wrongPool.length === 0) {
    wrongList.innerHTML = "<p class='no-wrong'>不正解なし！素晴らしい！</p>";
  } else {
    wrongPool.forEach(q => {
      const el = document.createElement("div");
      el.className = "wrong-item";
      el.innerHTML = `
        <div class="wrong-cat">${q.cat}</div>
        <div class="wrong-q">${q.q}</div>
        <div class="wrong-a">✅ 正解：${q.choices[q.ans]}</div>
        <div class="wrong-exp">${q.exp}</div>
      `;
      wrongList.appendChild(el);
    });
  }

  const retryBtn = $("btn-retry-wrong");
  if (retryBtn) retryBtn.disabled = wrongPool.length === 0;
  const retrySection = $("retry-section");
  if (retrySection) retrySection.style.display = wrongPool.length === 0 ? "none" : "";
  show("screen-result");
}

// ── Entry ──
document.addEventListener("DOMContentLoaded", initHome);
