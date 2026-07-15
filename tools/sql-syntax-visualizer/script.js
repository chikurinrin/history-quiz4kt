// ================================================================
//  SQL・HL ― SQLシンタックスハイライター + スニペット(Tab展開)
//  カーソル行/選択範囲の構文を左パネルで解説し、
//  PREFIX + Tab でスニペットを展開できるエディタ
// ================================================================

// ----------------------------------------------------------------
//  キーワード分類（カラー凡例と対応）
// ----------------------------------------------------------------
const SQL_DML = new Set([
  'SELECT','INSERT','UPDATE','DELETE','MERGE','CALL','EXEC','EXECUTE'
]);

const SQL_DDL = new Set([
  'CREATE','ALTER','DROP','TRUNCATE','TABLE','VIEW','INDEX','DATABASE',
  'SCHEMA','PROCEDURE','TRIGGER','SEQUENCE','ADD','COLUMN','MODIFY','RENAME'
]);

const SQL_CLAUSE = new Set([
  'FROM','WHERE','GROUP','BY','ORDER','HAVING','JOIN','INNER','LEFT','RIGHT',
  'FULL','CROSS','OUTER','ON','USING','AS','INTO','VALUES','SET','LIMIT',
  'OFFSET','FETCH','NEXT','ROWS','ROW','ONLY','TOP','UNION','EXCEPT',
  'INTERSECT','ALL','DISTINCT','WITH','RECURSIVE','CASE','WHEN','THEN',
  'ELSE','END','OVER','PARTITION','ASC','DESC','APPLY','PIVOT','UNPIVOT',
  'WINDOW','QUALIFY','RETURNING','TIES','PERCENT','BEGIN','TRY','CATCH',
  'DECLARE','RETURN','RETURNS','FOR','PATH','PRECEDING','FOLLOWING',
  'UNBOUNDED','CURRENT','RANGE','MATCHED','WHILE','GO','GROUPING','SETS',
  'ROLLUP','CUBE'
]);

const SQL_LOGIC = new Set([
  'AND','OR','NOT','IN','BETWEEN','LIKE','ILIKE','EXISTS','IS','ANY',
  'SOME','IF','XOR','REGEXP','ESCAPE'
]);

const SQL_TYPE = new Set([
  'INT','INTEGER','BIGINT','SMALLINT','TINYINT','DECIMAL','NUMERIC','FLOAT',
  'REAL','DOUBLE','PRECISION','CHAR','VARCHAR','NCHAR','NVARCHAR','TEXT',
  'DATE','TIME','DATETIME','DATETIME2','TIMESTAMP','BOOLEAN','BOOL','BLOB',
  'CLOB','JSON','UUID','SERIAL','MONEY','BIT','BINARY','VARBINARY',
  'INTERVAL','ENUM','MAX'
]);

const SQL_CONST = new Set(['NULL','TRUE','FALSE','UNKNOWN']);

const SQL_OPTION = new Set([
  'PRIMARY','KEY','FOREIGN','REFERENCES','UNIQUE','CHECK','CONSTRAINT',
  'DEFAULT','AUTO_INCREMENT','IDENTITY','CASCADE','RESTRICT','NULLS',
  'FIRST','LAST','TEMPORARY','TEMP','UNSIGNED','ZEROFILL','COLLATE',
  'CHARACTER','ENGINE','GENERATED','ALWAYS','STORED','VIRTUAL','REPLACE'
]);

// 関数名（直後に "(" が続くときだけ関数として着色する）
const SQL_FUNC = new Set([
  'COUNT','SUM','AVG','MIN','MAX','COALESCE','NULLIF','CAST','CONVERT',
  'ABS','ROUND','FLOOR','CEILING','CEIL','POWER','SQRT','MOD','SIGN','EXP',
  'LN','LOG','PI','RAND','RANDOM','TRUNCATE','TRUNC',
  'UPPER','LOWER','LENGTH','LEN','CHAR_LENGTH','DATALENGTH','SUBSTRING',
  'SUBSTR','TRIM','LTRIM','RTRIM','REPLACE','CONCAT','CONCAT_WS','LPAD',
  'RPAD','REPEAT','REPLICATE','REVERSE','LEFT','RIGHT','STUFF','INSERT',
  'CHARINDEX','POSITION','INSTR','LOCATE','FORMAT','QUOTENAME','CHARSET',
  'TO_CHAR','TO_DATE','TO_NUMBER','STR_TO_DATE',
  'NOW','GETDATE','SYSDATE','CURDATE','CURTIME','DATE_FORMAT','DATEDIFF',
  'DATE_ADD','DATE_SUB','DATEADD','TIMESTAMPDIFF','TIMESTAMPADD','EXTRACT',
  'YEAR','MONTH','DAY','HOUR','MINUTE','SECOND','DAYNAME','MONTHNAME',
  'DAYOFMONTH','DAYOFWEEK','DAYOFYEAR','WEEK','QUARTER','LAST_DAY',
  'TIMEDIFF','CONVERT_TZ','DATE','TIME',
  'ROW_NUMBER','RANK','DENSE_RANK','NTILE','LAG','LEAD','FIRST_VALUE',
  'LAST_VALUE','STRING_AGG','GROUP_CONCAT','LISTAGG','ARRAY_AGG',
  'JSON_OBJECT','JSON_ARRAYAGG','JSON_AGG','JSON_VALUE','JSON_EXTRACT',
  'IFNULL','ISNULL','NVL','NVL2','GREATEST','LEAST','IIF','CHOOSE',
  'DATABASE','VERSION','USER','DB_NAME','DEFAULT','GROUPING'
]);

// "(" が無くても関数扱いする擬似関数（ANSIのシステム値）
const SQL_PSEUDO_FUNC = new Set([
  'CURRENT_DATE','CURRENT_TIME','CURRENT_TIMESTAMP','CURRENT_USER',
  'SESSION_USER','SYSTEM_USER','LOCALTIME','LOCALTIMESTAMP','SYSDATE'
]);

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ----------------------------------------------------------------
//  トークナイザー（シンタックスハイライト）
// ----------------------------------------------------------------
// markSet: 強調したい文字の絶対位置（括弧の対応ハイライト用）
function highlightSql(code, markSet = null) {
  let html = '';
  let i = 0;
  const n = code.length;

  const emit = (type, value) => {
    const esc = escapeHtml(value);
    html += type === 'plain' ? esc : `<span class="tok-${type}">${esc}</span>`;
  };

  while (i < n) {
    const c = code[i];

    // 行コメント（--）
    if (c === '-' && code[i+1] === '-') {
      let j = i + 2;
      while (j < n && code[j] !== '\n') j++;
      emit('comment', code.slice(i, j));
      i = j; continue;
    }

    // ブロックコメント（/* */）
    if (c === '/' && code[i+1] === '*') {
      let j = i + 2;
      while (j < n - 1 && !(code[j] === '*' && code[j+1] === '/')) j++;
      j = Math.min(j + 2, n);
      emit('comment', code.slice(i, j));
      i = j; continue;
    }

    // プレースホルダ [[...]]
    if (c === '[' && code[i+1] === '[') {
      const close = code.indexOf(']]', i + 2);
      if (close !== -1 && !code.slice(i + 2, close).includes('\n')) {
        emit('placeholder', code.slice(i, close + 2));
        i = close + 2; continue;
      }
    }

    // 文字列（' / "）… '' の二重化エスケープに対応
    if (c === "'" || c === '"') {
      let j = i + 1;
      while (j < n) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === c) {
          if (code[j+1] === c) { j += 2; continue; } // '' エスケープ
          j++; break;
        }
        if (code[j] === '\n') break;
        j++;
      }
      emit('string', code.slice(i, j));
      i = j; continue;
    }

    // バッククォート識別子（MySQL）
    if (c === '`') {
      let j = i + 1;
      while (j < n && code[j] !== '`' && code[j] !== '\n') j++;
      if (j < n && code[j] === '`') j++;
      emit('identifier', code.slice(i, j));
      i = j; continue;
    }

    // 数値
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(code[i+1] ?? ''))) {
      let j = i;
      while (j < n && /[0-9_]/.test(code[j])) j++;
      if (j < n && code[j] === '.') { j++; while (j < n && /[0-9_]/.test(code[j])) j++; }
      if (j < n && /[eE]/.test(code[j])) {
        j++;
        if (j < n && /[+-]/.test(code[j])) j++;
        while (j < n && /[0-9]/.test(code[j])) j++;
      }
      emit('number', code.slice(i, j));
      i = j; continue;
    }

    // T-SQL 変数（@name）
    if (c === '@') {
      let j = i + 1;
      while (j < n && /[\w@]/.test(code[j])) j++;
      emit('option', code.slice(i, j));
      i = j; continue;
    }

    // 識別子・キーワード
    if (/[A-Za-z_]/.test(c)) {
      // NOT NULL は列制約としてオプション色にまとめる
      if (c === 'N' || c === 'n') {
        const notNull = code.slice(i, i + 12).match(/^NOT\s+NULL\b/i);
        if (notNull) {
          emit('option', notNull[0]);
          i += notNull[0].length; continue;
        }
      }

      let j = i;
      while (j < n && /\w/.test(code[j])) j++;
      const word = code.slice(i, j);
      const upper = word.toUpperCase();
      let k = j;
      while (k < n && (code[k] === ' ' || code[k] === '\t')) k++;
      const isCall = code[k] === '(';

      let type;
      if (isCall && SQL_FUNC.has(upper))    type = 'func';
      else if (SQL_PSEUDO_FUNC.has(upper))  type = 'func';
      else if (SQL_DML.has(upper))          type = 'dml';
      else if (SQL_DDL.has(upper))          type = 'ddl';
      else if (SQL_CLAUSE.has(upper))       type = 'clause';
      else if (SQL_LOGIC.has(upper))        type = 'logic';
      else if (SQL_TYPE.has(upper))         type = 'type';
      else if (SQL_CONST.has(upper))        type = 'const';
      else if (SQL_OPTION.has(upper))       type = 'option';
      else                                  type = 'identifier';

      emit(type, word);
      i = j; continue;
    }

    // 演算子
    if ('=<>!+-*/%|&~^'.includes(c)) {
      let j = i;
      while (j < n && '=<>!+-*/%|&~^'.includes(code[j])) j++;
      emit('operator', code.slice(i, j));
      i = j; continue;
    }

    // その他（括弧・カンマ・空白など）
    if (markSet && markSet.has(i)) {
      html += `<span class="bracket-match">${escapeHtml(c)}</span>`;
    } else {
      emit('plain', c);
    }
    i++;
  }
  return html;
}

