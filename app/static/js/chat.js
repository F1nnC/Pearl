/* ChatUI: class-based chat UI handler
     - Encapsulates DOM wiring, rendering, and a tiny markdown-like parser
*/

class ChatUI {
    constructor(opts = {}) {
        this.messagesEl = document.getElementById(opts.messagesId || 'chat-messages');
        this.inputEl = document.getElementById(opts.inputId || 'chat-input');
        this.sendBtn = document.getElementById(opts.sendBtnId || 'chat-send');

        if (!this.messagesEl || !this.inputEl || !this.sendBtn) {
            throw new Error('ChatUI: missing required DOM elements (#chat-messages, #chat-input, #chat-send)');
        }

        this.initEventListeners();
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    escapeHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Small markdown-like parser used only for demonstration
    parseSimpleMarkdown(text) {
        const codeBlocks = [];
        // save fenced code blocks
        text = String(text).replace(/```([\s\S]*?)```/g, (m, p1) => {
            codeBlocks.push(p1);
            return `{{CODEBLOCK_${codeBlocks.length - 1}}}`;
        });

        text = this.escapeHtml(text);

        // headings
        text = text.replace(/^### (.*)$/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.*)$/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.*)$/gm, '<h1>$1</h1>');

        // unordered list groups
        text = text.replace(/(^|\n)(?:- .*(?:\n|$))+/g, (m) => {
            const items = m.trim().split(/\n/).map(l => l.replace(/^-\s+/, '').trim()).filter(Boolean);
            return '\n<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
        });

        // bold, italic, inline code
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

        // paragraphs
        const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean).map(p => {
            if (/^<h\d|^<ul|^<pre|^<blockquote/.test(p)) return p;
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        });

        let out = paragraphs.join('\n');

        // restore code blocks
        out = out.replace(/\{\{CODEBLOCK_(\d+)\}\}/g, (m, idx) => {
            const code = this.escapeHtml(codeBlocks[Number(idx)] || '');
            return `<pre><code>${code}</code></pre>`;
        });

        return out;
    }

    renderUserMessage(text) {
        const wrapper = document.createElement('div');
        wrapper.className = 'message user-message';
        wrapper.setAttribute('data-role', 'user');

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        wrapper.appendChild(bubble);
        this.messagesEl.appendChild(wrapper);
        this.scrollToBottom();
    }

    renderBotDocument(mdText) {
        const wrapper = document.createElement('div');
        wrapper.className = 'message bot-message';
        wrapper.setAttribute('data-role', 'bot');

        const doc = document.createElement('div');
        doc.className = 'message-doc';
        doc.innerHTML = this.parseSimpleMarkdown(mdText);

        wrapper.appendChild(doc);
        this.messagesEl.appendChild(wrapper);
        this.scrollToBottom();
    }

    handleSend = () => {
        const text = this.inputEl.value.trim();
        if (!text) return;
        this.renderUserMessage(text);
        this.inputEl.value = '';

        const botResponse = `# Response to your question\n\n**You asked:** ${this.escapeHtml(text)}\n\nHere are some quick notes:\n- Time: Tonight at 7:00 PM\n- Location: Main Hall\n\nYou can run a quick check with:\n\n\`\`\`\nopen /docs/venue-map.pdf\n\`\`\`\n\n*Let me know if you want more detail.*`;

        setTimeout(() => this.renderBotDocument(botResponse), 700);
    }

    initEventListeners() {
        this.sendBtn.addEventListener('click', this.handleSend);

        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });
    }
}

// instantiate when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // default IDs are: chat-messages, chat-input, chat-send
        window.chatUI = new ChatUI();
    } catch (err) {
        // fail silently in development if DOM shape changed
        // console.warn(err);
    }
});