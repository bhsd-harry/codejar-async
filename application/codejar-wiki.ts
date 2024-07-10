import 'https://testingcf.jsdelivr.net/npm/wikiparser-node@browser/extensions/dist/base.min.js'
import {CodeJar as CodeJarAsync} from '../codejar'

declare const wikiparse: {
  id: number
  print(text: string, include?: boolean, stage?: number, id?: number): Promise<[number, string, string][]>
}

const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'https://testingcf.jsdelivr.net/npm/wikiparser-node@browser/extensions/ui.min.css'
document.head.append(link)

export const CodeJar = (textarea: HTMLTextAreaElement, include?: boolean): CodeJarAsync => {
  const id = wikiparse.id++
  const highlight = async (ele: HTMLElement) => {
    return (await wikiparse.print(ele.textContent!, include, undefined, id)).map(([,, printed]) => printed).join('')
  }

  const editor = document.createElement('div')
  const {font, lineHeight, padding, background} = getComputedStyle(textarea)
  const {offsetHeight, style: {height}} = textarea
  editor.textContent = textarea.value
  editor.style.height = offsetHeight ? `${offsetHeight}px` : height
  editor.style.minHeight = '100px'
  editor.style.boxSizing = 'border-box'
  editor.style.font = font
  editor.style.lineHeight = lineHeight
  editor.style.padding = padding
  editor.style.background = background
  textarea.after(editor)
  textarea.style.display = 'none'

  editor.focus()
  const jar = CodeJarAsync(editor, highlight, {spellcheck: true})
  textarea.form?.addEventListener('submit', () => {
    textarea.value = jar.toString()
  })
  return jar
}