// ----------------------------------------------------------------
//  構文チェック（括弧・引用符・コメントの対応）
//  pairs: 開き括弧位置 <-> 閉じ括弧位置（双方向、対応ハイライト用）
// ----------------------------------------------------------------
function scanSql(code) {
  const stack = [];
  const pairs = new Map();
  let error = null;
  let line = 1;
  let i = 0;
  const n = code.length;

  while (i < n && !error) {
    const c = code[i];

    if (c === '\n') { line++; i++; continue; }

    if (c === '-' && code[i+1] === '-') {
      while (i < n && code[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && code[i+1] === '*') {
      const startLine = line;
      i += 2;
      while (i < n - 1 && !(code[i] === '*' && code[i+1] === '/')) {
        if (code[i] === '\n') line++;
        i++;
      }
      if (i >= n - 1 && !(code[i] === '*' && code[i+1] === '/')) {
        error = { line: startLine, message: `${startLine}行目: ブロックコメント /* が閉じられていません` };
        break;
      }
      i += 2;
      continue;
    }
    if (c === "'" || c === '"') {
      const startLine = line;
      i++;
      let closed = false;
      while (i < n) {
        if (code[i] === '\\') { i += 2; continue; }
        if (code[i] === c) {
          if (code[i+1] === c) { i += 2; continue; } // '' エスケープ
          closed = true; i++; break;
        }
        if (code[i] === '\n') line++;
        i++;
      }
      if (!closed) {
        error = { line: startLine, message: `${startLine}行目: 引用符 ${c} が閉じられていません` };
      }
      continue;
    }

    if (c === '(') {
      stack.push({ line, i });
    } else if (c === ')') {
      const top = stack.pop();
      if (!top) {
        error = { line, message: `${line}行目: ')' に対応する '(' がありません` };
      } else {
        pairs.set(top.i, i);
        pairs.set(i, top.i);
      }
    }
    i++;
  }

  if (!error && stack.length > 0) {
    const top = stack[stack.length - 1];
    error = { line: top.line, message: `${top.line}行目: '(' が閉じられていません` };
  }
  return { pairs, error };
}

// ----------------------------------------------------------------
//  行解説ルール（カーソル行を上から順にマッチング）
// ----------------------------------------------------------------
const LINE_RULES = [
  { re: /^\s*--/,                             cat: 'コメント',
    desc: '-- から行末までがコメントです（実行には影響しません）。クエリの意図やメモを書き残すために使います。' },
  { re: /^\s*\/\*|\*\/\s*$/,                  cat: 'ブロックコメント',
    desc: '/* から */ までの複数行コメントです（実行には影響しません）。' },
  { re: /\[\[[^\]]*\]\]/,                     cat: 'プレースホルダ',
    desc: 'スニペットの入力位置です。Tab で次のプレースホルダへ移動でき、移動時に [[ ]] が外れて中身が選択されるので、そのままタイプして置き換えます。' },
  { re: /\bCREATE\s+TABLE\b/i,                cat: 'CREATE TABLE（DDL）',
    desc: 'テーブルを新規作成します。列ごとに「列名 データ型 制約」を定義します。IF NOT EXISTS を付けると既存時のエラーを回避できます（MySQL/PostgreSQL）。' },
  { re: /\bCREATE\s+(OR\s+REPLACE\s+)?VIEW\b/i, cat: 'CREATE VIEW（DDL）',
    desc: 'SELECT文に名前を付けて仮想的な表（ビュー）として保存します。複雑なクエリの再利用に便利です。' },
  { re: /\bCREATE\s+(UNIQUE\s+)?INDEX\b/i,    cat: 'CREATE INDEX（DDL）',
    desc: '検索を高速化するインデックスを作成します。WHERE や JOIN で頻繁に使う列に付けると効果的です。' },
  { re: /\bCREATE\s+PROCEDURE\b/i,            cat: 'CREATE PROCEDURE（DDL）',
    desc: 'ストアドプロシージャ（DB内に保存する処理のまとまり）を定義します。構文はDB製品ごとに差が大きい点に注意します。' },
  { re: /\bALTER\s+TABLE\b/i,                 cat: 'ALTER TABLE（DDL）',
    desc: '既存テーブルの定義を変更します。ADD COLUMN で列追加、DROP COLUMN で列削除などを行います。' },
  { re: /\bDROP\s+(TABLE|VIEW|INDEX|DATABASE)\b/i, cat: 'DROP（DDL）',
    desc: 'テーブルやビューなどを削除します。取り消せない操作なので実行前に対象をよく確認します。' },
  { re: /\bINSERT\s+INTO\b/i,                 cat: 'INSERT文（行の追加）',
    desc: 'テーブルに新しい行を追加します。列リストと VALUES の値は数・順序・型を一致させます。' },
  { re: /^\s*VALUES\b/i,                      cat: 'VALUES句',
    desc: 'INSERT で追加する値を指定します。(値, 値, ...) を複数並べると複数行を一度に追加できます。' },
  { re: /^\s*UPDATE\b/i,                      cat: 'UPDATE文（行の更新）',
    desc: '既存の行を更新します。WHERE を忘れると全行が更新されるため、先に同じ条件の SELECT で対象を確認するのが安全です。' },
  { re: /^\s*SET\b/i,                         cat: 'SET句',
    desc: 'UPDATE で変更する「列 = 値」を指定します。カンマ区切りで複数列を同時に更新できます。' },
  { re: /\bDELETE\s+FROM\b/i,                 cat: 'DELETE文（行の削除）',
    desc: '行を削除します。WHERE を忘れると全行が削除されるため、必ず条件を確認してから実行します。' },
  { re: /\bMERGE\b/i,                         cat: 'MERGE文（UPSERT）',
    desc: 'キーが一致すれば UPDATE、無ければ INSERT を1文で行います（SQL Server / Oracle）。MySQLは ON DUPLICATE KEY UPDATE を使います。' },
  { re: /^\s*WITH\b/i,                        cat: 'WITH句（CTE）',
    desc: '共通テーブル式（CTE）です。サブクエリに名前を付けて後続の SELECT から参照でき、入れ子を減らして読みやすくなります。' },
  { re: /\bOVER\s*\(/i,                       cat: 'ウィンドウ関数',
    desc: 'OVER() を伴う関数はウィンドウ関数です。GROUP BY と違い行を集約せず、行ごとに順位・累計・前後行の値などを計算できます。' },
  { re: /\b(LEFT|RIGHT|FULL)\s+(OUTER\s+)?JOIN\b/i, cat: '外部結合（OUTER JOIN）',
    desc: '結合相手が見つからない行も残す結合です。LEFT JOIN は左表の全行を残し、相手が無い列は NULL になります。' },
  { re: /\bCROSS\s+JOIN\b/i,                  cat: '交差結合（CROSS JOIN）',
    desc: '2つの表の全組み合わせ（直積）を作ります。行数は「左の行数 × 右の行数」になるため件数に注意します。' },
  { re: /\b(INNER\s+)?JOIN\b/i,               cat: '内部結合（INNER JOIN）',
    desc: 'ON の条件が一致する行だけを結合します。一致しない行は結果から除外されます。' },
  { re: /^\s*ON\b/i,                          cat: '結合条件（ON句）',
    desc: 'JOIN の結合条件です。通常は「左表のキー = 右表のキー」の形で外部キーと主キーを対応付けます。' },
  { re: /^\s*SELECT\b/i,                      cat: 'SELECT句',
    desc: '取得する列を指定します。* は全列、AS で列に別名を付けられます。実行順序は FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY です。' },
  { re: /^\s*FROM\b/i,                        cat: 'FROM句',
    desc: 'データの取得元テーブルを指定します。AS で別名（エイリアス）を付けると、他の句から短い名前で参照できます。' },
  { re: /^\s*WHERE\b/i,                       cat: 'WHERE句（絞り込み）',
    desc: '行の絞り込み条件です。集約前の行に適用されます（集約後の絞り込みは HAVING を使います）。' },
  { re: /^\s*(AND|OR)\b/i,                    cat: '条件の連結（AND / OR）',
    desc: '複数の条件を連結します。AND は「両方満たす」、OR は「どちらかを満たす」。優先順位は AND が先なので、OR を混ぜるときは括弧で意図を明確にします。' },
  { re: /\bGROUP\s+BY\b/i,                    cat: 'GROUP BY句（グループ化）',
    desc: '指定した列の値ごとに行をまとめ、COUNT / SUM などの集計関数と組み合わせます。SELECT に書ける列は「GROUP BY した列」か「集計関数」だけです。' },
  { re: /^\s*HAVING\b/i,                      cat: 'HAVING句（集約後の絞り込み）',
    desc: 'GROUP BY で集約した結果に対する絞り込みです。WHERE は集約前、HAVING は集約後という違いがあります。' },
  { re: /\bORDER\s+BY\b/i,                    cat: 'ORDER BY句（並び替え）',
    desc: '結果の並び順を指定します。ASC（昇順・省略可）/ DESC（降順）。SELECT で付けた別名も指定できます。' },
  { re: /\b(LIMIT|OFFSET)\b/i,                cat: 'LIMIT / OFFSET（件数制限）',
    desc: 'LIMIT で取得件数を制限し、OFFSET で先頭から読み飛ばします。ページングの定番で、ORDER BY と必ずセットで使います。' },
  { re: /\bFETCH\s+NEXT\b|\bTOP\b/i,          cat: '件数制限（TOP / FETCH）',
    desc: 'SQL Server では TOP(n) または OFFSET...FETCH NEXT n ROWS ONLY で件数を制限します。' },
  { re: /\bUNION\s+ALL\b/i,                   cat: 'UNION ALL（集合演算）',
    desc: '2つの SELECT 結果を重複を残したまま縦に連結します。重複除去が不要なら UNION より高速です。' },
  { re: /\bUNION\b/i,                         cat: 'UNION（集合演算）',
    desc: '2つの SELECT 結果を縦に連結し、重複行を除去します。列の数と型を揃える必要があります。' },
  { re: /\bCASE\b|\bWHEN\b.*\bTHEN\b/i,       cat: 'CASE式（条件分岐）',
    desc: 'SQLの中で条件分岐して値を返します。CASE WHEN 条件 THEN 値 ELSE 値 END の形で、SELECT句・ORDER BY・集計の中でも使えます。' },
  { re: /\bBETWEEN\b/i,                       cat: 'BETWEEN（範囲条件）',
    desc: '「値 BETWEEN A AND B」は A 以上 B 以下（両端を含む）の範囲条件です。' },
  { re: /\bNOT\s+EXISTS\b|\bEXISTS\b/i,       cat: 'EXISTS（存在チェック）',
    desc: 'サブクエリが1行でも返すか（EXISTS）／1行も返さないか（NOT EXISTS）を判定します。相関サブクエリと組み合わせるのが定番です。' },
  { re: /\bLIKE\b/i,                          cat: 'LIKE（パターン一致）',
    desc: '文字列のパターン一致です。% は任意の0文字以上、_ は任意の1文字。前方一致 \'abc%\' はインデックスが効きますが、部分一致 \'%abc%\' は効きません。' },
  { re: /\bIN\s*\(/i,                         cat: 'IN（複数値の一致）',
    desc: '「列 IN (A, B, C)」は列が A・B・C のいずれかに一致すれば真です。OR を並べるより簡潔に書けます。' },
  { re: /\b(INT|INTEGER|BIGINT|VARCHAR|NVARCHAR|CHAR|TEXT|DATE|DATETIME|TIMESTAMP|DECIMAL|NUMERIC|BOOLEAN)\b/i, cat: '列定義（データ型）',
    desc: '「列名 データ型 制約」の形の列定義です。PRIMARY KEY は主キー、NOT NULL は必須、DEFAULT は省略時の既定値を表します。' },
  { re: /^\s*[();,]*\s*$/,                    cat: '区切り・括弧',
    desc: 'SQL文の区切りです。文の終わりにはセミコロン ; を付けます。開き括弧と閉じ括弧の対応に注意して読みましょう。' },
];

function findLineRule(line) {
  const t = line.trim();
  if (!t) return null;
  for (const rule of LINE_RULES) {
    if (rule.re.test(line)) return rule;
  }
  return { cat: '式・句', desc: '一般的な式（句）です。キーワードを含む行やドラッグ選択で、より詳しい説明が表示されます。' };
}

// ----------------------------------------------------------------
//  選択範囲の解説辞書（フレーズ → キーワード の順で検索）
// ----------------------------------------------------------------
const EXP_PHRASES = {
  'GROUP BY':   { title: 'GROUP BY', body: '指定列の値ごとに行をグループ化し、グループ単位で集計します。SELECT に書けるのは GROUP BY した列と集計関数だけです。', syntax: 'SELECT dept, COUNT(*) AS cnt\nFROM employees\nGROUP BY dept;' },
  'ORDER BY':   { title: 'ORDER BY', body: '結果の並び順を指定します。ASC は昇順（省略可）、DESC は降順。複数列をカンマ区切りで指定できます。', syntax: 'SELECT * FROM products\nORDER BY price DESC, name ASC;' },
  'INNER JOIN': { title: 'INNER JOIN（内部結合）', body: 'ON の条件が一致する行だけを結合します。どちらかに存在しない行は結果に含まれません。', syntax: 'SELECT *\nFROM orders AS o\nINNER JOIN users AS u\n  ON o.user_id = u.id;' },
  'LEFT JOIN':  { title: 'LEFT JOIN（左外部結合）', body: '左側のテーブルの全行を残し、右側に一致する行が無ければ NULL で埋めます。「注文が無いユーザーも一覧に出す」ような場面で使います。', syntax: 'SELECT u.name, o.id\nFROM users AS u\nLEFT JOIN orders AS o\n  ON u.id = o.user_id;' },
  'RIGHT JOIN': { title: 'RIGHT JOIN（右外部結合）', body: '右側のテーブルの全行を残す外部結合です。テーブルの順序を入れ替えれば LEFT JOIN で同じことができるため、LEFT JOIN に統一するのが読みやすいです。', syntax: 'SELECT *\nFROM a\nRIGHT JOIN b ON a.id = b.a_id;\n-- ≒ FROM b LEFT JOIN a ...' },
  'FULL JOIN':  { title: 'FULL OUTER JOIN（完全外部結合）', body: '両方のテーブルの全行を残し、一致しない側を NULL で埋めます。MySQL には無いため LEFT JOIN と RIGHT JOIN の UNION で代用します。', syntax: 'SELECT *\nFROM a\nFULL OUTER JOIN b ON a.id = b.a_id;' },
  'CROSS JOIN': { title: 'CROSS JOIN（交差結合）', body: '2つの表の全組み合わせ（直積）を作ります。結果は「左の行数 × 右の行数」件になります。', syntax: 'SELECT *\nFROM sizes\nCROSS JOIN colors;' },
  'INSERT INTO':{ title: 'INSERT INTO', body: 'テーブルに行を追加します。列リストと VALUES は数・順序・型を一致させます。VALUES を複数並べると複数行を一括追加できます。', syntax: "INSERT INTO users (name, email)\nVALUES ('佐藤', 'sato@example.com');" },
  'DELETE FROM':{ title: 'DELETE FROM', body: '条件に一致する行を削除します。WHERE を忘れると全行が消えるため、先に同条件の SELECT で件数を確認するのが安全です。', syntax: 'DELETE FROM logs\nWHERE created_at < \'2024-01-01\';' },
  'CREATE TABLE':{ title: 'CREATE TABLE', body: 'テーブルを新規作成します。列ごとに「列名 データ型 制約」を定義します。', syntax: 'CREATE TABLE users (\n  id   INT PRIMARY KEY,\n  name VARCHAR(100) NOT NULL\n);' },
  'NOT NULL':   { title: 'NOT NULL制約', body: 'その列に NULL（値なし）を入れることを禁止する制約です。必須項目の列に付けます。', syntax: 'name VARCHAR(100) NOT NULL' },
  'PRIMARY KEY':{ title: 'PRIMARY KEY（主キー）', body: '行を一意に識別する列です。重複と NULL が禁止され、自動的にインデックスが作られます。', syntax: 'id INT PRIMARY KEY\n-- または表制約として\nPRIMARY KEY (id)' },
  'FOREIGN KEY':{ title: 'FOREIGN KEY（外部キー）', body: '他のテーブルの主キーを参照する制約です。参照先に存在しない値の登録を防ぎ、テーブル間の整合性を保ちます。', syntax: 'FOREIGN KEY (user_id)\n  REFERENCES users(id)' },
  'UNION ALL':  { title: 'UNION ALL', body: '2つの SELECT 結果を重複を残したまま連結します。重複除去のコストが無い分 UNION より高速です。', syntax: 'SELECT name FROM current_users\nUNION ALL\nSELECT name FROM old_users;' },
  'IS NULL':    { title: 'IS NULL', body: 'NULL かどうかの判定は = ではなく IS NULL を使います（NULL = NULL は真になりません）。', syntax: 'SELECT * FROM users\nWHERE deleted_at IS NULL;' },
  'IS NOT NULL':{ title: 'IS NOT NULL', body: 'NULL でないことの判定です。= や <> では NULL を正しく判定できない点に注意します。', syntax: 'SELECT * FROM orders\nWHERE shipped_at IS NOT NULL;' },
  'NOT IN':     { title: 'NOT IN', body: 'リストのどれにも一致しない行を選びます。リストやサブクエリに NULL が含まれると1行も返らなくなるため、NOT EXISTS の方が安全です。', syntax: "SELECT * FROM users\nWHERE role NOT IN ('guest', 'bot');" },
  'NOT EXISTS': { title: 'NOT EXISTS', body: 'サブクエリが1行も返さないときに真になります。「注文が1件も無いユーザー」のような否定の存在チェックに使います。', syntax: 'SELECT * FROM users AS u\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders AS o\n  WHERE o.user_id = u.id\n);' },
  'NOT LIKE':   { title: 'NOT LIKE', body: 'パターンに一致しない行を選びます。% は任意の0文字以上、_ は任意の1文字です。', syntax: "SELECT * FROM users\nWHERE email NOT LIKE '%@example.com';" },
};

const EXP_KW = {
  'SELECT':   { title: 'SELECT', body: 'テーブルからデータを取得する基本のDML文です。取得する列を指定し、* で全列を取得します。実行順序は FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT です。', syntax: 'SELECT id, name\nFROM users\nWHERE is_active = TRUE;' },
  'FROM':     { title: 'FROM', body: 'データの取得元テーブル（またはサブクエリ・ビュー）を指定します。AS で別名を付けると他の句から短く参照できます。', syntax: 'SELECT u.name\nFROM users AS u;' },
  'WHERE':    { title: 'WHERE', body: '行の絞り込み条件を指定します。集約前の行に適用される点が HAVING との違いです。', syntax: "SELECT * FROM orders\nWHERE status = 'paid'\n  AND amount >= 1000;" },
  'HAVING':   { title: 'HAVING', body: 'GROUP BY で集約した後の結果を絞り込みます。集計関数を条件に使えます。', syntax: 'SELECT dept, COUNT(*) AS cnt\nFROM employees\nGROUP BY dept\nHAVING COUNT(*) >= 5;' },
  'JOIN':     { title: 'JOIN（結合）', body: '複数のテーブルをキーで結び付けて1つの結果にします。INNER（一致のみ）/ LEFT・RIGHT・FULL（外部結合）/ CROSS（直積）があります。', syntax: 'SELECT *\nFROM a\nINNER JOIN b ON a.id = b.a_id;' },
  'ON':       { title: 'ON（結合条件）', body: 'JOIN の結合条件を指定します。通常は「外部キー = 主キー」の形です。', syntax: 'LEFT JOIN orders AS o\n  ON o.user_id = u.id' },
  'AS':       { title: 'AS（別名）', body: 'テーブルや列に別名（エイリアス）を付けます。列の別名は結果の見出しになり、ORDER BY からも参照できます。', syntax: 'SELECT COUNT(*) AS cnt\nFROM users AS u;' },
  'DISTINCT': { title: 'DISTINCT', body: '結果から重複行を除去します。COUNT(DISTINCT 列) で「異なり数」を数えられます。', syntax: 'SELECT DISTINCT dept FROM employees;\nSELECT COUNT(DISTINCT user_id) FROM orders;' },
  'LIMIT':    { title: 'LIMIT', body: '取得する行数を制限します（MySQL / PostgreSQL）。OFFSET と組み合わせてページングに使います。SQL Server は TOP / FETCH NEXT を使います。', syntax: 'SELECT * FROM products\nORDER BY id\nLIMIT 20 OFFSET 40;  -- 3ページ目' },
  'OFFSET':   { title: 'OFFSET', body: '先頭から指定件数を読み飛ばします。ページングでは「(ページ番号 - 1) × ページサイズ」を指定します。', syntax: 'LIMIT 20 OFFSET 40' },
  'TOP':      { title: 'TOP（SQL Server）', body: '先頭から指定件数だけ取得します。WITH TIES を付けると ORDER BY の同率の行も含めます。', syntax: 'SELECT TOP (10) *\nFROM sales\nORDER BY amount DESC;' },
  'UPDATE':   { title: 'UPDATE', body: '既存の行を更新するDML文です。WHERE を忘れると全行が更新されます。実行前に同条件の SELECT で対象を確認する習慣をつけましょう。', syntax: "UPDATE users\nSET status = 'active'\nWHERE id = 1;" },
  'DELETE':   { title: 'DELETE', body: '行を削除するDML文です。WHERE を忘れると全行が削除されます。全行削除が目的なら TRUNCATE TABLE の方が高速です。', syntax: 'DELETE FROM logs\nWHERE created_at < \'2024-01-01\';' },
  'INSERT':   { title: 'INSERT', body: 'テーブルに行を追加するDML文です。SELECT の結果をそのまま挿入する INSERT ... SELECT も使えます。', syntax: "INSERT INTO users (name) VALUES ('田中');\nINSERT INTO backup SELECT * FROM users;" },
  'VALUES':   { title: 'VALUES', body: 'INSERT で追加する値を指定します。複数の (…) をカンマで並べると複数行を一括追加できます。', syntax: "INSERT INTO tags (name)\nVALUES ('a'), ('b'), ('c');" },
  'SET':      { title: 'SET', body: 'UPDATE で「列 = 新しい値」を指定します。値には式や他の列も使えます。', syntax: 'UPDATE products\nSET price = price * 1.1,\n    updated_at = CURRENT_TIMESTAMP;' },
  'MERGE':    { title: 'MERGE（UPSERT）', body: 'キーが一致すれば UPDATE、無ければ INSERT を1文で行います（SQL Server / Oracle / 標準SQL）。MySQL は INSERT ... ON DUPLICATE KEY UPDATE で代用します。', syntax: 'MERGE INTO t USING s ON t.id = s.id\nWHEN MATCHED THEN UPDATE SET t.v = s.v\nWHEN NOT MATCHED THEN INSERT (id, v) VALUES (s.id, s.v);' },
  'CREATE':   { title: 'CREATE（DDL）', body: 'テーブル・ビュー・インデックスなどのデータベースオブジェクトを作成するDDL文です。', syntax: 'CREATE TABLE ...;\nCREATE VIEW ... AS SELECT ...;\nCREATE INDEX idx_name ON t(col);' },
  'ALTER':    { title: 'ALTER（DDL）', body: '既存オブジェクトの定義を変更するDDL文です。列の追加・削除・型変更などを行います。', syntax: 'ALTER TABLE users\n  ADD COLUMN age INT;' },
  'DROP':     { title: 'DROP（DDL）', body: 'テーブルやビューなどを削除するDDL文です。データごと消え、基本的に取り消せません。', syntax: 'DROP TABLE IF EXISTS temp_data;' },
  'TRUNCATE': { title: 'TRUNCATE', body: 'テーブルの全行を高速に削除します。DELETE と違い1行ずつ処理せず、多くのDBでロールバックや WHERE 指定ができません。', syntax: 'TRUNCATE TABLE access_logs;' },
  'WITH':     { title: 'WITH（CTE）', body: '共通テーブル式（CTE）を定義します。サブクエリに名前を付けて再利用でき、WITH RECURSIVE で階層データも辿れます。', syntax: 'WITH active AS (\n  SELECT * FROM users WHERE is_active = TRUE\n)\nSELECT COUNT(*) FROM active;' },
  'UNION':    { title: 'UNION', body: '2つの SELECT 結果を縦に連結し重複を除去します。重複を残す場合は UNION ALL（高速）を使います。列数と型を揃える必要があります。', syntax: 'SELECT name FROM a\nUNION\nSELECT name FROM b;' },
  'CASE':     { title: 'CASE式', body: 'SQLの中で条件分岐して値を返します。ELSE を省略して一致しない場合は NULL になります。集計関数の中に入れて「条件付き集計」にも使えます。', syntax: "SELECT\n  CASE WHEN score >= 80 THEN '合格'\n       WHEN score >= 60 THEN '再試'\n       ELSE '不合格' END AS result\nFROM exams;" },
  'WHEN':     { title: 'WHEN / THEN', body: 'CASE式の分岐条件（WHEN）とその結果（THEN）です。上から順に評価され、最初に一致した THEN の値が返ります。', syntax: "CASE WHEN qty = 0 THEN '在庫なし'\n     ELSE '在庫あり' END" },
  'EXISTS':   { title: 'EXISTS', body: 'サブクエリが1行でも返せば真になります。相関サブクエリと組み合わせ、「関連する行が存在するか」の判定に使います。IN より NULL に強いのが利点です。', syntax: 'SELECT * FROM users AS u\nWHERE EXISTS (\n  SELECT 1 FROM orders AS o\n  WHERE o.user_id = u.id\n);' },
  'IN':       { title: 'IN', body: '「列 IN (A, B, C)」でいずれかに一致すれば真です。サブクエリも指定できますが、大きなデータでは EXISTS の方が速いことがあります。', syntax: "WHERE role IN ('admin', 'editor')\nWHERE id IN (SELECT user_id FROM orders)" },
  'BETWEEN':  { title: 'BETWEEN', body: '「値 BETWEEN A AND B」は A 以上 B 以下（両端含む）です。日付範囲では「>= AND <」の半開区間の方が安全な場合があります。', syntax: 'WHERE price BETWEEN 1000 AND 5000' },
  'LIKE':     { title: 'LIKE', body: '文字列のパターン一致です。% は0文字以上、_ は任意の1文字。前方一致はインデックスが効き、部分一致（%...%）は効きません。', syntax: "WHERE name LIKE '佐藤%'   -- 前方一致\nWHERE email LIKE '%@gmail.com' -- 後方一致" },
  'IS':       { title: 'IS（NULL判定）', body: 'NULL の判定に使います。NULL は = で比較できず、IS NULL / IS NOT NULL を使う必要があります。', syntax: 'WHERE deleted_at IS NULL' },
  'NULL':     { title: 'NULL', body: '「値が存在しない」ことを表す特別な状態です。NULL を含む計算や比較の結果は NULL になり、= NULL は真になりません。COALESCE で既定値に置き換えられます。', syntax: 'WHERE memo IS NULL\nSELECT COALESCE(memo, \'(未入力)\') FROM t;' },
  'AND':      { title: 'AND', body: '両方の条件を満たすときに真になる論理演算子です。OR より優先されるため、混在させるときは括弧で意図を明確にします。', syntax: "WHERE status = 'paid'\n  AND (region = '東京' OR region = '大阪')" },
  'OR':       { title: 'OR', body: 'どちらかの条件を満たせば真になる論理演算子です。同じ列への OR の連続は IN で書き換えると簡潔です。', syntax: "WHERE role = 'admin' OR role = 'editor'\n-- ≒ WHERE role IN ('admin', 'editor')" },
  'NOT':      { title: 'NOT', body: '条件を否定します。NOT IN は NULL を含むと空になる罠があるため、NOT EXISTS が安全です。', syntax: 'WHERE NOT is_deleted\nWHERE ranking NOT BETWEEN 1 AND 10' },
  'COUNT':    { title: 'COUNT()', body: '行数を数える集計関数です。COUNT(*) は全行、COUNT(列) は NULL を除いた件数、COUNT(DISTINCT 列) は異なり数を返します。', syntax: 'SELECT COUNT(*), COUNT(phone),\n       COUNT(DISTINCT dept)\nFROM employees;' },
  'SUM':      { title: 'SUM()', body: '数値列の合計を返す集計関数です。NULL は無視されます。全行が NULL または0行のとき結果は NULL になるため COALESCE と併用します。', syntax: 'SELECT COALESCE(SUM(amount), 0)\nFROM orders;' },
  'AVG':      { title: 'AVG()', body: '数値列の平均を返す集計関数です。NULL の行は分母にも含まれない点に注意します（0扱いしたい場合は COALESCE で0に変換してから）。', syntax: 'SELECT AVG(score) FROM exams;\nSELECT AVG(COALESCE(score, 0)) FROM exams;' },
  'MIN':      { title: 'MIN()', body: '最小値を返す集計関数です。日付や文字列にも使えます。', syntax: 'SELECT MIN(created_at) FROM orders;' },
  'MAX':      { title: 'MAX()', body: '最大値を返す集計関数です。「最新の日時」を取るのによく使います。', syntax: 'SELECT MAX(placed_at) AS last_order\nFROM orders;' },
  'COALESCE': { title: 'COALESCE()', body: '引数を左から評価し、最初の NULL でない値を返します。NULL を既定値に置き換える定番の関数です。', syntax: "SELECT COALESCE(nickname, name, '名無し')\nFROM users;" },
  'NULLIF':   { title: 'NULLIF()', body: '2つの値が等しければ NULL、違えば1つ目の値を返します。0除算の回避によく使います。', syntax: 'SELECT total / NULLIF(cnt, 0)\nFROM stats;  -- cnt=0 なら NULL' },
  'CAST':     { title: 'CAST()', body: '値を指定した型に変換します（標準SQL）。文字列⇔数値、文字列→日付などの変換に使います。', syntax: "CAST('123' AS INT)\nCAST(price AS DECIMAL(10, 2))" },
  'CONVERT':  { title: 'CONVERT()', body: '型変換関数です。SQL Server は CONVERT(型, 値[, スタイル])、MySQL は CONVERT(値, 型) と引数の順序が異なります。', syntax: 'CONVERT(VARCHAR(10), GETDATE(), 111)  -- SQL Server\nCONVERT(price, DECIMAL(10, 2))         -- MySQL' },
  'ROW_NUMBER': { title: 'ROW_NUMBER()', body: 'ウィンドウ関数。並び順に沿って 1, 2, 3… と連番を振ります。PARTITION BY を付けるとグループごとに1から振り直します。', syntax: 'ROW_NUMBER() OVER (\n  PARTITION BY dept\n  ORDER BY salary DESC\n) AS rn' },
  'RANK':     { title: 'RANK()', body: 'ウィンドウ関数。同率に同じ順位を付け、次の順位を飛ばします（1,1,3…）。飛ばさない DENSE_RANK（1,1,2…）もあります。', syntax: 'RANK() OVER (ORDER BY score DESC) AS rank_no' },
  'LAG':      { title: 'LAG() / LEAD()', body: 'ウィンドウ関数。LAG は前の行、LEAD は次の行の値を取得します。前日比・前月比の計算に使います。', syntax: 'sales - LAG(sales, 1) OVER (ORDER BY ymd)\n  AS diff_from_prev' },
  'OVER':     { title: 'OVER句', body: 'ウィンドウ関数の適用範囲を定義します。PARTITION BY でグループ分け、ORDER BY で並び順、ROWS BETWEEN で対象行の範囲を指定します。', syntax: 'SUM(amount) OVER (\n  PARTITION BY user_id\n  ORDER BY placed_at\n) AS running_total' },
  'PARTITION': { title: 'PARTITION BY', body: 'ウィンドウ関数の計算をグループごとに区切ります。GROUP BY と違い、行はまとめられず全行が残ります。', syntax: 'AVG(salary) OVER (PARTITION BY dept)\n  AS dept_avg' },
  'CURRENT_TIMESTAMP': { title: 'CURRENT_TIMESTAMP', body: '現在の日時を返します（標準SQL）。列の DEFAULT に指定して登録日時を自動記録するのが定番です。MySQL: NOW() / SQL Server: GETDATE() も同等です。', syntax: 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
  'CURRENT_DATE': { title: 'CURRENT_DATE', body: '現在の日付を返します（標準SQL）。MySQL は CURDATE() も使えます。', syntax: "WHERE order_date = CURRENT_DATE" },
  'VARCHAR':  { title: 'VARCHAR（可変長文字列）', body: '最大長を指定する可変長文字列型です。VARCHAR(255) なら最大255文字。固定長の CHAR と違い、実際の長さ分だけ格納されます。', syntax: 'name VARCHAR(100) NOT NULL' },
  'INT':      { title: 'INT（整数型）', body: '整数型です。より大きい値は BIGINT、小さい値は SMALLINT / TINYINT を使います。ID列には自動採番（AUTO_INCREMENT / IDENTITY / SERIAL）を組み合わせます。', syntax: 'id INT PRIMARY KEY AUTO_INCREMENT  -- MySQL' },
  'DECIMAL':  { title: 'DECIMAL（固定小数点数）', body: 'DECIMAL(全体桁数, 小数桁数) の固定小数点型です。金額には誤差の出る FLOAT ではなく DECIMAL を使います。', syntax: 'price DECIMAL(10, 2)  -- 最大8桁.2桁' },
  'TIMESTAMP':{ title: 'TIMESTAMP（日時型）', body: '日付と時刻を保持する型です。DEFAULT CURRENT_TIMESTAMP で登録日時を自動記録できます。', syntax: 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
  'DEFAULT':  { title: 'DEFAULT（既定値）', body: 'INSERT で値を省略したときに使われる既定値を定義します。', syntax: "status VARCHAR(20) DEFAULT 'draft'" },
  'INDEX':    { title: 'INDEX（インデックス）', body: '検索を高速化するための索引です。WHERE / JOIN / ORDER BY で頻繁に使う列に作りますが、更新コストが増えるため付けすぎに注意します。', syntax: 'CREATE INDEX idx_orders_user\n  ON orders(user_id);' },
  'VIEW':     { title: 'VIEW（ビュー）', body: 'SELECT文に名前を付けた仮想的な表です。複雑なクエリを部品化でき、参照権限の制御にも使えます。', syntax: 'CREATE VIEW active_users AS\nSELECT * FROM users WHERE is_active = TRUE;' },
  'PIVOT':    { title: 'PIVOT（縦→横変換）', body: '行の値を列見出しに変換して集計します（SQL Server / Oracle）。他のDBでは CASE式 + 集計関数で同じ結果を作れます。', syntax: 'PIVOT (SUM(qty) FOR month IN ([1], [2], [3])) AS p' },
  'UNPIVOT':  { title: 'UNPIVOT（横→縦変換）', body: '複数の列を「項目名と値」の行に変換します（SQL Server / Oracle）。他のDBでは UNION ALL で代用します。', syntax: 'UNPIVOT (val FOR item IN (col1, col2)) AS u' },
  'APPLY':    { title: 'APPLY（SQL Server）', body: '左の各行に対して右側のサブクエリを実行して結合します。CROSS APPLY は一致行のみ、OUTER APPLY は無くても左行を残します。「グループごとの上位N件」の定番です。', syntax: 'FROM users AS u\nCROSS APPLY (\n  SELECT TOP (3) * FROM orders o\n  WHERE o.user_id = u.id\n  ORDER BY o.placed_at DESC\n) AS recent' },
  'STRING_AGG': { title: 'STRING_AGG()', body: 'グループ内の文字列を区切り文字で連結します（SQL Server / PostgreSQL）。MySQL は GROUP_CONCAT、Oracle は LISTAGG を使います。', syntax: "SELECT dept, STRING_AGG(name, ', ')\nFROM employees\nGROUP BY dept;" },
  'SUBSTRING': { title: 'SUBSTRING()', body: '文字列の一部を取り出します。開始位置は1始まりです。', syntax: "SUBSTRING('20240115', 1, 4)  -- '2024'" },
  'TRIM':     { title: 'TRIM()', body: '文字列の前後の空白を除去します。片側だけの LTRIM / RTRIM もあります。', syntax: "TRIM('  hello  ')  -- 'hello'" },
  'BEGIN':    { title: 'BEGIN / END', body: '複数の文をまとめるブロックです（SQL Server / プロシージャ内）。トランザクションの BEGIN TRANSACTION とは別物です。', syntax: 'BEGIN\n  UPDATE ...;\n  INSERT ...;\nEND;' },
  'DECLARE':  { title: 'DECLARE（変数宣言）', body: 'プロシージャやバッチ内で変数を宣言します（SQL Server は @付き）。', syntax: "DECLARE @total INT = 0;\nSELECT @total = COUNT(*) FROM users;" },
};

function findSelectionExp(sel) {
  const t = sel.trim().toUpperCase().replace(/\s+/g, ' ');
  if (!t) return null;

  // 1. フレーズの完全一致 → 単語の完全一致
  if (EXP_PHRASES[t]) return EXP_PHRASES[t];
  if (EXP_KW[t]) return EXP_KW[t];

  // 2. フレーズを含むか
  for (const [ph, info] of Object.entries(EXP_PHRASES)) {
    if (new RegExp(`\\b${ph}\\b`).test(t)) return info;
  }

  // 3. キーワードを含むか
  for (const [kw, info] of Object.entries(EXP_KW)) {
    if (new RegExp(`\\b${kw}\\b`).test(t)) return info;
  }
  return null;
}

// ----------------------------------------------------------------
//  SELECT文の論理実行順序ガイド
//  カーソルを置いた句が「何番目に評価されるか」を説明エリアに表示する
// ----------------------------------------------------------------
const EXEC_ORDER = [
  { key: 'FROM',     label: 'FROM/JOIN' },
  { key: 'WHERE',    label: 'WHERE' },
  { key: 'GROUP',    label: 'GROUP BY' },
  { key: 'HAVING',   label: 'HAVING' },
  { key: 'SELECT',   label: 'SELECT' },
  { key: 'DISTINCT', label: 'DISTINCT' },
  { key: 'ORDER',    label: 'ORDER BY' },
  { key: 'LIMIT',    label: 'LIMIT' },
];

const EXEC_ORDER_NOTES = {
  FROM:     'まず対象テーブルを特定し、JOIN で結合します。すべての起点です。',
  WHERE:    '結合した行を絞り込みます。集約（GROUP BY）より前に評価されるため、集計関数はここでは使えません。',
  GROUP:    '残った行をグループにまとめます。これ以降は「グループ単位」で処理が進みます。',
  HAVING:   '集約したグループを絞り込みます。COUNT() などの集計関数を条件に使えるのはこのためです。',
  SELECT:   '列や式を評価します。AS の別名が付くのはこの段階なので、WHERE では別名を使えません。',
  DISTINCT: 'SELECT の結果から重複行を除去します。',
  ORDER:    '結果を並び替えます。SELECT より後に評価されるため、付けた別名を指定できます。',
  LIMIT:    '最後に返す件数を制限します（TOP / FETCH NEXT も同じ位置づけです）。',
};

function execOrderHtml(stepKey) {
  const pos = EXEC_ORDER.findIndex((s) => s.key === stepKey) + 1;
  if (pos === 0) return '';
  const chips = EXEC_ORDER.map((s, idx) => {
    const cur = s.key === stepKey ? ' current' : '';
    return `<span class="order-step${cur}"><span class="order-no">${idx + 1}</span>${s.label}</span>`;
  }).join('<span class="order-arrow">→</span>');
  return `
    <div class="exp-label" style="margin-top:14px;">SELECT文の論理実行順序 ─ この句は ${pos} 番目</div>
    <div class="order-guide">${chips}</div>
    <div class="order-note">${escapeHtml(EXEC_ORDER_NOTES[stepKey])}</div>
  `;
}

// 行解説ルール（cat名）→ 実行順序ステップの対応付け
const LINE_STEP_BY_CAT = {
  'SELECT句':                    'SELECT',
  'FROM句':                      'FROM',
  '内部結合（INNER JOIN）':       'FROM',
  '外部結合（OUTER JOIN）':       'FROM',
  '交差結合（CROSS JOIN）':       'FROM',
  '結合条件（ON句）':             'FROM',
  'WHERE句（絞り込み）':          'WHERE',
  'GROUP BY句（グループ化）':     'GROUP',
  'HAVING句（集約後の絞り込み）': 'HAVING',
  'ORDER BY句（並び替え）':       'ORDER',
  'LIMIT / OFFSET（件数制限）':   'LIMIT',
  '件数制限（TOP / FETCH）':      'LIMIT',
};
for (const rule of LINE_RULES) {
  const st = LINE_STEP_BY_CAT[rule.cat];
  if (st) rule.step = st;
}

// 選択解説（キーワード / フレーズ）→ 実行順序ステップの対応付け
const KW_STEP = {
  'SELECT': 'SELECT', 'FROM': 'FROM', 'JOIN': 'FROM', 'ON': 'FROM',
  'WHERE': 'WHERE', 'HAVING': 'HAVING', 'DISTINCT': 'DISTINCT',
  'LIMIT': 'LIMIT', 'OFFSET': 'LIMIT', 'TOP': 'LIMIT',
};
for (const [kw, st] of Object.entries(KW_STEP)) {
  if (EXP_KW[kw]) EXP_KW[kw].step = st;
}
const PHRASE_STEP = {
  'GROUP BY': 'GROUP', 'ORDER BY': 'ORDER',
  'INNER JOIN': 'FROM', 'LEFT JOIN': 'FROM', 'RIGHT JOIN': 'FROM',
  'FULL JOIN': 'FROM', 'CROSS JOIN': 'FROM',
};
for (const [ph, st] of Object.entries(PHRASE_STEP)) {
  if (EXP_PHRASES[ph]) EXP_PHRASES[ph].step = st;
}

// ----------------------------------------------------------------
//  スニペット定義（name = PREFIX。エディタで name + Tab でも展開できる）
// ----------------------------------------------------------------
// inline: true のスニペットは改行を補わずカーソル位置へそのまま挿入する
const SNIPPETS = [];

function addSnippet(group, name, desc, code, inline = false) {
  SNIPPETS.push({ group, name, desc, code, inline });
}

// ---- 基本 ----
addSnippet('基本', 'sel',
  '基本のSELECT文です。取得したい列とテーブル名を Tab で順に入力します。',
`SELECT
  [[列1]],
  [[列2]]
FROM [[テーブル]];
`);
addSnippet('基本', 'selw',
  'WHERE付きのSELECT文です。絞り込み条件までまとめて展開します。',
`SELECT
  [[列]]
FROM [[テーブル]]
WHERE [[条件]];
`);
addSnippet('基本', 'ins',
  'INSERT文です。列リストと VALUES の数・順序・型を一致させます。',
`INSERT INTO [[テーブル]] ([[列1]], [[列2]])
VALUES ([[値1]], [[値2]]);
`);
addSnippet('基本', 'upd',
  'UPDATE文です。WHERE を忘れると全行が更新されるため、先に同条件の SELECT で確認するのが安全です。',
`UPDATE [[テーブル]]
SET [[列]] = [[値]]
WHERE [[条件]];
`);
addSnippet('基本', 'del',
  'DELETE文です。WHERE を忘れると全行が削除されます。実行前に必ず対象件数を確認しましょう。',
`DELETE FROM [[テーブル]]
WHERE [[条件]];
`);
addSnippet('基本', 'merge_upsert',
  'キー一致なら UPDATE、無ければ INSERT を1文で行う MERGE（UPSERT）です（SQL Server / Oracle）。MySQL は ON DUPLICATE KEY UPDATE を使います。',
`MERGE INTO [[対象テーブル]] AS t
USING [[ソース]] AS s
  ON t.[[キー]] = s.[[キー]]
WHEN MATCHED THEN
  UPDATE SET t.[[列]] = s.[[列]]
WHEN NOT MATCHED THEN
  INSERT ([[キー]], [[列]]) VALUES (s.[[キー]], s.[[列]]);
`);
addSnippet('基本', 'try',
  'エラー処理付きのブロックです（SQL Server の TRY/CATCH）。CATCH 内で ERROR_MESSAGE() からエラー内容を取得できます。',
`BEGIN TRY
  [[処理]];
END TRY
BEGIN CATCH
  SELECT ERROR_NUMBER() AS err_no, ERROR_MESSAGE() AS err_msg;
END CATCH;
`);
addSnippet('基本', 'proc',
  'ストアドプロシージャの定義です（SQL Server構文）。MySQLは DELIMITER の切り替えが必要など、DBごとに構文差があります。',
`CREATE PROCEDURE [[プロシージャ名]]
  @[[引数名]] INT
AS
BEGIN
  SELECT [[列]]
  FROM [[テーブル]]
  WHERE [[条件列]] = @[[引数名]];
END;
`);

// ---- 結合（JOIN） ----
addSnippet('結合（JOIN）', 'join_inner',
  '内部結合です。ON の条件が一致する行だけを返します。',
`SELECT
  a.[[列]],
  b.[[列2]]
FROM [[テーブルA]] AS a
INNER JOIN [[テーブルB]] AS b
  ON a.[[キー]] = b.[[キー]];
`);
addSnippet('結合（JOIN）', 'join_left',
  '左外部結合です。左表の全行を残し、右に一致が無ければ NULL で埋めます。「注文が無いユーザーも出す」ような場面の定番です。',
`SELECT
  a.[[列]],
  b.[[列2]]
FROM [[テーブルA]] AS a
LEFT JOIN [[テーブルB]] AS b
  ON a.[[キー]] = b.[[キー]];
`);
addSnippet('結合（JOIN）', 'join_right',
  '右外部結合です。右表の全行を残します。テーブル順を入れ替えれば LEFT JOIN で書けるため、LEFT に統一すると読みやすくなります。',
`SELECT
  a.[[列]],
  b.[[列2]]
FROM [[テーブルA]] AS a
RIGHT JOIN [[テーブルB]] AS b
  ON a.[[キー]] = b.[[キー]];
`);
addSnippet('結合（JOIN）', 'join_full',
  '完全外部結合です。両方の全行を残します。MySQL には無いため LEFT JOIN と RIGHT JOIN の UNION で代用します。',
`SELECT
  a.[[列]],
  b.[[列2]]
FROM [[テーブルA]] AS a
FULL OUTER JOIN [[テーブルB]] AS b
  ON a.[[キー]] = b.[[キー]];
`);
addSnippet('結合（JOIN）', 'join_cross',
  '交差結合（直積）です。全組み合わせを作るため、結果は「左の行数 × 右の行数」件になります。',
`SELECT
  a.[[列]],
  b.[[列2]]
FROM [[テーブルA]] AS a
CROSS JOIN [[テーブルB]] AS b;
`);
addSnippet('結合（JOIN）', 'join_self',
  '自己結合です。同じテーブルを別名で2回使い、上司と部下・前後の行などテーブル内の関係を表します。',
`SELECT
  a.[[列]],
  b.[[列]]
FROM [[テーブル]] AS a
INNER JOIN [[テーブル]] AS b
  ON a.[[キー]] = b.[[相手キー]];
`);
addSnippet('結合（JOIN）', 'apply_outer',
  '各行に対してサブクエリを実行する OUTER APPLY です（SQL Server）。該当が無くても左側の行は残ります。',
`SELECT
  a.[[列]],
  x.*
FROM [[テーブルA]] AS a
OUTER APPLY (
  SELECT TOP (1) [[列2]]
  FROM [[テーブルB]] AS b
  WHERE b.[[キー]] = a.[[キー]]
  ORDER BY b.[[並び順]] DESC
) AS x;
`);
addSnippet('結合（JOIN）', 'apply_topn',
  '「グループごとの上位N件」を取る CROSS APPLY です（SQL Server）。他DBでは ROW_NUMBER() で代用します。',
`SELECT
  a.[[列]],
  x.*
FROM [[テーブルA]] AS a
CROSS APPLY (
  SELECT TOP ([[N]]) [[列2]]
  FROM [[テーブルB]] AS b
  WHERE b.[[キー]] = a.[[キー]]
  ORDER BY b.[[並び順]] DESC
) AS x;
`);

// ---- 集計 ----
addSnippet('集計', 'group_by_basic',
  'グループ化の基本形です。SELECT に書けるのは GROUP BY した列と集計関数だけです。',
`SELECT
  [[グループ列]],
  COUNT(*) AS cnt
FROM [[テーブル]]
GROUP BY [[グループ列]];
`);
addSnippet('集計', 'group_by_having',
  '集約後の絞り込み（HAVING）付きのグループ化です。WHERE は集約前、HAVING は集約後に効きます。',
`SELECT
  [[グループ列]],
  COUNT(*) AS cnt
FROM [[テーブル]]
GROUP BY [[グループ列]]
HAVING COUNT(*) >= [[しきい値]];
`);
addSnippet('集計', 'rollup',
  '小計・総計行を自動追加する ROLLUP です。集計行ではグループ列が NULL になります（GROUPING関数で判別可能）。',
`SELECT
  [[列1]],
  [[列2]],
  SUM([[値]]) AS total
FROM [[テーブル]]
GROUP BY ROLLUP([[列1]], [[列2]]);
`);
addSnippet('集計', 'cube',
  '全ての組み合わせの小計を作る CUBE です。ROLLUP が階層的なのに対し、CUBE は総当たりで集計します。',
`SELECT
  [[列1]],
  [[列2]],
  SUM([[値]]) AS total
FROM [[テーブル]]
GROUP BY CUBE([[列1]], [[列2]]);
`);
addSnippet('集計', 'grouping_sets',
  '集計の組み合わせを明示的に指定する GROUPING SETS です。() は総計を表します。',
`SELECT
  [[列1]],
  [[列2]],
  SUM([[値]]) AS total
FROM [[テーブル]]
GROUP BY GROUPING SETS (([[列1]]), ([[列2]]), ());
`);
addSnippet('集計', 'string_agg',
  'グループ内の文字列をカンマ区切りで連結します（SQL Server / PostgreSQL）。MySQL: GROUP_CONCAT / Oracle: LISTAGG。',
`SELECT
  [[グループ列]],
  STRING_AGG([[文字列列]], ', ') AS joined
FROM [[テーブル]]
GROUP BY [[グループ列]];
`);
addSnippet('集計', 'xtab_distinct',
  'CASE式 + COUNT(DISTINCT) によるクロス集計です。条件ごとの異なり数を横持ちで並べます。',
`SELECT
  [[行キー]],
  COUNT(DISTINCT CASE WHEN [[条件A]] THEN [[集計列]] END) AS cnt_a,
  COUNT(DISTINCT CASE WHEN [[条件B]] THEN [[集計列]] END) AS cnt_b
FROM [[テーブル]]
GROUP BY [[行キー]];
`);

// ---- サブクエリ ----
addSnippet('サブクエリ', 'sub_in',
  'IN + サブクエリです。別テーブルに存在する値で絞り込みます。NULL が混ざる可能性があるなら EXISTS が安全です。',
`SELECT [[列]]
FROM [[テーブルA]]
WHERE [[列2]] IN (
  SELECT [[列2]]
  FROM [[テーブルB]]
  WHERE [[条件]]
);
`);
addSnippet('サブクエリ', 'sub_exists',
  '相関サブクエリによる存在チェックです。関連する行が1件でもあれば真になります。',
`SELECT [[列]]
FROM [[テーブルA]] AS a
WHERE EXISTS (
  SELECT 1
  FROM [[テーブルB]] AS b
  WHERE b.[[キー]] = a.[[キー]]
);
`);
addSnippet('サブクエリ', 'sub_notexists',
  '「関連する行が1件も無い」行を選ぶ NOT EXISTS です。NOT IN と違い NULL の罠がありません。',
`SELECT [[列]]
FROM [[テーブルA]] AS a
WHERE NOT EXISTS (
  SELECT 1
  FROM [[テーブルB]] AS b
  WHERE b.[[キー]] = a.[[キー]]
);
`);
addSnippet('サブクエリ', 'sub_scalar',
  'スカラーサブクエリです。1行1列を返すサブクエリを SELECT句 の中で値として使います。',
`SELECT
  [[列]],
  (SELECT MAX([[列2]]) FROM [[テーブルB]]) AS max_val
FROM [[テーブルA]];
`);
addSnippet('サブクエリ', 'sub_derived',
  '派生テーブル（FROM句のサブクエリ）です。集計結果をさらに加工するときに使います。別名（AS t）が必須です。',
`SELECT
  t.[[列]]
FROM (
  SELECT [[列]]
  FROM [[テーブル]]
  WHERE [[条件]]
) AS t;
`);
addSnippet('サブクエリ', 'sub_top1',
  '相関サブクエリで「グループごとの最新1件」を取る定番パターンです。',
`SELECT [[列]]
FROM [[テーブル]] AS t1
WHERE t1.[[日時列]] = (
  SELECT MAX(t2.[[日時列]])
  FROM [[テーブル]] AS t2
  WHERE t2.[[グループ列]] = t1.[[グループ列]]
);
`);

// ---- ウィンドウ関数 ----
addSnippet('ウィンドウ関数', 'win_rownum',
  'グループごとに連番を振る ROW_NUMBER() です。「各グループの最新1件」は rn = 1 で絞り込みます。',
`SELECT
  [[列]],
  ROW_NUMBER() OVER (
    PARTITION BY [[グループ列]]
    ORDER BY [[並び順]]
  ) AS rn
FROM [[テーブル]];
`);
addSnippet('ウィンドウ関数', 'win_rank',
  '順位付けの RANK() / DENSE_RANK() です。RANK は同率の次を飛ばし（1,1,3）、DENSE_RANK は飛ばしません（1,1,2）。',
`SELECT
  [[列]],
  RANK()       OVER (ORDER BY [[値列]] DESC) AS rank_no,
  DENSE_RANK() OVER (ORDER BY [[値列]] DESC) AS dense_no
FROM [[テーブル]];
`);
addSnippet('ウィンドウ関数', 'win_lag_lead',
  '前の行（LAG）と次の行（LEAD）の値を取得します。前日比・前月比の計算に使います。',
`SELECT
  [[列]],
  LAG([[値列]], 1)  OVER (ORDER BY [[並び順]]) AS prev_value,
  LEAD([[値列]], 1) OVER (ORDER BY [[並び順]]) AS next_value
FROM [[テーブル]];
`);
addSnippet('ウィンドウ関数', 'win_moving_avg',
  '直近7行の移動平均です。ROWS BETWEEN で対象範囲（ウィンドウ枠）を指定します。',
`SELECT
  [[日付列]],
  [[値列]],
  AVG([[値列]]) OVER (
    ORDER BY [[日付列]]
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS moving_avg_7
FROM [[テーブル]];
`);

// ---- CTE・集合 ----
addSnippet('CTE・集合', 'cte',
  '共通テーブル式（CTE）です。サブクエリに名前を付けて後続から参照でき、入れ子を減らして読みやすくなります。',
`WITH [[cte名]] AS (
  SELECT [[列]]
  FROM [[テーブル]]
  WHERE [[条件]]
)
SELECT *
FROM [[cte名]];
`);
addSnippet('CTE・集合', 'union',
  '2つの結果を縦に連結して重複を除去します。列の数と型を揃える必要があります。',
`SELECT [[列]] FROM [[テーブルA]]
UNION
SELECT [[列]] FROM [[テーブルB]];
`);
addSnippet('CTE・集合', 'union_all',
  '重複を残したまま縦に連結します。重複除去のコストが無い分 UNION より高速です。',
`SELECT [[列]] FROM [[テーブルA]]
UNION ALL
SELECT [[列]] FROM [[テーブルB]];
`);

// ---- 応用 ----
addSnippet('応用', 'paging',
  'ページングの定番形です。並び順が一意でないとページ間で行が重複・欠落するため、ORDER BY にはキー列を含めます。',
`SELECT [[列]]
FROM [[テーブル]]
ORDER BY [[一意になる並び順]]
LIMIT [[1ページ件数]] OFFSET [[読み飛ばし件数]];
-- SQL Server: OFFSET n ROWS FETCH NEXT m ROWS ONLY
`);
addSnippet('応用', 'top_with_ties',
  '上位N件を取得し、N件目と同率の行も含めます（SQL Server）。ORDER BY が必須です。',
`SELECT TOP ([[件数]]) WITH TIES
  [[列]]
FROM [[テーブル]]
ORDER BY [[順位づけ列]] DESC;
`);
addSnippet('応用', 'dedupe_rownum',
  'ROW_NUMBER() で重複行に連番を振り、2件目以降を削除する重複排除パターンです（DELETE は SQL Server。他DBは rn = 1 を SELECT で抽出）。',
`WITH ranked AS (
  SELECT *,
         ROW_NUMBER() OVER (
           PARTITION BY [[重複判定キー]]
           ORDER BY [[残す行の優先順]]
         ) AS rn
  FROM [[テーブル]]
)
DELETE FROM ranked WHERE rn > 1;
`);
addSnippet('応用', 'pivot_basic',
  '行の値を列見出しに変換する PIVOT です（SQL Server / Oracle）。他DBでは CASE式 + 集計で代用します。',
`SELECT *
FROM (
  SELECT [[行キー]], [[列キー]], [[値]]
  FROM [[テーブル]]
) AS src
PIVOT (
  SUM([[値]]) FOR [[列キー]] IN ([[値1]], [[値2]], [[値3]])
) AS p;
`);
addSnippet('応用', 'pivot_dynamic',
  '列リストを動的に組み立てて PIVOT する概念例です（SQL Server）。動的SQLはSQLインジェクションに注意し、QUOTENAME で列名を安全化します。',
`DECLARE @cols NVARCHAR(MAX), @sql NVARCHAR(MAX);

SELECT @cols = STRING_AGG(QUOTENAME([[列キー]]), ', ')
FROM (SELECT DISTINCT [[列キー]] FROM [[テーブル]]) AS t;

SET @sql = N'
SELECT *
FROM (SELECT [[行キー]], [[列キー]], [[値]] FROM [[テーブル]]) AS src
PIVOT (SUM([[値]]) FOR [[列キー]] IN (' + @cols + N')) AS p;';

EXEC sp_executesql @sql;
`);
addSnippet('応用', 'unpivot_basic',
  '複数の列を「項目名と値」の縦持ちに変換する UNPIVOT です（SQL Server / Oracle）。他DBでは UNION ALL で代用します。',
`SELECT [[行キー]], item, val
FROM [[テーブル]]
UNPIVOT (
  val FOR item IN ([[列1]], [[列2]], [[列3]])
) AS u;
`);
addSnippet('応用', 'for_json',
  'クエリ結果をJSONで返します（SQL Server の FOR JSON）。MySQL: JSON_ARRAYAGG(JSON_OBJECT(...)) / PostgreSQL: json_agg() を使います。',
`SELECT [[列1]], [[列2]]
FROM [[テーブル]]
FOR JSON PATH;
`);

// ---- 演算子（インライン） ----
addSnippet('演算子', 'op_eq',  '等しい。NULL の比較には使えず、IS NULL を使います。', `[[列]] = [[値]]`, true);
addSnippet('演算子', 'op_neq', '等しくない。<> が標準SQLで、!= も多くのDBで使えます。', `[[列]] <> [[値]]`, true);
addSnippet('演算子', 'op_gt',  'より大きい（境界を含まない）。', `[[列]] > [[値]]`, true);
addSnippet('演算子', 'op_gte', '以上（境界を含む）。', `[[列]] >= [[値]]`, true);
addSnippet('演算子', 'op_lt',  'より小さい（境界を含まない）。', `[[列]] < [[値]]`, true);
addSnippet('演算子', 'op_lte', '以下（境界を含む）。', `[[列]] <= [[値]]`, true);
addSnippet('演算子', 'arith_plus',  '加算。NULL を含む計算結果は NULL になるため COALESCE と併用します。', `[[数値A]] + [[数値B]]`, true);
addSnippet('演算子', 'arith_minus', '減算。日付同士の減算はDBにより挙動が異なります。', `[[数値A]] - [[数値B]]`, true);
addSnippet('演算子', 'arith_mul',   '乗算。税込計算などで ROUND と組み合わせるのが定番です。', `[[数値A]] * [[数値B]]`, true);
addSnippet('演算子', 'arith_div',   '除算。整数同士は切り捨てになるDB（PostgreSQL / SQL Server）があるため、小数が欲しければ 1.0 * A / B とします。', `[[数値A]] / [[数値B]]`, true);
addSnippet('演算子', 'arith_mod',   '剰余（割った余り）。Oracle など % が無いDBでは MOD(A, B) を使います。', `[[数値A]] % [[数値B]]`, true);
addSnippet('演算子', 'arith_int_div_like', '整数除算（商の整数部分）。DIV は MySQL系の演算子です。', `[[数値A]] DIV [[数値B]]`, true);

// ---- 論理・LIKE（インライン） ----
addSnippet('論理・LIKE', 'logic_and', '両方の条件を満たす。OR と混在させるときは括弧で優先順位を明確にします。', `[[条件1]] AND [[条件2]]`, true);
addSnippet('論理・LIKE', 'logic_or',  'どちらかの条件を満たす。同じ列への OR の連続は IN の方が簡潔です。', `[[条件1]] OR [[条件2]]`, true);
addSnippet('論理・LIKE', 'logic_in',  'リストのいずれかに一致します。', `[[列]] IN ([[値1]], [[値2]], [[値3]])`, true);
addSnippet('論理・LIKE', 'logic_between', 'A 以上 B 以下（両端を含む）の範囲条件です。', `[[列]] BETWEEN [[下限]] AND [[上限]]`, true);
addSnippet('論理・LIKE', 'like_prefix',   '前方一致。パターン先頭が固定ならインデックスが効きます。', `[[列]] LIKE '[[値]]%'`, true);
addSnippet('論理・LIKE', 'like_suffix',   '後方一致。インデックスが効かないため大きな表では注意します。', `[[列]] LIKE '%[[値]]'`, true);
addSnippet('論理・LIKE', 'like_contains', '部分一致。インデックスが効かないため全文検索の検討も。', `[[列]] LIKE '%[[値]]%'`, true);
addSnippet('論理・LIKE', 'like_singlechar', '_ は任意の1文字にマッチします（%は0文字以上）。', `[[列]] LIKE '[[値]]_'`, true);
addSnippet('論理・LIKE', 'not_like', 'パターンに一致しない行を選びます。', `[[列]] NOT LIKE '%[[値]]%'`, true);

// ---- 関数（インライン） ----
const FN_DEFS = [
  ['fn_abs',      'ABS([[数値]])',                          '絶対値を返します。'],
  ['fn_avg',      'AVG([[列]])',                            '平均値を返す集計関数です。NULL は分母にも含まれません。'],
  ['fn_cast',     'CAST([[値]] AS [[型]])',                 '型変換（標準SQL）。文字列⇔数値、文字列→日付などに使います。'],
  ['fn_ceiling',  'CEILING([[数値]])',                      '切り上げ。Oracle / PostgreSQL は CEIL も使えます。'],
  ['fn_charset_like', 'CHARSET([[文字列]])',                '文字セット名を返します（MySQL系）。'],
  ['fn_concat',   'CONCAT([[文字列1]], [[文字列2]])',        '文字列連結。|| 演算子を使うDB（Oracle / PostgreSQL）もあります。'],
  ['fn_convert',  'CONVERT([[型]], [[値]])',                '型変換。SQL Server は CONVERT(型, 値)、MySQL は CONVERT(値, 型) と順序が逆です。'],
  ['fn_convert_tz_like', "CONVERT_TZ([[日時]], '+00:00', '+09:00')", 'タイムゾーン変換（MySQL系）。UTC→日本時間の変換などに使います。'],
  ['fn_count',    'COUNT([[列]])',                          '件数。COUNT(*)は全行、COUNT(列)はNULL除外、COUNT(DISTINCT 列)は異なり数です。'],
  ['fn_current_date_like', 'CURRENT_DATE',                  '現在の日付（標準SQL）。MySQL は CURDATE() も同等です。'],
  ['fn_current_time_like', 'CURRENT_TIME',                  '現在の時刻（標準SQL）。MySQL は CURTIME() も同等です。'],
  ['fn_current_timestamp', 'CURRENT_TIMESTAMP',             '現在の日時（標準SQL）。列の DEFAULT に指定して登録日時を自動記録できます。'],
  ['fn_current_user', 'CURRENT_USER',                       '接続中のユーザー名を返します（標準SQL）。'],
  ['fn_database_like', 'DATABASE()',                        '現在のデータベース名（MySQL系）。SQL Server は DB_NAME() を使います。'],
  ['fn_datalength', 'DATALENGTH([[値]])',                   'バイト数を返します（SQL Server）。文字数は LEN()、MySQLのバイト数は LENGTH() です。'],
  ['fn_date_format_like', "DATE_FORMAT([[日時]], '%Y-%m-%d')", '日付の書式化（MySQL系）。SQL Server は FORMAT()、PostgreSQL は TO_CHAR() を使います。'],
  ['fn_datediff', 'DATEDIFF([[日付1]], [[日付2]])',          '日付差。MySQL は「日付1 - 日付2」の日数、SQL Server は DATEDIFF(単位, 開始, 終了) です。'],
  ['fn_day',      'DAY([[日付]])',                           '日（1〜31）を取り出します。'],
  ['fn_dayname',  'DAYNAME([[日付]])',                       '曜日名（Sunday など）を返します（MySQL系）。'],
  ['fn_dayofmonth_like', 'DAYOFMONTH([[日付]])',             '月内の日（1〜31）を返します（MySQL系）。DAY() と同等です。'],
  ['fn_dayofweek_like',  'DAYOFWEEK([[日付]])',              '曜日番号を返します（MySQL系、1=日曜〜7=土曜）。'],
  ['fn_dayofyear_like',  'DAYOFYEAR([[日付]])',              '年初からの通算日（1〜366）を返します（MySQL系）。'],
  ['fn_default_like', 'DEFAULT([[列]])',                     '列に定義されたデフォルト値を返します（MySQL系）。'],
  ['fn_floor',    'FLOOR([[数値]])',                         '切り捨て（小さい方の整数へ）。消費税計算などで使います。'],
  ['fn_insert_like', 'INSERT([[文字列]], [[開始位置]], [[長さ]], [[挿入文字列]])', '文字列の一部を別の文字列で置き換えます（MySQL系）。SQL Server は STUFF() を使います。'],
  ['fn_len',      'LEN([[文字列]])',                         '文字数を返します（SQL Server）。他DBは LENGTH() / CHAR_LENGTH() を使います。'],
  ['fn_lower',    'LOWER([[文字列]])',                       '小文字に変換します。大文字小文字を無視した比較の前処理にも使います。'],
  ['fn_lpad_like', "LPAD([[文字列]], [[長さ]], '0')",        '指定長になるまで左側に文字を埋めます（MySQL / PostgreSQL / Oracle）。ゼロ埋めの定番です。'],
  ['fn_max',      'MAX([[列]])',                             '最大値を返す集計関数です。日付や文字列にも使えます。'],
  ['fn_min',      'MIN([[列]])',                             '最小値を返す集計関数です。'],
  ['fn_month',    'MONTH([[日付]])',                         '月（1〜12）を取り出します。'],
  ['fn_repeat_like', 'REPEAT([[文字列]], [[回数]])',          '文字列を指定回数繰り返します（MySQL系）。SQL Server は REPLICATE() です。'],
  ['fn_replace',  "REPLACE([[文字列]], '[[検索]]', '[[置換]]')", '一致した部分文字列をすべて置き換えます。'],
  ['fn_round',    'ROUND([[数値]], [[桁数]])',               '四捨五入。桁数に負数を指定すると整数部を丸めます（例: -2 で百の位）。'],
  ['fn_rpad_like', "RPAD([[文字列]], [[長さ]], ' ')",        '指定長になるまで右側に文字を埋めます（MySQL / PostgreSQL / Oracle）。'],
  ['fn_sum',      'SUM([[列]])',                             '合計を返す集計関数です。0行や全NULLでは NULL になるため COALESCE(SUM(x), 0) が定番です。'],
  ['fn_timediff_like', 'TIMEDIFF([[時刻1]], [[時刻2]])',     '時刻の差を返します（MySQL系）。'],
  ['fn_timestampdiff_like', 'TIMESTAMPDIFF(DAY, [[日時1]], [[日時2]])', '単位（DAY / MONTH / YEARなど）を指定して日時差を返します（MySQL系）。SQL Server は DATEDIFF です。'],
  ['fn_truncate_like', 'TRUNCATE([[数値]], [[桁数]])',       '指定桁で切り捨てます（MySQL系）。SQL Server / PostgreSQL / Oracle は TRUNC() です。'],
  ['fn_upper',    'UPPER([[文字列]])',                       '大文字に変換します。'],
  ['fn_version_like', 'VERSION()',                           'DBサーバーのバージョンを返します（MySQL / PostgreSQL）。SQL Server は @@VERSION です。'],
  ['fn_year',     'YEAR([[日付]])',                          '年を取り出します。年別集計の GROUP BY によく使います。'],
];
for (const [name, code, desc] of FN_DEFS) {
  addSnippet('関数', name, desc, code, true);
}

const SNIPPET_MAP = new Map(SNIPPETS.map((s) => [s.name, s]));

// ----------------------------------------------------------------
//  初期サンプルコード
// ----------------------------------------------------------------
const SAMPLE_CODE = `-- スニペット例: sel + Tab / selw + Tab
-- プレースホルダ例: [[table]] など（Tabで移動）

-- ユーザーと注文の集計クエリ
SELECT
  u.id,
  u.username,
  COUNT(o.id)         AS order_count,
  SUM(o.total_amount) AS total_spent,
  MAX(o.placed_at)    AS last_order_at,
  COALESCE(SUM(o.total_amount), 0) AS safe_total
FROM users AS u
LEFT JOIN orders AS o
  ON u.id = o.customer_id
WHERE u.is_active = TRUE
  AND u.created_at >= '2024-01-01'
  AND u.role IN ('customer', 'seller')
GROUP BY u.id, u.username
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 20 OFFSET 0;

-- 商品テーブル作成
CREATE TABLE IF NOT EXISTS products (
  id          INT          PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
`;

// ----------------------------------------------------------------
//  DOM 参照
// ----------------------------------------------------------------
const textarea      = document.getElementById('code-textarea');
const hlPre         = document.getElementById('hl-pre');
const hlCode        = document.getElementById('hl-code');
const lineNumbers   = document.getElementById('line-numbers');
const expBody       = document.getElementById('explanation-body');
const snippetsBody  = document.getElementById('snippets-body');
const btnReset      = document.getElementById('btn-reset');
const btnCopy       = document.getElementById('btn-copy');
const btnClear      = document.getElementById('btn-clear');
const btnHowto      = document.getElementById('btn-howto');
const btnRun        = document.getElementById('btn-run');
const btnDbReset    = document.getElementById('btn-db-reset');
const btnFormat     = document.getElementById('btn-format');
const outputBody    = document.getElementById('output-body');
const syntaxStatus  = document.getElementById('syntax-status');
const snippetSearch = document.getElementById('snippet-search');

// ----------------------------------------------------------------
//  自動保存（localStorage）
// ----------------------------------------------------------------
const STORAGE_KEY = 'sql-syntax-visualizer:code';

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
  hlCode.innerHTML = highlightSql(textarea.value, bracketMarks) + '\n';
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

// 編集後にまとめて行う更新
function afterEdit() {
  bracketMarks = null;
  updateHighlight();
  updateLineNumbers();
  syncScroll();
  saveCode();
  scheduleSyntaxCheck();
}

// ----------------------------------------------------------------
//  構文チェック（入力が止まったら実行）
// ----------------------------------------------------------------
let scanCache = { code: null, result: null };
function getScan() {
  if (scanCache.code !== textarea.value) {
    scanCache = { code: textarea.value, result: scanSql(textarea.value) };
  }
  return scanCache.result;
}

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
    if (lineNumbers.children[error.line - 1]) {
      lineNumbers.children[error.line - 1].classList.add('ln-error');
    }
  } else {
    syntaxStatus.textContent = '✓ 括弧・引用符OK';
    syntaxStatus.title = '';
    syntaxStatus.className = 'ok';
  }
}

let syntaxTimer = null;
function scheduleSyntaxCheck() {
  clearTimeout(syntaxTimer);
  syntaxTimer = setTimeout(checkSyntax, 300);
}

// ----------------------------------------------------------------
//  説明エリア描画
// ----------------------------------------------------------------
function renderExplanation({ title, cat, desc, example, extra = '' }) {
  expBody.innerHTML = `
    <div class="exp-line">${title}</div>
    <div class="exp-cat">${escapeHtml(cat)}</div>
    <div class="exp-desc">${escapeHtml(desc)}</div>
    <div class="exp-label">使用例</div>
    <div class="exp-example">${example}</div>
    ${extra}
  `;
}

function renderPlaceholder() {
  expBody.innerHTML = `<span class="placeholder-text">
    エディタの行にカーソルを置くと、その行の構文説明がここに表示されます。<br><br>
    SQLをドラッグで選択すると、選択したキーワード（SELECT / JOIN / COALESCE など）の解説が表示されます。<br><br>
    エディタで <b>sel</b> と入力して <b>Tab</b> を押すと、スニペットがその場で展開されます。<br><br>
    <b>▶ 実行</b>（または Ctrl+Enter）で、内蔵のサンプルDB（users / orders）に対してSQLを実行できます。
  </span>`;
}

function renderHowto() {
  expBody.innerHTML = `
    <div class="exp-line">スニペットの使い方</div>
    <div class="exp-cat">PREFIX + TAB</div>
    <div class="exp-desc">
      1. エディタで <b>sel</b> / <b>selw</b> / <b>join_left</b> などのスニペット名を入力して
      <b>Tab</b> を押すと、その場でテンプレートに展開されます。<br>
      2. 左のチップをクリックしても、カーソル位置に挿入できます。<br>
      3. テンプレート内の <b>[[...]]</b> は入力位置です。<b>Tab</b> で次へ、
      <b>Shift+Tab</b> で前へ移動でき、移動時に [[ ]] が外れて中身が選択されるので、
      そのままタイプして置き換えます。<br>
      4. プレースホルダが無いときの Tab は通常のインデントになります。
    </div>
    <div class="exp-label">例：sel + Tab</div>
    <div class="exp-example">${highlightSql('SELECT\n  [[列1]],\n  [[列2]]\nFROM [[テーブル]];')}</div>
  `;
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
      title: highlightSql(shown),
      cat: `選択範囲：${exp.title}`,
      desc: exp.body,
      example: highlightSql(exp.syntax ?? shown),
      extra: exp.step ? execOrderHtml(exp.step) : '',
    });
  } else {
    renderExplanation({
      title: highlightSql(shown),
      cat: '選択範囲',
      desc: 'この選択範囲に対応する解説が見つかりませんでした。SELECT / JOIN / GROUP BY / COALESCE などのキーワードを含む部分を選択すると解説が表示されます。',
      example: highlightSql(shown),
    });
  }
  return true;
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
    title: highlightSql(line.trim()),
    cat: rule.cat,
    desc: rule.desc,
    example: highlightSql(line.trim()),
    extra: rule.step ? execOrderHtml(rule.step) : '',
  });
}

