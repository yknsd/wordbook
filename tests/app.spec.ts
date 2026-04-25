import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // localStorage をクリアして毎テスト初期状態から始める
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

// ──────────────────────────────────────────────
// 表示
// ──────────────────────────────────────────────

test('タイトルが表示される', async ({ page }) => {
  await expect(page).toHaveTitle('wordbook')
  await expect(page.getByRole('heading', { name: 'wordbook' })).toBeVisible()
})

test('カードが表示される', async ({ page }) => {
  // 単語テキストが何か表示されている
  const wordText = page.locator('.word-text')
  await expect(wordText).toBeVisible()
  await expect(wordText).not.toBeEmpty()
})

test('発音記号が表示される', async ({ page }) => {
  const phonetic = page.locator('.phonetic')
  await expect(phonetic).toBeVisible()
  // 発音記号は / で始まる
  await expect(phonetic).toContainText('/')
})

test('例文が表示される', async ({ page }) => {
  const example = page.locator('.front-example-en')
  await expect(example).toBeVisible()
  await expect(example).not.toBeEmpty()
})

test('難易度バッジが表示される', async ({ page }) => {
  const badge = page.locator('.level-badge')
  await expect(badge).toBeVisible()
  await expect(badge).toContainText(/基礎|中級|上級/)
})

// ──────────────────────────────────────────────
// カードフリップ
// ──────────────────────────────────────────────

test('カードをタップすると意味面に反転する', async ({ page }) => {
  const cardScene = page.locator('.card-scene')
  await expect(cardScene).not.toHaveClass(/is-flipped/)

  // card-front を直接クリック（card-scene は perspective コンテナで高さが取れないため）
  await page.locator('.card-front').click({ position: { x: 10, y: 10 } })
  await expect(cardScene).toHaveClass(/is-flipped/)

  // 意味が表示される
  await expect(page.locator('.meaning')).toBeVisible()
  await expect(page.locator('.part-of-speech')).toBeVisible()
})

test('反転後にもう一度タップすると表面に戻る', async ({ page }) => {
  const cardScene = page.locator('.card-scene')
  await page.locator('.card-front').click({ position: { x: 10, y: 10 } })
  await expect(cardScene).toHaveClass(/is-flipped/)

  await page.locator('.card-back').click({ position: { x: 10, y: 10 } })
  await expect(cardScene).not.toHaveClass(/is-flipped/)
})

// ──────────────────────────────────────────────
// 進捗（わかった！ / わからない）
// ──────────────────────────────────────────────

test('「わかった！」ボタンで次のカードに進む', async ({ page }) => {
  const counter = page.locator('.progress-text')
  await expect(counter).toContainText('1 /')

  await page.getByRole('button', { name: 'わかった！' }).click()
  await expect(counter).toContainText('2 /')
})

test('「わからない」ボタンで次のカードに進む', async ({ page }) => {
  const counter = page.locator('.progress-text')
  await expect(counter).toContainText('1 /')

  await page.getByRole('button', { name: 'わからない' }).click()
  await expect(counter).toContainText('2 /')
})

test('「わかった！」後にステータスが表示される', async ({ page }) => {
  await page.getByRole('button', { name: 'わかった！' }).click()
  // 前のカードが「覚えた」になっている（戻ることはできないが進捗チップで確認）
  const knownChip = page.locator('.stat-chip').filter({ hasText: '覚えた' })
  await expect(knownChip).toContainText('1')
})

test('「わからない」後に要復習カウントが増える', async ({ page }) => {
  await page.getByRole('button', { name: 'わからない' }).click()
  const unknownChip = page.locator('.stat-chip').filter({ hasText: '要復習' })
  await expect(unknownChip).toContainText('1')
})

// ──────────────────────────────────────────────
// フィルター
// ──────────────────────────────────────────────

test('「覚えた」フィルターで学習済み単語だけ表示される', async ({ page }) => {
  // 1枚を「わかった！」にする
  await page.getByRole('button', { name: 'わかった！' }).click()

  // 覚えたフィルターに切り替え
  await page.locator('.stat-chip').filter({ hasText: '覚えた' }).click()

  // 1/1 になる
  await expect(page.locator('.progress-text')).toContainText('1 / 1')
})

test('「要復習」フィルターで未正解単語だけ表示される', async ({ page }) => {
  await page.getByRole('button', { name: 'わからない' }).click()

  await page.locator('.stat-chip').filter({ hasText: '要復習' }).click()

  await expect(page.locator('.progress-text')).toContainText('1 / 1')
})

test('フィルターに該当なしの場合に空状態が表示される', async ({ page }) => {
  // 何も「覚えた」がない状態で覚えたフィルターを押す
  await page.locator('.stat-chip').filter({ hasText: '覚えた' }).click()

  await expect(page.locator('.empty-state')).toBeVisible()
  await expect(page.getByRole('button', { name: '全て表示' })).toBeVisible()
})

// ──────────────────────────────────────────────
// リセット
// ──────────────────────────────────────────────

test('リセットで進捗がクリアされる', async ({ page }) => {
  // 数枚進める
  await page.getByRole('button', { name: 'わかった！' }).click()
  await page.getByRole('button', { name: 'わからない' }).click()

  await expect(page.locator('.stat-chip').filter({ hasText: '覚えた' })).toContainText('1')

  await page.getByRole('button', { name: 'リセット' }).click()

  // 覚えた・要復習がゼロに戻る
  await expect(page.locator('.stat-chip').filter({ hasText: '覚えた' })).toContainText('0')
  await expect(page.locator('.stat-chip').filter({ hasText: '要復習' })).toContainText('0')
})

test('リセット後に1枚目から始まる', async ({ page }) => {
  await page.getByRole('button', { name: 'わかった！' }).click()
  await page.getByRole('button', { name: 'リセット' }).click()

  await expect(page.locator('.progress-text')).toContainText('1 /')
})

// ──────────────────────────────────────────────
// 音声ボタン
// ──────────────────────────────────────────────

test('🔊ボタンが表示される', async ({ page }) => {
  const speakBtn = page.locator('.speak-btn-center')
  await expect(speakBtn).toBeVisible()
})

// ──────────────────────────────────────────────
// ランダム出題
// ──────────────────────────────────────────────

test('リロードで異なる順番で出題される（ランダム確認）', async ({ page }) => {
  const getFirstWord = () => page.locator('.word-text').innerText()

  // 5回リロードして少なくとも1回は異なる順番であることを確認
  const firstWord = await getFirstWord()
  let isDifferent = false
  for (let i = 0; i < 5; i++) {
    await page.reload()
    const word = await getFirstWord()
    if (word !== firstWord) {
      isDifferent = true
      break
    }
  }
  expect(isDifferent).toBe(true)
})
