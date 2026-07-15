// ================================================================
//  VBA Syntax Visualizer ― 構造可視化ツール
//  カーソル行の構文を左パネルで解説し、スニペットを挿入できるエディタ。
//  ブラウザ内でVBAは実行できないため「▶ 実行」の代わりに静的チェックを行う。
// ================================================================

// ----------------------------------------------------------------
//  トークナイザー（シンタックスハイライト）
//  ※VBAは文字列・コメントが行内で完結する（複数行コメント/正規表現リテラルなし）
// ----------------------------------------------------------------
const KEYWORDS = new Set([
  'dim','redim','preserve','set','let','const','static','public','private','friend','global',
  'sub','function','property','end','exit','get',
  'if','then','else','elseif',
  'for','each','next','to','step','in',
  'do','loop','while','until','wend',
  'with','select','case',
  'type','enum',
  'on','error','resume','goto','gosub','return',
  'call','new','as','byval','byref','optional','paramarray',
  'declare','lib','alias','ptrsafe',
  'option','explicit','base','compare','module','text','binary',
  'stop','erase','implements','event','raiseevent','withevents','attribute','spc','tab'
]);
const KEYWORDS2 = new Set(['and','or','not','xor','eqv','imp','mod','is','like','typeof','addressof']);
const ATOMS = new Set(['true','false','nothing','null','empty']);
const TYPES = new Set([
  'boolean','byte','integer','long','longlong','longptr','single','double','currency','decimal',
  'date','string','object','variant','any',
  'worksheet','workbook','workbooks','worksheets','range','application','collection','dictionary',
  'chart','recordset','connection','filesystemobject','textstream','shape','pivottable','listobject',
  'querytable','comment','name','window','sheets'
]);

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// コードをハイライト済みHTMLへ変換する。
// markStarts: 強調したいトークンの絶対開始位置（Set）。ブロック対応ハイライトに使う。
function highlightVba(code, markStarts = null) {
  let html = '';
  let i = 0;
  const n = code.length;
  let last = null; // 直前の意味のあるトークン

  const emit = (type, value, start) => {
    const esc = escapeHtml(value);
    const marked = markStarts && markStarts.has(start);
    if (type === 'plain') {
      html += marked ? `<span class="block-match">${esc}</span>` : esc;
    } else {
      html += `<span class="tok-${type}${marked ? ' block-match' : ''}">${esc}</span>`;
    }
    if (value.trim() !== '') last = { type, value: value.toLowerCase(), raw: value };
  };

  while (i < n) {
    const c = code[i];
    const start = i;

    // 行コメント（'）
    if (c === "'") {
      let j = i + 1;
      while (j < n && code[j] !== '\n') j++;
      emit('comment', code.slice(i, j), start);
      i = j; continue;
    }

    // 文字列（" 内の "" はエスケープ）
    if (c === '"') {
      let j = i + 1;
      while (j < n) {
        if (code[j] === '"' && code[j + 1] === '"') { j += 2; continue; }
        if (code[j] === '"') { j++; break; }
        if (code[j] === '\n') break;
        j++;
      }
      emit('string', code.slice(i, j), start);
      i = j; continue;
    }

    // # ― コンパイラディレクティブ（#If など）または日付リテラル（#2024/1/1#）
    if (c === '#') {
      if (/[A-Za-z]/.test(code[i + 1] ?? '')) {
        let j = i + 1;
        while (j < n && /[A-Za-z]/.test(code[j])) j++;
        emit('directive', code.slice(i, j), start);
        i = j; continue;
      }
      let j = i + 1;
      while (j < n && code[j] !== '#' && code[j] !== '\n') j++;
      if (j < n && code[j] === '#') { j++; emit('number', code.slice(i, j), start); i = j; continue; }
      emit('plain', c, start); i++; continue;
    }

    // &H / &O 16進・8進数
    if (c === '&' && /[hHoO]/.test(code[i + 1] ?? '')) {
      let j = i + 2;
      while (j < n && /[0-9A-Fa-f]/.test(code[j])) j++;
      if (j < n && code[j] === '&') j++;
      emit('number', code.slice(i, j), start);
      i = j; continue;
    }

    // 数値
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(code[i + 1] ?? ''))) {
      let j = i;
      while (j < n && /[0-9]/.test(code[j])) j++;
      if (j < n && code[j] === '.') { j++; while (j < n && /[0-9]/.test(code[j])) j++; }
      if (j < n && /[eEdD]/.test(code[j]) && /[0-9+\-]/.test(code[j + 1] ?? '')) {
        j++; if (/[+\-]/.test(code[j])) j++; while (j < n && /[0-9]/.test(code[j])) j++;
      }
      if (j < n && /[%&!#@]/.test(code[j])) j++; // 型宣言文字
      emit('number', code.slice(i, j), start);
      i = j; continue;
    }

    // 識別子・キーワード
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);
      const wl = word.toLowerCase();

      // Rem コメント
      if (wl === 'rem') {
        let e = j;
        while (e < n && code[e] !== '\n') e++;
        emit('comment', code.slice(i, e), start);
        i = e; continue;
      }

      let k = j;
      while (k < n && (code[k] === ' ' || code[k] === '\t')) k++;
      const isCall = code[k] === '(';
      const afterDot = last && last.raw === '.';
      const afterAsNew = last && last.type === 'keyword' && (last.value === 'as' || last.value === 'new');

      let type;
      if (wl === 'me')                              type = 'this';
      else if (ATOMS.has(wl) || /^(vb|xl|mso)[a-z0-9]/i.test(word)) type = 'atom';
      else if (KEYWORDS2.has(wl))                   type = 'keyword2';
      else if (KEYWORDS.has(wl))                    type = 'keyword';
      else if (afterAsNew)                          type = 'type';
      else if (TYPES.has(wl))                       type = 'type';
      else if (afterDot)                            type = isCall ? 'function' : 'property';
      else if (isCall)                              type = 'function';
      else                                          type = 'identifier';

      emit(type, word, start);
      i = j; continue;
    }

    // その他（演算子・記号・空白）
    emit('plain', c, start);
    i++;
  }
  return html;
}

// ----------------------------------------------------------------
//  ブロックスキャナー（If〜End If, For〜Next などの対応検出）
//  行単位で解析する（1文＝1行を前提。行継続 _ は考慮しない）
// ----------------------------------------------------------------
// 文字列とコメントを同じ長さの空白へ置換し、オフセットを保ったまま解析する
function stripForScan(line) {
  let out = '';
  let i = 0;
  const n = line.length;
  let inStr = false;
  while (i < n) {
    const c = line[i];
    if (inStr) {
      out += (c === '"') ? '"' : ' ';
      if (c === '"') inStr = false;
      i++; continue;
    }
    if (c === '"') { inStr = true; out += '"'; i++; continue; }
    if (c === "'") { while (i < n) { out += ' '; i++; } break; }
    out += c; i++;
  }
  return out;
}

const BTYPE_OPEN_LABEL = {
  proc: 'Sub/Function', if: 'If', for: 'For', do: 'Do', while: 'While',
  with: 'With', select: 'Select Case', type: 'Type', enum: 'Enum'
};
const BTYPE_CLOSE_LABEL = {
  proc: 'End Sub/Function', if: 'End If', for: 'Next', do: 'Loop', while: 'Wend',
  with: 'End With', select: 'End Select', type: 'End Type', enum: 'End Enum'
};

// 1行を分類する。role: open / close / mid / none、btype: ブロック種別、kwIndex: 強調キーワードの行内位置
function classifyLine(s) {
  let m;
  // ---- 終了（先に判定して End If などを If と誤認しない）----
  if ((m = /^(\s*)End\s+(Sub|Function|Property|If|With|Select|Type|Enum)\b/i.exec(s))) {
    const t = m[2].toLowerCase();
    const btype = (t === 'sub' || t === 'function' || t === 'property') ? 'proc' : t;
    return { role: 'close', btype, kwIndex: m[1].length };
  }
  if ((m = /^(\s*)Next\b/i.exec(s)))  return { role: 'close', btype: 'for',   kwIndex: m[1].length };
  if ((m = /^(\s*)Loop\b/i.exec(s)))  return { role: 'close', btype: 'do',    kwIndex: m[1].length };
  if ((m = /^(\s*)Wend\b/i.exec(s)))  return { role: 'close', btype: 'while', kwIndex: m[1].length };

  // ---- 中間（Else / ElseIf / Case）----
  if ((m = /^(\s*)ElseIf\b/i.exec(s))) return { role: 'mid', btype: 'if',     kwIndex: m[1].length };
  if ((m = /^(\s*)Else\b/i.exec(s)))   return { role: 'mid', btype: 'if',     kwIndex: m[1].length };
  if ((m = /^(\s*)Case\b/i.exec(s)))   return { role: 'mid', btype: 'select', kwIndex: m[1].length };

  // ---- 開始 ----
  if ((m = /^(\s*(?:(?:Public|Private|Friend|Static|Global)\s+)*)(Sub|Function|Property)\b/i.exec(s)))
    return { role: 'open', btype: 'proc',   kwIndex: m[1].length };
  if ((m = /^(\s*)For\b/i.exec(s)))    return { role: 'open', btype: 'for',   kwIndex: m[1].length };
  if ((m = /^(\s*)Do\b/i.exec(s)))     return { role: 'open', btype: 'do',    kwIndex: m[1].length };
  if ((m = /^(\s*)While\b/i.exec(s)))  return { role: 'open', btype: 'while', kwIndex: m[1].length };
  if ((m = /^(\s*)With\b/i.exec(s)))   return { role: 'open', btype: 'with',  kwIndex: m[1].length };
  if ((m = /^(\s*)Select\s+Case\b/i.exec(s))) return { role: 'open', btype: 'select', kwIndex: m[1].length };
  if ((m = /^(\s*(?:(?:Public|Private)\s+)*)(Type)\b/i.exec(s))) return { role: 'open', btype: 'type', kwIndex: m[1].length };
  if ((m = /^(\s*(?:(?:Public|Private)\s+)*)(Enum)\b/i.exec(s))) return { role: 'open', btype: 'enum', kwIndex: m[1].length };
  // ブロック If（末尾が Then。単一行 If は対象外）
  if (/^\s*If\b/i.test(s) && /\bThen\s*$/i.test(s)) {
    m = /^(\s*)If\b/i.exec(s);
    return { role: 'open', btype: 'if', kwIndex: m[1].length };
  }
  return { role: 'none' };
}

function scanBlocks(code) {
  const lines = code.split('\n');
  let offset = 0;
  const stack = [];
  const groups = [];
  let error = null;

  for (let ln = 0; ln < lines.length; ln++) {
    const raw = lines[ln];
    const info = classifyLine(stripForScan(raw));
    const lineStart = offset;
    offset += raw.length + 1; // +改行

    if (info.role === 'open') {
      stack.push({ btype: info.btype, kwAbs: lineStart + info.kwIndex, lineNo: ln, mids: [], midLines: [] });
    } else if (info.role === 'mid') {
      const top = stack[stack.length - 1];
      if (top && top.btype === info.btype) {
        top.mids.push(lineStart + info.kwIndex);
        top.midLines.push(ln);
      }
    } else if (info.role === 'close') {
      const top = stack.pop();
      if (!top) {
        if (!error) error = { line: ln + 1, message: `${ln + 1}行目: ${BTYPE_CLOSE_LABEL[info.btype]} に対応する開始行がありません` };
      } else if (top.btype !== info.btype) {
        if (!error) error = { line: ln + 1, message: `${ln + 1}行目: ${BTYPE_CLOSE_LABEL[info.btype]} と ${BTYPE_OPEN_LABEL[top.btype]}（${top.lineNo + 1}行目）が対応していません` };
      } else {
        groups.push({
          offsets: new Set([top.kwAbs, lineStart + info.kwIndex, ...top.mids]),
          lines: new Set([top.lineNo, ln, ...top.midLines]),
        });
      }
    }
  }

  if (!error && stack.length > 0) {
    const top = stack[stack.length - 1];
    error = { line: top.lineNo + 1, message: `${top.lineNo + 1}行目: ${BTYPE_OPEN_LABEL[top.btype]} が ${BTYPE_CLOSE_LABEL[top.btype]} で閉じられていません` };
  }
  return { groups, error };
}

// スキャン結果はコードが変わるまでキャッシュする
let scanCache = { code: null, result: null };
function getScan() {
  if (scanCache.code !== textarea.value) {
    scanCache = { code: textarea.value, result: scanBlocks(textarea.value) };
  }
  return scanCache.result;
}

