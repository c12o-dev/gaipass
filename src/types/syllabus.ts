export type ChapterId = 1 | 2 | 3 | 4 | 5

export interface Section {
  title: string
  goal: string
  items: string[]
  keywords: string[]
}

export interface Chapter {
  id: ChapterId
  title: string
  sections: Section[]
}

export interface Revision {
  chapter: ChapterId
  date: string
  points: string[]
  addedItems?: string[]
  addedKeywords?: string[]
}

export interface Syllabus {
  version: string
  source: string
  chapters: Chapter[]
  revisions: Revision[]
}
