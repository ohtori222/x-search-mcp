import { defineConfig } from 'vitest/config';

// .env は root 所有 (chmod 600) で agent から読めない設計。
// 環境変数 XAI_API_KEY は別経路で注入されているため実害なし。
// envDir を変更して vitest が .env を読もうとして落ちるのを防ぐ。
export default defineConfig({
  envDir: '/tmp',
  test: {},
});