// ----------------------------------------------------------------
//  行解説ルール（カーソル行を上から順にマッチング）
// ----------------------------------------------------------------
const LINE_RULES = [
  { re: /^\s*'/,                       cat: 'コメント',
    desc: "アポストロフィ（'）以降が行末までコメントになります。実行には影響しません。" },
  { re: /^\s*Rem\b/i,                  cat: 'コメント（Rem）',
    desc: "Rem ステートメントによるコメントです。' と同じく実行されません。" },
  { re: /^\s*Option\s+Explicit/i,      cat: 'Option Explicit',
    desc: 'すべての変数に宣言（Dim など）を必須にします。タイプミスによるバグを防ぐため、モジュール先頭に必ず書くのが推奨です。' },
  { re: /^\s*Option\s+/i,              cat: 'Option ステートメント',
    desc: 'モジュールの動作を指定します（Explicit / Compare Text / Base 1 など）。宣言セクションの先頭に書きます。' },
  { re: /^\s*(Public|Private|Friend|Static|Global)?\s*Sub\b/i, cat: 'Sub プロシージャ',
    desc: '値を返さない手続きを定義します。End Sub までが処理範囲です。マクロとして実行できるのは引数なしの Sub です。' },
  { re: /^\s*(Public|Private|Friend|Static)?\s*Function\b/i,   cat: 'Function プロシージャ',
    desc: '値を返す関数を定義します。「関数名 = 値」で戻り値を設定します。ワークシート関数としても呼べます。' },
  { re: /^\s*(Public|Private)?\s*Property\s+(Get|Let|Set)\b/i, cat: 'Property プロシージャ',
    desc: 'クラスモジュールのプロパティを定義します。Get は取得、Let は値の設定、Set はオブジェクトの設定に使います。' },
  { re: /^\s*End\s+(Sub|Function|Property)\b/i, cat: 'プロシージャの終端',
    desc: 'プロシージャの終わりです。ここで呼び出し元へ処理が戻ります。' },
  { re: /^\s*Exit\s+(Sub|Function|Property|For|Do)\b/i, cat: 'Exit ステートメント',
    desc: '現在のプロシージャやループを途中で抜けます。条件付きの早期終了に使います。' },
  { re: /^\s*Declare\b/i,              cat: 'Declare（API宣言）',
    desc: 'Windows API など外部DLLの関数を宣言します。64bit環境では「Declare PtrSafe」とし、ハンドル等は LongPtr を使います。' },
  { re: /^\s*Dim\b/i,                  cat: '変数宣言（Dim）',
    desc: '変数を宣言します。「Dim 変数名 As 型」の形で型を指定します。As を省略すると Variant 型になります。' },
  { re: /^\s*ReDim\b/i,                cat: '動的配列の再定義（ReDim）',
    desc: '動的配列の要素数を変更します。Preserve を付けると既存の値を保持したままサイズ変更できます。' },
  { re: /^\s*Const\b/i,                cat: '定数宣言（Const）',
    desc: '変更できない定数を宣言します。「Const 名 As 型 = 値」の形です。マジックナンバーを避けるのに有効です。' },
  { re: /^\s*Static\b/i,               cat: 'Static 変数',
    desc: 'プロシージャを抜けても値を保持し続ける変数を宣言します。呼び出し間で状態を覚えておきたいときに使います。' },
  { re: /^\s*(Public|Private|Global)\b.*\bAs\b/i, cat: 'モジュール変数の宣言',
    desc: 'モジュールレベルの変数を宣言します。Public はブック全体、Private はそのモジュール内で有効です。' },
  { re: /^\s*Set\b/i,                  cat: 'オブジェクトの代入（Set）',
    desc: 'オブジェクト（Range / Worksheet / Collection など）を変数に代入します。オブジェクトの代入には必ず Set が必要です。' },
  { re: /^\s*If\b.*\bThen\s*\S/i,      cat: '単一行 If',
    desc: '1行で完結する If です。「If 条件 Then 実行文」の形で、End If は不要です。' },
  { re: /^\s*If\b.*\bThen\s*('|$)/i,   cat: 'If ブロック',
    desc: '条件が True のときにブロック内を実行します。End If まで続き、ElseIf / Else で分岐を追加できます。' },
  { re: /^\s*ElseIf\b/i,               cat: 'ElseIf 節',
    desc: '直前の条件が False のとき、別の条件を追加で判定します。末尾に Then が必要です。' },
  { re: /^\s*Else\b/i,                 cat: 'Else 節',
    desc: 'どの条件にも当てはまらなかったときに実行されるブロックです。' },
  { re: /^\s*End\s+If\b/i,             cat: 'If ブロックの終端',
    desc: 'If ブロックの終わりです。対応する If と釣り合っている必要があります。' },
  { re: /^\s*For\s+Each\b/i,           cat: 'For Each ループ',
    desc: 'コレクションや配列の各要素を順に取り出して繰り返します。「For Each 変数 In コレクション」の形です。' },
  { re: /^\s*For\b/i,                  cat: 'For ループ',
    desc: '開始値から終了値まで回数を決めて繰り返します。「For i = 1 To 10 [Step 2]」の形で、Next で戻ります。' },
  { re: /^\s*Next\b/i,                 cat: 'Next（ループ末尾）',
    desc: 'For ループの末尾です。カウンタを進めて For に戻ります。「Next i」のように変数名を書くと対応が明確です。' },
  { re: /^\s*Do\b/i,                   cat: 'Do ループ',
    desc: '条件付きの繰り返しです。「Do While 条件」「Do Until 条件」で開始判定に、条件を Loop 側に書くと最低1回は実行されます。' },
  { re: /^\s*Loop\b/i,                 cat: 'Loop（Do の末尾）',
    desc: 'Do ループの末尾です。「Loop While 条件」「Loop Until 条件」で末尾条件を指定できます。' },
  { re: /^\s*While\b/i,                cat: 'While ループ',
    desc: '条件が True の間繰り返します。Wend で終わります（現在は Do...Loop の使用が推奨されます）。' },
  { re: /^\s*Wend\b/i,                 cat: 'Wend（While の末尾）',
    desc: 'While ループの末尾です。' },
  { re: /^\s*With\b/i,                 cat: 'With ブロック',
    desc: '同じオブジェクトへの操作をまとめます。ブロック内では先頭のドット（.Value など）で参照でき、高速で読みやすくなります。' },
  { re: /^\s*End\s+With\b/i,           cat: 'With ブロックの終端',
    desc: 'With ブロックの終わりです。' },
  { re: /^\s*Select\s+Case\b/i,        cat: 'Select Case 文',
    desc: '1つの値を複数の Case で分岐します。多岐にわたる If...ElseIf より読みやすくなります。End Select まで続きます。' },
  { re: /^\s*Case\b/i,                 cat: 'Case 節',
    desc: 'Select Case の分岐条件です。「Case 1, 2」「Case Is >= 100」「Case Else」などが書けます。' },
  { re: /^\s*End\s+Select\b/i,         cat: 'Select Case の終端',
    desc: 'Select Case ブロックの終わりです。' },
  { re: /^\s*On\s+Error\s+Resume\s+Next\b/i, cat: 'エラー無視（On Error Resume Next）',
    desc: 'エラーが起きても次の行へ進みます。握りつぶすと不具合の原因になるため、必要な範囲に限定し、後で On Error GoTo 0 に戻します。' },
  { re: /^\s*On\s+Error\s+GoTo\s+0\b/i, cat: 'エラー処理の解除',
    desc: 'それまでのエラー処理を無効化し、通常のエラー動作（実行時エラーで停止）に戻します。' },
  { re: /^\s*On\s+Error\b/i,           cat: 'エラー処理の設定（On Error）',
    desc: '実行時エラーが起きたときのジャンプ先を指定します。「On Error GoTo ラベル」でエラーハンドラへ飛ばします。' },
  { re: /^\s*Resume\b/i,               cat: 'Resume ステートメント',
    desc: 'エラーハンドラから処理を再開します。Resume Next で次の行、Resume ラベル で指定位置へ戻ります。' },
  { re: /^\s*Call\b/i,                 cat: 'Call（プロシージャ呼び出し）',
    desc: '別の Sub を呼び出します。Call は省略可能ですが、引数を括弧で囲むときは付けると明確です。' },
  { re: /\.End\s*\(\s*xl/i,            cat: '終端セルの取得（End）',
    desc: 'Ctrl+方向キー相当でデータの終端セルを取得します。「Cells(Rows.Count, 1).End(xlUp).Row」は最終行取得の定番です。' },
  { re: /^\s*(MsgBox|Debug\.Print|Debug\.Assert)\b/i, cat: '出力・デバッグ',
    desc: 'MsgBox はメッセージ表示、Debug.Print はイミディエイトウィンドウへの出力です。動作確認やデバッグに使います。' },
  { re: /^\s*[A-Za-z_]\w*\s*=/,        cat: '代入 / 比較',
    desc: 'VBA では「=」は代入と比較の両方に使われます。文の先頭にあれば代入、If の条件内にあれば比較です。' },
  { re: /^\s*[A-Za-z_]\w*:\s*$/,       cat: 'ラベル（ジャンプ先）',
    desc: 'GoTo / Resume の飛び先ラベルです。エラーハンドラの目印としてよく使われます。' },
];

function findLineRule(line) {
  const t = line.trim();
  if (!t) return null;
  const clean = stripForScan(line); // コメント/文字列を除いて判定
  for (const rule of LINE_RULES) {
    if (rule.re.test(rule.re.source.includes("'") ? line : clean)) return rule;
  }
  return { cat: '式・ステートメント', desc: '代入や式などの一般的な行です。行を選ぶと構文の説明がここに表示されます。' };
}

// ----------------------------------------------------------------
//  選択範囲の解説辞書（キーワード / 関数・オブジェクト）
// ----------------------------------------------------------------
const EXP_KW = {
  'dim':      { title: 'Dim', body: '変数を宣言します。1つの Dim で複数宣言もできますが、各変数に As を付けないと Variant になります。', syntax: 'Dim i As Long\nDim ws As Worksheet, s As String' },
  'redim':    { title: 'ReDim', body: '動的配列（Dim arr() で宣言）の要素数を実行時に決めます。Preserve で既存の値を保持します。', syntax: 'ReDim arr(1 To 10)\nReDim Preserve arr(1 To 20)' },
  'const':    { title: 'Const', body: '変更できない定数を宣言します。マジックナンバーや固定文字列に名前を付けて可読性を上げます。', syntax: 'Const MAX_ROW As Long = 1000\nConst TITLE As String = "月次集計"' },
  'set':      { title: 'Set', body: 'オブジェクト参照を変数に代入します。Range / Worksheet / Collection などオブジェクトの代入には必須です。解放は「Set x = Nothing」。', syntax: 'Dim ws As Worksheet\nSet ws = ThisWorkbook.Worksheets("Sheet1")' },
  'sub':      { title: 'Sub', body: '値を返さない手続きを定義します。End Sub までが範囲。引数なしの Sub はマクロとして直接実行できます。', syntax: 'Sub 実行()\n    ' + "'" + ' 処理\nEnd Sub' },
  'function': { title: 'Function', body: '値を返す関数を定義します。「関数名 = 戻り値」で結果を返します。ワークシートのセルからも呼べます。', syntax: 'Function 税込(x As Double) As Double\n    税込 = x * 1.1\nEnd Function' },
  'property': { title: 'Property', body: 'クラスモジュールのプロパティを定義します。Get（取得）/ Let（値設定）/ Set（オブジェクト設定）の3種類があります。', syntax: 'Property Get 名前() As String\n    名前 = m_Name\nEnd Property' },
  'if':       { title: 'If ... Then', body: '条件分岐です。ブロック形式は End If まで、単一行形式は「If 条件 Then 文」で完結します。', syntax: 'If x >= 100 Then\n    ' + "'" + ' 真\nElseIf x >= 50 Then\n    ' + "'" + ' 他\nElse\n    ' + "'" + ' 偽\nEnd If' },
  'else':     { title: 'Else', body: 'If のどの条件にも一致しなかったときのブロックです。', syntax: 'If 条件 Then\n    ' + "'" + ' ...\nElse\n    ' + "'" + ' それ以外\nEnd If' },
  'elseif':   { title: 'ElseIf', body: '別の条件を追加で判定します。末尾に Then が必要です。', syntax: 'If a Then\nElseIf b Then\nEnd If' },
  'for':      { title: 'For ... Next', body: '回数を決めた繰り返しです。Step で増分（負の値で逆順）を指定できます。', syntax: 'For i = 1 To 10 Step 2\n    Debug.Print i\nNext i' },
  'each':     { title: 'For Each', body: 'コレクションや配列の各要素を順に処理します。インデックス不要のときに便利です。', syntax: 'For Each ws In ThisWorkbook.Worksheets\n    Debug.Print ws.Name\nNext ws' },
  'do':       { title: 'Do ... Loop', body: '条件付きの繰り返しです。条件を Do 側に書くと開始時、Loop 側に書くと最低1回実行してから判定します。', syntax: 'Do While Cells(i, 1).Value <> ""\n    i = i + 1\nLoop' },
  'while':    { title: 'While ... Wend', body: '条件が True の間の繰り返しです。現在は Do...Loop が推奨されます。', syntax: 'While i <= 10\n    i = i + 1\nWend' },
  'with':     { title: 'With ブロック', body: '同じオブジェクトへの複数操作をまとめます。ブロック内は先頭のドットで参照でき、高速かつ読みやすくなります。', syntax: 'With ws.Range("A1")\n    .Value = 100\n    .Font.Bold = True\nEnd With' },
  'select':   { title: 'Select Case', body: '1つの値を複数の Case で分岐します。「Case Is >= 100」「Case 1 To 5」「Case Else」などが書けます。', syntax: 'Select Case rank\n    Case "A": p = 100\n    Case "B", "C": p = 50\n    Case Else: p = 0\nEnd Select' },
  'case':     { title: 'Case', body: 'Select Case の分岐条件です。カンマ列挙・範囲(To)・比較(Is) が使えます。', syntax: 'Case Is >= 60\nCase 1 To 10\nCase "x", "y"' },
  'exit':     { title: 'Exit', body: 'プロシージャやループを途中で抜けます。Exit Sub / Exit Function / Exit For / Exit Do。', syntax: 'For i = 1 To n\n    If 見つかった Then Exit For\nNext i' },
  'goto':     { title: 'GoTo', body: '指定ラベルへジャンプします。主にエラーハンドラへの分岐に使い、通常のフロー制御での多用は避けます。', syntax: 'On Error GoTo ErrHandler\n' + "'" + ' ...\nErrHandler:\n    MsgBox Err.Description' },
  'on':       { title: 'On Error', body: '実行時エラー時の動作を指定します。GoTo ラベルでハンドラへ、Resume Next で無視、GoTo 0 で解除します。', syntax: 'On Error GoTo ErrHandler\nOn Error Resume Next\nOn Error GoTo 0' },
  'resume':   { title: 'Resume', body: 'エラーハンドラから処理を再開します。Resume Next は次の行、Resume は同じ行を再試行します。', syntax: 'ErrHandler:\n    Resume Next' },
  'new':      { title: 'New', body: 'クラスのインスタンスを新規生成します。Collection / Dictionary / 自作クラスの生成に使います。', syntax: 'Dim col As New Collection\nSet dic = New Scripting.Dictionary' },
  'byval':    { title: 'ByVal', body: '引数を値渡しにします。呼び出し元の変数は変更されません。既定は ByRef（参照渡し）なので、意図しない書き換えを防ぐには ByVal を明示します。', syntax: 'Sub Calc(ByVal x As Long)' },
  'byref':    { title: 'ByRef', body: '引数を参照渡しにします（既定）。プロシージャ内での変更が呼び出し元にも反映されます。', syntax: 'Sub Swap(ByRef a As Long, ByRef b As Long)' },
  'optional': { title: 'Optional', body: '省略可能な引数を定義します。既定値を指定でき、省略の判定には IsMissing（Variant時）も使えます。', syntax: 'Sub Log(msg As String, Optional lv As Long = 1)' },
  'nothing':  { title: 'Nothing', body: 'オブジェクト変数が何も参照していない状態です。「Set x = Nothing」で解放し、「Is Nothing」で判定します。', syntax: 'If rng Is Nothing Then Exit Sub\nSet obj = Nothing' },
  'me':       { title: 'Me', body: '現在のクラス／フォーム／シートモジュール自身を指します。ワークシートモジュールでは、そのシート自身を表します。', syntax: 'Me.Range("A1").Value = 1' },
  'true':     { title: 'True / False', body: '論理値です。VBA では True は内部的に -1、False は 0 です。比較や条件式の結果として得られます。', syntax: 'Dim ok As Boolean\nok = (score >= 60)' },
  'as':       { title: 'As（型指定）', body: '変数・引数・戻り値の型を指定します。適切な型を指定すると速度・安全性・入力補完が向上します。', syntax: 'Dim n As Long\nFunction f() As String' },
  'and':      { title: 'And / Or / Not', body: '論理演算子です。複数条件の組み合わせに使います（And=かつ、Or=または、Not=否定）。', syntax: 'If a > 0 And b > 0 Then\nIf Not IsEmpty(x) Then' },
  'mod':      { title: 'Mod（剰余）', body: '割り算の余りを求めます。偶数判定（x Mod 2 = 0）などに使います。整数の割り算は「\\」演算子です。', syntax: 'If i Mod 2 = 0 Then ' + "'" + ' 偶数' },
  'is':       { title: 'Is（参照比較）', body: '2つのオブジェクトが同一か、または Nothing かを判定します。オブジェクトの比較に = は使えません。', syntax: 'If rng Is Nothing Then' },
  'like':     { title: 'Like（パターン一致）', body: 'ワイルドカードで文字列の一致を判定します（* 任意, ? 1文字, # 数字, [ ] 文字クラス）。', syntax: 'If s Like "A*" Then\nIf code Like "##-####" Then' },
};

const EXP_FUNCS = {
  'range':      { title: 'Range', body: 'セル範囲を参照します。文字列でアドレス指定します。単一セルにも範囲にも使えます。', syntax: 'ws.Range("A1").Value = 100\nws.Range("A1:C10").ClearContents' },
  'cells':      { title: 'Cells', body: '行番号・列番号でセルを参照します。ループ内で数値インデックスを使うときに便利です。列は数値でも "A" でも指定できます。', syntax: 'Cells(2, 1).Value      ' + "'" + ' A2\nCells(i, "C").Value' },
  'worksheets': { title: 'Worksheets / Sheets', body: 'ブック内のワークシートを参照します。名前かインデックスで指定します。', syntax: 'ThisWorkbook.Worksheets("Sheet1")\nWorksheets(1)' },
  'end':        { title: '.End(xlUp) など', body: 'Ctrl+方向キー相当でデータの端のセルを取得します。最終行・最終列の取得に必須の手法です。', syntax: 'Cells(Rows.Count, 1).End(xlUp).Row     ' + "'" + ' 最終行\nCells(1, Columns.Count).End(xlToLeft).Column' },
  'offset':     { title: 'Offset', body: '基準セルから相対的に移動したセルを参照します。（行, 列）のオフセットを指定します。', syntax: 'Range("A1").Offset(1, 0)  ' + "'" + ' A2\nActiveCell.Offset(0, 1)' },
  'resize':     { title: 'Resize', body: '範囲の大きさを（行数, 列数）に変更します。配列の一括書き込み先の指定に便利です。', syntax: 'Range("A1").Resize(10, 3)' },
  'msgbox':     { title: 'MsgBox', body: 'メッセージダイアログを表示します。ボタン定数（vbYesNo など）で戻り値を受け取れます。', syntax: 'MsgBox "完了しました", vbInformation\nIf MsgBox("実行?", vbYesNo) = vbYes Then' },
  'inputbox':   { title: 'InputBox', body: 'ユーザーに値を入力させるダイアログです。Application.InputBox を使うと型指定やセル選択ができます。', syntax: 'name = InputBox("氏名を入力")' },
  'format':     { title: 'Format', body: '数値・日付を書式文字列に従って文字列化します。金額のカンマ区切りや日付書式に使います。', syntax: 'Format(1234567, "#,##0")     ' + "'" + ' 1,234,567\nFormat(Now, "yyyy/mm/dd")' },
  'debug':      { title: 'Debug.Print', body: 'イミディエイトウィンドウ（Ctrl+G）に値を出力します。MsgBox を出さずに変数を確認できるデバッグの基本です。', syntax: 'Debug.Print i, ws.Name, total' },
  'trim':       { title: 'Trim / LTrim / RTrim', body: '文字列前後の空白を除去します。全角スペースは除去されない点に注意（必要なら Replace 併用）。', syntax: 's = Trim(Cells(i, 1).Value)' },
  'instr':      { title: 'InStr', body: '文字列中に別の文字列が最初に現れる位置を返します（見つからなければ0）。含有判定に使います。', syntax: 'If InStr(s, "@") > 0 Then\npos = InStr(1, s, ",")' },
  'left':       { title: 'Left / Right / Mid', body: '文字列の一部を取り出します。Left は先頭から、Right は末尾から、Mid は指定位置から取得します。', syntax: 'Left(s, 3)\nRight(s, 4)\nMid(s, 2, 5)' },
  'replace':    { title: 'Replace', body: '文字列中の指定文字をすべて置換します。全角空白の除去や記号の統一に使います。', syntax: 's = Replace(s, "　", "")   ' + "'" + ' 全角空白除去' },
  'split':      { title: 'Split / Join', body: 'Split は区切り文字で文字列を配列に分割、Join は配列を連結します。CSV1行の処理に便利です。', syntax: 'arr = Split("a,b,c", ",")\ns = Join(arr, vbTab)' },
  'ubound':     { title: 'UBound / LBound', body: '配列の上限・下限インデックスを返します。配列ループの範囲指定に使います。', syntax: 'For i = LBound(arr) To UBound(arr)' },
  'cstr':       { title: 'CStr / CLng / CDbl / CDate', body: '明示的な型変換関数です。数値化には Val より安全ですが、変換不能な値はエラーになります。', syntax: 'n = CLng("100")\nd = CDate("2024/1/1")' },
  'isempty':    { title: 'IsEmpty / IsNull / IsNumeric', body: '値の状態を判定する関数群です。IsNumeric は数値変換できるか、IsEmpty は未初期化か、IsError はエラー値かを判定します。', syntax: 'If IsNumeric(s) Then n = CDbl(s)' },
  'now':        { title: 'Now / Date / Time', body: '現在の日時を返します。Now は日付＋時刻、Date は日付のみ、Time は時刻のみです。', syntax: 'Debug.Print Format(Now, "yyyy/mm/dd hh:nn")' },
  'dateadd':    { title: 'DateAdd / DateDiff', body: '日付の加減算・差分を求めます。単位は "d"(日) "m"(月) "yyyy"(年) など。', syntax: 'DateAdd("m", 1, Date)   ' + "'" + ' 1ヶ月後\nDateDiff("d", d1, d2)' },
  'createobject': { title: 'CreateObject', body: '外部オブジェクトを遅延バインディングで生成します。参照設定なしで動くため配布に強いです。', syntax: 'Set fso = CreateObject("Scripting.FileSystemObject")\nSet dic = CreateObject("Scripting.Dictionary")' },
  'dir':        { title: 'Dir', body: 'ファイルの存在確認やフォルダ内ファイルの列挙に使います。引数なしの Dir で次の該当ファイルを返します。', syntax: 'f = Dir("C:\\data\\*.csv")\nDo While f <> ""\n    f = Dir\nLoop' },
  'application': { title: 'Application', body: 'Excel本体を表すオブジェクトです。ScreenUpdating / Calculation / WorksheetFunction などの高速化・関数呼び出しに使います。', syntax: 'Application.ScreenUpdating = False\nApplication.WorksheetFunction.VLookup(...)' },
  'worksheetfunction': { title: 'WorksheetFunction', body: 'ワークシート関数をVBAから呼び出します。VLookup / Sum / CountIf などが使えます（該当なしはエラーになるので注意）。', syntax: 'Application.WorksheetFunction.Sum(rng)' },
  'autofilter': { title: 'AutoFilter', body: 'オートフィルタで条件抽出します。抽出後は SpecialCells(xlCellTypeVisible) で可視セルのみ処理できます。', syntax: 'rng.AutoFilter Field:=2, Criteria1:=">=100"' },
  'find':       { title: 'Find', body: '範囲内から値を検索し、見つかったセル（Range）を返します。見つからない場合は Nothing を返すため判定が必要です。', syntax: 'Set c = rng.Find(What:="A001", LookAt:=xlWhole)\nIf Not c Is Nothing Then ...' },
};

function findSelectionExp(sel) {
  const t = sel.trim();
  if (!t) return null;
  const tl = t.toLowerCase();

  if (EXP_KW[tl]) return EXP_KW[tl];
  if (EXP_FUNCS[tl]) return EXP_FUNCS[tl];

  for (const [name, info] of Object.entries(EXP_FUNCS)) {
    if (new RegExp(`(?:^|[^\\w.])${name}(?:[^\\w]|$)`, 'i').test(t)) return info;
  }
  for (const [kw, info] of Object.entries(EXP_KW)) {
    if (new RegExp(`(?:^|[^\\w])${kw}(?:[^\\w]|$)`, 'i').test(t)) return info;
  }
  return null;
}

// ----------------------------------------------------------------
//  スニペット定義（Excel業務中心）
// ----------------------------------------------------------------
const SNIPPETS = [
  // ---- スターター（書き始め） ----
  { group: 'スターター（書き始め）', label: '標準モジュールの基本形',
    desc: '新しいツールを標準モジュールで書き始めるときの土台です。Option Explicit・設定定数・メイン・エラー処理・後始末が入っています。',
    code: `Option Explicit

' ===== 設定（定数） =====
Private Const SHEET_NAME As String = "Sheet1"
Private Const START_ROW  As Long = 2

' ===== メイン =====
Public Sub Main()
    Dim ws As Worksheet
    On Error GoTo ErrHandler
    Application.ScreenUpdating = False

    Set ws = ThisWorkbook.Worksheets(SHEET_NAME)
    ' ここに処理を書く

Cleanup:
    Application.ScreenUpdating = True
    Exit Sub
ErrHandler:
    MsgBox "エラー(" & Err.Number & "): " & Err.Description, vbCritical
    Resume Cleanup
End Sub` },
  { group: 'スターター（書き始め）', label: 'メイン処理の骨格（分割呼び出し）',
    desc: '処理を小さな Sub に分け、メインから順に呼ぶ読みやすい構成です。各段階を別プロシージャにすると保守しやすくなります。',
    code: `Public Sub Run()
    On Error GoTo ErrHandler
    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual

    Call 初期化
    Call データ読込
    Call 集計処理
    Call 結果出力

    MsgBox "完了しました", vbInformation

Cleanup:
    Application.Calculation = xlCalculationAutomatic
    Application.ScreenUpdating = True
    Exit Sub
ErrHandler:
    MsgBox "エラー(" & Err.Number & "): " & Err.Description, vbCritical
    Resume Cleanup
End Sub

Private Sub 初期化()
End Sub
Private Sub データ読込()
End Sub
Private Sub 集計処理()
End Sub
Private Sub 結果出力()
End Sub` },
  { group: 'スターター（書き始め）', label: '設定セクション（定数まとめ）',
    desc: 'モジュール先頭に置く設定です。シート名・列番号・パスなど変わりやすい値を1か所に集約すると、修正に強くなります。',
    code: `' ===== 設定 =====
Private Const WS_DATA    As String = "データ"
Private Const WS_RESULT  As String = "結果"
Private Const COL_KEY    As Long = 1   ' A列
Private Const COL_VALUE  As Long = 3   ' C列
Private Const HEADER_ROW As Long = 1
Private Const OUTPUT_DIR As String = "C:\\output\\"` },
  { group: 'スターター（書き始め）', label: 'プロシージャ用コメントヘッダ',
    desc: '各プロシージャの先頭に付ける説明ヘッダの雛形です。目的・引数・戻り値・作成情報を残すと引き継ぎが楽になります。',
    code: `'------------------------------------------------------------
' 概要   : （このプロシージャの目的）
' 引数   : arg1 - （説明）
' 戻り値 : （説明）
' 作成   : 2026/07/15  作成者
'------------------------------------------------------------` },
  { group: 'スターター（書き始め）', label: 'シート・ブックの取得（初期化）',
    desc: 'よく使うブック・シートをモジュール変数に取得しておく初期化です。各プロシージャで毎回取得せずに済みます。',
    code: `Private wb As Workbook
Private wsData As Worksheet
Private wsResult As Worksheet

Private Sub InitBook()
    Set wb = ThisWorkbook
    Set wsData = wb.Worksheets("データ")
    Set wsResult = wb.Worksheets("結果")
End Sub` },
  { group: 'スターター（書き始め）', label: '設定シートから値を読み込む',
    desc: '「設定」シート（A列=項目名, B列=値）を読み、Dictionary で参照できるようにします。settings("出力先") のように使えます。',
    code: `Private Function LoadSettings() As Object
    Dim dic As Object, ws As Worksheet, i As Long, lastRow As Long
    Set dic = CreateObject("Scripting.Dictionary")
    Set ws = ThisWorkbook.Worksheets("設定")
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    For i = 2 To lastRow
        dic(CStr(ws.Cells(i, "A").Value)) = ws.Cells(i, "B").Value
    Next i
    Set LoadSettings = dic
End Function` },
  { group: 'スターター（書き始め）', label: 'ボタンから呼ぶエントリ',
    desc: 'シート上のボタンに割り当てる想定の入口プロシージャです。確認 → 実処理呼び出し → 完了メッセージの流れです。',
    code: `Public Sub OnClickRun()
    If MsgBox("処理を実行しますか？", vbYesNo + vbQuestion) <> vbYes Then Exit Sub
    On Error GoTo ErrHandler

    Call Run   ' 実処理を呼ぶ

    MsgBox "完了しました", vbInformation
    Exit Sub
ErrHandler:
    MsgBox "エラー: " & Err.Description, vbCritical
End Sub` },
  { group: 'スターター（書き始め）', label: 'クラスモジュールの雛形',
    desc: '新しいクラスを書き始める土台です（生成/破棄イベント＋プロパティ）。挿入→クラスモジュールに貼り、名前を付けます。',
    code: `' === クラスモジュール "MyClass" ===
Private m_Name As String

Private Sub Class_Initialize()
    ' 生成時の初期化
End Sub

Private Sub Class_Terminate()
    ' 破棄時の後始末
End Sub

Public Property Get Name() As String
    Name = m_Name
End Property
Public Property Let Name(ByVal v As String)
    m_Name = v
End Property` },
  { group: 'スターター（書き始め）', label: 'テスト用のお試しSub',
    desc: 'イミディエイトウィンドウ（Ctrl+G）で気軽に動かす実験用プロシージャです。作りかけの確認に使えます。',
    code: `Private Sub Test()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.ActiveSheet
    Debug.Print ws.Name, ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
End Sub` },

  // ---- お作法・雛形 ----
  { group: 'お作法・雛形', label: '高速化テンプレ',
    desc: '画面更新・自動計算・イベントを止めて処理を高速化し、終了時（エラー時も）に必ず元へ戻す雛形です。重い処理の基本形。',
    code: `Sub 高速処理()
    Dim prevCalc As XlCalculation
    prevCalc = Application.Calculation
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    Application.Calculation = xlCalculationManual
    On Error GoTo Cleanup

    ' ここに処理を書く

Cleanup:
    Application.Calculation = prevCalc
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    If Err.Number <> 0 Then MsgBox "エラー: " & Err.Description, vbExclamation
End Sub` },
  { group: 'お作法・雛形', label: 'エラーハンドラ雛形',
    desc: 'On Error GoTo でエラーを補足し、メッセージを表示して安全に終了する定番の骨格です。',
    code: `Sub 実行()
    On Error GoTo ErrHandler

    ' ここに処理を書く

    Exit Sub
ErrHandler:
    MsgBox "エラー(" & Err.Number & "): " & Err.Description, vbCritical
End Sub` },
  { group: 'お作法・雛形', label: '変数宣言サンプル',
    desc: 'よく使う型の宣言例です。オブジェクトは Set で代入する点に注意してください。',
    code: `Dim ws As Worksheet
Dim rng As Range
Dim lastRow As Long
Dim i As Long
Dim total As Double
Dim s As String
Dim flg As Boolean` },

  // ---- セル・範囲 ----
  { group: 'セル・範囲', label: '最終行を取得',
    desc: 'A列を基準に、データの入っている最終行を取得します。ループの終端によく使います。',
    code: `Dim lastRow As Long
lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row` },
  { group: 'セル・範囲', label: '最終列を取得',
    desc: '1行目を基準に、データの入っている最終列を取得します。',
    code: `Dim lastCol As Long
lastCol = ws.Cells(1, ws.Columns.Count).End(xlToLeft).Column` },
  { group: 'セル・範囲', label: '範囲を配列へ一括読込',
    desc: 'セル範囲を2次元配列に一括で読み込みます。セルを1つずつ触るより圧倒的に高速です（arr(行, 列)、既定で1始まり）。',
    code: `Dim arr As Variant
Dim lastRow As Long
lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
arr = ws.Range("A1:C" & lastRow).Value

Dim i As Long
For i = 1 To UBound(arr, 1)
    Debug.Print arr(i, 1), arr(i, 2), arr(i, 3)
Next i` },
  { group: 'セル・範囲', label: '配列を一括書き込み',
    desc: '2次元配列をセル範囲へ一括で書き戻します。Resize で配列と同じ大きさの範囲を指定するのがコツです。',
    code: `Dim arr(1 To 3, 1 To 2) As Variant
arr(1, 1) = "A": arr(1, 2) = 1
arr(2, 1) = "B": arr(2, 2) = 2
arr(3, 1) = "C": arr(3, 2) = 3

ws.Range("A1").Resize(UBound(arr, 1), UBound(arr, 2)).Value = arr` },
  { group: 'セル・範囲', label: 'CurrentRegion（表全体）',
    desc: '基準セルに連続するデータ範囲（表全体）をまとめて取得します。見出しを除くなら Offset/Resize で調整します。',
    code: `Dim tbl As Range
Set tbl = ws.Range("A1").CurrentRegion   ' 表全体
Set tbl = tbl.Offset(1).Resize(tbl.Rows.Count - 1) ' 見出し行を除く` },
  { group: 'セル・範囲', label: '値・書式のクリア',
    desc: '範囲の値だけを消す ClearContents と、書式ごと消す Clear の使い分けです。',
    code: `ws.Range("A2:C100").ClearContents   ' 値のみ消去
ws.Range("A2:C100").Clear           ' 書式ごと消去` },

  // ---- シート・ブック ----
  { group: 'シート・ブック', label: 'シート存在チェック',
    desc: '指定名のシートが存在するかを判定する関数です。存在しないシートへのアクセスによるエラーを防ぎます。',
    code: `Function SheetExists(nm As String, Optional wb As Workbook) As Boolean
    Dim ws As Worksheet
    If wb Is Nothing Then Set wb = ThisWorkbook
    On Error Resume Next
    Set ws = wb.Worksheets(nm)
    On Error GoTo 0
    SheetExists = Not ws Is Nothing
End Function` },
  { group: 'シート・ブック', label: '全シートをループ',
    desc: 'ブック内のすべてのワークシートを順に処理します。',
    code: `Dim ws As Worksheet
For Each ws In ThisWorkbook.Worksheets
    Debug.Print ws.Name, ws.UsedRange.Rows.Count
Next ws` },
  { group: 'シート・ブック', label: 'シート追加・削除',
    desc: 'シートを追加し、削除時は確認ダイアログを抑止します（DisplayAlerts）。',
    code: `Dim ws As Worksheet
Set ws = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
ws.Name = "新シート"

Application.DisplayAlerts = False
ThisWorkbook.Worksheets("不要シート").Delete
Application.DisplayAlerts = True` },
  { group: 'シート・ブック', label: '別ブックを開いて閉じる',
    desc: '別ブックを開いて処理し、保存せずに閉じる基本形です。処理中は画面更新を止めると速くなります。',
    code: `Dim wb As Workbook
Set wb = Workbooks.Open("C:\\data\\input.xlsx")

' wb に対する処理

wb.Close SaveChanges:=False
Set wb = Nothing` },

  // ---- ループ・分岐 ----
  { group: 'ループ・分岐', label: 'Do Until 最終行まで',
    desc: 'A列が空になるまで1行ずつ下へ処理します。行数が不定のデータに向きます。',
    code: `Dim i As Long
i = 2
Do Until ws.Cells(i, "A").Value = ""
    ' ws.Cells(i, "B").Value = ...
    i = i + 1
Loop` },
  { group: 'ループ・分岐', label: 'For で最終行までループ',
    desc: '最終行まで行番号でループする最も基本的な形です。',
    code: `Dim i As Long, lastRow As Long
lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
For i = 2 To lastRow
    If ws.Cells(i, "C").Value >= 100 Then
        ws.Cells(i, "D").Value = "対象"
    End If
Next i` },
  { group: 'ループ・分岐', label: 'Select Case で分岐',
    desc: '値の範囲や複数値で分岐する Select Case の例です。If の連鎖より読みやすくなります。',
    code: `Select Case score
    Case Is >= 80
        rank = "A"
    Case 60 To 79
        rank = "B"
    Case Else
        rank = "C"
End Select` },

  // ---- 辞書・重複 ----
  { group: '辞書・集計', label: 'Dictionary で集計',
    desc: 'キーごとに数値を合計する集計処理です。Dictionary はキーの重複チェックと集計に最適です（遅延バインディング）。',
    code: `Dim dic As Object
Set dic = CreateObject("Scripting.Dictionary")

Dim i As Long, lastRow As Long, key As String
lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
For i = 2 To lastRow
    key = ws.Cells(i, "A").Value
    dic(key) = dic(key) + ws.Cells(i, "B").Value   ' 未登録キーは0扱い
Next i

Dim k As Variant
For Each k In dic.Keys
    Debug.Print k, dic(k)
Next k` },
  { group: '辞書・集計', label: 'Dictionary で重複排除',
    desc: '重複しないキーの一覧を作ります。Exists で存在確認してから追加します。',
    code: `Dim dic As Object
Set dic = CreateObject("Scripting.Dictionary")
Dim i As Long, v As String
For i = 2 To lastRow
    v = ws.Cells(i, "A").Value
    If Not dic.Exists(v) Then dic.Add v, True
Next i
' dic.Keys が重複なしの一覧` },

  // ---- 文字列・日付 ----
  { group: '文字列・日付', label: 'Format 書式サンプル',
    desc: 'よく使う Format の書式例です。数値・日付・時刻をまとめています。',
    code: `Debug.Print Format(1234567, "#,##0")        ' 1,234,567
Debug.Print Format(0.1234, "0.0%")          ' 12.3%
Debug.Print Format(Now, "yyyy/mm/dd")       ' 2024/01/01
Debug.Print Format(Now, "hh:nn:ss")         ' 09:05:30
Debug.Print Format(5, "000")                ' 005` },
  { group: '文字列・日付', label: 'Split / Join',
    desc: 'カンマ区切り文字列を配列に分割し、タブ区切りで連結し直す例です。',
    code: `Dim arr As Variant
arr = Split("りんご,みかん,ぶどう", ",")

Dim i As Long
For i = LBound(arr) To UBound(arr)
    Debug.Print i, arr(i)
Next i

Dim joined As String
joined = Join(arr, vbTab)` },
  { group: '文字列・日付', label: '文字列の整形',
    desc: '前後の空白・全角空白を除去して整える例です。',
    code: `Dim s As String
s = ws.Cells(i, "A").Value
s = Trim(s)                 ' 前後の半角空白
s = Replace(s, "　", "")    ' 全角空白を除去` },

  // ---- ファイル ----
  { group: 'ファイル', label: 'フォルダ内ファイル列挙（Dir）',
    desc: 'フォルダ内の該当ファイルを順に取得します。引数なしの Dir が次のファイルを返します。',
    code: `Dim folder As String, f As String
folder = "C:\\data\\"
f = Dir(folder & "*.csv")
Do While f <> ""
    Debug.Print folder & f
    f = Dir
Loop` },
  { group: 'ファイル', label: 'テキスト読み込み（FSO）',
    desc: 'FileSystemObject でテキストファイルを1行ずつ読み込みます。文字コードに依存しない基本形です。',
    code: `Dim fso As Object, ts As Object, line As String
Set fso = CreateObject("Scripting.FileSystemObject")
Set ts = fso.OpenTextFile("C:\\data\\input.txt", 1)  ' 1 = ForReading
Do Until ts.AtEndOfStream
    line = ts.ReadLine
    Debug.Print line
Loop
ts.Close` },
  { group: 'ファイル', label: 'CSV書き出し',
    desc: '範囲の内容をCSVとして書き出す例です。Print # で1行ずつ出力します。',
    code: `Dim ff As Integer, i As Long, lastRow As Long
lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
ff = FreeFile
Open "C:\\data\\output.csv" For Output As #ff
For i = 1 To lastRow
    Print #ff, ws.Cells(i, "A").Value & "," & ws.Cells(i, "B").Value
Next i
Close #ff` },

  // ---- 応用 ----
  { group: '応用', label: 'AutoFilter で抽出',
    desc: 'オートフィルタで条件抽出し、見えているセルだけをコピーする例です。',
    code: `Dim src As Range
Set src = ws.Range("A1").CurrentRegion
src.AutoFilter Field:=3, Criteria1:=">=100"

' 可視セルのみを別シートへコピー
src.SpecialCells(xlCellTypeVisible).Copy _
    Destination:=ThisWorkbook.Worksheets("抽出").Range("A1")

ws.AutoFilterMode = False` },
  { group: '応用', label: 'WorksheetFunction 活用',
    desc: 'ワークシート関数をVBAから呼ぶ例です。VLookup は該当なしでエラーになるため On Error で受けます。',
    code: `Dim wf As WorksheetFunction
Set wf = Application.WorksheetFunction

total = wf.Sum(ws.Range("B2:B100"))
cnt = wf.CountIf(ws.Range("A2:A100"), "対象")

On Error Resume Next
result = wf.VLookup("A001", ws.Range("A:C"), 3, False)
If Err.Number <> 0 Then result = "該当なし"
On Error GoTo 0` },
  { group: '応用', label: 'Outlookメール送信',
    desc: '遅延バインディングでOutlookメールを作成します。参照設定不要で動きます。.Send で即送信、.Display で下書き表示。',
    code: `Dim ol As Object, mail As Object
Set ol = CreateObject("Outlook.Application")
Set mail = ol.CreateItem(0)   ' 0 = olMailItem
With mail
    .To = "example@example.com"
    .Subject = "月次報告"
    .Body = "お疲れ様です。" & vbCrLf & "報告書を送付します。"
    ' .Attachments.Add "C:\\data\\report.xlsx"
    .Display   ' 送信は .Send
End With` },

  // ---- 入力・検証 ----
  { group: '入力・検証', label: '必須チェック',
    desc: 'セルが空なら警告してフォーカスを移し、処理を中断できるようにします。入力フォーム系の定番です。',
    code: `Function CheckRequired(cell As Range, label As String) As Boolean
    If Trim(cell.Value & "") = "" Then
        MsgBox label & "を入力してください。", vbExclamation
        cell.Select
        CheckRequired = False
    Else
        CheckRequired = True
    End If
End Function

If Not CheckRequired(ws.Range("B2"), "氏名") Then Exit Sub` },
  { group: '入力・検証', label: '数値・日付チェック',
    desc: '入力値が数値か日付として妥当かを判定します。IsNumeric / IsDate を使います。',
    code: `Dim s As String
s = ws.Range("B2").Value
If Not IsNumeric(s) Then
    MsgBox "数値を入力してください。", vbExclamation
    Exit Sub
End If

If Not IsDate(ws.Range("B3").Value) Then
    MsgBox "日付を入力してください。", vbExclamation
    Exit Sub
End If` },
  { group: '入力・検証', label: 'InputBoxで再入力ループ',
    desc: '正しい値が入るまで InputBox を繰り返します。キャンセル（空文字）で抜けます。',
    code: `Dim v As String
Do
    v = InputBox("1以上の数値を入力してください")
    If v = "" Then Exit Sub          ' キャンセル
Loop Until IsNumeric(v) And Val(v) >= 1

MsgBox "入力値: " & v` },
  { group: '入力・検証', label: 'セルを選ばせる（Application.InputBox）',
    desc: 'ユーザーにマウスでセル範囲を選択させます。Type:=8 で Range を受け取ります。',
    code: `Dim rng As Range
On Error Resume Next
Set rng = Application.InputBox("範囲を選択してください", Type:=8)
On Error GoTo 0
If rng Is Nothing Then Exit Sub      ' キャンセル

MsgBox "選択セル数: " & rng.Count` },
  { group: '入力・検証', label: 'はい/いいえ確認',
    desc: '処理前に確認ダイアログを出し、「いいえ」なら中断します。',
    code: `If MsgBox("処理を実行しますか？", vbYesNo + vbQuestion, "確認") <> vbYes Then
    Exit Sub
End If` },

  // ---- セル書式 ----
  { group: 'セル書式', label: 'フォント・色の設定',
    desc: '太字・文字色・背景色・サイズなどフォント/塗りつぶしをまとめて設定します。',
    code: `With ws.Range("A1:C1")
    .Font.Bold = True
    .Font.Size = 12
    .Font.Color = RGB(255, 255, 255)      ' 白文字
    .Interior.Color = RGB(0, 112, 192)    ' 青背景
    .HorizontalAlignment = xlCenter
End With` },
  { group: 'セル書式', label: '表示形式（NumberFormat）',
    desc: 'セルの表示形式を設定します。金額・パーセント・日付・文字列などを指定できます。',
    code: `ws.Range("B2:B100").NumberFormatLocal = "#,##0"        ' 桁区切り
ws.Range("C2:C100").NumberFormatLocal = "0.0%"         ' パーセント
ws.Range("D2:D100").NumberFormatLocal = "yyyy/mm/dd"   ' 日付
ws.Range("A2:A100").NumberFormatLocal = "@"            ' 文字列扱い` },
  { group: 'セル書式', label: '罫線を引く',
    desc: '範囲の外枠と格子（内側）に罫線を引きます。',
    code: `With ws.Range("A1:C10")
    .Borders.LineStyle = xlContinuous     ' 全体に細線
    .Borders(xlEdgeBottom).Weight = xlMedium
    .BorderAround Weight:=xlMedium        ' 外枠を太く
End With` },
  { group: 'セル書式', label: '条件付き書式',
    desc: '指定条件を満たすセルの書式を自動で変えます。ここでは100以上を赤背景にします。',
    code: `With ws.Range("C2:C100")
    .FormatConditions.Delete
    .FormatConditions.Add Type:=xlCellValue, Operator:=xlGreaterEqual, Formula1:="100"
    .FormatConditions(1).Interior.Color = RGB(255, 199, 206)
End With` },
  { group: 'セル書式', label: '列幅・行高の自動調整',
    desc: 'データに合わせて列幅・行高を自動調整します。',
    code: `ws.Columns("A:E").AutoFit
ws.Rows("1:100").AutoFit
ws.Columns("B").ColumnWidth = 15   ' 固定幅の指定も可` },
  { group: 'セル書式', label: 'セルの結合',
    desc: 'セルを結合・解除します。中央揃えにするとタイトル行に便利です。',
    code: `With ws.Range("A1:D1")
    .Merge
    .HorizontalAlignment = xlCenter
    .Value = "月次売上レポート"
End With
' 解除: ws.Range("A1:D1").UnMerge` },

  // ---- 数式・関数 ----
  { group: '数式・関数', label: '数式を設定する',
    desc: 'セルに数式を書き込みます。FormulaR1C1 は相対参照をコードで扱うときに便利です。',
    code: `ws.Range("D2").Formula = "=B2*C2"
ws.Range("D2:D100").Formula = "=B2*C2"           ' 相対参照は自動調整
ws.Range("E2").FormulaR1C1 = "=RC[-2]*RC[-1]"    ' R1C1形式` },
  { group: '数式・関数', label: '数式を値に変換',
    desc: '数式で計算した結果を値として固定します（数式を消して値だけ残す）。',
    code: `With ws.Range("D2:D100")
    .Value = .Value        ' 数式 → 値
End With` },
  { group: '数式・関数', label: 'VLOOKUP相当（Match+Index）',
    desc: 'WorksheetFunctionで検索します。Match で行位置を得て Index で値を取り出すと堅牢です。',
    code: `Dim wf As WorksheetFunction
Set wf = Application.WorksheetFunction

Dim r As Variant
r = Application.Match("A001", ws.Range("A:A"), 0)  ' 見つからないとエラー値
If IsError(r) Then
    MsgBox "該当なし"
Else
    MsgBox ws.Cells(r, "C").Value
End If` },
  { group: '数式・関数', label: 'SUMIF / COUNTIF',
    desc: '条件付き集計をVBAから呼び出します。',
    code: `Dim wf As WorksheetFunction
Set wf = Application.WorksheetFunction

total = wf.SumIf(ws.Range("A2:A100"), "東京", ws.Range("B2:B100"))
cnt = wf.CountIf(ws.Range("A2:A100"), "東京")` },

  // ---- 並べ替え・抽出 ----
  { group: '並べ替え・抽出', label: '範囲の並べ替え（Sort）',
    desc: '表を指定キーで並べ替えます。複数キー・昇順降順を指定できます。',
    code: `With ws.Sort
    .SortFields.Clear
    .SortFields.Add Key:=ws.Range("C2:C100"), Order:=xlDescending  ' 金額降順
    .SortFields.Add Key:=ws.Range("A2:A100"), Order:=xlAscending   ' 次に名前昇順
    .SetRange ws.Range("A1").CurrentRegion
    .Header = xlYes
    .Apply
End With` },
  { group: '並べ替え・抽出', label: '重複行の削除',
    desc: 'RemoveDuplicates で指定列が重複する行を削除します。',
    code: `' A列(1)とB列(2)が同じ行を重複とみなして削除
ws.Range("A1").CurrentRegion.RemoveDuplicates Columns:=Array(1, 2), Header:=xlYes` },
  { group: '並べ替え・抽出', label: '一意な値の一覧を作る',
    desc: 'Dictionaryで重複を除いた一覧を別列へ書き出します。',
    code: `Dim dic As Object, i As Long, lastRow As Long, v As String
Set dic = CreateObject("Scripting.Dictionary")
lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row

For i = 2 To lastRow
    v = ws.Cells(i, "A").Value
    If v <> "" And Not dic.Exists(v) Then dic.Add v, True
Next i

ws.Range("E2").Resize(dic.Count).Value = _
    Application.Transpose(dic.Keys)` },
  { group: '並べ替え・抽出', label: 'オートフィルタ結果を別シートへ',
    desc: '条件抽出して可視セルのみを別シートへコピーします。',
    code: `Dim src As Range
Set src = ws.Range("A1").CurrentRegion
ws.AutoFilterMode = False
src.AutoFilter Field:=3, Criteria1:=">=100"

src.SpecialCells(xlCellTypeVisible).Copy _
    Destination:=ThisWorkbook.Worksheets("抽出").Range("A1")

ws.AutoFilterMode = False` },

  // ---- ループ・配列（応用） ----
  { group: 'ループ・配列', label: '二次元配列で高速処理',
    desc: '読み込み→配列上で計算→書き戻し、の三段構え。セル参照を最小化する最速パターンです。',
    code: `Dim arr As Variant, i As Long, lastRow As Long
lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
arr = ws.Range("A2:D" & lastRow).Value    ' 一括読み込み

For i = 1 To UBound(arr, 1)
    arr(i, 4) = arr(i, 2) * arr(i, 3)     ' D = B * C
Next i

ws.Range("A2").Resize(UBound(arr, 1), UBound(arr, 2)).Value = arr  ' 一括書き戻し` },
  { group: 'ループ・配列', label: '逆順ループ（削除に安全）',
    desc: '行を削除しながら回すときは下から上へ回します。上から回すと行ズレで抜けが出ます。',
    code: `Dim i As Long, lastRow As Long
lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
For i = lastRow To 2 Step -1
    If ws.Cells(i, "A").Value = "削除" Then
        ws.Rows(i).Delete
    End If
Next i` },
  { group: 'ループ・配列', label: '該当行をまとめて削除',
    desc: 'Union で削除対象を1つの範囲にまとめ、最後に一括削除します。逆順ループより高速です。',
    code: `Dim i As Long, lastRow As Long, delRng As Range
lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
For i = 2 To lastRow
    If ws.Cells(i, "A").Value = "削除" Then
        If delRng Is Nothing Then
            Set delRng = ws.Rows(i)
        Else
            Set delRng = Union(delRng, ws.Rows(i))
        End If
    End If
Next i
If Not delRng Is Nothing Then delRng.Delete` },
  { group: 'ループ・配列', label: 'グループ別に配列へ集約',
    desc: 'キーごとに値の配列（Collection）を貯めるパターン。明細をキー単位でまとめたいときに使います。',
    code: `Dim dic As Object, i As Long, key As String
Set dic = CreateObject("Scripting.Dictionary")
For i = 2 To lastRow
    key = ws.Cells(i, "A").Value
    If Not dic.Exists(key) Then dic.Add key, New Collection
    dic(key).Add ws.Cells(i, "B").Value
Next i` },

  // ---- 日付・時刻 ----
  { group: '日付・時刻', label: '月初・月末を求める',
    desc: '当月の初日と末日を計算します。末日は「翌月0日」で求めるのが定番です。',
    code: `Dim d As Date
d = Date
firstDay = DateSerial(Year(d), Month(d), 1)
lastDay = DateSerial(Year(d), Month(d) + 1, 0)
Debug.Print Format(firstDay, "yyyy/mm/dd"), Format(lastDay, "yyyy/mm/dd")` },
  { group: '日付・時刻', label: '日付範囲でループ',
    desc: '開始日から終了日まで1日ずつ処理します。',
    code: `Dim d As Date, dStart As Date, dEnd As Date
dStart = DateSerial(2024, 1, 1)
dEnd = DateSerial(2024, 1, 31)
For d = dStart To dEnd
    Debug.Print Format(d, "mm/dd(aaa)")   ' aaa=曜日
Next d` },
  { group: '日付・時刻', label: '曜日・和暦の取得',
    desc: '曜日名や和暦をFormatで取得します。',
    code: `Debug.Print Format(Date, "aaaa")    ' 日曜日
Debug.Print Format(Date, "aaa")     ' 日
Debug.Print WeekdayName(Weekday(Date))
Debug.Print Format(Date, "ggge年m月d日")  ' 令和6年…` },
  { group: '日付・時刻', label: '経過日数・営業日数',
    desc: '2日付の差を求めます。営業日数は WorksheetFunction.NetworkDays が使えます。',
    code: `days = DateDiff("d", startDate, endDate)
biz = Application.WorksheetFunction.NetworkDays(startDate, endDate)` },

  // ---- 文字列（応用） ----
  { group: '文字列（応用）', label: 'ゼロ埋め・書式化',
    desc: 'コード番号のゼロ埋めなど。Format か Right の合わせ技で作ります。',
    code: `Debug.Print Format(5, "0000")             ' 0005
Debug.Print Right("0000" & 5, 4)          ' 0005
Debug.Print Format(1234.5, "#,##0.00")    ' 1,234.50` },
  { group: '文字列（応用）', label: '全角⇔半角変換（StrConv）',
    desc: '全角/半角、大文字/小文字、ひらがな/カタカナを変換します。',
    code: `Debug.Print StrConv("ＡＢＣ１２３", vbNarrow)   ' 半角へ
Debug.Print StrConv("ABCabc", vbWide)          ' 全角へ
Debug.Print StrConv("ｶﾀｶﾅ", vbHiragana)         ' ひらがなへ` },
  { group: '文字列（応用）', label: '文字列を1文字ずつ処理',
    desc: 'Mid で1文字ずつ取り出して走査します。数字だけ抽出などに応用できます。',
    code: `Dim s As String, i As Long, ch As String, num As String
s = "AB-123-CD"
For i = 1 To Len(s)
    ch = Mid(s, i, 1)
    If ch Like "#" Then num = num & ch    ' 数字だけ連結
Next i
Debug.Print num   ' 123` },

  // ---- フォルダ・ファイル操作 ----
  { group: 'フォルダ・ファイル', label: 'フォルダ選択ダイアログ',
    desc: 'ユーザーにフォルダを選ばせます。FileDialog を使います。',
    code: `Dim fd As FileDialog, folder As String
Set fd = Application.FileDialog(msoFileDialogFolderPicker)
If fd.Show = -1 Then
    folder = fd.SelectedItems(1)
    MsgBox folder
Else
    Exit Sub   ' キャンセル
End If` },
  { group: 'フォルダ・ファイル', label: 'ファイル選択ダイアログ',
    desc: '開くファイルをユーザーに選ばせます。フィルタで拡張子を絞れます。',
    code: `Dim fd As FileDialog
Set fd = Application.FileDialog(msoFileDialogFilePicker)
With fd
    .Filters.Clear
    .Filters.Add "Excelブック", "*.xlsx; *.xls"
    .AllowMultiSelect = False
    If .Show = -1 Then MsgBox .SelectedItems(1)
End With` },
  { group: 'フォルダ・ファイル', label: 'フォルダ作成・存在確認',
    desc: 'フォルダが無ければ作成します。Dir か FileSystemObject で確認します。',
    code: `Dim path As String
path = "C:\\data\\output"
If Dir(path, vbDirectory) = "" Then MkDir path

' FSO版
Dim fso As Object
Set fso = CreateObject("Scripting.FileSystemObject")
If Not fso.FolderExists(path) Then fso.CreateFolder path` },
  { group: 'フォルダ・ファイル', label: 'ファイルのコピー・移動・削除',
    desc: 'FileCopy / Name / Kill でファイル操作します。存在確認してから行うと安全です。',
    code: `FileCopy "C:\\data\\a.txt", "C:\\bak\\a.txt"   ' コピー
Name "C:\\data\\a.txt" As "C:\\data\\b.txt"    ' 移動・改名
If Dir("C:\\data\\b.txt") <> "" Then Kill "C:\\data\\b.txt"  ' 削除` },
  { group: 'フォルダ・ファイル', label: 'サブフォルダも含めて再帰列挙',
    desc: 'FileSystemObject でサブフォルダを再帰的にたどり、全ファイルを処理します。',
    code: `Sub ListFiles(folderPath As String)
    Dim fso As Object, fld As Object, f As Object, sub_ As Object
    Set fso = CreateObject("Scripting.FileSystemObject")
    Set fld = fso.GetFolder(folderPath)
    For Each f In fld.Files
        Debug.Print f.Path
    Next f
    For Each sub_ In fld.SubFolders
        ListFiles sub_.Path         ' 再帰
    Next sub_
End Sub` },

  // ---- ブック・シート（応用） ----
  { group: 'ブック（応用）', label: 'シートをPDF出力',
    desc: 'シートをPDFとして書き出します。帳票の配布に便利です。',
    code: `ws.ExportAsFixedFormat _
    Type:=xlTypePDF, _
    Filename:="C:\\data\\report.pdf", _
    Quality:=xlQualityStandard, _
    OpenAfterPublish:=False` },
  { group: 'ブック（応用）', label: '別名で保存（上書き警告オフ）',
    desc: 'ブックを別名保存します。確認ダイアログを抑止します。',
    code: `Application.DisplayAlerts = False
ThisWorkbook.SaveAs _
    Filename:="C:\\data\\backup_" & Format(Now, "yyyymmdd_hhnnss") & ".xlsx", _
    FileFormat:=xlOpenXMLWorkbook
Application.DisplayAlerts = True` },
  { group: 'ブック（応用）', label: '複数ブックを1シートに統合',
    desc: 'フォルダ内の全ブックを開き、各先頭シートを1枚に縦結合します。',
    code: `Dim f As String, wb As Workbook, src As Worksheet, dst As Worksheet
Dim nextRow As Long
Set dst = ThisWorkbook.Worksheets("統合")
nextRow = 1

f = Dir("C:\\data\\*.xlsx")
Do While f <> ""
    Set wb = Workbooks.Open("C:\\data\\" & f)
    Set src = wb.Worksheets(1)
    Dim lr As Long
    lr = src.Cells(src.Rows.Count, "A").End(xlUp).Row
    src.Range("A1:E" & lr).Copy dst.Cells(nextRow, "A")
    nextRow = nextRow + lr
    wb.Close SaveChanges:=False
    f = Dir
Loop` },
  { group: 'ブック（応用）', label: 'シートを新規ブックにコピー保存',
    desc: '1シートを新しいブックへコピーしてそのまま保存します。単票の切り出しに便利です。',
    code: `ws.Copy    ' 引数なしのCopyで新規ブックが作られ、アクティブになる
With ActiveWorkbook
    .SaveAs "C:\\data\\" & ws.Name & ".xlsx", xlOpenXMLWorkbook
    .Close
End With` },

  // ---- 高速化・計測 ----
  { group: '高速化・計測', label: '処理時間を計測',
    desc: 'Timer で処理の所要時間を測ります。ボトルネック調査の第一歩です。',
    code: `Dim t As Double
t = Timer

' 計測したい処理

Debug.Print "所要時間: " & Format(Timer - t, "0.000") & " 秒"` },
  { group: '高速化・計測', label: '進捗をステータスバーに表示',
    desc: '長い処理の進捗をステータスバーに出します。MsgBoxより邪魔になりません。',
    code: `Application.StatusBar = "処理中... " & i & " / " & lastRow
' ...ループ内で更新...
Application.StatusBar = False   ' 最後に必ず戻す` },
  { group: '高速化・計測', label: 'DoEventsで固まらせない',
    desc: '重いループ中に画面応答を確保します。多用は遅くなるため、数百回に1回程度にします。',
    code: `For i = 1 To lastRow
    ' 処理
    If i Mod 500 = 0 Then DoEvents   ' 500行ごとに応答を返す
Next i` },

  // ---- デバッグ ----
  { group: 'デバッグ', label: 'エラー情報を詳しく表示',
    desc: 'エラーハンドラで発生箇所を特定しやすくする定番の表示です。',
    code: `ErrHandler:
    MsgBox "エラーが発生しました" & vbCrLf & vbCrLf & _
           "番号: " & Err.Number & vbCrLf & _
           "内容: " & Err.Description & vbCrLf & _
           "発生元: " & Err.Source, vbCritical` },
  { group: 'デバッグ', label: 'Debug.Assert で前提チェック',
    desc: '条件がFalseのとき実行を止めます（配布版では無視されるデバッグ専用）。',
    code: `Debug.Assert lastRow >= 2       ' データが1行以上ある前提
Debug.Assert Not ws Is Nothing  ' シートを取得できている前提` },

  // ---- 外部連携（応用） ----
  { group: '外部連携', label: 'ADOでSQLを実行',
    desc: 'ADOでデータベース（ここではAccess）に接続しSQLを実行、結果をシートへ貼ります。',
    code: `Dim cn As Object, rs As Object
Set cn = CreateObject("ADODB.Connection")
cn.Open "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=C:\\data\\db.accdb;"

Set rs = cn.Execute("SELECT * FROM 売上 WHERE 金額 >= 100")
ws.Range("A2").CopyFromRecordset rs   ' 結果を一括貼り付け

rs.Close: cn.Close
Set rs = Nothing: Set cn = Nothing` },
  { group: '外部連携', label: 'Wordを操作して差し込み',
    desc: '遅延バインディングでWordを開き、文字列を置換します。帳票の差し込みに使えます。',
    code: `Dim wd As Object, doc As Object
Set wd = CreateObject("Word.Application")
wd.Visible = True
Set doc = wd.Documents.Open("C:\\data\\template.docx")

With doc.Content.Find
    .Text = "{{氏名}}"
    .Replacement.Text = ws.Range("B2").Value
    .Execute Replace:=2       ' 2 = wdReplaceAll
End With` },
  { group: '外部連携', label: 'HTTPでWeb APIを叩く',
    desc: 'MSXML2でHTTP GETし、レスポンス本文を取得します。JSON解析は別途必要です。',
    code: `Dim http As Object
Set http = CreateObject("MSXML2.XMLHTTP")
http.Open "GET", "https://example.com/api/data", False
http.setRequestHeader "Content-Type", "application/json"
http.send

If http.Status = 200 Then
    Debug.Print http.responseText
Else
    MsgBox "エラー: " & http.Status
End If` },

  // ---- ピボットテーブル ----
  { group: 'ピボットテーブル', label: 'ピボットテーブルを作成',
    desc: 'ソース範囲からピボットテーブルを作成し、行・列・値フィールドを設定します。',
    code: `Dim pc As PivotCache, pt As PivotTable, src As Range
Set src = ws.Range("A1").CurrentRegion
Set pc = ThisWorkbook.PivotCaches.Create(xlDatabase, src)
Set pt = pc.CreatePivotTable( _
    TableDestination:=ThisWorkbook.Worksheets("集計").Range("A1"), _
    TableName:="売上ピボット")

With pt
    .PivotFields("地域").Orientation = xlRowField
    .PivotFields("月").Orientation = xlColumnField
    .PivotFields("金額").Orientation = xlDataField
End With` },
  { group: 'ピボットテーブル', label: 'ピボットを更新・フィルタ',
    desc: '既存ピボットの更新と、ページフィルタでの絞り込みです。',
    code: `Dim pt As PivotTable
Set pt = ws.PivotTables(1)
pt.RefreshTable                       ' データ更新

pt.PivotFields("地域").CurrentPage = "東京"   ' フィルタ` },

  // ---- グラフ ----
  { group: 'グラフ', label: '埋め込みグラフを作成',
    desc: 'セル範囲から折れ線グラフを作り、タイトルと位置を設定します。',
    code: `Dim ch As ChartObject
Set ch = ws.ChartObjects.Add(Left:=300, Top:=20, Width:=400, Height:=250)
With ch.Chart
    .SetSourceData Source:=ws.Range("A1:B12")
    .ChartType = xlLine
    .HasTitle = True
    .ChartTitle.Text = "月別売上推移"
End With` },
  { group: 'グラフ', label: 'グラフを画像として保存',
    desc: 'グラフをPNG画像としてエクスポートします。資料への貼り付けに便利です。',
    code: `ws.ChartObjects(1).Chart.Export _
    Filename:="C:\\data\\chart.png", FilterName:="PNG"` },

  // ---- 図形・オートシェイプ ----
  { group: '図形', label: '図形を追加してテキスト設定',
    desc: '四角形を追加し、色とテキストを設定します。ボタン代わりや注釈に使えます。',
    code: `Dim shp As Shape
Set shp = ws.Shapes.AddShape(msoShapeRoundedRectangle, 100, 100, 120, 40)
With shp
    .Fill.ForeColor.RGB = RGB(0, 112, 192)
    .TextFrame2.TextRange.Text = "実行"
    .TextFrame2.TextRange.Font.Fill.ForeColor.RGB = RGB(255, 255, 255)
    .OnAction = "MyMacro"     ' クリックでマクロ実行
End With` },
  { group: '図形', label: '全図形を削除',
    desc: 'シート上のすべての図形を削除します（セルは残す）。',
    code: `Dim shp As Shape
For Each shp In ws.Shapes
    shp.Delete
Next shp` },

  // ---- 印刷設定 ----
  { group: '印刷', label: 'ページ設定（余白・向き・拡大縮小）',
    desc: '印刷の向き、1ページに収める設定、余白、ヘッダーフッターをまとめて設定します。',
    code: `With ws.PageSetup
    .Orientation = xlLandscape        ' 横向き
    .Zoom = False
    .FitToPagesWide = 1               ' 横1ページに収める
    .FitToPagesTall = False
    .LeftMargin = Application.CentimetersToPoints(1)
    .CenterHeader = "&""ＭＳ Ｐゴシック""売上一覧"
    .RightFooter = "&P / &N ページ"
    .PrintArea = "A1:H50"
End With` },
  { group: '印刷', label: '印刷プレビュー / 印刷実行',
    desc: 'プレビュー表示と実際の印刷です。部数指定もできます。',
    code: `ws.PrintPreview                   ' プレビュー
' ws.PrintOut Copies:=1, Preview:=False   ' 実際に印刷` },

  // ---- 保護 ----
  { group: '保護', label: 'シート保護・解除',
    desc: 'パスワード付きでシートを保護/解除します。マクロからの操作は UserInterfaceOnly で許可できます。',
    code: `ws.Protect Password:="pass", UserInterfaceOnly:=True
' ...マクロは編集可、手動編集は不可...
ws.Unprotect Password:="pass"` },
  { group: '保護', label: '特定セルだけ編集可能にする',
    desc: '全セルをロックし、入力させたいセルだけロック解除してから保護します。',
    code: `ws.Cells.Locked = True
ws.Range("B2:B10").Locked = False     ' ここだけ入力可
ws.Protect Password:="pass"` },

  // ---- 名前定義 ----
  { group: '名前定義', label: '名前を定義・参照',
    desc: 'セル範囲に名前を付け、名前で参照します。数式やコードが読みやすくなります。',
    code: `ThisWorkbook.Names.Add Name:="売上範囲", RefersTo:=ws.Range("B2:B100")
Debug.Print Application.WorksheetFunction.Sum(ws.Range("売上範囲"))

' 削除
ThisWorkbook.Names("売上範囲").Delete` },

  // ---- 検索・置換 ----
  { group: '検索・置換', label: 'Findで検索してループ（FindNext）',
    desc: '範囲内の該当セルをすべて処理します。FindNextで次を探し、最初のアドレスに戻ったら終了します。',
    code: `Dim c As Range, firstAddr As String
Set c = ws.Columns("A").Find(What:="対象", LookAt:=xlWhole)
If Not c Is Nothing Then
    firstAddr = c.Address
    Do
        c.Offset(0, 1).Value = "済"
        Set c = ws.Columns("A").FindNext(c)
    Loop While Not c Is Nothing And c.Address <> firstAddr
End If` },
  { group: '検索・置換', label: '一括置換（Replace）',
    desc: '範囲内の文字列を一括置換します。セルごとにループするより高速です。',
    code: `ws.Cells.Replace What:="（株）", Replacement:="株式会社", _
    LookAt:=xlPart, MatchCase:=False` },

  // ---- 正規表現 ----
  { group: '正規表現', label: 'RegExpでマッチ判定',
    desc: 'VBScript.RegExpで入力チェックします。参照設定なしの遅延バインディングです。',
    code: `Dim re As Object
Set re = CreateObject("VBScript.RegExp")
re.Pattern = "^\\d{3}-\\d{4}$"     ' 郵便番号
re.IgnoreCase = True

If re.Test("123-4567") Then
    MsgBox "OK"
Else
    MsgBox "形式が不正です"
End If` },
  { group: '正規表現', label: 'RegExpで抽出・置換',
    desc: 'Globalで全件抽出、Replaceで置換します。数字だけ抜く・記号を消すなどに使えます。',
    code: `Dim re As Object, m As Object
Set re = CreateObject("VBScript.RegExp")
re.Global = True
re.Pattern = "\\d+"                ' 連続する数字

For Each m In re.Execute("A12B345C")
    Debug.Print m.Value           ' 12, 345
Next m

Debug.Print re.Replace("A12B345C", "")   ' ABC（数字除去）` },

  // ---- 配列（応用） ----
  { group: '配列（応用）', label: '動的配列に追加していく',
    desc: '件数が不定のときにReDim Preserveで拡張します。頻繁な拡張は遅いので、まとめ確保が理想です。',
    code: `Dim arr() As String, n As Long
ReDim arr(1 To 100)
n = 0
For i = 2 To lastRow
    If ws.Cells(i, "C").Value >= 100 Then
        n = n + 1
        If n > UBound(arr) Then ReDim Preserve arr(1 To n + 100)
        arr(n) = ws.Cells(i, "A").Value
    End If
Next i
ReDim Preserve arr(1 To n)        ' 最終サイズに詰める` },
  { group: '配列（応用）', label: '配列の並べ替え（バブルソート）',
    desc: '外部関数に頼らず配列を並べ替える基本アルゴリズムです。件数が少ないとき向け。',
    code: `Dim i As Long, j As Long, tmp As Variant
For i = LBound(arr) To UBound(arr) - 1
    For j = i + 1 To UBound(arr)
        If arr(i) > arr(j) Then
            tmp = arr(i): arr(i) = arr(j): arr(j) = tmp
        End If
    Next j
Next i` },
  { group: '配列（応用）', label: '2次元配列を行列入れ替え',
    desc: 'Transposeで行と列を入れ替えます。縦横変換に使えます（要素数の上限に注意）。',
    code: `Dim src As Variant, dst As Variant
src = ws.Range("A1:C5").Value
dst = Application.Transpose(src)   ' 5行3列 → 3行5列
ws.Range("E1").Resize(UBound(dst, 1), UBound(dst, 2)).Value = dst` },

  // ---- 数学・乱数 ----
  { group: '数学・乱数', label: '乱数・ランダム抽出',
    desc: '範囲内の整数乱数を作ります。Randomizeで毎回異なる系列にします。',
    code: `Randomize
Dim r As Long
r = Int((100 - 1 + 1) * Rnd + 1)   ' 1〜100の整数
Debug.Print r` },
  { group: '数学・乱数', label: '四捨五入・切り上げ・切り捨て',
    desc: 'VBAのRoundは銀行丸めのため、一般的な四捨五入はWorksheetFunctionを使います。',
    code: `Dim wf As WorksheetFunction
Set wf = Application.WorksheetFunction
Debug.Print wf.Round(2.5, 0)         ' 3（一般的な四捨五入）
Debug.Print wf.RoundUp(2.1, 0)       ' 3（切り上げ）
Debug.Print wf.RoundDown(2.9, 0)     ' 2（切り捨て）
Debug.Print Int(-2.5)                ' -3（Intは負方向）` },

  // ---- クリップボード ----
  { group: 'クリップボード', label: 'クリップボードへコピー/取得',
    desc: 'DataObject（MSForms）で文字列をクリップボードにやり取りします。',
    code: `Dim cb As Object
Set cb = CreateObject("MSForms.DataObject")

cb.SetText "コピーする文字列"
cb.PutInClipboard                 ' クリップボードへ

cb.GetFromClipboard
Debug.Print cb.GetText            ' クリップボードから取得` },

  // ---- 環境・システム ----
  { group: '環境・システム', label: 'ユーザー名・PC名・パスを取得',
    desc: '実行環境の情報を取得します。ログや保存先の切り替えに使えます。',
    code: `Debug.Print Environ("USERNAME")           ' ログインユーザー
Debug.Print Environ("COMPUTERNAME")       ' PC名
Debug.Print ThisWorkbook.Path             ' このブックのフォルダ
Debug.Print Application.DefaultFilePath    ' 既定の保存先` },
  { group: '環境・システム', label: '一定時間待つ（Wait / Sleep）',
    desc: '指定時間だけ処理を止めます。Application.Waitは秒単位、Sleepはミリ秒です。',
    code: `Application.Wait Now + TimeValue("00:00:03")   ' 3秒待つ

' ミリ秒単位で待つ場合（宣言セクションに）
' #If VBA7 Then
'   Declare PtrSafe Sub Sleep Lib "kernel32" (ByVal ms As LongPtr)
' #Else
'   Declare Sub Sleep Lib "kernel32" (ByVal ms As Long)
' #End If
' Sleep 500` },

  // ---- ログ出力 ----
  { group: 'ログ出力', label: 'テキストファイルにログ追記',
    desc: '処理ログを日時つきでファイルに追記します。Appendモードで開くのがポイントです。',
    code: `Sub WriteLog(msg As String)
    Dim ff As Integer
    ff = FreeFile
    Open ThisWorkbook.Path & "\\log.txt" For Append As #ff
    Print #ff, Format(Now, "yyyy/mm/dd hh:nn:ss") & vbTab & msg
    Close #ff
End Sub

WriteLog "処理を開始しました"` },

  // ---- クラスモジュール ----
  { group: 'クラスモジュール', label: 'クラスの基本（プロパティ）',
    desc: 'クラスモジュール（挿入→クラスモジュール）に書く雛形です。Private変数をProperty経由で公開します。',
    code: `' === クラスモジュール "Employee" ===
Private m_Name As String
Private m_Salary As Double

Public Property Get Name() As String
    Name = m_Name
End Property
Public Property Let Name(v As String)
    m_Name = v
End Property

Public Property Get Salary() As Double
    Salary = m_Salary
End Property
Public Property Let Salary(v As Double)
    m_Salary = v
End Property

Public Function AnnualPay() As Double
    AnnualPay = m_Salary * 12
End Function` },
  { group: 'クラスモジュール', label: 'クラスを使う側',
    desc: '標準モジュールからクラスをインスタンス化して使います。Collectionに複数貯めるのも定番です。',
    code: `Dim emp As Employee, list As Collection
Set list = New Collection

Set emp = New Employee
emp.Name = "山田"
emp.Salary = 300000
list.Add emp

Dim e As Employee
For Each e In list
    Debug.Print e.Name, e.AnnualPay
Next e` },

  // ---- イベント処理 ----
  { group: 'イベント', label: 'セル変更イベント（Worksheet_Change）',
    desc: 'シートモジュールに書きます。無限ループを防ぐため EnableEvents を必ずガードします。',
    code: `' === シートモジュール ===
Private Sub Worksheet_Change(ByVal Target As Range)
    If Intersect(Target, Me.Range("B2:B100")) Is Nothing Then Exit Sub
    Application.EnableEvents = False
    On Error GoTo Cleanup

    Target.Offset(0, 1).Value = Now    ' 変更時刻を記録

Cleanup:
    Application.EnableEvents = True
End Sub` },
  { group: 'イベント', label: 'ブックを開いた時（Workbook_Open）',
    desc: 'ThisWorkbookモジュールに書きます。起動時の初期化やシート選択に使います。',
    code: `' === ThisWorkbook モジュール ===
Private Sub Workbook_Open()
    Worksheets("メニュー").Activate
    Range("A1").Select
    MsgBox "ようこそ", vbInformation
End Sub` },
  { group: 'イベント', label: '保存前チェック（BeforeSave）',
    desc: '保存前に必須項目を検証し、未入力ならキャンセルします。',
    code: `' === ThisWorkbook モジュール ===
Private Sub Workbook_BeforeSave(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    If Worksheets("入力").Range("B2").Value = "" Then
        MsgBox "担当者を入力してください", vbExclamation
        Cancel = True         ' 保存を中止
    End If
End Sub` },

  // ---- ユーザーフォーム ----
  { group: 'ユーザーフォーム', label: 'フォームを表示/閉じる',
    desc: 'フォームの表示と、フォーム側で自身を閉じる書き方です。',
    code: `' 標準モジュール側
UserForm1.Show               ' モーダル表示
' UserForm1.Show vbModeless  ' 操作を許すモードレス

' === UserForm モジュール（閉じるボタン）===
Private Sub btnClose_Click()
    Unload Me
End Sub` },
  { group: 'ユーザーフォーム', label: 'コンボボックスに一覧をセット',
    desc: 'フォーム起動時にシートの値をコンボボックスへ流し込みます。',
    code: `' === UserForm モジュール ===
Private Sub UserForm_Initialize()
    Dim i As Long, lastRow As Long
    lastRow = Worksheets("マスタ").Cells(Rows.Count, "A").End(xlUp).Row
    For i = 2 To lastRow
        Me.cboName.AddItem Worksheets("マスタ").Cells(i, "A").Value
    Next i
End Sub` },

  // ---- API宣言 ----
  { group: 'API宣言', label: '64bit対応のDeclare雛形',
    desc: '32/64bit両対応のAPI宣言です。#If VBA7 で分岐し、ポインタ/ハンドルは LongPtr にします。',
    code: `' === 標準モジュール宣言セクション ===
#If VBA7 Then
    Private Declare PtrSafe Function GetTickCount Lib "kernel32" () As Long
    Private Declare PtrSafe Sub Sleep Lib "kernel32" (ByVal ms As LongPtr)
#Else
    Private Declare Function GetTickCount Lib "kernel32" () As Long
    Private Declare Sub Sleep Lib "kernel32" (ByVal ms As Long)
#End If

Sub UseApi()
    Debug.Print GetTickCount
End Sub` },

  // ---- データ整形 ----
  { group: 'データ整形', label: '空白行を削除',
    desc: 'A列が空の行をまとめて削除します。SpecialCellsで空セルを一括取得します。',
    code: `On Error Resume Next   ' 空セルが無い場合のエラー回避
ws.Range("A2:A" & ws.Cells(ws.Rows.Count, "A").End(xlUp).Row) _
    .SpecialCells(xlCellTypeBlanks).EntireRow.Delete
On Error GoTo 0` },
  { group: 'データ整形', label: '数値に見える文字列を数値化',
    desc: '「文字列として保存された数値」をまとめて本当の数値に変換します。',
    code: `Dim c As Range
For Each c In ws.Range("B2:B100")
    If IsNumeric(c.Value) Then c.Value = CDbl(c.Value)
Next c
' もしくは 貼り付けの形式でまとめて: c.Value = c.Value` },
  { group: 'データ整形', label: 'セルの前後・全体の空白除去',
    desc: 'TRIM相当。半角はTrim、全角空白はReplaceで除去して整えます。',
    code: `Dim c As Range
For Each c In ws.Range("A2:A100")
    c.Value = Trim(Replace(c.Value & "", "　", " "))
Next c` },

  // ---- ハイパーリンク・コメント ----
  { group: 'リンク・コメント', label: 'ハイパーリンクを追加',
    desc: 'セルにリンクを設定します。URLだけでなく別シートへのジャンプにも使えます。',
    code: `ws.Hyperlinks.Add _
    Anchor:=ws.Range("A1"), _
    Address:="https://example.com", _
    TextToDisplay:="サイトを開く"

' シート内リンク
ws.Hyperlinks.Add Anchor:=ws.Range("A2"), Address:="", _
    SubAddress:="'集計'!A1", TextToDisplay:="集計へ"` },
  { group: 'リンク・コメント', label: 'セルにコメント（メモ）を追加',
    desc: 'セルにコメントを付けます。既存があれば消してから付け直すと安全です。',
    code: `With ws.Range("A1")
    If Not .Comment Is Nothing Then .Comment.Delete
    .AddComment "確認済み: " & Format(Date, "m/d")
    .Comment.Shape.TextFrame.AutoSize = True
End With` },

  // ---- Access連携（ADO） ----
  { group: 'Access連携', label: 'パラメータクエリで安全に検索',
    desc: 'Commandオブジェクトでパラメータを使い、SQLインジェクションを避けて検索します。',
    code: `Dim cn As Object, cmd As Object, rs As Object
Set cn = CreateObject("ADODB.Connection")
cn.Open "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=C:\\data\\db.accdb;"

Set cmd = CreateObject("ADODB.Command")
Set cmd.ActiveConnection = cn
cmd.CommandText = "SELECT * FROM 顧客 WHERE 地域 = ?"
cmd.Parameters.Append cmd.CreateParameter("p1", 200, 1, 50, "東京")  ' 200=adVarChar

Set rs = cmd.Execute
ws.Range("A2").CopyFromRecordset rs
rs.Close: cn.Close` },
  { group: 'Access連携', label: 'INSERT / UPDATE を実行',
    desc: '更新系SQLをExecuteで実行します。件数はExecuteの第2引数で受け取れます。',
    code: `Dim cn As Object, affected As Long
Set cn = CreateObject("ADODB.Connection")
cn.Open "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=C:\\data\\db.accdb;"

cn.Execute "INSERT INTO ログ (日時, 内容) VALUES (Now(), '実行')", affected
cn.Execute "UPDATE 顧客 SET 状態='済' WHERE ID=1", affected
Debug.Print affected & " 件更新"
cn.Close` },
  { group: 'Access連携', label: 'トランザクション（一括確定/取消）',
    desc: '複数更新をまとめて確定・取消します。途中でエラーが出たら全部戻せます。',
    code: `Dim cn As Object
Set cn = CreateObject("ADODB.Connection")
cn.Open "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=C:\\data\\db.accdb;"
On Error GoTo Rollback

cn.BeginTrans
cn.Execute "UPDATE 口座 SET 残高=残高-1000 WHERE ID=1"
cn.Execute "UPDATE 口座 SET 残高=残高+1000 WHERE ID=2"
cn.CommitTrans
cn.Close
Exit Sub

Rollback:
    cn.RollbackTrans
    MsgBox "取消しました: " & Err.Description` },

  // ---- Webスクレイピング ----
  { group: 'Webスクレイピング', label: 'IEでページを開いて待つ',
    desc: 'InternetExplorerでページを開き、読み込み完了まで待ちます（レガシーですが社内システム操作で現役）。',
    code: `Dim ie As Object
Set ie = CreateObject("InternetExplorer.Application")
ie.Visible = True
ie.Navigate "https://example.com"

Do While ie.Busy Or ie.readyState <> 4
    DoEvents
Loop

Debug.Print ie.document.Title
ie.Quit
Set ie = Nothing` },
  { group: 'Webスクレイピング', label: 'HTMLの要素を取得',
    desc: '取得したHTMLから要素を拾います。id・タグ名・クラス名で取得できます。',
    code: `Dim doc As Object
Set doc = ie.document

Debug.Print doc.getElementById("title").innerText
Debug.Print doc.getElementsByTagName("h1")(0).innerText

Dim el As Object
For Each el In doc.getElementsByClassName("price")
    Debug.Print el.innerText
Next el` },
  { group: 'Webスクレイピング', label: 'HTMLテーブルをシートへ取り込み',
    desc: 'ページ内の表を行×セルでたどってシートに転記します。',
    code: `Dim tbl As Object, r As Long, c As Long
Set tbl = ie.document.getElementsByTagName("table")(0)

For r = 0 To tbl.Rows.Length - 1
    For c = 0 To tbl.Rows(r).Cells.Length - 1
        ws.Cells(r + 1, c + 1).Value = tbl.Rows(r).Cells(c).innerText
    Next c
Next r` },

  // ---- テスト・検証 ----
  { group: 'テスト・検証', label: '簡易アサーション関数',
    desc: '期待値と実際値を比較し、違えばイミディエイトに記録します。自作関数の動作確認に使えます。',
    code: `Private failCount As Long

Sub AssertEqual(actual As Variant, expected As Variant, testName As String)
    If actual = expected Then
        Debug.Print "PASS: " & testName
    Else
        failCount = failCount + 1
        Debug.Print "FAIL: " & testName & _
            "  期待=" & expected & " 実際=" & actual
    End If
End Sub

Sub RunTests()
    failCount = 0
    AssertEqual 税込(100), 110, "税込計算"
    AssertEqual UCase("abc"), "ABC", "大文字化"
    Debug.Print "--- 失敗 " & failCount & " 件 ---"
End Sub` },
  { group: 'テスト・検証', label: '処理前後で件数を検証',
    desc: '想定通りの件数が処理されたかをチェックし、ずれたら警告します。',
    code: `Dim before As Long, after As Long
before = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row - 1

' ...データ追加処理...

after = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row - 1
If after <> before + expectedAdd Then
    MsgBox "件数が想定と異なります: " & before & " → " & after, vbExclamation
End If` },

  // ---- 2表の突合 ----
  { group: '突合・照合', label: '2つの表を突合（Dictionary）',
    desc: 'マスタをDictionaryに載せ、対象表のキーが存在するか高速に照合します。VLOOKUP多用より速いです。',
    code: `Dim dic As Object, i As Long
Set dic = CreateObject("Scripting.Dictionary")

' マスタ（Sheet2）をキー→値で読み込み
Dim m As Worksheet: Set m = Worksheets("マスタ")
For i = 2 To m.Cells(m.Rows.Count, "A").End(xlUp).Row
    dic(CStr(m.Cells(i, "A").Value)) = m.Cells(i, "B").Value
Next i

' 対象表と照合
For i = 2 To ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    Dim key As String: key = CStr(ws.Cells(i, "A").Value)
    If dic.Exists(key) Then
        ws.Cells(i, "C").Value = dic(key)     ' 一致 → 値を転記
    Else
        ws.Cells(i, "C").Value = "マスタなし"  ' 不一致
    End If
Next i` },
  { group: '突合・照合', label: '差分（片方にしかない行）を抽出',
    desc: '2つのキー集合を比較し、A表のみ・B表のみに存在するキーを洗い出します。',
    code: `Dim a As Object, b As Object, k As Variant
Set a = CreateObject("Scripting.Dictionary")
Set b = CreateObject("Scripting.Dictionary")
' a, b にそれぞれのキーを Add 済みとする

For Each k In a.Keys
    If Not b.Exists(k) Then Debug.Print "A のみ: " & k
Next k
For Each k In b.Keys
    If Not a.Exists(k) Then Debug.Print "B のみ: " & k
Next k` },

  // ---- 順位・ランク ----
  { group: '順位・ランク', label: '順位を付ける（Rank）',
    desc: 'WorksheetFunction.Rankで各行に順位を書き込みます。',
    code: `Dim rng As Range, i As Long, lastRow As Long
lastRow = ws.Cells(ws.Rows.Count, "B").End(xlUp).Row
Set rng = ws.Range("B2:B" & lastRow)

For i = 2 To lastRow
    ws.Cells(i, "C").Value = _
        Application.WorksheetFunction.Rank(ws.Cells(i, "B").Value, rng)
Next i` },

  // ---- CSV・文字コード ----
  { group: 'CSV・文字コード', label: 'CSVを1行ずつSplitで取り込み',
    desc: 'カンマ区切りを配列に分割してシートへ。ダブルクォート内カンマが無い単純CSV向けの軽量版です。',
    code: `Dim ff As Integer, line As String, r As Long, cols As Variant
ff = FreeFile
Open "C:\\data\\input.csv" For Input As #ff
r = 1
Do Until EOF(ff)
    Line Input #ff, line
    cols = Split(line, ",")
    ws.Range(ws.Cells(r, 1), ws.Cells(r, UBound(cols) + 1)).Value = cols
    r = r + 1
Loop
Close #ff` },
  { group: 'CSV・文字コード', label: 'UTF-8で読み書き（ADODB.Stream）',
    desc: '文字コードを指定してテキストを読み書きします。UTF-8のCSV出力で文字化けを防げます。',
    code: `' 書き込み
Dim st As Object
Set st = CreateObject("ADODB.Stream")
st.Type = 2                 ' adTypeText
st.Charset = "UTF-8"
st.Open
st.WriteText "名前,金額" & vbCrLf & "山田,1000"
st.SaveToFile "C:\\data\\out.csv", 2   ' 2=上書き
st.Close

' 読み込み
st.Open
st.Charset = "UTF-8"
st.LoadFromFile "C:\\data\\out.csv"
Debug.Print st.ReadText
st.Close` },

  // ---- Outlook（応用） ----
  { group: 'Outlook（応用）', label: '受信トレイのメールを読む',
    desc: '受信トレイの新しいメールから件名・差出人を取り出します。',
    code: `Dim ol As Object, ns As Object, inbox As Object, mail As Object, i As Long
Set ol = CreateObject("Outlook.Application")
Set ns = ol.GetNamespace("MAPI")
Set inbox = ns.GetDefaultFolder(6)      ' 6 = olFolderInbox

For i = inbox.Items.Count To inbox.Items.Count - 9 Step -1
    If i < 1 Then Exit For
    Set mail = inbox.Items(i)
    Debug.Print mail.ReceivedTime, mail.SenderName, mail.Subject
Next i` },
  { group: 'Outlook（応用）', label: '添付ファイルを保存',
    desc: 'メールの添付ファイルを指定フォルダへ保存します。',
    code: `Dim att As Object
For Each att In mail.Attachments
    att.SaveAsFile "C:\\data\\添付\\" & att.FileName
Next att` },

  // ---- PowerPoint連携 ----
  { group: 'PowerPoint連携', label: 'スライドにExcelの範囲を貼付',
    desc: 'PowerPointを起動し、コピーした範囲を図としてスライドに貼り付けます。',
    code: `Dim pp As Object, pres As Object, sld As Object
Set pp = CreateObject("PowerPoint.Application")
pp.Visible = True
Set pres = pp.Presentations.Add
Set sld = pres.Slides.Add(1, 12)        ' 12 = ppLayoutBlank

ws.Range("A1:E10").CopyPicture Appearance:=xlScreen, Format:=xlPicture
sld.Shapes.Paste` },

  // ---- 進捗表示 ----
  { group: '進捗表示', label: 'セルで簡易プログレスバー',
    desc: '専用フォーム無しで進捗を可視化します。タイトルバーやセルの塗りで割合を表現します。',
    code: `Dim i As Long, pct As Double
For i = 1 To lastRow
    ' ...処理...
    If i Mod 50 = 0 Then
        pct = i / lastRow
        Application.StatusBar = "進捗 " & Format(pct, "0%") & _
            "  [" & String(Int(pct * 20), "|") & Space(20 - Int(pct * 20)) & "]"
        DoEvents
    End If
Next i
Application.StatusBar = False` },

  // ---- シート操作（応用） ----
  { group: 'シート操作（応用）', label: 'シート名を一括変更',
    desc: '全シートに連番や日付の名前を付け直します。重複名エラーに注意します。',
    code: `Dim i As Long
For i = 1 To ThisWorkbook.Worksheets.Count
    ThisWorkbook.Worksheets(i).Name = "Sheet_" & Format(i, "00")
Next i` },
  { group: 'シート操作（応用）', label: 'シートの並べ替え（名前順）',
    desc: 'シートを名前の昇順に並べ替えます。Moveで前へ詰めていきます。',
    code: `Dim i As Long, j As Long
With ThisWorkbook
    For i = 1 To .Worksheets.Count - 1
        For j = i + 1 To .Worksheets.Count
            If .Worksheets(j).Name < .Worksheets(i).Name Then
                .Worksheets(j).Move Before:=.Worksheets(i)
            End If
        Next j
    Next i
End With` },

  // ---- 表示・ウィンドウ ----
  { group: '表示・ウィンドウ', label: 'ウィンドウ枠の固定・表示調整',
    desc: '先頭行の固定、目盛線や見出しの非表示など見た目を整えます。',
    code: `With ActiveWindow
    .SplitRow = 1
    .FreezePanes = True         ' 1行目を固定
    .DisplayGridlines = False   ' 目盛線を消す
    .DisplayHeadings = False    ' 行列番号を消す
    .Zoom = 90
End With` },

  // ---- Application設定 ----
  { group: 'Application設定', label: '確認・警告をまとめて制御',
    desc: 'マクロ実行中の各種ダイアログや自動動作をまとめて止め、最後に戻す設定例です。',
    code: `With Application
    .ScreenUpdating = False
    .DisplayAlerts = False
    .EnableEvents = False
    .Calculation = xlCalculationManual
    .Cursor = xlWait          ' 砂時計カーソル
End With

' ...処理...

With Application
    .Cursor = xlDefault
    .Calculation = xlCalculationAutomatic
    .EnableEvents = True
    .DisplayAlerts = True
    .ScreenUpdating = True
End With` },

  // ---- シェル・圧縮 ----
  { group: 'シェル・圧縮', label: '外部プログラムを起動（Shell）',
    desc: '関連付けられたアプリでファイルを開いたり、実行ファイルを起動します。',
    code: `' メモ帳でファイルを開く
Shell "notepad.exe C:\\data\\memo.txt", vbNormalFocus

' 関連付けアプリで開く（PDFなど）
CreateObject("Shell.Application").Open ("C:\\data\\report.pdf")` },
  { group: 'シェル・圧縮', label: 'フォルダをZIP圧縮',
    desc: 'Shell.Applicationを使い、追加の参照設定なしでフォルダをZIPにまとめます。',
    code: `Dim zipPath As String, srcPath As String, sh As Object
zipPath = "C:\\data\\archive.zip"
srcPath = "C:\\data\\target"

' 空のZIPを作る
Dim ff As Integer: ff = FreeFile
Open zipPath For Output As #ff
Print #ff, Chr(80) & Chr(75) & Chr(5) & Chr(6) & String(18, Chr(0))
Close #ff

Set sh = CreateObject("Shell.Application")
sh.Namespace(zipPath).CopyHere sh.Namespace(srcPath).Items
Application.Wait Now + TimeValue("00:00:02")   ' 圧縮完了待ち` },

  // ---- ブック終了 ----
  { group: 'ブック終了', label: '保存して閉じる / Excel終了',
    desc: 'ブックを保存して閉じる、あるいはExcel自体を終了する書き方です。',
    code: `ThisWorkbook.Save                       ' 上書き保存
ThisWorkbook.Close SaveChanges:=True    ' 保存して閉じる

' 開いているブックが自分だけならExcelごと終了
If Workbooks.Count = 1 Then Application.Quit` },

  // ---- 入力規則 ----
  { group: '入力規則', label: 'ドロップダウンリストを設定',
    desc: 'セルに選択肢のドロップダウン（入力規則）を設定します。別範囲を参照する場合は Formula1 に "=範囲" を指定します。',
    code: `With ws.Range("B2:B100").Validation
    .Delete
    .Add Type:=xlValidateList, Formula1:="りんご,みかん,ぶどう"
    .InCellDropdown = True
    .ShowError = True
End With` },
  { group: '入力規則', label: '数値範囲の入力規則',
    desc: '1〜100の整数だけ入力できるように制限します。範囲外はエラーメッセージを表示します。',
    code: `With ws.Range("C2:C100").Validation
    .Delete
    .Add Type:=xlValidateWholeNumber, AlertStyle:=xlValidAlertStop, _
         Operator:=xlBetween, Formula1:="1", Formula2:="100"
    .ErrorMessage = "1〜100 の整数を入力してください"
End With` },
  { group: '入力規則', label: '入力規則を解除',
    desc: '設定済みの入力規則をまとめて削除します。',
    code: `ws.Range("B2:C100").Validation.Delete` },

  // ---- テーブル（ListObject） ----
  { group: 'テーブル', label: '範囲をテーブルに変換',
    desc: '表範囲をExcelテーブル（ListObject）に変換し、名前を付けます。以後は構造化参照が使えます。',
    code: `Dim lo As ListObject
Set lo = ws.ListObjects.Add(xlSrcRange, ws.Range("A1").CurrentRegion, , xlYes)
lo.Name = "売上テーブル"` },
  { group: 'テーブル', label: 'テーブルに行を追加',
    desc: 'テーブルの末尾に1行追加して値を入れます。テーブルなら書式・数式が自動で引き継がれます。',
    code: `Dim lo As ListObject, r As ListRow
Set lo = ws.ListObjects("売上テーブル")
Set r = lo.ListRows.Add
r.Range(1, 1).Value = "A001"
r.Range(1, 2).Value = 1000` },
  { group: 'テーブル', label: 'テーブルの列を配列で取得',
    desc: '指定列のデータ部分（見出しを除く）を一括取得します。列名で参照できるのがテーブルの利点です。',
    code: `Dim lo As ListObject, arr As Variant
Set lo = ws.ListObjects("売上テーブル")
arr = lo.ListColumns("金額").DataBodyRange.Value` },

  // ---- セル選択（応用） ----
  { group: 'セル選択（応用）', label: '可視セルのみ処理',
    desc: 'オートフィルタや非表示行を除いた「見えているセル」だけを対象にします。抽出結果の処理に必須です。',
    code: `Dim c As Range
On Error Resume Next   ' 可視セルが無い場合の回避
For Each c In ws.Range("A2:A100").SpecialCells(xlCellTypeVisible)
    Debug.Print c.Value
Next c
On Error GoTo 0` },
  { group: 'セル選択（応用）', label: '数式セル/定数セルだけ',
    desc: '数式が入ったセル、または手入力の値だけを選び出します。数式の一括確認や値の一括クリアに使えます。',
    code: `Dim rngF As Range, rngC As Range
On Error Resume Next
Set rngF = ws.UsedRange.SpecialCells(xlCellTypeFormulas)  ' 数式セル
Set rngC = ws.UsedRange.SpecialCells(xlCellTypeConstants) ' 値セル
On Error GoTo 0
If Not rngC Is Nothing Then rngC.ClearContents            ' 値だけ消す例` },
  { group: 'セル選択（応用）', label: '結合セルの値と範囲',
    desc: '結合セルは左上セルにしか値がありません。MergeArea で結合範囲全体を取得できます。',
    code: `Dim c As Range
Set c = ws.Range("B2")
If c.MergeCells Then
    Debug.Print c.MergeArea.Address, c.MergeArea.Cells(1, 1).Value
End If` },

  // ---- 数式・関数（応用） ----
  { group: '数式・関数（応用）', label: 'SUMPRODUCTで複数条件集計',
    desc: '複数条件のカウント/合計を1つの数式で行います。SUMIFSが使えない複雑な条件でも柔軟です。',
    code: `Dim wf As WorksheetFunction
Set wf = Application.WorksheetFunction
' 地域=東京 かつ 金額>=100 の件数
cnt = wf.SumProduct( _
    wf.Index((ws.Range("A2:A100") = "東京") * (ws.Range("C2:C100") >= 100), 0))` },
  { group: '数式・関数（応用）', label: 'Index+Matchで二方向検索',
    desc: '行見出しと列見出しの交点の値を取り出します（VLOOKUP+HLOOKUP相当）。',
    code: `Dim wf As WorksheetFunction
Set wf = Application.WorksheetFunction
Dim r As Long, c As Long
r = wf.Match("商品A", ws.Range("A2:A100"), 0)
c = wf.Match("4月", ws.Range("B1:M1"), 0)
result = ws.Range("B2:M100").Cells(r, c).Value` },
  { group: '数式・関数（応用）', label: '配列数式を入力（FormulaArray）',
    desc: 'Ctrl+Shift+Enter が必要な配列数式をコードから入力します。',
    code: `ws.Range("E1").FormulaArray = "=SUM(IF(A1:A100>0,A1:A100))"` },

  // ---- 日付（応用） ----
  { group: '日付（応用）', label: '営業日をN日進める',
    desc: '土日を除いて指定日数だけ進めた日付を求めます（祝日は第3引数の範囲で指定可）。',
    code: `Dim d As Date
d = Application.WorksheetFunction.WorkDay(Date, 5)   ' 5営業日後
Debug.Print Format(d, "yyyy/mm/dd(aaa)")` },
  { group: '日付（応用）', label: '月初〜月末の日付リスト',
    desc: '当月の全日付を1列に書き出します。カレンダーや日次集計表の枠作りに使えます。',
    code: `Dim first As Date, last As Date, d As Date, r As Long
first = DateSerial(Year(Date), Month(Date), 1)
last = DateSerial(Year(Date), Month(Date) + 1, 0)
r = 1
For d = first To last
    ws.Cells(r, 1).Value = d
    ws.Cells(r, 1).NumberFormatLocal = "m/d(aaa)"
    r = r + 1
Next d` },
  { group: '日付（応用）', label: '週番号・年度を求める',
    desc: 'ISO週番号や、4月始まりの年度を計算します。',
    code: `week = Application.WorksheetFunction.IsoWeekNum(Date)
' 4月始まりの年度
nendo = Year(Date): If Month(Date) < 4 Then nendo = nendo - 1
Debug.Print "第" & week & "週", nendo & "年度"` },

  // ---- 文字列（実務） ----
  { group: '文字列（実務）', label: '正規表現で数字/記号を抽出・除去',
    desc: 'VBScript.RegExp で数字だけ抜き出す、記号を除去するなどを一括で行います。',
    code: `Dim re As Object
Set re = CreateObject("VBScript.RegExp")
re.Global = True

re.Pattern = "[^0-9]"           ' 数字以外を削除
onlyNum = re.Replace("TEL:03-1234-5678", "")   ' → 0312345678

re.Pattern = "[!-/:-@]"          ' 記号を削除
cleaned = re.Replace(s, "")` },
  { group: '文字列（実務）', label: 'ふりがなを取得（Phonetic）',
    desc: 'セルに入力された漢字のふりがなを取り出します（IMEで入力された読み情報が対象）。',
    code: `Dim yomi As String
yomi = ws.Range("A2").Phonetic.Text
Debug.Print yomi` },
  { group: '文字列（実務）', label: '文字種のクレンジング',
    desc: '全角英数を半角に、半角カナを全角に統一し、前後空白を除去して表記を整えます。',
    code: `Dim s As String
s = ws.Range("A2").Value
s = StrConv(s, vbNarrow)     ' 全角英数記号 → 半角
s = StrConv(s, vbWide)       ' ※カナも全角化したい場合はこの行だけ使う
s = Trim(Replace(s, "　", " "))
ws.Range("A2").Value = s` },

  // ---- 数値（実務） ----
  { group: '数値（実務）', label: '指定単位で切り上げ/切り捨て',
    desc: '100円単位・1000円単位などの丸めを行います。Ceiling/Floor を使います。',
    code: `Dim wf As WorksheetFunction
Set wf = Application.WorksheetFunction
up = wf.Ceiling(1234, 100)    ' 1300（100単位で切り上げ）
down = wf.Floor(1234, 100)    ' 1200（100単位で切り捨て）` },
  { group: '数値（実務）', label: '消費税の計算',
    desc: '税抜→税込、税込→税抜、内税額の計算例です（税率10%、端数切り捨て）。',
    code: `Const RATE As Double = 0.1
zeinuki = 1000
zeikomi = Int(zeinuki * (1 + RATE))          ' 税込
modoshi = Int(zeikomi / (1 + RATE))          ' 税込→税抜
zeigaku = zeikomi - Int(zeikomi / (1 + RATE)) ' 内税額` },
  { group: '数値（実務）', label: '10進 ⇔ 2進/16進 変換',
    desc: '基数変換を行います。VBAの Hex/Oct 関数と WorksheetFunction を組み合わせます。',
    code: `Debug.Print Hex(255)                                   ' FF
Debug.Print Application.WorksheetFunction.Dec2Bin(10)  ' 1010
Debug.Print CLng("&H" & "FF")                          ' 255（16進→10進）` },

  // ---- 転記・帳票 ----
  { group: '転記・帳票', label: '1行データを帳票へ差し込み',
    desc: 'データ1行を、別シートの帳票テンプレートの各セルへ差し込みます。請求書・伝票の作成に使えます。',
    code: `Dim src As Worksheet, form As Worksheet, i As Long
Set src = ThisWorkbook.Worksheets("データ")
Set form = ThisWorkbook.Worksheets("帳票")

i = 2   ' 対象行
form.Range("C3").Value = src.Cells(i, "A").Value   ' 宛名
form.Range("C5").Value = src.Cells(i, "B").Value   ' 日付
form.Range("C7").Value = src.Cells(i, "C").Value   ' 金額` },
  { group: '転記・帳票', label: '明細を帳票に連続印刷',
    desc: 'データの各行を帳票に差し込みながら連続で印刷（またはPDF出力）します。',
    code: `Dim src As Worksheet, form As Worksheet, i As Long, lastRow As Long
Set src = ThisWorkbook.Worksheets("データ")
Set form = ThisWorkbook.Worksheets("帳票")
lastRow = src.Cells(src.Rows.Count, "A").End(xlUp).Row

For i = 2 To lastRow
    form.Range("C3").Value = src.Cells(i, "A").Value
    form.Range("C7").Value = src.Cells(i, "C").Value
    form.PrintOut                       ' 印刷
    ' form.ExportAsFixedFormat xlTypePDF, "C:\\out\\" & i & ".pdf"  ' PDFなら
Next i` },

  // ---- 検索（応用） ----
  { group: '検索（応用）', label: '全シートを横断して検索',
    desc: 'ブック内の全シートから値を検索し、見つかった場所を一覧に出します。',
    code: `Dim ws As Worksheet, c As Range, firstAddr As String, keyword As String
keyword = "対象"
For Each ws In ThisWorkbook.Worksheets
    Set c = ws.UsedRange.Find(What:=keyword, LookAt:=xlPart)
    If Not c Is Nothing Then
        firstAddr = c.Address
        Do
            Debug.Print ws.Name & "!" & c.Address, c.Value
            Set c = ws.UsedRange.FindNext(c)
        Loop While Not c Is Nothing And c.Address <> firstAddr
    End If
Next ws` },

  // ---- 書式（応用） ----
  { group: '書式（応用）', label: '1行おきに色（縞模様）',
    desc: '偶数行に薄い色を付けて読みやすくします。条件付き書式なら行の増減にも自動追従します。',
    code: `With ws.Range("A2:E100").FormatConditions
    .Delete
    .Add Type:=xlExpression, Formula1:="=MOD(ROW(),2)=0"
    .Item(1).Interior.Color = RGB(242, 246, 252)
End With` },
  { group: '書式（応用）', label: '重複値に色を付ける',
    desc: '重複しているセルを条件付き書式で強調します。データチェックに便利です。',
    code: `With ws.Range("A2:A100").FormatConditions
    .Delete
    .AddUniqueValues
    .Item(1).DupeUnique = xlDuplicate
    .Item(1).Interior.Color = RGB(255, 199, 206)
End With` },
  { group: '書式（応用）', label: 'データバーを表示',
    desc: '数値の大小をセル内の横棒で可視化します（条件付き書式のデータバー）。',
    code: `With ws.Range("C2:C100").FormatConditions
    .Delete
    .AddDatabar
    .Item(1).BarColor.Color = RGB(99, 142, 198)
End With` },

  // ---- ブック・シート（実務） ----
  { group: 'ブック・シート（実務）', label: 'シートを存在保証して取得',
    desc: '指定名のシートを返し、無ければ作成してから返す関数です。出力先シートの準備に便利です。',
    code: `Private Function GetOrCreateSheet(nm As String) As Worksheet
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(nm)
    On Error GoTo 0
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
        ws.Name = nm
    End If
    Set GetOrCreateSheet = ws
End Function` },
  { group: 'ブック・シート（実務）', label: '数式を値化して別ブック保存',
    desc: 'シートを新規ブックにコピーし、数式を値に固定してから保存します。配布用の確定データ作成に使います。',
    code: `ws.Copy   ' 新規ブックにコピー
With ActiveWorkbook.Worksheets(1).UsedRange
    .Value = .Value    ' 数式 → 値
End With
ActiveWorkbook.SaveAs "C:\\out\\確定_" & Format(Date, "yyyymmdd") & ".xlsx", xlOpenXMLWorkbook
ActiveWorkbook.Close` },
  { group: 'ブック・シート（実務）', label: '全シートを1つのPDFに',
    desc: 'ブック内の全シートをまとめて1つのPDFに出力します。',
    code: `ThisWorkbook.Worksheets.Select
ActiveSheet.ExportAsFixedFormat _
    Type:=xlTypePDF, Filename:="C:\\out\\全体.pdf", OpenAfterPublish:=False
ThisWorkbook.Worksheets(1).Select   ' 選択を戻す` },

  // ---- エラー・ログ（応用） ----
  { group: 'エラー・ログ（応用）', label: 'エラーをログシートに記録',
    desc: 'エラー内容を日時つきで「ログ」シートに追記します。無人実行の原因調査に役立ちます。',
    code: `Private Sub LogError()
    Dim ws As Worksheet, r As Long
    Set ws = ThisWorkbook.Worksheets("ログ")
    r = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
    ws.Cells(r, 1).Value = Now
    ws.Cells(r, 2).Value = Err.Number
    ws.Cells(r, 3).Value = Err.Description
End Sub` },
  { group: 'エラー・ログ（応用）', label: '失敗したらN回リトライ',
    desc: '一時的なエラー（ファイルロック・通信など）に備え、数回まで再試行します。',
    code: `Dim attempt As Long
For attempt = 1 To 3
    On Error Resume Next
    ' 失敗し得る処理（例：ブックを開く）
    Workbooks.Open "C:\\data\\input.xlsx"
    If Err.Number = 0 Then Exit For
    On Error GoTo 0
    Application.Wait Now + TimeValue("00:00:02")   ' 2秒待って再試行
Next attempt
On Error GoTo 0` },

  // ---- 配列・コレクション（応用） ----
  { group: 'コレクション（応用）', label: '配列から重複を除く',
    desc: '配列を受け取り、重複を除いた配列を返す関数です。Dictionary を内部で使います。',
    code: `Private Function UniqueArray(src As Variant) As Variant
    Dim dic As Object, v As Variant
    Set dic = CreateObject("Scripting.Dictionary")
    For Each v In src
        If Not dic.Exists(v) Then dic.Add v, True
    Next v
    UniqueArray = dic.Keys
End Function` },
  { group: 'コレクション（応用）', label: '配列を条件でフィルタ',
    desc: '条件に合う要素だけを詰め直した配列を返します。',
    code: `Private Function FilterArray(src As Variant) As Variant
    Dim res() As Variant, n As Long, v As Variant
    ReDim res(LBound(src) To UBound(src))
    n = LBound(src) - 1
    For Each v In src
        If v >= 100 Then n = n + 1: res(n) = v   ' 条件
    Next v
    If n < LBound(src) Then
        FilterArray = Array()
    Else
        ReDim Preserve res(LBound(src) To n)
        FilterArray = res
    End If
End Function` },

  // ---- クラス（応用） ----
  { group: 'クラス（応用）', label: 'コレクションを包むクラス',
    desc: '内部にCollectionを持ち、Add/Item/Count/For Eachを提供するコンテナクラスの骨格です。',
    code: `' === クラスモジュール "Items" ===
Private col As Collection

Private Sub Class_Initialize()
    Set col = New Collection
End Sub

Public Sub Add(item As Variant)
    col.Add item
End Sub
Public Property Get Item(i As Long) As Variant
    Item = col(i)
End Property
Public Property Get Count() As Long
    Count = col.Count
End Property` },
  { group: 'クラス（応用）', label: 'シートイベントを拾う（WithEvents）',
    desc: 'クラスモジュールで WithEvents を使い、任意シートの変更イベントを受け取る仕組みです。',
    code: `' === クラスモジュール "SheetWatcher" ===
Public WithEvents ws As Worksheet

Private Sub ws_Change(ByVal Target As Range)
    Debug.Print "変更: " & Target.Address
End Sub

' === 標準モジュール（登録）===
' Dim watcher As New SheetWatcher
' Set watcher.ws = ThisWorkbook.Worksheets("データ")` },

  // ---- ユーザーフォーム（実務） ----
  { group: 'ユーザーフォーム（実務）', label: 'リストボックスの複数選択を取得',
    desc: '複数選択リストボックスで選ばれた項目を集めます。',
    code: `' === UserForm モジュール ===
Dim i As Long, sel As String
For i = 0 To Me.ListBox1.ListCount - 1
    If Me.ListBox1.Selected(i) Then
        sel = sel & Me.ListBox1.List(i) & vbCrLf
    End If
Next i
MsgBox sel` },
  { group: 'ユーザーフォーム（実務）', label: '進捗フォームを更新',
    desc: '処理の進捗をフォーム上のラベルとバー（枠の幅）で表現します。DoEventsで再描画します。',
    code: `' 進捗フォーム(frmProgress)にラベルlblとバーbarを配置しておく
frmProgress.Show vbModeless
Dim i As Long, pct As Double
For i = 1 To lastRow
    ' 処理
    pct = i / lastRow
    frmProgress.lbl.Caption = Format(pct, "0%")
    frmProgress.bar.Width = 200 * pct
    DoEvents
Next i
Unload frmProgress` },

  // ---- 接続・更新 ----
  { group: '接続・更新', label: '全ての接続/クエリを更新',
    desc: '外部データ接続やPower Queryをまとめて更新します。バックグラウンド更新は無効化すると完了を待てます。',
    code: `Dim cn As WorkbookConnection
For Each cn In ThisWorkbook.Connections
    On Error Resume Next
    cn.OLEDBConnection.BackgroundQuery = False
    cn.ODBCConnection.BackgroundQuery = False
    On Error GoTo 0
Next cn
ThisWorkbook.RefreshAll` },
  { group: '接続・更新', label: 'ピボットを全て更新',
    desc: 'ブック内の全ピボットテーブルのキャッシュを更新します。',
    code: `Dim pc As PivotCache
For Each pc In ThisWorkbook.PivotCaches
    pc.Refresh
Next pc` },

  // ---- Windows API（応用） ----
  { group: 'Windows API（応用）', label: '画面解像度を取得',
    desc: 'GetSystemMetrics APIで画面の幅・高さ（ピクセル）を取得します。フォームの中央配置などに使えます。',
    code: `' === 標準モジュール宣言セクション ===
#If VBA7 Then
    Private Declare PtrSafe Function GetSystemMetrics Lib "user32" (ByVal n As Long) As Long
#Else
    Private Declare Function GetSystemMetrics Lib "user32" (ByVal n As Long) As Long
#End If

Sub ShowScreenSize()
    Debug.Print "幅: " & GetSystemMetrics(0), "高さ: " & GetSystemMetrics(1)
End Sub` },

  // ---- 行・列操作 ----
  { group: '行・列操作', label: '行・列の挿入/削除',
    desc: '行や列を挿入・削除します。Shiftで方向を指定できます。',
    code: `ws.Rows(5).Insert Shift:=xlDown       ' 5行目に1行挿入
ws.Rows("5:7").Delete                  ' 5〜7行を削除
ws.Columns("B").Insert                 ' B列に挿入
ws.Columns("B:C").Delete               ' B〜C列を削除` },
  { group: '行・列操作', label: '行・列の表示/非表示',
    desc: '列や行を隠す・再表示します。全体を再表示するとまとめて戻せます。',
    code: `ws.Columns("B:D").Hidden = True        ' B〜D列を非表示
ws.Rows("10:20").Hidden = True         ' 10〜20行を非表示
ws.Cells.EntireColumn.Hidden = False   ' 全列を再表示
ws.Cells.EntireRow.Hidden = False      ' 全行を再表示` },
  { group: '行・列操作', label: '空白列を削除',
    desc: '使用範囲の中で、データが1件も無い列を右から削除します。',
    code: `Dim c As Long
For c = ws.UsedRange.Columns.Count To 1 Step -1
    If Application.WorksheetFunction.CountA(ws.Columns(c)) = 0 Then ws.Columns(c).Delete
Next c` },
  { group: '行・列操作', label: '行のグループ化（折りたたみ）',
    desc: '行をグループ化してアウトライン（折りたたみ）を作ります。明細の一時非表示に便利です。',
    code: `ws.Rows("5:10").Group
ws.Outline.ShowLevels RowLevels:=1     ' 折りたたむ
' ws.Rows("5:10").Ungroup             ' 解除` },

  // ---- コピー・貼り付け ----
  { group: 'コピー・貼り付け', label: '値のみ貼り付け',
    desc: '数式ではなく計算結果の値だけを貼り付けます。CutCopyMode は最後に解除します。',
    code: `ws.Range("A1:C10").Copy
ws.Range("E1").PasteSpecial Paste:=xlPasteValues
Application.CutCopyMode = False` },
  { group: 'コピー・貼り付け', label: '書式のみコピー',
    desc: '1つのセルの書式を別の範囲に適用します（書式のコピー）。',
    code: `ws.Range("A1").Copy
ws.Range("B1:B20").PasteSpecial Paste:=xlPasteFormats
Application.CutCopyMode = False` },
  { group: 'コピー・貼り付け', label: '転置して貼り付け',
    desc: '縦横を入れ替えて貼り付けます。',
    code: `ws.Range("A1:A5").Copy
ws.Range("C1").PasteSpecial Paste:=xlPasteAll, Transpose:=True
Application.CutCopyMode = False` },

  // ---- 連番・オートフィル ----
  { group: '連番・オートフィル', label: '連番を振る',
    desc: '数式または直接値で連番を入力します。数式版は行の増減に追従します。',
    code: `' 数式で連番
ws.Range("A2:A" & lastRow).Formula = "=ROW()-1"
' 値で連番
Dim i As Long
For i = 2 To lastRow
    ws.Cells(i, "A").Value = i - 1
Next i` },
  { group: '連番・オートフィル', label: '数式をオートフィル',
    desc: '先頭セルの数式を最終行まで一気にコピーします。',
    code: `ws.Range("D2").Formula = "=B2*C2"
ws.Range("D2").AutoFill Destination:=ws.Range("D2:D" & lastRow)` },
  { group: '連番・オートフィル', label: '日付の連続入力',
    desc: '起点の日付から日単位・月単位で連続入力します。',
    code: `ws.Range("A2").Value = Date
ws.Range("A2").AutoFill Destination:=ws.Range("A2:A32"), Type:=xlFillDays
' 月単位なら Type:=xlFillMonths` },

  // ---- 条件式（応用） ----
  { group: '条件式（応用）', label: 'IIf / Choose / Switch',
    desc: '短い条件分岐を式で書く関数です。IIfは2択、Chooseは番号で選択、Switchは条件と値の組です。',
    code: `result = IIf(score >= 60, "合格", "不合格")
grade = Choose(rank, "松", "竹", "梅")              ' rank=1→松
label = Switch(x < 0, "負", x = 0, "ゼロ", x > 0, "正")` },

  // ---- 変換ユーティリティ ----
  { group: '変換ユーティリティ', label: 'Collection → 配列',
    desc: 'Collection の中身を配列に変換する関数です。',
    code: `Private Function ToArray(col As Collection) As Variant
    If col.Count = 0 Then ToArray = Array(): Exit Function
    Dim arr() As Variant, i As Long
    ReDim arr(1 To col.Count)
    For i = 1 To col.Count
        arr(i) = col(i)
    Next i
    ToArray = arr
End Function` },
  { group: '変換ユーティリティ', label: '範囲 → 1次元配列',
    desc: '1列の範囲を扱いやすい1次元配列にして返します（Range.Value は2次元になるため変換）。',
    code: `Private Function ColumnToArray(rng As Range) As Variant
    ColumnToArray = Application.Transpose(rng.Value)
End Function

' 使い方: arr = ColumnToArray(ws.Range("A2:A100"))  ' arr(1..n)` },

  // ---- ファイル情報 ----
  { group: 'ファイル情報', label: 'サイズ・更新日時を取得',
    desc: 'ファイルのサイズや最終更新日時を取得します。',
    code: `Dim fso As Object, f As Object
Set fso = CreateObject("Scripting.FileSystemObject")
Set f = fso.GetFile("C:\\data\\report.xlsx")
Debug.Print f.Size & " バイト", f.DateLastModified` },
  { group: 'ファイル情報', label: 'パスを分解する',
    desc: 'フルパスからドライブ・フォルダ・ファイル名・拡張子を取り出します。',
    code: `Dim fso As Object, p As String
Set fso = CreateObject("Scripting.FileSystemObject")
p = "C:\\data\\sub\\report.xlsx"
Debug.Print fso.GetParentFolderName(p)   ' C:\\data\\sub
Debug.Print fso.GetFileName(p)           ' report.xlsx
Debug.Print fso.GetBaseName(p)           ' report
Debug.Print fso.GetExtensionName(p)      ' xlsx` },
  { group: 'ファイル情報', label: '一時ファイル名を作る',
    desc: '一時フォルダに衝突しないファイル名を作ります。中間ファイルの出力に使えます。',
    code: `Dim fso As Object, tmp As String
Set fso = CreateObject("Scripting.FileSystemObject")
tmp = fso.GetSpecialFolder(2) & "\\" & fso.GetTempName   ' 2=一時フォルダ
Debug.Print tmp` },

  // ---- ブック（開き方） ----
  { group: 'ブック（開き方）', label: '読み取り専用/リンク更新なしで開く',
    desc: '元ファイルを変更しないよう読み取り専用で開き、外部リンクの更新確認も抑止します。',
    code: `Dim wb As Workbook
Set wb = Workbooks.Open( _
    Filename:="C:\\data\\input.xlsx", _
    ReadOnly:=True, _
    UpdateLinks:=0)` },
  { group: 'ブック（開き方）', label: 'パスワード付きブックを開く',
    desc: '読み取りパスワードが設定されたブックを開きます。',
    code: `Dim wb As Workbook
Set wb = Workbooks.Open("C:\\data\\secret.xlsx", Password:="pass")` },

  // ---- 色・背景 ----
  { group: '色・背景', label: '特定色のセルを数える',
    desc: '見本セルと同じ背景色のセル数を数える関数です（色での集計に）。',
    code: `Private Function CountByColor(rng As Range, sample As Range) As Long
    Dim c As Range, n As Long
    For Each c In rng
        If c.Interior.Color = sample.Interior.Color Then n = n + 1
    Next c
    CountByColor = n
End Function` },
  { group: '色・背景', label: '条件でセルを色分け',
    desc: '値に応じてコード側で背景色を変えます（固定の色分けなら条件付き書式より軽い場合も）。',
    code: `Dim c As Range
For Each c In ws.Range("C2:C100")
    If c.Value >= 100 Then
        c.Interior.Color = RGB(198, 239, 206)   ' 緑
    ElseIf c.Value < 0 Then
        c.Interior.Color = RGB(255, 199, 206)   ' 赤
    Else
        c.Interior.ColorIndex = xlNone
    End If
Next c` },

  // ---- 集計（実務） ----
  { group: '集計（実務）', label: 'クロス集計（Dictionary）',
    desc: '行キー×列キーで金額を集計します。ピボットを使わずに縦横集計したいときに。',
    code: `Dim dic As Object, i As Long, rk As String, ck As String
Set dic = CreateObject("Scripting.Dictionary")
For i = 2 To lastRow
    rk = ws.Cells(i, "A").Value    ' 行キー（例:地域）
    ck = ws.Cells(i, "B").Value    ' 列キー（例:月）
    If Not dic.Exists(rk) Then dic.Add rk, CreateObject("Scripting.Dictionary")
    dic(rk)(ck) = dic(rk)(ck) + ws.Cells(i, "C").Value
Next i
' dic(地域)(月) で金額を参照` },
  { group: '集計（実務）', label: '累計を計算',
    desc: '上から順に足し込んだ累計を隣の列に書き出します。',
    code: `Dim i As Long, run As Double
run = 0
For i = 2 To lastRow
    run = run + ws.Cells(i, "B").Value
    ws.Cells(i, "C").Value = run     ' 累計
Next i` },
  { group: '集計（実務）', label: '度数分布（出現回数）',
    desc: '値ごとの出現回数を数えます。集計表やヒストグラムの元データになります。',
    code: `Dim dic As Object, i As Long, k As Variant
Set dic = CreateObject("Scripting.Dictionary")
For i = 2 To lastRow
    k = ws.Cells(i, "A").Value
    dic(k) = dic(k) + 1
Next i
For Each k In dic.Keys
    Debug.Print k, dic(k)
Next k` },

  // ---- サンプリング ----
  { group: 'サンプリング', label: '重複なしランダム抽選',
    desc: '1〜N から k 個を重複なく選びます（Fisher-Yatesの部分シャッフル）。',
    code: `Dim pool() As Long, i As Long, j As Long, t As Long
Const N As Long = 100, K As Long = 5
ReDim pool(1 To N)
For i = 1 To N: pool(i) = i: Next i
Randomize
For i = 1 To K
    j = Int((N - i + 1) * Rnd) + i
    t = pool(i): pool(i) = pool(j): pool(j) = t
    Debug.Print pool(i)
Next i` },
  { group: 'サンプリング', label: '配列をシャッフル',
    desc: '配列の並びをランダムに入れ替えます。',
    code: `Private Sub Shuffle(arr As Variant)
    Dim i As Long, j As Long, t As Variant
    Randomize
    For i = UBound(arr) To LBound(arr) + 1 Step -1
        j = Int((i - LBound(arr) + 1) * Rnd) + LBound(arr)
        t = arr(i): arr(i) = arr(j): arr(j) = t
    Next i
End Sub` },

  // ---- 表記チェック ----
  { group: '表記チェック', label: '郵便番号/電話/メール判定',
    desc: 'よく使う入力形式を正規表現でまとめて判定できます。パターンを差し替えて使います。',
    code: `Dim re As Object
Set re = CreateObject("VBScript.RegExp")

re.Pattern = "^\\d{3}-?\\d{4}$"                       ' 郵便番号
re.Pattern = "^0\\d{1,4}-\\d{1,4}-\\d{4}$"            ' 電話番号
re.Pattern = "^[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}$"    ' メール

If re.Test(ws.Range("B2").Value) Then MsgBox "OK"` },
  { group: '表記チェック', label: '全角が含まれるか判定',
    desc: '文字列に全角文字が含まれるかを、バイト長との差で判定します。',
    code: `Private Function HasZenkaku(s As String) As Boolean
    HasZenkaku = (LenB(StrConv(s, vbFromUnicode)) <> Len(s))
End Function` },

  // ---- 一括クリア ----
  { group: '一括クリア', label: '全シートのコメントを削除',
    desc: 'ブック内すべてのシートのコメント（メモ）をまとめて削除します。',
    code: `Dim ws As Worksheet
For Each ws In ThisWorkbook.Worksheets
    ws.Cells.ClearComments
Next ws` },
  { group: '一括クリア', label: 'ハイパーリンクを一括削除',
    desc: 'シート内のハイパーリンクをすべて削除します（文字は残ります）。',
    code: `ws.Cells.Hyperlinks.Delete` },

  // ---- 画像・グラフ ----
  { group: '画像・グラフ', label: 'セルサイズに合わせて画像挿入',
    desc: '画像を指定セルの位置・大きさに合わせて挿入します。写真台帳などに使えます。',
    code: `Dim shp As Shape, tgt As Range
Set tgt = ws.Range("B2")
Set shp = ws.Shapes.AddPicture( _
    "C:\\img\\photo.jpg", False, True, tgt.Left, tgt.Top, -1, -1)
shp.LockAspectRatio = msoFalse
shp.Width = tgt.Width
shp.Height = tgt.Height` },
  { group: '画像・グラフ', label: 'シートの全グラフを削除',
    desc: 'シート上のすべての埋め込みグラフを削除します。',
    code: `Dim co As ChartObject
For Each co In ws.ChartObjects
    co.Delete
Next co` },

  // ---- Excel操作（応用） ----
  { group: 'Excel操作（応用）', label: 'R1C1参照形式に切替',
    desc: '列がA/B/CではなくR1C1数値表示になります。マクロ記録の解読時などに。',
    code: `Application.ReferenceStyle = xlR1C1   ' R1C1表示に
' Application.ReferenceStyle = xlA1   ' 通常に戻す` },
  { group: 'Excel操作（応用）', label: '指定セルへスクロール',
    desc: '画面を指定セルまでスクロールして選択します。処理後に見せたい位置へ移動できます。',
    code: `Application.Goto ws.Range("A100"), Scroll:=True` },
  { group: 'Excel操作（応用）', label: '選択範囲の情報を表示',
    desc: '現在の選択範囲のアドレス・行数・列数・セル数を確認します。',
    code: `With Selection
    Debug.Print "アドレス: " & .Address
    Debug.Print "行数: " & .Rows.Count & "  列数: " & .Columns.Count
    Debug.Print "セル数: " & .Count
End With` },

  // ---- セル参照・移動 ----
  { group: 'セル参照・移動', label: '2点でRange範囲を作る',
    desc: '開始セルと終了セルを変数で指定して範囲を作ります。動的な範囲指定に便利です。',
    code: `Dim rng As Range
Set rng = ws.Range(ws.Cells(2, 1), ws.Cells(lastRow, 5))` },
  { group: 'セル参照・移動', label: 'アクティブセルを起点に移動',
    desc: 'ActiveCell を基準に相対移動して値を参照・設定します。',
    code: `ActiveCell.Offset(1, 0).Select        ' 1つ下へ
ActiveCell.Offset(0, 1).Value = "→"   ' 右のセルに書く` },
  { group: 'セル参照・移動', label: '表の各行を範囲で回す',
    desc: '表の1行分ずつを Range として取り出して処理します。',
    code: `Dim tbl As Range, row As Range
Set tbl = ws.Range("A2:E" & lastRow)
For Each row In tbl.Rows
    Debug.Print row.Cells(1, 1).Value, row.Cells(1, 5).Value
Next row` },

  // ---- 行操作（実務） ----
  { group: '行操作（実務）', label: '最終行の次に1行追記',
    desc: '既存データの一番下に新しい行を追加します。ログ的な追記に。',
    code: `Dim r As Long
r = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
ws.Cells(r, "A").Value = "新規"
ws.Cells(r, "B").Value = Now` },
  { group: '行操作（実務）', label: '条件に合う行を別シートへ抽出',
    desc: 'A列が条件に合う行だけを別シートへ順にコピーします。',
    code: `Dim i As Long, dst As Worksheet, r As Long
Set dst = ThisWorkbook.Worksheets("抽出")
r = 1
For i = 2 To lastRow
    If ws.Cells(i, "A").Value = "対象" Then
        ws.Rows(i).Copy dst.Rows(r)
        r = r + 1
    End If
Next i` },
  { group: '行操作（実務）', label: '空白行を削除',
    desc: '行全体が空のものを下から削除して詰めます。',
    code: `Dim i As Long
For i = lastRow To 1 Step -1
    If Application.WorksheetFunction.CountA(ws.Rows(i)) = 0 Then ws.Rows(i).Delete
Next i` },

  // ---- 列操作（実務） ----
  { group: '列操作（実務）', label: '列を並べ替え（移動）',
    desc: 'C列を切り取ってA列の前へ移動します。列の順番替えに。',
    code: `ws.Columns("C").Cut
ws.Columns("A").Insert Shift:=xlToRight` },
  { group: '列操作（実務）', label: '列幅を一括設定・コピー',
    desc: '列幅をまとめて設定、または別シートへコピーします。',
    code: `ws.Columns("A:E").ColumnWidth = 12
' 別シートへ列幅コピー
ws.Columns("A:E").Copy
Worksheets("結果").Columns("A").PasteSpecial Paste:=xlPasteColumnWidths
Application.CutCopyMode = False` },
  { group: '列操作（実務）', label: '各列の見出しから列番号を得る',
    desc: '見出し名→列番号のDictionaryを作り、列位置が変わっても壊れないコードにします。',
    code: `Dim col As Object, c As Long
Set col = CreateObject("Scripting.Dictionary")
For c = 1 To ws.Cells(1, ws.Columns.Count).End(xlToLeft).Column
    col(CStr(ws.Cells(1, c).Value)) = c
Next c
' 使い方: ws.Cells(i, col("金額")).Value` },

  // ---- 罫線・書式コピー ----
  { group: '罫線・書式', label: '特定の辺だけ罫線',
    desc: '下罫線だけ、外枠だけ、など辺を指定して罫線を引きます。',
    code: `With ws.Range("A1:E1")
    .Borders(xlEdgeBottom).LineStyle = xlContinuous
    .Borders(xlEdgeBottom).Weight = xlMedium
End With` },
  { group: '罫線・書式', label: '罫線をすべて消す',
    desc: '範囲の罫線をまとめて削除します。',
    code: `ws.Range("A1:E100").Borders.LineStyle = xlLineStyleNone` },
  { group: '罫線・書式', label: '書式だけリセット',
    desc: '値は残して、色・罫線・フォントなどの書式だけを初期化します。',
    code: `ws.Range("A1:E100").ClearFormats` },

  // ---- 名前定義（応用） ----
  { group: '名前定義（応用）', label: '名前の一覧を出力',
    desc: 'ブックに定義されている名前と参照先を一覧にします。',
    code: `Dim nm As Name
For Each nm In ThisWorkbook.Names
    Debug.Print nm.Name, nm.RefersTo
Next nm` },
  { group: '名前定義（応用）', label: '不要な名前を一括削除',
    desc: '外部参照や壊れた名前（#REF!）を含むものをまとめて削除します。',
    code: `Dim nm As Name
For Each nm In ThisWorkbook.Names
    If InStr(nm.RefersTo, "#REF!") > 0 Then nm.Delete
Next nm` },
  { group: '名前定義（応用）', label: '動的な名前範囲（OFFSET）',
    desc: 'データが増減しても自動で伸びる名前範囲を作ります。グラフやリストの元に。',
    code: `ThisWorkbook.Names.Add Name:="dynList", _
    RefersTo:="=OFFSET(Sheet1!$A$2,0,0,COUNTA(Sheet1!$A:$A)-1,1)"` },

  // ---- ウィンドウ操作 ----
  { group: 'ウィンドウ操作', label: 'ズーム（表示倍率）を設定',
    desc: '表示倍率を変更します。全シートに適用する例も。',
    code: `ActiveWindow.Zoom = 85
' 全シートを85%に
Dim ws As Worksheet
For Each ws In ThisWorkbook.Worksheets
    ws.Activate: ActiveWindow.Zoom = 85
Next ws` },
  { group: 'ウィンドウ操作', label: 'ウィンドウ枠の固定',
    desc: '先頭行と先頭列を固定してスクロールしても見えるようにします。',
    code: `ws.Activate
ws.Range("B2").Select      ' この左上を固定基準に
ActiveWindow.FreezePanes = True
' ActiveWindow.FreezePanes = False  ' 解除` },
  { group: 'ウィンドウ操作', label: 'スクロール位置をリセット',
    desc: '画面を左上（A1）まで戻します。処理後の見た目を整えるのに。',
    code: `Application.Goto ws.Range("A1"), Scroll:=True` },

  // ---- 印刷（応用2） ----
  { group: '印刷（応用2）', label: '印刷範囲を動的に設定',
    desc: 'データ範囲に合わせて印刷範囲を自動設定します。',
    code: `ws.PageSetup.PrintArea = ws.Range("A1").CurrentRegion.Address` },
  { group: '印刷（応用2）', label: '見出し行を各ページで繰り返す',
    desc: '複数ページ印刷時、1行目の見出しを各ページの先頭に付けます。',
    code: `ws.PageSetup.PrintTitleRows = "$1:$1"     ' 1行目を繰り返し
' ws.PageSetup.PrintTitleColumns = "$A:$A" ' A列を繰り返し` },
  { group: '印刷（応用2）', label: '改ページを挿入',
    desc: '指定行の前で改ページします。既存の改ページをリセットしてから設定します。',
    code: `ws.ResetAllPageBreaks
ws.HPageBreaks.Add Before:=ws.Rows(51)   ' 51行目の前で改ページ` },

  // ---- 検索・置換（応用） ----
  { group: '検索・置換（応用）', label: '大文字小文字を区別して置換',
    desc: 'MatchCase:=True で大文字小文字を区別した置換を行います。',
    code: `ws.Cells.Replace What:="ID", Replacement:="Id", _
    LookAt:=xlPart, MatchCase:=True` },
  { group: '検索・置換（応用）', label: '完全一致で検索',
    desc: 'LookAt:=xlWhole でセルの内容が完全一致するものだけを検索します。',
    code: `Dim c As Range
Set c = ws.Columns("A").Find(What:="A001", LookAt:=xlWhole, MatchCase:=True)
If Not c Is Nothing Then c.Select` },
  { group: '検索・置換（応用）', label: 'ワイルドカードで検索',
    desc: '* や ? を使ったあいまい検索です。「A」で始まるものなどを探せます。',
    code: `Dim c As Range
Set c = ws.Columns("A").Find(What:="A*", LookAt:=xlWhole)
If Not c Is Nothing Then Debug.Print c.Value` },

  // ---- データ検証 ----
  { group: 'データ検証', label: '数値でないセルを検出',
    desc: '数値であるべき列に文字が混ざっていないかチェックし、該当を色付けします。',
    code: `Dim c As Range
For Each c In ws.Range("C2:C" & lastRow)
    If Not IsNumeric(c.Value) And c.Value <> "" Then
        c.Interior.Color = RGB(255, 199, 206)
    End If
Next c` },
  { group: 'データ検証', label: '前後に空白があるセルを検出',
    desc: 'Trimした結果と異なるセル（余分な空白あり）を見つけます。',
    code: `Dim c As Range
For Each c In ws.Range("A2:A" & lastRow)
    If c.Value <> Trim(c.Value) Then c.Interior.Color = RGB(255, 235, 156)
Next c` },
  { group: 'データ検証', label: '必須列の空欄をチェック',
    desc: '必須の列に空欄がある行を洗い出します。取り込み前の検査に。',
    code: `Dim i As Long, ng As Long
For i = 2 To lastRow
    If ws.Cells(i, "A").Value = "" Or ws.Cells(i, "C").Value = "" Then
        ws.Rows(i).Interior.Color = RGB(255, 199, 206)
        ng = ng + 1
    End If
Next i
MsgBox ng & " 行に未入力があります"` },

  // ---- 文字列生成 ----
  { group: '文字列生成', label: 'CSVの1行を組み立てる',
    desc: '配列やセルからカンマ区切りの1行を作ります。値に","がある場合はダブルクォートで囲みます。',
    code: `Dim parts() As String, i As Long
ReDim parts(1 To 3)
For i = 1 To 3
    Dim v As String: v = ws.Cells(2, i).Value
    If InStr(v, ",") > 0 Then v = """" & v & """"
    parts(i) = v
Next i
Debug.Print Join(parts, ",")` },
  { group: '文字列生成', label: 'テンプレートに差し込み',
    desc: '雛形文字列の {name} などをReplaceで値に置き換えます。定型文の生成に。',
    code: `Dim tmpl As String, msg As String
tmpl = "{name} 様" & vbCrLf & "ご注文 {no} を承りました。"
msg = tmpl
msg = Replace(msg, "{name}", ws.Range("A2").Value)
msg = Replace(msg, "{no}", ws.Range("B2").Value)
Debug.Print msg` },
  { group: '文字列生成', label: '範囲を区切り文字で連結（TEXTJOIN相当）',
    desc: '範囲の値を区切り文字でつなげます（空セルは除外）。',
    code: `Private Function TextJoinRange(rng As Range, delim As String) As String
    Dim c As Range, s As String
    For Each c In rng
        If c.Value <> "" Then s = s & c.Value & delim
    Next c
    If Len(s) > 0 Then s = Left(s, Len(s) - Len(delim))
    TextJoinRange = s
End Function` },

  // ---- 数値フォーマット ----
  { group: '数値フォーマット', label: '3桁区切り・通貨・パーセント',
    desc: '数値を見やすい文字列に整形します。',
    code: `Debug.Print Format(1234567, "#,##0")        ' 1,234,567
Debug.Print Format(1234567, "\\#,##0")       ' \\1,234,567
Debug.Print Format(0.1234, "0.0%")          ' 12.3%
Debug.Print Format(-500, "#,##0;▲#,##0")    ' ▲500（負を▲表記）` },
  { group: '数値フォーマット', label: '数値をゼロ埋め文字列に',
    desc: 'コード番号などを桁数固定のゼロ埋め文字列にします。',
    code: `Debug.Print Format(7, "0000")       ' 0007
Debug.Print Right("00000" & 42, 5)  ' 00042` },
  { group: '数値フォーマット', label: 'バイト数を読みやすく',
    desc: 'ファイルサイズなどをKB/MB表記にします。',
    code: `Private Function HumanSize(ByVal bytes As Double) As String
    Dim u As Variant, i As Long
    u = Array("B", "KB", "MB", "GB", "TB")
    Do While bytes >= 1024 And i < 4
        bytes = bytes / 1024: i = i + 1
    Loop
    HumanSize = Format(bytes, "0.0") & u(i)
End Function` },

  // ---- 時刻・処理時間 ----
  { group: '時刻・処理時間', label: '経過時間を hh:mm:ss で表示',
    desc: '処理の開始から終了までの経過時間を時分秒で表示します。',
    code: `Dim t As Double
t = Timer
' 処理
Dim sec As Double: sec = Timer - t
Debug.Print Format(sec / 86400, "hh:mm:ss")` },
  { group: '時刻・処理時間', label: '指定時刻まで待つ',
    desc: '指定した時刻になるまで処理を止めます。定時実行の待機に。',
    code: `Application.Wait TimeValue("17:00:00")   ' 17時まで待つ
' Application.OnTime で予約実行も可能` },
  { group: '時刻・処理時間', label: '一定間隔で処理を予約（OnTime）',
    desc: 'OnTimeで指定時間後に自分（または別Sub）を呼び、繰り返し処理を作ります。',
    code: `Public Sub Tick()
    Debug.Print Now
    Application.OnTime Now + TimeValue("00:00:05"), "Tick"   ' 5秒後に再実行
End Sub` },

  // ---- Dictionary（応用） ----
  { group: 'Dictionary（応用）', label: 'Dictionaryを範囲へ書き出し',
    desc: 'キーと値を2列でシートへ一括出力します。',
    code: `Dim keys As Variant, vals As Variant
keys = dic.Keys: vals = dic.Items
ws.Range("A1").Resize(dic.Count).Value = Application.Transpose(keys)
ws.Range("B1").Resize(dic.Count).Value = Application.Transpose(vals)` },
  { group: 'Dictionary（応用）', label: '値で降順ソートして出力',
    desc: 'Dictionaryをキーと値の配列にしてから値で並べ替えます（上位ランキングなどに）。',
    code: `Dim k As Variant, ks() As String, vs() As Double, n As Long, i As Long, j As Long
n = dic.Count: ReDim ks(1 To n): ReDim vs(1 To n): i = 0
For Each k In dic.Keys
    i = i + 1: ks(i) = k: vs(i) = dic(k)
Next k
For i = 1 To n - 1
    For j = i + 1 To n
        If vs(j) > vs(i) Then
            Dim td As Double, ts As String
            td = vs(i): vs(i) = vs(j): vs(j) = td
            ts = ks(i): ks(i) = ks(j): ks(j) = ts
        End If
    Next j
Next i` },
  { group: 'Dictionary（応用）', label: 'キー入りCollectionで安全取得',
    desc: 'Collectionにキー付きで追加し、存在確認しながら安全に取り出す方法です。',
    code: `Dim col As New Collection
On Error Resume Next
col.Add "値A", "keyA"        ' キー付き追加
Dim v As String
v = col("keyA")               ' キーで取得（無ければエラー）
On Error GoTo 0` },

  // ---- エラー処理（応用） ----
  { group: 'エラー処理（応用）', label: 'カスタムエラーを発生させる',
    desc: '業務ルール違反などを Err.Raise で意図的にエラーにして、呼び出し元で捕捉します。',
    code: `If ws.Range("B2").Value = "" Then
    Err.Raise vbObjectError + 513, , "担当者が未入力です"
End If` },
  { group: 'エラー処理（応用）', label: 'エラー番号で分岐',
    desc: 'エラーの種類（番号）に応じて処理を変えます。',
    code: `On Error GoTo ErrHandler
' 処理
Exit Sub
ErrHandler:
    Select Case Err.Number
        Case 9:    MsgBox "対象が見つかりません"
        Case 1004: MsgBox "セル操作に失敗しました"
        Case Else: MsgBox Err.Number & ": " & Err.Description
    End Select` },
  { group: 'エラー処理（応用）', label: '一時的にエラーを無視して復帰',
    desc: '失敗しても良い処理だけをResume Nextで囲み、直後に必ず解除します。',
    code: `On Error Resume Next
ws.ShowAllData            ' フィルタ解除（無くてもエラーにしない）
On Error GoTo 0           ' 通常のエラー処理に戻す` },

  // ---- イベント（応用2） ----
  { group: 'イベント（応用2）', label: 'ダブルクリックで処理',
    desc: 'シートモジュール。セルのダブルクリックで独自処理を実行し、既定の編集を止めます。',
    code: `' === シートモジュール ===
Private Sub Worksheet_BeforeDoubleClick(ByVal Target As Range, Cancel As Boolean)
    If Not Intersect(Target, Me.Range("A2:A100")) Is Nothing Then
        Target.Offset(0, 1).Value = "済"
        Cancel = True        ' 編集モードに入らない
    End If
End Sub` },
  { group: 'イベント（応用2）', label: '選択セルの変化で情報表示',
    desc: 'シートモジュール。選択が変わるたびにステータスバーへ情報を出します。',
    code: `' === シートモジュール ===
Private Sub Worksheet_SelectionChange(ByVal Target As Range)
    Application.StatusBar = "選択: " & Target.Address(False, False) & _
        "  値: " & Target.Cells(1, 1).Value
End Sub` },
  { group: 'イベント（応用2）', label: '別ブックを開かせない（Activate制御）',
    desc: 'ThisWorkbookモジュール。シートがアクティブになったときに初期化する例です。',
    code: `' === ThisWorkbook モジュール ===
Private Sub Workbook_SheetActivate(ByVal Sh As Object)
    Application.StatusBar = "シート: " & Sh.Name
End Sub` },

  // ---- シート保護（応用） ----
  { group: 'シート保護（応用）', label: 'マクロは編集可のまま保護',
    desc: 'UserInterfaceOnly:=True で手動編集は禁止、マクロからの変更は許可します。',
    code: `ws.Protect Password:="pass", UserInterfaceOnly:=True, _
    AllowFiltering:=True, AllowSorting:=True` },
  { group: 'シート保護（応用）', label: '全シートをまとめて保護/解除',
    desc: 'ブック内の全シートを同じパスワードで保護・解除します。',
    code: `Dim ws As Worksheet
For Each ws In ThisWorkbook.Worksheets
    ws.Protect Password:="pass"       ' 解除は ws.Unprotect "pass"
Next ws` },
  { group: 'シート保護（応用）', label: 'スクロール範囲を制限',
    desc: '操作できるセル範囲を限定し、余計な場所へ移動できないようにします。',
    code: `ws.ScrollArea = "A1:H50"
' ws.ScrollArea = ""   ' 制限解除` },

  // ---- ブック（応用2） ----
  { group: 'ブック（応用2）', label: 'シートを完全に隠す（VeryHidden）',
    desc: '通常の「再表示」メニューにも出てこない状態で隠します。設定シートの保護に。',
    code: `ws.Visible = xlSheetVeryHidden
' 戻す: ws.Visible = xlSheetVisible` },
  { group: 'ブック（応用2）', label: '閉じる前に保存確認',
    desc: 'ThisWorkbookモジュール。未保存があれば確認するなど、閉じる操作をフックします。',
    code: `' === ThisWorkbook モジュール ===
Private Sub Workbook_BeforeClose(Cancel As Boolean)
    If MsgBox("終了しますか？", vbYesNo) = vbNo Then Cancel = True
End Sub` },
  { group: 'ブック（応用2）', label: 'バックアップを取ってから保存',
    desc: '保存前に日付き別名のコピーを残します。上書き事故に備えられます。',
    code: `Dim bak As String
bak = ThisWorkbook.Path & "\\bak_" & Format(Now, "yyyymmdd_hhnnss") & ".xlsx"
ThisWorkbook.SaveCopyAs bak
ThisWorkbook.Save` },

  // ---- データ変換（応用） ----
  { group: 'データ変換（応用）', label: '横持ち → 縦持ち（アンピボット）',
    desc: '月ごとに列が並ぶ表を、1行1データの縦持ちに変換します。集計・DB取込の前処理に。',
    code: `Dim i As Long, c As Long, r As Long, dst As Worksheet
Set dst = ThisWorkbook.Worksheets("縦持ち")
r = 1
For i = 2 To lastRow
    For c = 2 To 13                       ' B〜M列（12ヶ月）
        dst.Cells(r, 1).Value = ws.Cells(i, 1).Value       ' 名前
        dst.Cells(r, 2).Value = ws.Cells(1, c).Value       ' 月
        dst.Cells(r, 3).Value = ws.Cells(i, c).Value       ' 値
        r = r + 1
    Next c
Next i` },
  { group: 'データ変換（応用）', label: '1セルの区切り文字を列に分割',
    desc: 'カンマ区切りで1セルに入った値を複数列に展開します。',
    code: `Dim i As Long, parts As Variant
For i = 2 To lastRow
    parts = Split(ws.Cells(i, "A").Value, ",")
    ws.Range(ws.Cells(i, "B"), ws.Cells(i, "B").Offset(0, UBound(parts))).Value = parts
Next i` },
  { group: 'データ変換（応用）', label: 'コードを名称に変換（対応表）',
    desc: '対応表シートをDictionary化し、コード列を名称に一括変換します。',
    code: `Dim map As Object, i As Long, m As Worksheet
Set map = CreateObject("Scripting.Dictionary")
Set m = ThisWorkbook.Worksheets("対応表")
For i = 2 To m.Cells(m.Rows.Count, "A").End(xlUp).Row
    map(CStr(m.Cells(i, "A").Value)) = m.Cells(i, "B").Value
Next i
For i = 2 To lastRow
    If map.Exists(CStr(ws.Cells(i, "A").Value)) Then
        ws.Cells(i, "B").Value = map(CStr(ws.Cells(i, "A").Value))
    End If
Next i` },

  // ---- 外部ファイル（応用） ----
  { group: '外部ファイル（応用）', label: 'テキスト全体を一気に読む',
    desc: 'FileSystemObjectでファイル内容を丸ごと文字列に読み込みます。',
    code: `Dim fso As Object, txt As String
Set fso = CreateObject("Scripting.FileSystemObject")
txt = fso.OpenTextFile("C:\\data\\memo.txt", 1).ReadAll
Debug.Print txt` },
  { group: '外部ファイル（応用）', label: '文字列をファイルに書き出す',
    desc: '文字列をテキストファイルとして保存します（上書き）。',
    code: `Dim fso As Object, ts As Object
Set fso = CreateObject("Scripting.FileSystemObject")
Set ts = fso.CreateTextFile("C:\\data\\out.txt", True)
ts.Write "1行目" & vbCrLf & "2行目"
ts.Close` },
  { group: '外部ファイル（応用）', label: 'XMLを読み込んで値を取得',
    desc: 'MSXMLでXMLを読み、ノードの値を取り出します。',
    code: `Dim xml As Object, node As Object
Set xml = CreateObject("MSXML2.DOMDocument")
xml.async = False
xml.Load "C:\\data\\data.xml"
For Each node In xml.SelectNodes("//item/name")
    Debug.Print node.Text
Next node` },

  // ---- オートシェイプ ----
  { group: 'オートシェイプ', label: 'テキストボックスを追加',
    desc: '注釈用のテキストボックスを配置し、文字を設定します。',
    code: `Dim tb As Shape
Set tb = ws.Shapes.AddTextbox(msoTextOrientationHorizontal, 100, 50, 200, 40)
tb.TextFrame2.TextRange.Text = "注意：確認してください"` },
  { group: 'オートシェイプ', label: '直線・矢印を引く',
    desc: '2点を結ぶ線や矢印を描きます。フロー図の作成などに。',
    code: `Dim ln As Shape
Set ln = ws.Shapes.AddLine(50, 50, 200, 50)
ln.Line.EndArrowheadStyle = msoArrowheadTriangle
ln.Line.Weight = 2` },
  { group: 'オートシェイプ', label: '図形の位置をセルに合わせる',
    desc: '既存の図形を指定セルの左上へぴったり配置します。',
    code: `Dim shp As Shape, tgt As Range
Set shp = ws.Shapes(1)
Set tgt = ws.Range("C3")
shp.Left = tgt.Left
shp.Top = tgt.Top` },

  // ---- Application関数 ----
  { group: 'Application関数', label: 'Evaluateで数式を計算',
    desc: '文字列の数式を評価して結果を得ます。セルに書かずに計算できます。',
    code: `Debug.Print Application.Evaluate("=SUM(A1:A10)")
Debug.Print [SUM(A1:A10)]                    ' 角括弧でも同じ
Debug.Print Application.Evaluate("=SQRT(2)")` },
  { group: 'Application関数', label: '一意な値を配列で取得（Evaluate）',
    desc: 'ワークシート関数UNIQUEをEvaluateで呼び、重複なしの配列を得ます（対応バージョンのみ）。',
    code: `Dim arr As Variant
arr = Application.Evaluate("UNIQUE(A2:A100)")
' 使えない環境では Dictionary版を使う` },
  { group: 'Application関数', label: 'Intersect / Union の活用',
    desc: '範囲の共通部分・結合を求めます。イベント処理や複数範囲の一括操作に。',
    code: `If Not Application.Intersect(Target, ws.Range("A1:A10")) Is Nothing Then
    ' Target が A1:A10 と重なっている
End If
Dim multi As Range
Set multi = Application.Union(ws.Range("A1:A5"), ws.Range("C1:C5"))
multi.Interior.Color = RGB(255, 255, 0)` },

  // ---- 配列演算 ----
  { group: '配列演算', label: '配列の合計・平均・最大',
    desc: 'WorksheetFunctionは配列にもそのまま使えます。',
    code: `Dim arr As Variant
arr = ws.Range("B2:B100").Value
Dim wf As WorksheetFunction: Set wf = Application.WorksheetFunction
Debug.Print wf.Sum(arr), wf.Average(arr), wf.Max(arr), wf.Min(arr)` },
  { group: '配列演算', label: '2次元配列から1列を抜き出す',
    desc: 'Range.Value（2次元）から特定列だけを1次元配列に取り出します。',
    code: `Private Function GetColumn(arr As Variant, colIdx As Long) As Variant
    Dim res() As Variant, i As Long
    ReDim res(1 To UBound(arr, 1))
    For i = 1 To UBound(arr, 1)
        res(i) = arr(i, colIdx)
    Next i
    GetColumn = res
End Function` },
  { group: '配列演算', label: '配列を縦の範囲へ書き出す',
    desc: '1次元配列を縦1列のセルへ一括で書き込みます。',
    code: `Dim arr As Variant
arr = Array("A", "B", "C")
ws.Range("A1").Resize(UBound(arr) - LBound(arr) + 1).Value = _
    Application.Transpose(arr)` },

  // ---- データ入力補助 ----
  { group: 'データ入力補助', label: '入力を自動で大文字に',
    desc: 'シートモジュール。特定列に入力された英字を自動で大文字化します。',
    code: `' === シートモジュール ===
Private Sub Worksheet_Change(ByVal Target As Range)
    If Intersect(Target, Me.Range("A:A")) Is Nothing Then Exit Sub
    Application.EnableEvents = False
    Target.Value = UCase(Target.Value)
    Application.EnableEvents = True
End Sub` },
  { group: 'データ入力補助', label: '入力時にタイムスタンプ',
    desc: 'シートモジュール。B列に入力があったら隣に入力日時を自動記録します。',
    code: `' === シートモジュール ===
Private Sub Worksheet_Change(ByVal Target As Range)
    If Intersect(Target, Me.Range("B:B")) Is Nothing Then Exit Sub
    Application.EnableEvents = False
    Target.Offset(0, 1).Value = Now
    Application.EnableEvents = True
End Sub` },
  { group: 'データ入力補助', label: '複数セルへ同じ値を一括入力',
    desc: '選択中の全セル（飛び地でも）へまとめて同じ値を入れます。',
    code: `Selection.Value = "未対応"
' 数式を一括なら Selection.Formula = "=A1*1.1"` },

  // ---- 検算・差分 ----
  { group: '検算・差分', label: '2つの範囲の差分を出す',
    desc: '同じ形の2範囲を比較し、値が違うセルを色付け＆一覧化します。',
    code: `Dim r As Long, c As Long, a As Range, b As Range
Set a = Worksheets("旧").Range("A1:E100")
Set b = Worksheets("新").Range("A1:E100")
For r = 1 To a.Rows.Count
    For c = 1 To a.Columns.Count
        If a.Cells(r, c).Value <> b.Cells(r, c).Value Then
            b.Cells(r, c).Interior.Color = RGB(255, 235, 156)
        End If
    Next c
Next r` },
  { group: '検算・差分', label: '合計が一致するか検算',
    desc: '明細の合計と別途集計の合計が一致するかをチェックします。',
    code: `Dim wf As WorksheetFunction: Set wf = Application.WorksheetFunction
Dim d As Double, s As Double
d = wf.Sum(ws.Range("C2:C" & lastRow))
s = ws.Range("C" & (lastRow + 1)).Value
If Abs(d - s) > 0.001 Then MsgBox "合計が一致しません: " & d & " / " & s` },
  { group: '検算・差分', label: '重複を検出して件数を出す',
    desc: '重複しているキーとその件数を一覧化します。名寄せ前の確認に。',
    code: `Dim dic As Object, i As Long, k As Variant
Set dic = CreateObject("Scripting.Dictionary")
For i = 2 To lastRow
    dic(CStr(ws.Cells(i, "A").Value)) = dic(CStr(ws.Cells(i, "A").Value)) + 1
Next i
For Each k In dic.Keys
    If dic(k) > 1 Then Debug.Print k, dic(k) & "件"
Next k` },

  // ---- 画面制御（応用） ----
  { group: '画面制御（応用）', label: 'カーソル位置を保存して復元',
    desc: '処理の前に選択位置を覚えておき、処理後に元へ戻します。',
    code: `Dim savedSheet As Worksheet, savedCell As Range
Set savedSheet = ActiveSheet
Set savedCell = ActiveCell

' ...別シートを操作する処理...

savedSheet.Activate
savedCell.Select` },
  { group: '画面制御（応用）', label: 'マウスカーソルを砂時計に',
    desc: '重い処理中は待機カーソルにし、終わったら必ず戻します。',
    code: `Application.Cursor = xlWait
' 処理
Application.Cursor = xlDefault` },
  { group: '画面制御（応用）', label: '警告なしで実行するラッパー',
    desc: '各種の確認・警告・自動計算をまとめてOFF/ONするヘルパーです。',
    code: `Private Sub FastMode(ByVal on_ As Boolean)
    With Application
        .ScreenUpdating = Not on_
        .EnableEvents = Not on_
        .DisplayAlerts = Not on_
        .Calculation = IIf(on_, xlCalculationManual, xlCalculationAutomatic)
    End With
End Sub
' 使い方: FastMode True → 処理 → FastMode False` },

  // ---- ハイパーリンク（応用） ----
  { group: 'ハイパーリンク（応用）', label: 'メール作成リンクを設定',
    desc: 'クリックするとメール作成が開く mailto リンクを設定します。',
    code: `ws.Hyperlinks.Add _
    Anchor:=ws.Range("A1"), _
    Address:="mailto:info@example.com?subject=お問い合わせ", _
    TextToDisplay:="メールする"` },
  { group: 'ハイパーリンク（応用）', label: 'リンク先URLを一覧化',
    desc: 'シート内のハイパーリンクの表示文字とURLを書き出します。',
    code: `Dim h As Hyperlink, r As Long
r = 1
For Each h In ws.Hyperlinks
    Worksheets("URL一覧").Cells(r, 1).Value = h.TextToDisplay
    Worksheets("URL一覧").Cells(r, 2).Value = h.Address
    r = r + 1
Next h` },
  { group: 'ハイパーリンク（応用）', label: '目次（各シートへのリンク）を作る',
    desc: '全シートへのジャンプリンクを1枚に並べた目次を作ります。',
    code: `Dim ws As Worksheet, r As Long
Set idx = ThisWorkbook.Worksheets("目次")
r = 1
For Each ws In ThisWorkbook.Worksheets
    If ws.Name <> "目次" Then
        idx.Hyperlinks.Add Anchor:=idx.Cells(r, 1), Address:="", _
            SubAddress:="'" & ws.Name & "'!A1", TextToDisplay:=ws.Name
        r = r + 1
    End If
Next ws` },

  // ---- 集計関数（応用） ----
  { group: '集計関数（応用）', label: 'SUMIFS / COUNTIFS（複数条件）',
    desc: '複数条件での合計・件数を求めます。条件は「範囲, 条件」の組を並べます。',
    code: `Dim wf As WorksheetFunction: Set wf = Application.WorksheetFunction
total = wf.SumIfs(ws.Range("D:D"), ws.Range("A:A"), "東京", ws.Range("B:B"), ">=100")
cnt = wf.CountIfs(ws.Range("A:A"), "東京", ws.Range("C:C"), "完了")` },
  { group: '集計関数（応用）', label: 'AVERAGEIFS / MAXIFS',
    desc: '条件付きの平均・最大値を求めます（MAXIFSは対応バージョンのみ）。',
    code: `Dim wf As WorksheetFunction: Set wf = Application.WorksheetFunction
avg = wf.AverageIfs(ws.Range("D:D"), ws.Range("A:A"), "東京")
mx = wf.MaxIfs(ws.Range("D:D"), ws.Range("A:A"), "東京")` },
  { group: '集計関数（応用）', label: '小計を挿入（Subtotal）',
    desc: 'グループごとの小計を自動挿入します。事前にキー列で並べ替えておきます。',
    code: `ws.Range("A1").CurrentRegion.Subtotal _
    GroupBy:=1, Function:=xlSum, TotalList:=Array(3), _
    Replace:=True, SummaryBelowData:=True` },

  // ---- 日付・時刻（実務2） ----
  { group: '日付・時刻（実務2）', label: '和暦に変換',
    desc: '西暦の日付を和暦（令和など）の文字列にします。',
    code: `Debug.Print Format(Date, "ggge年m月d日")     ' 令和7年…
Debug.Print Format(Date, "gge.m.d")          ' R7.7.16` },
  { group: '日付・時刻（実務2）', label: '文字列を日付に安全変換',
    desc: '「20240101」や「2024/1/1」など様々な形式を日付へ変換します。',
    code: `Private Function ToDate(s As String) As Variant
    s = Trim(s)
    If s Like "########" Then                      ' yyyymmdd
        ToDate = DateSerial(Left(s, 4), Mid(s, 5, 2), Right(s, 2))
    ElseIf IsDate(s) Then
        ToDate = CDate(s)
    Else
        ToDate = Empty                              ' 変換不可
    End If
End Function` },
  { group: '日付・時刻（実務2）', label: '2つの日付の月数差',
    desc: '年月ベースの経過月数を求めます（請求・契約管理などに）。',
    code: `months = DateDiff("m", DateSerial(2024, 1, 1), Date)
Debug.Print months & "ヶ月"` },

  // ---- 文字列検索・分解 ----
  { group: '文字列検索・分解', label: '区切りごとに繰り返す',
    desc: 'Splitで分解した各要素をループ処理します。タグや複数値の処理に。',
    code: `Dim parts As Variant, p As Variant
parts = Split("A;B;C;D", ";")
For Each p In parts
    Debug.Print Trim(p)
Next p` },
  { group: '文字列検索・分解', label: 'n番目の区切り位置を求める',
    desc: 'InStrを繰り返して指定回目の区切り文字の位置を得ます。',
    code: `Private Function NthPos(s As String, delim As String, n As Long) As Long
    Dim pos As Long, i As Long
    pos = 0
    For i = 1 To n
        pos = InStr(pos + 1, s, delim)
        If pos = 0 Then Exit Function
    Next i
    NthPos = pos
End Function` },
  { group: '文字列検索・分解', label: '括弧の中身を取り出す',
    desc: '「名称（かっこ内）」から、かっこの中身だけを抜き出します。',
    code: `Dim s As String, a As Long, b As Long
s = ws.Range("A2").Value
a = InStr(s, "(")
b = InStr(s, ")")
If a > 0 And b > a Then Debug.Print Mid(s, a + 1, b - a - 1)` },

  // ---- セル書式（応用2） ----
  { group: 'セル書式（応用2）', label: 'インデント・折り返し・縮小',
    desc: 'セル内のテキスト配置を細かく設定します。',
    code: `With ws.Range("A1:A100")
    .IndentLevel = 1            ' 字下げ
    .WrapText = True            ' 折り返して全体表示
    .ShrinkToFit = False        ' 縮小して全体表示（Wrapと排他）
    .VerticalAlignment = xlTop
End With` },
  { group: 'セル書式（応用2）', label: 'フォントの一部だけ色を変える',
    desc: 'セル内の特定の文字だけ色や太字を変えます（Charactersで範囲指定）。',
    code: `With ws.Range("A1")
    .Value = "重要：確認してください"
    .Characters(Start:=1, Length:=3).Font.Color = RGB(224, 84, 74)  ' 「重要：」を赤
    .Characters(Start:=1, Length:=3).Font.Bold = True
End With` },
  { group: 'セル書式（応用2）', label: '表示形式で色分け',
    desc: '表示形式（NumberFormat）だけで正負ゼロの色を変えます（値は変えない）。',
    code: `ws.Range("C2:C100").NumberFormatLocal = _
    "#,##0;[赤]▲#,##0;-"        ' 正;負(赤▲);ゼロ(-)` },

  // ---- マクロ・実行制御 ----
  { group: 'マクロ・実行制御', label: '別マクロを名前で実行',
    desc: 'Application.Run で文字列名のマクロを呼びます。動的な処理分岐に。',
    code: `Application.Run "Module1.処理A"
Application.Run "'" & ThisWorkbook.Name & "'!処理A", 引数1` },
  { group: 'マクロ・実行制御', label: 'マクロの二重起動を防ぐ',
    desc: 'モジュール変数のフラグで、処理中の再実行をブロックします。',
    code: `Private running As Boolean

Public Sub Run()
    If running Then Exit Sub
    running = True
    On Error GoTo Cleanup
    ' 処理
Cleanup:
    running = False
End Sub` },
  { group: 'マクロ・実行制御', label: '処理を中断できるようにする',
    desc: 'Escキーでの中断を有効にし、長い処理を止められるようにします。',
    code: `Application.EnableCancelKey = xlErrorHandler
On Error GoTo Canceled
Dim i As Long
For i = 1 To 1000000
    If i Mod 1000 = 0 Then DoEvents
Next i
Exit Sub
Canceled:
    If Err.Number = 18 Then MsgBox "中断しました"` },

  // ---- その他（便利技） ----
  { group: 'その他（便利技）', label: '再計算を強制する',
    desc: '手動計算モードのときなどに、明示的に再計算させます。特定範囲だけの再計算も可能です。',
    code: `Application.Calculate            ' ブック全体
ws.Calculate                    ' シートだけ
ws.Range("D2:D100").Calculate   ' 範囲だけ` },
  { group: 'その他（便利技）', label: 'セルの数式を文字列で取得',
    desc: 'セルに入っている数式そのものを文字列として取り出します（監査・一覧化に）。',
    code: `Debug.Print ws.Range("D2").Formula        ' =B2*C2
Debug.Print ws.Range("D2").HasFormula     ' True/False` },
  { group: 'その他（便利技）', label: '今日の日付名でシートを作る',
    desc: '「20260716」のような日付名のシートを作成します（既存ならそれを使う）。',
    code: `Dim nm As String, ws As Worksheet
nm = Format(Date, "yyyymmdd")
On Error Resume Next
Set ws = ThisWorkbook.Worksheets(nm)
On Error GoTo 0
If ws Is Nothing Then
    Set ws = ThisWorkbook.Worksheets.Add
    ws.Name = nm
End If` },
  { group: 'その他（便利技）', label: 'ブックのパス・名前を取得',
    desc: 'このブックの保存場所やファイル名を取得します。未保存だとPathは空になります。',
    code: `Debug.Print ThisWorkbook.Name       ' Book1.xlsx
Debug.Print ThisWorkbook.Path       ' C:\\data
Debug.Print ThisWorkbook.FullName   ' C:\\data\\Book1.xlsx` },
  { group: 'その他（便利技）', label: 'Excelとマクロの情報',
    desc: 'Excelのバージョンや、実行中プロシージャ名の取得例です。環境依存の分岐に。',
    code: `Debug.Print Application.Version         ' 例: 16.0
Debug.Print Application.OperatingSystem
#If Win64 Then
    Debug.Print "64bit"
#Else
    Debug.Print "32bit"
#End If` },
  { group: 'その他（便利技）', label: '数値を漢数字・全角に',
    desc: '金額表記などのために全角数字や漢数字風の表示に変換します。',
    code: `Debug.Print StrConv("1234", vbWide)        ' １２３４（全角）
Debug.Print Application.WorksheetFunction.Text(1234, "[DBNum1]")  ' 一千二百三十四` },
  { group: 'その他（便利技）', label: '選択範囲の合計を即表示',
    desc: '選択中の数値セルの合計・平均・件数をメッセージで確認します。',
    code: `Dim wf As WorksheetFunction: Set wf = Application.WorksheetFunction
On Error Resume Next
MsgBox "合計: " & wf.Sum(Selection) & vbCrLf & _
       "平均: " & wf.Average(Selection) & vbCrLf & _
       "件数: " & wf.Count(Selection)` },
];

// ----------------------------------------------------------------
//  初期サンプルコード
// ----------------------------------------------------------------
const SAMPLE_CODE = `Option Explicit

' カーソルを各行に置くと、その行の構文説明が左に表示されます。
' If や For にカーソルを置くと、対応する End If / Next が青く光ります。
Sub 集計サンプル()
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim total As Double

    Set ws = ThisWorkbook.Worksheets("Sheet1")
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row

    total = 0
    For i = 2 To lastRow
        If ws.Cells(i, "C").Value >= 100 Then
            total = total + ws.Cells(i, "C").Value
        End If
    Next i

    MsgBox "合計は " & Format(total, "#,##0") & " です", vbInformation
End Sub
`;

// ----------------------------------------------------------------
//  DOM 参照
// ----------------------------------------------------------------
const textarea     = document.getElementById('code-textarea');
const hlPre        = document.getElementById('hl-pre');
const hlCode       = document.getElementById('hl-code');
const lineNumbers  = document.getElementById('line-numbers');
const expBody      = document.getElementById('explanation-body');
const snippetsBody = document.getElementById('snippets-body');
const outputBody   = document.getElementById('output-body');
const btnRun       = document.getElementById('btn-run');
const btnFormat    = document.getElementById('btn-format');
const btnReset     = document.getElementById('btn-reset');
const btnCopy      = document.getElementById('btn-copy');
const btnClear     = document.getElementById('btn-clear');
const syntaxStatus  = document.getElementById('syntax-status');
const snippetSearch = document.getElementById('snippet-search');

// ----------------------------------------------------------------
//  自動保存（localStorage）
// ----------------------------------------------------------------
const STORAGE_KEY = 'vba-syntax-visualizer:code';

function saveCode() {
  try { localStorage.setItem(STORAGE_KEY, textarea.value); } catch { /* 保存不可でも継続 */ }
}
function loadSavedCode() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

// ----------------------------------------------------------------
//  エディタ描画
// ----------------------------------------------------------------
let blockMarks = null;   // ブロック対応の強調位置（Set）
let blockMarkKey = '';   // 変化検知用

function updateHighlight() {
  hlCode.innerHTML = highlightVba(textarea.value, blockMarks) + '\n';
}

// カーソル行がブロックの一部なら、対応する開始/終了キーワードを強調する
function updateBlockMatch() {
  let marks = null;
  if (textarea.selectionStart === textarea.selectionEnd) {
    const { groups } = getScan();
    const ln = textarea.value.slice(0, textarea.selectionStart).split('\n').length - 1;
    for (const g of groups) {
      if (g.lines.has(ln)) { marks = g.offsets; break; }
    }
  }
  const key = marks ? [...marks].sort((a, b) => a - b).join(',') : '';
  if (key !== blockMarkKey) {
    blockMarkKey = key;
    blockMarks = marks;
    updateHighlight();
  }
}

// ----------------------------------------------------------------
//  構文チェック（入力が止まったらブロック対応を検査）
// ----------------------------------------------------------------
function checkSyntax() {
  for (const el of lineNumbers.children) el.classList.remove('ln-error');

  if (!textarea.value.trim()) {
    syntaxStatus.textContent = '';
    syntaxStatus.className = '';
    syntaxStatus.title = '';
    return;
  }

  const { error } = getScan();
  if (error) {
    syntaxStatus.textContent = '✖ ' + error.message;
    syntaxStatus.title = error.message;
    syntaxStatus.className = 'err';
    if (error.line && lineNumbers.children[error.line - 1]) {
      lineNumbers.children[error.line - 1].classList.add('ln-error');
    }
  } else {
    syntaxStatus.textContent = '✓ ブロック対応OK';
    syntaxStatus.title = '';
    syntaxStatus.className = 'ok';
  }
}

let syntaxTimer = null;
function scheduleSyntaxCheck() {
  clearTimeout(syntaxTimer);
  syntaxTimer = setTimeout(checkSyntax, 300);
}

function updateLineNumbers() {
  const count = textarea.value.split('\n').length;
  const current = lineNumbers.children.length;
  if (count > current) {
    for (let i = current + 1; i <= count; i++) {
      const span = document.createElement('span');
      span.className = 'ln';
      span.textContent = i;
      lineNumbers.appendChild(span);
    }
  } else {
    while (lineNumbers.children.length > count) {
      lineNumbers.removeChild(lineNumbers.lastChild);
    }
  }
}

function syncScroll() {
  hlPre.scrollTop  = textarea.scrollTop;
  hlPre.scrollLeft = textarea.scrollLeft;
  lineNumbers.scrollTop = textarea.scrollTop;
}

// Undo履歴を保ったまま [start, end) を text で置き換える
function replaceRange(start, end, text) {
  if (start === end && text === '') return;
  textarea.focus();
  textarea.setSelectionRange(start, end);
  let ok = false;
  try {
    ok = text === ''
      ? document.execCommand('delete', false)
      : document.execCommand('insertText', false, text);
  } catch { ok = false; }
  if (!ok) {
    const v = textarea.value;
    textarea.value = v.slice(0, start) + text + v.slice(end);
    const caret = start + text.length;
    textarea.setSelectionRange(caret, caret);
  }
}

// ----------------------------------------------------------------
//  説明エリア描画
// ----------------------------------------------------------------
function renderExplanation({ title, cat, desc, example }) {
  expBody.innerHTML = `
    <div class="exp-line">${title}</div>
    <div class="exp-cat">${escapeHtml(cat)}</div>
    <div class="exp-desc">${escapeHtml(desc)}</div>
    <div class="exp-label">使用例</div>
    <div class="exp-example">${example}</div>
  `;
}

function renderPlaceholder() {
  expBody.innerHTML = `<span class="placeholder-text">
    エディタの行にカーソルを置くと、その行の構文説明がここに表示されます。<br><br>
    コードをドラッグで選択すると、選択したキーワードやメソッドの解説が表示されます。<br><br>
    If / For / With などにカーソルを置くと、対応する終端が青く強調されます。<br><br>
    下のスニペットをクリックすると、カーソル位置にコードが挿入されます。
  </span>`;
}

// 選択範囲があればそれを解説する（true = 表示した）
function explainSelection() {
  const { selectionStart: s, selectionEnd: e } = textarea;
  if (s === e) return false;
  const sel = textarea.value.slice(s, e);
  if (!sel.trim()) return false;

  const shown = sel.trim().length > 160 ? sel.trim().slice(0, 160) + ' …' : sel.trim();
  const exp = findSelectionExp(sel);

  if (exp) {
    renderExplanation({
      title: highlightVba(shown),
      cat: `選択範囲：${exp.title}`,
      desc: exp.body,
      example: highlightVba(exp.syntax ?? shown),
    });
  } else {
    renderExplanation({
      title: highlightVba(shown),
      cat: '選択範囲',
      desc: 'この選択範囲に対応する解説が見つかりませんでした。キーワード（Dim, For, With など）や関数名（Range, Format など）を含む部分を選択すると解説が表示されます。',
      example: highlightVba(shown),
    });
  }
  return true;
}

function updateExplanation() {
  if (!explainSelection()) explainCurrentLine();
}

function explainCurrentLine() {
  const pos = textarea.selectionStart;
  const value = textarea.value;
  const lineStart = value.lastIndexOf('\n', pos - 1) + 1;
  let lineEnd = value.indexOf('\n', pos);
  if (lineEnd === -1) lineEnd = value.length;
  const line = value.slice(lineStart, lineEnd);

  if (!line.trim()) { renderPlaceholder(); return; }

  const rule = findLineRule(line);
  renderExplanation({
    title: highlightVba(line.trim()),
    cat: rule.cat,
    desc: rule.desc,
    example: highlightVba(line.trim()),
  });
}

// ----------------------------------------------------------------
//  スニペット描画・挿入
// ----------------------------------------------------------------
function renderSnippets(filter = '') {
  snippetsBody.innerHTML = '';
  const q = filter.trim().toLowerCase();
  let lastGroup = '';
  let flow = null;
  let shown = 0;

  for (const s of SNIPPETS) {
    if (q &&
        !s.label.toLowerCase().includes(q) &&
        !s.group.toLowerCase().includes(q) &&
        !s.desc.toLowerCase().includes(q) &&
        !s.code.toLowerCase().includes(q)) continue;
    shown++;

    if (s.group !== lastGroup) {
      const groupEl = document.createElement('div');
      groupEl.className = 'snippet-group';
      groupEl.textContent = s.group;
      snippetsBody.appendChild(groupEl);
      flow = document.createElement('div');
      flow.className = 'snippet-flow';
      snippetsBody.appendChild(flow);
      lastGroup = s.group;
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'snippet-btn';
    btn.textContent = s.label;
    btn.addEventListener('click', () => insertSnippet(s));
    flow.appendChild(btn);
  }

  if (shown === 0) {
    const empty = document.createElement('div');
    empty.className = 'snippet-empty';
    empty.textContent = `「${filter.trim()}」に該当するスニペットがありません`;
    snippetsBody.appendChild(empty);
  }
}

function insertSnippet(snippet) {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  const needsNewline = s > 0 && value[s - 1] !== '\n';
  const insert = (needsNewline ? '\n' : '') + snippet.code;

  replaceRange(s, e, insert);

  blockMarks = null; blockMarkKey = '';
  updateHighlight();
  updateLineNumbers();
  syncScroll();
  saveCode();
  scheduleSyntaxCheck();

  renderExplanation({
    title: escapeHtml(snippet.label),
    cat: 'スニペット',
    desc: snippet.desc,
    example: highlightVba(snippet.code.trimEnd()),
  });
}

// ----------------------------------------------------------------
//  自動インデント整形
//  ブロック構造（If/For/With/Select/Sub…）に沿って字下げを付け直す
// ----------------------------------------------------------------
// 各行のインデント段数を計算する。
//   levels[i] … その行を表示する段数
//   after[i]  … その行の直後に新しい行を作るときの段数（自動インデント用）
function computeIndentInfo(lines) {
  const levels = [];
  const after = [];
  let indent = 0;
  const selectStack = []; // Select Case ごとの Case ラベル階層
  let contPrev = false;   // 直前の行が「 _」で継続しているか

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (trimmed === '') { levels.push(indent); after.push(indent); contPrev = false; continue; }

    const strip = stripForScan(raw);
    const endsCont = / _\s*$/.test(strip);

    // 継続行はブロック判定せず1段深く。ブロック状態は変えない
    if (contPrev) { levels.push(indent + 1); after.push(indent); contPrev = endsCont; continue; }

    // ラベル（ErrHandler: など）は行頭
    if (/^[A-Za-z_]\w*:\s*$/.test(strip)) { levels.push(0); after.push(indent); contPrev = endsCont; continue; }

    const info = classifyLine(strip);
    let printIndent = indent;

    if (info.role === 'close') {
      if (info.btype === 'select') {
        const caseLevel = selectStack.length ? selectStack.pop() : indent;
        indent = Math.max(0, caseLevel - 1);
      } else {
        indent = Math.max(0, indent - 1);
      }
      printIndent = indent;
    } else if (info.role === 'mid') {
      if (info.btype === 'select') {
        const caseLevel = selectStack.length ? selectStack[selectStack.length - 1] : indent;
        printIndent = caseLevel;
        indent = caseLevel + 1;
      } else {
        printIndent = Math.max(0, indent - 1);
      }
    }

    levels.push(printIndent);

    if (info.role === 'open') {
      if (info.btype === 'select') selectStack.push(indent + 1);
      indent = indent + 1;
    }
    after.push(indent);
    contPrev = endsCont;
  }
  return { levels, after };
}

function formatVba(code) {
  const INDENT = '    '; // 4スペース（VBE準拠）
  const lines = code.split('\n');
  const { levels } = computeIndentInfo(lines);
  return lines.map((raw, i) => {
    const trimmed = raw.trim();
    return trimmed === '' ? '' : INDENT.repeat(levels[i]) + trimmed;
  }).join('\n');
}

// 開始行に対応する終端行のテキスト（Sub→End Sub, If→End If, For i→Next i …）
function blockCloserText(lineText, btype) {
  const s = stripForScan(lineText);
  switch (btype) {
    case 'proc': {
      const m = /\b(Sub|Function|Property)\b/i.exec(s);
      const kw = m ? m[1].toLowerCase() : 'sub';
      return 'End ' + (kw === 'function' ? 'Function' : kw === 'property' ? 'Property' : 'Sub');
    }
    case 'if':     return 'End If';
    case 'for': {
      const m = /^\s*For\s+(?:Each\s+)?([A-Za-z_]\w*)/i.exec(s);
      return m ? 'Next ' + m[1] : 'Next';
    }
    case 'do':     return 'Loop';
    case 'while':  return 'Wend';
    case 'with':   return 'End With';
    case 'select': return 'End Select';
    case 'type':   return 'End Type';
    case 'enum':   return 'End Enum';
    default:       return null;
  }
}

// ----------------------------------------------------------------
//  静的チェック（Lint + 構造アウトライン）
// ----------------------------------------------------------------
function lintVba(code) {
  const issues = [];
  const lines = code.split('\n');

  // 1. ブロック対応の崩れ
  const { error } = scanBlocks(code);
  if (error) issues.push({ sev: 'error', line: error.line, msg: error.message });

  // 2. 行ごとのチェック
  const forStack = [];
  let onErrorResumeLine = 0;
  lines.forEach((raw, idx) => {
    const s = stripForScan(raw);
    const ln = idx + 1;

    // For / Next の変数一致
    let m = /^\s*For\s+(?:Each\s+)?([A-Za-z_]\w*)/i.exec(s);
    if (m) forStack.push({ name: m[1], line: ln });
    m = /^\s*Next\b\s*([A-Za-z_]\w*)?/i.exec(s);
    if (m) {
      const top = forStack.pop();
      if (top && m[1] && m[1].toLowerCase() !== top.name.toLowerCase()) {
        issues.push({ sev: 'warn', line: ln, msg: `Next の変数「${m[1]}」が For の「${top.name}」（${top.line}行目）と一致していません。` });
      }
    }

    // Dim に As がない → Variant
    if (/^\s*Dim\b/i.test(s) && !/\bAs\b/i.test(s)) {
      issues.push({ sev: 'info', line: ln, msg: '型指定（As 型）がありません。省略すると Variant 型になります。' });
    }

    // マクロ記録の名残
    if (/\.Select\b/i.test(s) || /\.Activate\b/i.test(s) || /\bSelection\b/i.test(s) || /\bActiveCell\b/i.test(s)) {
      issues.push({ sev: 'info', line: ln, msg: '.Select / Selection / ActiveCell はマクロ記録の名残の可能性。対象を直接参照すると高速・安全になります。' });
    }

    // On Error Resume Next の付けっぱなし
    if (/^\s*On\s+Error\s+Resume\s+Next\b/i.test(s)) onErrorResumeLine = ln;
    if (/^\s*On\s+Error\s+GoTo\s+0\b/i.test(s)) onErrorResumeLine = 0;
  });
  if (onErrorResumeLine > 0) {
    issues.push({ sev: 'info', line: onErrorResumeLine, msg: 'On Error Resume Next の後に On Error GoTo 0 が見当たりません。エラーを握りつぶし続ける恐れがあります。' });
  }

  return issues.sort((a, b) => a.line - b.line);
}

function outlineProcs(code) {
  const res = [];
  code.split('\n').forEach((raw, i) => {
    const s = stripForScan(raw);
    const m = /^\s*(?:(?:Public|Private|Friend|Static|Global)\s+)*(Sub|Function|Property\s+(?:Get|Let|Set))\s+([A-Za-z_]\w*)/i.exec(s);
    if (m) res.push({ line: i + 1, kind: m[1].replace(/\s+/g, ' '), name: m[2] });
  });
  return res;
}

function runCheck() {
  const issues = lintVba(textarea.value);
  const procs = outlineProcs(textarea.value);
  const SEV_CLASS = { error: 'out-error', warn: 'out-warn', info: 'out-info' };
  const SEV_TAG = { error: 'エラー', warn: '警告', info: 'ヒント' };
  const frag = [];

  frag.push('<div class="out-heading">お作法チェック</div>');
  if (issues.length === 0) {
    frag.push('<div class="out-line out-ok">✓ 指摘事項はありませんでした。</div>');
  } else {
    for (const it of issues) {
      frag.push(`<div class="out-line ${SEV_CLASS[it.sev]}"><span class="out-tag">${SEV_TAG[it.sev]}</span>${it.line}行目: ${escapeHtml(it.msg)}</div>`);
    }
  }

  frag.push('<div class="out-heading">構造アウトライン</div>');
  if (procs.length === 0) {
    frag.push('<div class="out-line out-muted">Sub / Function は見つかりませんでした。</div>');
  } else {
    for (const p of procs) {
      frag.push(`<div class="out-outline-item"><span class="out-lineno">${String(p.line).padStart(3, ' ')}</span><span class="out-kind">${escapeHtml(p.kind)}</span>${escapeHtml(p.name)}</div>`);
    }
  }

  outputBody.innerHTML = frag.join('');
  outputBody.scrollTop = 0;
}

// ----------------------------------------------------------------
//  イベント
// ----------------------------------------------------------------
let electricBusy = false; // 電気式デデント中の再入防止

// End If / Next / Else / Case などを打ち終えた瞬間、その行を正しい段へ揃える
function maybeElectricDedent() {
  if (electricBusy) return;
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  if (s !== e) return;

  const lineStart = value.lastIndexOf('\n', s - 1) + 1;
  let lineEnd = value.indexOf('\n', s);
  if (lineEnd === -1) lineEnd = value.length;
  const lineText = value.slice(lineStart, lineEnd);
  const trimmed = lineText.trim();

  if (!/^(End\b|Next\b|Loop\b|Wend\b|Else\b|ElseIf\b|Case\b)/i.test(trimmed)) return;
  const info = classifyLine(stripForScan(lineText));
  if (info.role !== 'close' && info.role !== 'mid') return;

  const idx = value.slice(0, lineStart).split('\n').length - 1;
  const { levels } = computeIndentInfo(value.split('\n'));
  const want = (levels[idx] ?? 0) * 4;
  const curLead = (lineText.match(/^ */) || [''])[0].length;
  if (curLead === want) return;

  electricBusy = true;
  replaceRange(lineStart, lineStart + curLead, ' '.repeat(want));
  const delta = want - curLead;
  const caret = Math.max(lineStart + want, s + delta);
  textarea.setSelectionRange(caret, caret);
  electricBusy = false;
}

textarea.addEventListener('input', () => {
  if (!electricBusy) maybeElectricDedent();
  blockMarks = null; blockMarkKey = '';
  updateHighlight();
  updateLineNumbers();
  updateBlockMatch();
  explainCurrentLine();
  saveCode();
  scheduleSyntaxCheck();
});

// ----------------------------------------------------------------
//  入力支援：改行時の自動インデント／括弧・クォートの自動補完
// ----------------------------------------------------------------
let acReeval = null; // オートコンプリートを最新カーソル位置で再評価するフック

function refreshAfterAssist() {
  blockMarks = null; blockMarkKey = '';
  updateHighlight();
  updateLineNumbers();
  syncScroll();
  updateBlockMatch();
  updateExplanation();
  saveCode();
  scheduleSyntaxCheck();
  if (acReeval) acReeval(); // 補完中の一時カーソルで開いた候補を確定後に閉じ直す
}

textarea.addEventListener('keydown', (e) => {
  if (e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
  const { selectionStart: s, selectionEnd: eSel, value } = textarea;

  // --- Enter：自動インデント＋ブロックの終端行を自動挿入 ---
  if (e.key === 'Enter') {
    e.preventDefault();
    const lines = value.split('\n');
    const curIdx = value.slice(0, s).split('\n').length - 1;
    const { levels, after } = computeIndentInfo(lines);

    // ブロック開始行で、行末にカーソルがあり、まだ閉じられていなければ終端を補う
    if (s === eSel) {
      const lineStart = value.lastIndexOf('\n', s - 1) + 1;
      let lineEnd = value.indexOf('\n', s);
      if (lineEnd === -1) lineEnd = value.length;
      const lineText = value.slice(lineStart, lineEnd);
      const restAfter = value.slice(s, lineEnd); // カーソル以降にコードが無いか
      const ci = classifyLine(stripForScan(lineText));

      if (ci.role === 'open' && restAfter.trim() === '') {
        const { groups } = scanBlocks(value);
        const alreadyClosed = groups.some((g) => g.lines.has(curIdx));
        const closer = blockCloserText(lineText, ci.btype);
        if (!alreadyClosed && closer) {
          const openerLevel = levels[curIdx] ?? 0;
          const bodyLevel = openerLevel + 1;
          const insert = '\n' + '    '.repeat(bodyLevel) +
                         '\n' + '    '.repeat(openerLevel) + closer;
          replaceRange(s, eSel, insert);
          const caret = s + 1 + bodyLevel * 4; // 本体行の行頭へ
          textarea.setSelectionRange(caret, caret);
          refreshAfterAssist();
          return;
        }
      }
    }

    // 通常の自動インデント
    const level = after[curIdx] ?? 0;
    replaceRange(s, eSel, '\n' + ' '.repeat(level * 4));
    refreshAfterAssist();
    return;
  }

  // --- 開き括弧「(」：ペアで挿入。選択中なら囲む ---
  if (e.key === '(') {
    e.preventDefault();
    if (s !== eSel) {
      const sel = value.slice(s, eSel);
      replaceRange(s, eSel, '(' + sel + ')');
      textarea.setSelectionRange(s + 1, s + 1 + sel.length);
    } else {
      replaceRange(s, eSel, '()');
      textarea.setSelectionRange(s + 1, s + 1);
    }
    refreshAfterAssist();
    return;
  }

  // --- 閉じ括弧「)」：直後が「)」ならスキップ ---
  if (e.key === ')' && s === eSel && value[s] === ')') {
    e.preventDefault();
    textarea.setSelectionRange(s + 1, s + 1);
    updateBlockMatch();
    return;
  }

  // --- ダブルクォート「"」：ペア挿入／選択を囲む／閉じをスキップ ---
  if (e.key === '"') {
    e.preventDefault();
    if (s !== eSel) {
      const sel = value.slice(s, eSel);
      replaceRange(s, eSel, '"' + sel + '"');
      textarea.setSelectionRange(s + 1, s + 1 + sel.length);
      refreshAfterAssist();
    } else if (value[s] === '"') {
      textarea.setSelectionRange(s + 1, s + 1); // 閉じクォートを飛び越える
      updateBlockMatch();
    } else {
      replaceRange(s, eSel, '""');
      textarea.setSelectionRange(s + 1, s + 1);
      refreshAfterAssist();
    }
    return;
  }

  // --- Backspace：空のペア () "" はまとめて削除 ---
  if (e.key === 'Backspace' && s === eSel && s > 0) {
    const prev = value[s - 1], next = value[s];
    if ((prev === '(' && next === ')') || (prev === '"' && next === '"')) {
      e.preventDefault();
      replaceRange(s - 1, s + 1, '');
      refreshAfterAssist();
    }
  }
});

btnRun.addEventListener('click', runCheck);

// 整形：ブロック構造に沿ってインデントを付け直す（現在行を保つ）
btnFormat.addEventListener('click', () => {
  if (!textarea.value.trim()) return;
  const curLine = textarea.value.slice(0, textarea.selectionStart).split('\n').length - 1;

  const formatted = formatVba(textarea.value);
  if (formatted === textarea.value) {
    btnFormat.textContent = '整形済み';
    setTimeout(() => { btnFormat.textContent = '整形'; }, 1200);
    return;
  }

  replaceRange(0, textarea.value.length, formatted);
  saveCode();
  blockMarks = null; blockMarkKey = '';
  updateHighlight();
  updateLineNumbers();

  // 整形前と同じ行の先頭へキャレットを戻す
  const flines = formatted.split('\n');
  let caret = 0;
  for (let i = 0; i < Math.min(curLine, flines.length); i++) caret += flines[i].length + 1;
  textarea.setSelectionRange(caret, caret);
  syncScroll();
  textarea.focus();
  updateBlockMatch();
  updateExplanation();
  checkSyntax();

  btnFormat.textContent = '整形完了';
  setTimeout(() => { btnFormat.textContent = '整形'; }, 1200);
});

btnCopy.addEventListener('click', () => {
  const done = () => {
    btnCopy.textContent = '完了!';
    setTimeout(() => { btnCopy.textContent = 'コピー'; }, 1500);
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(textarea.value).then(done).catch(() => {
      textarea.select();
      document.execCommand('copy');
      done();
    });
  } else {
    textarea.select();
    document.execCommand('copy');
    done();
  }
});

btnClear.addEventListener('click', () => {
  if (!textarea.value) return;
  if (!confirm('エディタの内容をすべてクリアしますか？')) return;
  replaceRange(0, textarea.value.length, '');
  saveCode();
  blockMarks = null; blockMarkKey = '';
  updateHighlight();
  updateLineNumbers();
  checkSyntax();
  renderPlaceholder();
  textarea.focus();
});

btnReset.addEventListener('click', () => {
  if (textarea.value !== SAMPLE_CODE &&
      !confirm('編集中のコードを破棄してサンプルコードに戻しますか？')) return;
  replaceRange(0, textarea.value.length, SAMPLE_CODE);
  saveCode();
  blockMarks = null; blockMarkKey = '';
  updateHighlight();
  updateLineNumbers();
  textarea.setSelectionRange(0, 0);
  textarea.scrollTop = 0;
  textarea.scrollLeft = 0;
  syncScroll();
  textarea.focus();
  explainCurrentLine();
  checkSyntax();
});

// Ctrl+Enter（Mac: Cmd+Enter）でチェック
textarea.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    runCheck();
  }
});

