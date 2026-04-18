import type { Syllabus } from '../types/syllabus'
import data from './syllabus.json'

const syllabus = data as Syllabus

export default syllabus

export const allKeywords = (): string[] => {
  const set = new Set<string>()
  for (const c of syllabus.chapters) {
    for (const s of c.sections) {
      for (const k of s.keywords) set.add(k)
    }
  }
  return [...set]
}

export const findSectionByKeyword = (keyword: string) => {
  for (const c of syllabus.chapters) {
    for (const s of c.sections) {
      if (s.keywords.includes(keyword)) return { chapter: c, section: s }
    }
  }
  return null
}
