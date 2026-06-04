// =====================================================
// QUESTIONS DATA
// type:'read'  → 漢字を見て読み方を答える
// type:'write' → 読み方を見て漢字を書く
// example の {} 内がテスト対象
// =====================================================
const allQuestions = [

  // ════ 読み問題 ── 基礎 ════
  {id:101,type:'read',kanji:'功績',reading:'こうせき',example:'彼の{功績}は後世に語り継がれた。',meaning:'業績・成果',level:'basic'},
  {id:102,type:'read',kanji:'謙虚',reading:'けんきょ',example:'{謙虚}な態度で意見を聞いた。',meaning:'控えめで素直なこと',level:'basic'},
  {id:103,type:'read',kanji:'貢献',reading:'こうけん',example:'社会に{貢献}する活動を続けている。',meaning:'力を尽くして役に立つこと',level:'basic'},
  {id:104,type:'read',kanji:'克服',reading:'こくふく',example:'苦手科目を{克服}して合格した。',meaning:'困難を乗り越えること',level:'basic'},
  {id:105,type:'read',kanji:'慎重',reading:'しんちょう',example:'{慎重}に言葉を選んで話す。',meaning:'注意深く行動すること',level:'basic'},
  {id:106,type:'read',kanji:'尊厳',reading:'そんげん',example:'人間の{尊厳}を守ることが大切だ。',meaning:'尊くおかされてはならない価値',level:'basic'},
  {id:107,type:'read',kanji:'偏見',reading:'へんけん',example:'{偏見}を持たずに相手を見る。',meaning:'かたよった見方・思い込み',level:'basic'},
  {id:108,type:'read',kanji:'矛盾',reading:'むじゅん',example:'彼の発言には{矛盾}がある。',meaning:'つじつまが合わないこと',level:'basic'},
  {id:109,type:'read',kanji:'維持',reading:'いじ',example:'健康を{維持}するために運動する。',meaning:'そのままの状態を保つこと',level:'basic'},
  {id:110,type:'read',kanji:'普及',reading:'ふきゅう',example:'スマートフォンが急速に{普及}した。',meaning:'広く一般に行き渡ること',level:'basic'},
  {id:111,type:'read',kanji:'象徴',reading:'しょうちょう',example:'鳩は平和の{象徴}とされる。',meaning:'ものごとを表すしるし',level:'basic'},
  {id:112,type:'read',kanji:'促進',reading:'そくしん',example:'経済の発展を{促進}する政策をとる。',meaning:'はかどらせること・速めること',level:'basic'},
  {id:113,type:'read',kanji:'抵抗',reading:'ていこう',example:'変化に{抵抗}を感じる人も多い。',meaning:'さからうこと・反発',level:'basic'},
  {id:114,type:'read',kanji:'把握',reading:'はあく',example:'状況を正確に{把握}することが必要だ。',meaning:'しっかりとらえて理解すること',level:'standard'},
  {id:115,type:'read',kanji:'素朴',reading:'そぼく',example:'{素朴}な疑問を大切にしたい。',meaning:'飾り気なく純粋なこと',level:'basic'},
  {id:116,type:'read',kanji:'恩恵',reading:'おんけい',example:'自然の{恩恵}に感謝する。',meaning:'めぐみ・ありがたい助け',level:'basic'},
  {id:117,type:'read',kanji:'遺産',reading:'いさん',example:'文化{遺産}を次世代に伝える。',meaning:'後世に残された財産・価値あるもの',level:'basic'},
  {id:118,type:'read',kanji:'干渉',reading:'かんしょう',example:'他国の内政に{干渉}すべきではない。',meaning:'他のことにくちばしを入れること',level:'basic'},
  {id:119,type:'read',kanji:'充実',reading:'じゅうじつ',example:'{充実}した学校生活を送りたい。',meaning:'内容が豊かで満ち足りていること',level:'basic'},
  {id:120,type:'read',kanji:'柔軟',reading:'じゅうなん',example:'{柔軟}な発想でアイデアを出す。',meaning:'かたくなでなく、状況に応じて変えられること',level:'basic'},
  {id:121,type:'read',kanji:'詳細',reading:'しょうさい',example:'計画の{詳細}を報告する。',meaning:'くわしい内容・細かいところまで',level:'basic'},
  {id:122,type:'read',kanji:'概念',reading:'がいねん',example:'民主主義という{概念}を学ぶ。',meaning:'ものごとの大まかな意味・考え方',level:'standard'},
  {id:123,type:'read',kanji:'慣習',reading:'かんしゅう',example:'地域の{慣習}を尊重する。',meaning:'昔から続く習わし',level:'basic'},
  {id:124,type:'read',kanji:'威厳',reading:'いげん',example:'{威厳}のある態度で人々を導く。',meaning:'おごそかで近づきがたい重々しさ',level:'standard'},
  {id:125,type:'read',kanji:'逆境',reading:'ぎゃっきょう',example:'{逆境}に負けずに夢を追い続けた。',meaning:'苦しく不利な状況・不遇な境遇',level:'basic'},
  {id:126,type:'read',kanji:'脅威',reading:'きょうい',example:'環境破壊は生態系への{脅威}だ。',meaning:'おびやかすこと・危険な存在',level:'standard'},
  {id:127,type:'read',kanji:'察知',reading:'さっち',example:'相手の気持ちを{察知}する。',meaning:'おしはかって感知すること',level:'standard'},
  {id:128,type:'read',kanji:'妥協',reading:'だきょう',example:'{妥協}せずに最後まで戦い抜いた。',meaning:'対立する双方が歩み寄ること・おりあいをつけること',level:'standard'},
  {id:129,type:'read',kanji:'歳月',reading:'さいげつ',example:'{歳月}が流れ、街の姿も変わった。',meaning:'年月・時間の経過',level:'basic'},
  {id:130,type:'read',kanji:'抽象',reading:'ちゅうしょう',example:'{抽象}的な説明では理解しにくい。',meaning:'具体性のない、観念的なこと',level:'standard'},

  // ════ 読み問題 ── 標準 ════
  {id:131,type:'read',kanji:'懐疑',reading:'かいぎ',example:'{懐疑}的な目で情報を見極める。',meaning:'信じないで疑うこと',level:'advanced'},
  {id:132,type:'read',kanji:'繁殖',reading:'はんしょく',example:'外来種が急速に{繁殖}している。',meaning:'生物が増え広がること',level:'standard'},
  {id:133,type:'read',kanji:'卓越',reading:'たくえつ',example:'{卓越}した技術を持つ職人に学ぶ。',meaning:'他よりずばぬけてすぐれていること',level:'advanced'},
  {id:134,type:'read',kanji:'弊害',reading:'へいがい',example:'過度な競争が生み出す{弊害}を考える。',meaning:'害になること・悪い影響',level:'standard'},
  {id:135,type:'read',kanji:'憂慮',reading:'ゆうりょ',example:'少子化の進行を{憂慮}する声が上がった。',meaning:'心配してなげくこと',level:'standard'},
  {id:136,type:'read',kanji:'示唆',reading:'しさ',example:'研究結果は新たな可能性を{示唆}している。',meaning:'それとなくほのめかすこと',level:'standard'},
  {id:137,type:'read',kanji:'拮抗',reading:'きっこう',example:'両チームが互いに{拮抗}した試合だった。',meaning:'互いに張り合って優劣がつかないこと',level:'advanced'},
  {id:138,type:'read',kanji:'謙遜',reading:'けんそん',example:'{謙遜}して「まだまだです」と答えた。',meaning:'自分をへりくだること',level:'standard'},
  {id:139,type:'read',kanji:'俯瞰',reading:'ふかん',example:'問題全体を{俯瞰}してから解決策を探る。',meaning:'高いところから見渡すこと・広い視野で見ること',level:'standard'},
  {id:140,type:'read',kanji:'煩雑',reading:'はんざつ',example:'{煩雑}な手続きを省略できる制度を作る。',meaning:'ごたごたして面倒なこと',level:'standard'},
  {id:141,type:'read',kanji:'醸成',reading:'じょうせい',example:'信頼関係を{醸成}するには時間がかかる。',meaning:'徐々に雰囲気・状況を作り出すこと',level:'standard'},
  {id:142,type:'read',kanji:'疎外',reading:'そがい',example:'社会から{疎外}されたと感じる若者が増えている。',meaning:'のけものにすること・孤立させること',level:'standard'},
  {id:143,type:'read',kanji:'逡巡',reading:'しゅんじゅん',example:'{逡巡}しながらも、勇気を出して発言した。',meaning:'ためらうこと・ぐずぐずすること',level:'advanced'},
  {id:144,type:'read',kanji:'邁進',reading:'まいしん',example:'目標に向かって{邁進}する姿に感動した。',meaning:'ひたすら突き進むこと',level:'advanced'},
  {id:145,type:'read',kanji:'真摯',reading:'しんし',example:'{真摯}に問題と向き合う姿勢が大切だ。',meaning:'まじめで誠実なこと',level:'standard'},

  // ════ 読み問題 ── 発展 ════
  {id:146,type:'read',kanji:'忌憚',reading:'きたん',example:'{忌憚}のない意見を聞かせてほしい。',meaning:'遠慮・はばかること（「忌憚のない」＝遠慮のない）',level:'advanced'},
  {id:147,type:'read',kanji:'蹂躙',reading:'じゅうりん',example:'市民の権利が{蹂躙}されてはならない。',meaning:'ふみにじること',level:'advanced'},
  {id:148,type:'read',kanji:'逆説',reading:'ぎゃくせつ',example:'「急がば回れ」は{逆説}的な教えだ。',meaning:'一見矛盾しているが真実をついた表現',level:'advanced'},
  {id:149,type:'read',kanji:'杞憂',reading:'きゆう',example:'心配していたが、結局{杞憂}に終わった。',meaning:'心配しなくてもよいことを無駄に心配すること',level:'advanced'},
  {id:150,type:'read',kanji:'逆鱗',reading:'げきりん',example:'部長の{逆鱗}に触れて叱られた。',meaning:'目上の人の激しい怒り（「逆鱗に触れる」＝怒りを買う）',level:'advanced'},
  {id:151,type:'read',kanji:'忖度',reading:'そんたく',example:'上司の意向を{忖度}して行動する。',meaning:'相手の気持ちを推し量ること',level:'advanced'},
  {id:152,type:'read',kanji:'寛容',reading:'かんよう',example:'{寛容}な心で他者の失敗を許す。',meaning:'心が広くおおらかなこと',level:'advanced'},
  {id:153,type:'read',kanji:'齟齬',reading:'そご',example:'お互いの認識に{齟齬}が生じていた。',meaning:'食い違い・かみ合わないこと',level:'advanced'},
  {id:154,type:'read',kanji:'慫慂',reading:'しょうよう',example:'友人に旅行への参加を{慫慂}した。',meaning:'すすめること・うながすこと',level:'advanced'},
  {id:155,type:'read',kanji:'逝去',reading:'せいきょ',example:'著名な作家が{逝去}されたとの報が届いた。',meaning:'死去（尊敬表現）',level:'advanced'},

  // ════ 書き問題 ── 基礎 ════
  {id:201,type:'write',kanji:'解決',reading:'かいけつ',example:'問題を{かいけつ}するために話し合う。',meaning:'問題やもめごとをかたづけること',level:'basic'},
  {id:202,type:'write',kanji:'判断',reading:'はんだん',example:'正しい{はんだん}をするには情報が必要だ。',meaning:'物事の良し悪しを見極めること',level:'basic'},
  {id:203,type:'write',kanji:'表現',reading:'ひょうげん',example:'自分の気持ちを言葉で{ひょうげん}する。',meaning:'思いや考えを外に表すこと',level:'basic'},
  {id:204,type:'write',kanji:'要約',reading:'ようやく',example:'長い文章を三行で{ようやく}する。',meaning:'大事なところをまとめること',level:'basic'},
  {id:205,type:'write',kanji:'感想',reading:'かんそう',example:'読んだ本の{かんそう}を書く。',meaning:'感じたこと・思ったこと',level:'basic'},
  {id:206,type:'write',kanji:'才能',reading:'さいのう',example:'彼女は音楽の{さいのう}に恵まれている。',meaning:'生まれつきの優れた能力',level:'basic'},
  {id:207,type:'write',kanji:'実践',reading:'じっせん',example:'学んだことを実際に{じっせん}する。',meaning:'実際に行うこと',level:'basic'},
  {id:208,type:'write',kanji:'環境',reading:'かんきょう',example:'{かんきょう}を守るために行動する。',meaning:'まわりの状況・自然',level:'basic'},
  {id:209,type:'write',kanji:'信頼',reading:'しんらい',example:'長年の友人への{しんらい}は揺るがない。',meaning:'信じて頼ること',level:'basic'},
  {id:210,type:'write',kanji:'納得',reading:'なっとく',example:'説明を聞いてようやく{なっとく}できた。',meaning:'十分に理解して承認すること',level:'basic'},
  {id:211,type:'write',kanji:'計画',reading:'けいかく',example:'旅行の{けいかく}を立てる。',meaning:'あらかじめ決めた方針・予定',level:'basic'},
  {id:212,type:'write',kanji:'現実',reading:'げんじつ',example:'{げんじつ}を受け止めて前に進む。',meaning:'今実際にある状態',level:'basic'},
  {id:213,type:'write',kanji:'正確',reading:'せいかく',example:'{せいかく}な情報を伝えることが大切だ。',meaning:'まちがいのないこと',level:'basic'},
  {id:214,type:'write',kanji:'成功',reading:'せいこう',example:'長年の努力がついに{せいこう}につながった。',meaning:'目的を達成すること',level:'basic'},
  {id:215,type:'write',kanji:'開発',reading:'かいはつ',example:'新しい薬を{かいはつ}する研究が進む。',meaning:'新しいものを作り出すこと',level:'basic'},
  {id:216,type:'write',kanji:'更新',reading:'こうしん',example:'世界記録を{こうしん}した。',meaning:'新しくすること・記録を塗り替えること',level:'basic'},
  {id:217,type:'write',kanji:'活発',reading:'かっぱつ',example:'{かっぱつ}な議論が行われた。',meaning:'元気よく勢いのあること',level:'basic'},
  {id:218,type:'write',kanji:'効果',reading:'こうか',example:'練習の{こうか}が試合に出た。',meaning:'ある行為が生む結果・ききめ',level:'basic'},
  {id:219,type:'write',kanji:'身近',reading:'みぢか',example:'{みぢか}な問題から取り組み始める。',meaning:'自分に近い・親しみやすい',level:'basic'},
  {id:220,type:'write',kanji:'豊か',reading:'ゆたか',example:'{ゆたか}な自然を次世代に残したい。',meaning:'じゅうぶんにある・満ち足りている',level:'basic'},
  {id:221,type:'write',kanji:'根幹',reading:'こんかん',example:'問題の{こんかん}をつかむことが重要だ。',meaning:'物事の根本・中心となる部分',level:'standard'},
  {id:222,type:'write',kanji:'意見',reading:'いけん',example:'自分の{いけん}をはっきりと述べる。',meaning:'ある物事に対する考え',level:'basic'},
  {id:223,type:'write',kanji:'立案',reading:'りつあん',example:'新しいプロジェクトを{りつあん}する。',meaning:'計画・案を立てること',level:'basic'},
  {id:224,type:'write',kanji:'解説',reading:'かいせつ',example:'専門家が問題を{かいせつ}する。',meaning:'わかりやすく説明すること',level:'basic'},
  {id:225,type:'write',kanji:'探求',reading:'たんきゅう',example:'真実を{たんきゅう}し続けた科学者。',meaning:'深く調べ求めること',level:'basic'},
  {id:226,type:'write',kanji:'表す',reading:'あらわす',example:'感謝の気持ちを行動で{あらわす}。',meaning:'外に示す・あきらかにする',level:'basic'},
  {id:227,type:'write',kanji:'喜ぶ',reading:'よろこぶ',example:'合格の知らせを聞いて{よろこぶ}。',meaning:'うれしいと感じる',level:'basic'},
  {id:228,type:'write',kanji:'暮らし',reading:'くらし',example:'地域の人々の{くらし}を守る。',meaning:'日常生活・生活のようす',level:'basic'},
  {id:229,type:'write',kanji:'立ち向かう',reading:'たちむかう',example:'困難に勇敢に{たちむかう}。',meaning:'対抗して向かっていく',level:'basic'},
  {id:230,type:'write',kanji:'厳しい',reading:'きびしい',example:'{きびしい}訓練に耐えて成長した。',meaning:'手加減がない・苦しい状況',level:'basic'},

  // ════ 書き問題 ── 標準 ════
  {id:231,type:'write',kanji:'本質',reading:'ほんしつ',example:'物事の{ほんしつ}をとらえる力が必要だ。',meaning:'そのものの根本的な性質',level:'standard'},
  {id:232,type:'write',kanji:'簡潔',reading:'かんけつ',example:'{かんけつ}にまとめて発表する。',meaning:'簡単でわかりやすいこと',level:'standard'},
  {id:233,type:'write',kanji:'典型',reading:'てんけい',example:'これは{てんけい}的な失敗例だ。',meaning:'そのもののわかりやすい代表例',level:'standard'},
  {id:234,type:'write',kanji:'継承',reading:'けいしょう',example:'伝統文化を{けいしょう}することが使命だ。',meaning:'受け継ぐこと',level:'standard'},
  {id:235,type:'write',kanji:'推進',reading:'すいしん',example:'改革を積極的に{すいしん}する。',meaning:'押し進めること',level:'standard'},
  {id:236,type:'write',kanji:'一貫',reading:'いっかん',example:'{いっかん}した姿勢で取り組む。',meaning:'最初から最後まで変わらないこと',level:'standard'},
  {id:237,type:'write',kanji:'先入観',reading:'せんにゅうかん',example:'{せんにゅうかん}を持たずに話を聞く。',meaning:'あらかじめ持っている固定した考え',level:'standard'},
  {id:238,type:'write',kanji:'提案',reading:'ていあん',example:'改善策を会議で{ていあん}する。',meaning:'考えや案を出すこと',level:'standard'},
  {id:239,type:'write',kanji:'弊害',reading:'へいがい',example:'過剰なスマホ利用の{へいがい}を議論する。',meaning:'害になること・悪い影響',level:'advanced'},
  {id:240,type:'write',kanji:'憂慮',reading:'ゆうりょ',example:'環境破壊の進行を{ゆうりょ}する。',meaning:'心配してなげくこと',level:'standard'},
  {id:241,type:'write',kanji:'経緯',reading:'いきさつ / けいい',example:'事件の{いきさつ}を詳しく調べた。',meaning:'事がらの始まりから今までの流れ',level:'standard'},
  {id:242,type:'write',kanji:'膨大',reading:'ぼうだい',example:'{ぼうだい}な量のデータを処理する。',meaning:'非常に量が多いこと',level:'standard'},
  {id:243,type:'write',kanji:'辻褄',reading:'つじつま',example:'話の{つじつま}が合わない。',meaning:'話や物事の筋道・つながり',level:'advanced'},
  {id:244,type:'write',kanji:'示唆',reading:'しさ',example:'この結果は重要な問題を{しさ}している。',meaning:'それとなくほのめかすこと',level:'standard'},
  {id:245,type:'write',kanji:'俯瞰',reading:'ふかん',example:'全体を{ふかん}して問題点を探る。',meaning:'高い位置から見渡すこと・広い視野で見ること',level:'advanced'},

  // ════ 書き問題 ── 発展 ════
  {id:246,type:'write',kanji:'真摯',reading:'しんし',example:'{しんし}な態度で批判を受け止めた。',meaning:'まじめで誠実なこと',level:'advanced'},
  {id:247,type:'write',kanji:'普遍',reading:'ふへん',example:'{ふへん}的な価値は時代を超えて伝わる。',meaning:'すべてに共通していつでも当てはまること',level:'advanced'},
  {id:248,type:'write',kanji:'寛容',reading:'かんよう',example:'{かんよう}な心で他者の意見を受け入れる。',meaning:'心が広く他を受け入れること',level:'advanced'},
  {id:249,type:'write',kanji:'逆説',reading:'ぎゃくせつ',example:'この詩には{ぎゃくせつ}的な表現が使われている。',meaning:'一見矛盾しているが真実をついた表現',level:'advanced'},
  {id:250,type:'write',kanji:'疎外',reading:'そがい',example:'集団から{そがい}されたと感じる人を支援する。',meaning:'のけものにすること',level:'advanced'},
  {id:251,type:'write',kanji:'邁進',reading:'まいしん',example:'目標に向かって一心に{まいしん}する。',meaning:'ひたすら突き進むこと',level:'advanced'},
  {id:252,type:'write',kanji:'逡巡',reading:'しゅんじゅん',example:'{しゅんじゅん}しながらも決断を下した。',meaning:'ためらうこと',level:'advanced'},
  {id:253,type:'write',kanji:'忌憚',reading:'きたん',example:'{きたん}のない意見を述べてください。',meaning:'遠慮・はばかること（ない＝遠慮のない）',level:'advanced'},
  {id:254,type:'write',kanji:'醸成',reading:'じょうせい',example:'チームの一体感を{じょうせい}するよう努める。',meaning:'徐々に状態や雰囲気を作り出すこと',level:'advanced'},
  {id:255,type:'write',kanji:'齟齬',reading:'そご',example:'両者の認識に{そご}が生じていた。',meaning:'食い違い・かみ合わないこと',level:'advanced'},

  // ════ 読み問題 ── 基礎（追加） ════
  {id:301,type:'read',kanji:'要因',reading:'よういん',example:'事故の{要因}を詳しく調べた。',meaning:'主な原因・要となる因子',level:'basic'},
  {id:302,type:'read',kanji:'影響',reading:'えいきょう',example:'気温の変化が体調に{影響}する。',meaning:'他のものに作用を及ぼすこと',level:'basic'},
  {id:303,type:'read',kanji:'解釈',reading:'かいしゃく',example:'詩の意味を自分なりに{解釈}した。',meaning:'物事の意味をくみ取って説明すること',level:'basic'},
  {id:304,type:'read',kanji:'批判',reading:'ひはん',example:'公正な{批判}を受け入れる姿勢が大切だ。',meaning:'良し悪しを判断して指摘すること',level:'basic'},
  {id:305,type:'read',kanji:'比較',reading:'ひかく',example:'二つの作品を{比較}して相違点を探す。',meaning:'二つ以上のものを照らし合わせること',level:'basic'},
  {id:306,type:'read',kanji:'余裕',reading:'よゆう',example:'試験前日に{余裕}を持って準備を終えた。',meaning:'ゆとり・くつろぎの空間や時間',level:'basic'},
  {id:307,type:'read',kanji:'緊張',reading:'きんちょう',example:'発表の前は誰でも{緊張}するものだ。',meaning:'精神的にこわばった状態',level:'basic'},
  {id:308,type:'read',kanji:'共存',reading:'きょうぞん',example:'自然と人間が{共存}できる社会を目指す。',meaning:'二つ以上のものが同時に存在すること',level:'basic'},
  {id:309,type:'read',kanji:'向上',reading:'こうじょう',example:'毎日の練習で技術が{向上}した。',meaning:'より高い水準・程度になること',level:'basic'},
  {id:310,type:'read',kanji:'基準',reading:'きじゅん',example:'採点の{基準}をあらかじめ全員に示す。',meaning:'判断・行動のよりどころとなるもの',level:'basic'},
  {id:311,type:'read',kanji:'姿勢',reading:'しせい',example:'何事にも真剣な{姿勢}で取り組む。',meaning:'物事に向かう態度・心がけ',level:'basic'},
  {id:312,type:'read',kanji:'能力',reading:'のうりょく',example:'自分の{能力}を信じて挑戦する。',meaning:'物事をこなせる力・スキル',level:'basic'},
  {id:313,type:'read',kanji:'経験',reading:'けいけん',example:'失敗も貴重な{経験}になる。',meaning:'実際に体験したこと・それによって得た知識',level:'basic'},
  {id:314,type:'read',kanji:'感覚',reading:'かんかく',example:'芸術を楽しむ{感覚}を養いたい。',meaning:'感じ取る働き・センス',level:'basic'},
  {id:315,type:'read',kanji:'記憶',reading:'きおく',example:'幼いころの{記憶}が鮮やかによみがえった。',meaning:'過去の経験を心に留めておくこと',level:'basic'},
  {id:316,type:'read',kanji:'想像',reading:'そうぞう',example:'相手の気持ちを{想像}して行動する。',meaning:'実際に経験していないことを思い描くこと',level:'basic'},
  {id:317,type:'read',kanji:'観察',reading:'かんさつ',example:'植物の成長を毎日{観察}する。',meaning:'注意深く見て調べること',level:'basic'},
  {id:318,type:'read',kanji:'調査',reading:'ちょうさ',example:'地域の意見を{調査}してまとめる。',meaning:'詳しく調べること',level:'basic'},
  {id:319,type:'read',kanji:'展開',reading:'てんかい',example:'物語が意外な方向に{展開}した。',meaning:'広がり進んでいくこと',level:'basic'},
  {id:320,type:'read',kanji:'成長',reading:'せいちょう',example:'子どもたちの{成長}を温かく見守る。',meaning:'大きくなること・能力が高まること',level:'basic'},
  {id:321,type:'read',kanji:'衰退',reading:'すいたい',example:'産業の{衰退}とともに人口も減っていった。',meaning:'勢いが衰えていくこと',level:'basic'},
  {id:322,type:'read',kanji:'伝統',reading:'でんとう',example:'地域の{伝統}文化を次世代に受け継ぐ。',meaning:'昔から受け継がれてきた習慣・文化',level:'basic'},
  {id:323,type:'read',kanji:'技術',reading:'ぎじゅつ',example:'最新の{技術}を活用して問題を解決する。',meaning:'物事を行うための技・スキル',level:'basic'},
  {id:324,type:'read',kanji:'評価',reading:'ひょうか',example:'作品を客観的な目で{評価}する。',meaning:'良し悪し・価値などを判断すること',level:'basic'},
  {id:325,type:'read',kanji:'整備',reading:'せいび',example:'インフラを{整備}して生活の利便性を高める。',meaning:'整えて使いやすくすること',level:'basic'},
  {id:326,type:'read',kanji:'保護',reading:'ほご',example:'絶滅危惧種を{保護}する活動が広がる。',meaning:'危険から守ること',level:'basic'},
  {id:327,type:'read',kanji:'競争',reading:'きょうそう',example:'健全な{競争}が社会を発展させる。',meaning:'同じ目標に向かって争うこと',level:'basic'},
  {id:328,type:'read',kanji:'協力',reading:'きょうりょく',example:'クラス全員が{協力}して行事を成功させた。',meaning:'力を合わせて取り組むこと',level:'basic'},
  {id:329,type:'read',kanji:'発揮',reading:'はっき',example:'本番で最高の力を{発揮}した。',meaning:'持っている力を外に出し表すこと',level:'basic'},
  {id:330,type:'read',kanji:'独立',reading:'どくりつ',example:'植民地が{独立}を果たした瞬間を学ぶ。',meaning:'他に頼らず自分の力で成り立つこと',level:'basic'},
  {id:331,type:'read',kanji:'誠実',reading:'せいじつ',example:'{誠実}な態度で相手と向き合うことが大切だ。',meaning:'真心があり、まじめで正直なこと',level:'basic'},
  {id:332,type:'read',kanji:'礼儀',reading:'れいぎ',example:'人間関係を円滑にするために{礼儀}を守る。',meaning:'人間関係における作法・マナー',level:'basic'},
  {id:333,type:'read',kanji:'感謝',reading:'かんしゃ',example:'支えてくれた人々への{感謝}の気持ちを伝える。',meaning:'ありがたいと思う気持ち',level:'basic'},
  {id:334,type:'read',kanji:'勇気',reading:'ゆうき',example:'{勇気}を出して自分の意見を述べることができた。',meaning:'困難なことに立ち向かう強い心',level:'basic'},
  {id:335,type:'read',kanji:'挑戦',reading:'ちょうせん',example:'新しいことに{挑戦}する精神を大切にしたい。',meaning:'困難なことに敢えて立ち向かうこと',level:'basic'},
  {id:336,type:'read',kanji:'達成',reading:'たっせい',example:'目標を{達成}したときの喜びは格別だ。',meaning:'成し遂げること・目的を果たすこと',level:'basic'},
  {id:337,type:'read',kanji:'継続',reading:'けいぞく',example:'努力を{継続}することで着実に実力がつく。',meaning:'ある状態がそのまま続くこと',level:'basic'},
  {id:338,type:'read',kanji:'忍耐',reading:'にんたい',example:'{忍耐}強く練習に取り組んだ結果、上達した。',meaning:'苦しいことに耐え続ける力',level:'basic'},
  {id:339,type:'read',kanji:'傾向',reading:'けいこう',example:'近年、読書をしない若者が増える{傾向}にある。',meaning:'ある方向へと向かいやすい性質',level:'basic'},
  {id:340,type:'read',kanji:'課題',reading:'かだい',example:'環境問題は現代社会が抱える大きな{課題}だ。',meaning:'取り組むべき問題・テーマ',level:'basic'},

  // ════ 読み問題 ── 標準（追加） ════
  {id:361,type:'read',kanji:'懸念',reading:'けねん',example:'少子化の進行について深刻な{懸念}が示された。',meaning:'気になって心配すること',level:'standard'},
  {id:362,type:'read',kanji:'抑制',reading:'よくせい',example:'感情を{抑制}して冷静に対処する。',meaning:'おさえて、ひかえさせること',level:'standard'},
  {id:363,type:'read',kanji:'葛藤',reading:'かっとう',example:'夢と現実の間で{葛藤}を続けた。',meaning:'二つの考えが対立して悩むこと',level:'standard'},
  {id:364,type:'read',kanji:'微妙',reading:'びみょう',example:'二人の関係は{微妙}に変化しつつあった。',meaning:'細かな差があり、一概に言いにくいこと',level:'standard'},
  {id:365,type:'read',kanji:'漠然',reading:'ばくぜん',example:'{漠然}とした不安を抱えたまま進んだ。',meaning:'はっきりしない・ぼんやりしているさま',level:'standard'},
  {id:366,type:'read',kanji:'比喩',reading:'ひゆ',example:'詩の中で豊かな{比喩}が使われている。',meaning:'他のものにたとえて表現すること',level:'standard'},
  {id:367,type:'read',kanji:'喪失',reading:'そうしつ',example:'大切なものを{喪失}した悲しみは深い。',meaning:'なくすこと・失うこと',level:'standard'},
  {id:368,type:'read',kanji:'回避',reading:'かいひ',example:'問題を{回避}するのではなく、向き合うべきだ。',meaning:'さけること・うまく切り抜けること',level:'standard'},
  {id:369,type:'read',kanji:'相互',reading:'そうご',example:'{相互}理解が国際協調の基盤になる。',meaning:'お互い・互いに',level:'standard'},
  {id:370,type:'read',kanji:'均衡',reading:'きんこう',example:'需要と供給の{均衡}を保つことが重要だ。',meaning:'つり合いがとれていること',level:'standard'},
  {id:371,type:'read',kanji:'循環',reading:'じゅんかん',example:'資源の{循環}利用で廃棄物を減らす。',meaning:'くるくる回ること・繰り返し流れること',level:'standard'},
  {id:372,type:'read',kanji:'蓄積',reading:'ちくせき',example:'長年の{蓄積}がいざというときに力を発揮する。',meaning:'少しずつ積み重なること・ためること',level:'standard'},
  {id:373,type:'read',kanji:'誇張',reading:'こちょう',example:'話を{誇張}して伝えると信頼を失う。',meaning:'実際より大げさに表現すること',level:'standard'},
  {id:374,type:'read',kanji:'暗示',reading:'あんじ',example:'作品の結末は冒頭部分で{暗示}されていた。',meaning:'それとなく示すこと・におわせること',level:'standard'},
  {id:375,type:'read',kanji:'随筆',reading:'ずいひつ',example:'著者が日常を書いた{随筆}を読んで共感した。',meaning:'筆者が自由に思いをつづった文章',level:'standard'},
  {id:376,type:'read',kanji:'連鎖',reading:'れんさ',example:'一つの失敗が{連鎖}して大きな問題に発展した。',meaning:'くさりのようにつながること',level:'standard'},
  {id:377,type:'read',kanji:'対照',reading:'たいしょう',example:'二作品を{対照}すると作風の違いが際立つ。',meaning:'二つを並べて比べること・対比',level:'standard'},
  {id:378,type:'read',kanji:'充足',reading:'じゅうそく',example:'精神的な{充足}感が生活の質を高める。',meaning:'十分に満ち足りていること',level:'standard'},
  {id:379,type:'read',kanji:'偏重',reading:'へんちょう',example:'知識の{偏重}は思考の硬直化を招く恐れがある。',meaning:'一方に片寄りすぎること',level:'standard'},
  {id:380,type:'read',kanji:'凝縮',reading:'ぎょうしゅく',example:'著者の思想が一文に{凝縮}されている。',meaning:'ぎゅっと集まって濃くなること',level:'standard'},

  // ════ 読み問題 ── 発展（追加） ════
  {id:391,type:'read',kanji:'恣意',reading:'しい',example:'{恣意}的な解釈は議論をゆがめる。',meaning:'気ままで勝手なこと（恣意的＝根拠なく勝手に）',level:'advanced'},
  {id:392,type:'read',kanji:'矜持',reading:'きょうじ',example:'職人としての{矜持}が作品に宿っている。',meaning:'自分の能力への自負・誇り',level:'advanced'},
  {id:393,type:'read',kanji:'陳腐',reading:'ちんぷ',example:'{陳腐}な表現を避けて独自の言葉を選ぶ。',meaning:'古くさくてありふれていること',level:'advanced'},
  {id:394,type:'read',kanji:'曖昧',reading:'あいまい',example:'{曖昧}な返答では相手に誠意が伝わらない。',meaning:'はっきりしない・どちらともとれること',level:'advanced'},
  {id:395,type:'read',kanji:'顕著',reading:'けんちょ',example:'努力の成果が{顕著}に現れた。',meaning:'際立ってはっきり目立つこと',level:'advanced'},
  {id:396,type:'read',kanji:'錯誤',reading:'さくご',example:'試行{錯誤}を繰り返して最善策を見つけた。',meaning:'まちがえること・誤った判断',level:'advanced'},
  {id:397,type:'read',kanji:'辟易',reading:'へきえき',example:'しつこい勧誘に{辟易}した。',meaning:'うんざりして困ること',level:'advanced'},
  {id:398,type:'read',kanji:'揶揄',reading:'やゆ',example:'相手を{揶揄}する発言は場の雰囲気を壊す。',meaning:'からかうこと・なぶりものにすること',level:'advanced'},
  {id:399,type:'read',kanji:'跋扈',reading:'ばっこ',example:'悪習が{跋扈}して組織全体に広がった。',meaning:'のさばりはびこること',level:'advanced'},
  {id:400,type:'read',kanji:'凌駕',reading:'りょうが',example:'新製品の性能が旧来品を大きく{凌駕}した。',meaning:'他をしのいで上回ること',level:'advanced'},

  // ════ 書き問題 ── 基礎（追加） ════
  {id:501,type:'write',kanji:'努力',reading:'どりょく',example:'目標のために毎日{どりょく}を続けた。',meaning:'ある目的のために力を尽くすこと',level:'basic'},
  {id:502,type:'write',kanji:'集中',reading:'しゅうちゅう',example:'一点に{しゅうちゅう}して課題に取り組む。',meaning:'ひとところに集まること・意識を向けること',level:'basic'},
  {id:503,type:'write',kanji:'発見',reading:'はっけん',example:'新しい事実を{はっけん}して驚いた。',meaning:'まだ知られていなかったものを見つけること',level:'basic'},
  {id:504,type:'write',kanji:'研究',reading:'けんきゅう',example:'環境問題について徹底的に{けんきゅう}する。',meaning:'物事を詳しく調べて真理を明らかにすること',level:'basic'},
  {id:505,type:'write',kanji:'証明',reading:'しょうめい',example:'仮説の正しさを実験で{しょうめい}した。',meaning:'根拠を挙げて正しさを明らかにすること',level:'basic'},
  {id:506,type:'write',kanji:'議論',reading:'ぎろん',example:'テーマについてクラス全体で{ぎろん}した。',meaning:'互いに意見を述べて論じ合うこと',level:'basic'},
  {id:507,type:'write',kanji:'結論',reading:'けつろん',example:'話し合いを重ねて{けつろん}を出した。',meaning:'最終的に導き出した判断・まとめ',level:'basic'},
  {id:508,type:'write',kanji:'根拠',reading:'こんきょ',example:'意見には必ず{こんきょ}を示すべきだ。',meaning:'判断・主張のよりどころとなる事実',level:'basic'},
  {id:509,type:'write',kanji:'理解',reading:'りかい',example:'説明を聞いて内容を正確に{りかい}した。',meaning:'物事の意味・内容をよく知ること',level:'basic'},
  {id:510,type:'write',kanji:'知識',reading:'ちしき',example:'幅広い{ちしき}を身につけることが大切だ。',meaning:'学習や経験によって得た情報・情報の蓄え',level:'basic'},
  {id:511,type:'write',kanji:'準備',reading:'じゅんび',example:'発表の{じゅんび}を前日のうちに済ませた。',meaning:'物事を行う前にあらかじめ整えること',level:'basic'},
  {id:512,type:'write',kanji:'整理',reading:'せいり',example:'資料を分類して{せいり}する。',meaning:'乱れたものをきちんとまとめること',level:'basic'},
  {id:513,type:'write',kanji:'確認',reading:'かくにん',example:'提出前に内容を再度{かくにん}した。',meaning:'間違いないかどうか確かめること',level:'basic'},
  {id:514,type:'write',kanji:'注意',reading:'ちゅうい',example:'車道を渡るときは{ちゅうい}が必要だ。',meaning:'気をつけること・警告・集中して向けること',level:'basic'},
  {id:515,type:'write',kanji:'配慮',reading:'はいりょ',example:'相手の立場への{はいりょ}を忘れない。',meaning:'相手のことを考えて気をくばること',level:'basic'},
  {id:516,type:'write',kanji:'尊重',reading:'そんちょう',example:'他者の意見を{そんちょう}して聞く。',meaning:'大切なものとして重んじること',level:'basic'},
  {id:517,type:'write',kanji:'責任',reading:'せきにん',example:'自分の行動に{せきにん}を持つ。',meaning:'自分がしたことに対して負うべき義務',level:'basic'},
  {id:518,type:'write',kanji:'義務',reading:'ぎむ',example:'納税は国民の{ぎむ}である。',meaning:'当然しなければならないこと',level:'basic'},
  {id:519,type:'write',kanji:'権利',reading:'けんり',example:'教育を受ける{けんり}はすべての子どもに保障される。',meaning:'自分の利益のために要求できる正当な資格',level:'basic'},
  {id:520,type:'write',kanji:'自由',reading:'じゆう',example:'表現の{じゆう}は民主主義の根幹だ。',meaning:'他に縛られず自分の意思で行動できること',level:'basic'},
  {id:521,type:'write',kanji:'平等',reading:'びょうどう',example:'性別に関わらず{びょうどう}に扱われるべきだ。',meaning:'差別なくすべて同じであること',level:'basic'},
  {id:522,type:'write',kanji:'公正',reading:'こうせい',example:'{こうせい}な審判が試合の信頼を支える。',meaning:'えこひいきなく正しいこと',level:'basic'},
  {id:523,type:'write',kanji:'秩序',reading:'ちつじょ',example:'社会の{ちつじょ}を維持するために法律がある。',meaning:'正しい順序・まとまったまとまり',level:'basic'},
  {id:524,type:'write',kanji:'改革',reading:'かいかく',example:'古い制度を{かいかく}して新しい時代に対応する。',meaning:'悪い点を改めて新しくすること',level:'basic'},
  {id:525,type:'write',kanji:'繁栄',reading:'はんえい',example:'国が{はんえい}するためには教育が欠かせない。',meaning:'栄えて豊かになること',level:'basic'},
  {id:526,type:'write',kanji:'対立',reading:'たいりつ',example:'意見の{たいりつ}をうまく調整することが求められた。',meaning:'互いに反対の立場で争うこと',level:'basic'},
  {id:527,type:'write',kanji:'個性',reading:'こせい',example:'それぞれの{こせい}を大切にした教育を行う。',meaning:'その人だけに備わった独特の性質',level:'basic'},
  {id:528,type:'write',kanji:'多様',reading:'たよう',example:'{たよう}な価値観を認め合う社会をつくる。',meaning:'種類が多くさまざまなこと',level:'basic'},
  {id:529,type:'write',kanji:'変化',reading:'へんか',example:'気候の{へんか}が生態系に影響を与えている。',meaning:'状態や性質が変わること',level:'basic'},
  {id:530,type:'write',kanji:'原因',reading:'げんいん',example:'失敗の{げんいん}を冷静に分析した。',meaning:'ある結果をもたらすもとになること',level:'basic'},
  {id:531,type:'write',kanji:'結果',reading:'けっか',example:'努力した{けっか}、合格を勝ち取った。',meaning:'ある原因・行為から生まれた状態',level:'basic'},
  {id:532,type:'write',kanji:'関係',reading:'かんけい',example:'二つの事柄の{かんけい}を図で示した。',meaning:'互いにつながりがあること',level:'basic'},
  {id:533,type:'write',kanji:'可能',reading:'かのう',example:'練習次第でこの目標は{かのう}だと思う。',meaning:'実現できること・できる見込みがあること',level:'basic'},
  {id:534,type:'write',kanji:'重要',reading:'じゅうよう',example:'健康は{じゅうよう}な財産のひとつだ。',meaning:'大切で重みがあること',level:'basic'},
  {id:535,type:'write',kanji:'適切',reading:'てきせつ',example:'場面に{てきせつ}な言葉を選んで伝える。',meaning:'その場にぴったりと当てはまること',level:'basic'},
  {id:536,type:'write',kanji:'具体',reading:'ぐたい',example:'{ぐたい}的な例を挙げて説明する。',meaning:'はっきりした形・内容を持っていること',level:'basic'},
  {id:537,type:'write',kanji:'客観',reading:'きゃっかん',example:'感情に流されず{きゃっかん}的に判断する。',meaning:'自分の立場を離れて公平に見ること',level:'basic'},
  {id:538,type:'write',kanji:'記録',reading:'きろく',example:'大会の{きろく}を塗り替えた選手が表彰された。',meaning:'書き留めること・成績・最高の成果',level:'basic'},
  {id:539,type:'write',kanji:'目的',reading:'もくてき',example:'何のためにやるかという{もくてき}を明確にする。',meaning:'達成しようとする目標・ねらい',level:'basic'},
  {id:540,type:'write',kanji:'方法',reading:'ほうほう',example:'効率的な学習の{ほうほう}を試してみた。',meaning:'物事を行うやり方・手段',level:'basic'},

  // ════ 書き問題 ── 標準（追加） ════
  {id:561,type:'write',kanji:'前提',reading:'ぜんてい',example:'この議論には重要な{ぜんてい}がある。',meaning:'あらかじめ認められている条件・根拠',level:'standard'},
  {id:562,type:'write',kanji:'仮説',reading:'かせつ',example:'{かせつ}を立てて実験で確かめる。',meaning:'まだ証明されていない仮の説',level:'standard'},
  {id:563,type:'write',kanji:'検証',reading:'けんしょう',example:'主張の正しさを{けんしょう}する必要がある。',meaning:'検討・実験などで証明すること',level:'standard'},
  {id:564,type:'write',kanji:'分析',reading:'ぶんせき',example:'データを{ぶんせき}して傾向を把握した。',meaning:'複雑な事柄を要素に分けて調べること',level:'standard'},
  {id:565,type:'write',kanji:'総合',reading:'そうごう',example:'各教科を{そうごう}的に学ぶ姿勢が大切だ。',meaning:'いくつかのものをひとつにまとめること',level:'standard'},
  {id:566,type:'write',kanji:'方針',reading:'ほうしん',example:'学校全体の教育{ほうしん}を保護者に説明した。',meaning:'行動の目指す方向・基本的な考え方',level:'standard'},
  {id:567,type:'write',kanji:'対策',reading:'たいさく',example:'いじめ問題への{たいさく}を具体的に提示する。',meaning:'相手や状況に応じた手段・措置',level:'standard'},
  {id:568,type:'write',kanji:'優先',reading:'ゆうせん',example:'命を{ゆうせん}して行動することが求められた。',meaning:'他より先に扱うこと・重要度を高くすること',level:'standard'},
  {id:569,type:'write',kanji:'過程',reading:'かてい',example:'結果だけでなく{かてい}を大切にする教育。',meaning:'物事が変化していく途中・プロセス',level:'standard'},
  {id:570,type:'write',kanji:'展望',reading:'てんぼう',example:'技術革新が社会の新たな{てんぼう}を開く。',meaning:'先のことへの見通し・希望ある将来',level:'standard'},
  {id:571,type:'write',kanji:'危機',reading:'きき',example:'地球温暖化は{きき}的な状況にある。',meaning:'危険が迫った状態・重大な局面',level:'standard'},
  {id:572,type:'write',kanji:'懸念',reading:'けねん',example:'計画の遅れを{けねん}する声が上がった。',meaning:'気になって心配すること',level:'standard'},
  {id:573,type:'write',kanji:'均衡',reading:'きんこう',example:'生態系の{きんこう}が崩れると多くの種が消える。',meaning:'釣り合いが保たれていること',level:'standard'},
  {id:574,type:'write',kanji:'循環',reading:'じゅんかん',example:'水の{じゅんかん}は自然界の基本的な仕組みだ。',meaning:'繰り返し回ること・サイクル',level:'standard'},
  {id:575,type:'write',kanji:'蓄積',reading:'ちくせき',example:'年月をかけた経験の{ちくせき}が深みを生む。',meaning:'少しずつ積み重ねてためること',level:'standard'},
  {id:576,type:'write',kanji:'連携',reading:'れんけい',example:'学校と地域が{れんけい}して子どもを育てる。',meaning:'互いに連絡を取り合って協力すること',level:'standard'},
  {id:577,type:'write',kanji:'葛藤',reading:'かっとう',example:'進路について{かっとう}しながら答えを探した。',meaning:'心の中で二つの考えが対立して悩むこと',level:'standard'},
  {id:578,type:'write',kanji:'回避',reading:'かいひ',example:'リスクを{かいひ}するための計画を立てた。',meaning:'うまく避けること',level:'standard'},
  {id:579,type:'write',kanji:'逸脱',reading:'いつだつ',example:'規定から{いつだつ}した行為は認められない。',meaning:'決まったところから外れること',level:'standard'},
  {id:580,type:'write',kanji:'網羅',reading:'もうら',example:'試験範囲を{もうら}した問題集を使って対策する。',meaning:'広い範囲をすべて含んでいること',level:'standard'},

  // ════ 書き問題 ── 発展（追加） ════
  {id:591,type:'write',kanji:'矜持',reading:'きょうじ',example:'作家としての{きょうじ}が作品に宿っていた。',meaning:'自分の能力・立場への誇り・自負',level:'advanced'},
  {id:592,type:'write',kanji:'曖昧',reading:'あいまい',example:'{あいまい}な答えではなく明確な説明を求めた。',meaning:'はっきりしない・どちらともとれること',level:'advanced'},
  {id:593,type:'write',kanji:'陳腐',reading:'ちんぷ',example:'{ちんぷ}な表現を使わず独創的な文章を書く。',meaning:'古くさくありふれていること',level:'advanced'},
  {id:594,type:'write',kanji:'錯誤',reading:'さくご',example:'試行{さくご}を重ねてようやく解決策を見つけた。',meaning:'誤った判断・まちがえること',level:'advanced'},
  {id:595,type:'write',kanji:'鼓舞',reading:'こぶ',example:'監督の言葉がチームを{こぶ}した。',meaning:'励まし奮い立たせること',level:'advanced'},
  {id:596,type:'write',kanji:'洞察',reading:'どうさつ',example:'鋭い{どうさつ}が問題の本質を見抜いた。',meaning:'物事の本質を深く見通すこと',level:'advanced'},
  {id:597,type:'write',kanji:'啓発',reading:'けいはつ',example:'講演を聞いて知的に{けいはつ}された気がした。',meaning:'気づかせて、より高い認識へ導くこと',level:'advanced'},
  {id:598,type:'write',kanji:'喚起',reading:'かんき',example:'この作品は読む者の想像力を{かんき}する。',meaning:'呼び起こすこと・注意などを促すこと',level:'advanced'},
  {id:599,type:'write',kanji:'翻弄',reading:'ほんろう',example:'運命に{ほんろう}されながらも信念を貫いた。',meaning:'自分の思い通りに扱うこと・もてあそぶこと',level:'advanced'},
  {id:600,type:'write',kanji:'慈悲',reading:'じひ',example:'相手への{じひ}の心を忘れずに行動する。',meaning:'いつくしみとあわれみの心',level:'advanced'},

  // ════ 読み問題 ── 標準（都立西対策追加） ════
  {id:381,type:'read',kanji:'体裁',reading:'ていさい',example:'文章の{体裁}を整えてから提出した。',meaning:'外から見たようす・形式・見栄え',level:'standard'},
  {id:382,type:'read',kanji:'模索',reading:'もさく',example:'解決策を{模索}しながら少しずつ前進する。',meaning:'手探りで探し求めること',level:'standard'},
  {id:383,type:'read',kanji:'解明',reading:'かいめい',example:'事件の真相を{解明}することが急務だ。',meaning:'よくわからないことを明らかにすること',level:'standard'},
  {id:384,type:'read',kanji:'共鳴',reading:'きょうめい',example:'彼の言葉に強く{共鳴}して涙が出た。',meaning:'感情・思想が響き合うこと',level:'standard'},
  {id:385,type:'read',kanji:'相違',reading:'そうい',example:'両者の認識に大きな{相違}があった。',meaning:'互いに異なること・違い',level:'standard'},
  {id:386,type:'read',kanji:'道理',reading:'どうり',example:'{道理}にかなった主張は人を説得する力を持つ。',meaning:'物事の正しい筋道・理屈',level:'standard'},
  {id:387,type:'read',kanji:'逸話',reading:'いつわ',example:'偉人にまつわる{逸話}が後世に語り継がれる。',meaning:'世間にあまり知られていない興味深いエピソード',level:'standard'},
  {id:388,type:'read',kanji:'顛末',reading:'てんまつ',example:'事件の{顛末}をすべて正直に話した。',meaning:'物事の始まりから終わりまでの一部始終',level:'standard'},
  {id:389,type:'read',kanji:'抹消',reading:'まっしょう',example:'記録から名前が{抹消}されていた。',meaning:'消し去ること・なかったことにすること',level:'standard'},
  {id:390,type:'read',kanji:'概括',reading:'がいかつ',example:'議論の内容を{概括}して要点をまとめた。',meaning:'全体の内容を大まかにまとめること',level:'standard'},

  // ════ 読み問題 ── 発展（都立西・独自問題レベル追加） ════
  {id:401,type:'read',kanji:'洗練',reading:'せんれん',example:'長年の鍛錬によって技が{洗練}された。',meaning:'磨き上げて上品・優雅になること',level:'advanced'},
  {id:402,type:'read',kanji:'融合',reading:'ゆうごう',example:'東西の文化が{融合}した独自の芸術が花開いた。',meaning:'二つ以上のものが溶け合って一つになること',level:'advanced'},
  {id:403,type:'read',kanji:'脆弱',reading:'ぜいじゃく',example:'システムの{脆弱}性を改善する作業が続いた。',meaning:'もろくて弱いこと',level:'advanced'},
  {id:404,type:'read',kanji:'超克',reading:'ちょうこく',example:'自己の限界を{超克}することで人は成長する。',meaning:'乗り越えて克服すること',level:'advanced'},
  {id:405,type:'read',kanji:'敷衍',reading:'ふえん',example:'短い命題を{敷衍}して論文にまとめた。',meaning:'意味をひろげて詳しく説明すること',level:'advanced'},
  {id:406,type:'read',kanji:'頓挫',reading:'とんざ',example:'資金難で計画が{頓挫}してしまった。',meaning:'物事が途中で行き詰まって止まること',level:'advanced'},
  {id:407,type:'read',kanji:'精緻',reading:'せいち',example:'{精緻}な論理で反論を丁寧に組み立てた。',meaning:'細部まで精巧で緻密なこと',level:'advanced'},
  {id:408,type:'read',kanji:'陶冶',reading:'とうや',example:'若い頃の読書体験が人格を{陶冶}する。',meaning:'才能・人格を鍛え育てること',level:'advanced'},
  {id:409,type:'read',kanji:'造詣',reading:'ぞうけい',example:'彼女は古典文学に深い{造詣}を持っている。',meaning:'ある分野への深い学識・知見',level:'advanced'},
  {id:410,type:'read',kanji:'斟酌',reading:'しんしゃく',example:'相手の事情を{斟酌}して返答を選んだ。',meaning:'相手の立場・事情を考慮すること',level:'advanced'},
  {id:411,type:'read',kanji:'看過',reading:'かんか',example:'この問題を{看過}することは許されない。',meaning:'見逃すこと・黙って通り過ごすこと',level:'advanced'},
  {id:412,type:'read',kanji:'朦朧',reading:'もうろう',example:'疲労で意識が{朦朧}とする中、最後まで書き続けた。',meaning:'ぼんやりとかすんでいるさま',level:'advanced'},
  {id:413,type:'read',kanji:'高邁',reading:'こうまい',example:'{高邁}な理想を掲げて社会改革に生涯を捧げた。',meaning:'志・精神が高く気高いこと',level:'advanced'},
  {id:414,type:'read',kanji:'恬淡',reading:'てんたん',example:'名声に{恬淡}として、静かに研究を続けた。',meaning:'世俗的な欲にこだわらず落ち着いているさま',level:'advanced'},
  {id:415,type:'read',kanji:'渾然',reading:'こんぜん',example:'喜びと悲しみが{渾然}一体となった複雑な表情だった。',meaning:'すべてが溶け合って区別がつかないさま',level:'advanced'},

  // ════ 書き問題 ── 標準（都立西対策追加） ════
  {id:541,type:'write',kanji:'体裁',reading:'ていさい',example:'レポートの{ていさい}を整えてから提出する。',meaning:'外から見たようす・形式・見栄え',level:'standard'},
  {id:542,type:'write',kanji:'模索',reading:'もさく',example:'より良い方法を{もさく}しながら取り組む。',meaning:'手探りで探し求めること',level:'standard'},
  {id:543,type:'write',kanji:'解明',reading:'かいめい',example:'謎を{かいめい}するために証拠を集めた。',meaning:'明らかにすること',level:'standard'},
  {id:544,type:'write',kanji:'共鳴',reading:'きょうめい',example:'その演奏は聴衆の心に深く{きょうめい}した。',meaning:'感情・思想が響き合うこと',level:'standard'},
  {id:545,type:'write',kanji:'相違',reading:'そうい',example:'認識の{そうい}をすり合わせる作業が必要だ。',meaning:'互いに違うこと',level:'standard'},
  {id:546,type:'write',kanji:'道理',reading:'どうり',example:'{どうり}に合った説明があれば誰でも納得できる。',meaning:'正しい筋道・理屈',level:'standard'},
  {id:547,type:'write',kanji:'逸話',reading:'いつわ',example:'その偉人には多くの{いつわ}が残されている。',meaning:'世間にあまり知られていない興味深いエピソード',level:'standard'},
  {id:548,type:'write',kanji:'顛末',reading:'てんまつ',example:'失敗の{てんまつ}を包み隠さず説明した。',meaning:'物事の始まりから終わりまでの経過',level:'standard'},
  {id:549,type:'write',kanji:'抹消',reading:'まっしょう',example:'不要なデータを{まっしょう}した。',meaning:'消し去ること',level:'standard'},
  {id:550,type:'write',kanji:'概括',reading:'がいかつ',example:'議論の内容を{がいかつ}してまとめる。',meaning:'全体を大まかにまとめること',level:'standard'},

  // ════ 書き問題 ── 発展（都立西・独自問題レベル追加） ════
  {id:611,type:'write',kanji:'洗練',reading:'せんれん',example:'表現を{せんれん}させて作品の完成度を高めた。',meaning:'磨き上げて上品になること',level:'advanced'},
  {id:612,type:'write',kanji:'融合',reading:'ゆうごう',example:'異なる文化の{ゆうごう}から新しい価値が生まれる。',meaning:'溶け合って一つになること',level:'advanced'},
  {id:613,type:'write',kanji:'脆弱',reading:'ぜいじゃく',example:'社会的に{ぜいじゃく}な立場の人々を守る制度が必要だ。',meaning:'もろくて弱いこと',level:'advanced'},
  {id:614,type:'write',kanji:'超克',reading:'ちょうこく',example:'偏見という{ちょうこく}すべき課題に真剣に向き合う。',meaning:'乗り越えて克服すること',level:'advanced'},
  {id:615,type:'write',kanji:'頓挫',reading:'とんざ',example:'交渉が{とんざ}し、計画は白紙に戻った。',meaning:'途中で止まってしまうこと',level:'advanced'},
  {id:616,type:'write',kanji:'精緻',reading:'せいち',example:'{せいち}な描写で登場人物の心理を表現した。',meaning:'細かく精巧で緻密なこと',level:'advanced'},
  {id:617,type:'write',kanji:'造詣',reading:'ぞうけい',example:'美術に深い{ぞうけい}を持つ評論家として知られる。',meaning:'ある分野への深い学識・知見',level:'advanced'},
  {id:618,type:'write',kanji:'陶冶',reading:'とうや',example:'厳しい訓練が人格を{とうや}するのだと信じた。',meaning:'才能・性格を鍛え育てること',level:'advanced'},
  {id:619,type:'write',kanji:'看過',reading:'かんか',example:'些細なミスも{かんか}せずに修正する姿勢が大切だ。',meaning:'見逃すこと',level:'advanced'},
  {id:620,type:'write',kanji:'斟酌',reading:'しんしゃく',example:'相手の気持ちを{しんしゃく}した上で発言する。',meaning:'事情を考慮すること',level:'advanced'},

  // ════ 読み問題 ── 基礎（第3弾） ════
  {id:341,type:'read',kanji:'貴重',reading:'きちょう',example:'{貴重}な体験を無駄にしないようにしたい。',meaning:'かけがえなく大切なこと',level:'basic'},
  {id:342,type:'read',kanji:'豊富',reading:'ほうふ',example:'{豊富}な知識を持つ先生に学んだ。',meaning:'十分すぎるほど多くあること',level:'basic'},
  {id:343,type:'read',kanji:'独自',reading:'どくじ',example:'彼は{独自}のやり方で問題を解いた。',meaning:'他と異なる、そのものだけのもの',level:'basic'},
  {id:344,type:'read',kanji:'共通',reading:'きょうつう',example:'二つの作品に{共通}するテーマを探す。',meaning:'二つ以上のものに同じように当てはまること',level:'basic'},
  {id:345,type:'read',kanji:'目標',reading:'もくひょう',example:'高い{目標}を持って毎日努力する。',meaning:'目指すべき目的・達成しようとすること',level:'basic'},
  {id:346,type:'read',kanji:'需要',reading:'じゅよう',example:'資源への{需要}が世界的に高まっている。',meaning:'必要として求めること・市場の要求',level:'basic'},
  {id:347,type:'read',kanji:'供給',reading:'きょうきゅう',example:'電力の{供給}が不安定になった。',meaning:'必要に応じて与えること・提供すること',level:'basic'},
  {id:348,type:'read',kanji:'格差',reading:'かくさ',example:'経済的な{格差}を縮めることが社会の課題だ。',meaning:'等級・水準などの差・開き',level:'basic'},
  {id:349,type:'read',kanji:'平均',reading:'へいきん',example:'テストの{平均}点が昨年より上がった。',meaning:'複数の値をならして等しくした値',level:'basic'},
  {id:350,type:'read',kanji:'基礎',reading:'きそ',example:'語学の{基礎}を固めることが上達への近道だ。',meaning:'物事の土台・根本となる部分',level:'basic'},
  {id:351,type:'read',kanji:'応用',reading:'おうよう',example:'基礎的な知識を{応用}して問題を解く。',meaning:'原理・理論を実際の問題に当てはめること',level:'basic'},
  {id:352,type:'read',kanji:'模範',reading:'もはん',example:'先輩の姿勢が後輩の{模範}となっている。',meaning:'見習うべき手本・例',level:'basic'},
  {id:353,type:'read',kanji:'節約',reading:'せつやく',example:'水を{節約}するための取り組みを続けた。',meaning:'むだをなくして大切に使うこと',level:'basic'},
  {id:354,type:'read',kanji:'生産',reading:'せいさん',example:'食料の{生産}量を増やす努力が続く。',meaning:'原料から製品・作物を作り出すこと',level:'basic'},
  {id:355,type:'read',kanji:'消費',reading:'しょうひ',example:'エネルギーの{消費}を減らす工夫をする。',meaning:'使ってなくすこと・費やすこと',level:'basic'},
  {id:356,type:'read',kanji:'積極',reading:'せっきょく',example:'会議では{積極}的に発言するように心がけた。',meaning:'自分から進んで行動するさま（積極的）',level:'basic'},
  {id:357,type:'read',kanji:'公平',reading:'こうへい',example:'審判は{公平}な立場で試合を裁く。',meaning:'偏りなくどちらにも同じように接すること',level:'basic'},
  {id:358,type:'read',kanji:'中立',reading:'ちゅうりつ',example:'対立する両者の間で{中立}の立場を保った。',meaning:'どちらの側にもかたよらないこと',level:'basic'},
  {id:359,type:'read',kanji:'根本',reading:'こんぽん',example:'問題の{根本}から解決しなければならない。',meaning:'物事のもとになる大切な部分',level:'basic'},
  {id:360,type:'read',kanji:'奉仕',reading:'ほうし',example:'地域社会への{奉仕}活動に積極的に参加した。',meaning:'報酬を求めず力を尽くすこと',level:'basic'},

  // ════ 読み問題 ── 標準（第3弾） ════
  {id:416,type:'read',kanji:'内省',reading:'ないせい',example:'失敗を{内省}して同じ過ちを繰り返さない。',meaning:'自分自身を深く省みること',level:'standard'},
  {id:417,type:'read',kanji:'緻密',reading:'ちみつ',example:'{緻密}な計画を立てて実行に移した。',meaning:'細かいところまで丁寧で正確なこと',level:'standard'},
  {id:418,type:'read',kanji:'類似',reading:'るいじ',example:'二つの事件には{類似}した点が多くある。',meaning:'互いによく似ていること',level:'standard'},
  {id:419,type:'read',kanji:'差異',reading:'さい',example:'文化的な{差異}を理解することが大切だ。',meaning:'異なること・違い',level:'standard'},
  {id:420,type:'read',kanji:'転換',reading:'てんかん',example:'発想を{転換}することで解決策が見えた。',meaning:'方向・内容などを切り替えること',level:'standard'},
  {id:421,type:'read',kanji:'派生',reading:'はせい',example:'新しい問題が元の課題から{派生}した。',meaning:'元のものから分かれて生じること',level:'standard'},
  {id:422,type:'read',kanji:'先駆',reading:'せんく',example:'環境保護運動の{先駆}となった団体を調べる。',meaning:'他に先んじて物事を行うこと・草分け',level:'standard'},
  {id:423,type:'read',kanji:'媒介',reading:'ばいかい',example:'言語は思想を伝える{媒介}となる。',meaning:'なかだちをするもの・つなぎ役',level:'standard'},
  {id:424,type:'read',kanji:'帰結',reading:'きけつ',example:'長い議論が一つの{帰結}にたどりついた。',meaning:'ある前提から導き出される結論',level:'standard'},
  {id:425,type:'read',kanji:'惰性',reading:'だせい',example:'{惰性}で続けるだけでは本当の力はつかない。',meaning:'以前の習慣・勢いのままに続くこと',level:'standard'},
  {id:426,type:'read',kanji:'浸透',reading:'しんとう',example:'環境意識が社会全体に{浸透}してきた。',meaning:'しみわたること・広く行き渡ること',level:'standard'},
  {id:427,type:'read',kanji:'変遷',reading:'へんせん',example:'言葉の意味の{変遷}をたどる研究が面白い。',meaning:'時とともに移り変わること',level:'standard'},
  {id:428,type:'read',kanji:'推移',reading:'すいい',example:'気温の{推移}をグラフで表した。',meaning:'時間の経過とともに変化していくこと',level:'standard'},
  {id:429,type:'read',kanji:'均質',reading:'きんしつ',example:'{均質}な製品を安定して生産する体制を整えた。',meaning:'質・性質が一様で等しいこと',level:'standard'},
  {id:430,type:'read',kanji:'脱却',reading:'だっきゃく',example:'古い慣習から{脱却}して新しい価値観を取り入れる。',meaning:'ある状態や枠組みから抜け出すこと',level:'standard'},
  {id:431,type:'read',kanji:'補完',reading:'ほかん',example:'互いの弱点を{補完}し合うチームを作った。',meaning:'不足した部分を補って完全にすること',level:'standard'},
  {id:432,type:'read',kanji:'省察',reading:'せいさつ',example:'自らの行動を{省察}することで成長できる。',meaning:'よく考えて反省・吟味すること',level:'standard'},
  {id:433,type:'read',kanji:'論拠',reading:'ろんきょ',example:'主張の{論拠}を明確に示さなければ説得力がない。',meaning:'議論の根拠となる事実・理由',level:'standard'},
  {id:434,type:'read',kanji:'逆転',reading:'ぎゃくてん',example:'最後の最後で形勢が{逆転}した。',meaning:'順序・形勢などが逆になること',level:'standard'},
  {id:435,type:'read',kanji:'整合',reading:'せいごう',example:'主張が事実と{整合}するかどうかを確かめる。',meaning:'複数のものがうまく合っていること',level:'standard'},

  // ════ 書き問題 ── 基礎（第3弾） ════
  {id:651,type:'write',kanji:'貴重',reading:'きちょう',example:'{きちょう}な体験を無駄にしないようにしたい。',meaning:'かけがえなく大切なこと',level:'basic'},
  {id:652,type:'write',kanji:'豊富',reading:'ほうふ',example:'{ほうふ}な知識を活かして仕事に取り組む。',meaning:'十分すぎるほど多くあること',level:'basic'},
  {id:653,type:'write',kanji:'目標',reading:'もくひょう',example:'高い{もくひょう}を持って毎日努力する。',meaning:'達成しようとする目的・ねらい',level:'basic'},
  {id:654,type:'write',kanji:'需要',reading:'じゅよう',example:'社会の{じゅよう}に応えた商品を開発する。',meaning:'必要として求めること',level:'basic'},
  {id:655,type:'write',kanji:'供給',reading:'きょうきゅう',example:'水の{きょうきゅう}が不安定になった地域を支援する。',meaning:'必要に応じて提供すること',level:'basic'},
  {id:656,type:'write',kanji:'格差',reading:'かくさ',example:'経済的な{かくさ}を縮めることが社会の課題だ。',meaning:'等級・水準などの差・開き',level:'basic'},
  {id:657,type:'write',kanji:'平均',reading:'へいきん',example:'テストの{へいきん}点が昨年より上がった。',meaning:'複数の値をならして等しくした値',level:'basic'},
  {id:658,type:'write',kanji:'模範',reading:'もはん',example:'先輩の行動が後輩の{もはん}となっている。',meaning:'見習うべき手本・例',level:'basic'},
  {id:659,type:'write',kanji:'節約',reading:'せつやく',example:'エネルギーを{せつやく}する工夫を生活に取り入れた。',meaning:'むだをなくして大切に使うこと',level:'basic'},
  {id:660,type:'write',kanji:'公平',reading:'こうへい',example:'{こうへい}な評価を受けることが大切だ。',meaning:'偏りなく接すること',level:'basic'},
  {id:661,type:'write',kanji:'中立',reading:'ちゅうりつ',example:'対立する両者の間で{ちゅうりつ}を保った。',meaning:'どちらにもかたよらないこと',level:'basic'},
  {id:662,type:'write',kanji:'根本',reading:'こんぽん',example:'問題の{こんぽん}から解決しなければならない。',meaning:'物事のもとになる大切な部分',level:'basic'},
  {id:663,type:'write',kanji:'応用',reading:'おうよう',example:'基礎を{おうよう}して実際の問題を解く。',meaning:'原理・知識を実際に当てはめること',level:'basic'},
  {id:664,type:'write',kanji:'指導',reading:'しどう',example:'先生の{しどう}のもとで技術を磨いた。',meaning:'指し示して導くこと',level:'basic'},
  {id:665,type:'write',kanji:'訓練',reading:'くんれん',example:'日々の{くんれん}が本番での力を生む。',meaning:'繰り返し練習して能力を高めること',level:'basic'},
  {id:666,type:'write',kanji:'奉仕',reading:'ほうし',example:'地域への{ほうし}活動に積極的に参加した。',meaning:'報酬を求めず力を尽くすこと',level:'basic'},
  {id:667,type:'write',kanji:'犠牲',reading:'ぎせい',example:'他者のために{ぎせい}を払う姿勢が尊ばれた。',meaning:'ある目的のために大切なものを捧げること',level:'basic'},
  {id:668,type:'write',kanji:'共感',reading:'きょうかん',example:'相手の立場に立って{きょうかん}することが大切だ。',meaning:'他者の感情・意見を自分のことのように感じること',level:'basic'},
  {id:669,type:'write',kanji:'提供',reading:'ていきょう',example:'情報を{ていきょう}することで支援につながる。',meaning:'相手のために与えること・差し出すこと',level:'basic'},
  {id:670,type:'write',kanji:'拒否',reading:'きょひ',example:'不当な要求を{きょひ}する勇気が必要だ。',meaning:'ことわること・受け入れないこと',level:'basic'},
  {id:671,type:'write',kanji:'主張',reading:'しゅちょう',example:'自分の考えを明確に{しゅちょう}する。',meaning:'自分の意見・立場を強く述べること',level:'basic'},
  {id:672,type:'write',kanji:'宣言',reading:'せんげん',example:'新しい方針を会議の場で{せんげん}した。',meaning:'広く世に表明すること',level:'basic'},
  {id:673,type:'write',kanji:'管理',reading:'かんり',example:'データを安全に{かんり}する体制を整える。',meaning:'監督・保存して適切に扱うこと',level:'basic'},
  {id:674,type:'write',kanji:'解放',reading:'かいほう',example:'制約から{かいほう}されて自由に発言できる。',meaning:'束縛や制限を取り除くこと',level:'basic'},
  {id:675,type:'write',kanji:'象徴',reading:'しょうちょう',example:'この花は平和の{しょうちょう}として親しまれている。',meaning:'ものごとを表すしるし・シンボル',level:'basic'},
  {id:676,type:'write',kanji:'普及',reading:'ふきゅう',example:'インターネットが社会全体に{ふきゅう}した。',meaning:'広く一般に行き渡ること',level:'basic'},
  {id:677,type:'write',kanji:'遺産',reading:'いさん',example:'文化的な{いさん}を次世代に伝える。',meaning:'後世に残された財産・価値あるもの',level:'basic'},
  {id:678,type:'write',kanji:'伝統',reading:'でんとう',example:'地域の{でんとう}を守り続ける活動に関わる。',meaning:'昔から受け継がれてきた習慣・文化',level:'basic'},
  {id:679,type:'write',kanji:'生産',reading:'せいさん',example:'食料の{せいさん}量を増やす取り組みが進む。',meaning:'原料から製品・作物を作り出すこと',level:'basic'},
  {id:680,type:'write',kanji:'消費',reading:'しょうひ',example:'エネルギー{しょうひ}を抑えた設計の住宅が増えている。',meaning:'使ってなくすこと・費やすこと',level:'basic'},

  // ════ 書き問題 ── 標準（第3弾） ════
  {id:681,type:'write',kanji:'内省',reading:'ないせい',example:'行動を{ないせい}して次に活かす習慣をつける。',meaning:'自分自身を深く省みること',level:'standard'},
  {id:682,type:'write',kanji:'緻密',reading:'ちみつ',example:'{ちみつ}な計画を立てて実行に移した。',meaning:'細かいところまで正確で丁寧なこと',level:'standard'},
  {id:683,type:'write',kanji:'類似',reading:'るいじ',example:'二つの事件には{るいじ}した点が多い。',meaning:'互いによく似ていること',level:'standard'},
  {id:684,type:'write',kanji:'差異',reading:'さい',example:'文化的な{さい}を認め合うことが大切だ。',meaning:'異なること・違い',level:'standard'},
  {id:685,type:'write',kanji:'転換',reading:'てんかん',example:'発想を{てんかん}して新しい方法を試みた。',meaning:'方向・内容などを切り替えること',level:'standard'},
  {id:686,type:'write',kanji:'先駆',reading:'せんく',example:'{せんく}となって新しい分野を切り開いた。',meaning:'他に先んじて行うこと・草分け',level:'standard'},
  {id:687,type:'write',kanji:'媒介',reading:'ばいかい',example:'言語は思想を伝える{ばいかい}となる。',meaning:'なかだちをするもの',level:'standard'},
  {id:688,type:'write',kanji:'惰性',reading:'だせい',example:'{だせい}で続けるだけでは力はつかない。',meaning:'以前の習慣・勢いのままに続くこと',level:'standard'},
  {id:689,type:'write',kanji:'浸透',reading:'しんとう',example:'新しい考え方が社会に{しんとう}してきた。',meaning:'しみわたること・広く行き渡ること',level:'standard'},
  {id:690,type:'write',kanji:'変遷',reading:'へんせん',example:'価値観の{へんせん}をたどる研究を行う。',meaning:'時とともに移り変わること',level:'standard'},
  {id:691,type:'write',kanji:'脱却',reading:'だっきゃく',example:'古い慣習から{だっきゃく}して新しい価値観を作る。',meaning:'ある状態や枠組みから抜け出すこと',level:'standard'},
  {id:692,type:'write',kanji:'補完',reading:'ほかん',example:'互いの弱点を{ほかん}し合うチームを目指す。',meaning:'不足した部分を補って完全にすること',level:'standard'},
  {id:693,type:'write',kanji:'論拠',reading:'ろんきょ',example:'主張の{ろんきょ}を明確に示す。',meaning:'議論の根拠となる事実・理由',level:'standard'},
  {id:694,type:'write',kanji:'逆転',reading:'ぎゃくてん',example:'最後の一手で形勢が{ぎゃくてん}した。',meaning:'順序・形勢などが逆になること',level:'standard'},
  {id:695,type:'write',kanji:'整合',reading:'せいごう',example:'主張と事実が{せいごう}するかを検証する。',meaning:'うまく合っていること・一致していること',level:'standard'},
  {id:696,type:'write',kanji:'省察',reading:'せいさつ',example:'自らの言動を{せいさつ}して改める。',meaning:'よく考えて反省・吟味すること',level:'standard'},
  {id:697,type:'write',kanji:'帰結',reading:'きけつ',example:'長い議論がひとつの{きけつ}にたどりついた。',meaning:'ある前提から導き出される結論',level:'standard'},
  {id:698,type:'write',kanji:'均質',reading:'きんしつ',example:'{きんしつ}な品質を保つための管理が重要だ。',meaning:'質・性質が一様で等しいこと',level:'standard'},
  {id:699,type:'write',kanji:'派生',reading:'はせい',example:'新たな問題が元の課題から{はせい}した。',meaning:'元のものから分かれて生じること',level:'standard'},
  {id:700,type:'write',kanji:'推移',reading:'すいい',example:'状況の{すいい}を注意深く観察する。',meaning:'時間の経過とともに変化していくこと',level:'standard'},

  // ════ 書き問題 ── 基礎・標準・発展（準2〜2級・第4弾） ════
  {id:701,type:'write',kanji:'背景',reading:'はいけい',example:'問題の{はいけい}を理解してから対策を考える。',meaning:'物事の後ろにある事情・原因',level:'basic'},
  {id:702,type:'write',kanji:'由来',reading:'ゆらい',example:'この地名の{ゆらい}を調べてまとめた。',meaning:'物事の起こり・いわれ',level:'basic'},
  {id:703,type:'write',kanji:'意図',reading:'いと',example:'発言の{いと}を正確に受け取る。',meaning:'何かをしようとする目的・ねらい',level:'basic'},
  {id:704,type:'write',kanji:'焦点',reading:'しょうてん',example:'議論の{しょうてん}を明確にする。',meaning:'最も重要な点・問題の中心',level:'basic'},
  {id:705,type:'write',kanji:'見解',reading:'けんかい',example:'専門家の{けんかい}を参考にする。',meaning:'ある問題に対する考え・意見',level:'basic'},
  {id:706,type:'write',kanji:'核心',reading:'かくしん',example:'問題の{かくしん}に迫る質問をした。',meaning:'物事の中心となる大切な部分',level:'basic'},
  {id:707,type:'write',kanji:'構造',reading:'こうぞう',example:'文章の{こうぞう}を把握してから読む。',meaning:'全体のつくり・組み立て',level:'basic'},
  {id:708,type:'write',kanji:'再生',reading:'さいせい',example:'生態系の{さいせい}に取り組む。',meaning:'再び生き返らせること・もとに戻すこと',level:'basic'},
  {id:709,type:'write',kanji:'連帯',reading:'れんたい',example:'市民が{れんたい}して問題に取り組む。',meaning:'共同で責任を持ち結びつくこと',level:'basic'},
  {id:710,type:'write',kanji:'誠意',reading:'せいい',example:'{せいい}を持って謝罪した。',meaning:'真心を尽くした態度',level:'basic'},
  {id:711,type:'write',kanji:'専念',reading:'せんねん',example:'今は学習に{せんねん}する時期だ。',meaning:'ひとつのことだけに集中すること',level:'basic'},
  {id:712,type:'write',kanji:'本音',reading:'ほんね',example:'{ほんね}を話してほしいと頼んだ。',meaning:'本当の気持ち・本心',level:'basic'},
  {id:713,type:'write',kanji:'起源',reading:'きげん',example:'言語の{きげん}を探る研究が続けられている。',meaning:'物事の始まり・根源',level:'basic'},
  {id:714,type:'write',kanji:'団結',reading:'だんけつ',example:'チームが{だんけつ}して目標に向かった。',meaning:'多くの人が一致協力してまとまること',level:'basic'},
  {id:715,type:'write',kanji:'段階',reading:'だんかい',example:'計画を{だんかい}に分けて実行する。',meaning:'物事の順序ある一つ一つの区切り',level:'basic'},
  {id:716,type:'write',kanji:'感性',reading:'かんせい',example:'芸術への豊かな{かんせい}を育てる。',meaning:'物事を感じ取る心の働き・センス',level:'basic'},
  {id:717,type:'write',kanji:'理性',reading:'りせい',example:'{りせい}で判断することが大切だ。',meaning:'論理的・道徳的に考える能力',level:'basic'},
  {id:718,type:'write',kanji:'知性',reading:'ちせい',example:'高い{ちせい}と豊かな感性を兼ね備える。',meaning:'知識を使って考える能力',level:'basic'},
  {id:719,type:'write',kanji:'熟練',reading:'じゅくれん',example:'{じゅくれん}した職人の技が宿っている。',meaning:'練習を積んで技能が優れていること',level:'basic'},
  {id:720,type:'write',kanji:'余暇',reading:'よか',example:'{よか}を利用して読書を楽しむ。',meaning:'仕事のあいた時間・ゆとりの時間',level:'basic'},
  {id:721,type:'write',kanji:'概略',reading:'がいりゃく',example:'計画の{がいりゃく}を説明した。',meaning:'大まかな内容・あらまし',level:'standard'},
  {id:722,type:'write',kanji:'要旨',reading:'ようし',example:'長い文章の{ようし}をまとめる練習をした。',meaning:'文章の中心となる内容',level:'standard'},
  {id:723,type:'write',kanji:'趣旨',reading:'しゅし',example:'会議の{しゅし}を確認した。',meaning:'物事の目的・ねらい',level:'standard'},
  {id:724,type:'write',kanji:'規範',reading:'きはん',example:'社会の{きはん}に従って行動する。',meaning:'行動の基準となるお手本',level:'standard'},
  {id:725,type:'write',kanji:'根底',reading:'こんてい',example:'文化の{こんてい}にある思想を理解する。',meaning:'物事の一番の底・根本',level:'standard'},
  {id:726,type:'write',kanji:'慣行',reading:'かんこう',example:'長年の{かんこう}を見直す。',meaning:'慣れた習わし・しきたり',level:'standard'},
  {id:727,type:'write',kanji:'風潮',reading:'ふうちょう',example:'結果を重視する{ふうちょう}が強まっている。',meaning:'時代や社会の傾向・流れ',level:'standard'},
  {id:728,type:'write',kanji:'慣例',reading:'かんれい',example:'{かんれい}を踏まえて提案を行った。',meaning:'昔から続いている習わし',level:'standard'},
  {id:729,type:'write',kanji:'制約',reading:'せいやく',example:'時間の{せいやく}の中で最善を尽くす。',meaning:'制限として加えられる縛り',level:'standard'},
  {id:730,type:'write',kanji:'束縛',reading:'そくばく',example:'固定観念の{そくばく}から自由になる。',meaning:'自由を奪い縛ること',level:'standard'},
  {id:731,type:'write',kanji:'変容',reading:'へんよう',example:'都市の{へんよう}を記録した写真集。',meaning:'形・性質が変わること',level:'standard'},
  {id:732,type:'write',kanji:'劣化',reading:'れっか',example:'素材の{れっか}を防ぐ保管が必要だ。',meaning:'品質・性能が低下すること',level:'standard'},
  {id:733,type:'write',kanji:'復元',reading:'ふくげん',example:'古文書をもとに建物を{ふくげん}した。',meaning:'元の状態に戻すこと',level:'standard'},
  {id:734,type:'write',kanji:'融和',reading:'ゆうわ',example:'異なる文化の{ゆうわ}が新しい価値を生む。',meaning:'打ち解けて調和すること',level:'standard'},
  {id:735,type:'write',kanji:'摩擦',reading:'まさつ',example:'両国間の{まさつ}が高まっている。',meaning:'利害の対立から生じる不和',level:'standard'},
  {id:736,type:'write',kanji:'安堵',reading:'あんど',example:'無事の知らせを聞いて{あんど}した。',meaning:'心配が消えてほっとすること',level:'standard'},
  {id:737,type:'write',kanji:'感傷',reading:'かんしょう',example:'秋の景色に{かんしょう}的な気分になった。',meaning:'ちょっとしたことに感動して悲しくなる気持ち',level:'standard'},
  {id:738,type:'write',kanji:'哀愁',reading:'あいしゅう',example:'旅先の風景に深い{あいしゅう}を感じた。',meaning:'もの悲しい気持ち・切ない感情',level:'standard'},
  {id:739,type:'write',kanji:'倦怠',reading:'けんたい',example:'長い作業への{けんたい}感を覚えた。',meaning:'あきあきして嫌になる気持ち・疲れ',level:'standard'},
  {id:740,type:'write',kanji:'高潔',reading:'こうけつ',example:'{こうけつ}な人格を持つ人物として尊敬された。',meaning:'人格・行いが気高く清らかなこと',level:'standard'},
  {id:741,type:'write',kanji:'没頭',reading:'ぼっとう',example:'研究に{ぼっとう}するあまり食事を忘れた。',meaning:'一つのことに完全に集中すること',level:'standard'},
  {id:742,type:'write',kanji:'克己',reading:'こっき',example:'{こっき}心を持って誘惑に打ち勝った。',meaning:'自分の欲望・弱さに打ち勝つこと',level:'standard'},
  {id:743,type:'write',kanji:'節制',reading:'せっせい',example:'食事と運動の{せっせい}が健康の基本だ。',meaning:'度を超えないよう控えること',level:'standard'},
  {id:744,type:'write',kanji:'毅然',reading:'きぜん',example:'不当な要求に{きぜん}とした態度で応じた。',meaning:'意志が強く、動じないさま',level:'standard'},
  {id:745,type:'write',kanji:'嫉妬',reading:'しっと',example:'他者の成功に{しっと}するより自分を磨く。',meaning:'他人が優れていることをねたむ気持ち',level:'standard'},
  {id:746,type:'write',kanji:'哀悼',reading:'あいとう',example:'亡き友への{あいとう}の気持ちを込めて話した。',meaning:'人の死を悲しみいたむこと',level:'standard'},
  {id:747,type:'write',kanji:'憤慨',reading:'ふんがい',example:'不公平な扱いに{ふんがい}して声を上げた。',meaning:'ひどく腹を立てること',level:'standard'},
  {id:748,type:'write',kanji:'羨望',reading:'せんぼう',example:'彼の才能に{せんぼう}の眼差しを向けた。',meaning:'うらやましく思う気持ち',level:'standard'},
  {id:749,type:'write',kanji:'悔恨',reading:'かいこん',example:'あのときの選択を今も{かいこん}している。',meaning:'後悔して深く恨み悲しむこと',level:'standard'},
  {id:750,type:'write',kanji:'傾倒',reading:'けいとう',example:'若い頃から哲学に{けいとう}していた。',meaning:'深く引かれて夢中になること',level:'standard'},
  {id:751,type:'write',kanji:'果敢',reading:'かかん',example:'{かかん}に挑戦する姿勢が周囲を勇気づけた。',meaning:'決断力があり思い切って行動するさま',level:'standard'},
  {id:752,type:'write',kanji:'気概',reading:'きがい',example:'困難に立ち向かう{きがい}を持つ。',meaning:'困難にも屈しない強い意気',level:'standard'},
  {id:753,type:'write',kanji:'熟慮',reading:'じゅくりょ',example:'重要な決断は{じゅくりょ}した上で行う。',meaning:'十分に考えること',level:'standard'},
  {id:754,type:'write',kanji:'思慮',reading:'しりょ',example:'{しりょ}深い人物として信頼された。',meaning:'深く考えること・思い巡らすこと',level:'standard'},
  {id:755,type:'write',kanji:'識別',reading:'しきべつ',example:'本物と偽物を{しきべつ}する力を養う。',meaning:'見分けること・区別して認識すること',level:'standard'},
  {id:756,type:'write',kanji:'虚偽',reading:'きょぎ',example:'{きょぎ}の申告が発覚して信頼を失った。',meaning:'事実ではないこと・うそ',level:'standard'},
  {id:757,type:'write',kanji:'偽善',reading:'ぎぜん',example:'{ぎぜん}的な態度では人は動かない。',meaning:'善人のふりをすること',level:'standard'},
  {id:758,type:'write',kanji:'建前',reading:'たてまえ',example:'{たてまえ}としては賛成だが、本音は違う。',meaning:'表向きの方針・公式の立場',level:'standard'},
  {id:759,type:'write',kanji:'様相',reading:'ようそう',example:'状況は新たな{ようそう}を呈してきた。',meaning:'物事の外から見たありさま',level:'standard'},
  {id:760,type:'write',kanji:'描写',reading:'びょうしゃ',example:'登場人物の心理を細かく{びょうしゃ}した。',meaning:'文章や絵で表現すること',level:'standard'},
  {id:761,type:'write',kanji:'抑揚',reading:'よくよう',example:'声に{よくよう}をつけて読む。',meaning:'音声の高低・強弱の変化',level:'standard'},
  {id:762,type:'write',kanji:'余韻',reading:'よいん',example:'演奏の{よいん}が会場に漂っていた。',meaning:'後に残る感動・響き',level:'standard'},
  {id:763,type:'write',kanji:'感化',reading:'かんか',example:'師との出会いが人格を{かんか}した。',meaning:'影響を与えて思想・行動を変えること',level:'standard'},
  {id:764,type:'write',kanji:'変質',reading:'へんしつ',example:'本来の目的が{へんしつ}してしまった。',meaning:'性質・内容が変わること',level:'standard'},
  {id:765,type:'write',kanji:'精進',reading:'しょうじん',example:'芸の{しょうじん}を積んで一流になった。',meaning:'一心に励むこと',level:'standard'},
  {id:766,type:'write',kanji:'触発',reading:'しょくはつ',example:'師の言葉に{しょくはつ}されて挑戦した。',meaning:'刺激を受けて行動を起こすこと',level:'standard'},
  {id:767,type:'write',kanji:'高揚',reading:'こうよう',example:'勝利の瞬間に気分が{こうよう}した。',meaning:'気分・感情などが高まること',level:'standard'},
  {id:768,type:'write',kanji:'焦燥',reading:'しょうそう',example:'{しょうそう}感に駆られて性急な決断をした。',meaning:'焦ってじりじりする気持ち',level:'standard'},
  {id:769,type:'write',kanji:'熟成',reading:'じゅくせい',example:'年月をかけた{じゅくせい}が作品に深みをもたらした。',meaning:'時間をかけて十分に仕上がること',level:'standard'},
  {id:770,type:'write',kanji:'惰性',reading:'だせい',example:'{だせい}で続けるだけでは本当の力はつかない。',meaning:'以前の習慣・勢いのままに続くこと',level:'standard'},
  {id:771,type:'write',kanji:'陶酔',reading:'とうすい',example:'音楽の美しさに{とうすい}して時間を忘れた。',meaning:'うっとりと夢中になること',level:'advanced'},
  {id:772,type:'write',kanji:'清廉',reading:'せいれん',example:'{せいれん}な政治家として尊敬された。',meaning:'心が清く、私利私欲のないこと',level:'advanced'},
  {id:773,type:'write',kanji:'骨子',reading:'こっし',example:'計画の{こっし}を簡潔に説明した。',meaning:'物事の中心となる大事な点',level:'advanced'},
  {id:774,type:'write',kanji:'含意',reading:'がんい',example:'この表現には重要な{がんい}が込められている。',meaning:'言葉の中に含まれている意味',level:'advanced'},
  {id:775,type:'write',kanji:'論旨',reading:'ろんし',example:'文章全体の{ろんし}を明確にして書く。',meaning:'論文・議論の主な内容・主張の筋道',level:'advanced'},
  {id:776,type:'write',kanji:'風習',reading:'ふうしゅう',example:'地域に伝わる{ふうしゅう}を守り継ぐ。',meaning:'その地域・社会に伝わる習わし',level:'advanced'},
  {id:777,type:'write',kanji:'習俗',reading:'しゅうぞく',example:'{しゅうぞく}の変化を通じて社会の変容をたどる。',meaning:'その社会に古くから伝わる習慣・風俗',level:'advanced'},
  {id:778,type:'write',kanji:'沿革',reading:'えんかく',example:'学校の{えんかく}を調べて歴史を学んだ。',meaning:'始まりから現在までの経緯',level:'advanced'},
  {id:779,type:'write',kanji:'叙述',reading:'じょじゅつ',example:'客観的な{じょじゅつ}で事実を伝えた。',meaning:'物事の様子を述べ書き表すこと',level:'advanced'},
  {id:780,type:'write',kanji:'表象',reading:'ひょうしょう',example:'言語は概念の{ひょうしょう}として機能する。',meaning:'意識に浮かぶ外界の形象',level:'advanced'},
  {id:781,type:'write',kanji:'論述',reading:'ろんじゅつ',example:'問題に対する考えを筋道立てて{ろんじゅつ}する。',meaning:'論理的に述べること',level:'advanced'},
  {id:782,type:'write',kanji:'叙情',reading:'じょじょう',example:'{じょじょう}豊かな詩が心に深く響く。',meaning:'感情をありのままに表現すること',level:'advanced'},
  {id:783,type:'write',kanji:'誇示',reading:'こじ',example:'力を{こじ}するための行動は逆効果だ。',meaning:'誇らしげに見せびらかすこと',level:'advanced'},
  {id:784,type:'write',kanji:'体系',reading:'たいけい',example:'学問の{たいけい}を理解してから個々の知識を学ぶ。',meaning:'統一的にまとめた組織・システム',level:'advanced'},
  {id:785,type:'write',kanji:'機構',reading:'きこう',example:'組織の{きこう}を改革して意思決定を速める。',meaning:'組織のしくみ',level:'advanced'},
  {id:786,type:'write',kanji:'溶解',reading:'ようかい',example:'塩が水に{ようかい}する仕組みを確かめた。',meaning:'溶けてなくなること',level:'advanced'},
  {id:787,type:'write',kanji:'凝固',reading:'ぎょうこ',example:'液体が冷えて{ぎょうこ}する過程を観察した。',meaning:'液体が固まって固体になること',level:'advanced'},
  {id:788,type:'write',kanji:'合成',reading:'ごうせい',example:'二つの素材を{ごうせい}して新しい物質を作った。',meaning:'複数のものを合わせて一つを作ること',level:'advanced'},
  {id:789,type:'write',kanji:'変換',reading:'へんかん',example:'エネルギーを電気に{へんかん}する技術が進む。',meaning:'別の形・種類に変えること',level:'advanced'},
  {id:790,type:'write',kanji:'結束',reading:'けっそく',example:'チームの{けっそく}を固めて困難に立ち向かった。',meaning:'一致団結すること',level:'advanced'},
  {id:791,type:'write',kanji:'対峙',reading:'たいじ',example:'問題と正面から{たいじ}する勇気が求められる。',meaning:'向き合って対立すること',level:'advanced'},
  {id:792,type:'write',kanji:'互恵',reading:'ごけい',example:'{ごけい}関係を築くことで両国の発展につながる。',meaning:'お互いに利益を与え合うこと',level:'advanced'},
  {id:793,type:'write',kanji:'精製',reading:'せいせい',example:'原油を{せいせい}してガソリンを作る。',meaning:'不純物を取り除いて純粋にすること',level:'advanced'},
  {id:794,type:'write',kanji:'還元',reading:'かんげん',example:'利益を社会に{かんげん}することが企業の責任だ。',meaning:'本の状態に戻すこと・社会に返すこと',level:'advanced'},
  {id:795,type:'write',kanji:'傾注',reading:'けいちゅう',example:'全力を{けいちゅう}して課題に取り組んだ。',meaning:'心力を一点に集中して注ぐこと',level:'advanced'},
  {id:796,type:'write',kanji:'自律',reading:'じりつ',example:'{じりつ}した行動ができる人間を目指した。',meaning:'自分で立てた規則に従って行動すること',level:'advanced'},
  {id:797,type:'write',kanji:'弊風',reading:'へいふう',example:'組織の{へいふう}をなくす改革が始まった。',meaning:'悪い風習・弊害のある慣行',level:'advanced'},
  {id:798,type:'write',kanji:'骨格',reading:'こっかく',example:'計画の{こっかく}を最初に固めておく。',meaning:'物事の基本的な組み立て・骨組み',level:'advanced'},
  {id:799,type:'write',kanji:'叙事',reading:'じょじ',example:'{じょじ}的な手法で歴史を描いた作品を読んだ。',meaning:'出来事や事実を述べること',level:'advanced'},
  {id:800,type:'write',kanji:'懐古',reading:'かいこ',example:'古い写真を見て{かいこ}の念に浸った。',meaning:'昔を懐かしく思うこと',level:'advanced'},

  // ════ 読み問題 ── 基礎・標準・発展（準2〜2級・第4弾） ════
  {id:801,type:'read',kanji:'背景',reading:'はいけい',example:'問題の{背景}を理解してから対策を考える。',meaning:'物事の後ろにある事情・原因',level:'basic'},
  {id:802,type:'read',kanji:'由来',reading:'ゆらい',example:'この地名の{由来}を調べてレポートにまとめた。',meaning:'物事の起こり・いわれ',level:'basic'},
  {id:803,type:'read',kanji:'意図',reading:'いと',example:'作者の{意図}を読み取ることが文章読解の基本だ。',meaning:'何かをしようとする目的・ねらい',level:'basic'},
  {id:804,type:'read',kanji:'焦点',reading:'しょうてん',example:'議論の{焦点}を明確にして話し合いを進める。',meaning:'最も重要な点・問題の中心',level:'basic'},
  {id:805,type:'read',kanji:'見解',reading:'けんかい',example:'専門家の{見解}を参考にして判断する。',meaning:'ある問題に対する考え・意見',level:'basic'},
  {id:806,type:'read',kanji:'核心',reading:'かくしん',example:'問題の{核心}に迫る鋭い質問が飛んだ。',meaning:'物事の中心となる大切な部分',level:'basic'},
  {id:807,type:'read',kanji:'構造',reading:'こうぞう',example:'文章全体の{構造}を把握してから読み始める。',meaning:'全体のつくり・組み立て',level:'basic'},
  {id:808,type:'read',kanji:'再生',reading:'さいせい',example:'壊れかけた生態系の{再生}に取り組む。',meaning:'再び生き返らせること・もとに戻すこと',level:'basic'},
  {id:809,type:'read',kanji:'連帯',reading:'れんたい',example:'被災地の人々と{連帯}して支援した。',meaning:'複数の人が共同で責任を持ち結びつくこと',level:'basic'},
  {id:810,type:'read',kanji:'誠意',reading:'せいい',example:'{誠意}を持って謝罪することが信頼の回復につながる。',meaning:'真心を尽くした態度・まじめな気持ち',level:'basic'},
  {id:811,type:'read',kanji:'専念',reading:'せんねん',example:'今は受験勉強に{専念}する時期だ。',meaning:'ひとつのことだけに集中して取り組むこと',level:'basic'},
  {id:812,type:'read',kanji:'本音',reading:'ほんね',example:'{本音}を言えば、この仕事は好きではない。',meaning:'本当の気持ち・本心',level:'basic'},
  {id:813,type:'read',kanji:'起源',reading:'きげん',example:'言語の{起源}を探る研究が続けられている。',meaning:'物事の始まり・根源',level:'basic'},
  {id:814,type:'read',kanji:'団結',reading:'だんけつ',example:'チームが{団結}して困難な目標に挑んだ。',meaning:'多くの人が一致協力してまとまること',level:'basic'},
  {id:815,type:'read',kanji:'段階',reading:'だんかい',example:'計画を{段階}に分けて着実に実行していく。',meaning:'物事の順序ある一つ一つの区切り',level:'basic'},
  {id:816,type:'read',kanji:'感性',reading:'かんせい',example:'芸術作品への豊かな{感性}を育てる教育。',meaning:'物事を感じ取る心の働き・センス',level:'basic'},
  {id:817,type:'read',kanji:'理性',reading:'りせい',example:'感情に流されず{理性}で判断することが大切だ。',meaning:'論理的・道徳的に考える能力',level:'basic'},
  {id:818,type:'read',kanji:'知性',reading:'ちせい',example:'高い{知性}と豊かな感性を持つ人物として評価された。',meaning:'知識を使って物事を考える能力',level:'basic'},
  {id:819,type:'read',kanji:'熟練',reading:'じゅくれん',example:'{熟練}した職人の技が作品に宿っている。',meaning:'十分に練習を積んで技能が優れていること',level:'basic'},
  {id:820,type:'read',kanji:'余暇',reading:'よか',example:'{余暇}を利用して読書や散歩を楽しむ。',meaning:'仕事・義務のあいた時間・ゆとりの時間',level:'basic'},
  {id:821,type:'read',kanji:'概略',reading:'がいりゃく',example:'発表の前に計画の{概略}を説明した。',meaning:'大まかな内容・あらまし',level:'standard'},
  {id:822,type:'read',kanji:'要旨',reading:'ようし',example:'長い文章の{要旨}を三文でまとめる練習をした。',meaning:'文章・話の中心となる内容',level:'standard'},
  {id:823,type:'read',kanji:'趣旨',reading:'しゅし',example:'会議の{趣旨}を確認してから議題に入った。',meaning:'物事の目的・ねらい・だいたいの内容',level:'standard'},
  {id:824,type:'read',kanji:'規範',reading:'きはん',example:'社会の{規範}に従って行動することが求められる。',meaning:'行動や判断の基準となるもの',level:'standard'},
  {id:825,type:'read',kanji:'根底',reading:'こんてい',example:'文化の{根底}にある思想を理解することが大切だ。',meaning:'物事の一番の底・根本',level:'standard'},
  {id:826,type:'read',kanji:'慣行',reading:'かんこう',example:'長年の{慣行}を見直して効率化を図る。',meaning:'以前からの慣れた習わし・しきたり',level:'standard'},
  {id:827,type:'read',kanji:'風潮',reading:'ふうちょう',example:'結果を重視する{風潮}が強まっている。',meaning:'時代や社会の傾向・流れ',level:'standard'},
  {id:828,type:'read',kanji:'慣例',reading:'かんれい',example:'{慣例}を踏まえた上で新しい提案を行った。',meaning:'昔から続いている習わし',level:'standard'},
  {id:829,type:'read',kanji:'制約',reading:'せいやく',example:'時間の{制約}の中で最善を尽くす。',meaning:'制限・条件として加えられる縛り',level:'standard'},
  {id:830,type:'read',kanji:'束縛',reading:'そくばく',example:'既成概念の{束縛}から解き放たれて自由に考える。',meaning:'自由を奪い縛ること',level:'standard'},
  {id:831,type:'read',kanji:'変容',reading:'へんよう',example:'都市の{変容}を長年にわたって記録した写真集。',meaning:'形・性質が変わること',level:'standard'},
  {id:832,type:'read',kanji:'劣化',reading:'れっか',example:'素材の{劣化}を防ぐための適切な保管が必要だ。',meaning:'品質・性能が低下すること',level:'standard'},
  {id:833,type:'read',kanji:'復元',reading:'ふくげん',example:'古文書をもとに当時の建物を{復元}した。',meaning:'元の状態に戻すこと',level:'standard'},
  {id:834,type:'read',kanji:'融和',reading:'ゆうわ',example:'異なる文化の{融和}が新しい価値を生み出す。',meaning:'打ち解けて仲良くなること・調和',level:'standard'},
  {id:835,type:'read',kanji:'摩擦',reading:'まさつ',example:'貿易{摩擦}が両国の関係を悪化させた。',meaning:'利害の対立から生じる不和・衝突',level:'standard'},
  {id:836,type:'read',kanji:'安堵',reading:'あんど',example:'無事に帰宅した知らせを聞いて{安堵}した。',meaning:'心配が消えてほっとすること',level:'standard'},
  {id:837,type:'read',kanji:'感傷',reading:'かんしょう',example:'秋の夕暮れに{感傷}的な気分になった。',meaning:'ちょっとしたことに感動して悲しくなる気持ち',level:'standard'},
  {id:838,type:'read',kanji:'哀愁',reading:'あいしゅう',example:'旅先の風景に深い{哀愁}を感じた。',meaning:'もの悲しい気持ち・切ない感情',level:'standard'},
  {id:839,type:'read',kanji:'倦怠',reading:'けんたい',example:'長い繰り返し作業に{倦怠}感を覚えた。',meaning:'あきあきして嫌になる気持ち・疲れ',level:'standard'},
  {id:840,type:'read',kanji:'高潔',reading:'こうけつ',example:'{高潔}な人格を持つ人物として広く尊敬された。',meaning:'人格・行いが気高く清らかなこと',level:'standard'},
  {id:841,type:'read',kanji:'没頭',reading:'ぼっとう',example:'研究に{没頭}するあまり食事を忘れた。',meaning:'一つのことに完全に集中すること',level:'standard'},
  {id:842,type:'read',kanji:'克己',reading:'こっき',example:'{克己}心を持って誘惑に打ち勝った。',meaning:'自分の欲望・弱さに打ち勝つこと',level:'standard'},
  {id:843,type:'read',kanji:'節制',reading:'せっせい',example:'食事と運動の{節制}が健康の基本だ。',meaning:'度を超えないよう控えること・自分を律すること',level:'standard'},
  {id:844,type:'read',kanji:'毅然',reading:'きぜん',example:'不当な要求に{毅然}とした態度で応じた。',meaning:'意志が強く、動じないさま',level:'standard'},
  {id:845,type:'read',kanji:'嫉妬',reading:'しっと',example:'他者の成功に{嫉妬}するより自分を磨く方がよい。',meaning:'他人が自分より優れていることをねたむ気持ち',level:'standard'},
  {id:846,type:'read',kanji:'哀悼',reading:'あいとう',example:'亡き友への{哀悼}の気持ちを込めて弔辞を述べた。',meaning:'人の死を悲しみいたむこと',level:'standard'},
  {id:847,type:'read',kanji:'憤慨',reading:'ふんがい',example:'不公平な扱いに{憤慨}して声を上げた。',meaning:'ひどく腹を立てること・憤り',level:'standard'},
  {id:848,type:'read',kanji:'羨望',reading:'せんぼう',example:'彼の才能に{羨望}の眼差しを向けた。',meaning:'うらやましく思う気持ち',level:'standard'},
  {id:849,type:'read',kanji:'悔恨',reading:'かいこん',example:'あのときの選択を今も{悔恨}している。',meaning:'後悔して深く恨み悲しむこと',level:'standard'},
  {id:850,type:'read',kanji:'傾倒',reading:'けいとう',example:'若い頃から哲学に{傾倒}していた。',meaning:'ある物事に深く引かれて夢中になること',level:'standard'},
  {id:851,type:'read',kanji:'果敢',reading:'かかん',example:'{果敢}に挑戦する姿勢が周囲を勇気づけた。',meaning:'決断力があり、思い切って行動するさま',level:'standard'},
  {id:852,type:'read',kanji:'気概',reading:'きがい',example:'困難に立ち向かう{気概}を忘れないでほしい。',meaning:'困難にも屈しない強い意気・気持ち',level:'standard'},
  {id:853,type:'read',kanji:'熟慮',reading:'じゅくりょ',example:'重要な決断は{熟慮}した上で行うべきだ。',meaning:'十分に考えること・深く思い巡らすこと',level:'standard'},
  {id:854,type:'read',kanji:'思慮',reading:'しりょ',example:'{思慮}深い人物として多くの人から信頼された。',meaning:'深く考えること・思い巡らすこと',level:'standard'},
  {id:855,type:'read',kanji:'識別',reading:'しきべつ',example:'本物と偽物を{識別}する鑑識眼を養う。',meaning:'見分けること・区別して認識すること',level:'standard'},
  {id:856,type:'read',kanji:'虚偽',reading:'きょぎ',example:'{虚偽}の申告が発覚して信頼を失った。',meaning:'事実ではないこと・うそ',level:'standard'},
  {id:857,type:'read',kanji:'偽善',reading:'ぎぜん',example:'{偽善}的な態度では人は動かない。',meaning:'善人のふりをすること・うわべだけの善',level:'standard'},
  {id:858,type:'read',kanji:'建前',reading:'たてまえ',example:'{建前}としては賛成だが、本音は違う。',meaning:'表向きの方針・公式の立場',level:'standard'},
  {id:859,type:'read',kanji:'様相',reading:'ようそう',example:'状況は新たな{様相}を呈してきた。',meaning:'物事の外から見たありさま・状態',level:'standard'},
  {id:860,type:'read',kanji:'描写',reading:'びょうしゃ',example:'登場人物の心理を細かく{描写}した小説を読んだ。',meaning:'文章や絵で表現すること',level:'standard'},
  {id:861,type:'read',kanji:'抑揚',reading:'よくよう',example:'声に{抑揚}をつけて読むと内容が伝わりやすい。',meaning:'音声の高低・強弱の変化',level:'standard'},
  {id:862,type:'read',kanji:'余韻',reading:'よいん',example:'演奏が終わった後も{余韻}が会場に漂っていた。',meaning:'音が消えた後に残る感じ・後に残る感動',level:'standard'},
  {id:863,type:'read',kanji:'感化',reading:'かんか',example:'優れた師との出会いが人格を{感化}した。',meaning:'影響を与えて思想・行動を変えること',level:'standard'},
  {id:864,type:'read',kanji:'変質',reading:'へんしつ',example:'長い年月を経て本来の目的が{変質}してしまった。',meaning:'性質・内容が変わること',level:'standard'},
  {id:865,type:'read',kanji:'精進',reading:'しょうじん',example:'芸の{精進}を積んで一流の域に達した。',meaning:'一心に励むこと・精力的に努力すること',level:'standard'},
  {id:866,type:'read',kanji:'触発',reading:'しょくはつ',example:'師の言葉に{触発}されて新しいことに挑戦した。',meaning:'刺激を受けて行動を起こすこと',level:'standard'},
  {id:867,type:'read',kanji:'高揚',reading:'こうよう',example:'勝利の瞬間に気分が{高揚}した。',meaning:'気分・感情などが高まること',level:'standard'},
  {id:868,type:'read',kanji:'焦燥',reading:'しょうそう',example:'{焦燥}感に駆られて性急な決断をしてしまった。',meaning:'焦ってじりじりする気持ち・苛立ち',level:'standard'},
  {id:869,type:'read',kanji:'熟成',reading:'じゅくせい',example:'長い年月をかけた{熟成}がこの作品に深みをもたらした。',meaning:'時間をかけて十分に仕上がること',level:'standard'},
  {id:870,type:'read',kanji:'陶酔',reading:'とうすい',example:'音楽の美しさに{陶酔}して時間を忘れた。',meaning:'うっとりと夢中になること・深い酔い心地',level:'advanced'},
  {id:871,type:'read',kanji:'清廉',reading:'せいれん',example:'{清廉}な政治家として国民から尊敬された。',meaning:'心が清く、私利私欲のないこと',level:'advanced'},
  {id:872,type:'read',kanji:'骨子',reading:'こっし',example:'計画の{骨子}を簡潔に説明した。',meaning:'物事の中心となる大事な点・要点',level:'advanced'},
  {id:873,type:'read',kanji:'含意',reading:'がんい',example:'この表現には重要な{含意}が込められている。',meaning:'言葉の中に含まれている意味・暗示',level:'advanced'},
  {id:874,type:'read',kanji:'論旨',reading:'ろんし',example:'文章全体の{論旨}を明確にして論文を書く。',meaning:'論文・議論の主な内容・主張の筋道',level:'advanced'},
  {id:875,type:'read',kanji:'風習',reading:'ふうしゅう',example:'地域に伝わる{風習}を守り継ぐ活動をしている。',meaning:'その地域・社会に伝わる習わし',level:'advanced'},
  {id:876,type:'read',kanji:'習俗',reading:'しゅうぞく',example:'{習俗}の変化を通じて社会の変容をたどる。',meaning:'その社会に古くから伝わる習慣・風俗',level:'advanced'},
  {id:877,type:'read',kanji:'沿革',reading:'えんかく',example:'学校の{沿革}を調べて創立からの歴史を学んだ。',meaning:'組織や物事の始まりから現在までの経緯',level:'advanced'},
  {id:878,type:'read',kanji:'叙述',reading:'じょじゅつ',example:'客観的な{叙述}で事実を伝えることを心がけた。',meaning:'物事の様子を述べ書き表すこと',level:'advanced'},
  {id:879,type:'read',kanji:'表象',reading:'ひょうしょう',example:'言語は概念の{表象}として機能する。',meaning:'意識に浮かぶ外界の形象・表現されたもの',level:'advanced'},
  {id:880,type:'read',kanji:'論述',reading:'ろんじゅつ',example:'問題に対する考えを筋道立てて{論述}する。',meaning:'論理的に述べること・論文で書き述べること',level:'advanced'},
  {id:881,type:'read',kanji:'叙情',reading:'じょじょう',example:'{叙情}豊かな詩は読む者の心に深く響く。',meaning:'感情をありのままに表現すること',level:'advanced'},
  {id:882,type:'read',kanji:'誇示',reading:'こじ',example:'力を{誇示}するための行動は逆効果になることが多い。',meaning:'誇らしげに見せびらかすこと',level:'advanced'},
  {id:883,type:'read',kanji:'体系',reading:'たいけい',example:'学問の{体系}を理解してから個々の知識を学ぶ。',meaning:'個々のものを統一的にまとめた組織・システム',level:'advanced'},
  {id:884,type:'read',kanji:'機構',reading:'きこう',example:'組織の{機構}を改革して意思決定を速める。',meaning:'組織のしくみ・機械や組織の仕組み',level:'advanced'},
  {id:885,type:'read',kanji:'溶解',reading:'ようかい',example:'塩が水に{溶解}する仕組みを実験で確かめた。',meaning:'溶けてなくなること・液体に溶けること',level:'advanced'},
  {id:886,type:'read',kanji:'凝固',reading:'ぎょうこ',example:'液体が冷えて{凝固}する過程を観察した。',meaning:'液体が固まって固体になること',level:'advanced'},
  {id:887,type:'read',kanji:'合成',reading:'ごうせい',example:'二つの素材を{合成}して新しい物質を作り出した。',meaning:'複数のものを合わせて一つのものを作ること',level:'advanced'},
  {id:888,type:'read',kanji:'変換',reading:'へんかん',example:'エネルギーを電気に{変換}する技術が進んでいる。',meaning:'別の形・種類に変えること',level:'advanced'},
  {id:889,type:'read',kanji:'結束',reading:'けっそく',example:'チームの{結束}を固めて困難に立ち向かった。',meaning:'一致団結すること・固くまとまること',level:'advanced'},
  {id:890,type:'read',kanji:'対峙',reading:'たいじ',example:'困難な問題と正面から{対峙}する勇気が求められる。',meaning:'向き合って対立すること',level:'advanced'},
  {id:891,type:'read',kanji:'互恵',reading:'ごけい',example:'{互恵}関係を築くことで両国の発展につながった。',meaning:'お互いに利益を与え合うこと',level:'advanced'},
  {id:892,type:'read',kanji:'精製',reading:'せいせい',example:'原油を{精製}してガソリンや灯油を作る。',meaning:'不純物を取り除いて純粋なものにすること',level:'advanced'},
  {id:893,type:'read',kanji:'還元',reading:'かんげん',example:'利益を社会に{還元}することが企業の責任だ。',meaning:'本の状態に戻すこと・社会に返すこと',level:'advanced'},
  {id:894,type:'read',kanji:'傾注',reading:'けいちゅう',example:'全力を{傾注}して課題に取り組んだ。',meaning:'心力を一点に集中して注ぐこと',level:'advanced'},
  {id:895,type:'read',kanji:'自律',reading:'じりつ',example:'{自律}した行動ができる人間になることを目指した。',meaning:'自分で立てた規則に従って行動すること',level:'advanced'},
  {id:896,type:'read',kanji:'弊風',reading:'へいふう',example:'組織に染みついた{弊風}をなくす改革が始まった。',meaning:'悪い風習・弊害のある慣行',level:'advanced'},
  {id:897,type:'read',kanji:'骨格',reading:'こっかく',example:'計画の{骨格}を最初に固めておく。',meaning:'物事の基本的な組み立て・骨組み',level:'advanced'},
  {id:898,type:'read',kanji:'叙事',reading:'じょじ',example:'{叙事}的な手法で歴史を描いた叙事詩を読んだ。',meaning:'出来事や事実を述べること',level:'advanced'},
  {id:899,type:'read',kanji:'帰趨',reading:'きすう',example:'世論の{帰趨}が政治を左右する。',meaning:'物事が落ち着くところ・なりゆき',level:'advanced'},
  {id:900,type:'read',kanji:'懐古',reading:'かいこ',example:'古い写真を見て{懐古}の念に浸った。',meaning:'昔を懐かしく思うこと',level:'advanced'},

  // ════ 読み問題 ── 基礎（準2〜2級・第5弾） ════
  {id:901,type:'read',kanji:'貧困',reading:'ひんこん',example:'子どもの{貧困}問題に取り組む団体を支援した。',meaning:'生活に必要なものが欠けた状態・まずしさ',level:'basic'},
  {id:902,type:'read',kanji:'福祉',reading:'ふくし',example:'高齢者の{福祉}向上を目指した政策が進む。',meaning:'幸福・豊かな生活。社会的な支援の仕組み',level:'basic'},
  {id:903,type:'read',kanji:'援助',reading:'えんじょ',example:'被災地への物資{援助}が世界中から届いた。',meaning:'力を貸して助けること',level:'basic'},
  {id:904,type:'read',kanji:'救済',reading:'きゅうさい',example:'困窮者の{救済}に向けた制度を整備した。',meaning:'苦しみや危機から救うこと',level:'basic'},
  {id:905,type:'read',kanji:'補償',reading:'ほしょう',example:'事故による損害の{補償}を請求した。',meaning:'損害・損失を埋め合わせること',level:'basic'},
  {id:906,type:'read',kanji:'欲望',reading:'よくぼう',example:'人間の{欲望}には際限がないとも言われる。',meaning:'強く欲しがる気持ち・欲求',level:'basic'},
  {id:907,type:'read',kanji:'本能',reading:'ほんのう',example:'生き物が持つ{本能}は生存に欠かせない。',meaning:'生まれつき備わった行動・感覚の働き',level:'basic'},
  {id:908,type:'read',kanji:'衝動',reading:'しょうどう',example:'{衝動}に任せて行動すると後悔することがある。',meaning:'突然わき起こる強い欲求・衝き動かす力',level:'basic'},
  {id:909,type:'read',kanji:'感慨',reading:'かんがい',example:'卒業式に{感慨}深い気持ちで臨んだ。',meaning:'しみじみとした深い感動・感じ入ること',level:'basic'},
  {id:910,type:'read',kanji:'感銘',reading:'かんめい',example:'師の言葉に深く{感銘}を受けた。',meaning:'心に深く刻まれる感動',level:'basic'},
  {id:911,type:'read',kanji:'好奇心',reading:'こうきしん',example:'{好奇心}旺盛な子どもほど学びへの意欲が高い。',meaning:'珍しいことを知りたがる気持ち',level:'basic'},
  {id:912,type:'read',kanji:'自尊心',reading:'じそんしん',example:'失敗が続いて{自尊心}が傷ついた。',meaning:'自分の尊厳・価値を大切に思う気持ち',level:'basic'},
  {id:913,type:'read',kanji:'定義',reading:'ていぎ',example:'「公正」の{定義}を辞書と文脈から確認する。',meaning:'言葉・概念の意味を明確に定めること',level:'basic'},
  {id:914,type:'read',kanji:'論理',reading:'ろんり',example:'{論理}的に考えることが問題解決の第一歩だ。',meaning:'物事を筋道立てて考える法則・考え方',level:'basic'},
  {id:915,type:'read',kanji:'移行',reading:'いこう',example:'旧制度から新制度への{移行}がスムーズに進んだ。',meaning:'別の状態・段階へ移ること',level:'basic'},
  {id:916,type:'read',kanji:'進展',reading:'しんてん',example:'交渉に{進展}がなく、膠着状態が続いた。',meaning:'物事が前へ進んで発展すること',level:'basic'},
  {id:917,type:'read',kanji:'停滞',reading:'ていたい',example:'景気の{停滞}が長引いて不安が広がった。',meaning:'物事が進まずとどまること',level:'basic'},
  {id:918,type:'read',kanji:'持続',reading:'じぞく',example:'環境への負荷を減らした{持続}可能な社会を目指す。',meaning:'同じ状態が続くこと・長続きすること',level:'basic'},
  {id:919,type:'read',kanji:'消滅',reading:'しょうめつ',example:'多くの生物種が環境変化で{消滅}の危機にある。',meaning:'なくなること・消えてなくなること',level:'basic'},
  {id:920,type:'read',kanji:'交渉',reading:'こうしょう',example:'労使{交渉}が決裂し、ストライキが起きた。',meaning:'話し合いによって取り決めること',level:'basic'},
  {id:921,type:'read',kanji:'説得',reading:'せっとく',example:'反対する相手を{説得}するのに時間がかかった。',meaning:'相手を理由・根拠で納得させること',level:'basic'},
  {id:922,type:'read',kanji:'対話',reading:'たいわ',example:'異なる立場の人々が{対話}することで理解が深まる。',meaning:'向かい合って話し合うこと',level:'basic'},
  {id:923,type:'read',kanji:'抗議',reading:'こうぎ',example:'不当な判決に対して{抗議}の声が上がった。',meaning:'不当なことに対して反対を申し立てること',level:'basic'},
  {id:924,type:'read',kanji:'生態',reading:'せいたい',example:'昆虫の{生態}を長年にわたって観察した研究者。',meaning:'生物の自然界での生活のようす',level:'basic'},
  {id:925,type:'read',kanji:'絶滅',reading:'ぜつめつ',example:'乱獲によってその魚は{絶滅}寸前となった。',meaning:'種や集団が完全になくなること',level:'basic'},
  {id:926,type:'read',kanji:'進化',reading:'しんか',example:'生物が環境に適応しながら{進化}する過程を学ぶ。',meaning:'生物が世代を経て変化・発展すること',level:'basic'},
  {id:927,type:'read',kanji:'適応',reading:'てきおう',example:'新しい環境への{適応}に時間がかかった。',meaning:'環境・状況に合わせて変化・対応すること',level:'basic'},
  {id:928,type:'read',kanji:'本来',reading:'ほんらい',example:'この制度の{本来}の目的は何だったのかを問い直す。',meaning:'もともと・はじめから・来来の性質',level:'basic'},
  {id:929,type:'read',kanji:'根源',reading:'こんげん',example:'問題の{根源}にある原因を突き止める。',meaning:'物事の根本・もとになるもの',level:'basic'},
  {id:930,type:'read',kanji:'究極',reading:'きゅうきょく',example:'{究極}の目標は世界平和の実現だと語った。',meaning:'これ以上ないところ・最終的な極み',level:'basic'},
  {id:931,type:'read',kanji:'文脈',reading:'ぶんみゃく',example:'言葉は{文脈}によって意味が変わることがある。',meaning:'文章の流れ・話の前後のつながり・コンテキスト',level:'basic'},
  {id:932,type:'read',kanji:'文体',reading:'ぶんたい',example:'作家ごとに独自の{文体}があり、読むと味わいが違う。',meaning:'文章の書き方・スタイル・調子',level:'basic'},
  {id:933,type:'read',kanji:'引用',reading:'いんよう',example:'論文では他者の意見を{引用}する際に出典を明記する。',meaning:'他の文章・言葉をそのまま使うこと',level:'basic'},
  {id:934,type:'read',kanji:'参照',reading:'さんしょう',example:'詳細は巻末の資料を{参照}してください。',meaning:'見比べること・他の部分を見ること',level:'basic'},
  {id:935,type:'read',kanji:'批評',reading:'ひひょう',example:'作品の良し悪しを客観的に{批評}する力を養う。',meaning:'物事の優劣・得失を論じること',level:'basic'},
  {id:936,type:'read',kanji:'発端',reading:'ほったん',example:'些細な誤解が事件の{発端}となった。',meaning:'物事の始まり・きっかけ',level:'basic'},
  {id:937,type:'read',kanji:'調停',reading:'ちょうてい',example:'第三者が{調停}に入って争いを解決した。',meaning:'争いの間に入って解決をはかること',level:'basic'},
  {id:938,type:'read',kanji:'形成',reading:'けいせい',example:'幼少期の経験が人格{形成}に大きく影響する。',meaning:'形・組織・性質をつくり上げること',level:'basic'},
  {id:939,type:'read',kanji:'鑑賞',reading:'かんしょう',example:'美術館で絵画を{鑑賞}して豊かな時間を過ごした。',meaning:'芸術作品などを味わい楽しむこと',level:'basic'},
  {id:940,type:'read',kanji:'持論',reading:'じろん',example:'彼はこの問題について{持論}を展開した。',meaning:'自分がいつも主張する意見・持ち前の考え',level:'basic'},

  // ════ 読み問題 ── 標準（準2〜2級・第5弾） ════
  {id:941,type:'read',kanji:'命題',reading:'めいだい',example:'この議論の{命題}を整理してから話し合いを始める。',meaning:'真か偽かを判断できる文・論じるべき主張',level:'standard'},
  {id:942,type:'read',kanji:'共生',reading:'きょうせい',example:'異なる種が{共生}することで生態系が保たれる。',meaning:'異なるものが互いに助け合って生きること',level:'standard'},
  {id:943,type:'read',kanji:'枯渇',reading:'こかつ',example:'地下水が{枯渇}すると農業に深刻な影響が出る。',meaning:'水・資源などが尽きてなくなること',level:'standard'},
  {id:944,type:'read',kanji:'源泉',reading:'げんせん',example:'創造性の{源泉}は日常のさまざまな体験にある。',meaning:'物事の根本となる源・わき出るもと',level:'standard'},
  {id:945,type:'read',kanji:'評論',reading:'ひょうろん',example:'著名な{評論}家が社会問題について鋭い分析を示した。',meaning:'物事を批判的に評価して論じること・その文章',level:'standard'},
  {id:946,type:'read',kanji:'定着',reading:'ていちゃく',example:'新しい習慣が社会に{定着}するには時間がかかる。',meaning:'しっかりと根付くこと・安定して続くこと',level:'standard'},
  {id:947,type:'read',kanji:'妥当',reading:'だとう',example:'その判断は状況から見て{妥当}だと言えるだろう。',meaning:'内容・判断が適切で無理のないこと',level:'standard'},
  {id:948,type:'read',kanji:'反証',reading:'はんしょう',example:'仮説に対する{反証}が見つかり、理論を修正した。',meaning:'逆の証拠・反対の事実を示すこと',level:'standard'},
  {id:949,type:'read',kanji:'立証',reading:'りっしょう',example:'無実を{立証}するための証拠を集めた。',meaning:'証拠を挙げて正しいことを明らかにすること',level:'standard'},
  {id:950,type:'read',kanji:'翻訳',reading:'ほんやく',example:'外国語の文学作品を日本語に{翻訳}した。',meaning:'ある言語を別の言語に訳すこと',level:'standard'},
  {id:951,type:'read',kanji:'類推',reading:'るいすい',example:'似た例から{類推}して答えを導き出した。',meaning:'類似点をもとに推論すること',level:'standard'},
  {id:952,type:'read',kanji:'演繹',reading:'えんえき',example:'一般的な法則から個別の事例を{演繹}する思考法。',meaning:'一般原理から個別の結論を導く推論',level:'standard'},
  {id:953,type:'read',kanji:'帰納',reading:'きのう',example:'多くの事例から共通点を見つける{帰納}的な方法。',meaning:'個別の事例から一般的な法則を導く推論',level:'standard'},
  {id:954,type:'read',kanji:'是正',reading:'ぜせい',example:'制度の不備を{是正}するための会議が開かれた。',meaning:'悪いところを改めて正しくすること',level:'standard'},
  {id:955,type:'read',kanji:'革新',reading:'かくしん',example:'技術の{革新}が産業構造を大きく変えた。',meaning:'旧来のものを根本から改めて新しくすること',level:'standard'},
  {id:956,type:'read',kanji:'保守',reading:'ほしゅ',example:'{保守}的な意見と革新的な意見が対立した。',meaning:'旧来の制度・方法を守り続けること',level:'standard'},
  {id:957,type:'read',kanji:'差別',reading:'さべつ',example:'いかなる{差別}も許してはならないと強調した。',meaning:'不当に区別して不平等に扱うこと',level:'standard'},
  {id:958,type:'read',kanji:'対比',reading:'たいひ',example:'二つの作品を{対比}することで特徴が際立った。',meaning:'二つのものを比べて違いを明らかにすること',level:'standard'},
  {id:959,type:'read',kanji:'緊迫',reading:'きんぱく',example:'交渉が決裂寸前となり、情勢が{緊迫}した。',meaning:'事態が差し迫って張り詰めること',level:'standard'},
  {id:960,type:'read',kanji:'挫折',reading:'ざせつ',example:'度重なる{挫折}を乗り越えて夢をつかんだ。',meaning:'途中で失敗してくじけること',level:'standard'},
  {id:961,type:'read',kanji:'危惧',reading:'きぐ',example:'環境の悪化を{危惧}する声が高まっている。',meaning:'危険・悪化を恐れて心配すること',level:'standard'},
  {id:962,type:'read',kanji:'警鐘',reading:'けいしょう',example:'専門家が地球温暖化への{警鐘}を鳴らした。',meaning:'危険・過ちを警告すること（警鐘を鳴らす）',level:'standard'},
  {id:963,type:'read',kanji:'警戒',reading:'けいかい',example:'不審者の情報を受けて地域全体で{警戒}を強めた。',meaning:'危険に備えて用心すること',level:'standard'},
  {id:964,type:'read',kanji:'媒体',reading:'ばいたい',example:'情報伝達の{媒体}としてインターネットが普及した。',meaning:'情報・影響を伝えるなかだちとなるもの',level:'standard'},
  {id:965,type:'read',kanji:'改善',reading:'かいぜん',example:'業務の{改善}によって作業効率が大幅に上がった。',meaning:'悪い点を改めてよくすること',level:'standard'},
  {id:966,type:'read',kanji:'訂正',reading:'ていせい',example:'報告書の誤りを{訂正}して再提出した。',meaning:'誤りを正しく直すこと',level:'standard'},
  {id:967,type:'read',kanji:'普遍',reading:'ふへん',example:'人間の尊厳は{普遍}的な価値を持つ。',meaning:'すべてに共通して当てはまること',level:'standard'},
  {id:968,type:'read',kanji:'折衷',reading:'せっちゅう',example:'和洋{折衷}のデザインが独特の魅力を生んでいる。',meaning:'異なるものの良い点をとり合わせること',level:'standard'},
  {id:969,type:'read',kanji:'相克',reading:'そうこく',example:'理想と現実の{相克}に苦しみながら決断した。',meaning:'二つのものが対立してせめぎ合うこと',level:'standard'},
  {id:970,type:'read',kanji:'欠如',reading:'けつじょ',example:'想像力の{欠如}が誤解を生んだ。',meaning:'必要なものが欠けていること',level:'standard'},

  // ════ 読み問題 ── 発展（2級中心・第5弾） ════
  {id:971,type:'read',kanji:'真髄',reading:'しんずい',example:'その言葉には武道の{真髄}が凝縮されていた。',meaning:'物事の本質・もっとも重要なところ',level:'advanced'},
  {id:972,type:'read',kanji:'弁証',reading:'べんしょう',example:'矛盾を超えて統一する{弁証}法的な思考を学ぶ。',meaning:'議論によって正しさを証明すること',level:'advanced'},
  {id:973,type:'read',kanji:'意匠',reading:'いしょう',example:'独創的な{意匠}が消費者の目を引いた。',meaning:'芸術・工業製品などの外観の考案・デザイン',level:'advanced'},
  {id:974,type:'read',kanji:'本末',reading:'ほんまつ',example:'手段に集中しすぎて{本末}転倒になっていた。',meaning:'物事の根本と末端・本質と枝葉（本末転倒）',level:'advanced'},
  {id:975,type:'read',kanji:'隠喩',reading:'いんゆ',example:'「人生は旅だ」は{隠喩}の典型的な例だ。',meaning:'「〜のようだ」を使わず直接他のものにたとえる修辞法',level:'advanced'},
  {id:976,type:'read',kanji:'直喩',reading:'ちょくゆ',example:'「まるで嵐のような演奏」は{直喩}的な表現だ。',meaning:'「〜のようだ」「〜のごとく」を使って比べる表現',level:'advanced'},
  {id:977,type:'read',kanji:'窮乏',reading:'きゅうぼう',example:'戦後の{窮乏}した時代を生き抜いた人々の話を聞いた。',meaning:'非常に貧しく困り果てた状態',level:'advanced'},
  {id:978,type:'read',kanji:'困窮',reading:'こんきゅう',example:'経済的に{困窮}した家庭への支援が急務だ。',meaning:'生活に困り苦しむこと',level:'advanced'},
  {id:979,type:'read',kanji:'淘汰',reading:'とうた',example:'競争の激化で弱小企業が{淘汰}された。',meaning:'不適なものが自然に取り除かれること',level:'advanced'},
  {id:980,type:'read',kanji:'斡旋',reading:'あっせん',example:'仲介業者が労使間の{斡旋}に当たった。',meaning:'間に立って世話をすること・仲介',level:'advanced'},
  {id:981,type:'read',kanji:'主権',reading:'しゅけん',example:'国家の{主権}は国民にあると憲法に定められている。',meaning:'国家の最高権力・他に支配されない権力',level:'advanced'},
  {id:982,type:'read',kanji:'稀薄',reading:'きはく',example:'人間関係が{稀薄}になりがちな現代社会の問題。',meaning:'薄くまばらなこと・希少で不足がちなこと',level:'advanced'},
  {id:983,type:'read',kanji:'顕在',reading:'けんざい',example:'潜在していたリスクが{顕在}化して表面に現れた。',meaning:'はっきりと現れて存在していること',level:'advanced'},
  {id:984,type:'read',kanji:'潜在',reading:'せんざい',example:'まだ気づかれていない{潜在}的な能力を引き出す。',meaning:'表面に出ずに内部に潜んでいること',level:'advanced'},
  {id:985,type:'read',kanji:'刷新',reading:'さっしん',example:'組織の体制を根本から{刷新}した。',meaning:'古いものを一新して新しくすること',level:'advanced'},
  {id:986,type:'read',kanji:'懐柔',reading:'かいじゅう',example:'強硬な相手を{懐柔}して協力を引き出した。',meaning:'うまく扱ってなつかせること・手なずけること',level:'advanced'},
  {id:987,type:'read',kanji:'畏敬',reading:'いけい',example:'大自然を前に{畏敬}の念が自然とわいた。',meaning:'恐れ敬う気持ち',level:'advanced'},
  {id:988,type:'read',kanji:'糾弾',reading:'きゅうだん',example:'不正を行った責任者を{糾弾}する声が上がった。',meaning:'悪事・不正を激しく責め問いただすこと',level:'advanced'},
  {id:989,type:'read',kanji:'訴訟',reading:'そしょう',example:'損害賠償を求めて{訴訟}を起こした。',meaning:'裁判所に判断を求めて争うこと',level:'advanced'},
  {id:990,type:'read',kanji:'釈放',reading:'しゃくほう',example:'証拠不十分で容疑者が{釈放}された。',meaning:'拘束を解いて自由にすること',level:'advanced'},
  {id:991,type:'read',kanji:'懲罰',reading:'ちょうばつ',example:'規則違反に対して{懲罰}が下された。',meaning:'こらしめのための罰を与えること',level:'advanced'},
  {id:992,type:'read',kanji:'迂回',reading:'うかい',example:'正面突破ではなく{迂回}して問題を解決した。',meaning:'まわり道をすること・回避して別の道を行くこと',level:'advanced'},
  {id:993,type:'read',kanji:'機微',reading:'きび',example:'人間関係の{機微}を読み取る力が求められる。',meaning:'微妙な事情・細かい感情の動き',level:'advanced'},
  {id:994,type:'read',kanji:'雄弁',reading:'ゆうべん',example:'彼の{雄弁}な演説が聴衆を動かした。',meaning:'力強く説得力のある話し方をすること',level:'advanced'},
  {id:995,type:'read',kanji:'折衝',reading:'せっしょう',example:'外交上の{折衝}を重ねてようやく合意に達した。',meaning:'相手方と利害を調整しながら交渉すること',level:'advanced'},
  {id:996,type:'read',kanji:'粛清',reading:'しゅくせい',example:'独裁政権による{粛清}の歴史を学ぶ。',meaning:'不純・反対派とみなした者を排除すること',level:'advanced'},
  {id:997,type:'read',kanji:'憤懣',reading:'ふんまん',example:'理不尽な扱いへの{憤懣}が胸に満ちた。',meaning:'怒りが積もり積もったうっぷん',level:'advanced'},
  {id:998,type:'read',kanji:'珠玉',reading:'しゅぎょく',example:'作家が生涯をかけて書き続けた{珠玉}の短編集。',meaning:'宝石のように貴重で美しいもの・優れた作品',level:'advanced'},
  {id:999,type:'read',kanji:'拙速',reading:'せっそく',example:'{拙速}な判断が取り返しのつかない失敗を生んだ。',meaning:'出来は悪くても速くすること・性急すぎること',level:'advanced'},
  {id:1000,type:'read',kanji:'深謀',reading:'しんぼう',example:'{深謀}遠慮のある策略で長期的な勝利をつかんだ。',meaning:'遠い先を見通した深い計略（深謀遠慮）',level:'advanced'},

  // ════ 書き問題 ── 基礎（準2〜2級・第5弾） ════
  {id:1001,type:'write',kanji:'貧困',reading:'ひんこん',example:'子どもの{ひんこん}問題に取り組む団体を支援した。',meaning:'生活に必要なものが欠けた状態',level:'basic'},
  {id:1002,type:'write',kanji:'福祉',reading:'ふくし',example:'高齢者の{ふくし}向上を目指した政策が進む。',meaning:'幸福・豊かな生活。社会的な支援の仕組み',level:'basic'},
  {id:1003,type:'write',kanji:'援助',reading:'えんじょ',example:'被災地への物資{えんじょ}が世界中から届いた。',meaning:'力を貸して助けること',level:'basic'},
  {id:1004,type:'write',kanji:'救済',reading:'きゅうさい',example:'困窮者の{きゅうさい}に向けた制度を整備した。',meaning:'苦しみや危機から救うこと',level:'basic'},
  {id:1005,type:'write',kanji:'欲望',reading:'よくぼう',example:'人間の{よくぼう}には際限がないとも言われる。',meaning:'強く欲しがる気持ち・欲求',level:'basic'},
  {id:1006,type:'write',kanji:'本能',reading:'ほんのう',example:'生き物が持つ{ほんのう}は生存に欠かせない。',meaning:'生まれつき備わった行動・感覚の働き',level:'basic'},
  {id:1007,type:'write',kanji:'衝動',reading:'しょうどう',example:'{しょうどう}に任せて行動すると後悔することがある。',meaning:'突然わき起こる強い欲求',level:'basic'},
  {id:1008,type:'write',kanji:'感慨',reading:'かんがい',example:'卒業式に{かんがい}深い気持ちで臨んだ。',meaning:'しみじみとした深い感動',level:'basic'},
  {id:1009,type:'write',kanji:'感銘',reading:'かんめい',example:'師の言葉に深く{かんめい}を受けた。',meaning:'心に深く刻まれる感動',level:'basic'},
  {id:1010,type:'write',kanji:'好奇心',reading:'こうきしん',example:'{こうきしん}旺盛な子どもほど学びへの意欲が高い。',meaning:'珍しいことを知りたがる気持ち',level:'basic'},
  {id:1011,type:'write',kanji:'自尊心',reading:'じそんしん',example:'失敗が続いて{じそんしん}が傷ついた。',meaning:'自分の尊厳・価値を大切に思う気持ち',level:'basic'},
  {id:1012,type:'write',kanji:'定義',reading:'ていぎ',example:'「公正」の{ていぎ}を辞書と文脈から確認する。',meaning:'言葉・概念の意味を明確に定めること',level:'basic'},
  {id:1013,type:'write',kanji:'論理',reading:'ろんり',example:'{ろんり}的に考えることが問題解決の第一歩だ。',meaning:'物事を筋道立てて考える法則',level:'basic'},
  {id:1014,type:'write',kanji:'移行',reading:'いこう',example:'旧制度から新制度への{いこう}がスムーズに進んだ。',meaning:'別の状態・段階へ移ること',level:'basic'},
  {id:1015,type:'write',kanji:'進展',reading:'しんてん',example:'交渉に{しんてん}がなく、膠着状態が続いた。',meaning:'物事が前へ進んで発展すること',level:'basic'},
  {id:1016,type:'write',kanji:'停滞',reading:'ていたい',example:'景気の{ていたい}が長引いて不安が広がった。',meaning:'物事が進まずとどまること',level:'basic'},
  {id:1017,type:'write',kanji:'持続',reading:'じぞく',example:'環境への負荷を減らした{じぞく}可能な社会を目指す。',meaning:'同じ状態が続くこと',level:'basic'},
  {id:1018,type:'write',kanji:'消滅',reading:'しょうめつ',example:'多くの生物種が環境変化で{しょうめつ}の危機にある。',meaning:'なくなること・消えてなくなること',level:'basic'},
  {id:1019,type:'write',kanji:'交渉',reading:'こうしょう',example:'労使{こうしょう}が決裂し、ストライキが起きた。',meaning:'話し合いによって取り決めること',level:'basic'},
  {id:1020,type:'write',kanji:'説得',reading:'せっとく',example:'反対する相手を{せっとく}するのに時間がかかった。',meaning:'相手を理由・根拠で納得させること',level:'basic'},
  {id:1021,type:'write',kanji:'対話',reading:'たいわ',example:'異なる立場の人々が{たいわ}することで理解が深まる。',meaning:'向かい合って話し合うこと',level:'basic'},
  {id:1022,type:'write',kanji:'抗議',reading:'こうぎ',example:'不当な判決に対して{こうぎ}の声が上がった。',meaning:'不当なことに対して反対を申し立てること',level:'basic'},
  {id:1023,type:'write',kanji:'生態',reading:'せいたい',example:'昆虫の{せいたい}を長年にわたって観察した研究者。',meaning:'生物の自然界での生活のようす',level:'basic'},
  {id:1024,type:'write',kanji:'絶滅',reading:'ぜつめつ',example:'乱獲によってその魚は{ぜつめつ}寸前となった。',meaning:'種や集団が完全になくなること',level:'basic'},
  {id:1025,type:'write',kanji:'進化',reading:'しんか',example:'生物が環境に適応しながら{しんか}する過程を学ぶ。',meaning:'生物が世代を経て変化・発展すること',level:'basic'},
  {id:1026,type:'write',kanji:'適応',reading:'てきおう',example:'新しい環境への{てきおう}に時間がかかった。',meaning:'環境・状況に合わせて変化・対応すること',level:'basic'},
  {id:1027,type:'write',kanji:'本来',reading:'ほんらい',example:'この制度の{ほんらい}の目的は何だったかを問い直す。',meaning:'もともと・はじめから',level:'basic'},
  {id:1028,type:'write',kanji:'根源',reading:'こんげん',example:'問題の{こんげん}にある原因を突き止める。',meaning:'物事の根本・もとになるもの',level:'basic'},
  {id:1029,type:'write',kanji:'究極',reading:'きゅうきょく',example:'{きゅうきょく}の目標は世界平和の実現だと語った。',meaning:'これ以上ないところ・最終的な極み',level:'basic'},
  {id:1030,type:'write',kanji:'文脈',reading:'ぶんみゃく',example:'言葉は{ぶんみゃく}によって意味が変わることがある。',meaning:'文章の流れ・話の前後のつながり',level:'basic'},
  {id:1031,type:'write',kanji:'文体',reading:'ぶんたい',example:'作家ごとに独自の{ぶんたい}があり、味わいが違う。',meaning:'文章の書き方・スタイル',level:'basic'},
  {id:1032,type:'write',kanji:'引用',reading:'いんよう',example:'論文では他者の意見を{いんよう}する際に出典を明記する。',meaning:'他の文章・言葉をそのまま使うこと',level:'basic'},
  {id:1033,type:'write',kanji:'参照',reading:'さんしょう',example:'詳細は巻末の資料を{さんしょう}してください。',meaning:'見比べること・他の部分を見ること',level:'basic'},
  {id:1034,type:'write',kanji:'批評',reading:'ひひょう',example:'作品の良し悪しを客観的に{ひひょう}する力を養う。',meaning:'物事の優劣・得失を論じること',level:'basic'},
  {id:1035,type:'write',kanji:'発端',reading:'ほったん',example:'些細な誤解が事件の{ほったん}となった。',meaning:'物事の始まり・きっかけ',level:'basic'},
  {id:1036,type:'write',kanji:'調停',reading:'ちょうてい',example:'第三者が{ちょうてい}に入って争いを解決した。',meaning:'争いの間に入って解決をはかること',level:'basic'},
  {id:1037,type:'write',kanji:'形成',reading:'けいせい',example:'幼少期の経験が人格{けいせい}に大きく影響する。',meaning:'形・組織・性質をつくり上げること',level:'basic'},
  {id:1038,type:'write',kanji:'鑑賞',reading:'かんしょう',example:'美術館で絵画を{かんしょう}して豊かな時間を過ごした。',meaning:'芸術作品などを味わい楽しむこと',level:'basic'},
  {id:1039,type:'write',kanji:'持論',reading:'じろん',example:'彼はこの問題について{じろん}を展開した。',meaning:'自分がいつも主張する意見',level:'basic'},
  {id:1040,type:'write',kanji:'補償',reading:'ほしょう',example:'事故による損害の{ほしょう}を請求した。',meaning:'損害・損失を埋め合わせること',level:'basic'},

  // ════ 書き問題 ── 標準（準2〜2級・第5弾） ════
  {id:1041,type:'write',kanji:'命題',reading:'めいだい',example:'この議論の{めいだい}を整理してから話し合いを始める。',meaning:'真か偽かを判断できる文・主張',level:'standard'},
  {id:1042,type:'write',kanji:'共生',reading:'きょうせい',example:'異なる種が{きょうせい}することで生態系が保たれる。',meaning:'異なるものが互いに助け合って生きること',level:'standard'},
  {id:1043,type:'write',kanji:'枯渇',reading:'こかつ',example:'地下水が{こかつ}すると農業に深刻な影響が出る。',meaning:'水・資源などが尽きてなくなること',level:'standard'},
  {id:1044,type:'write',kanji:'源泉',reading:'げんせん',example:'創造性の{げんせん}は日常のさまざまな体験にある。',meaning:'物事の根本となる源',level:'standard'},
  {id:1045,type:'write',kanji:'評論',reading:'ひょうろん',example:'著名な{ひょうろん}家が社会問題について鋭い分析を示した。',meaning:'物事を批判的に評価して論じること',level:'standard'},
  {id:1046,type:'write',kanji:'定着',reading:'ていちゃく',example:'新しい習慣が社会に{ていちゃく}するには時間がかかる。',meaning:'しっかりと根付くこと',level:'standard'},
  {id:1047,type:'write',kanji:'妥当',reading:'だとう',example:'その判断は状況から見て{だとう}だと言えるだろう。',meaning:'内容・判断が適切で無理のないこと',level:'standard'},
  {id:1048,type:'write',kanji:'反証',reading:'はんしょう',example:'仮説に対する{はんしょう}が見つかり、理論を修正した。',meaning:'逆の証拠・反対の事実を示すこと',level:'standard'},
  {id:1049,type:'write',kanji:'立証',reading:'りっしょう',example:'無実を{りっしょう}するための証拠を集めた。',meaning:'証拠を挙げて正しいことを明らかにすること',level:'standard'},
  {id:1050,type:'write',kanji:'翻訳',reading:'ほんやく',example:'外国語の文学作品を日本語に{ほんやく}した。',meaning:'ある言語を別の言語に訳すこと',level:'standard'},
  {id:1051,type:'write',kanji:'類推',reading:'るいすい',example:'似た例から{るいすい}して答えを導き出した。',meaning:'類似点をもとに推論すること',level:'standard'},
  {id:1052,type:'write',kanji:'演繹',reading:'えんえき',example:'一般的な法則から個別の事例を{えんえき}する思考法。',meaning:'一般原理から個別の結論を導く推論',level:'standard'},
  {id:1053,type:'write',kanji:'帰納',reading:'きのう',example:'多くの事例から共通点を見つける{きのう}的な方法。',meaning:'個別の事例から一般的な法則を導く推論',level:'standard'},
  {id:1054,type:'write',kanji:'是正',reading:'ぜせい',example:'制度の不備を{ぜせい}するための会議が開かれた。',meaning:'悪いところを改めて正しくすること',level:'standard'},
  {id:1055,type:'write',kanji:'革新',reading:'かくしん',example:'技術の{かくしん}が産業構造を大きく変えた。',meaning:'旧来のものを根本から改めて新しくすること',level:'standard'},
  {id:1056,type:'write',kanji:'保守',reading:'ほしゅ',example:'{ほしゅ}的な意見と革新的な意見が対立した。',meaning:'旧来の制度・方法を守り続けること',level:'standard'},
  {id:1057,type:'write',kanji:'差別',reading:'さべつ',example:'いかなる{さべつ}も許してはならないと強調した。',meaning:'不当に区別して不平等に扱うこと',level:'standard'},
  {id:1058,type:'write',kanji:'対比',reading:'たいひ',example:'二つの作品を{たいひ}することで特徴が際立った。',meaning:'二つのものを比べて違いを明らかにすること',level:'standard'},
  {id:1059,type:'write',kanji:'緊迫',reading:'きんぱく',example:'交渉が決裂寸前となり、情勢が{きんぱく}した。',meaning:'事態が差し迫って張り詰めること',level:'standard'},
  {id:1060,type:'write',kanji:'挫折',reading:'ざせつ',example:'度重なる{ざせつ}を乗り越えて夢をつかんだ。',meaning:'途中で失敗してくじけること',level:'standard'},
  {id:1061,type:'write',kanji:'危惧',reading:'きぐ',example:'環境の悪化を{きぐ}する声が高まっている。',meaning:'危険・悪化を恐れて心配すること',level:'standard'},
  {id:1062,type:'write',kanji:'警鐘',reading:'けいしょう',example:'専門家が地球温暖化への{けいしょう}を鳴らした。',meaning:'危険・過ちを警告すること',level:'standard'},
  {id:1063,type:'write',kanji:'警戒',reading:'けいかい',example:'不審者の情報を受けて地域全体で{けいかい}を強めた。',meaning:'危険に備えて用心すること',level:'standard'},
  {id:1064,type:'write',kanji:'媒体',reading:'ばいたい',example:'情報伝達の{ばいたい}としてインターネットが普及した。',meaning:'情報・影響を伝えるなかだちとなるもの',level:'standard'},
  {id:1065,type:'write',kanji:'改善',reading:'かいぜん',example:'業務の{かいぜん}によって作業効率が大幅に上がった。',meaning:'悪い点を改めてよくすること',level:'standard'},
  {id:1066,type:'write',kanji:'訂正',reading:'ていせい',example:'報告書の誤りを{ていせい}して再提出した。',meaning:'誤りを正しく直すこと',level:'standard'},
  {id:1067,type:'write',kanji:'普遍',reading:'ふへん',example:'人間の尊厳は{ふへん}的な価値を持つ。',meaning:'すべてに共通して当てはまること',level:'standard'},
  {id:1068,type:'write',kanji:'折衷',reading:'せっちゅう',example:'和洋{せっちゅう}のデザインが独特の魅力を生んでいる。',meaning:'異なるものの良い点をとり合わせること',level:'standard'},
  {id:1069,type:'write',kanji:'相克',reading:'そうこく',example:'理想と現実の{そうこく}に苦しみながら決断した。',meaning:'二つのものが対立してせめぎ合うこと',level:'standard'},
  {id:1070,type:'write',kanji:'欠如',reading:'けつじょ',example:'想像力の{けつじょ}が誤解を生んだ。',meaning:'必要なものが欠けていること',level:'standard'},

  // ════ 書き問題 ── 発展（2級中心・第5弾） ════
  {id:1071,type:'write',kanji:'真髄',reading:'しんずい',example:'その言葉には武道の{しんずい}が凝縮されていた。',meaning:'物事の本質・もっとも重要なところ',level:'advanced'},
  {id:1072,type:'write',kanji:'意匠',reading:'いしょう',example:'独創的な{いしょう}が消費者の目を引いた。',meaning:'芸術・工業製品などの外観の考案・デザイン',level:'advanced'},
  {id:1073,type:'write',kanji:'本末',reading:'ほんまつ',example:'手段に集中しすぎて{ほんまつ}転倒になっていた。',meaning:'物事の根本と末端（本末転倒）',level:'advanced'},
  {id:1074,type:'write',kanji:'隠喩',reading:'いんゆ',example:'「人生は旅だ」は{いんゆ}の典型的な例だ。',meaning:'「〜のようだ」を使わず直接他のものにたとえる修辞法',level:'advanced'},
  {id:1075,type:'write',kanji:'直喩',reading:'ちょくゆ',example:'「まるで嵐のような演奏」は{ちょくゆ}的な表現だ。',meaning:'「〜のようだ」を使って比べる表現',level:'advanced'},
  {id:1076,type:'write',kanji:'窮乏',reading:'きゅうぼう',example:'戦後の{きゅうぼう}した時代を生き抜いた。',meaning:'非常に貧しく困り果てた状態',level:'advanced'},
  {id:1077,type:'write',kanji:'困窮',reading:'こんきゅう',example:'経済的に{こんきゅう}した家庭への支援が急務だ。',meaning:'生活に困り苦しむこと',level:'advanced'},
  {id:1078,type:'write',kanji:'淘汰',reading:'とうた',example:'競争の激化で弱小企業が{とうた}された。',meaning:'不適なものが自然に取り除かれること',level:'advanced'},
  {id:1079,type:'write',kanji:'斡旋',reading:'あっせん',example:'仲介業者が労使間の{あっせん}に当たった。',meaning:'間に立って世話をすること・仲介',level:'advanced'},
  {id:1080,type:'write',kanji:'主権',reading:'しゅけん',example:'国家の{しゅけん}は国民にあると憲法に定められている。',meaning:'国家の最高権力',level:'advanced'},
  {id:1081,type:'write',kanji:'稀薄',reading:'きはく',example:'人間関係が{きはく}になりがちな現代社会の問題。',meaning:'薄くまばらなこと・希少で不足がちなこと',level:'advanced'},
  {id:1082,type:'write',kanji:'顕在',reading:'けんざい',example:'潜在していたリスクが{けんざい}化して表面に現れた。',meaning:'はっきりと現れて存在していること',level:'advanced'},
  {id:1083,type:'write',kanji:'潜在',reading:'せんざい',example:'まだ気づかれていない{せんざい}的な能力を引き出す。',meaning:'表面に出ずに内部に潜んでいること',level:'advanced'},
  {id:1084,type:'write',kanji:'刷新',reading:'さっしん',example:'組織の体制を根本から{さっしん}した。',meaning:'古いものを一新して新しくすること',level:'advanced'},
  {id:1085,type:'write',kanji:'懐柔',reading:'かいじゅう',example:'強硬な相手を{かいじゅう}して協力を引き出した。',meaning:'うまく扱ってなつかせること',level:'advanced'},
  {id:1086,type:'write',kanji:'畏敬',reading:'いけい',example:'大自然を前に{いけい}の念が自然とわいた。',meaning:'恐れ敬う気持ち',level:'advanced'},
  {id:1087,type:'write',kanji:'糾弾',reading:'きゅうだん',example:'不正を行った責任者を{きゅうだん}する声が上がった。',meaning:'悪事・不正を激しく責め問いただすこと',level:'advanced'},
  {id:1088,type:'write',kanji:'訴訟',reading:'そしょう',example:'損害賠償を求めて{そしょう}を起こした。',meaning:'裁判所に判断を求めて争うこと',level:'advanced'},
  {id:1089,type:'write',kanji:'釈放',reading:'しゃくほう',example:'証拠不十分で容疑者が{しゃくほう}された。',meaning:'拘束を解いて自由にすること',level:'advanced'},
  {id:1090,type:'write',kanji:'懲罰',reading:'ちょうばつ',example:'規則違反に対して{ちょうばつ}が下された。',meaning:'こらしめのための罰を与えること',level:'advanced'},
  {id:1091,type:'write',kanji:'迂回',reading:'うかい',example:'正面突破ではなく{うかい}して問題を解決した。',meaning:'まわり道をすること',level:'advanced'},
  {id:1092,type:'write',kanji:'機微',reading:'きび',example:'人間関係の{きび}を読み取る力が求められる。',meaning:'微妙な事情・細かい感情の動き',level:'advanced'},
  {id:1093,type:'write',kanji:'雄弁',reading:'ゆうべん',example:'彼の{ゆうべん}な演説が聴衆を動かした。',meaning:'力強く説得力のある話し方',level:'advanced'},
  {id:1094,type:'write',kanji:'折衝',reading:'せっしょう',example:'外交上の{せっしょう}を重ねてようやく合意に達した。',meaning:'相手方と利害を調整しながら交渉すること',level:'advanced'},
  {id:1095,type:'write',kanji:'粛清',reading:'しゅくせい',example:'独裁政権による{しゅくせい}の歴史を学ぶ。',meaning:'不純・反対派とみなした者を排除すること',level:'advanced'},
  {id:1096,type:'write',kanji:'憤懣',reading:'ふんまん',example:'理不尽な扱いへの{ふんまん}が胸に満ちた。',meaning:'怒りが積もり積もったうっぷん',level:'advanced'},
  {id:1097,type:'write',kanji:'珠玉',reading:'しゅぎょく',example:'作家が生涯をかけて書き続けた{しゅぎょく}の短編集。',meaning:'宝石のように貴重で美しいもの・優れた作品',level:'advanced'},
  {id:1098,type:'write',kanji:'拙速',reading:'せっそく',example:'{せっそく}な判断が取り返しのつかない失敗を生んだ。',meaning:'出来は悪くても速くすること・性急すぎること',level:'advanced'},
  {id:1099,type:'write',kanji:'深謀',reading:'しんぼう',example:'{しんぼう}遠慮のある策略で長期的な勝利をつかんだ。',meaning:'遠い先を見通した深い計略',level:'advanced'},
  {id:1100,type:'write',kanji:'弁証',reading:'べんしょう',example:'矛盾を超えて統一する{べんしょう}法的な思考を学ぶ。',meaning:'議論によって正しさを証明すること',level:'advanced'},

  // ════ 読み問題 ── 四字熟語・基礎 ════
  {id:1101,type:'read',kanji:'一石二鳥',reading:'いっせきにちょう',example:'運動して健康にも痩せにもなる、まさに{一石二鳥}だ。',meaning:'一つの行動で二つの利益を得ること',level:'basic'},
  {id:1102,type:'read',kanji:'以心伝心',reading:'いしんでんしん',example:'長年の友人とは言葉なくとも{以心伝心}で通じ合える。',meaning:'言葉にしなくても気持ちが通じること',level:'basic'},
  {id:1103,type:'read',kanji:'自業自得',reading:'じごうじとく',example:'準備を怠ったのだから失敗しても{自業自得}だ。',meaning:'自分の行いの結果を自分が受けること',level:'basic'},
  {id:1104,type:'read',kanji:'試行錯誤',reading:'しこうさくご',example:'{試行錯誤}を繰り返してようやく解決策を見つけた。',meaning:'繰り返し試みながら解決策を探ること',level:'basic'},
  {id:1105,type:'read',kanji:'温故知新',reading:'おんこちしん',example:'{温故知新}の精神で古典を学び直した。',meaning:'過去を学ぶことで新しい知恵を得ること',level:'basic'},
  {id:1106,type:'read',kanji:'切磋琢磨',reading:'せっさたくま',example:'ライバルと{切磋琢磨}することで互いに成長した。',meaning:'互いに刺激し合って向上すること',level:'basic'},
  {id:1107,type:'read',kanji:'一期一会',reading:'いちごいちえ',example:'{一期一会}の気持ちで今日の出会いを大切にする。',meaning:'一生に一度の出会いを大切にすること',level:'basic'},
  {id:1108,type:'read',kanji:'付和雷同',reading:'ふわらいどう',example:'{付和雷同}せずに自分の意見をしっかり持つことが大切だ。',meaning:'自分の考えなく他人の意見にそのまま同調すること',level:'basic'},
  {id:1109,type:'read',kanji:'大器晩成',reading:'たいきばんせい',example:'彼は{大器晩成}型で、四十代になって真の才能を開花させた。',meaning:'優れた人物は遅れて頭角を現すこと',level:'basic'},
  {id:1110,type:'read',kanji:'一致団結',reading:'いっちだんけつ',example:'チームが{一致団結}して難局を乗り越えた。',meaning:'心を一つにして協力すること',level:'basic'},
  {id:1111,type:'read',kanji:'五里霧中',reading:'ごりむちゅう',example:'情報が少なく対処法がわからず{五里霧中}の状態だ。',meaning:'方針がわからず迷っている状態',level:'basic'},
  {id:1112,type:'read',kanji:'半信半疑',reading:'はんしんはんぎ',example:'突然の吉報に{半信半疑}のまま話を聞いた。',meaning:'信じるとも疑うともつかない状態',level:'basic'},
  {id:1113,type:'read',kanji:'臨機応変',reading:'りんきおうへん',example:'想定外の事態にも{臨機応変}に対処できる人材が求められる。',meaning:'その場の状況に応じて適切に対応すること',level:'basic'},
  {id:1114,type:'read',kanji:'喜怒哀楽',reading:'きどあいらく',example:'文学は人間の{喜怒哀楽}を豊かに描き出す。',meaning:'喜び・怒り・悲しみ・楽しみの感情全般',level:'basic'},
  {id:1115,type:'read',kanji:'起死回生',reading:'きしかいせい',example:'追い詰められた末に{起死回生}の一手を放った。',meaning:'絶望的な状況を一気に逆転させること',level:'basic'},

  // ════ 読み問題 ── 四字熟語・標準 ════
  {id:1116,type:'read',kanji:'臥薪嘗胆',reading:'がしんしょうたん',example:'長年の{臥薪嘗胆}の末、悲願を達成した。',meaning:'将来の目的のために苦労に耐え続けること',level:'standard'},
  {id:1117,type:'read',kanji:'呉越同舟',reading:'ごえつどうしゅう',example:'ライバル同士が危機に際して{呉越同舟}で協力した。',meaning:'仲の悪い者同士が同じ立場・状況に置かれること',level:'standard'},
  {id:1118,type:'read',kanji:'諸行無常',reading:'しょぎょうむじょう',example:'{諸行無常}のことわりを、散る花びらに感じた。',meaning:'この世のすべては常に変化し続けること',level:'standard'},
  {id:1119,type:'read',kanji:'一意専心',reading:'いちいせんしん',example:'雑念を捨て{一意専心}で目標に取り組んだ。',meaning:'一つのことだけに心を向けて集中すること',level:'standard'},
  {id:1120,type:'read',kanji:'明鏡止水',reading:'めいきょうしすい',example:'{明鏡止水}の境地で冷静に状況を見極めた。',meaning:'心が澄み切って静かで乱れのない状態',level:'standard'},
  {id:1121,type:'read',kanji:'不撓不屈',reading:'ふとうふくつ',example:'{不撓不屈}の精神で何度転んでも立ち上がった。',meaning:'どんな困難にも絶対に挫けないこと',level:'standard'},
  {id:1122,type:'read',kanji:'岡目八目',reading:'おかめはちもく',example:'{岡目八目}というように、当事者より第三者のほうが正確に見えることがある。',meaning:'第三者のほうが物事を正確に見られること',level:'standard'},
  {id:1123,type:'read',kanji:'巧言令色',reading:'こうげんれいしょく',example:'{巧言令色}な言葉に惑わされず本質を見抜く。',meaning:'口先だけ上手く顔色だけよくすること・うわべだけを飾ること',level:'standard'},
  {id:1124,type:'read',kanji:'竜頭蛇尾',reading:'りゅうとうだび',example:'最初は勢いよく始めたが結局{竜頭蛇尾}に終わった。',meaning:'最初は盛んだが後になるほど勢いが衰えること',level:'standard'},
  {id:1125,type:'read',kanji:'馬耳東風',reading:'ばじとうふう',example:'注意を何度しても{馬耳東風}で全く改善が見られない。',meaning:'人の意見を聞き流して心に留めないこと',level:'standard'},
  {id:1126,type:'read',kanji:'一朝一夕',reading:'いっちょういっせき',example:'信頼関係は{一朝一夕}には築けない。',meaning:'ごく短い時間のこと（一朝一夕には＝すぐには）',level:'standard'},
  {id:1127,type:'read',kanji:'一長一短',reading:'いっちょういったん',example:'どちらの案も{一長一短}あり、決断が難しい。',meaning:'長所もあれば短所もあること',level:'standard'},
  {id:1128,type:'read',kanji:'起承転結',reading:'きしょうてんけつ',example:'文章は{起承転結}を意識して書くと読みやすくなる。',meaning:'文章・話の四段階の構成法',level:'standard'},
  {id:1129,type:'read',kanji:'前途多難',reading:'ぜんとたなん',example:'計画の出だしからつまずき、{前途多難}を覚悟した。',meaning:'これから先に困難が多く待ち受けていること',level:'standard'},
  {id:1130,type:'read',kanji:'一念発起',reading:'いちねんほっき',example:'{一念発起}して毎日早起きすることを決めた。',meaning:'思い切って心を決めて取り組み始めること',level:'standard'},
  {id:1131,type:'read',kanji:'同床異夢',reading:'どうしょういむ',example:'表向き協力しているが実は{同床異夢}の関係だった。',meaning:'同じ立場にいながら考えや目標が違うこと',level:'standard'},
  {id:1132,type:'read',kanji:'四面楚歌',reading:'しめんそか',example:'支持者を次々と失い、{四面楚歌}の状況に陥った。',meaning:'周囲が敵ばかりで孤立した状態',level:'standard'},
  {id:1133,type:'read',kanji:'一刀両断',reading:'いっとうりょうだん',example:'長引く議論を{一刀両断}に片付けた。',meaning:'物事をすっぱりと処理すること',level:'standard'},
  {id:1134,type:'read',kanji:'自画自賛',reading:'じがじさん',example:'{自画自賛}ばかりで周囲の評価を聞こうとしない。',meaning:'自分で自分を褒めること',level:'standard'},
  {id:1135,type:'read',kanji:'朝令暮改',reading:'ちょうれいぼかい',example:'方針が{朝令暮改}では現場が混乱する。',meaning:'命令・方針が頻繁に変わること',level:'standard'},
  {id:1136,type:'read',kanji:'七転八起',reading:'しちてんはっき',example:'{七転八起}の精神で何度失敗しても諦めなかった。',meaning:'何度失敗しても立ち上がること',level:'standard'},
  {id:1137,type:'read',kanji:'孤立無援',reading:'こりつむえん',example:'誰の協力も得られず{孤立無援}で戦い続けた。',meaning:'孤立して助けてくれる者が誰もいない状態',level:'standard'},
  {id:1138,type:'read',kanji:'才色兼備',reading:'さいしょくけんび',example:'{才色兼備}の彼女は多くの人から尊敬された。',meaning:'才能と美貌の両方を兼ね備えていること',level:'standard'},
  {id:1139,type:'read',kanji:'天変地異',reading:'てんぺんちい',example:'{天変地異}が続き、人々の危機感が高まった。',meaning:'嵐・地震など自然界に起きる大きな変動・災害',level:'standard'},
  {id:1140,type:'read',kanji:'自由奔放',reading:'じゆうほんぽう',example:'{自由奔放}な発想が革新的な作品を生み出した。',meaning:'規則や習慣にとらわれず自由に行動すること',level:'standard'},

  // ════ 読み問題 ── 四字熟語・発展 ════
  {id:1141,type:'read',kanji:'二律背反',reading:'にりつはいはん',example:'この問題は{二律背反}の構造を持ち、どちらも正しい。',meaning:'二つの命題が互いに矛盾して両立しないこと（アンチノミー）',level:'advanced'},
  {id:1142,type:'read',kanji:'換骨奪胎',reading:'かんこつだったい',example:'古典作品を現代的に{換骨奪胎}して新しい表現を生み出した。',meaning:'先人の作品の骨格を借りて独自の表現を作ること',level:'advanced'},
  {id:1143,type:'read',kanji:'隔靴搔痒',reading:'かっかそうよう',example:'核心に触れない説明では{隔靴搔痒}の感が拭えない。',meaning:'もどかしくて思い通りにならないこと',level:'advanced'},
  {id:1144,type:'read',kanji:'傍若無人',reading:'ぼうじゃくぶじん',example:'{傍若無人}な振る舞いが周囲を不快にさせた。',meaning:'他人を無視して勝手気ままに振る舞うこと',level:'advanced'},
  {id:1145,type:'read',kanji:'画竜点睛',reading:'がりょうてんせい',example:'最後の一言が{画竜点睛}となり、スピーチが完成した。',meaning:'物事の最後の仕上げとなる大切な一点',level:'advanced'},
  {id:1146,type:'read',kanji:'羊頭狗肉',reading:'ようとうくにく',example:'立派な看板を掲げながら実態は{羊頭狗肉}だった。',meaning:'外見と中身が全く違うこと・看板倒れ',level:'advanced'},
  {id:1147,type:'read',kanji:'百折不撓',reading:'ひゃくせつふとう',example:'{百折不撓}の精神で幾多の逆境を乗り越えた。',meaning:'何度挫折しても決してくじけないこと',level:'advanced'},
  {id:1148,type:'read',kanji:'抱腹絶倒',reading:'ほうふくぜっとう',example:'その話は{抱腹絶倒}で、笑いが止まらなかった。',meaning:'腹を抱えて倒れるほど大笑いすること',level:'advanced'},
  {id:1149,type:'read',kanji:'佳人薄命',reading:'かじんはくめい',example:'才能豊かな彼女の早世は{佳人薄命}というほかない。',meaning:'美人や才能ある人は短命であること',level:'advanced'},
  {id:1150,type:'read',kanji:'唯我独尊',reading:'ゆいがどくそん',example:'{唯我独尊}の態度では他者との協調は難しい。',meaning:'自分だけが優れていると思い込んで傲慢なこと',level:'advanced'},

  // ════ 書き問題 ── 四字熟語・基礎 ════
  {id:1151,type:'write',kanji:'一石二鳥',reading:'いっせきにちょう',example:'運動して健康にも痩せにもなる、まさに{いっせきにちょう}だ。',meaning:'一つの行動で二つの利益を得ること',level:'basic'},
  {id:1152,type:'write',kanji:'以心伝心',reading:'いしんでんしん',example:'長年の友人とは言葉なくとも{いしんでんしん}で通じ合える。',meaning:'言葉にしなくても気持ちが通じること',level:'basic'},
  {id:1153,type:'write',kanji:'自業自得',reading:'じごうじとく',example:'準備を怠ったのだから失敗しても{じごうじとく}だ。',meaning:'自分の行いの結果を自分が受けること',level:'basic'},
  {id:1154,type:'write',kanji:'試行錯誤',reading:'しこうさくご',example:'{しこうさくご}を繰り返してようやく解決策を見つけた。',meaning:'繰り返し試みながら解決策を探ること',level:'basic'},
  {id:1155,type:'write',kanji:'温故知新',reading:'おんこちしん',example:'{おんこちしん}の精神で古典を学び直した。',meaning:'過去を学ぶことで新しい知恵を得ること',level:'basic'},
  {id:1156,type:'write',kanji:'切磋琢磨',reading:'せっさたくま',example:'ライバルと{せっさたくま}することで互いに成長した。',meaning:'互いに刺激し合って向上すること',level:'basic'},
  {id:1157,type:'write',kanji:'一期一会',reading:'いちごいちえ',example:'{いちごいちえ}の気持ちで今日の出会いを大切にする。',meaning:'一生に一度の出会いを大切にすること',level:'basic'},
  {id:1158,type:'write',kanji:'付和雷同',reading:'ふわらいどう',example:'{ふわらいどう}せずに自分の意見をしっかり持つことが大切だ。',meaning:'自分の考えなく他人の意見にそのまま同調すること',level:'basic'},
  {id:1159,type:'write',kanji:'大器晩成',reading:'たいきばんせい',example:'彼は{たいきばんせい}型で、四十代になって才能を開花させた。',meaning:'優れた人物は遅れて頭角を現すこと',level:'basic'},
  {id:1160,type:'write',kanji:'一致団結',reading:'いっちだんけつ',example:'チームが{いっちだんけつ}して難局を乗り越えた。',meaning:'心を一つにして協力すること',level:'basic'},
  {id:1161,type:'write',kanji:'五里霧中',reading:'ごりむちゅう',example:'情報が少なく対処法がわからず{ごりむちゅう}の状態だ。',meaning:'方針がわからず迷っている状態',level:'basic'},
  {id:1162,type:'write',kanji:'臨機応変',reading:'りんきおうへん',example:'想定外の事態にも{りんきおうへん}に対処できる人材が求められる。',meaning:'その場の状況に応じて適切に対応すること',level:'basic'},
  {id:1163,type:'write',kanji:'喜怒哀楽',reading:'きどあいらく',example:'文学は人間の{きどあいらく}を豊かに描き出す。',meaning:'喜び・怒り・悲しみ・楽しみの感情全般',level:'basic'},
  {id:1164,type:'write',kanji:'起死回生',reading:'きしかいせい',example:'追い詰められた末に{きしかいせい}の一手を放った。',meaning:'絶望的な状況を一気に逆転させること',level:'basic'},
  {id:1165,type:'write',kanji:'半信半疑',reading:'はんしんはんぎ',example:'突然の吉報に{はんしんはんぎ}のまま話を聞いた。',meaning:'信じるとも疑うともつかない状態',level:'basic'},

  // ════ 書き問題 ── 四字熟語・標準 ════
  {id:1166,type:'write',kanji:'臥薪嘗胆',reading:'がしんしょうたん',example:'長年の{がしんしょうたん}の末、悲願を達成した。',meaning:'将来の目的のために苦労に耐え続けること',level:'standard'},
  {id:1167,type:'write',kanji:'呉越同舟',reading:'ごえつどうしゅう',example:'ライバル同士が危機に際して{ごえつどうしゅう}で協力した。',meaning:'仲の悪い者同士が同じ状況に置かれること',level:'standard'},
  {id:1168,type:'write',kanji:'諸行無常',reading:'しょぎょうむじょう',example:'{しょぎょうむじょう}のことわりを、散る花びらに感じた。',meaning:'この世のすべては常に変化し続けること',level:'standard'},
  {id:1169,type:'write',kanji:'明鏡止水',reading:'めいきょうしすい',example:'{めいきょうしすい}の境地で冷静に状況を見極めた。',meaning:'心が澄み切って静かで乱れのない状態',level:'standard'},
  {id:1170,type:'write',kanji:'不撓不屈',reading:'ふとうふくつ',example:'{ふとうふくつ}の精神で何度転んでも立ち上がった。',meaning:'どんな困難にも絶対に挫けないこと',level:'standard'},
  {id:1171,type:'write',kanji:'巧言令色',reading:'こうげんれいしょく',example:'{こうげんれいしょく}な言葉に惑わされず本質を見抜く。',meaning:'口先だけ上手く顔色だけよくすること',level:'standard'},
  {id:1172,type:'write',kanji:'竜頭蛇尾',reading:'りゅうとうだび',example:'最初は勢いよく始めたが結局{りゅうとうだび}に終わった。',meaning:'最初は盛んだが後になるほど勢いが衰えること',level:'standard'},
  {id:1173,type:'write',kanji:'馬耳東風',reading:'ばじとうふう',example:'注意を何度しても{ばじとうふう}で全く改善が見られない。',meaning:'人の意見を聞き流して心に留めないこと',level:'standard'},
  {id:1174,type:'write',kanji:'一朝一夕',reading:'いっちょういっせき',example:'信頼関係は{いっちょういっせき}には築けない。',meaning:'ごく短い時間のこと（一朝一夕には＝すぐには）',level:'standard'},
  {id:1175,type:'write',kanji:'一長一短',reading:'いっちょういったん',example:'どちらの案も{いっちょういったん}あり、決断が難しい。',meaning:'長所もあれば短所もあること',level:'standard'},
  {id:1176,type:'write',kanji:'起承転結',reading:'きしょうてんけつ',example:'文章は{きしょうてんけつ}を意識して書くと読みやすくなる。',meaning:'文章・話の四段階の構成法',level:'standard'},
  {id:1177,type:'write',kanji:'前途多難',reading:'ぜんとたなん',example:'計画の出だしからつまずき、{ぜんとたなん}を覚悟した。',meaning:'これから先に困難が多く待ち受けていること',level:'standard'},
  {id:1178,type:'write',kanji:'一念発起',reading:'いちねんほっき',example:'{いちねんほっき}して毎日早起きすることを決めた。',meaning:'思い切って心を決めて取り組み始めること',level:'standard'},
  {id:1179,type:'write',kanji:'同床異夢',reading:'どうしょういむ',example:'表向き協力しているが実は{どうしょういむ}の関係だった。',meaning:'同じ立場にいながら考えや目標が違うこと',level:'standard'},
  {id:1180,type:'write',kanji:'四面楚歌',reading:'しめんそか',example:'支持者を次々と失い、{しめんそか}の状況に陥った。',meaning:'周囲が敵ばかりで孤立した状態',level:'standard'},
  {id:1181,type:'write',kanji:'一刀両断',reading:'いっとうりょうだん',example:'長引く議論を{いっとうりょうだん}に片付けた。',meaning:'物事をすっぱりと処理すること',level:'standard'},
  {id:1182,type:'write',kanji:'自画自賛',reading:'じがじさん',example:'{じがじさん}ばかりで周囲の評価を聞こうとしない。',meaning:'自分で自分を褒めること',level:'standard'},
  {id:1183,type:'write',kanji:'朝令暮改',reading:'ちょうれいぼかい',example:'方針が{ちょうれいぼかい}では現場が混乱する。',meaning:'命令・方針が頻繁に変わること',level:'standard'},
  {id:1184,type:'write',kanji:'七転八起',reading:'しちてんはっき',example:'{しちてんはっき}の精神で何度失敗しても諦めなかった。',meaning:'何度失敗しても立ち上がること',level:'standard'},
  {id:1185,type:'write',kanji:'孤立無援',reading:'こりつむえん',example:'誰の協力も得られず{こりつむえん}で戦い続けた。',meaning:'孤立して助けてくれる者が誰もいない状態',level:'standard'},
  {id:1186,type:'write',kanji:'才色兼備',reading:'さいしょくけんび',example:'{さいしょくけんび}の彼女は多くの人から尊敬された。',meaning:'才能と美貌の両方を兼ね備えていること',level:'standard'},
  {id:1187,type:'write',kanji:'天変地異',reading:'てんぺんちい',example:'{てんぺんちい}が続き、人々の危機感が高まった。',meaning:'自然界に起きる大きな変動・災害',level:'standard'},
  {id:1188,type:'write',kanji:'自由奔放',reading:'じゆうほんぽう',example:'{じゆうほんぽう}な発想が革新的な作品を生み出した。',meaning:'規則や習慣にとらわれず自由に行動すること',level:'standard'},
  {id:1189,type:'write',kanji:'岡目八目',reading:'おかめはちもく',example:'{おかめはちもく}で、当事者より第三者のほうが正確に見えることがある。',meaning:'第三者のほうが物事を正確に見られること',level:'standard'},
  {id:1190,type:'write',kanji:'一意専心',reading:'いちいせんしん',example:'雑念を捨て{いちいせんしん}で目標に取り組んだ。',meaning:'一つのことだけに心を向けて集中すること',level:'standard'},

  // ════ 書き問題 ── 四字熟語・発展 ════
  {id:1191,type:'write',kanji:'二律背反',reading:'にりつはいはん',example:'この問題は{にりつはいはん}の構造を持ち、どちらも正しい。',meaning:'二つの命題が互いに矛盾して両立しないこと',level:'advanced'},
  {id:1192,type:'write',kanji:'換骨奪胎',reading:'かんこつだったい',example:'古典作品を現代的に{かんこつだったい}して新しい表現を生み出した。',meaning:'先人の作品の骨格を借りて独自の表現を作ること',level:'advanced'},
  {id:1193,type:'write',kanji:'隔靴搔痒',reading:'かっかそうよう',example:'核心に触れない説明では{かっかそうよう}の感が拭えない。',meaning:'もどかしくて思い通りにならないこと',level:'advanced'},
  {id:1194,type:'write',kanji:'傍若無人',reading:'ぼうじゃくぶじん',example:'{ぼうじゃくぶじん}な振る舞いが周囲を不快にさせた。',meaning:'他人を無視して勝手気ままに振る舞うこと',level:'advanced'},
  {id:1195,type:'write',kanji:'画竜点睛',reading:'がりょうてんせい',example:'最後の一言が{がりょうてんせい}となり、スピーチが完成した。',meaning:'物事の最後の仕上げとなる大切な一点',level:'advanced'},
  {id:1196,type:'write',kanji:'羊頭狗肉',reading:'ようとうくにく',example:'立派な看板を掲げながら実態は{ようとうくにく}だった。',meaning:'外見と中身が全く違うこと・看板倒れ',level:'advanced'},
  {id:1197,type:'write',kanji:'百折不撓',reading:'ひゃくせつふとう',example:'{ひゃくせつふとう}の精神で幾多の逆境を乗り越えた。',meaning:'何度挫折しても決してくじけないこと',level:'advanced'},
  {id:1198,type:'write',kanji:'抱腹絶倒',reading:'ほうふくぜっとう',example:'その話は{ほうふくぜっとう}で、笑いが止まらなかった。',meaning:'腹を抱えて倒れるほど大笑いすること',level:'advanced'},
  {id:1199,type:'write',kanji:'佳人薄命',reading:'かじんはくめい',example:'才能豊かな彼女の早世は{かじんはくめい}というほかない。',meaning:'美人や才能ある人は短命であること',level:'advanced'},
  {id:1200,type:'write',kanji:'唯我独尊',reading:'ゆいがどくそん',example:'{ゆいがどくそん}の態度では他者との協調は難しい。',meaning:'自分だけが優れていると思い込んで傲慢なこと',level:'advanced'},
];