// カーソル移動時：ブロック対応の強調＋解説を更新
function onCursorMove() {
  updateBlockMatch();
  updateExplanation();
}

textarea.addEventListener('scroll', syncScroll);
textarea.addEventListener('click', onCursorMove);
textarea.addEventListener('keyup', onCursorMove);
textarea.addEventListener('select', onCursorMove);
textarea.addEventListener('mouseup', onCursorMove);

// Tab / Shift+Tab でインデント（スペース4つ = VBE準拠）
textarea.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  const { selectionStart: s, selectionEnd: end, value } = textarea;
  const INDENT = '    ';

  const isMultiLine = s !== end && value.slice(s, end).includes('\n');

  if (isMultiLine) {
    const blockStart = value.lastIndexOf('\n', s - 1) + 1;
    let effEnd = end;
    if (effEnd > blockStart && value[effEnd - 1] === '\n') effEnd--;
    const lastLineEnd = value.indexOf('\n', effEnd);
    const blockEnd = lastLineEnd === -1 ? value.length : lastLineEnd;

    const lines = value.slice(blockStart, blockEnd).split('\n');
    let firstDelta;
    let newLines;
    if (!e.shiftKey) {
      newLines = lines.map((l) => (l.length ? INDENT + l : l));
      firstDelta = lines[0].length ? INDENT.length : 0;
    } else {
      const removed = (l) => {
        if (l.startsWith(INDENT)) return 4;
        const sp = l.match(/^ {1,4}/);
        return sp ? sp[0].length : (l.startsWith('\t') ? 1 : 0);
      };
      newLines = lines.map((l) => l.slice(removed(l)));
      firstDelta = -removed(lines[0]);
    }

    const newBlock = newLines.join('\n');
    const totalDelta = newBlock.length - (blockEnd - blockStart);
    replaceRange(blockStart, blockEnd, newBlock);

    const newS = Math.max(blockStart, s + firstDelta);
    const newEnd = Math.max(newS, end + totalDelta);
    textarea.setSelectionRange(newS, newEnd);
  } else if (!e.shiftKey) {
    replaceRange(s, end, INDENT);
  } else {
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    const seg = value.slice(lineStart, lineStart + 4);
    const sp = seg.match(/^ {1,4}/);
    if (sp) {
      replaceRange(lineStart, lineStart + sp[0].length, '');
      const caret = Math.max(lineStart, s - sp[0].length);
      textarea.setSelectionRange(caret, caret);
    }
  }

  blockMarks = null; blockMarkKey = '';
  updateHighlight();
  updateLineNumbers();
  saveCode();
  scheduleSyntaxCheck();
});

