import { CodeJar } from './codejar.js';
// Must be global before importing `wikiparse.codejar`
Object.assign(globalThis, { CodeJar });
(async () => {
    await import('/wikiparser-node/extensions/dist/codejar.js');
    const config = await (await fetch('/wikiparser-node/config/default.json')).json();
    wikiparse.setConfig(config);
    const jar = (await wikiparse.codejar)(document.querySelector('textarea'), false, true);
    Object.assign(globalThis, { jar });
    jar.updateCode(localStorage.getItem('code'));
    jar.onUpdate((code) => {
        localStorage.setItem('code', code);
    });
})();
