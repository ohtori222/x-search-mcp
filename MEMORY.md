# Project Learnings

## Duplicated Code Block Prevention
- **Problem:** When applying mechanical replacements, if a block of code is accidentally duplicated inside a function, only one of the blocks might be updated. The lower, unmodified duplicate block will run immediately after and completely overwrite the newly updated variables with the old incorrect values.
- **Solution:** Maintain extremely strict and clean codebase discipline. Use search/grep tools to verify there are no duplicated code segments, and aggressively prune redundant/dead code blocks.

## AIの探索範囲制限（プロジェクトディレクトリ外へのアクセス禁止）
- **Problem:** AIがプロジェクトディレクトリ外（`~/.gitconfig`等）に無断でアクセスするケースがあった。
- **Solution:** AIは**明示的に許可された範囲内のみ**で動作すべき。ホームディレクトリの設定ファイル（`.gitconfig`, `.ssh/`, `.config/`等）には認証情報や秘密鍵が含まれる可能性があり、無断での読み取りは厳禁。ユーザーから「確認して」と明示的に指示があった場合のみ、範囲を拡大する。

## 作業完了時は必ずコミット＆プッシュ
- **Problem:** ファイル変更後にコミット・プッシュを忘れていた。
- **Solution:** ファイル変更を伴うタスク完了時は、**必ず `git add` → `git commit` → `git push` をセットで実行**。ユーザーに報告する前にコミットハッシュを控えておく。変更が複数カテゴリに跨る場合は、それぞれ別コミットで分ける。

## PRマージ後のデプロイ手順
- **Problem:** PRマージ後にローカルブランチが古いコードのまま残っていると、サービス再起動時に正しいコードが読み込まれない。
- **Solution:** PR マージ後は必ず `git checkout main && git pull` してからサービスの再起動を行う。

## AI-Direct File Limit Bypass
- **Problem:** AIエージェントがReadツールのブロックリストを `bash` ツール経由（`cat`, `grep` 等）でバイパスし、制限されたファイルを読めてしまう。
- **Solution:** ツールレベルの制限だけに依存するのは不十分。機密ファイルは (1) 完全に削除して外部 vault に保管する、(2) OS レベルの ACL で物理的に読み取り不可にする、のいずれかの対策が必要。

## 実装タスクは外部エージェントに依頼する判断基準
- **Problem:** AI（高コスト/高精度）が単純な編集タスクを自分で実装してしまい、コスト効率が悪くなる。
- **Solution:** コード変更が必要なタスクでは、**作業開始前に必ず「このタスクは外部エージェントに依頼すべきか？」を自問**。ファイル編集・テスト追加・リファクタリング・バグ修正は、利用可能な外部エージェントがいる場合は原則そちらに任せる。AIは設計・Issue作成・レビュー・検証に専念する。