// スニペット検索
snippetSearch.addEventListener('input', () => renderSnippets(snippetSearch.value));

// ----------------------------------------------------------------
//  初期化（前回の編集内容があれば復元）
// ----------------------------------------------------------------
const savedCode = loadSavedCode();
textarea.value = savedCode !== null ? savedCode : SAMPLE_CODE;
updateHighlight();
updateLineNumbers();
renderSnippets();
textarea.setSelectionRange(0, 0);
explainCurrentLine();
checkSyntax();

// ================================================================
//  変換ツール（モーダル）― ブラウザ内で完結する計算・テスター
// ================================================================

// ---- 列番号 ⇔ 列文字 ----
function colLetterToNum(s) {
  s = s.trim().toUpperCase();
  if (!/^[A-Z]{1,3}$/.test(s)) return null;
  let n = 0;
  for (let i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
  return (n >= 1 && n <= 16384) ? n : null; // Excelの列上限
}
function colNumToLetter(n) {
  n = Math.floor(n);
  if (!(n >= 1 && n <= 16384)) return null;
  let s = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// ---- Format 書式 ----
function formatNumberVba(num, fmt) {
  if (isNaN(num)) return null;
  const isPercent = fmt.includes('%');
  const f = fmt.replace(/%/g, '');
  let value = isPercent ? num * 100 : num;
  const neg = value < 0;
  value = Math.abs(value);

  const dot = f.indexOf('.');
  const intPart = dot === -1 ? f : f.slice(0, dot);
  const decPart = dot === -1 ? '' : f.slice(dot + 1);
  const decimals = (decPart.match(/[0#]/g) || []).length;

  const rounded = value.toFixed(decimals);
  let [intStr, decStr = ''] = rounded.split('.');

  const minInt = (intPart.match(/0/g) || []).length;
  while (intStr.length < minInt) intStr = '0' + intStr;
  if (intStr === '' ) intStr = '0';

  if (intPart.includes(',')) intStr = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  let out = intStr;
  if (decimals > 0) out += '.' + decStr;
  if (isPercent) out += '%';
  if (neg) out = '-' + out;
  return out;
}

function getJpEra(d) {
  if (d >= new Date(2019, 4, 1))  return { name: '令和', abbr: '令', alpha: 'R', year: d.getFullYear() - 2018 };
  if (d >= new Date(1989, 0, 8))  return { name: '平成', abbr: '平', alpha: 'H', year: d.getFullYear() - 1988 };
  if (d >= new Date(1926, 11, 25)) return { name: '昭和', abbr: '昭', alpha: 'S', year: d.getFullYear() - 1925 };
  return { name: '', abbr: '', alpha: '', year: d.getFullYear() };
}

function parseDateInput(s) {
  s = String(s).trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) s = '2000/01/01 ' + s; // 時刻のみ
  return new Date(s.replace(/-/g, '/'));
}

const FMT_DATE_TOKENS = ['yyyy','yy','mm','m','dd','d','hh','h','nn','n','ss','s','aaaa','aaa','ggge','gge','ge','e']
  .sort((a, b) => b.length - a.length);

function formatDateVba(d, fmt) {
  if (isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, '0');
  const WD = ['日','月','火','水','木','金','土'];
  const era = getJpEra(d);

  // トークン分解
  const toks = [];
  let i = 0;
  while (i < fmt.length) {
    let matched = null;
    for (const t of FMT_DATE_TOKENS) {
      if (fmt.substr(i, t.length).toLowerCase() === t) { matched = t; break; }
    }
    if (matched) { toks.push({ type: 'tok', v: matched }); i += matched.length; }
    else { toks.push({ type: 'lit', v: fmt[i] }); i++; }
  }

  // m / mm の意味（月 or 分）を前後のトークンから判定
  const idxTok = toks.map((t, k) => (t.type === 'tok' ? k : -1)).filter((k) => k >= 0);
  const render = (t, minuteMode) => {
    switch (t) {
      case 'yyyy': return d.getFullYear();
      case 'yy':   return pad(d.getFullYear() % 100);
      case 'mm':   return minuteMode ? pad(d.getMinutes()) : pad(d.getMonth() + 1);
      case 'm':    return minuteMode ? d.getMinutes() : d.getMonth() + 1;
      case 'dd':   return pad(d.getDate());
      case 'd':    return d.getDate();
      case 'hh':   return pad(d.getHours());
      case 'h':    return d.getHours();
      case 'nn':   return pad(d.getMinutes());
      case 'n':    return d.getMinutes();
      case 'ss':   return pad(d.getSeconds());
      case 's':    return d.getSeconds();
      case 'aaaa': return WD[d.getDay()] + '曜日';
      case 'aaa':  return WD[d.getDay()];
      case 'ggge': return era.name + era.year;
      case 'gge':  return era.abbr + era.year;
      case 'ge':   return era.alpha + era.year;
      case 'e':    return era.year;
      default:     return t;
    }
  };

  return toks.map((tk, k) => {
    if (tk.type === 'lit') return tk.v;
    let minuteMode = false;
    if (tk.v === 'm' || tk.v === 'mm') {
      const pos = idxTok.indexOf(k);
      const prev = pos > 0 ? toks[idxTok[pos - 1]].v : '';
      const next = pos < idxTok.length - 1 ? toks[idxTok[pos + 1]].v : '';
      minuteMode = /^h+$/.test(prev) || /^s+$/.test(next);
    }
    return render(tk.v, minuteMode);
  }).join('');
}

function vbaFormat(rawVal, fmt) {
  if (!fmt) return { result: String(rawVal), kind: '—' };
  const numeric = /^[#0.,%\s+\-]+$/.test(fmt);
  if (numeric) {
    const num = parseFloat(String(rawVal).replace(/,/g, ''));
    const r = formatNumberVba(num, fmt);
    return { result: r, kind: '数値', ok: r !== null };
  }
  const d = parseDateInput(rawVal);
  const r = formatDateVba(d, fmt);
  return { result: r, kind: '日付', ok: r !== null };
}

// ---- 色 (RGB) ----
function clamp255(n) { n = parseInt(n, 10); if (isNaN(n)) n = 0; return Math.max(0, Math.min(255, n)); }
function toHex2(n) { return clamp255(n).toString(16).toUpperCase().padStart(2, '0'); }

// ---- モーダル配線 ----
(function initTools() {
  const overlay = document.getElementById('tools-overlay');
  const btnTools = document.getElementById('btn-tools');
  const btnClose = document.getElementById('tools-close');
  if (!overlay || !btnTools) return;

  const openModal = () => { overlay.classList.remove('hidden'); };
  const closeModal = () => { overlay.classList.add('hidden'); };
  btnTools.addEventListener('click', openModal);
  btnClose.addEventListener('click', closeModal);
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeModal();
  });

  // タブ切替
  const tabs = overlay.querySelectorAll('.mtab');
  const panes = { col: 'pane-col', fmt: 'pane-fmt', re: 'pane-re', rgb: 'pane-rgb' };
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      Object.values(panes).forEach((id) => document.getElementById(id).classList.add('hidden'));
      document.getElementById(panes[tab.dataset.tab]).classList.remove('hidden');
    });
  });

  // --- 列変換 ---
  const colLetter = document.getElementById('col-letter');
  const colLetterOut = document.getElementById('col-letter-out');
  const colNum = document.getElementById('col-num');
  const colNumOut = document.getElementById('col-num-out');

  colLetter.addEventListener('input', () => {
    const v = colLetter.value.trim();
    if (!v) { colLetterOut.textContent = ''; return; }
    const n = colLetterToNum(v);
    colLetterOut.innerHTML = n === null
      ? '<span class="err">列文字として認識できません（A〜XFD）</span>'
      : `${v.toUpperCase()} = ${n} 列目\nCells(1, ${n})  ⇔  Range("${v.toUpperCase()}1")`;
  });
  colNum.addEventListener('input', () => {
    const v = colNum.value.trim();
    if (!v) { colNumOut.textContent = ''; return; }
    const s = colNumToLetter(Number(v));
    colNumOut.innerHTML = s === null
      ? '<span class="err">1〜16384 の範囲で入力してください</span>'
      : `${parseInt(v, 10)} 列目 = ${s}\nRange("${s}1")  ⇔  Cells(1, ${parseInt(v, 10)})`;
  });

  // --- Format ---
  const fmtVal = document.getElementById('fmt-val');
  const fmtFmt = document.getElementById('fmt-fmt');
  const fmtOut = document.getElementById('fmt-out');
  const fmtCode = document.getElementById('fmt-code');
  const fmtChips = document.getElementById('fmt-chips');
  ['#,##0','#,##0.00','0.0%','000','yyyy/mm/dd','yyyy/mm/dd(aaa)','hh:nn:ss','ggge年m月d日'].forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = c;
    b.addEventListener('click', () => { fmtFmt.value = c; updateFmt(); });
    fmtChips.appendChild(b);
  });
  function updateFmt() {
    const val = fmtVal.value.trim();
    const fmt = fmtFmt.value;
    if (!val || !fmt) { fmtOut.textContent = ''; fmtCode.textContent = ''; return; }
    const { result, kind, ok } = vbaFormat(val, fmt);
    if (ok === false || result === null) {
      fmtOut.innerHTML = '<span class="err">この値と書式では変換できませんでした</span>';
      fmtCode.textContent = '';
      return;
    }
    fmtOut.innerHTML = `${escapeHtml(result)}  <span class="muted">（${kind}書式）</span>`;
    const q = kind === '数値' ? val.replace(/,/g, '') : `"${val}"`;
    fmtCode.textContent = `Debug.Print Format(${q}, "${fmt}")   ' → ${result}`;
  }
  fmtVal.addEventListener('input', updateFmt);
  fmtFmt.addEventListener('input', updateFmt);

  // --- 正規表現 ---
  const rePat = document.getElementById('re-pat');
  const reStr = document.getElementById('re-str');
  const reIc = document.getElementById('re-ic');
  const reG = document.getElementById('re-g');
  const reOut = document.getElementById('re-out');
  const reCode = document.getElementById('re-code');
  function updateRe() {
    const pat = rePat.value;
    if (!pat) { reOut.textContent = ''; reCode.textContent = ''; return; }
    let flags = '';
    if (reIc.checked) flags += 'i';
    if (reG.checked) flags += 'g';
    let re;
    try {
      re = new RegExp(pat, flags);
    } catch (err) {
      reOut.innerHTML = `<span class="err">パターン誤り: ${escapeHtml(err.message)}</span>`;
      reCode.textContent = '';
      return;
    }
    const str = reStr.value;
    // global フラグは test() が lastIndex を進めるため、判定は非global版で行う
    const test = new RegExp(pat, reIc.checked ? 'i' : '').test(str);
    let html = `Test: <b>${test ? 'True（一致あり）' : 'False（一致なし）'}</b>`;
    if (reG.checked) {
      const ms = str.match(re);
      if (ms && ms.length) html += `\n一致 ${ms.length} 件: ${escapeHtml(ms.join(' , '))}`;
    } else {
      const m = str.match(re);
      if (m) {
        html += `\n一致: ${escapeHtml(m[0])}`;
        if (m.length > 1) html += `\nグループ: ${escapeHtml(m.slice(1).join(' , '))}`;
      }
    }
    reOut.innerHTML = html;
    reCode.textContent =
      `Dim re As Object\n` +
      `Set re = CreateObject("VBScript.RegExp")\n` +
      `re.Pattern = "${pat.replace(/"/g, '""')}"\n` +
      `re.IgnoreCase = ${reIc.checked ? 'True' : 'False'}\n` +
      `re.Global = ${reG.checked ? 'True' : 'False'}\n` +
      `If re.Test(target) Then MsgBox "一致しました"`;
  }
  [rePat, reStr].forEach((el) => el.addEventListener('input', updateRe));
  [reIc, reG].forEach((el) => el.addEventListener('change', updateRe));

  // --- 色 (RGB) ---
  const rgbR = document.getElementById('rgb-r'), rgbG = document.getElementById('rgb-g'), rgbB = document.getElementById('rgb-b');
  const rgbRn = document.getElementById('rgb-rn'), rgbGn = document.getElementById('rgb-gn'), rgbBn = document.getElementById('rgb-bn');
  const rgbHex = document.getElementById('rgb-hex');
  const rgbSwatch = document.getElementById('rgb-swatch');
  const rgbCode = document.getElementById('rgb-code');

  function renderRgb(r, g, b) {
    rgbR.value = r; rgbG.value = g; rgbB.value = b;
    rgbRn.value = r; rgbGn.value = g; rgbBn.value = b;
    const hex = '#' + toHex2(r) + toHex2(g) + toHex2(b);
    if (document.activeElement !== rgbHex) rgbHex.value = hex;
    rgbSwatch.style.background = hex;
    const longVal = r + g * 256 + b * 65536;               // VBA の色Long値
    const vbaHex = '&H' + toHex2(b) + toHex2(g) + toHex2(r); // VBAは &HBBGGRR
    rgbCode.textContent =
      `.Interior.Color = RGB(${r}, ${g}, ${b})\n` +
      `' 数値: ${longVal}   16進: ${vbaHex}   Web: ${hex}`;
  }
  function fromSliders() { renderRgb(clamp255(rgbR.value), clamp255(rgbG.value), clamp255(rgbB.value)); }
  function fromNumbers() { renderRgb(clamp255(rgbRn.value), clamp255(rgbGn.value), clamp255(rgbBn.value)); }
  function fromHex() {
    let h = rgbHex.value.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split('').map((c) => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return;
    renderRgb(parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16));
  }
  [rgbR, rgbG, rgbB].forEach((el) => el.addEventListener('input', fromSliders));
  [rgbRn, rgbGn, rgbBn].forEach((el) => el.addEventListener('input', fromNumbers));
  rgbHex.addEventListener('input', fromHex);
  renderRgb(0, 112, 192); // 初期色
})();

