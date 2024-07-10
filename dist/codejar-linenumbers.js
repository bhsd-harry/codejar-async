// This class was copied from https://github.com/julianpoemp/codejar-linenumbers/blob/v1.0.1/src/codejar-linenumbers.ts
// and adapted to work with CodeJar-async
export function withLineNumbers(highlight, options = {}) {
    const opts = {
        class: "codejar-linenumbers",
        wrapClass: "codejar-wrap",
        width: "35px",
        backgroundColor: "rgba(128, 128, 128, 0.15)",
        color: "",
        ...options,
    };
    let lineNumbers;
    return function (editor) {
        if (!lineNumbers) {
            lineNumbers = init(editor, opts);
            editor.addEventListener("scroll", () => {
                lineNumbers.style.top = `-${editor.scrollTop}px`;
            });
            editor.focus();
        }
        const code = editor.textContent || "";
        const linesCount = code.replace(/\n$/g, "").split("\n").length;
        let text = "";
        for (let i = 0; i < linesCount; i++) {
            text += `${i + 1}\n`;
        }
        lineNumbers.innerText = text;
        return highlight(editor);
    };
}
function init(editor, opts) {
    const css = getComputedStyle(editor);
    const wrap = document.createElement("div");
    wrap.className = opts.wrapClass;
    wrap.style.position = "relative";
    const innerWrap = document.createElement("div");
    innerWrap.className = "codejar-linenumbers-inner-wrap";
    innerWrap.style.background = css.background;
    innerWrap.style.marginTop = css.borderTopWidth;
    innerWrap.style.marginBottom = css.borderBottomWidth;
    innerWrap.style.marginLeft = css.borderLeftWidth;
    innerWrap.style.borderTopLeftRadius = css.borderTopLeftRadius;
    innerWrap.style.borderBottomLeftRadius = css.borderBottomLeftRadius;
    const gutter = document.createElement("div");
    gutter.className = opts.class;
    innerWrap.appendChild(gutter);
    wrap.appendChild(innerWrap);
    // Add own styles
    gutter.style.width = opts.width;
    gutter.style.overflow = "hidden";
    gutter.style.backgroundColor = opts.backgroundColor;
    // Copy editor styles
    gutter.style.fontFamily = css.fontFamily;
    gutter.style.fontSize = css.fontSize;
    gutter.style.lineHeight = css.lineHeight;
    gutter.style.paddingTop = `calc(${css.paddingTop})`;
    gutter.style.paddingLeft = css.paddingLeft;
    gutter.style.borderTopLeftRadius = css.borderTopLeftRadius;
    gutter.style.borderBottomLeftRadius = css.borderBottomLeftRadius;
    // Add line numbers
    const lineNumbers = document.createElement("div");
    lineNumbers.setAttribute("class", "codejar-linenumber");
    lineNumbers.style.color = opts.color || css.color;
    lineNumbers.style.setProperty("mix-blend-mode", "unset");
    gutter.appendChild(lineNumbers);
    // Tweak editor styles
    editor.style.paddingLeft = `calc(${opts.width} + ${gutter.style.paddingLeft} + 5px)`;
    editor.style.whiteSpace = "pre";
    // Swap editor with a wrap
    editor.parentNode.insertBefore(wrap, editor);
    wrap.appendChild(editor);
    return lineNumbers;
}
