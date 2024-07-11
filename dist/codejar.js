const globalWindow = window;
export function CodeJar(editor, highlight, opt = {}) {
    const options = {
        spellcheck: false,
        preserveIdent: true,
        history: true,
        window: globalWindow,
        ...opt,
    };
    const window = options.window;
    const document = window.document;
    const listeners = [];
    const history = [];
    let at = -1;
    let focus = false;
    let onUpdate = () => void 0;
    let prev; // code content prior keydown event
    editor.setAttribute('contenteditable', 'plaintext-only');
    editor.setAttribute('spellcheck', options.spellcheck ? 'true' : 'false');
    editor.style.outline = 'none';
    editor.style.overflowWrap = 'break-word';
    editor.style.overflowY = 'auto';
    editor.style.whiteSpace = 'pre-wrap';
    let running;
    /**
     * Execute the highlight
     * @description
     * - After the highlight is done, check if `this.text` has changed
     * - If it has, start a new highlight
     * - Always render the result of the latest highlight
     */
    async function print() {
        const text = toString();
        const html = await highlight(editor);
        if (toString() === text) {
            running = false;
            const pos = save();
            editor.innerHTML = html;
            restore(pos);
            recordHistory();
            return;
        }
        return print();
    }
    /**
     * Submit a new text to be highlighted
     * @description
     * - Always update `this.text` so that `this.print()` can check if a new highlight is needed
     * - If there is a running highlight, return the result of that highlight
     * - Otherwise start a new highlight
     */
    const doHighlight = () => {
        if (!running) {
            running = true;
            void print();
        }
    };
    let isLegacy = false; // true if plaintext-only is not supported
    if (editor.contentEditable !== 'plaintext-only')
        isLegacy = true;
    if (isLegacy)
        editor.setAttribute('contenteditable', 'true');
    const debounceHighlight = debounce(() => {
        doHighlight();
    }, 30);
    let recording = false;
    const shouldRecord = (event) => {
        return !isUndo(event) && !isRedo(event)
            && event.key !== 'Meta'
            && event.key !== 'Control'
            && event.key !== 'Alt'
            && !event.key.startsWith('Arrow');
    };
    const debounceRecordHistory = debounce((event) => {
        if (shouldRecord(event)) {
            recordHistory();
            recording = false;
        }
    }, 300);
    const on = (type, fn) => {
        listeners.push([type, fn]);
        editor.addEventListener(type, fn);
    };
    on('keydown', event => {
        if (event.defaultPrevented)
            return;
        prev = toString();
        if (options.preserveIdent)
            handleNewLine(event);
        else
            legacyNewLineFix(event);
        if (options.history) {
            handleUndoRedo(event);
            if (shouldRecord(event) && !recording) {
                recordHistory();
                recording = true;
            }
        }
        if (isLegacy && !isCopy(event))
            restore(save());
    });
    on('keyup', event => {
        if (event.defaultPrevented)
            return;
        if (event.isComposing)
            return;
        if (prev !== toString())
            debounceHighlight();
        debounceRecordHistory(event);
        onUpdate(toString());
    });
    on('focus', _event => {
        focus = true;
    });
    on('blur', _event => {
        focus = false;
    });
    on('paste', event => {
        recordHistory();
        handlePaste(event);
        recordHistory();
        onUpdate(toString());
    });
    on('cut', event => {
        recordHistory();
        handleCut(event);
        recordHistory();
        onUpdate(toString());
    });
    function save() {
        const s = getSelection();
        const pos = { start: 0, end: 0, dir: undefined };
        let { anchorNode, anchorOffset, focusNode, focusOffset } = s;
        if (!anchorNode || !focusNode)
            throw 'error1';
        // If the anchor and focus are the editor element, return either a full
        // highlight or a start/end cursor position depending on the selection
        if (anchorNode === editor && focusNode === editor) {
            pos.start = (anchorOffset > 0 && editor.textContent) ? editor.textContent.length : 0;
            pos.end = (focusOffset > 0 && editor.textContent) ? editor.textContent.length : 0;
            pos.dir = (focusOffset >= anchorOffset) ? '->' : '<-';
            return pos;
        }
        // Selection anchor and focus are expected to be text nodes,
        // so normalize them.
        if (anchorNode.nodeType === Node.ELEMENT_NODE) {
            const node = document.createTextNode('');
            anchorNode.insertBefore(node, anchorNode.childNodes[anchorOffset]);
            anchorNode = node;
            anchorOffset = 0;
        }
        if (focusNode.nodeType === Node.ELEMENT_NODE) {
            const node = document.createTextNode('');
            focusNode.insertBefore(node, focusNode.childNodes[focusOffset]);
            focusNode = node;
            focusOffset = 0;
        }
        visit(el => {
            if (el === anchorNode && el === focusNode) {
                pos.start += anchorOffset;
                pos.end += focusOffset;
                pos.dir = anchorOffset <= focusOffset ? '->' : '<-';
                return 'stop';
            }
            if (el === anchorNode) {
                pos.start += anchorOffset;
                if (!pos.dir) {
                    pos.dir = '->';
                }
                else {
                    return 'stop';
                }
            }
            else if (el === focusNode) {
                pos.end += focusOffset;
                if (!pos.dir) {
                    pos.dir = '<-';
                }
                else {
                    return 'stop';
                }
            }
            if (el.nodeType === Node.TEXT_NODE) {
                if (pos.dir != '->')
                    pos.start += el.nodeValue.length;
                if (pos.dir != '<-')
                    pos.end += el.nodeValue.length;
            }
        });
        editor.normalize(); // collapse empty text nodes
        return pos;
    }
    function restore(pos) {
        var _a, _b;
        const s = getSelection();
        let startNode, startOffset = 0;
        let endNode, endOffset = 0;
        if (!pos.dir)
            pos.dir = '->';
        if (pos.start < 0)
            pos.start = 0;
        if (pos.end < 0)
            pos.end = 0;
        // Flip start and end if the direction reversed
        if (pos.dir == '<-') {
            const { start, end } = pos;
            pos.start = end;
            pos.end = start;
        }
        let current = 0;
        visit(el => {
            if (el.nodeType !== Node.TEXT_NODE)
                return;
            const len = (el.nodeValue || '').length;
            if (current + len > pos.start) {
                if (!startNode) {
                    startNode = el;
                    startOffset = pos.start - current;
                }
                if (current + len > pos.end) {
                    endNode = el;
                    endOffset = pos.end - current;
                    return 'stop';
                }
            }
            current += len;
        });
        if (!startNode)
            startNode = editor, startOffset = editor.childNodes.length;
        if (!endNode)
            endNode = editor, endOffset = editor.childNodes.length;
        // Flip back the selection
        if (pos.dir == '<-') {
            [startNode, startOffset, endNode, endOffset] = [endNode, endOffset, startNode, startOffset];
        }
        {
            // If nodes not editable, create a text node.
            const startEl = uneditable(startNode);
            if (startEl) {
                const node = document.createTextNode('');
                (_a = startEl.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(node, startEl);
                startNode = node;
                startOffset = 0;
            }
            const endEl = uneditable(endNode);
            if (endEl) {
                const node = document.createTextNode('');
                (_b = endEl.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(node, endEl);
                endNode = node;
                endOffset = 0;
            }
        }
        s.setBaseAndExtent(startNode, startOffset, endNode, endOffset);
        editor.normalize(); // collapse empty text nodes
    }
    function uneditable(node) {
        while (node && node !== editor) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node;
                if (el.getAttribute('contenteditable') == 'false') {
                    return el;
                }
            }
            node = node.parentNode;
        }
    }
    function beforeCursor() {
        const s = getSelection();
        const r0 = s.getRangeAt(0);
        const r = document.createRange();
        r.selectNodeContents(editor);
        r.setEnd(r0.startContainer, r0.startOffset);
        return r.toString();
    }
    function afterCursor() {
        const s = getSelection();
        const r0 = s.getRangeAt(0);
        const r = document.createRange();
        r.selectNodeContents(editor);
        r.setStart(r0.endContainer, r0.endOffset);
        return r.toString();
    }
    function handleNewLine(event) {
        if (event.key === 'Enter') {
            const before = beforeCursor();
            let [padding] = findPadding(before);
            let newLinePadding = padding;
            // Preserve padding
            if (newLinePadding.length > 0) {
                preventDefault(event);
                event.stopPropagation();
                insert('\n' + newLinePadding);
            }
            else {
                legacyNewLineFix(event);
            }
        }
    }
    function legacyNewLineFix(event) {
        // Firefox does not support plaintext-only mode
        // and puts <div><br></div> on Enter. Let's help.
        if (isLegacy && event.key === 'Enter') {
            preventDefault(event);
            event.stopPropagation();
            if (afterCursor() == '') {
                insert('\n ');
                const pos = save();
                pos.start = --pos.end;
                restore(pos);
            }
            else {
                insert('\n');
            }
        }
    }
    function handleUndoRedo(event) {
        if (isUndo(event)) {
            preventDefault(event);
            at--;
            const record = history[at];
            if (record) {
                editor.innerHTML = record.html;
                restore(record.pos);
            }
            if (at < 0)
                at = 0;
        }
        if (isRedo(event)) {
            preventDefault(event);
            at++;
            const record = history[at];
            if (record) {
                editor.innerHTML = record.html;
                restore(record.pos);
            }
            if (at >= history.length)
                at--;
        }
    }
    function recordHistory() {
        if (!focus)
            return;
        const text = toString();
        const html = editor.innerHTML;
        const pos = save();
        const lastRecord = history[at];
        if (lastRecord) {
            if (lastRecord.html === html
                && lastRecord.pos.start === pos.start
                && lastRecord.pos.end === pos.end)
                return;
        }
        if ((lastRecord === null || lastRecord === void 0 ? void 0 : lastRecord.text) !== text)
            at++;
        history[at] = { text, html, pos };
        history.splice(at + 1);
        const maxHistory = 300;
        if (at > maxHistory) {
            at = maxHistory;
            history.splice(0, 1);
        }
    }
    function handlePaste(event) {
        var _a;
        if (event.defaultPrevented)
            return;
        preventDefault(event);
        const originalEvent = (_a = event.originalEvent) !== null && _a !== void 0 ? _a : event;
        const text = originalEvent.clipboardData.getData('text/plain').replace(/\r\n?/g, '\n');
        insert(text);
        doHighlight();
    }
    function handleCut(event) {
        var _a;
        const selection = getSelection();
        const originalEvent = (_a = event.originalEvent) !== null && _a !== void 0 ? _a : event;
        originalEvent.clipboardData.setData('text/plain', selection.toString());
        document.execCommand('delete');
        doHighlight();
        preventDefault(event);
    }
    function visit(visitor) {
        const queue = [];
        if (editor.firstChild)
            queue.push(editor.firstChild);
        let el = queue.pop();
        while (el) {
            if (visitor(el) === 'stop')
                break;
            if (el.nextSibling)
                queue.push(el.nextSibling);
            if (el.firstChild)
                queue.push(el.firstChild);
            el = queue.pop();
        }
    }
    function isCtrl(event) {
        return event.metaKey || event.ctrlKey;
    }
    function isUndo(event) {
        return isCtrl(event) && !event.shiftKey && getKeyCode(event) === 'Z';
    }
    function isRedo(event) {
        return isCtrl(event) && event.shiftKey && getKeyCode(event) === 'Z';
    }
    function isCopy(event) {
        return isCtrl(event) && getKeyCode(event) === 'C';
    }
    function getKeyCode(event) {
        let key = event.key || event.keyCode || event.which;
        if (!key)
            return undefined;
        return (typeof key === 'string' ? key : String.fromCharCode(key)).toUpperCase();
    }
    function insert(text) {
        text = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        document.execCommand('insertHTML', false, text);
    }
    function debounce(cb, wait) {
        let timeout = 0;
        return (...args) => {
            clearTimeout(timeout);
            timeout = window.setTimeout(() => cb(...args), wait);
        };
    }
    function findPadding(text) {
        // Find beginning of previous line.
        let i = text.length - 1;
        while (i >= 0 && text[i] !== '\n')
            i--;
        i++;
        // Find padding of the line.
        let j = i;
        while (j < text.length && /[ \t]/.test(text[j]))
            j++;
        return [text.substring(i, j) || '', i, j];
    }
    function toString() {
        return editor.textContent || '';
    }
    function preventDefault(event) {
        event.preventDefault();
    }
    function getSelection() {
        // @ts-ignore
        return editor.getRootNode().getSelection();
    }
    return {
        updateOptions(newOptions) {
            Object.assign(options, newOptions);
        },
        updateCode(code, callOnUpdate = true) {
            editor.textContent = code;
            doHighlight();
            callOnUpdate && onUpdate(code);
        },
        onUpdate(callback) {
            onUpdate = callback;
        },
        toString,
        save,
        restore,
        recordHistory,
        destroy() {
            for (let [type, fn] of listeners) {
                editor.removeEventListener(type, fn);
            }
        },
    };
}