// ================================================================
//  オートコンプリート（入力中の候補表示）
// ================================================================
const AC_KEYWORDS = [
  'Dim','ReDim','Preserve','Const','Set','Sub','Function','Property','End','Exit',
  'If','Then','Else','ElseIf','For','Each','Next','To','Step','In',
  'Do','Loop','While','Until','Wend','With','Select','Case',
  'On','Error','Resume','GoTo','Call','New','As','ByVal','ByRef','Optional','ParamArray',
  'Public','Private','Friend','Static','Global','Option','Explicit',
  'Nothing','True','False','Empty','Null','Me','And','Or','Not','Xor','Mod','Is','Like','Declare','PtrSafe'
];
const AC_TYPES = [
  'Long','Integer','Double','Single','String','Boolean','Byte','Variant','Object','Date',
  'Currency','LongPtr','LongLong','Worksheet','Workbook','Range','Collection','Application','Chart'
];
const AC_FUNCS = [
  'MsgBox','InputBox','Range','Cells','Rows','Columns','Worksheets','Workbooks','ThisWorkbook',
  'ActiveSheet','ActiveWorkbook','ActiveCell','Selection','Offset','Resize','CurrentRegion',
  'Format','CStr','CLng','CInt','CDbl','CDate','CBool','Val','Str',
  'Trim','LTrim','RTrim','Left','Right','Mid','Len','Replace','InStr','InStrRev',
  'Split','Join','UCase','LCase','StrConv','Space','Chr','Asc',
  'UBound','LBound','Array','Erase','IsEmpty','IsNull','IsNumeric','IsDate','IsError','IsArray','IsObject',
  'Now','Date','Time','Year','Month','Day','Hour','Minute','Second','Weekday','WeekdayName',
  'DateSerial','TimeSerial','DateAdd','DateDiff','DatePart','TimeValue','DateValue',
  'CreateObject','GetObject','Dir','FreeFile','Kill','MkDir','RmDir','FileCopy','Environ',
  'Timer','Rnd','Randomize','Int','Fix','Abs','Round','Sqr','Sgn',
  'WorksheetFunction','Debug','Err','RGB','TypeName','VarType',
  'vbCrLf','vbTab','vbLf','vbCr','vbNullString','vbYes','vbNo','vbYesNo','vbOKCancel',
  'vbInformation','vbExclamation','vbCritical','vbQuestion','vbOKOnly',
  'xlUp','xlDown','xlToLeft','xlToRight','xlValues','xlWhole','xlPart','xlContinuous','xlCenter',
  'xlCellTypeVisible','xlCellTypeBlanks','xlCalculationManual','xlCalculationAutomatic'
];

