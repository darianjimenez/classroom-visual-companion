// Module hook: .ts files are turned into JavaScript with the project's own TypeScript (types removed, nothing checked:
// `npm run typecheck` does that).
import { readFile } from "node:fs/promises"
import ts from "typescript"

export async function load(url, context, next) {
  if (!url.endsWith(".ts")) return next(url, context)
  const source = await readFile(new URL(url), "utf8")
  const out = ts.transpileModule(source, {
    fileName: url,
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: true },
  })
  return { format: "module", source: out.outputText, shortCircuit: true }
}