// 選択範囲を優先し、なければカーソル行を解説する
function updateExplanation() {
  if (!explainSelection()) explainCurrentLine();
}

// ----------------------------------------------------------------
//  プレースホルダ（[[...]]）の巡回
// ----------------------------------------------------------------
const PH_RE = /\[\[[^\[\]\n]*\]\]/g;

function collectPlaceholders(value) {
  const list = [];
  let m;
  PH_RE.lastIndex = 0;
  while ((m = PH_RE.exec(value)) !== null) {
    list.push({ start: m.index, end: m.index + m[0].length, inner: m[0].slice(2, -2) });
  }
  return list;
}

// プレースホルダ選択直後は説明エリアの表示（スニペット解説）を保持する
let keepExplanationFor = null;

// [[ ]] を外して中身を選択状態にする
function unwrapPlaceholder(ph) {
  replaceRange(ph.start, ph.end, ph.inner);
  textarea.setSelectionRange(ph.start, ph.start + ph.inner.length);
  keepExplanationFor = { start: ph.start, end: ph.start + ph.inner.length };
  afterEdit();
}

// dir: +1 = 次へ / -1 = 前へ（見つからなければ端へ折り返す）
function jumpPlaceholder(dir) {
  const list = collectPlaceholders(textarea.value);
  if (list.length === 0) return false;

  let target;
  if (dir > 0) {
    const pos = textarea.selectionEnd;
    target = list.find((p) => p.start >= pos) ?? list[0];
  } else {
    const pos = textarea.selectionStart;
    const before = list.filter((p) => p.end <= pos);
    target = before.length ? before[before.length - 1] : list[list.length - 1];
  }
  unwrapPlaceholder(target);
  return true;
}