function buildCompletions() {
  const map = new Map();
  const add = (label, kind) => { const k = label.toLowerCase(); if (!map.has(k)) map.set(k, { label, kind }); };
  AC_KEYWORDS.forEach((w) => add(w, 'kw'));
  AC_TYPES.forEach((w) => add(w, 'type'));
  AC_FUNCS.forEach((w) => add(w, /^(vb|xl)/.test(w) ? 'const' : 'fn'));
  return [...map.values()];
}
const COMPLETIONS = buildCompletions();
const AC_KIND_LABEL = { kw: 'キーワード', type: '型', fn: '関数', const: '定数', member: 'メンバー', snippet: 'スニペット' };

// カーソル直前の入力中の単語（直前が「.」ならメンバー扱いとして対象外）
function acCurrentWord(value, pos) {
  const before = value.slice(0, pos);
  const m = before.match(/[A-Za-z_][A-Za-z0-9_]*$/);
  if (!m) return null;
  const start = pos - m[0].length;
  if (start > 0 && value[start - 1] === '.') return null;
  return { word: m[0], start, end: pos };
}

function acCandidates(prefix) {
  const p = prefix.toLowerCase();
  const starts = [], contains = [];
  for (const it of COMPLETIONS) {
    const l = it.label.toLowerCase();
    if (l === p) continue;               // 入力済みと完全一致は除外
    if (l.startsWith(p)) starts.push(it);
    else if (p.length >= 2 && l.includes(p)) contains.push(it);
  }
  starts.sort((a, b) => a.label.length - b.label.length || a.label.localeCompare(b.label));
  return starts.concat(contains).slice(0, 10);
}

