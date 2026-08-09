(function() {
    "use strict";

    // refs
    const inputEl = document.getElementById('inputCSS');
    const outputEl = document.getElementById('outputCSS');
    const minifyBtn = document.getElementById('minifyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const inputCharCount = document.getElementById('inputCharCount');
    const outputCharCount = document.getElementById('outputCharCount');
    const minifyStats = document.getElementById('minifyStats');
    const copyFeedback = document.getElementById('copyFeedback');

    function minifyCSS(css) {
      if (!css || typeof css !== 'string') return '';

      // rm cmts
      let cleaned = css.replace(/\/\*[\s\S]*?\*\//g, '');

      // rm whitespaces
      // rm newlines, tabs, etc
      cleaned = cleaned.replace(/[\n\r\t]/g, ' ');
      // cllaspe spaces
      cleaned = cleaned.replace(/ {2,}/g, ' ');
      // rm spaces bf/aft { } ( : ; , )
      cleaned = cleaned.replace(/\s*{\s*/g, '{');
      cleaned = cleaned.replace(/\s*}\s*/g, '}');
      cleaned = cleaned.replace(/\s*:\s*/g, ':');
      cleaned = cleaned.replace(/\s*;\s*/g, ';');
      cleaned = cleaned.replace(/\s*,\s*/g, ',');
      // rm spaces bf > + ~ 
      cleaned = cleaned.replace(/\s*([>+~])\s*/g, '$1');
      // rm spaces bf/aft ( and ) in selectors / fns
      cleaned = cleaned.replace(/\s*\(\s*/g, '(');
      cleaned = cleaned.replace(/\s*\)\s*/g, ')');
      // rm spaces bf [ and ] 
      cleaned = cleaned.replace(/\s*\[\s*/g, '[');
      cleaned = cleaned.replace(/\s*\]\s*/g, ']');

      // rm trailing ; bf } 
      cleaned = cleaned.replace(/;+/g, ';');
      // rm semicolon bf closing brace
      cleaned = cleaned.replace(/;}/g, '}');

      cleaned = cleaned.trim();

      // rm empty blocks { } 
      cleaned = cleaned.replace(/\{\}/g, '');

      // rm extra semicolon at the end of a rule
      cleaned = cleaned.replace(/;+/g, ';');

      // rm space after !important
      cleaned = cleaned.replace(/!\s*important/g, '!important');

      return cleaned.trim();
    }

    function updateStats() {
      const input = inputEl.value;
      const output = outputEl.value;
      inputCharCount.textContent = input.length;
      outputCharCount.textContent = output.length;
      // update minify stats
      if (output.length > 0) {
        const saved = input.length - output.length;
        const percent = input.length > 0 ? Math.round((saved / input.length) * 100) : 0;
        minifyStats.innerHTML = `⬇ saved ${saved} chars · ${percent}% smaller`;
      } else {
        minifyStats.innerHTML = `⚡ ready`;
      }
    }

    function performMinify() {
      const raw = inputEl.value;
      const minified = minifyCSS(raw);
      outputEl.value = minified;
      updateStats();
      // hide copy fdbk
      copyFeedback.classList.remove('show');
      return minified;
    }

    function copyOutput() {
      const output = outputEl.value;
      if (!output) {
        copyFeedback.textContent = '⛔ nothing to copy';
        copyFeedback.classList.add('show');
        setTimeout(() => copyFeedback.classList.remove('show'), 1600);
        return;
      }
      navigator.clipboard.writeText(output).then(() => {
        copyFeedback.textContent = '✓ copied!';
        copyFeedback.classList.add('show');
        setTimeout(() => copyFeedback.classList.remove('show'), 1800);
      }).catch(() => {
        // fllbck
        outputEl.select();
        document.execCommand('copy');
        copyFeedback.textContent = '✓ copied';
        copyFeedback.classList.add('show');
        setTimeout(() => copyFeedback.classList.remove('show'), 1800);
      });
    }

    function loadSample() {
      const sample = `.hero {
  /* main section */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: linear-gradient(145deg, #f1f5f9, #ffffff);
  border-bottom: 1px solid #e2e8f0;
}

.hero h1 {
  font-size: 3.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0b1e33;
  margin-bottom: 0.5rem;
}

.hero p {
  font-size: 1.2rem;
  color: #475569;
  max-width: 600px;
  text-align: center;
  line-height: 1.6;
}

.btn-primary {
  background: #0b1e33;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 60px;
  font-weight: 500;
  transition: 0.2s;
  cursor: pointer;
}

.btn-primary:hover {
  background: #1e3a5f;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -8px rgba(11,30,51,0.3);
}`;
      inputEl.value = sample;
      outputEl.value = '';  // clear output
      updateStats();
      minifyStats.innerHTML = '⚡ ready';
      copyFeedback.classList.remove('show');
    }

    function clearAll() {
      inputEl.value = '';
      outputEl.value = '';
      updateStats();
      minifyStats.innerHTML = '⚡ ready';
      copyFeedback.classList.remove('show');
    }

    // ---- events ----
    minifyBtn.addEventListener('click', performMinify);

    copyBtn.addEventListener('click', copyOutput);

    clearBtn.addEventListener('click', clearAll);

    sampleBtn.addEventListener('click', function() {
      loadSample();
      setTimeout(() => performMinify(), 20);
    });

    inputEl.addEventListener('input', function() {
      inputCharCount.textContent = inputEl.value.length;
      if (outputEl.value.length > 0) {
        const input = inputEl.value;
        const output = outputEl.value;
        const saved = input.length - output.length;
        const percent = input.length > 0 ? Math.round((saved / input.length) * 100) : 0;
        minifyStats.innerHTML = `⬇ saved ${saved} chars · ${percent}% smaller`;
      } else {
        minifyStats.innerHTML = '⚡ ready';
      }
    });


    window.addEventListener('load', function() {
      loadSample();
      setTimeout(() => performMinify(), 40);
      inputCharCount.textContent = inputEl.value.length;
    });

    inputEl.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        performMinify();
      }
    });

    window.minifyCSS = minifyCSS;
  })();