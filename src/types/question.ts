import type { ChapterId } from './syllabus'

export type Difficulty = 1 | 2 | 3

export interface Question {
  id: string
  chapter: ChapterId
  section: string
  keyword: string
  difficulty: Difficulty
  stem: string
  choices: [string, string, string, string]
  answer: 0 | 1 | 2 | 3
  explanation: string
  sources?: string[]
}

export interface QuestionBank {
  version: string
  generatedAt: string
  questions: Question[]
}