// ---- メンバー補完（. の後） ----
const MEMBERS = {
  Worksheet: ['Range','Cells','Rows','Columns','Name','Index','Visible','UsedRange','Activate','Select','Copy','Delete','Move','Protect','Unprotect','AutoFilter','AutoFilterMode','PageSetup','ChartObjects','Shapes','Sort','Calculate'],
  Workbook: ['Worksheets','Sheets','Names','Save','SaveAs','SaveCopyAs','Close','Activate','Path','FullName','Name','Windows','ActiveSheet','Protect','Unprotect','PivotCaches'],
  Range: ['Value','Value2','Text','Formula','FormulaR1C1','FormulaLocal','Row','Column','Rows','Columns','Cells','Offset','Resize','End','Count','Address','Interior','Font','Borders','NumberFormat','NumberFormatLocal','ClearContents','Clear','ClearFormats','Copy','Cut','PasteSpecial','Select','Activate','Merge','UnMerge','MergeCells','CurrentRegion','EntireRow','EntireColumn','SpecialCells','Find','FindNext','Replace','Sort','AutoFilter','AutoFit','HorizontalAlignment','VerticalAlignment','WrapText','Locked','Comment','AddComment','Hyperlinks'],
  Application: ['ScreenUpdating','Calculation','EnableEvents','DisplayAlerts','Cursor','StatusBar','WorksheetFunction','Workbooks','ActiveWorkbook','ThisWorkbook','ActiveSheet','ActiveCell','Selection','Wait','InputBox','FileDialog','Run','Quit','Version','CentimetersToPoints','Intersect','Union','Transpose'],
  Collection: ['Add','Item','Count','Remove'],
  Dictionary: ['Add','Exists','Item','Items','Keys','Count','Remove','RemoveAll','CompareMode'],
  FSO: ['CreateTextFile','OpenTextFile','FileExists','FolderExists','CreateFolder','GetFolder','GetFile','DeleteFile','DeleteFolder','CopyFile','MoveFile','GetBaseName','GetExtensionName','BuildPath'],
  Err: ['Number','Description','Source','Raise','Clear','HelpContext'],
  Debug: ['Print','Assert'],
  WorksheetFunction: ['Sum','SumIf','SumIfs','CountIf','CountIfs','CountA','VLookup','HLookup','Match','Index','Max','Min','Average','Round','RoundUp','RoundDown','NetworkDays','Transpose','Rank','Large','Small','Trim','Proper']
};
const MEMBERS_GENERIC = ['Value','Cells','Range','Rows','Columns','Count','Name','Row','Column','Offset','Resize','End','Add','Item','Exists','Keys','Items','Select','Activate','Copy','Delete','Text','Font','Interior','Close','Open'];
const GLOBAL_TYPES = {
  thisworkbook: 'Workbook', activeworkbook: 'Workbook', activesheet: 'Worksheet',
  activecell: 'Range', selection: 'Range', application: 'Application',
  cells: 'Range', range: 'Range', rows: 'Range', columns: 'Range',
  worksheetfunction: 'WorksheetFunction', err: 'Err', debug: 'Debug', me: 'Worksheet'
};
function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function normalizeType(name) {
  const nl = name.toLowerCase();
  for (const t of Object.keys(MEMBERS)) if (t.toLowerCase() === nl) return t;
  if (nl === 'worksheets' || nl === 'sheets') return 'Worksheet';
  if (nl === 'workbooks') return 'Workbook';
  if (nl === 'scripting') return null;
  return name;
}
function inferType(value, base) {
  const bl = base.toLowerCase();
  if (GLOBAL_TYPES[bl]) return GLOBAL_TYPES[bl];
  let m = new RegExp('\\b(?:Dim|Private|Public|Static|Global|Const|ByVal|ByRef|Optional)\\s+' + escapeReg(base) + '\\s+As\\s+(?:New\\s+)?([A-Za-z_]\\w*)', 'i').exec(value);
  if (m) return normalizeType(m[1]);
  m = new RegExp('\\bSet\\s+' + escapeReg(base) + '\\s*=\\s*New\\s+([A-Za-z_]\\w*)', 'i').exec(value);
  if (m) return normalizeType(m[1]);
  m = new RegExp('\\bSet\\s+' + escapeReg(base) + '\\s*=\\s*CreateObject\\(\\s*"([^"]+)"', 'i').exec(value);
  if (m) {
    const t = m[1].toLowerCase();
    if (t.includes('dictionary')) return 'Dictionary';
    if (t.includes('filesystemobject')) return 'FSO';
  }
  return null;
}
// カーソル直前が「ident . partial」ならメンバー補完の対象
function acMemberContext(value, pos) {
  const before = value.slice(0, pos);
  const m = before.match(/([A-Za-z_]\w*)\s*\.\s*([A-Za-z_]\w*|)$/);
  if (!m) return null;
  const partial = m[2] || '';
  return { base: m[1], partial, partialStart: pos - partial.length };
}
function memberCandidates(type, partial) {
  const list = (type && MEMBERS[type]) ? MEMBERS[type] : MEMBERS_GENERIC;
  const p = partial.toLowerCase();
  const starts = [], contains = [];
  for (const name of list) {
    const l = name.toLowerCase();
    if (l === p && p !== '') continue;
    if (l.startsWith(p)) starts.push(name);
    else if (p.length >= 2 && l.includes(p)) contains.push(name);
  }
  starts.sort((a, b) => a.length - b.length || a.localeCompare(b));
  return starts.concat(contains).slice(0, 12).map((name) => ({ label: name, kind: 'member' }));
}

