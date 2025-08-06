# tsb - typescript simple builder

tsb is a dumb simple command-line tool that wraps around `tsc` and makes compiling .ts files less annoying.  
no bs, no setup, just build and go.

---

## requirements

* [Node.js](https://nodejs.org/) v14 or higher
* [TypeScript](https://www.npmjs.com/package/typescript) (installed globally: `npm i -g typescript`)
* if you're running the **source version**, you’ll also need git
* if you're running the **binary version**, just make sure you’re on windows

---

## install

you can either download the latest release, or run uncompiled.
> [!NOTE]
> the binary is currently for windows only. if your computer can not run the binary, just use the source code version.

for uncompiled, run the following:

```bash
git clone https://github.com/mysticaldumbo/tsb
cd tsb
````

use it like this:

```bash
node tsb.js <your-file.ts> [options]
```

or if you downloaded a binary version from releases:
- add the directory of tsb.exe to your path
- use it like this:
```bash
tsb <your-file.ts> [options]
```

---

## usage (for source)

```bash
node tsb.js <file.ts> [options]
```

example:

```bash
node tsb.js src/main.ts --outDir dist --force --autorun
```

the binary version is the same, except `node tsb.js` is simply replaced with `tsb`

---

## extra options

| flag            | description                                     |
| ----------------| ----------------------------------------------- |
| `--help`        | show usage info                                 |
| `--force`       | overwrite output file without asking            |
| `--silent`      | disable all logs + prompts unless it's an error |
| `--autorun`     | run the built .js file automatically            |
| `--outDir`      | put compiled file(s) in a specific dir          |
|  `--outputName` | change the output name

---

## examples (source)

```bash
# basic compile
node tsb.js hello.ts

# force overwrite
node tsb.js hello.ts --force

# compile and run
node tsb.js hello.ts --autorun

# compile to a folder
node tsb.js hello.ts --outDir dist

# compile from a folder
node tsb.js src/hello.ts

# compile multiple files
node tsb.js one.ts two.ts --outDir dist --force
```
again, if you are using a binary, replace `node tsb.js` with `tsb`

---

## notes

* if you have a `tsconfig.json`, tsb will use it automatically.
* multiple `.ts` files can be passed.
* compiled files will always have the same name as the input `.ts` file.
* this just wraps `tsc`, so make sure it's installed (`npm i -g typescript`).
* `tsb` is dev-focused, meant for people who write TypeScript by hand and wanna keep control.

---

## known issues

* doesn’t support `.tsx`, not built for react or frontend build stuff.
* if you pass no `.ts` files, it won’t build anything (duh).
* this doesn’t bundle or minify. just compiles.

## why?

typescript is great, but i found tsc to be a bit annoying and boring.  
tsb uses tsc as a base, but with a redesign and an easy-to-use system.
along with trying to make my own compiler, i made this because i was just starting to learn typescript and wanted to put what i already knew from javascript to make my own compiler to easily run my test typescript files. i started learning typescript as i thought recently i was too focused on python projects and needed to try something else, and knew that i can already do lots in typescript since i already know a good bit of javascript.

---
