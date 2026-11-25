// Types for the picture engine, which is plain JavaScript (the tests and the picture build use it too).

/** A word of a sentence: its text and where it is in the sentence. */
export interface Token { t: string; at: number; k?: boolean }

/** Something a scene shows: a drawing, an emoji or a symbol, and the word that asked for it. */
export interface SceneItem { key: string; at: number; icon?: string; emoji?: string; sym?: string; label?: string }

/** A sentence's key point in words, for sentences with nothing to picture. */
export interface WordCard {
  kind: string; tag: string; label: string; say: string; sig: string
  main: Token[] | null; words: Token[]; first: number
}

/** What one sentence puts on the board: pictures and how they relate, a labelled diagram, or a word card. */
export interface Scene {
  show: boolean
  caption: string
  setting: string
  relation: string | null
  verb: string
  verbAt: number
  subjects: SceneItem[]
  objects: SceneItem[]
  then: { relation: string; verb: string; verbAt: number; objects: SceneItem[] } | null
  diagram?: string
  diagramAt?: number
  highlight?: string[]
  hlAts?: number[]
  imageDiagram?: boolean
  words?: WordCard
}

/** One sentence's scene as Claude plans it, or as a tuned lesson gives it. */
export interface PlanItem {
  i?: number
  show?: boolean
  subjects?: string[]
  relation?: string
  verb?: string
  objects?: string[]
  labels?: Record<string, string>
  then?: { relation: string; verb: string; objects: string[] }
  setting?: string
  caption?: string
  diagram?: string
}

/** The teacher's own word pictures: an emoji, "@" and a drawing's name, or "-" for none. */
export type Extra = Record<string, string>

/** What live talk carries from one phrase to the next. */
export interface TalkContext { words: string[]; subject: SceneItem | null; next: string[] }

/** The symbol table in public/symbols/index.json. */
export interface SymbolTable { words: Record<string, string>; phrases: Record<string, string>; minor?: string[]; override?: string[] }

export interface SceneEngineApi {
  analyze(text: string, extra: Extra, context?: TalkContext): Scene
  sceneFromAI(item: PlanItem, text: string, extra: Extra): Scene | null
  wordScene(text: string, opt?: { live?: boolean }): Scene
  diagramScene(text: string, key?: string): Scene | null
  renderScene(sc: Scene): string
  splitSpoken(text: string): string[]
  dangling(text: string): boolean
  normalize(word: string): string
  lookup(word: string, extra: Extra): { icon?: string; emoji?: string; sym?: string; key?: string } | null | undefined
  isUnsure(word: string, extra: Extra): boolean
  // what a scene shows and when
  firstAt(sc: Scene): number
  highlightAts(sc: Scene): Record<number, boolean>
  sceneKeys(sc: Scene): string[]
  sceneWords(sc: Scene): string[]
  sceneIcons(sc: Scene): string[]
  buildPlanPrompt(sentences: string[], extraWords: string[]): string
  // galleries and counts for the Pictures panel
  iconSVG(key: string): string
  vocabFor(key: string): string[]
  iconGallery(): { key: string; name: string; words: string[]; svg: string }[]
  diagramGallery(): { key: string; title: string; say: string[]; svg: string }[]
  readonly iconCount: number
  readonly diagramCount: number
  readonly wordCount: number
  readonly symbolCount: number
  readonly emojiCount: number
  ICONS: Record<string, unknown>
  // pictures that arrive after the first screen
  setOpenMoji(bundle: unknown): void
  hasOpenMoji(): boolean
  setSymbols(table: SymbolTable): void
  setAssetBase(base: string): void
  symbolArt(name: string): string
  // for the asset tests
  symbolTable(): { words: Record<string, string>; phrases: Record<string, string> }
  imageDiagrams(): { key: string; title: string; file: string }[]
  emojiList(): string[]
}

export declare const SceneEngine: SceneEngineApi
export default SceneEngine