// ---- スニペット補完（英語トリガ）----
const SNIPPET_TRIGGERS = [
  ['lastrow', '最終行を取得'], ['lastcol', '最終列を取得'], ['forr', 'For で最終行までループ'],
  ['wsloop', '全シートをループ'], ['dictagg', 'Dictionary で集計'], ['dictuniq', 'Dictionary で重複排除'],
  ['errh', 'エラーハンドラ雛形'], ['fast', '高速化テンプレ'], ['arrread', '範囲を配列へ一括読込'],
  ['arrwrite', '配列を一括書き込み'], ['sheetexists', 'シート存在チェック'], ['openwb', '別ブックを開いて閉じる'],
  ['dountil', 'Do Until 最終行まで'], ['selcase', 'Select Case で分岐'], ['fsoread', 'テキスト読み込み（FSO）'],
  ['dirloop', 'フォルダ内ファイル列挙（Dir）'], ['msgyn', 'はい/いいえ確認'], ['required', '必須チェック'],
  ['timer', '処理時間を計測'], ['regexp', 'RegExpでマッチ判定'],
  ['newmodule', '標準モジュールの基本形'], ['maintool', 'メイン処理の骨格（分割呼び出し）'],
  ['config', '設定セクション（定数まとめ）'], ['header', 'プロシージャ用コメントヘッダ'],
  ['classnew', 'クラスモジュールの雛形'], ['entry', 'ボタンから呼ぶエントリ'],
  ['initbook', 'シート・ブックの取得（初期化）'], ['loadsettings', '設定シートから値を読み込む']
];
const SNIPPET_COMPLETIONS = SNIPPET_TRIGGERS
  .map(([trig, label]) => { const s = SNIPPETS.find((x) => x.label === label); return s ? { label: trig, kind: 'snippet', code: s.code, title: label } : null; })
  .filter(Boolean);

function wordCandidates(prefix) {
  const p = prefix.toLowerCase();
  const snips = SNIPPET_COMPLETIONS.filter((s) => s.label.toLowerCase().startsWith(p));
  return snips.concat(acCandidates(prefix)).slice(0, 10);
}

// ---- 引数ヒント（シグネチャ）----
const SIGNATURES = {
  msgbox: ['Prompt', '[Buttons]', '[Title]', '[HelpFile]', '[Context]'],
  inputbox: ['Prompt', '[Title]', '[Default]', '[XPos]', '[YPos]'],
  range: ['Cell1', '[Cell2]'],
  cells: ['[RowIndex]', '[ColumnIndex]'],
  offset: ['[RowOffset]', '[ColumnOffset]'],
  resize: ['[RowSize]', '[ColumnSize]'],
  format: ['Expression', '[Format]', '[FirstDayOfWeek]', '[FirstWeekOfYear]'],
  left: ['String', 'Length'], right: ['String', 'Length'], mid: ['String', 'Start', '[Length]'],
  len: ['String'], instr: ['[Start]', 'String1', 'String2', '[Compare]'],
  instrrev: ['StringCheck', 'StringMatch', '[Start]', '[Compare]'],
  replace: ['Expression', 'Find', 'Replace', '[Start]', '[Count]', '[Compare]'],
  split: ['Expression', '[Delimiter]', '[Limit]', '[Compare]'],
  join: ['SourceArray', '[Delimiter]'],
  ubound: ['ArrayName', '[Dimension]'], lbound: ['ArrayName', '[Dimension]'],
  dir: ['[PathName]', '[Attributes]'], createobject: ['Class', '[ServerName]'],
  dateadd: ['Interval', 'Number', 'Date'], datediff: ['Interval', 'Date1', 'Date2', '[FirstDayOfWeek]', '[FirstWeekOfYear]'],
  dateserial: ['Year', 'Month', 'Day'], timeserial: ['Hour', 'Minute', 'Second'],
  round: ['Number', '[NumDigitsAfterDecimal]'], cdate: ['Expression'], cstr: ['Expression'],
  clng: ['Expression'], cint: ['Expression'], cdbl: ['Expression'], val: ['String'],
  ucase: ['String'], lcase: ['String'], trim: ['String'], strconv: ['String', 'Conversion'],
  array: ['[Arg0]', '[Arg1]', '...'], now: [], date: [], time: []
};
// カーソルを囲む未閉じの「(」を探し、関数名と現在の引数番号を返す
function sigContext(value, pos) {
  const lineStart = value.lastIndexOf('\n', pos - 1) + 1;
  const line = value.slice(lineStart, pos);
  const stripped = stripForScan(line); // 文字列内のカンマ/括弧を無視
  let depth = 0, commas = 0, openIdx = -1;
  for (let i = stripped.length - 1; i >= 0; i--) {
    const c = stripped[i];
    if (c === ')') depth++;
    else if (c === '(') { if (depth === 0) { openIdx = i; break; } depth--; }
    else if (c === ',' && depth === 0) commas++;
  }
  if (openIdx < 0) return null;
  let j = openIdx - 1;
  while (j >= 0 && /\s/.test(stripped[j])) j--;
  const e = j + 1;
  while (j >= 0 && /[A-Za-z0-9_]/.test(stripped[j])) j--;
  const name = line.slice(j + 1, e);
  if (!name || !SIGNATURES[name.toLowerCase()]) return null;
  return { name, argIndex: commas, params: SIGNATURES[name.toLowerCase()] };
}

(function initAutocomplete() {
  const editorWrap = document.getElementById('editor-wrap');
  if (!editorWrap || !textarea) return;

  const dropdown = document.createElement('div');
  dropdown.id = 'ac-dropdown';
  dropdown.className = 'hidden';
  editorWrap.appendChild(dropdown);

  const sigHint = document.createElement('div');
  sigHint.id = 'sig-hint';
  sigHint.className = 'hidden';
  editorWrap.appendChild(sigHint);

  let mirror = null;
  let acOpen = false;
  let acItems = [];
  let acIndex = 0;
  let acWord = null;      // { start, end, text }
  let acSuppress = false;

  function ensureMirror() {
    if (mirror) return mirror;
    mirror = document.createElement('div');
    mirror.id = 'ac-mirror';
    const cs = getComputedStyle(textarea);
    ['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','tabSize',
     'paddingTop','paddingRight','paddingBottom','paddingLeft','boxSizing'].forEach((p) => {
      mirror.style[p] = cs[p];
    });
    mirror.style.position = 'absolute';
    mirror.style.top = '0';
    mirror.style.left = '0';
    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace = 'pre';
    mirror.style.overflow = 'hidden';
    mirror.style.pointerEvents = 'none';
    editorWrap.appendChild(mirror);
    return mirror;
  }

  function caretCoords() {
    try {
      const m = ensureMirror();
      m.style.width = textarea.clientWidth + 'px';
      m.style.height = textarea.clientHeight + 'px';
      m.textContent = textarea.value.slice(0, textarea.selectionStart);
      const marker = document.createElement('span');
      marker.textContent = '​';
      m.appendChild(marker);
      const top = marker.offsetTop - textarea.scrollTop;
      const left = marker.offsetLeft - textarea.scrollLeft;
      m.textContent = '';
      return { top, left };
    } catch { return { top: 0, left: 0 }; }
  }

  function lineHeightPx() {
    const cs = getComputedStyle(textarea);
    let lh = parseFloat(cs.lineHeight);
    if (isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.55;
    return lh;
  }

  function renderDropdown() {
    dropdown.innerHTML = '';
    acItems.forEach((it, i) => {
      const row = document.createElement('div');
      row.className = 'ac-item' + (i === acIndex ? ' active' : '');
      const label = document.createElement('span');
      label.className = 'ac-label';
      const typed = (acWord && acWord.text) ? acWord.text : '';
      const idx = typed ? it.label.toLowerCase().indexOf(typed.toLowerCase()) : -1;
      if (idx >= 0) {
        label.appendChild(document.createTextNode(it.label.slice(0, idx)));
        const b = document.createElement('b');
        b.textContent = it.label.slice(idx, idx + typed.length);
        label.appendChild(b);
        label.appendChild(document.createTextNode(it.label.slice(idx + typed.length)));
      } else {
        label.textContent = it.label;
      }
      if (it.kind === 'snippet' && it.title) row.title = it.title;
      const kind = document.createElement('span');
      kind.className = 'ac-kind';
      kind.textContent = AC_KIND_LABEL[it.kind] || '';
      row.appendChild(label);
      row.appendChild(kind);
      row.addEventListener('mousedown', (e) => { e.preventDefault(); acIndex = i; acceptAC(); });
      dropdown.appendChild(row);
    });
  }

  function positionDropdown() {
    const { top, left } = caretCoords();
    dropdown.style.top = (top + lineHeightPx() + 2) + 'px';
    const maxLeft = Math.max(0, editorWrap.clientWidth - 240);
    dropdown.style.left = Math.min(left, maxLeft) + 'px';
  }

  function showAC() { acOpen = true; dropdown.classList.remove('hidden'); renderDropdown(); positionDropdown(); }
  function hideAC() { acOpen = false; dropdown.classList.add('hidden'); }

  // 補完リクエストを組み立てる（メンバー → キーワード/スニペットの順で判定）
  function buildRequest() {
    const value = textarea.value;
    const pos = textarea.selectionStart;
    if (pos !== textarea.selectionEnd) return null;

    const mem = acMemberContext(value, pos);
    if (mem) {
      const items = memberCandidates(inferType(value, mem.base), mem.partial);
      if (!items.length) return null;
      return { items, word: { start: mem.partialStart, end: pos, text: mem.partial } };
    }
    const w = acCurrentWord(value, pos);
    if (!w) return null;
    const items = wordCandidates(w.word);
    if (!items.length) return null;
    return { items, word: { start: w.start, end: w.end, text: w.word } };
  }

  function updateAC(mayOpen) {
    if (acSuppress) return;
    const req = buildRequest();
    if (!req) { hideAC(); return; }
    if (!mayOpen && !acOpen) return;   // カーソル移動時は開いている時だけ追従
    acWord = req.word; acItems = req.items;
    if (!acOpen) acIndex = 0;
    acIndex = Math.min(acIndex, acItems.length - 1);
    showAC();
  }

  function moveAC(delta) {
    acIndex = (acIndex + delta + acItems.length) % acItems.length;
    renderDropdown();
    const active = dropdown.querySelector('.ac-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function acceptAC() {
    if (!acOpen || !acItems[acIndex]) return;
    const item = acItems[acIndex];
    const w = acWord;
    let caret;
    acSuppress = true;
    if (item.kind === 'snippet' && item.code) {
      // スニペットは複数行。現在行のインデントを2行目以降へ付与する
      const value = textarea.value;
      const lineStart = value.lastIndexOf('\n', w.start - 1) + 1;
      const indent = (value.slice(lineStart, w.start).match(/^\s*/) || [''])[0];
      const code = item.code.split('\n').map((ln, i) => (i === 0 ? ln : indent + ln)).join('\n');
      replaceRange(w.start, w.end, code);
      caret = w.start + code.length;
    } else {
      replaceRange(w.start, w.end, item.label);
      caret = w.start + item.label.length;
    }
    textarea.setSelectionRange(caret, caret);
    acSuppress = false;
    hideAC();
    blockMarks = null; blockMarkKey = '';
    updateHighlight();
    updateLineNumbers();
    syncScroll();
    updateBlockMatch();
    updateExplanation();
    updateSig();
    saveCode();
    scheduleSyntaxCheck();
  }

  // ---- 引数ヒント ----
  function updateSig() {
    const sig = sigContext(textarea.value, textarea.selectionStart);
    if (!sig) { sigHint.classList.add('hidden'); return; }
    sigHint.innerHTML = '';
    const nm = document.createElement('span');
    nm.className = 'sig-name';
    nm.textContent = sig.name + '(';
    sigHint.appendChild(nm);
    sig.params.forEach((p, i) => {
      if (i > 0) sigHint.appendChild(document.createTextNode(', '));
      const sp = document.createElement('span');
      sp.className = 'sig-param' + (i === sig.argIndex ? ' active' : '');
      sp.textContent = p;
      sigHint.appendChild(sp);
    });
    sigHint.appendChild(document.createTextNode(')'));
    sigHint.classList.remove('hidden');
    const { top, left } = caretCoords();
    // 候補一覧が下に出るのでヒントは行の上に置く
    const hb = sigHint.offsetHeight || 22;
    let t = top - hb - 2;
    if (t < 0) t = top + lineHeightPx() + 2;
    sigHint.style.top = t + 'px';
    const maxLeft = Math.max(0, editorWrap.clientWidth - sigHint.offsetWidth - 8);
    sigHint.style.left = Math.min(left, maxLeft) + 'px';
  }

  // キー操作（キャプチャ段階で他のkeydownより先に処理する）
  textarea.addEventListener('keydown', (e) => {
    if (!acOpen || e.isComposing) return;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); e.stopImmediatePropagation(); moveAC(1); break;
      case 'ArrowUp':   e.preventDefault(); e.stopImmediatePropagation(); moveAC(-1); break;
      case 'Enter':
      case 'Tab':       e.preventDefault(); e.stopImmediatePropagation(); acceptAC(); break;
      case 'Escape':    e.preventDefault(); e.stopImmediatePropagation(); hideAC(); break;
      default: break;
    }
  }, true);

  // プログラム的な編集後に最新カーソル位置で再評価するフックを公開
  acReeval = () => { updateAC(false); updateSig(); };

  // 入力で候補・ヒント更新、カーソル移動で追従、フォーカスアウトで閉じる
  textarea.addEventListener('input', () => { updateAC(true); updateSig(); });
  textarea.addEventListener('keyup', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { updateAC(false); updateSig(); }
  });
  textarea.addEventListener('click', updateSig);
  textarea.addEventListener('blur', () => setTimeout(() => { hideAC(); sigHint.classList.add('hidden'); }, 120));
  textarea.addEventListener('scroll', () => { if (acOpen) positionDropdown(); if (!sigHint.classList.contains('hidden')) updateSig(); });

  // テストや外部から状態を確認できるよう最小限を公開
  window.__ac = {
    get open() { return acOpen; },
    get items() { return acItems; },
    get index() { return acIndex; },
    get sig() { return sigHint.classList.contains('hidden') ? null : sigHint.textContent; },
  };
})();
