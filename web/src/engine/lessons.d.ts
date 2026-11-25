// Types for the built-in lesson library (lessons.js).
import type { PlanItem } from "./index.js"

export interface Lesson {
  id: string
  subject: string
  grade?: string
  title: string
  text: string
  /** hand-tuned scenes, by sentence number from 1 */
  plan?: Record<number, PlanItem>
}

export declare const LESSONS: Lesson[]
