// where a Commons diagram is kept in the download cache: its file name made safe, with the type the app uses
export function cacheName(file, as) { return file.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/\.svg$/, "." + as) }
