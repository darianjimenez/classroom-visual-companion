// Lets the tests import the app's TypeScript (the store) as the app's own build would: TypeScript only strips the types.
import { register } from "node:module"
register("./ts-loader.mjs", import.meta.url)
