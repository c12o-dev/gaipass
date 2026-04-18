# 問題データ

1問1ファイル（Markdown + YAML frontmatter）で管理する。

## ディレクトリ構成

```
src/data/questions/
  ch1/
    q-1-001.md
    q-1-002.md
  ch2/
    q-2-001.md
  ...
```

## ファイル形式

`template.md` をコピーして作成。

- **id** はファイル名と一致させる（例: `q-1-001`）
- **keyword** は `src/data/syllabus.json` に含まれる詳細キーワードのいずれかと完全一致させる
- **choices** は必ず4つ
- **answer** は `0`〜`3`（正解の選択肢インデックス）

## ビルド

```
pnpm questions:build
```

- すべての `q-*.md` を読み込み、`src/data/questions.generated.json` に統合出力する
- 同時に妥当性チェック（id重複、keywordのシラバス存在、choices数、answer範囲）を行う