// ----------------------------------------------------------------
//  スニペット描画・挿入・Tab展開
// ----------------------------------------------------------------
function renderSnippets(filter = '') {
  snippetsBody.innerHTML = '';
  const q = filter.trim().toLowerCase();
  let lastGroup = '';
  let flow = null;
  let shown = 0;

  for (const s of SNIPPETS) {
    if (q &&
        !s.name.toLowerCase().includes(q) &&
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
    btn.textContent = s.name;
    btn.title = s.desc;
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

function showSnippetExplanation(snippet) {
  renderExplanation({
    title: escapeHtml(snippet.name),
    cat: `スニペット：${snippet.group}`,
    desc: snippet.desc,
    example: highlightSql(snippet.code.trimEnd()),
  });
}

// 挿入位置以降の最初のプレースホルダへ移動する
function jumpFirstPlaceholderFrom(startPos) {
  const list = collectPlaceholders(textarea.value);
  const first = list.find((p) => p.start >= startPos);
  if (first) unwrapPlaceholder(first);
}

function insertSnippet(snippet) {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  // ブロックスニペットは行の途中なら改行してから挿入する
  const needsNewline = !snippet.inline && s > 0 && value[s - 1] !== '\n';
  const insert = (needsNewline ? '\n' : '') + snippet.code;

  replaceRange(s, e, insert);
  afterEdit();
  // ジャンプ中の input イベントで解説が上書きされないよう、解説表示は最後に行う
  jumpFirstPlaceholderFrom(s);
  showSnippetExplanation(snippet);
}

// カーソル直前の単語がスニペット名なら展開する（true = 展開した）
function tryExpandPrefix() {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  if (s !== e) return false;

  const m = value.slice(0, s).match(/[A-Za-z0-9_]+$/);
  if (!m) return false;
  const snippet = SNIPPET_MAP.get(m[0].toLowerCase());
  if (!snippet) return false;

  const start = s - m[0].length;
  replaceRange(start, s, snippet.code);
  afterEdit();
  jumpFirstPlaceholderFrom(start);
  showSnippetExplanation(snippet);
  return true;
}

// ----------------------------------------------------------------
//  SQL実行（sql.js = SQLite の WASM版。CDNから遅延読み込み）
// ----------------------------------------------------------------
const SQLJS_BASES = [
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/',
  'https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/',
];

// サンプルDB（エディタの初期サンプルクエリがそのまま動くスキーマ）
const INIT_DB_SQL = `
CREATE TABLE users (
  id         INTEGER PRIMARY KEY,
  username   TEXT    NOT NULL,
  role       TEXT    NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT    NOT NULL
);

INSERT INTO users (id, username, role, is_active, created_at) VALUES
  (1, 'sato_taro',   'customer', TRUE,  '2024-01-15'),
  (2, 'suzuki_hana', 'customer', TRUE,  '2024-02-03'),
  (3, 'tanaka_ken',  'seller',   TRUE,  '2024-03-10'),
  (4, 'yamada_yui',  'customer', FALSE, '2024-01-20'),
  (5, 'ito_shin',    'seller',   TRUE,  '2023-11-05'),
  (6, 'kato_mei',    'customer', TRUE,  '2024-04-12'),
  (7, 'admin_user',  'admin',    TRUE,  '2024-01-01'),
  (8, 'watanabe_jo', 'customer', TRUE,  '2023-12-25');

CREATE TABLE orders (
  id           INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL REFERENCES users(id),
  total_amount INTEGER NOT NULL,
  placed_at    TEXT    NOT NULL
);

INSERT INTO orders (id, customer_id, total_amount, placed_at) VALUES
  (1,  1, 3200,  '2024-02-01'),
  (2,  1, 1500,  '2024-03-15'),
  (3,  1, 5400,  '2024-05-20'),
  (4,  2, 980,   '2024-02-10'),
  (5,  2, 2200,  '2024-04-01'),
  (6,  3, 12000, '2024-03-20'),
  (7,  4, 700,   '2024-02-14'),
  (8,  5, 2500,  '2024-06-01'),
  (9,  6, 4300,  '2024-05-02'),
  (10, 6, 800,   '2024-05-30'),
  (11, 7, 999,   '2024-01-05');
`;

let sqlModulePromise = null; // initSqlJs() の結果（SQLモジュール）を共有する
let db = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = resolve;
    el.onerror = () => reject(new Error('読み込み失敗: ' + src));
    document.head.appendChild(el);
  });
}