// =====================================================
// DIFFICULTY & TYPE MAPS
// =====================================================
const QUESTION_LEVELS = {};
const LEVEL_LABEL = {basic:'基礎',standard:'標準',advanced:'発展'};
const LEVEL_COLOR = {basic:'var(--sage)',standard:'var(--gold)',advanced:'var(--vermilion)'};
allQuestions.forEach(q => { QUESTION_LEVELS[q.id] = q.level; });

function levelBadge(id) {
  const lv = QUESTION_LEVELS[id] || 'standard';
  return `<span style="color:${LEVEL_COLOR[lv]};font-weight:600;font-size:10px;">[${LEVEL_LABEL[lv]}]</span>`;
}

// =====================================================
// STATE
// =====================================================
const STORAGE_KEY = 'kanji-study-kota-v1';
let appState = { missIds:[], accuracy:{}, sessionCorrect:0, sessionWrong:0 };
let quiz = { questions:[], index:0, correct:0, wrong:0, mode:'all' };

function loadState() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) appState = JSON.parse(s);
  } catch(e) {}
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

// =====================================================
// SCREEN
// =====================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function goHome() {
  showScreen('home');
  renderStats();
  renderMissList();
  updateHeader();
}

// =====================================================
// HEADER
// =====================================================
function updateHeader() {
  document.getElementById('stat-correct').textContent = appState.sessionCorrect;
  document.getElementById('stat-wrong').textContent = appState.sessionWrong;
  document.getElementById('stat-miss').textContent = appState.missIds.length;
}

