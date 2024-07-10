<p align="center"><a href="https://medv.io/codejar/"><img src="https://medv.io/assets/codejar.svg" width="72"></a></p>
<h3 align="center">CodeJar – an embeddable code editor for the browser</h3>
<p align="center"><a href="https://medv.io/codejar/"><img src="https://medv.io/assets/codejar/screenshot.png" width="709"></a></p>

[![npm](https://img.shields.io/npm/v/codejar-async?color=brightgreen)](https://www.npmjs.com/package/codejar-async)

## Features

* Lightweight (**2.45 kB** only)
* No dependencies
* Async highlighting
* Supports **undo**/**redo**

## Getting Started

Install CodeJar 🍯 &nbsp; via npm:

```bash
npm i codejar-async
```

Create an element and init the CodeJar 🍯:

```html
<div class="editor"></div>
<script>
  let jar = CodeJar(document.querySelector('.editor'), highlight)
</script>
```

Second argument to `CodeJar` is a highlighting function (like Prism.js, highlight.js):

```ts
const highlight = async (code: string) => {
  code = code.replace('foo', '<span style="color: red">foo</span>')
  return code
}

const jar = CodeJar(editor, highlight)
```

Third argument to `CodeJar` is options:

- `spellcheck: boolean` enables spellchecking on the editor. Default `false`.
- `history` records history. Default `true`.
- `window` window object. Default: `window`.

```js
const options = {
  spellcheck: true, // default is false
}

const jar = CodeJar(editor, highlight, options)
```

## API

### `updateCode(string)`

Updates the code.

```js
jar.updateCode(`let foo = bar`)
```

### `updateOptions(Partial<Options>)`

Updates the options.

```js
jar.updateOptions({spellcheck: true})
```

### `onUpdate((code: string) => void)`

Calls callback on code updates.

```js
jar.onUpdate(code => {
  console.log(code)
})
```

### `toString(): string`

Return current code.

```js
let code = jar.toString()
```

### `save(): string`

Saves current cursor position.

```js
let pos = jar.save()
```

### `restore(pos: Position)`

Restore cursor position.

```js
jar.restore(pos)
```

### `recordHistory()`

Saves current editor state to history.

### `destroy()`

Removes event listeners from editor.

## Related

* [react-codejar](https://github.com/guilhermelimak/react-codejar) - a React wrapper for CodeJar.
* [ngx-codejar](https://github.com/julianpoemp/ngx-codejar) - an Angular wrapper for CodeJar.
* [codejar-linenumbers](https://github.com/julianpoemp/codejar-linenumbers) - an JS library for line numbers.

## License

[MIT](LICENSE)
