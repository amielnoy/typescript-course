// סקריפט משותף לכל המצגות: צביעת קוד, כותרת תחתונה עם מספרי עמודים, וזיהוי שקפים שגולשים.
// אין צורך לשנות קובץ זה. כל מצגת מגדירה <body data-lesson="1">.
(function () {
  const COURSE = "קורס אוטומציה לבודקי תוכנה: TypeScript, Git/GitHub, CI/CD";

  // ---------- צביעת קוד (פשוטה, ללא תלויות) ----------
  const KEYWORDS = new Set(
    ("const let var function return if else switch case default break continue for while do of in new class " +
      "extends implements interface type enum public private protected readonly static abstract override " +
      "async await try catch finally throw import export from as typeof instanceof keyof this super " +
      "true false null undefined void get set yield satisfies declare namespace is").split(" "),
  );
  const TYPES = new Set("string number boolean any unknown never object bigint symbol".split(" "));

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const span = (cls, text) => `<span class="tk-${cls}">${esc(text)}</span>`;
  const hasHebrew = (s) => /[\u0590-\u05FF]/.test(s);
  const comment = (text) => (hasHebrew(text) ? `<span class="tk-c rtl">${esc(text)}</span>` : span("c", text));

  function highlightTs(src) {
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d[\d_.]*\b)|([A-Za-z_$][\w$]*)/g;
    let out = "";
    let last = 0;
    for (const m of src.matchAll(re)) {
      out += esc(src.slice(last, m.index));
      const [tok, c, s, n, w] = m;
      if (c) out += comment(c);
      else if (s) out += span("s", s);
      else if (n) out += span("n", n);
      else if (KEYWORDS.has(w)) out += span("k", w);
      else if (TYPES.has(w)) out += span("t", w);
      else if (/^[A-Z]/.test(w)) out += span("C", w);
      else out += esc(tok);
      last = m.index + tok.length;
    }
    return out + esc(src.slice(last));
  }

  function highlightHash(src, keyRe) {
    // bash / yaml: הערות # , מחרוזות, ומפתחות (yaml)
    return src
      .split("\n")
      .map((line) => {
        const hashAt = line.search(/(^|\s)#/);
        const code = hashAt >= 0 ? line.slice(0, hashAt) : line;
        const cmt = hashAt >= 0 ? line.slice(hashAt) : "";
        let html = "";
        let last = 0;
        const re = /("(?:\\.|[^"\\])*"|'[^']*')|(\$\{\{[^}]*\}\}|\$\w+)/g;
        for (const m of code.matchAll(re)) {
          html += keyed(code.slice(last, m.index));
          html += m[1] ? span("s", m[1]) : span("n", m[2]);
          last = m.index + m[0].length;
        }
        html += keyed(code.slice(last));
        return html + (cmt ? comment(cmt) : "");
      })
      .join("\n");
    function keyed(text) {
      if (!keyRe) return esc(text);
      return text.replace(keyRe, "$1\u0000$2\u0001").split(/(\u0000[^\u0001]*\u0001)/).map((part) =>
        part.startsWith("\u0000") ? span("p", part.slice(1, -1)) : esc(part),
      ).join("");
    }
  }

  function highlightJson(src) {
    return src.replace(/("(?:\\.|[^"\\])*")(\s*:)?|(\b-?\d+(?:\.\d+)?\b|\btrue\b|\bfalse\b|\bnull\b)|([^"\d]+)/g, (m, str, colon, lit, other) => {
      if (str) return colon ? span("p", str) + esc(colon) : span("s", str);
      if (lit) return span("n", lit);
      return esc(other ?? m);
    });
  }

  for (const pre of document.querySelectorAll("pre")) {
    // מורידים שורה ריקה ראשונה/אחרונה וההזחה המשותפת – כדי שאפשר יהיה לכתוב קוד מוזח ב-HTML
    let lines = pre.textContent.replace(/^\n/, "").replace(/\s+$/, "").split("\n");
    const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
    lines = lines.map((l) => l.slice(indent));
    const src = lines.join("\n");
    const lang = (pre.className.match(/lang-(\w+)/) || [])[1] || (pre.classList.contains("out") ? "plain" : "ts");
    if (lang === "ts" || lang === "js") pre.innerHTML = highlightTs(src);
    else if (lang === "bash" || lang === "sh") pre.innerHTML = highlightHash(src, null);
    else if (lang === "yaml" || lang === "yml") pre.innerHTML = highlightHash(src, /^(\s*-?\s*)([\w.-]+)(?=:)/);
    else if (lang === "json") pre.innerHTML = highlightJson(src);
    else pre.textContent = src;
  }

  // ---------- כותרת תחתונה ומספרי עמודים ----------
  const lesson = document.body.dataset.lesson || "";
  const slides = [...document.querySelectorAll(".slide")];
  slides.forEach((slide, i) => {
    const footer = document.createElement("div");
    footer.className = "slide-footer";
    footer.innerHTML = `<span>${COURSE}</span><span dir="rtl">שיעור ${lesson} · ${i + 1}/${slides.length}</span>`;
    slide.appendChild(footer);
  });

  // ---------- זיהוי גלישה ----------
  // שקף שהתוכן שלו גבוה מהשקף, או בלוק קוד/טבלה רחבים מדי – מסומנים באדום ונרשמים ב-data-overflow
  const problems = [];
  slides.forEach((slide, i) => {
    const limit = slide.getBoundingClientRect().bottom - 50; // מעל קו הכותרת התחתונה
    let tooTall = slide.scrollHeight > slide.clientHeight + 1;
    for (const el of slide.querySelectorAll(":scope > *:not(.slide-footer), .body > *, .cols > *, .stack > *")) {
      if (getComputedStyle(el).position === "absolute") continue; // למשל שורת התאריך בשקף הפתיחה
      if (el.getBoundingClientRect().bottom > limit + 1) tooTall = true;
    }
    // אלמנט שבולט מתחת לתיבה שמכילה אותו (למשל קוד בעמודה שנכנס מתחת להערה שאחרי ה-cols)
    for (const box of slide.querySelectorAll(".cols, .grid2, .grid3, .stack, .card, .flow")) {
      const bottom = box.getBoundingClientRect().bottom;
      for (const child of box.children) {
        if (child.getBoundingClientRect().bottom > bottom + 1) tooTall = true;
      }
    }
    if (tooTall) {
      slide.classList.add("overflow");
      problems.push(`slide ${i + 1}: content too tall`);
    }
    for (const el of slide.querySelectorAll("pre, table, .flow, .cols")) {
      if (el.scrollWidth > el.clientWidth + 1) {
        el.classList.add("overflow-x");
        problems.push(`slide ${i + 1}: ${el.tagName.toLowerCase()} too wide`);
      }
    }
    // כל אלמנט (כרטיס, תא, תיבה...) שבולט מעבר לשוליים הצדדיים של השקף
    const box = slide.getBoundingClientRect();
    const minX = box.left + 60;
    const maxX = box.right - 60;
    for (const el of slide.querySelectorAll("*:not(.slide-footer):not(.slide-footer *)")) {
      if (el.closest("pre") && el.tagName !== "PRE") continue; // התוכן של pre נבדק למעלה
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (r.left < minX - 1 || r.right > maxX + 1) {
        el.classList.add("overflow-x");
        problems.push(`slide ${i + 1}: <${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0] : ""}> sticks out sideways`);
        break;
      }
    }
  });
  document.body.dataset.overflow = problems.join(" | ");
  document.body.dataset.slides = String(slides.length);
})();
