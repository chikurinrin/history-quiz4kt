// ================================================================
//  JS Syntax Visualizer ― 構造可視化ツール
//  カーソル行の構文を左パネルで解説し、スニペットを挿入できるエディタ
// ================================================================

// ----------------------------------------------------------------
//  トークナイザー（シンタックスハイライト）
// ----------------------------------------------------------------
const KEYWORDS = new Set([
  'var','let','const','function','return','if','else','for','while','do',
  'switch','case','break','continue','new','delete','typeof','instanceof',
  'void','throw','try','catch','finally','class','extends','super',
  'import','export','default','in','of','static','get','set','from','debugger'
]);
const KEYWORDS2 = new Set(['async','await','yield']);
const ATOMS = new Set(['true','false','null','undefined','NaN','Infinity']);

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// コードをハイライト済みHTMLへ変換する
// markSet: 強調したい文字の絶対位置（括弧の対応ハイライト用）、base: 再帰時のオフセット
function highlightJs(code, markSet = null, base = 0) {
  let html = '';
  let i = 0;
  const n = code.length;
  let last = null; // 直前の意味のあるトークン（正規表現/除算の判定に使う）

  const emit = (type, value) => {
    const esc = escapeHtml(value);
    html += type === 'plain' ? esc : `<span class="tok-${type}">${esc}</span>`;
    if (value.trim() !== '') last = { type, value };
  };

  while (i < n) {
    const c = code[i];

    // 行コメント
    if (c === '/' && code[i+1] === '/') {
      let j = i + 2;
      while (j < n && code[j] !== '\n') j++;
      emit('comment', code.slice(i, j));
      i = j; continue;
    }

    // ブロックコメント
    if (c === '/' && code[i+1] === '*') {
      let j = i + 2;
      while (j < n - 1 && !(code[j] === '*' && code[j+1] === '/')) j++;
      j = Math.min(j + 2, n);
      emit('comment', code.slice(i, j));
      i = j; continue;
    }

    // テンプレートリテラル（${} の中は再帰的にハイライト）
    if (c === '`') {
      html += '<span class="tok-string">`</span>';
      i++;
      let buf = '';
      const flush = () => {
        if (buf) { html += `<span class="tok-string">${escapeHtml(buf)}</span>`; buf = ''; }
      };
      while (i < n && code[i] !== '`') {
        if (code[i] === '\\') { buf += code.slice(i, i + 2); i += 2; continue; }
        if (code[i] === '$' && code[i+1] === '{') {
          flush();
          let depth = 1, j = i + 2;
          while (j < n && depth > 0) {
            if (code[j] === '{') depth++;
            else if (code[j] === '}') depth--;
            if (depth > 0) j++;
          }
          html += '<span class="tok-interp">${</span>';
          html += highlightJs(code.slice(i + 2, j), markSet, base + i + 2);
          html += '<span class="tok-interp">}</span>';
          i = (j < n) ? j + 1 : n;
          continue;
        }
        buf += code[i]; i++;
      }
      flush();
      if (i < n) { html += '<span class="tok-string">`</span>'; i++; }
      last = { type: 'string', value: '`' };
      continue;
    }

    // 文字列（' / "）
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === c)    { j++; break; }
        if (code[j] === '\n') break;
        j++;
      }
      emit('string', code.slice(i, j));
      i = j; continue;
    }

    // 正規表現リテラル（直前トークンから除算と区別する）
    if (c === '/') {
      const canRegex = !last
        || last.type === 'keyword' || last.type === 'keyword2'
        || (last.type === 'plain' && !/[)\]]/.test(last.value));
      if (canRegex) {
        let j = i + 1, inClass = false, closed = false;
        while (j < n && code[j] !== '\n') {
          if (code[j] === '\\') { j += 2; continue; }
          if (code[j] === '[') inClass = true;
          else if (code[j] === ']') inClass = false;
          else if (code[j] === '/' && !inClass) { closed = true; break; }
          j++;
        }
        if (closed) {
          j++;
          while (j < n && /[dgimsuy]/.test(code[j])) j++;
          emit('regex', code.slice(i, j));
          i = j; continue;
        }
      }
    }

    // 数値
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(code[i+1] ?? ''))) {
      let j = i;
      if (code[j] === '0' && /[xXbBoO]/.test(code[j+1] ?? '')) {
        j += 2;
        while (j < n && /[0-9a-fA-F_]/.test(code[j])) j++;
      } else {
        while (j < n && /[0-9_]/.test(code[j])) j++;
        if (j < n && code[j] === '.') { j++; while (j < n && /[0-9_]/.test(code[j])) j++; }
        if (j < n && /[eE]/.test(code[j])) {
          j++;
          if (j < n && /[+-]/.test(code[j])) j++;
          while (j < n && /[0-9]/.test(code[j])) j++;
        }
        if (j < n && code[j] === 'n') j++;
      }
      emit('number', code.slice(i, j));
      i = j; continue;
    }

    // 識別子・キーワード
    if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < n && /[\w$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      let k = j;
      while (k < n && (code[k] === ' ' || code[k] === '\t')) k++;
      const isCall = code[k] === '(';
      const afterDot = last && last.type === 'plain' && last.value === '.';

      let type;
      if (word === 'this')            type = 'this';
      else if (KEYWORDS2.has(word))   type = 'keyword2';
      else if (KEYWORDS.has(word))    type = 'keyword';
      else if (ATOMS.has(word))       type = 'atom';
      else if (afterDot)              type = isCall ? 'function' : 'property';
      else if (isCall)                type = 'function';
      else if (/^[A-Z]/.test(word))   type = 'classname';
      else                            type = 'identifier';

      emit(type, word);
      i = j; continue;
    }

    // その他（演算子・記号・空白）
    if (markSet && markSet.has(base + i)) {
      html += `<span class="bracket-match">${escapeHtml(c)}</span>`;
      if (c.trim() !== '') last = { type: 'plain', value: c };
    } else {
      emit('plain', c);
    }
    i++;
  }
  return html;
}

