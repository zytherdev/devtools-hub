(function () {
    "use strict";

    const inputEl = document.getElementById("inputJS");
    const outputEl = document.getElementById("outputJS");
    const minifyBtn = document.getElementById("minifyBtn");
    const clearBtn = document.getElementById("clearBtn");
    const copyBtn = document.getElementById("copyBtn");
    const sampleBtn = document.getElementById("sampleBtn");

    const inputCharCount = document.getElementById("inputCharCount");
    const outputCharCount = document.getElementById("outputCharCount");
    const minifyStats = document.getElementById("minifyStats");
    const copyFeedback = document.getElementById("copyFeedback");

    function minifyJS(code) {
        if (typeof code !== "string" || !code.trim()) return "";

        let out = "";
        let i = 0;
        let state = "code";
        let quote = "";
        let previousToken = "";

        const len = code.length;

        const isWS = c => c !== undefined && /\s/.test(c);

        const isId = c =>
            c !== undefined && /[A-Za-z0-9_$]/.test(c);

        const canStartRegex = token =>
            !token ||
            /^(?:return|throw|case|delete|void|typeof|instanceof|in|of|yield|await|else|do|new)$/.test(token) ||
            /[({[=,:;!&|?+\-*%^~<>]$/.test(token);

        const peek = n => code[i + n];

        while (i < len) {
            const c = code[i];
            const n = peek(1);

            if (state === "string") {
                out += c;

                if (c === "\\") {
                    if (n !== undefined) {
                        out += n;
                        i += 2;
                        continue;
                    }
                }

                if (c === quote) {
                    state = "code";
                    quote = "";
                }

                i++;
                continue;
            }


            if (state === "template") {
                out += c;

                if (c === "\\") {
                    if (n !== undefined) {
                        out += n;
                        i += 2;
                        continue;
                    }
                }

                if (c === "`") {
                    state = "code";
                }

                i++;
                continue;
            }


            if (state === "regex") {
                out += c;

                if (c === "\\") {
                    if (n !== undefined) {
                        out += n;
                        i += 2;
                        continue;
                    }
                }

                if (c === "[") {
                    state = "regexClass";
                    i++;
                    continue;
                }

                if (c === "/") {
                    state = "code";
                    i++;

                    while (i < len && /[a-z]/i.test(code[i])) {
                        out += code[i++];
                    }

                    continue;
                }

                i++;
                continue;
            }

            if (state === "regexClass") {
                out += c;

                if (c === "\\") {
                    if (n !== undefined) {
                        out += n;
                        i += 2;
                        continue;
                    }
                }

                if (c === "]") {
                    state = "regex";
                }

                i++;
                continue;
            }


            if (c === "'" || c === '"') {
                state = "string";
                quote = c;
                out += c;
                i++;
                continue;
            }

            if (c === "`") {
                state = "template";
                out += c;
                i++;
                continue;
            }

            if (c === "/" && n === "/") {
                i += 2;

                while (
                    i < len &&
                    code[i] !== "\n" &&
                    code[i] !== "\r"
                ) {
                    i++;
                }

                continue;
            }


            if (c === "/" && n === "*") {
                i += 2;

                while (
                    i < len &&
                    !(code[i] === "*" && code[i + 1] === "/")
                ) {
                    i++;
                }

                i += 2;

                /*
                * a comment between two identifiers still needs
                * one separator.
                *
                */
                if (
                    out &&
                    i < len &&
                    isId(out[out.length - 1]) &&
                    isId(code[i])
                ) {
                    out += " ";
                }

                continue;
            }


            if (
                c === "/" &&
                n !== "/" &&
                n !== "*" &&
                canStartRegex(previousToken)
            ) {
                state = "regex";
                out += c;
                i++;
                continue;
            }

            if (isWS(c)) {
                let j = i;

                while (j < len && isWS(code[j])) {
                    j++;
                }

                const prev = out[out.length - 1];
                const next = code[j];

                /*
                * whitespace is needed ONLY when both sides can form
                * one identifier/token.
                *
                * const value -> const value
                *
                * pero:
                *
                * ; const -> ;const
                * ) {      -> ){
                * = value  -> =value
                * , value  -> ,value
                */
                if (isId(prev) && isId(next)) {
                    out += " ";
                }

                i = j;
                continue;
            }


            out += c;

            // trk the prev token.
            if (isId(c)) {
                let j = out.length - 1;

                while (j >= 0 && isId(out[j])) {
                    j--;
                }

                previousToken = out.slice(j + 1);
            } else {
                previousToken = c;
            }

            i++;
        }


        return out
            .trim()

            // rm unnecessary ; bf }
            .replace(/;}/g, "}")

            // boolean literals
            .replace(/\btrue\b/g, "!0")
            .replace(/\bfalse\b/g, "!1");
    }


    function updateStats() {
        const inputLength = inputEl.value.length;
        const outputLength = outputEl.value.length;

        inputCharCount.textContent = inputLength;
        outputCharCount.textContent = outputLength;

        if (!outputLength) {
            minifyStats.textContent = "⚡ ready";
            return;
        }

        const saved = inputLength - outputLength;
        const percent = inputLength
            ? Math.round((saved / inputLength) * 100)
            : 0;

        minifyStats.textContent =
            `⬇ saved ${saved} chars · ${percent}% smaller`;
    }


    let feedbackTimer;

    function showFeedback(message, duration = 1800) {
        clearTimeout(feedbackTimer);

        copyFeedback.textContent = message;
        copyFeedback.classList.add("show");

        feedbackTimer = setTimeout(() => {
            copyFeedback.classList.remove("show");
        }, duration);
    }


    function performMinify() {
        const source = inputEl.value;

        try {
            outputEl.value = minifyJS(source);
            updateStats();

            copyFeedback.classList.remove("show");
        } catch (error) {
            outputEl.value =
                `// Error during minification:\n// ${error.message}`;

            updateStats();
        }

        return outputEl.value;
    }


    async function copyOutput() {
        const output = outputEl.value;

        if (!output) {
            showFeedback("⛔ nothing to copy", 1600);
            return;
        }

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(output);
                showFeedback("✓ copied!");
                return;
            }

            throw new Error("Clipboard API unavailable");
        } catch {
            try {
                outputEl.focus();
                outputEl.select();
                outputEl.setSelectionRange(0, output.length);

                document.execCommand("copy");

                showFeedback("✓ copied (fallback)");
            } catch {
                showFeedback("⛔ copy failed", 1800);
            }
        }
    }


    function loadSample() {
        const sample = `/**
 * Advanced utility functions for data processing
 */

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Memoization for expensive calculations
function memoize(fn) {
    const cache = new Map();

    return function (...args) {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn.apply(this, args);

        cache.set(key, result);

        return result;
    };
}

// Example usage
const expensiveCalculation = (n) => {
    console.log("Calculating...");
    return n * n * n;
};

const memoizedCalc = memoize(expensiveCalculation);

console.log(memoizedCalc(5));
console.log(memoizedCalc(5));

// Export utilities
export { debounce, memoize };
`;

        inputEl.value = sample;
        outputEl.value = "";

        updateStats();
        minifyStats.textContent = "⚡ ready";
        copyFeedback.classList.remove("show");
    }


    function clearAll() {
        inputEl.value = "";
        outputEl.value = "";

        updateStats();

        minifyStats.textContent = "⚡ ready";
        copyFeedback.classList.remove("show");
    }

    
    // events

    minifyBtn?.addEventListener("click", performMinify);

    copyBtn?.addEventListener("click", copyOutput);

    clearBtn?.addEventListener("click", clearAll);

    sampleBtn?.addEventListener("click", () => {
        loadSample();
        performMinify();
    });

    // live stats
    inputEl?.addEventListener("input", updateStats);

    // Ctrl + Enter / Cmd + Enter
    inputEl?.addEventListener("keydown", event => {
        if (
            (event.ctrlKey || event.metaKey) &&
            event.key === "Enter"
        ) {
            event.preventDefault();
            performMinify();
        }
    });


    function init() {
        loadSample();
        performMinify();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, {
            once: true
        });
    } else {
        init();
    }

    window.minifyJS = minifyJS;
})();