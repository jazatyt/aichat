/**
 * Lightweight and fast Markdown Parser with Code Block Copying
 */
const MarkdownParser = {
  render(text) {
    if (!text) return '';

    let html = text;

    // 1. Code blocks with language header and copy button
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang.trim() || 'code';
      const cleanCode = this.escapeHtml(code.trim());
      return `
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <span>${language}</span>
            <button class="copy-code-btn" onclick="MarkdownParser.copyCode(this)">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>คัดลอก</span>
            </button>
          </div>
          <pre><code>${cleanCode}</code></pre>
        </div>
      `;
    });

    // 2. Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // 3. Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // 4. Horizontal Rules
    html = html.replace(/^---$/gim, '<hr class="my-3 border-gray-200">');

    // 5. Bold & Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 6. Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 7. Lists
    // Unordered
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Ordered lists
    html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>');
    
    // 8. Paragraphs & Linebreaks
    const lines = html.split('\n\n');
    html = lines.map(line => {
      line = line.trim();
      if (!line) return '';
      if (line.startsWith('<h') || line.startsWith('<div') || line.startsWith('<ul') || line.startsWith('<ol') || line.startsWith('<blockquote') || line.startsWith('<hr')) {
        return line;
      }
      return `<p>${line.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
  },

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  copyCode(btn) {
    const wrapper = btn.closest('.code-block-wrapper');
    const code = wrapper.querySelector('pre code').innerText;
    navigator.clipboard.writeText(code).then(() => {
      const originalText = btn.innerHTML;
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span class="text-emerald-400">คัดลอกแล้ว</span>
      `;
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    });
  }
};
