let documents = [];
let activePath = "";

const searchInput = document.querySelector("#docsSearch");
const navHost = document.querySelector("#docsNav");
const titleHost = document.querySelector("#docsTitle");
const pathHost = document.querySelector("#docsPath");
const contentHost = document.querySelector("#docsContent");

async function initializeDocs() {
  documents = window.DOCS_CONTENT?.documents || [];
  try {
    const response = await fetch("docs-content.json", { cache: "no-store" });
    const data = await response.json();
    if (data.documents?.length) documents = data.documents;
  } catch (error) {
    documents = window.DOCS_CONTENT?.documents || [];
  }
  searchInput.addEventListener("input", renderNav);
  activePath = documents[0]?.path || "";
  renderNav();
  renderDocument(activePath);
}

function renderNav() {
  const query = normalize(searchInput.value);
  const filtered = documents.filter((doc) => searchable(doc).includes(query));
  navHost.innerHTML = filtered.length
    ? filtered.map(renderNavButton).join("")
    : `<p class="docs-empty">No documents found.</p>`;
}

function renderNavButton(doc) {
  return `
    <button class="docs-nav-item ${doc.path === activePath ? "selected" : ""}" type="button" data-path="${doc.path}">
      <strong>${escapeHtml(doc.title)}</strong>
      <span>${escapeHtml(doc.path)}</span>
    </button>
  `;
}

function renderDocument(path) {
  const doc = documents.find((item) => item.path === path) || documents[0];
  if (!doc) {
    titleHost.textContent = "No docs found";
    pathHost.textContent = "Run scripts/build_docs_content.py";
    contentHost.innerHTML = "<p>The generated documentation bundle is empty.</p>";
    return;
  }
  activePath = doc.path;
  titleHost.textContent = doc.title;
  pathHost.textContent = doc.path;
  contentHost.innerHTML = renderMarkdown(doc.content);
  renderNav();
  typesetMath();
}

function renderMarkdown(markdown) {
  const lines = markdown.split("\n");
  const html = [];
  let inCode = false;
  let codeLines = [];
  let listOpen = false;

  function closeList() {
    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }
    if (!line.trim()) {
      closeList();
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    if (line.startsWith("- ")) {
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      continue;
    }
    const numbered = line.match(/^\d+\.\s+(.*)$/);
    if (numbered) {
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(numbered[1])}</li>`);
      continue;
    }
    closeList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }
  closeList();
  if (inCode) html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  return html.join("");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function searchable(doc) {
  return normalize([doc.title, doc.path, doc.content].join(" "));
}

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function typesetMath() {
  if (!window.MathJax?.typesetPromise) return;
  window.MathJax.typesetPromise([contentHost]).catch(() => {});
}

navHost.addEventListener("click", (event) => {
  const button = event.target.closest("[data-path]");
  if (button) renderDocument(button.dataset.path);
});

initializeDocs();
