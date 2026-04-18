/**
 * シラバスPDF → raw text dump
 *
 * PDFのテーブル構造は自動パース精度が低いため、このスクリプトは
 * 生テキストを `scripts/syllabus-raw.txt` に吐き出すだけに留める。
 * `src/data/syllabus.json` は人間が raw を参照して手書きする。
 * 改訂時は本スクリプトを再実行 → diff で差分を確認 → JSON を更新する。
 */
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Node < 23 では pdfjs-dist が参照する Promise.try が未実装。
if (typeof (Promise as unknown as { try?: unknown }).try !== 'function') {
  ;(Promise as unknown as { try: typeof Promise.resolve }).try = function <T>(
    fn: (...args: unknown[]) => T | PromiseLike<T>,
    ...args: unknown[]
  ) {
    return new Promise<T>((res) => res(fn(...args)))
  } as typeof Promise.resolve
}

const { extractText, getDocumentProxy } = await import('unpdf')

const root = resolve(import.meta.dirname, '..')
const pdfPath = resolve(root, '../../idea/genAI-passport/syllabus.pdf')
const outPath = resolve(root, 'scripts/syllabus-raw.txt')

const bytes = await readFile(pdfPath)
const doc = await getDocumentProxy(new Uint8Array(bytes))
const { text, totalPages } = await extractText(doc, { mergePages: false })
const pages = Array.isArray(text) ? text : [text]

const body = pages
  .map((p, i) => `===== page ${i + 1} =====\n${p}`)
  .join('\n\n')
const header = `# syllabus raw text\n# source: ${pdfPath}\n# pages: ${totalPages}, chars: ${body.length}\n# regenerate: pnpm syllabus:rebuild\n\n`

await writeFile(outPath, header + body)
console.log(`ok  pages=${totalPages} chars=${body.length}`)
console.log(`out ${outPath}`)
