import 'https://testingcf.jsdelivr.net/npm/wikiparser-node@browser/extensions/dist/base.min.js'
import {CodeJar as CodeJarAsync} from '../codejar'

declare const wikiparse: {
  print(text: string, include?: boolean): Promise<[number, string, string][]>
}

export const CodeJar = (textarea: HTMLTextAreaElement, include?: boolean): CodeJarAsync => {
  const highlight = async (ele: HTMLElement) => {
    return (await wikiparse.print(ele.textContent!, include)).map(([,, printed]) => printed).join('')
  }

  const editor = document.createElement('div')
  textarea.after(editor)
  textarea.style.display = 'none'
  return CodeJarAsync(editor, highlight, {spellcheck: true})
}
