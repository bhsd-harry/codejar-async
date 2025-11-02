import {CodeJar} from './codejar.js'
import type {ConfigData} from 'wikiparser-node'
import type {} from 'wikiparser-node/extensions/typings.d.ts'

// Must be global before importing `wikiparse.codejar`
Object.assign(globalThis, {CodeJar});

(async () => {
  await import('/wikiparser-node/extensions/dist/codejar.js')

  const config: ConfigData = await (await fetch('/wikiparser-node/config/default.json')).json()
  wikiparse.setConfig(config)

  const jar = (await wikiparse.codejar)!(document.querySelector('textarea')!, false, true)
  Object.assign(globalThis, {jar})

  jar.updateCode(localStorage.getItem('code')!)
  jar.onUpdate((code: string) => {
    localStorage.setItem('code', code)
  })
})()