// 複数CDNを順に試す（スクリプト読込と .wasm 取得の両方が対象）
function getSqlModule() {
  if (!sqlModulePromise) {
    sqlModulePromise = (async () => {
      let lastErr = null;
      for (const base of SQLJS_BASES) {
        try {
          if (!window.initSqlJs) await loadScript(base + 'sql-wasm.min.js');
          return await window.initSqlJs({ locateFile: (f) => base + f });
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr ?? new Error('sql.js を読み込めませんでした');
    })().catch((e) => {
      sqlModulePromise = null; // 失敗したら次回の実行で再試行できるようにする
      throw e;
    });
  }
  return sqlModulePromise;
}

async function ensureDb() {
  const SQL = await getSqlModule();
  if (!db) {
    db = new SQL.Database();
    db.exec(INIT_DB_SQL);
  }
  return db;
}

function clearOutput() {
  outputBody.innerHTML = '';
}

function outLine(type, text) {
  const div = document.createElement('div');
  div.className = 'out-line' + (type !== 'log' ? ` out-${type}` : '');
  div.textContent = text;
  outputBody.appendChild(div);
  outputBody.scrollTop = outputBody.scrollHeight;
}

const MAX_ROWS = 200;

function outTable(columns, values) {
  const table = document.createElement('table');
  table.className = 'out-table';
  const header = table.insertRow();
  columns.forEach((c) => {
    const th = document.createElement('th');
    th.textContent = c;
    header.appendChild(th);
  });
  values.slice(0, MAX_ROWS).forEach((row) => {
    const tr = table.insertRow();
    row.forEach((v) => {
      const td = tr.insertCell();
      if (v === null) {
        td.textContent = 'NULL';
        td.style.color = 'var(--muted)';
      } else {
        td.textContent = String(v);
        if (typeof v === 'number') td.className = 'num';
      }
    });
  });
  outputBody.appendChild(table);
  if (values.length > MAX_ROWS) {
    outLine('muted', `… 他 ${values.length - MAX_ROWS} 行（先頭 ${MAX_ROWS} 行のみ表示）`);
  }
  outputBody.scrollTop = outputBody.scrollHeight;
}

async function runSql() {
  const sql = textarea.value.trim();
  clearOutput();

  if (!sql) {
    outLine('muted', '実行するSQLがありません。');
    return;
  }
  // コメント内は無視して、実行対象に未入力のプレースホルダが残っていないか確認する
  const noComments = sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  if (/\[\[[^\[\]\n]*\]\]/.test(noComments)) {
    outLine('error', '✖ プレースホルダ [[...]] が残っています。Tab で移動して値を入力してから実行してください。');
    return;
  }

  outLine('muted', 'sql.js を読み込み中…（初回のみ）');
  let database;
  try {
    database = await ensureDb();
  } catch (e) {
    clearOutput();
    outLine('error', '✖ sql.js の読み込みに失敗しました。ネットワーク接続を確認してください。');
    outLine('muted', String(e && e.message ? e.message : e));
    return;
  }
  clearOutput();

  const t0 = performance.now();
  try {
    const results = database.exec(sql);
    const ms = Math.max(1, Math.round(performance.now() - t0));

    if (results.length === 0) {
      // getRowsModified() は直近の更新系の文の値を返すため、更新系を含む実行のときだけ表示する
      const hasDml = /\b(INSERT|UPDATE|DELETE|REPLACE)\b/i.test(noComments);
      const mod = database.getRowsModified();
      outLine('info', `✓ 実行しました（結果行なし${hasDml && mod > 0 ? ` / 変更行: ${mod}` : ''} / ${ms}ms）`);
      outLine('muted', '※ 0件のSELECT、または更新系・定義系の文です。');
    } else {
      for (const rs of results) outTable(rs.columns, rs.values);
      const total = results.reduce((a, r) => a + r.values.length, 0);
      outLine('muted', `${results.length}個の結果セット / 合計 ${total} 行 / ${ms}ms`);
    }
  } catch (e) {
    outLine('error', '✖ ' + (e && e.message ? e.message : e));
    outLine('muted', '※ 実行エンジンは SQLite です。TOP / PIVOT / APPLY など他DB専用の構文はエラーになります。');
  }
}

async function resetDb() {
  clearOutput();
  try {
    const SQL = await getSqlModule();
    if (db) db.close();
    db = new SQL.Database();
    db.exec(INIT_DB_SQL);
    outLine('info', '✓ サンプルDBを初期状態に戻しました（users 8行 / orders 11行）。');
  } catch (e) {
    outLine('error', '✖ sql.js の読み込みに失敗しました。ネットワーク接続を確認してください。');
  }
}

// ----------------------------------------------------------------
//  SQL整形（sql-formatter。CDNから遅延読み込み）
// ----------------------------------------------------------------
const FORMATTER_URLS = [
  'https://cdn.jsdelivr.net/npm/sql-formatter@15.3.2/dist/sql-formatter.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/sql-formatter/15.3.2/sql-formatter.min.js',
];

let formatterPromise = null;

function getFormatter() {
  if (!formatterPromise) {
    formatterPromise = (async () => {
      let lastErr = null;
      for (const url of FORMATTER_URLS) {
        try {
          if (!window.sqlFormatter) await loadScript(url);
          if (window.sqlFormatter) return window.sqlFormatter;
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr ?? new Error('sql-formatter を読み込めませんでした');
    })().catch((e) => {
      formatterPromise = null; // 失敗したら次回クリックで再試行できるようにする
      throw e;
    });
  }
  return formatterPromise;
}

async function formatSql() {
  const original = textarea.value;
  if (!original.trim()) return;

  let formatter;
  try {
    formatter = await getFormatter();
  } catch (e) {
    clearOutput();
    outLine('error', '✖ 整形ライブラリ（sql-formatter）の読み込みに失敗しました。ネットワーク接続を確認してください。');
    outLine('muted', String(e && e.message ? e.message : e));
    return;
  }

  // [[プレースホルダ]] は整形で壊れないよう一時トークンへ退避する
  const phs = [];
  const protectedSql = original.replace(/\[\[[^\[\]\n]*\]\]/g, (m) => {
    phs.push(m);
    return `__PH_${phs.length - 1}__`;
  });

  try {
    // 標準SQLで解析できない方言（@変数やバッククォート等）は T-SQL → MySQL の順で再試行する
    let out = null;
    let lastErr = null;
    for (const language of ['sql', 'transactsql', 'mysql']) {
      try {
        out = formatter.format(protectedSql, {
          language,
          keywordCase: 'upper',
          tabWidth: 2,
          linesBetweenQueries: 1,
        });
        break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (out === null) throw lastErr;
    out = out.replace(/__PH_(\d+)__/g, (m, idx) => phs[Number(idx)] ?? m);
    if (!out.endsWith('\n')) out += '\n';
    if (out === original) return;

    replaceRange(0, original.length, out);
    afterEdit();
    textarea.setSelectionRange(0, 0);
    textarea.scrollTop = 0;
    textarea.scrollLeft = 0;
    syncScroll();
    explainCurrentLine();
  } catch (e) {
    clearOutput();
    outLine('error', '✖ 整形できませんでした: ' + (e && e.message ? e.message : e));
    outLine('muted', '※ SQLに構文エラーがあると整形に失敗することがあります。エラー位置を修正してから再度お試しください。');
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

// コピー / クリア / サンプル
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
  afterEdit();
  renderPlaceholder();
  textarea.focus();
});

btnReset.addEventListener('click', () => {
  if (textarea.value !== SAMPLE_CODE && textarea.value.trim() !== '' &&
      !confirm('編集中のSQLを破棄してサンプルに戻しますか？')) return;
  replaceRange(0, textarea.value.length, SAMPLE_CODE);
  afterEdit();
  textarea.setSelectionRange(0, 0);
  textarea.scrollTop = 0;
  textarea.scrollLeft = 0;
  syncScroll();
  textarea.focus();
  explainCurrentLine();
  checkSyntax();
});

btnHowto.addEventListener('click', renderHowto);
btnRun.addEventListener('click', runSql);
btnDbReset.addEventListener('click', resetDb);
btnFormat.addEventListener('click', formatSql);

// Ctrl+Enter（Mac: Cmd+Enter）で実行
textarea.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    runSql();
  }
});

// カーソル移動時：括弧の対応ハイライトと解説を更新
// （プレースホルダへ移動した直後の選択中は、スニペット解説を上書きしない）
function onCursorMove() {
  updateBracketMatch();
  if (keepExplanationFor &&
      textarea.selectionStart === keepExplanationFor.start &&
      textarea.selectionEnd === keepExplanationFor.end) {
    return;
  }
  keepExplanationFor = null;
  updateExplanation();
}

textarea.addEventListener('scroll', syncScroll);
textarea.addEventListener('click', onCursorMove);
textarea.addEventListener('keyup', onCursorMove);
textarea.addEventListener('select', onCursorMove);
// マウスドラッグ選択の途中経過にも追従する
textarea.addEventListener('mouseup', onCursorMove);

// Tab キー：スニペット展開 → プレースホルダ巡回 → インデント の優先順
textarea.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  const { selectionStart: s, selectionEnd: end, value } = textarea;
  const INDENT = '  ';

  if (!e.shiftKey) {
    // 1. PREFIX 展開
    if (tryExpandPrefix()) return;
    // 2. 次のプレースホルダへ
    if (jumpPlaceholder(+1)) return;
  } else {
    // Shift+Tab：前のプレースホルダへ
    if (jumpPlaceholder(-1)) return;
  }

  // 3. 通常のインデント
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

  afterEdit();
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
renderPlaceholder();
checkSyntax();