// =====================================================
// STATS
// =====================================================
function renderStats() {
  const container = document.getElementById('type-stats-list');
  container.innerHTML = '';
  const types = [
    {key:'read', label:'読み問題'},
    {key:'write', label:'書き問題'},
  ];
  let hasData = false;

  types.forEach(({key, label}) => {
    const acc = appState.accuracy[key];
    if (!acc || acc.total === 0) return;
    hasData = true;
    const pct = Math.round(acc.correct / acc.total * 100);
    const color = pct >= 80 ? 'var(--sage)' : pct >= 50 ? 'var(--gold)' : 'var(--vermilion)';
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <span class="stat-name">${label}</span>
      <div class="stat-bar-wrap"><div class="stat-bar" style="width:${pct}%;background:${color}"></div></div>
      <span class="stat-pct" style="color:${color}">${pct}%</span>
      <span class="stat-detail">${acc.correct}/${acc.total}</span>
    `;
    container.appendChild(row);
  });

  if (!hasData) {
    container.innerHTML = '<div class="empty-msg" style="padding:12px;font-size:12px;">まだデータがありません</div>';
  }
}

function renderMissList() {
  const container = document.getElementById('home-miss-list');
  const badge = document.getElementById('miss-badge');
  badge.textContent = appState.missIds.length + '問';

  if (appState.missIds.length === 0) {
    container.innerHTML = '<div class="empty-msg">まだ間違えた問題はありません</div>';
    return;
  }

  container.innerHTML = '';
  appState.missIds.slice(0, 10).forEach(id => {
    const q = allQuestions.find(q => q.id === id);
    if (!q) return;
    const item = document.createElement('div');
    item.className = 'miss-item';
    item.innerHTML = `
      <div class="miss-item-q">${q.type === 'read' ? '読み' : '書き'} 「${q.kanji}」</div>
      <div class="miss-item-a">${q.type === 'read' ? q.reading : q.kanji}</div>
    `;
    container.appendChild(item);
  });
  if (appState.missIds.length > 10) {
    const more = document.createElement('div');
    more.className = 'empty-msg';
    more.style.fontSize = '11px';
    more.textContent = `他 ${appState.missIds.length - 10} 問`;
    container.appendChild(more);
  }
}

// =====================================================
// SHUFFLE
// =====================================================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// =====================================================
// START MODE
// =====================================================
function startMode(mode) {
  let questions;

  if (mode === 'all-read') {
    questions = shuffle(allQuestions.filter(q => q.type === 'read'));
  } else if (mode === 'all-write') {
    questions = shuffle(allQuestions.filter(q => q.type === 'write'));
  } else if (mode === 'shuffle') {
    questions = shuffle([...allQuestions]).slice(0, 30);
  } else if (mode === 'miss') {
    questions = allQuestions.filter(q => appState.missIds.includes(q.id));
    if (questions.length === 0) {
      alert('間違えた問題がありません！先に問題を解いてみよう！');
      return;
    }
    questions = shuffle(questions);
  } else if (mode === 'level-basic') {
    questions = shuffle(allQuestions.filter(q => q.level === 'basic'));
  } else if (mode === 'level-standard') {
    questions = shuffle(allQuestions.filter(q => q.level === 'standard'));
  } else if (mode === 'level-advanced') {
    questions = shuffle(allQuestions.filter(q => q.level === 'advanced'));
  }

  quiz.questions = questions;
  quiz.index = 0;
  quiz.correct = 0;
  quiz.wrong = 0;
  quiz.mode = mode;

  showScreen('quiz');
  showQuestion();
}

function retryMode() { startMode(quiz.mode); }

// =====================================================
// QUESTION DISPLAY
// =====================================================
function buildQuestionText(q) {
  const highlighted = q.example.replace(/\{(.+?)\}/g, (_, word) => {
    if (q.type === 'read') {
      return `<span class="target-word">${word}</span>`;
    } else {
      return `<span class="target-reading">（${q.reading}）</span>`;
    }
  });
  return highlighted;
}

function showQuestion() {
  if (quiz.index >= quiz.questions.length) {
    showResult();
    return;
  }

  const q = quiz.questions[quiz.index];
  const total = quiz.questions.length;
  const pct = Math.round(quiz.index / total * 100);

  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent = `${quiz.index + 1}/${total}`;

  const typeLabel = q.type === 'read' ? '読み' : '書き';
  const prompt = q.type === 'read' ? '太字の読み方は？' : '（　）に入る漢字は？';

  document.getElementById('quiz-area').innerHTML = `
    <div class="q-card">
      <div class="q-category">${typeLabel}問題 &nbsp;${levelBadge(q.id)}</div>
      <div class="q-prompt">${prompt}</div>
      <div class="q-sentence">${buildQuestionText(q)}</div>
      <div class="answer-btns">
        <button class="ans-btn know" onclick="answer(true)">
          <span class="btn-icon">⭕</span>わかる
        </button>
        <button class="ans-btn dontknow" onclick="answer(false)">
          <span class="btn-icon">❌</span>わからない
        </button>
      </div>
    </div>
  `;
}

// =====================================================
// ANSWER
// =====================================================
function answer(knew) {
  const q = quiz.questions[quiz.index];
  const typeKey = q.type;

  if (!appState.accuracy[typeKey]) appState.accuracy[typeKey] = {correct:0, wrong:0, total:0};
  appState.accuracy[typeKey].total++;

  if (knew) {
    quiz.correct++;
    appState.sessionCorrect++;
    appState.missIds = appState.missIds.filter(id => id !== q.id);
    appState.accuracy[typeKey].correct++;
  } else {
    quiz.wrong++;
    appState.sessionWrong++;
    if (!appState.missIds.includes(q.id)) appState.missIds.push(q.id);
  }

  saveState();
  showReveal(q, knew);
}

function showReveal(q, knew) {
  const headerClass = knew ? 'correct-header' : 'wrong-header';
  const mark = knew ? '⭕' : '❌';
  const status = knew ? '正解！' : '不正解';
  const reviseBtn = !knew
    ? `<button class="revise-btn" id="revise-btn" onclick="markRevised()">✓ 理解できた（復習リストから外す）</button>`
    : '';

  const typeLabel = q.type === 'read' ? '読み方' : '漢字';
  const answerText = q.type === 'read' ? q.reading : q.kanji;

  document.getElementById('quiz-area').innerHTML = `
    <div class="q-card">
      <div class="q-category">${q.type === 'read' ? '読み' : '書き'}問題 &nbsp;${levelBadge(q.id)}</div>
      <div class="q-sentence">${buildQuestionText(q)}</div>
    </div>
    <div class="reveal-panel">
      <div class="reveal-header ${headerClass}">
        <span class="reveal-mark">${mark}</span>
        <span class="reveal-status">${status}</span>
      </div>
      <div class="reveal-body">
        <div class="answer-label">${typeLabel}</div>
        <div class="answer-text">${answerText}</div>
        <div class="kanji-info">
          <span class="kanji-big">${q.kanji}</span>
          <span class="reading-small">${q.reading}</span>
        </div>
        ${q.meaning ? `<div class="explanation">意味：${q.meaning}</div>` : ''}
      </div>
    </div>
    ${reviseBtn}
    <button class="next-btn" onclick="nextQuestion()">次の問題へ →</button>
  `;
}

function markRevised() {
  const q = quiz.questions[quiz.index];
  appState.missIds = appState.missIds.filter(id => id !== q.id);
  saveState();
  document.getElementById('revise-btn').textContent = '✓ 復習リストから外しました';
  document.getElementById('revise-btn').disabled = true;
  document.getElementById('revise-btn').style.opacity = '0.5';
}

function nextQuestion() {
  quiz.index++;
  showQuestion();
}

// =====================================================
// RESULT
// =====================================================
function showResult() {
  showScreen('result');
  const total = quiz.questions.length;
  const pct = total > 0 ? Math.round(quiz.correct / total * 100) : 0;

  let msg = '';
  if (pct === 100) msg = '完璧です！素晴らしい！';
  else if (pct >= 80) msg = 'よくできました！';
  else if (pct >= 60) msg = 'もう少し！復習してみよう。';
  else msg = '復習モードで練習しよう！';

  document.getElementById('result-big').textContent = quiz.correct;
  document.getElementById('result-denom').textContent = `/ ${total} 問正解　（${pct}%）`;
  document.getElementById('result-msg').textContent = msg;

  updateHeader();

  const missBtn = document.getElementById('result-miss-btn');
  if (missBtn) {
    missBtn.style.display = appState.missIds.length > 0 ? 'block' : 'none';
  }
}

// =====================================================
// INIT
// =====================================================
loadState();
goHome();
