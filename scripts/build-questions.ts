/**
 * src/data/questions/ 配下の .md を読み込み、1つの JSON に統合する。
 * 同時に妥当性チェックを行い、不正があれば非ゼロ終了する。
 */
import { readFile, writeFile } from 'node:fs/promises'
import { glob } from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import matter from 'gray-matter'
import type {
  Question,
  QuestionBank,
  Difficulty,
} from '../src/types/question'
import type { Syllabus } from '../src/types/syllabus'

const root = resolve(import.meta.dirname, '..')
const questionsDir = resolve(root, 'src/data/questions')
const outPath = resolve(root, 'src/data/questions.generated.json')
const syllabusPath = resolve(root, 'src/data/syllabus.json')

const syllabusRaw = await readFile(syllabusPath, 'utf8')
const syllabus = JSON.parse(syllabusRaw) as Syllabus
const keywordSet = new Set<string>()
for (const c of syllabus.chapters) {
  for (const s of c.sections) for (const k of s.keywords) keywordSet.add(k)
}

const errors: string[] = []
const seenIds = new Set<string>()
const questions: Question[] = []

const files: string[] = []
for await (const entry of glob('**/*.md', { cwd: questionsDir })) {
  if (entry === 'README.md' || entry === 'template.md') continue
  files.push(entry)
}
files.sort()

for (const rel of files) {
  const abs = resolve(questionsDir, rel)
  const src = await readFile(abs, 'utf8')
  const parsed = matter(src)
  const data = parsed.data as Record<string, unknown>
  const body = parsed.content

  const fail = (msg: string) =>
    errors.push(`${relative(root, abs)}: ${msg}`)

  const { stem, choices, explanation } = parseBody(body, fail)

  const id = String(data.id ?? '')
  if (!id) fail('frontmatter `id` is required')
  if (seenIds.has(id)) fail(`duplicate id "${id}"`)
  seenIds.add(id)

  const chapter = data.chapter as number
  if (![1, 2, 3, 4, 5].includes(chapter))
    fail(`chapter must be 1..5 (got ${chapter})`)

  const section = String(data.section ?? '')
  const keyword = String(data.keyword ?? '')
  if (!keywordSet.has(keyword))
    fail(`keyword "${keyword}" not in syllabus`)

  const difficulty = data.difficulty as Difficulty
  if (![1, 2, 3].includes(difficulty))
    fail(`difficulty must be 1..3 (got ${difficulty})`)

  const answer = data.answer as number
  if (!Number.isInteger(answer) || answer < 0 || answer > 3)
    fail(`answer must be 0..3 (got ${answer})`)

  if (choices.length !== 4)
    fail(`choices must have exactly 4 items (got ${choices.length})`)

  const sources = Array.isArray(data.sources)
    ? (data.sources as string[])
    : undefined

  questions.push({
    id,
    chapter: chapter as 1 | 2 | 3 | 4 | 5,
    section,
    keyword,
    difficulty,
    stem,
    choices: choices as [string, string, string, string],
    answer: answer as 0 | 1 | 2 | 3,
    explanation,
    sources,
  })
}

if (errors.length > 0) {
  console.error('❌ validation failed:')
  for (const e of errors) console.error('  -', e)
  process.exit(1)
}

const bank: QuestionBank = {
  version: syllabus.version,
  generatedAt: new Date().toISOString(),
  questions,
}

await writeFile(outPath, JSON.stringify(bank, null, 2) + '\n')
console.log(`ok  ${questions.length} questions → ${relative(root, outPath)}`)

function parseBody(
  body: string,
  fail: (msg: string) => void,
): { stem: string; choices: string[]; explanation: string } {
  const sections: Record<string, string[]> = {}
  let current: string | null = null
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^#\s+(.+?)\s*$/)
    if (m) {
      current = m[1].trim()
      sections[current] = []
    } else if (current) {
      sections[current].push(line)
    }
  }
  const get = (key: string) => (sections[key] ?? []).join('\n').trim()

  const stem = get('問題')
  const explanation = get('解説')
  const choicesRaw = get('選択肢')
  const choices = choicesRaw
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*]\s+/, '').trim())
    .filter((l) => l.length > 0)

  if (!stem) fail('missing `# 問題` section')
  if (!explanation) fail('missing `# 解説` section')
  if (choices.length === 0) fail('missing `# 選択肢` list')

  return { stem, choices, explanation }
}