// ----------------------------------------------------------------
//  括弧スキャナー（対応ペアの検出と不一致チェック）
//  文字列・コメント・テンプレート・正規表現の中は読み飛ばす
// ----------------------------------------------------------------
function scanBrackets(code) {
  const stack = [];
  const pairs = new Map(); // 開き位置 <-> 閉じ位置（双方向）
  let error = null;
  let line = 1;
  let lastSig = null; // 直前の意味のある文字（正規表現/除算の判定用）
  let i = 0;
  const n = code.length;
  const MATCH = { ')': '(', ']': '[', '}': '{' };

  while (i < n) {
    const c = code[i];

    if (c === '\n') { line++; i++; continue; }

    if (c === '/' && code[i+1] === '/') {
      while (i < n && code[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && code[i+1] === '*') {
      i += 2;
      while (i < n - 1 && !(code[i] === '*' && code[i+1] === '/')) {
        if (code[i] === '\n') line++;
        i++;
      }
      i = Math.min(i + 2, n);
      continue;
    }
    if (c === '"' || c === "'") {
      i++;
      while (i < n && code[i] !== c && code[i] !== '\n') {
        if (code[i] === '\\') i++;
        i++;
      }
      if (i < n && code[i] === c) i++; // 終端クォートのみ消費（改行は行数計上のため残す）
      lastSig = c; continue;
    }
    if (c === '`') {
      i++;
      while (i < n && code[i] !== '`') {
        if (code[i] === '\\') i++;
        else if (code[i] === '\n') line++;
        i++;
      }
      i++; lastSig = c; continue;
    }
    // 正規表現リテラル（直前が値でなければ）
    if (c === '/' && (lastSig === null || '=([{,;:!&|?+-*%<>~^'.includes(lastSig))) {
      let j = i + 1, inClass = false, closed = false;
      while (j < n && code[j] !== '\n') {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === '[') inClass = true;
        else if (code[j] === ']') inClass = false;
        else if (code[j] === '/' && !inClass) { closed = true; break; }
        j++;
      }
      if (closed) { i = j + 1; lastSig = '/'; continue; }
    }

    if (c === '(' || c === '[' || c === '{') {
      stack.push({ c, i, line });
    } else if (c === ')' || c === ']' || c === '}') {
      const top = stack.pop();
      if (!top || top.c !== MATCH[c]) {
        if (!error) error = { line, message: `${line}行目: '${c}' に対応する開き括弧がありません` };
      } else {
        pairs.set(top.i, i);
        pairs.set(i, top.i);
      }
    }

    if (c !== ' ' && c !== '\t') lastSig = c;
    i++;
  }

  if (!error && stack.length > 0) {
    const top = stack[stack.length - 1];
    error = { line: top.line, message: `${top.line}行目: '${top.c}' が閉じられていません` };
  }
  return { pairs, error };
}

// スキャン結果はコードが変わるまでキャッシュする
let scanCache = { code: null, result: null };
function getScan() {
  if (scanCache.code !== textarea.value) {
    scanCache = { code: textarea.value, result: scanBrackets(textarea.value) };
  }
  return scanCache.result;
}

// ----------------------------------------------------------------
//  行解説ルール（カーソル行を上から順にマッチング）
// ----------------------------------------------------------------
const LINE_RULES = [
  { re: /^\s*\/\//,                        cat: 'コメント',
    desc: 'コメントです（実行には影響しません）。コードの意図やメモを書き残すために使います。' },
  { re: /^\s*\/\*|\*\/\s*$|^\s*\*/,        cat: 'ブロックコメント',
    desc: '複数行コメントです（実行には影響しません）。/* から */ までがコメントになります。' },
  { re: /\basync\b[^=]*=>/,                cat: '非同期アロー関数',
    desc: 'async 付きのアロー関数です。常に Promise を返し、関数の中で await を使って非同期処理の完了を待てます。' },
  { re: /^\s*await\b|=\s*await\b/,         cat: 'await 式',
    desc: 'Promise の解決を待ってから次の行へ進みます。async 関数の中でのみ使えます。' },
  { re: /\bclass\s+\w+\s+extends\b/,       cat: 'クラス継承',
    desc: 'extends で親クラスを継承したクラス定義です。親クラスのメソッド・プロパティを引き継ぎ、同名メソッドを定義すると上書き（オーバーライド）されます。' },
  { re: /\bclass\s+\w+/,                   cat: 'クラス定義',
    desc: 'クラスの定義です。constructor() で初期化処理を書き、new クラス名() でインスタンスを生成します。' },
  { re: /\bconstructor\s*\(/,              cat: 'コンストラクタ',
    desc: 'new でインスタンスを生成したときに自動的に呼ばれる初期化メソッドです。受け取った引数を this のプロパティに保存するのが定番です。' },
  { re: /\bsuper\s*\(/,                    cat: 'super 呼び出し',
    desc: '親クラスのコンストラクタを呼び出します。extends したクラスの constructor 内では必須です。' },
  { re: /\bthis\.\w+\s*=/,                 cat: 'this プロパティへの代入',
    desc: 'インスタンス自身（this）のプロパティに値を保存しています。ここで保存した値は同じクラスの他のメソッドから this.名前 で参照できます。' },
  { re: /\bthis\./,                        cat: 'this プロパティの参照',
    desc: 'this はそのインスタンス自身を指します。this.名前 でコンストラクタなどで保存したプロパティを参照できます。' },
  { re: /console\.(log|error|warn|info|table)/, cat: 'コンソール出力',
    desc: '開発者ツールのコンソールに値を出力します。デバッグの基本で、console.error はエラー、console.table は表形式で出力します。' },
  { re: /\.map\s*\(/,                      cat: '配列メソッド map()',
    desc: '配列の各要素を変換した「新しい配列」を返します。元の配列は変更しません。n => n * 2 のように変換ルールを渡します。' },
  { re: /\.(filter|find|some|every)\s*\(/, cat: '配列メソッド（絞り込み/検索）',
    desc: 'filter は条件を満たす要素の新しい配列、find は最初の1件、some / every は真偽値を返します。いずれも元の配列は変更しません。' },
  { re: /\.(reduce|forEach)\s*\(/,         cat: '配列メソッド（集約/反復）',
    desc: 'reduce は配列を1つの値（合計など）に集約し、forEach は各要素に処理を実行します（戻り値なし）。' },
  { re: /\.test\s*\(/,                     cat: '正規表現 test()',
    desc: '正規表現が文字列にマッチするかを true / false で返します。入力チェック（バリデーション）でよく使います。' },
  { re: /=\s*\/(?:\\.|\[[^\]]*\]|[^/\n])+\/[dgimsuy]*/, cat: '正規表現リテラル',
    desc: '/パターン/フラグ の形で正規表現を定義します。^ は先頭、\\d は数字、{3} は3回の繰り返し、$ は末尾を表します。' },
  { re: /`[^`]*\$\{/,                      cat: 'テンプレートリテラル',
    desc: 'バッククォートで囲んだ文字列です。${ } の中に変数や式を埋め込めて、改行もそのまま書けます。' },
  { re: /^\s*return\b/,                    cat: 'return 文',
    desc: '関数から値を返して処理を終了します。return より後ろの行は実行されません。' },
  { re: /^\s*(const|let)\s*\{/,            cat: '分割代入（オブジェクト）',
    desc: 'オブジェクトのプロパティを同名の変数へ一度に取り出します。const { a, b } = obj; の形です。' },
  { re: /^\s*(const|let)\s*\[/,            cat: '分割代入（配列）',
    desc: '配列の要素を順番に変数へ取り出します。const [x, y] = arr; の形です。' },
  { re: /=\s*\[.*\]/,                      cat: '配列リテラル',
    desc: '[ ] で配列を定義しています。要素は 0 から始まるインデックスでアクセスします。' },
  { re: /=>/,                              cat: 'アロー関数',
    desc: '関数を短く書ける構文です。this を持たず、外側のスコープの this をそのまま引き継ぎます。' },
  { re: /^\s*const\b/,                     cat: 'const 宣言',
    desc: '再代入できない定数を宣言します。オブジェクトや配列の場合、中身の変更は可能ですが変数自体への再代入はできません。' },
  { re: /^\s*let\b/,                       cat: 'let 宣言',
    desc: '再代入できる変数を宣言します。ブロックスコープ（{ } の内側）でのみ有効です。' },
  { re: /^\s*var\b/,                       cat: 'var 宣言（レガシー）',
    desc: '関数スコープの変数宣言です。現在は const / let の使用が推奨されます。' },
  { re: /^\s*if\s*\(/,                     cat: 'if 文',
    desc: '条件が true のときだけブロック内を実行します。else / else if で分岐を追加できます。' },
  { re: /^\s*\}?\s*else\b/,                cat: 'else 節',
    desc: 'if の条件が false だったときに実行されるブロックです。else if でさらに条件を連鎖できます。' },
  { re: /^\s*for\s*\([^)]*\bof\b/,         cat: 'for...of ループ',
    desc: '配列などの「値」を順に取り出して繰り返します。インデックスが不要なときに便利です。' },
  { re: /^\s*for\s*\([^)]*\bin\b/,         cat: 'for...in ループ',
    desc: 'オブジェクトの「キー」を順に取り出して繰り返します。配列には for...of を使うのが安全です。' },
  { re: /^\s*for\s*\(/,                    cat: 'for ループ（基本）',
    desc: '初期化式・条件式・更新式で回数を制御する基本のループです。' },
  { re: /^\s*while\s*\(/,                  cat: 'while ループ',
    desc: '条件が true の間、処理を繰り返します。条件が変化しないと無限ループになるので注意します。' },
  { re: /^\s*switch\s*\(/,                 cat: 'switch 文',
    desc: '値に応じて case で分岐します。各 case の最後に break を書かないと次の case に処理が流れます（fallthrough）。' },
  { re: /^\s*(case\b|default\s*:)/,        cat: 'case / default',
    desc: 'switch の分岐先です。break を忘れると次の case まで実行されるので注意します。' },
  { re: /^\s*break\b/,                     cat: 'break 文',
    desc: 'ループや switch を即座に抜けます。' },
  { re: /addEventListener/,                cat: 'イベントリスナー登録',
    desc: '要素にイベント（click / input / change など）が起きたときの処理を登録します。' },
  { re: /\bfetch\s*\(/,                    cat: 'fetch（HTTP通信）',
    desc: 'サーバーへHTTPリクエストを送ります。Promise を返すため await と組み合わせて使うのが一般的です。' },
  { re: /^\s*(async\s+)?function\b/,       cat: 'function 宣言',
    desc: '関数を定義します。function 宣言は巻き上げ（hoisting）されるため、定義前の行から呼び出せます。' },
  { re: /^\s*try\b/,                       cat: 'try / catch',
    desc: 'エラーが起こる可能性のある処理を try で囲み、発生したエラーを catch で受け取ります。' },
  { re: /^\s*catch\b|\}\s*catch\b/,        cat: 'catch 節',
    desc: 'try ブロックで発生したエラーを受け取って処理します。' },
  { re: /^\s*[\w$]+\s*\([^)]*\)\s*\{\s*$/, cat: 'メソッド定義',
    desc: 'クラス内のメソッド定義です。インスタンスから インスタンス.メソッド名() の形で呼び出します。' },
  { re: /^\s*[{}()\[\];,]*\s*$/,           cat: 'ブロック / 区切り',
    desc: '{ } はコードのまとまり（ブロック）を表します。対応する開き括弧・閉じ括弧を意識して読みましょう。' },
];

// 三項演算子は上の配列内で表現しづらいので個別に差し込む
const TERNARY_RULE = {
  re: /\?[^.?][^:]*:/, cat: '三項演算子（?:）',
  desc: '条件 ? 真のときの値 : 偽のときの値。短い if / else の代わりに、値を選ぶ場面で使います。'
};

function findLineRule(line) {
  const t = line.trim();
  if (!t) return null;
  if (TERNARY_RULE.re.test(t) && !t.includes('?.') && !t.includes('??')) return TERNARY_RULE;
  for (const rule of LINE_RULES) {
    if (rule.re && rule.desc && rule.re.test(line)) return rule;
  }
  return { cat: '式・文', desc: '一般的な式（文）です。行を選ぶと構文の説明がここに表示されます。' };
}

// ----------------------------------------------------------------
//  選択範囲の解説辞書（キーワード / パターン / メソッド）
// ----------------------------------------------------------------
const EXP_KW = {
  'const':      { title: 'const',       body: '再代入できない定数を宣言します。ブロックスコープ（{}の内側）でのみ有効です。オブジェクトや配列を代入した場合は中身の変更は可能ですが、変数自体への再代入はできません。', syntax: 'const 変数名 = 値;' },
  'let':        { title: 'let',         body: '再代入できる変数を宣言します。ブロックスコープを持ちます。同じスコープ内での再宣言はエラーになります。', syntax: 'let 変数名 = 値;\n変数名 = 新しい値;' },
  'var':        { title: 'var',         body: '関数スコープを持つ変数を宣言します（レガシー）。現代のJavaScriptでは const や let の使用が推奨されます。巻き上げ（hoisting）が発生します。', syntax: 'var 変数名 = 値;' },
  'function':   { title: 'function',    body: '関数を定義します。function宣言はファイルの先頭に巻き上げられるため、定義前に呼び出しても動作します。', syntax: 'function 関数名(引数) {\n  return 戻り値;\n}' },
  'return':     { title: 'return',      body: '関数から値を返して処理を終了します。returnの後の文は実行されません。値を省略すると undefined を返します。', syntax: 'function fn() {\n  return 値;\n}' },
  'if':         { title: 'if / else',   body: '条件が true のとき if ブロックを、false のとき else ブロックを実行します。else if で複数の条件を連鎖できます。', syntax: 'if (条件) {\n  // 真のとき\n} else {\n  // 偽のとき\n}' },
  'else':       { title: 'if / else',   body: '条件が true のとき if ブロックを、false のとき else ブロックを実行します。else if で複数の条件を連鎖できます。', syntax: 'if (条件) {\n  // 真のとき\n} else {\n  // 偽のとき\n}' },
  'for':        { title: 'for ループ',  body: '指定した回数だけ処理を繰り返します。初期化式・条件式・更新式の3つで繰り返しを制御します。', syntax: 'for (let i = 0; i < length; i++) {\n  // 処理\n}' },
  'while':      { title: 'while ループ', body: '条件が true の間、処理を繰り返します。条件が最初から false の場合は一度も実行されません。', syntax: 'while (条件) {\n  // 処理\n}' },
  'do':         { title: 'do...while',  body: '必ず1回実行してから条件を確認するループです。条件が false でも最低1回は実行されます。', syntax: 'do {\n  // 処理\n} while (条件);' },
  'switch':     { title: 'switch / case', body: '値に応じて処理を分岐します。各 case の末尾に break を書かないと次の case へ処理が流れます（フォールスルー）。', syntax: "switch (値) {\n  case 'a':\n    // 処理\n    break;\n  default:\n    break;\n}" },
  'case':       { title: 'case',        body: 'switch 文の分岐条件を指定します。break を付けないと次の case へ処理が流れ続けます（フォールスルー）。', syntax: "case '値':\n  // 処理\n  break;" },
  'break':      { title: 'break',       body: 'ループや switch 文を即座に終了します。ラベルを指定すると外側のループも抜けられます。', syntax: 'for (...) {\n  if (条件) break;\n}' },
  'continue':   { title: 'continue',    body: '現在のループの残りの処理をスキップして次の繰り返しへ進みます。', syntax: 'for (...) {\n  if (スキップ条件) continue;\n  // 処理\n}' },
  'class':      { title: 'class',       body: 'オブジェクト指向プログラミングのクラスを定義します。constructor() でインスタンス生成時の初期化を行います。extends で他クラスを継承できます。', syntax: 'class クラス名 {\n  constructor(引数) {\n    this.プロパティ = 引数;\n  }\n  メソッド() { ... }\n}' },
  'extends':    { title: 'extends',     body: '他のクラスを継承します。子クラスは親クラスのメソッドとプロパティを引き継ぎます。constructor 内で super() を呼ぶ必要があります。', syntax: 'class 子クラス extends 親クラス {\n  constructor() {\n    super(); // 必須\n  }\n}' },
  'new':        { title: 'new',         body: 'クラスやコンストラクタ関数からオブジェクトのインスタンスを生成します。new が付くと constructor が呼ばれます。', syntax: 'const obj = new クラス名(引数);' },
  'this':       { title: 'this',        body: '現在の実行コンテキストを参照する特別な変数です。クラス内ではそのインスタンス自身を指します。アロー関数は this を持たず外側の this を引き継ぎます。', syntax: 'class Foo {\n  method() {\n    console.log(this); // Foo のインスタンス\n  }\n}' },
  'super':      { title: 'super',       body: '親クラスを参照します。constructor 内では super() で親クラスのコンストラクタを呼び出し、メソッド内では super.メソッド() で親クラスのメソッドを呼べます。', syntax: 'class Child extends Parent {\n  constructor() {\n    super(引数); // 必須\n  }\n}' },
  'try':        { title: 'try / catch / finally', body: 'エラーが発生する可能性のある処理を囲み、エラーを安全に処理します。catch でエラーを受け取り、finally は成功・失敗にかかわらず実行されます。', syntax: 'try {\n  // 試みる処理\n} catch (error) {\n  console.error(error);\n} finally {\n  // 常に実行\n}' },
  'catch':      { title: 'catch',       body: 'try ブロックで発生したエラーを受け取って処理します。引数の error にはエラーオブジェクトが入ります。', syntax: 'try {\n  // ...\n} catch (error) {\n  console.error(error.message);\n}' },
  'finally':    { title: 'finally',     body: 'try/catch の後に、エラーの有無にかかわらず必ず実行されるブロックです。クリーンアップ処理などに使います。', syntax: 'try {\n  // ...\n} finally {\n  // 必ず実行される\n}' },
  'throw':      { title: 'throw',       body: '意図的にエラーをスローします。throw した値は catch ブロックで受け取れます。', syntax: "throw new Error('エラーメッセージ');" },
  'async':      { title: 'async 関数',  body: '非同期処理を扱う関数を定義します。async 関数は常に Promise を返します。関数内で await を使って非同期処理の完了を待てます。', syntax: 'async function fn() {\n  const result = await 非同期処理();\n  return result;\n}' },
  'await':      { title: 'await',       body: 'Promise の解決（または拒否）を待ちます。async 関数の中でのみ使用できます。await を使うとコードを同期的に書けます。', syntax: 'const data = await fetch(url).then(r => r.json());' },
  'import':     { title: 'import',      body: '別のモジュールから変数・関数・クラスを読み込みます。ES Modules の構文で、type="module" を付けた script タグで使用できます。', syntax: "import { 関数名 } from './module.js';" },
  'export':     { title: 'export',      body: '変数・関数・クラスを他のモジュールから使えるように公開します。export default は1ファイル1つのデフォルト公開です。', syntax: 'export const fn = () => {};\nexport default class MyClass {}' },
  'typeof':     { title: 'typeof',      body: '値の型を文字列で返す演算子です。"string" "number" "boolean" "object" "undefined" "function" などを返します。', syntax: "typeof 42        // 'number'\ntypeof 'hello'   // 'string'\ntypeof null      // 'object' (注意!)" },
  'instanceof': { title: 'instanceof',  body: 'オブジェクトが特定のクラス（またはコンストラクタ）のインスタンスかどうかを確認します。', syntax: 'dog instanceof Dog    // true\ndog instanceof Animal // true (継承も判定)' },
  'in':         { title: 'in 演算子',   body: 'プロパティがオブジェクトに存在するか確認します。for...in ではオブジェクトのキーを順に取り出します。', syntax: "'name' in obj   // true/false\nfor (const key in obj) { ... }" },
  'of':         { title: 'for...of',    body: '配列・文字列・Map・Set などのイテラブルを順に処理します。インデックスではなく値を直接取り出せます。', syntax: 'for (const item of array) {\n  console.log(item);\n}' },
  'yield':      { title: 'yield',       body: 'ジェネレーター関数（function*）で値を一時的に返し、処理を一時停止します。next() を呼ぶと続きから再開します。', syntax: 'function* gen() {\n  yield 1;\n  yield 2;\n}' },
  'delete':     { title: 'delete',      body: 'オブジェクトのプロパティを削除します。削除に成功すると true を返します。', syntax: 'delete obj.プロパティ;' },
  'static':     { title: 'static',      body: 'インスタンスではなくクラス自体に属するメソッドやプロパティを定義します。インスタンスからは呼べません。', syntax: 'class MathUtil {\n  static add(a, b) { return a + b; }\n}\nMathUtil.add(1, 2); // OK' },
  'null':       { title: 'null',        body: '意図的な「値なし」を表します。typeof null は "object" を返します（仕様上のバグ）。undefined とは別物で、null は明示的にセットされた空の値です。', syntax: 'let user = null; // まだデータがない\nif (user === null) { ... }' },
  'undefined':  { title: 'undefined',   body: '値が定義されていないことを示します。変数を宣言しただけで代入しない場合のデフォルト値です。', syntax: 'let x;          // undefined\nfunction f() {} // 戻り値なし → undefined' },
  'true':       { title: '真偽値 (boolean)', body: 'true は「真」を表す論理値です。条件式で使われます。0, "", null, undefined, NaN, false は falsy（偽と見なされる値）です。', syntax: 'const isActive = true;\nif (isActive) { ... }' },
  'false':      { title: '真偽値 (boolean)', body: 'false は「偽」を表す論理値です。0, "", null, undefined, NaN, false は falsy（偽と見なされる値）です。', syntax: 'const isDeleted = false;\nif (!isDeleted) { ... }' },
  'default':    { title: 'default',     body: 'switch 文でどの case にも一致しなかった場合に実行されるブロックです。また export default はモジュールのデフォルトエクスポートです。', syntax: "switch (val) {\n  case 'a': break;\n  default: // それ以外\n}" },
  'get':        { title: 'getter (get)', body: 'プロパティへのアクセス時に自動的に呼ばれるメソッドを定義します。値を計算して返す「計算プロパティ」に使います。', syntax: 'class Circle {\n  get area() {\n    return Math.PI * this.r ** 2;\n  }\n}' },
  'set':        { title: 'setter (set)', body: 'プロパティへの代入時に自動的に呼ばれるメソッドを定義します。バリデーションなどの処理を挟めます。', syntax: 'class Person {\n  set name(v) {\n    this._name = v.trim();\n  }\n}' },
};

const EXP_PATTERNS = [
  { re: /=>/,               title: 'アロー関数 (=>)', body: '関数式を短く書ける構文です。this を持たず、外側のスコープの this を引き継ぎます（レキシカルな this）。', syntax: '// 引数が1つの場合カッコ省略可\nconst fn = x => x * 2;\n\n// 複数行\nconst fn = (a, b) => {\n  return a + b;\n};' },
  { re: /`[^`]*\$\{/,       title: 'テンプレートリテラル', body: 'バッククォートで囲んだ文字列で、${} の中に式を埋め込めます。改行もそのまま書けます。', syntax: 'const msg = `こんにちは、${name}さん！`;' },
  { re: /\basync\b[\s\S]*\bawait\b/, title: 'async / await', body: 'Promiseを使った非同期処理を、同期的なコードのように書ける構文です。await は async 関数の中でのみ使えます。', syntax: 'async function getData() {\n  const res  = await fetch(url);\n  const data = await res.json();\n  return data;\n}' },
  { re: /for\s*\([^)]*\bof\b/, title: 'for...of ループ', body: '配列・文字列・Map・Set などのイテラブルの各要素を順に処理します。インデックスが不要なときに使います。', syntax: 'for (const item of array) {\n  console.log(item);\n}' },
  { re: /for\s*\([^)]*\bin\b/, title: 'for...in ループ', body: 'オブジェクトの列挙可能なキーを順に取り出します。配列には使わないほうが良いです。', syntax: 'for (const key in obj) {\n  console.log(key, obj[key]);\n}' },
  { re: /\.\.\./,           title: 'スプレッド / レスト構文 (...)', body: '配列やオブジェクトを展開（スプレッド）したり、複数の引数をまとめて受け取る（レスト）構文です。', syntax: '// スプレッド\nconst merged = [...arr1, ...arr2];\nconst obj2 = { ...obj1, extra: 1 };\n\n// レスト\nfunction fn(first, ...rest) {}' },
  { re: /\?\./,             title: 'オプショナルチェーン (?.)', body: 'プロパティにアクセスする際、途中で null や undefined が出てもエラーにならず undefined を返します。', syntax: 'const city = user?.address?.city;\nconst len  = arr?.length;' },
  { re: /\?\?/,             title: 'Nullish 合体演算子 (??)', body: '左辺が null または undefined の場合だけ右辺を返します。0 や "" はそのまま返す点が || と異なります。', syntax: "const name = input ?? 'デフォルト';" },
  { re: /(const|let)\s*\{[^}]+\}\s*=/, title: '分割代入 (オブジェクト)', body: 'オブジェクトのプロパティを変数に一度に取り出します。別名をつけたりデフォルト値を指定したりできます。', syntax: 'const { name, age = 0 } = person;\nconst { a: x, b: y } = obj; // 別名' },
  { re: /(const|let)\s*\[[^\]]+\]\s*=/, title: '分割代入 (配列)', body: '配列の各要素を変数に一度に取り出します。順番でマッピングされます。', syntax: 'const [first, second] = array;\nconst [, , third] = array; // 3番目のみ' },
  { re: /new\s+Promise/,    title: 'Promise', body: '非同期処理の最終的な成功/失敗を表すオブジェクトです。resolve() で成功、reject() で失敗を通知します。', syntax: 'const p = new Promise((resolve, reject) => {\n  setTimeout(() => resolve("完了"), 1000);\n});\np.then(v => console.log(v));' },
  { re: /Promise\.all/,     title: 'Promise.all()', body: '複数の Promise を並列実行し、すべて完了したら全結果の配列を返します。1つでも失敗すると全体が失敗します。', syntax: 'const [a, b] = await Promise.all([\n  fetch(url1),\n  fetch(url2),\n]);' },
  { re: /\/(?:\\.|\[[^\]]*\]|[^/\n])+\/[dgimsuy]*/, title: '正規表現リテラル', body: '/パターン/フラグ の形で正規表現を定義します。^ は先頭、\\d は数字、{n} は n 回の繰り返し、$ は末尾を表します。', syntax: 'const regex = /^\\d{3}-\\d{4}$/;\nregex.test("123-4567"); // true' },
];

const EXP_METHODS = {
  'forEach':    { title: 'Array.forEach()', body: '配列の各要素に対して処理を実行します。戻り値はありません（undefined）。元の配列は変更しません。', syntax: 'array.forEach((item, index) => {\n  console.log(index, item);\n});' },
  'map':        { title: 'Array.map()', body: '各要素を変換した新しい配列を返します。元の配列は変更しません。変換した結果を別配列として欲しいときに使います。', syntax: 'const doubled = numbers.map(n => n * 2);\n// [1,2,3] → [2,4,6]' },
  'filter':     { title: 'Array.filter()', body: '条件を満たす要素だけを集めた新しい配列を返します。元の配列は変更しません。', syntax: 'const adults = users.filter(u => u.age >= 18);' },
  'reduce':     { title: 'Array.reduce()', body: '配列を1つの値に集約します。合計・最大値・グルーピングなど幅広く使えます。第2引数は初期値です。', syntax: 'const sum = [1,2,3].reduce((acc, n) => acc + n, 0);\n// 6' },
  'find':       { title: 'Array.find()', body: '条件に合う最初の要素を返します。見つからない場合は undefined を返します。', syntax: 'const user = users.find(u => u.id === 1);' },
  'findIndex':  { title: 'Array.findIndex()', body: '条件に合う最初の要素のインデックスを返します。見つからない場合は -1 を返します。', syntax: 'const idx = users.findIndex(u => u.id === 1);' },
  'some':       { title: 'Array.some()', body: '1つでも条件を満たす要素があれば true を返します。', syntax: 'const hasAdmin = users.some(u => u.role === "admin");' },
  'every':      { title: 'Array.every()', body: '全要素が条件を満たすときだけ true を返します。', syntax: 'const allPassed = scores.every(s => s >= 60);' },
  'includes':   { title: 'Array/String.includes()', body: '指定した値が含まれるか boolean で返します。配列・文字列どちらにも使えます。', syntax: "[1,2,3].includes(2)     // true\n'hello'.includes('ell') // true" },
  'indexOf':    { title: 'indexOf()', body: '指定した値が最初に現れるインデックスを返します。見つからない場合は -1 を返します。', syntax: "[1,2,3].indexOf(2) // 1" },
  'push':       { title: 'Array.push()', body: '配列の末尾に要素を追加します。元の配列を変更し、新しい配列の長さを返します。', syntax: 'arr.push(要素);' },
  'pop':        { title: 'Array.pop()', body: '配列の末尾の要素を取り出して返します。元の配列を変更します。', syntax: 'const last = arr.pop();' },
  'shift':      { title: 'Array.shift()', body: '配列の先頭の要素を取り出して返します。元の配列を変更します。', syntax: 'const first = arr.shift();' },
  'unshift':    { title: 'Array.unshift()', body: '配列の先頭に要素を追加します。元の配列を変更します。', syntax: 'arr.unshift(新要素);' },
  'slice':      { title: 'Array.slice()', body: '配列の一部を新しい配列として返します。元の配列は変更しません。負のインデックスで末尾から数えられます。', syntax: 'arr.slice(1, 3)  // index 1〜2 を取得\narr.slice(-2)    // 末尾2件' },
  'splice':     { title: 'Array.splice()', body: '配列の任意の位置で要素を追加・削除・置換します。元の配列を変更します。', syntax: 'arr.splice(index, 削除数);\narr.splice(index, 0, 新要素); // 挿入' },
  'join':       { title: 'Array.join()', body: '配列のすべての要素を指定した区切り文字で結合して文字列を返します。', syntax: "['a','b','c'].join('-') // 'a-b-c'" },
  'sort':       { title: 'Array.sort()', body: '配列を並び替えます。比較関数を省略すると文字列として並び替えます。数値の並び替えには比較関数が必要です。', syntax: 'arr.sort((a, b) => a - b); // 昇順\narr.sort((a, b) => b - a); // 降順' },
  'flat':       { title: 'Array.flat()', body: 'ネストされた配列を指定した深さまで平坦化します。Infinity で全てのネストを展開します。', syntax: '[[1,2],[3,4]].flat() // [1,2,3,4]' },
  'split':      { title: 'String.split()', body: '文字列を指定した区切り文字で分割して配列を返します。正規表現も使えます。', syntax: "'a,b,c'.split(',') // ['a','b','c']" },
  'trim':       { title: 'String.trim()', body: '文字列の前後の空白・改行・タブを除去した新しい文字列を返します。', syntax: "'  hello  '.trim() // 'hello'" },
  'replace':    { title: 'String.replace()', body: '最初にマッチした文字列を置換します。全て置換するには replaceAll() または正規表現の g フラグを使います。', syntax: "'hello'.replace('l', 'r')    // 'herlo'\n'hello'.replaceAll('l', 'r') // 'herro'" },
  'startsWith': { title: 'String.startsWith()', body: '文字列が指定した文字列で始まるか確認します。', syntax: "'hello'.startsWith('he') // true" },
  'endsWith':   { title: 'String.endsWith()', body: '文字列が指定した文字列で終わるか確認します。', syntax: "'hello'.endsWith('lo') // true" },
  'padStart':   { title: 'String.padStart()', body: '文字列が指定した長さになるまで先頭に文字を埋めます。数値のゼロ埋めによく使います。', syntax: "'5'.padStart(3, '0') // '005'" },
  'test':       { title: 'RegExp.test()', body: '正規表現が文字列にマッチするかを true / false で返します。入力チェックの定番です。', syntax: 'const regex = /^\\d{3}-\\d{4}$/;\nregex.test("123-4567"); // true' },
  'querySelector': { title: 'document.querySelector()', body: 'CSSセレクターに一致する最初の要素を返します。見つからない場合は null を返します。', syntax: "const btn = document.querySelector('#myBtn');" },
  'querySelectorAll': { title: 'document.querySelectorAll()', body: 'CSSセレクターに一致する全要素を NodeList で返します。forEach で反復できます。', syntax: "const items = document.querySelectorAll('.item');\nitems.forEach(el => el.classList.add('active'));" },
  'getElementById': { title: 'document.getElementById()', body: 'id 属性が一致する要素を1つ返します。querySelector より高速で、業務画面の項目取得の定番です。', syntax: "const el = document.getElementById('userName');" },
  'addEventListener': { title: 'addEventListener()', body: '要素にイベントリスナーを登録します。同じ要素に複数登録できます。removeEventListener で解除します。', syntax: "el.addEventListener('click', (e) => {\n  console.log(e.target);\n});" },
  'appendChild': { title: 'appendChild()', body: '指定した要素の子要素の末尾に新しいノードを追加します。', syntax: "const li = document.createElement('li');\nlist.appendChild(li);" },
  'createElement': { title: 'document.createElement()', body: '指定したタグ名のHTML要素を新規作成します。appendChild などでDOMに追加して初めて表示されます。', syntax: "const div = document.createElement('div');\ndiv.textContent = 'テキスト';\ndocument.body.appendChild(div);" },
  'classList':  { title: 'classList', body: '要素のクラスを操作するためのオブジェクトです。add/remove/toggle/contains などのメソッドがあります。', syntax: "el.classList.add('active');\nel.classList.toggle('open');" },
  'setTimeout': { title: 'setTimeout()', body: '指定したミリ秒後に一度だけ処理を実行します。clearTimeout(id) でキャンセルできます。', syntax: 'const id = setTimeout(() => {\n  // 1秒後に実行\n}, 1000);' },
  'setInterval': { title: 'setInterval()', body: '指定したミリ秒ごとに処理を繰り返し実行します。clearInterval(id) で停止できます。', syntax: 'const id = setInterval(() => {\n  // 毎秒実行\n}, 1000);\nclearInterval(id); // 停止' },
  'fetch':      { title: 'fetch()', body: 'HTTPリクエストを送るWeb APIです。Promiseを返します。async/awaitと組み合わせて使うのが一般的です。', syntax: 'const res  = await fetch(url);\nconst data = await res.json();' },
  'then':       { title: 'Promise.then()', body: 'Promiseが成功したときの処理を登録します。チェーンできます。catch() でエラーを捕捉します。', syntax: 'fetch(url)\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));' },
  'JSON':       { title: 'JSON', body: 'JSONデータを扱うグローバルオブジェクトです。parse() でJSON文字列→オブジェクト、stringify() でオブジェクト→JSON文字列に変換します。', syntax: 'const obj = JSON.parse(jsonString);\nconst str = JSON.stringify(obj, null, 2);' },
  'Math':       { title: 'Math', body: '数学的な計算を行うグローバルオブジェクトです。', syntax: 'Math.floor(3.7)  // 3 (切り捨て)\nMath.round(3.5)  // 4 (四捨五入)\nMath.random()    // 0〜1の乱数' },
  'console':    { title: 'console', body: 'デバッグ用のコンソール出力オブジェクトです。このツールでは ▶ 実行 で下のパネルに出力されます。', syntax: 'console.log("情報");\nconsole.error("エラー");\nconsole.table([1,2,3]); // 表形式' },
  'parseInt':   { title: 'parseInt()', body: '文字列を整数に変換します。第2引数で基数（10進数は10）を指定します。', syntax: "parseInt('42')  // 42\nparseInt('3.7') // 3" },
  'Object':     { title: 'Object', body: 'オブジェクト操作のユーティリティメソッドを持つグローバルオブジェクトです。', syntax: 'Object.keys(obj)    // キー配列\nObject.values(obj)  // 値配列\nObject.entries(obj) // [key,value]配列' },
  'localStorage': { title: 'localStorage', body: 'ブラウザにデータを永続的に保存します。文字列しか保存できないため、オブジェクトは JSON.stringify() で変換します。', syntax: "localStorage.setItem('key', JSON.stringify(obj));\nconst val = JSON.parse(localStorage.getItem('key'));" },
  'toLocaleString': { title: 'toLocaleString()', body: '数値を地域の書式（3桁カンマ区切りなど）の文字列に変換します。金額表示の定番です。', syntax: '(1234567).toLocaleString() // "1,234,567"' },
};

function findSelectionExp(sel) {
  const t = sel.trim();
  if (!t) return null;

  // 1. キーワードの完全一致
  if (EXP_KW[t]) return EXP_KW[t];

  // 2. 構文パターン
  for (const p of EXP_PATTERNS) {
    if (p.re.test(t)) return p;
  }

  // 3. メソッド名・グローバルオブジェクト
  if (EXP_METHODS[t]) return EXP_METHODS[t];
  for (const [name, info] of Object.entries(EXP_METHODS)) {
    if (new RegExp(`(?:^|[^\\w$])${name}(?:[^\\w$]|$)`).test(t)) return info;
  }

  // 4. キーワードを含むか
  for (const [kw, info] of Object.entries(EXP_KW)) {
    if (new RegExp(`\\b${kw}\\b`).test(t)) return info;
  }
  return null;
}

// ----------------------------------------------------------------
//  スニペット定義
// ----------------------------------------------------------------
const SNIPPETS = [
  // ---- 業務ロジック（IM） ----
  { group: '業務ロジック（IM）', label: 'IM: ヘルパー（空/数値/trim）',
    desc: 'どのスニペットからも使う共通ヘルパーです。isEmpty で空判定、toNum でカンマ付き文字列も安全に数値化、clean で前後の空白を除去します。',
    code: `// 共通ヘルパー：空チェック・数値変換・trim
const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';
const toNum   = (v) => Number(String(v ?? '').replace(/,/g, '')) || 0;
const clean   = (v) => String(v ?? '').trim();
` },
  { group: '業務ロジック（IM）', label: 'IM: 値の取得/設定（基本）',
    desc: '画面項目の値を取得・設定する基本形です。項目IDを1か所に集約しておくと修正に強くなります。',
    code: `// 画面項目の値を取得・設定する基本形
const getVal = (id) => document.getElementById(id).value;
const setVal = (id, v) => { document.getElementById(id).value = v; };

const userName = getVal('userName');
setVal('userName', clean(userName));
` },
  { group: '業務ロジック（IM）', label: 'IM: 必須チェック（空ならフォーカス）',
    desc: '必須項目が空ならメッセージを表示してその項目にフォーカスを移し、false を返します。送信前チェックの定番です。',
    code: `// 必須チェック：空ならメッセージを出してフォーカス
function checkRequired(id, label) {
  const el = document.getElementById(id);
  if (!el.value.trim()) {
    alert(label + 'を入力してください。');
    el.focus();
    return false;
  }
  return true;
}

if (!checkRequired('userName', '氏名')) {
  // ここで処理を中断する
}
` },
  { group: '業務ロジック（IM）', label: 'IM: 条件で表示/非表示',
    desc: '選択値などの条件に応じてエリアを表示・非表示にします。display を空文字に戻すと元の表示に戻ります。',
    code: `// 条件によって項目を表示/非表示にする
function setVisible(id, visible) {
  document.getElementById(id).style.display = visible ? '' : 'none';
}

setVisible('detailArea', getVal('type') === 'その他');
` },
  { group: '業務ロジック（IM）', label: 'IM: 条件で有効/無効（入力可否）',
    desc: '条件に応じて入力欄やボタンを disabled にします。disabled の項目はフォーム送信時に値が送られない点に注意します。',
    code: `// 条件によって入力可否を切り替える
function setEnabled(id, enabled) {
  document.getElementById(id).disabled = !enabled;
}

setEnabled('reason', getVal('status') === '却下');
` },
  { group: '業務ロジック（IM）', label: 'IM: 読み取り専用切替（閲覧モードなど）',
    desc: '閲覧モードのときに複数の項目をまとめて readOnly にします。readOnly は disabled と違い、値は送信されます。',
    code: `// 閲覧モードなどで読み取り専用に切り替える
function setReadonly(id, readonly) {
  document.getElementById(id).readOnly = readonly;
}

const isViewMode = true; // 画面のモード判定に置き換える
['userName', 'dept', 'note'].forEach((id) => setReadonly(id, isViewMode));
` },
  { group: '業務ロジック（IM）', label: 'IM: 値のコピー（A→B）',
    desc: '「申請者と同じ」チェックなどで、項目Aの値を項目Bへコピーする定番処理です。',
    code: `// A の値を B にコピー（例：申請者 → 連絡先）
setVal('contactName', getVal('userName'));
` },
  { group: '業務ロジック（IM）', label: 'IM: 連動クリア（親が変わったら子を消す）',
    desc: '大分類が変わったら小分類を空にする、といった親子項目の整合性を保つ処理です。',
    code: `// 親項目が変わったら子項目をクリアする
document.getElementById('category').addEventListener('change', () => {
  setVal('subCategory', '');
});
` },
  { group: '業務ロジック（IM）', label: 'IM: 自動計算（合計=単価×数量）',
    desc: '単価・数量の入力のたびに合計を再計算します。toLocaleString でカンマ区切り表示にします。',
    code: `// 単価 × 数量 → 合計を自動計算
function calcTotal() {
  const price = toNum(getVal('price'));
  const qty   = toNum(getVal('qty'));
  setVal('total', (price * qty).toLocaleString());
}

['price', 'qty'].forEach((id) =>
  document.getElementById(id).addEventListener('input', calcTotal)
);
` },
  { group: '業務ロジック（IM）', label: 'IM: 入力チェック実行（全体/個別）',
    desc: '個別チェックを先にすべて実行してから every で判定します。エラーが複数あっても全項目を確認できる形です。',
    code: `// 入力チェックをまとめて実行する
function validateAll() {
  const results = [
    checkRequired('userName', '氏名'),
    checkRequired('dept', '部署'),
    checkPeriod('startDate', 'endDate'),
  ];
  return results.every((ok) => ok);
}

if (!validateAll()) {
  // エラーあり：送信を中止する
}
` },
  { group: '業務ロジック（IM）', label: 'IM: 期間チェック（開始<=終了）',
    desc: '開始日と終了日の前後関係をチェックします。yyyy-mm-dd 形式なら文字列比較でそのまま判定できます。',
    code: `// 期間チェック：開始日 <= 終了日
function checkPeriod(startId, endId) {
  const start = getVal(startId);
  const end   = getVal(endId);
  if (start && end && start > end) {
    alert('終了日は開始日以降の日付を指定してください。');
    document.getElementById(endId).focus();
    return false;
  }
  return true;
}
` },
  { group: '業務ロジック（IM）', label: 'IM: チェックボックスで分岐（true/false対応)',
    desc: 'チェックボックスは value ではなく checked（true / false）で判定します。',
    code: `// チェックボックスの ON/OFF で処理を分岐
const agreed = document.getElementById('agree').checked;

if (agreed) {
  setEnabled('submitBtn', true);
} else {
  setEnabled('submitBtn', false);
}
` },
  { group: '業務ロジック（IM）', label: 'IM: 数値安全変換（カンマ除去）',
    desc: '「1,234,567」のようなカンマ付き入力を安全に数値へ変換し、整形して表示に戻します。',
    code: `// カンマ付き文字列を安全に数値へ変換する
const raw = getVal('amount');           // 例: "1,234,567"
const num = toNum(raw);                 // → 1234567
setVal('amount', num.toLocaleString()); // 整形して戻す
` },
  { group: '業務ロジック（IM）', label: 'IM: 明細テーブル合計（概念例)',
    desc: '明細行の金額列を走査して合計を求める概念例です。行数が可変でも querySelectorAll で全行を拾えます。',
    code: `// 明細テーブルの金額列を合計する（概念例）
const rows = document.querySelectorAll('#detailTable tbody tr');
let sum = 0;

rows.forEach((row) => {
  sum += toNum(row.querySelector('.amount').value);
});

setVal('grandTotal', sum.toLocaleString());
` },
  { group: '業務ロジック（IM）', label: 'IM: マスタ参照して自動入力（fetch例）',
    desc: 'コードの入力を契機にマスタAPIを参照し、名称・単価を自動入力します。res.ok の確認を忘れないようにします。',
    code: `// コード入力 → マスタ参照して名称を自動入力
async function loadMaster(code) {
  const res = await fetch(\`/api/master/\${code}\`);
  if (!res.ok) return;
  const data = await res.json();
  setVal('itemName', data.name);
  setVal('unitPrice', data.price.toLocaleString());
}

document.getElementById('itemCode')
  .addEventListener('change', (e) => loadMaster(e.target.value));
` },
  { group: '業務ロジック（IM）', label: 'IM: 初期表示（init）テンプレ',
    desc: '画面初期表示処理のテンプレートです。「初期値セット → 表示制御 → イベント登録」の順に書くと読みやすくなります。',
    code: `// 画面初期表示時の処理テンプレート
window.addEventListener('DOMContentLoaded', () => {
  // 1. 初期値セット
  setVal('applyDate', new Date().toISOString().slice(0, 10));

  // 2. 表示制御
  setVisible('adminArea', false);

  // 3. イベント登録
  document.getElementById('category')
    .addEventListener('change', onCategoryChange);
});
` },

  // ---- 基本構文 ----
  { group: '基本構文', label: 'switch（基本）',
    desc: '値に応じて分岐する switch 文の基本形です。各 case の最後に必ず break を書きます。',
    code: `switch (value) {
  case 'A':
    // A の処理
    break;
  case 'B':
    // B の処理
    break;
  default:
    // それ以外
    break;
}
` },
  { group: '基本構文', label: 'switch（fallthrough注意）',
    desc: 'break を書かないと次の case へ処理が流れます（fallthrough）。複数の値で同じ処理をしたいとき以外はバグの元です。',
    code: `switch (rank) {
  case 'S':
  case 'A':          // S と A は同じ処理（意図的な fallthrough）
    console.log('優秀');
    break;
  case 'B':
    console.log('合格');
    // break を忘れると default まで実行されてしまう！
    break;
  default:
    console.log('再挑戦');
}
` },
  { group: '基本構文', label: 'if / else if / else',
    desc: '上から順に条件を評価し、最初に true になったブロックだけを実行します。',
    code: `if (score >= 80) {
  console.log('優');
} else if (score >= 60) {
  console.log('良');
} else {
  console.log('不可');
}
` },
  { group: '基本構文', label: '三項演算子（?:）',
    desc: '条件 ? 真のときの値 : 偽のときの値。値を選ぶだけなら if / else より簡潔に書けます。',
    code: `const label = score >= 60 ? '合格' : '不合格';
` },
  { group: '基本構文', label: 'for（基本）',
    desc: 'カウンタ変数 i を使う基本のループです。i < length の条件を間違えると1回多い/少ないバグになります。',
    code: `for (let i = 0; i < items.length; i++) {
  console.log(i, items[i]);
}
` },
  { group: '基本構文', label: 'for...of（値を回す）',
    desc: '配列などの「値」を順に取り出します。インデックスが不要ならこちらが読みやすく安全です。',
    code: `for (const item of items) {
  console.log(item);
}
` },
  { group: '基本構文', label: 'for...in（キーを回す）',
    desc: 'オブジェクトの「キー」を順に取り出します。値は obj[key] で参照します。',
    code: `for (const key in obj) {
  console.log(key, obj[key]);
}
` },
  { group: '基本構文', label: 'while ループ',
    desc: '条件が true の間繰り返します。ループ内で条件が変わるようにしないと無限ループになります。',
    code: `while (count < 10) {
  count++;
}
` },
  { group: '基本構文', label: 'try / catch',
    desc: 'エラーが起こりうる処理を安全に実行します。JSON.parse や fetch の失敗処理でよく使います。',
    code: `try {
  const data = JSON.parse(text);
} catch (error) {
  console.error('解析に失敗:', error.message);
}
` },
  { group: '基本構文', label: 'async / await（fetch）',
    desc: '非同期処理を同期的な見た目で書ける構文です。await は async 関数の中でのみ使えます。',
    code: `async function getData(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}
` },
  { group: '基本構文', label: 'class（定義と継承）',
    desc: 'クラスの定義・継承の基本形です。子クラスの constructor では super() の呼び出しが必須です。',
    code: `class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(\`\${this.name} makes a sound.\`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(\`\${this.name} barks!\`);
  }
}
` },

  // ---- 配列操作 ----
  { group: '配列操作', label: 'filter（条件で絞り込み）',
    desc: '条件を満たす要素だけの新しい配列を返します。元の配列は変更されません。▶ 実行 で結果を確認できます。',
    code: `const users = [
  { name: '佐藤', age: 28 },
  { name: '鈴木', age: 17 },
  { name: '高橋', age: 35 },
];
const adults = users.filter((u) => u.age >= 18);
console.log(adults);
` },
  { group: '配列操作', label: 'find（1件だけ探す）',
    desc: '条件に合う最初の1件を返します。見つからなければ undefined です。ID検索の定番です。',
    code: `const items = [
  { id: 1, name: 'りんご' },
  { id: 2, name: 'みかん' },
];
const found = items.find((item) => item.id === 2);
console.log(found); // { id: 2, name: 'みかん' }
` },
  { group: '配列操作', label: 'reduce（合計・平均）',
    desc: '配列を1つの値に集約します。第2引数の 0 は初期値です。合計・平均の計算はこの形を覚えれば十分です。',
    code: `const scores = [80, 92, 67, 75];
const total = scores.reduce((acc, s) => acc + s, 0);
const avg   = total / scores.length;
console.log('合計:', total, '平均:', avg);
` },
  { group: '配列操作', label: 'sort（数値/文字列）',
    desc: '比較関数を省略すると文字列として並ぶため、数値には必ず (a, b) => a - b を渡します。[...配列] のコピーで元の並びを守るのがコツです。',
    code: `const nums = [30, 5, 120, 44];
console.log([...nums].sort((a, b) => a - b)); // 昇順
console.log([...nums].sort((a, b) => b - a)); // 降順

const names = ['たなか', 'あべ', 'さとう'];
console.log([...names].sort((a, b) => a.localeCompare(b, 'ja')));
` },
  { group: '配列操作', label: '重複削除（unique）',
    desc: 'プリミティブ値は Set、オブジェクト配列は Map を使って重複を取り除きます。',
    code: `const tags = ['red', 'blue', 'red', 'green', 'blue'];
console.log([...new Set(tags)]); // ['red', 'blue', 'green']

// オブジェクト配列は id で重複除去
const rows = [{ id: 1 }, { id: 2 }, { id: 1 }];
const uniqueById = [...new Map(rows.map((r) => [r.id, r])).values()];
console.log(uniqueById);
` },
  { group: '配列操作', label: 'グループ化（groupBy）',
    desc: 'カテゴリごとに要素をまとめます。acc[key] ??= [] は「なければ空配列を作る」という意味です。',
    code: `const list = [
  { cat: '果物', name: 'りんご' },
  { cat: '野菜', name: 'にんじん' },
  { cat: '果物', name: 'ばなな' },
];
const grouped = list.reduce((acc, item) => {
  (acc[item.cat] ??= []).push(item.name);
  return acc;
}, {});
console.log(grouped); // { 果物: [...], 野菜: [...] }
` },
  { group: '配列操作', label: '最大・最小',
    desc: '数値配列はスプレッド構文で Math.max/min に渡します。オブジェクト配列は reduce で比べます。',
    code: `const nums = [3, 41, 7, 19];
console.log(Math.max(...nums)); // 41
console.log(Math.min(...nums)); // 3

// オブジェクト配列から最大の要素を取る
const items = [{ price: 100 }, { price: 480 }, { price: 250 }];
const most = items.reduce((a, b) => (a.price > b.price ? a : b));
console.log(most); // { price: 480 }
` },
  { group: '配列操作', label: '分割（chunk）',
    desc: '配列を指定サイズごとの小さな配列に分割します。一覧の段組み表示やバッチ処理で使います。',
    code: `const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
console.log(chunk([1, 2, 3, 4, 5, 6, 7], 3)); // [[1,2,3],[4,5,6],[7]]
` },

  // ---- 文字列操作 ----
  { group: '文字列操作', label: 'trim / 大文字小文字',
    desc: '入力値の整形の基本セットです。trim は前後の空白・改行を除去します。',
    code: `const input = '  Hello World  ';
console.log(input.trim());               // 'Hello World'
console.log(input.trim().toUpperCase()); // 'HELLO WORLD'
console.log(input.trim().toLowerCase()); // 'hello world'
` },
  { group: '文字列操作', label: 'ゼロ埋め（padStart）',
    desc: '指定桁になるまで先頭に文字を埋めます。伝票番号・時刻表示などの定番です。',
    code: `const no = 7;
console.log(String(no).padStart(4, '0')); // '0007'

// 伝票番号の生成例
const denpyoNo = 'D' + String(no).padStart(6, '0');
console.log(denpyoNo); // 'D000007'
` },
  { group: '文字列操作', label: '置換（replace / replaceAll）',
    desc: 'replace は最初の1件だけ置換します。全部置換するには replaceAll か、正規表現の g フラグを使います。',
    code: `const text = '2026/07/09';
console.log(text.replaceAll('/', '-')); // '2026-07-09'

// 正規表現でまとめて置換（g フラグ）
console.log(text.replace(/\\//g, '.')); // '2026.07.09'
` },
  { group: '文字列操作', label: '部分一致チェック',
    desc: '含む・で始まる・で終わる、の3点セットです。ファイル名や検索の判定に使います。',
    code: `const fileName = 'report_2026.pdf';
console.log(fileName.includes('2026'));     // true
console.log(fileName.startsWith('report')); // true
console.log(fileName.endsWith('.pdf'));     // true
` },
  { group: '文字列操作', label: 'split / join（文字列⇔配列）',
    desc: 'split で区切り文字により配列へ分解し、join で再び文字列に結合します。',
    code: `const csv = 'りんご,みかん,ばなな';
const fruits = csv.split(',');
console.log(fruits);             // ['りんご', 'みかん', 'ばなな']
console.log(fruits.join(' / ')); // 'りんご / みかん / ばなな'
` },

  // ---- 日付・時刻 ----
  { group: '日付・時刻', label: '今日の日付（YYYY-MM-DD）',
    desc: 'ローカル（日本時間）基準で今日の日付を組み立てます。toISOString() は UTC 基準のため朝9時前に日付がずれる点に注意します。',
    code: `const d = new Date();
const today = \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;
console.log(today);
` },
  { group: '日付・時刻', label: '現在時刻（HH:MM）',
    desc: 'toLocaleTimeString に書式オプションを渡して時刻文字列を作ります。',
    code: `const time = new Date().toLocaleTimeString('ja-JP', {
  hour: '2-digit', minute: '2-digit',
});
console.log(time);
` },
  { group: '日付・時刻', label: '日本語フォーマット',
    desc: 'toLocaleString で「2026年7月9日(木)」のような日本語表記を簡単に作れます。',
    code: `const fmt = new Date().toLocaleString('ja-JP', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
});
console.log(fmt);
` },
  { group: '日付・時刻', label: '日付差分（日数）',
    desc: 'Date の引き算はミリ秒差を返すので、1日 = 86,400,000 ミリ秒で割ります。',
    code: `const diffDays = (a, b) =>
  Math.round((new Date(b) - new Date(a)) / 86_400_000);
console.log(diffDays('2026-07-01', '2026-07-09')); // 8
` },
  { group: '日付・時刻', label: '日付加算（納期計算など）',
    desc: 'setDate は月またぎも自動で処理します。toLocaleDateString("sv-SE") は YYYY-MM-DD 形式を返す便利ワザです。',
    code: `const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('sv-SE'); // YYYY-MM-DD
};
console.log(addDays('2026-07-09', 14)); // 14日後の納期
` },
  { group: '日付・時刻', label: '月初・月末を取得',
    desc: '「翌月の0日目 = 当月末日」という Date の仕様を使います。集計期間の算出に便利です。',
    code: `const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
const lastDay  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
console.log('月初:', firstDay.toLocaleDateString('sv-SE'));
console.log('月末:', lastDay.toLocaleDateString('sv-SE'));
` },

  // ---- データ変換 ----
  { group: 'データ変換', label: '配列→オブジェクト（idで引く）',
    desc: '配列を id をキーにしたオブジェクトへ変換すると、ループせずに1発で要素を取り出せます。',
    code: `const users = [
  { id: 1, name: '佐藤' },
  { id: 2, name: '鈴木' },
];
const byId = Object.fromEntries(users.map((u) => [u.id, u]));
console.log(byId[2].name); // '鈴木'
` },
  { group: 'データ変換', label: 'オブジェクト→配列',
    desc: 'Object.entries / keys / values でオブジェクトを配列に変換し、map や filter に繋げます。',
    code: `const stock = { りんご: 5, みかん: 12 };
const rows = Object.entries(stock).map(([name, qty]) => ({ name, qty }));
console.log(rows);
console.log(Object.keys(stock), Object.values(stock));
` },
  { group: 'データ変換', label: 'ディープクローン',
    desc: 'structuredClone はネストの深いオブジェクトも完全に複製する現代の標準手段です（古い環境では JSON.parse(JSON.stringify(obj)) を使います）。',
    code: `const original = { user: { name: '佐藤' }, tags: ['a', 'b'] };
const clone = structuredClone(original);
clone.user.name = '鈴木';
console.log(original.user.name); // '佐藤'（元は影響を受けない）
` },
  { group: 'データ変換', label: 'プロパティ抽出（pick）',
    desc: '必要なキーだけを取り出した新しいオブジェクトを作ります。APIに送る前に不要な項目を落とす用途などに使います。',
    code: `const pick = (obj, keys) =>
  Object.fromEntries(keys.map((k) => [k, obj[k]]));

const user = { id: 1, name: '佐藤', password: 'xxx' };
console.log(pick(user, ['id', 'name'])); // password を除外
` },
  { group: 'データ変換', label: 'フラット化（flat / flatMap）',
    desc: 'flat はネスト配列を平らにし、flatMap は map と flat を一度に行います。',
    code: `const nested = [[1, 2], [3, 4], [5]];
console.log(nested.flat()); // [1,2,3,4,5]

const orders = [{ items: ['a', 'b'] }, { items: ['c'] }];
console.log(orders.flatMap((o) => o.items)); // ['a','b','c']
` },
  { group: 'データ変換', label: 'CSV行→変数（簡易）',
    desc: 'split と分割代入を組み合わせて、カンマ区切りの1行を変数へ展開します。',
    code: `const line = '1001, 佐藤, 営業部';
const [id, name, dept] = line.split(',').map((s) => s.trim());
console.log(id, name, dept);
` },

  // ---- バリデーション ----
  { group: 'バリデーション', label: 'メールアドレス確認',
    desc: '簡易的なメール形式チェックです。厳密な検証はサーバー側でも行うのが原則です。',
    code: `const isEmail = (v) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v);
console.log(isEmail('taro@example.com')); // true
console.log(isEmail('taro@@example'));    // false
` },
  { group: 'バリデーション', label: '電話番号確認（JP）',
    desc: 'ハイフンあり・なし両対応の日本の電話番号チェックの例です。',
    code: `const isPhone = (v) =>
  /^0\\d{1,4}-?\\d{1,4}-?\\d{3,4}$/.test(v);
console.log(isPhone('03-1234-5678'));  // true
console.log(isPhone('09012345678'));   // true
console.log(isPhone('123-456'));       // false
` },
  { group: 'バリデーション', label: '郵便番号確認（JP）',
    desc: '123-4567 形式（ハイフン省略も可）をチェックします。-? は「ハイフンがあってもなくても良い」という意味です。',
    code: `const isZip = (v) => /^\\d{3}-?\\d{4}$/.test(v);
console.log(isZip('123-4567')); // true
console.log(isZip('1234567'));  // true
console.log(isZip('12-345'));   // false
` },
  { group: 'バリデーション', label: '数値範囲チェック',
    desc: 'Number.isFinite で「数値であること」も同時に確認するのがポイントです（NaN や文字列を弾けます）。',
    code: `const isInRange = (v, min, max) =>
  Number.isFinite(v) && v >= min && v <= max;
console.log(isInRange(50, 0, 100));  // true
console.log(isInRange(NaN, 0, 100)); // false
` },
  { group: 'バリデーション', label: 'URL確認',
    desc: 'new URL() が例外を投げるかどうかで判定します。正規表現より確実な方法です。',
    code: `const isUrl = (v) => {
  try { new URL(v); return true; }
  catch { return false; }
};
console.log(isUrl('https://example.com')); // true
console.log(isUrl('not a url'));           // false
` },

  // ---- API通信 ----
  { group: 'API通信', label: 'GET リクエスト',
    desc: 'fetch の基本形です。res.ok の確認を忘れると 404 でも正常扱いになるので注意します。',
    code: `const getData = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
};
// 使用例: const data = await getData('/api/users');
` },
  { group: 'API通信', label: 'POST リクエスト',
    desc: 'JSONボディを送る POST の定番形です。Content-Type ヘッダーと JSON.stringify をセットで使います。',
    code: `const postData = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
};
// 使用例: await postData('/api/users', { name: '佐藤' });
` },
  { group: 'API通信', label: 'リトライ付き fetch',
    desc: '失敗したら待ち時間を伸ばしながら再試行します（1秒→2秒→3秒）。ネットワークが不安定な環境向けです。',
    code: `const fetchWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
};
` },
  { group: 'API通信', label: 'タイムアウト付き fetch',
    desc: 'AbortController で指定時間を過ぎたリクエストを中断します。応答しないサーバーで画面が固まるのを防ぎます。',
    code: `const fetchWithTimeout = async (url, ms = 5000) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};
` },

  // ---- ユーティリティ ----
  { group: 'ユーティリティ', label: 'デバウンス',
    desc: '連続入力が止まってから1回だけ実行します。検索ボックスの入力イベントなどに使います。',
    code: `const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};
// 使用例: input.addEventListener('input', debounce(search, 300));
` },
  { group: 'ユーティリティ', label: 'スロットル',
    desc: '一定間隔ごとに最大1回だけ実行します。スクロールやリサイズイベントの間引きに使います。',
    code: `const throttle = (fn, ms) => {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
};
// 使用例: window.addEventListener('scroll', throttle(onScroll, 200));
` },
  { group: 'ユーティリティ', label: 'スリープ（sleep）',
    desc: 'await で指定ミリ秒待ちます。▶ 実行 で1秒待つ動きを確認できます。',
    code: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  console.log('開始');
  await sleep(1000);
  console.log('1秒たちました');
};
main();
` },
  { group: 'ユーティリティ', label: 'URLパラメータ取得',
    desc: '?page=2&q=hello のようなクエリ文字列をオブジェクトに変換します。',
    code: `const params = Object.fromEntries(
  new URLSearchParams(location.search)
);
console.log(params); // 例: { page: '2', q: 'hello' }
` },
  { group: 'ユーティリティ', label: 'クリップボードにコピー',
    desc: 'ボタンクリックなどユーザー操作の中で呼ぶ必要があります。await でコピー完了を待てます。',
    code: `const copyText = async (text) => {
  await navigator.clipboard.writeText(text);
  console.log('コピーしました:', text);
};
// 使用例: btn.addEventListener('click', () => copyText('コピーする文字'));
` },
  { group: 'ユーティリティ', label: '乱数・ランダム選択',
    desc: 'min〜max の整数乱数と、配列からのランダム抽選です。',
    code: `const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
console.log('サイコロ:', randInt(1, 6));

const members = ['佐藤', '鈴木', '高橋'];
console.log('当番:', members[Math.floor(Math.random() * members.length)]);
` },
  { group: 'ユーティリティ', label: 'ページネーション',
    desc: '配列をページ単位に切り出します。件数と総ページ数も一緒に返す形が使いやすいです。',
    code: `const paginate = (array, page, perPage = 10) => {
  const start = (page - 1) * perPage;
  return {
    items: array.slice(start, start + perPage),
    total: array.length,
    pages: Math.ceil(array.length / perPage),
  };
};
const data = Array.from({ length: 25 }, (_, i) => i + 1);
console.log(paginate(data, 2, 10)); // 11〜20
` },

  // ---- DOM操作 ----
  { group: 'DOM操作', label: '要素の取得（id / セレクター）',
    desc: 'getElementById は id 専用で高速、querySelector は CSS セレクターで柔軟に取得できます。',
    code: `const byId  = document.getElementById('userName');
const first = document.querySelector('.item');       // 最初の1件
const all   = document.querySelectorAll('.item');    // 全件（NodeList）
all.forEach((el) => console.log(el.textContent));
` },
  { group: 'DOM操作', label: '要素の作成と追加',
    desc: 'createElement → 内容設定 → appendChild の3ステップです。textContent を使うと HTML として解釈されず安全です。',
    code: `const li = document.createElement('li');
li.textContent = '新しい項目';
li.classList.add('item');
document.getElementById('list').appendChild(li);
` },
  { group: 'DOM操作', label: 'イベント委譲',
    desc: '親要素に1つだけリスナーを付け、closest でクリックされた行を特定します。あとから追加した行にも効くのが利点です。',
    code: `document.getElementById('list').addEventListener('click', (e) => {
  const row = e.target.closest('li');
  if (!row) return;
  console.log('クリックされた行:', row.textContent);
});
` },
  { group: 'DOM操作', label: 'クラスの付け外し',
    desc: 'classList の add / remove / toggle / contains で見た目の状態を切り替えます。',
    code: `const el = document.querySelector('.card');
el.classList.add('active');
el.classList.remove('hidden');
el.classList.toggle('open');            // あれば外す、なければ付ける
console.log(el.classList.contains('active')); // true
` },
  { group: 'DOM操作', label: 'フォーム値の一括取得',
    desc: 'FormData を使うと、name 属性の付いた項目をまとめてオブジェクト化できます。',
    code: `const form = document.getElementById('myForm');
const data = Object.fromEntries(new FormData(form));
console.log(data); // { name: '...', email: '...' }
` },

  // ---- オブジェクト操作 ----
  { group: 'オブジェクト操作', label: 'マージ（スプレッド構文）',
    desc: 'スプレッド構文でオブジェクトを合成します。同じキーは「後に書いたほう」が勝つので、デフォルト値→入力値の順に並べます。',
    code: `const defaults = { color: 'red', size: 'M' };
const input    = { size: 'L' };
const merged   = { ...defaults, ...input }; // 後勝ち
console.log(merged); // { color: 'red', size: 'L' }
` },
  { group: 'オブジェクト操作', label: '分割代入＋デフォルト値',
    desc: 'プロパティを変数へ取り出しつつ、無いときの初期値も指定できます。関数の引数でも同じ書き方ができます。',
    code: `const user = { name: '佐藤', age: 28 };
const { name, age, dept = '未所属' } = user;
console.log(name, age, dept);

// 関数の引数でも使える
const greet = ({ name, honorific = 'さん' }) =>
  console.log(\`\${name}\${honorific}、こんにちは\`);
greet(user);
` },
  { group: 'オブジェクト操作', label: '安全なネストアクセス（?. と ??）',
    desc: '?. は途中が null / undefined でもエラーにせず undefined を返し、?? でそのときの代替値を指定します。',
    code: `const order = { customer: { address: null } };
console.log(order.customer?.address?.city);             // undefined
console.log(order.customer?.address?.city ?? '未設定'); // '未設定'
` },
  { group: 'オブジェクト操作', label: 'キーの存在確認',
    desc: '値が false や 0 でも「キー自体があるか」を正しく判定できる方法です。Object.hasOwn が現代の推奨です。',
    code: `const config = { debug: false };
console.log('debug' in config);              // true（値が false でも判定できる）
console.log(Object.hasOwn(config, 'debug')); // true（推奨）
console.log(config.debug !== undefined);     // true
` },
  { group: 'オブジェクト操作', label: '空オブジェクト・空配列判定',
    desc: 'オブジェクトは {} でも truthy なので、Object.keys の length で判定します。',
    code: `const isEmptyObj = (o) => Object.keys(o).length === 0;
console.log(isEmptyObj({}));       // true
console.log(isEmptyObj({ a: 1 })); // false
console.log([].length === 0);      // 配列は length で判定
` },
  { group: 'オブジェクト操作', label: 'オブジェクトの比較（簡易）',
    desc: '=== は参照の比較なので中身が同じでも false です。簡易比較には JSON 文字列化が使えます（キー順が同じ場合のみ）。',
    code: `const a = { x: 1, y: 2 };
const b = { x: 1, y: 2 };
console.log(a === b);                                 // false（参照が違う）
console.log(JSON.stringify(a) === JSON.stringify(b)); // true（簡易比較）
` },

  // ---- 数値・計算 ----
  { group: '数値・計算', label: '四捨五入（小数桁指定）',
    desc: 'Math.round は整数にしかできないため、桁を上げてから戻すのが定番です。',
    code: `const round = (num, digits = 0) => {
  const p = 10 ** digits;
  return Math.round(num * p) / p;
};
console.log(round(3.14159, 2)); // 3.14
console.log(round(1234.567, 1)); // 1234.6
` },
  { group: '数値・計算', label: '切り上げ・切り捨て',
    desc: '負の数では floor と trunc の結果が異なる点がハマりどころです。',
    code: `console.log(Math.ceil(3.01));  // 4（切り上げ）
console.log(Math.floor(3.99)); // 3（切り捨て）
console.log(Math.trunc(-3.9)); // -3（0へ向かって切る）
console.log(Math.floor(-3.9)); // -4（小さいほうへ切る）
` },
  { group: '数値・計算', label: 'カンマ区切り・通貨表示',
    desc: 'toLocaleString だけで金額表示が完成します。通貨記号付きにもできます。',
    code: `const price = 1234567;
console.log(price.toLocaleString()); // '1,234,567'
console.log(price.toLocaleString('ja-JP', {
  style: 'currency', currency: 'JPY',
})); // '￥1,234,567'
` },
  { group: '数値・計算', label: '消費税計算',
    desc: '税額の端数は切り捨てが一般的です（事業者により異なるため要件を確認）。',
    code: `const taxRate = 0.10;
const price   = 1980;
const tax     = Math.floor(price * taxRate);
const withTax = price + tax;
console.log(\`税抜: \${price}円 / 税: \${tax}円 / 税込: \${withTax}円\`);
` },
  { group: '数値・計算', label: 'パーセント計算（進捗率）',
    desc: '割合を出して四捨五入する基本形です。0除算を ?? や条件式で防ぐとより安全です。',
    code: `const done = 32, total = 120;
const rate = total > 0 ? Math.round((done / total) * 100) : 0;
console.log(\`進捗: \${rate}%\`); // 27%
` },
  { group: '数値・計算', label: '浮動小数点誤差対策',
    desc: '0.1 + 0.2 は 0.3 になりません。金額は「円単位の整数」で計算するのが最も安全です。',
    code: `console.log(0.1 + 0.2);         // 0.30000000000000004 (!)
console.log(0.1 + 0.2 === 0.3); // false

// 整数に直してから計算する
console.log((0.1 * 10 + 0.2 * 10) / 10); // 0.3
// 金額計算は「円単位の整数」で扱うのが安全
` },

  // ---- 非同期処理 ----
  { group: '非同期処理', label: 'Promise.all（並列実行）',
    desc: '複数の非同期処理を同時に走らせ、全部そろってから受け取ります。合計時間は「一番遅い1件」だけで済みます。',
    code: `const wait = (ms, label) =>
  new Promise((r) => setTimeout(() => r(label), ms));

const main = async () => {
  const [a, b, c] = await Promise.all([
    wait(300, 'A'), wait(200, 'B'), wait(100, 'C'),
  ]);
  console.log(a, b, c); // 3件合わせて約300msで完了
};
main();
` },
  { group: '非同期処理', label: 'Promise.allSettled（失敗も集める）',
    desc: 'Promise.all は1件失敗すると全体が失敗しますが、allSettled は成功・失敗をすべて集めて返します。',
    code: `const main = async () => {
  const results = await Promise.allSettled([
    Promise.resolve('成功データ'),
    Promise.reject(new Error('失敗しました')),
  ]);
  results.forEach((r) => {
    if (r.status === 'fulfilled') console.log('OK:', r.value);
    else console.log('NG:', r.reason.message);
  });
};
main();
` },
  { group: '非同期処理', label: '逐次処理（順番に await）',
    desc: 'for...of の中で await すると1件ずつ順番に処理します。前の結果を次で使うときや、負荷をかけたくないときに使います。',
    code: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ids = [1, 2, 3];

const main = async () => {
  for (const id of ids) {
    await sleep(300); // 1件ずつ順番に処理
    console.log('処理完了:', id);
  }
};
main();
` },
  { group: '非同期処理', label: '並列一括処理（map + Promise.all）',
    desc: '配列の各要素に非同期処理を並列でかける定番パターンです。逐次処理より大幅に速くなります。',
    code: `const fetchItem = async (id) => {
  await new Promise((r) => setTimeout(r, 100));
  return { id, name: '商品' + id };
};

const main = async () => {
  const ids = [1, 2, 3, 4];
  const items = await Promise.all(ids.map((id) => fetchItem(id)));
  console.log(items); // 全件並列で取得
};
main();
` },
  { group: '非同期処理', label: '非同期のエラーハンドリング',
    desc: 'async 関数内の throw は await + try/catch で受け取ります。catch を忘れると「未処理のPromise拒否」になります。',
    code: `const fetchUser = async (id) => {
  if (id <= 0) throw new Error('不正なIDです');
  return { id, name: 'ユーザー' + id };
};

const main = async () => {
  try {
    const user = await fetchUser(-1);
    console.log(user);
  } catch (err) {
    console.error('取得失敗:', err.message);
  }
};
main();
` },

  // ---- Map / Set ----
  { group: 'Map / Set', label: 'Map の基本',
    desc: 'キーと値のペアを扱う専用コレクションです。オブジェクトと違い、キーの型を問わず、サイズも size で取れます。',
    code: `const map = new Map();
map.set('apple', 150);
map.set('banana', 90);
console.log(map.get('apple')); // 150
console.log(map.has('grape')); // false
console.log(map.size);         // 2
for (const [key, value] of map) console.log(key, value);
` },
  { group: 'Map / Set', label: 'Set の基本（重複なし集合）',
    desc: '同じ値は1つしか持てないコレクションです。「処理済みかどうか」のチェックに最適です。',
    code: `const done = new Set();
done.add('task1');
done.add('task1'); // 重複は無視される
console.log(done.has('task1')); // true
console.log(done.size);         // 1
` },
  { group: 'Map / Set', label: '出現回数のカウント',
    desc: 'Map と ?? 0 の組み合わせで、要素ごとの登場回数を数えます。集計処理の定番です。',
    code: `const words = ['apple', 'banana', 'apple', 'orange', 'apple'];
const count = new Map();
for (const w of words) {
  count.set(w, (count.get(w) ?? 0) + 1);
}
console.log([...count]); // [['apple',3], ['banana',1], ['orange',1]]
` },
  { group: 'Map / Set', label: '2つの配列の差分・共通',
    desc: '片方を Set にしてから filter すると高速に差分・共通部分を出せます。',
    code: `const a = [1, 2, 3, 4];
const b = [3, 4, 5];
const setB = new Set(b);
console.log(a.filter((x) => !setB.has(x))); // 差分 [1, 2]
console.log(a.filter((x) => setB.has(x)));  // 共通 [3, 4]
` },

  // ---- 正規表現 ----
  { group: '正規表現', label: '数字だけ抽出',
    desc: 'match + g フラグで全件抽出、replace で数字以外の除去ができます。\\d は数字、\\D は数字以外です。',
    code: `const text = '注文番号: A-12345 (2026年)';
console.log(text.match(/\\d+/g));      // ['12345', '2026']
console.log(text.replace(/\\D/g, '')); // '123452026'（数字以外を除去）
` },
  { group: '正規表現', label: 'グループで部分抽出（match）',
    desc: '( ) で囲んだ部分が m[1], m[2]... に入ります。日付やコードの分解に使います。',
    code: `const date = '2026-07-09';
const m = date.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
console.log(m[1], m[2], m[3]); // 2026 07 09
` },
  { group: '正規表現', label: '名前付きグループ',
    desc: '(?<name>...) と書くと m.groups.name で取り出せます。番号より読みやすく、順序変更にも強い書き方です。',
    code: `const m = '2026-07-09'.match(
  /^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$/
);
console.log(m.groups.year, m.groups.month, m.groups.day);
` },
  { group: '正規表現', label: '全角→半角変換（英数字）',
    desc: '全角英数字は半角とコードポイントが 0xFEE0 ずれているだけなので、その差を引いて変換します。',
    code: `const toHankaku = (s) =>
  s.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xFEE0)
  );
console.log(toHankaku('ＡＢＣ１２３')); // 'ABC123'
` },
  { group: '正規表現', label: 'HTMLエスケープ',
    desc: 'ユーザー入力を innerHTML に入れる前の必須処理です（XSS対策）。textContent を使えばそもそも不要です。',
    code: `const escapeHtml = (s) => s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
console.log(escapeHtml('<b>太字 & "引用"</b>'));
` },

  // ---- 保存（localStorage） ----
  { group: '保存（localStorage）', label: 'オブジェクトの保存・読込',
    desc: 'localStorage は文字列しか持てないため、JSON.stringify / parse とセットで使います。読込は try/catch で壊れたデータに備えます。',
    code: `const saveData = (key, obj) =>
  localStorage.setItem(key, JSON.stringify(obj));
const loadData = (key, fallback = null) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

saveData('settings', { theme: 'dark', fontSize: 14 });
console.log(loadData('settings'));
` },
  { group: '保存（localStorage）', label: '有効期限付き保存',
    desc: '保存時に期限のタイムスタンプを一緒に入れておき、読込時に期限切れなら削除して null を返します。',
    code: `const saveWithExpiry = (key, value, ttlMs) => {
  localStorage.setItem(key, JSON.stringify({
    value, expiry: Date.now() + ttlMs,
  }));
};
const loadWithExpiry = (key) => {
  const item = JSON.parse(localStorage.getItem(key) ?? 'null');
  if (!item) return null;
  if (Date.now() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
};

saveWithExpiry('token', 'abc123', 60_000); // 1分間有効
console.log(loadWithExpiry('token'));
` },
  { group: '保存（localStorage）', label: '削除・件数確認',
    desc: 'removeItem で1件削除、clear で全削除です。clear は他の保存データも消えるため要注意です。',
    code: `localStorage.removeItem('settings'); // 1件削除
// localStorage.clear();             // 全削除（注意！）
console.log('保存件数:', localStorage.length);
` },

  // ---- エラー処理 ----
  { group: 'エラー処理', label: 'try / catch / finally 実践',
    desc: 'JSON.parse のような「失敗しうる処理」を安全に包む形です。finally は成功・失敗どちらでも実行されます。',
    code: `const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('JSONが不正です:', err.message);
    return null;
  } finally {
    console.log('parse処理 終了');
  }
};
console.log(parseJson('{"a": 1}'));
console.log(parseJson('壊れたJSON'));
` },
  { group: 'エラー処理', label: 'カスタムエラー',
    desc: 'Error を継承して独自のエラー型を作ると、catch 側で instanceof により種類を判別できます。想定外のエラーは再スローします。',
    code: `class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

try {
  throw new ValidationError('email', 'メール形式が不正です');
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(\`\${err.field}: \${err.message}\`);
  } else {
    throw err; // 想定外のエラーは握りつぶさず再スロー
  }
}
` },
  { group: 'エラー処理', label: 'エラーの再スロー（cause付き）',
    desc: '低レベルのエラーを分かりやすいメッセージに包み直しつつ、cause で元のエラーも保持する現代的な書き方です。',
    code: `const loadConfig = () => {
  try {
    return JSON.parse('壊れた設定');
  } catch (err) {
    throw new Error('設定の読み込みに失敗しました', { cause: err });
  }
};

try {
  loadConfig();
} catch (err) {
  console.error(err.message);
  console.error('原因:', err.cause.message);
}
` },
  { group: 'エラー処理', label: 'グローバルエラーハンドラ',
    desc: 'try/catch で拾えなかったエラーと、未処理のPromise拒否を最後の砦として捕捉します。ログ送信などに使います。',
    code: `window.addEventListener('error', (e) => {
  console.error('未捕捉エラー:', e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('未処理のPromise拒否:', e.reason);
});
` },
];

// ----------------------------------------------------------------
//  初期サンプルコード
// ----------------------------------------------------------------
const SAMPLE_CODE = `// JavaScript サンプル（右側で編集）
const greeting = async (name) => {
  const message = \`Hello, \${name}!\`;
  return message;
};

class Animal {
  constructor(name, age) {
    this.name = name;
    this.age  = age;
  }

  speak() {
    console.log(\`\${this.name} makes a sound.\`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(\`\${this.name} barks!\`);
  }
}

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);

const regex = /^\\d{3}-\\d{4}$/g;
const isValid = regex.test("123-4567"); // true

// ▶ 実行 で下の出力を確認できます
const dog = new Dog("Pochi", 3);
dog.speak();
console.log("doubled:", doubled);
console.log("isValid:", isValid);
`;

// ----------------------------------------------------------------
//  DOM 参照
// ----------------------------------------------------------------
const textarea    = document.getElementById('code-textarea');
const hlPre       = document.getElementById('hl-pre');
const hlCode      = document.getElementById('hl-code');
const lineNumbers = document.getElementById('line-numbers');
const expBody     = document.getElementById('explanation-body');
const snippetsBody = document.getElementById('snippets-body');
const outputBody  = document.getElementById('output-body');
const btnRun      = document.getElementById('btn-run');
const btnReset    = document.getElementById('btn-reset');
const btnCopy     = document.getElementById('btn-copy');
const btnClear    = document.getElementById('btn-clear');
const syntaxStatus  = document.getElementById('syntax-status');
const snippetSearch = document.getElementById('snippet-search');

// ----------------------------------------------------------------
//  自動保存（localStorage）
// ----------------------------------------------------------------
const STORAGE_KEY = 'js-syntax-visualizer:code';

function saveCode() {
  try { localStorage.setItem(STORAGE_KEY, textarea.value); } catch { /* 保存不可でも動作は継続 */ }
}

function loadSavedCode() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

// ----------------------------------------------------------------
//  エディタ描画
// ----------------------------------------------------------------
let bracketMarks = null; // 対応括弧の絶対位置ペア（Set）

function updateHighlight() {
  hlCode.innerHTML = highlightJs(textarea.value, bracketMarks) + '\n';
}

// カーソルの前後にある括弧の対応相手を探してハイライトする
function updateBracketMatch() {
  let marks = null;
  if (textarea.selectionStart === textarea.selectionEnd) {
    const { pairs } = getScan();
    const pos = textarea.selectionStart;
    for (const p of [pos, pos - 1]) {
      if (pairs.has(p)) { marks = new Set([p, pairs.get(p)]); break; }
    }
  }
  const changed = String([...(marks ?? [])]) !== String([...(bracketMarks ?? [])]);
  bracketMarks = marks;
  if (changed) updateHighlight();
}

// ----------------------------------------------------------------
//  構文チェック（入力が止まったら実行）
// ----------------------------------------------------------------
function checkSyntax() {
  for (const el of lineNumbers.children) el.classList.remove('ln-error');

  if (!textarea.value.trim()) {
    syntaxStatus.textContent = '';
    syntaxStatus.className = '';
    syntaxStatus.title = '';
    return;
  }

  // 1. 括弧の不一致（行番号つきで検出できる）
  const { error } = getScan();
  let message = error ? error.message : null;
  const errLine = error ? error.line : null;

  // 2. それ以外の構文エラーは Function コンストラクタのコンパイルで検出
  if (!message) {
    try {
      new Function(textarea.value);
    } catch (e) {
      message = `${e.name}: ${e.message}`;
    }
  }

  if (message) {
    syntaxStatus.textContent = '✖ ' + message;
    syntaxStatus.title = message;
    syntaxStatus.className = 'err';
    if (errLine && lineNumbers.children[errLine - 1]) {
      lineNumbers.children[errLine - 1].classList.add('ln-error');
    }
  } else {
    syntaxStatus.textContent = '✓ 構文OK';
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

// Undo履歴（Ctrl+Z）を保ったまま [start, end) を text で置き換える。
// textarea.value への直接代入はUndoスタックを破壊するため、
// 非推奨だが全ブラウザで動く execCommand を使い、失敗時のみ直接代入に切り替える。
function replaceRange(start, end, text) {
  if (start === end && text === '') return;
  textarea.focus();
  textarea.setSelectionRange(start, end);

  let ok = false;
  try {
    ok = text === ''
      ? document.execCommand('delete', false)
      : document.execCommand('insertText', false, text);
  } catch {
    ok = false;
  }

  if (!ok) {
    // フォールバック（この場合のみUndo履歴は途切れる）
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
      title: highlightJs(shown),
      cat: `選択範囲：${exp.title}`,
      desc: exp.body,
      example: highlightJs(exp.syntax ?? shown),
    });
  } else {
    renderExplanation({
      title: highlightJs(shown),
      cat: '選択範囲',
      desc: 'この選択範囲に対応する解説が見つかりませんでした。キーワード（const, class など）やメソッド名を含む部分を選択すると解説が表示されます。',
      example: highlightJs(shown),
    });
  }
  return true;
}

// 選択範囲を優先し、なければカーソル行を解説する
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
    title: highlightJs(line.trim()),
    cat: rule.cat,
    desc: rule.desc,
    example: highlightJs(line.trim()),
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
  // 行の途中なら改行してから挿入する
  const needsNewline = s > 0 && value[s - 1] !== '\n';
  const insert = (needsNewline ? '\n' : '') + snippet.code;

  replaceRange(s, e, insert);

  updateHighlight();
  updateLineNumbers();
  syncScroll();
  saveCode();
  scheduleSyntaxCheck();

  // 説明エリアにスニペットの解説を表示する
  renderExplanation({
    title: escapeHtml(snippet.label),
    cat: 'スニペット',
    desc: snippet.desc,
    example: highlightJs(snippet.code.trimEnd()),
  });
}

// ----------------------------------------------------------------
//  コード実行（console 出力をパネルに表示）
// ----------------------------------------------------------------
function formatValue(v) {
  if (typeof v === 'string')   return v;
  if (typeof v === 'function') return String(v);
  if (v instanceof Error)      return `${v.name}: ${v.message}`;
  try {
    const json = JSON.stringify(v);
    return json !== undefined ? json : String(v);
  } catch {
    return String(v); // 循環参照など
  }
}

function appendLine(type, text) {
  const note = outputBody.querySelector('.out-empty-note, .placeholder-text');
  if (note) note.remove();
  const div = document.createElement('div');
  div.className = 'out-line' + (type !== 'log' ? ` out-${type}` : '');
  div.textContent = text;
  outputBody.appendChild(div);
  outputBody.scrollTop = outputBody.scrollHeight;
}

function appendTable(data) {
  if (!Array.isArray(data) || data.length === 0) {
    appendLine('log', formatValue(data));
    return;
  }
  const note = outputBody.querySelector('.out-empty-note, .placeholder-text');
  if (note) note.remove();

  const isObjRow = data.every((r) => r && typeof r === 'object');
  const cols = isObjRow ? [...new Set(data.flatMap((r) => Object.keys(r)))] : ['value'];

  const table = document.createElement('table');
  table.className = 'out-table';
  const header = table.insertRow();
  ['(index)', ...cols].forEach((c) => {
    const th = document.createElement('th');
    th.textContent = c;
    header.appendChild(th);
  });
  data.forEach((row, i) => {
    const tr = table.insertRow();
    tr.insertCell().textContent = i;
    cols.forEach((c) => {
      const v = isObjRow ? row[c] : row;
      tr.insertCell().textContent = v === undefined ? '' : formatValue(v);
    });
  });
  outputBody.appendChild(table);
  outputBody.scrollTop = outputBody.scrollHeight;
}

function runCode() {
  outputBody.innerHTML = '<span class="out-line out-muted out-empty-note">（console 出力はありませんでした）</span>';

  const fakeConsole = {
    log:   (...a) => appendLine('log',   a.map(formatValue).join(' ')),
    error: (...a) => appendLine('error', a.map(formatValue).join(' ')),
    warn:  (...a) => appendLine('warn',  a.map(formatValue).join(' ')),
    info:  (...a) => appendLine('info',  a.map(formatValue).join(' ')),
    table: (data) => appendTable(data),
  };

  try {
    const fn = new Function('console', '"use strict";\n' + textarea.value);
    const result = fn(fakeConsole);
    // 最上位が async 処理を返した場合の拒否も拾う
    if (result instanceof Promise) {
      result.catch((err) => appendLine('error', formatValue(err)));
    }
  } catch (err) {
    appendLine('error', formatValue(err));
  }
}

// ----------------------------------------------------------------
//  イベント
// ----------------------------------------------------------------
textarea.addEventListener('input', () => {
  bracketMarks = null;
  updateHighlight();
  updateLineNumbers();
  updateBracketMatch();
  explainCurrentLine();
  saveCode();
  scheduleSyntaxCheck();
});

btnRun.addEventListener('click', runCode);

// コピー / クリア
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
  bracketMarks = null;
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

// Ctrl+Enter（Mac: Cmd+Enter）で実行
textarea.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    runCode();
  }
});

// カーソル移動時：括弧の対応ハイライト＋解説を更新
function onCursorMove() {
  updateBracketMatch();
  updateExplanation();
}

textarea.addEventListener('scroll', syncScroll);
textarea.addEventListener('click', onCursorMove);
textarea.addEventListener('keyup', onCursorMove);
textarea.addEventListener('select', onCursorMove);
// マウスドラッグ選択の途中経過にも追従する
textarea.addEventListener('mouseup', onCursorMove);

// Tab / Shift+Tab でインデント（スペース2つ）
textarea.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  const { selectionStart: s, selectionEnd: end, value } = textarea;
  const INDENT = '  ';

  const isMultiLine = s !== end && value.slice(s, end).includes('\n');

  if (isMultiLine) {
    // ---- 複数行選択：各行の行頭でインデントを増減する ----
    const blockStart = value.lastIndexOf('\n', s - 1) + 1;

    // 選択終端が行頭（前の行の改行直後）の場合、その行は対象に含めない
    let effEnd = end;
    if (effEnd > blockStart && value[effEnd - 1] === '\n') effEnd--;
    const lastLineEnd = value.indexOf('\n', effEnd);
    const blockEnd = lastLineEnd === -1 ? value.length : lastLineEnd;

    const lines = value.slice(blockStart, blockEnd).split('\n');
    let firstDelta; // 選択開始位置の補正量（先頭行の増減分）

    let newLines;
    if (!e.shiftKey) {
      // インデント追加（空行はスキップ）
      newLines = lines.map((l) => (l.length ? INDENT + l : l));
      firstDelta = lines[0].length ? INDENT.length : 0;
    } else {
      // インデント削除（行頭のスペース2つ、なければ1つ）
      const removed = (l) => (l.startsWith(INDENT) ? 2 : l.startsWith(' ') ? 1 : 0);
      newLines = lines.map((l) => l.slice(removed(l)));
      firstDelta = -removed(lines[0]);
    }

    const newBlock = newLines.join('\n');
    const totalDelta = newBlock.length - (blockEnd - blockStart);

    replaceRange(blockStart, blockEnd, newBlock);

    // 選択範囲を維持する（行頭より前へは戻さない）
    const newS = Math.max(blockStart, s + firstDelta);
    const newEnd = Math.max(newS, end + totalDelta);
    textarea.setSelectionRange(newS, newEnd);
  } else if (!e.shiftKey) {
    // ---- 単一カーソル：スペース2つを挿入 ----
    replaceRange(s, end, INDENT);
  } else {
    // ---- 単一カーソル + Shift：現在行の行頭インデントを削除 ----
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    if (value.slice(lineStart, lineStart + 2) === INDENT) {
      replaceRange(lineStart, lineStart + 2, '');
      const caret = Math.max(lineStart, s - 2);
      textarea.setSelectionRange(caret, caret);
    }
  }

  updateHighlight();
  updateLineNumbers();
  saveCode();
  scheduleSyntaxCheck();
});

// スニペット検索
snippetSearch.addEventListener('input', () => renderSnippets(snippetSearch.value));

// ----------------------------------------------------------------
//  初期化（前回の編集内容があれば復元する）
// ----------------------------------------------------------------
const savedCode = loadSavedCode();
textarea.value = savedCode !== null ? savedCode : SAMPLE_CODE;
updateHighlight();
updateLineNumbers();
renderSnippets();
textarea.setSelectionRange(0, 0);
explainCurrentLine();
checkSyntax();
