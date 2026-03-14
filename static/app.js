document.addEventListener('DOMContentLoaded', () => {
    class Chatbox {
        constructor() {
            this.args = {
                chatBox:     document.querySelector('.chatbox__support'),
                sendButton:  document.querySelector('.send__button'),
                clearButton: document.querySelector('.clear__button'),
                inputField:  document.querySelector('#inputField'),
            };
            this.messages = [];

            // Clear chat
            this.args.clearButton.addEventListener('click', () => {
                this.messages = [];
                this.updateChatText(this.args.chatBox);
            });

            // Send on Enter
            this.args.inputField.addEventListener('keyup', ({ key }) => {
                if (key === 'Enter') this.onSendButton(this.args.chatBox);
            });

            // ── Sidebar toggle ──────────────────────────────
            const sidebar = document.querySelector('.sidebar');

            const sidebarToggleBtn = document.getElementById('sidebarToggle');
            if (sidebarToggleBtn) {
                sidebarToggleBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('close');
                });
            }

            // ── Nav row expand/collapse ──────────────────────
            document.querySelectorAll('.nav__arrow').forEach(arrow => {
                arrow.addEventListener('click', e => {
                    e.stopPropagation();
                    const navItem = e.target.closest('.nav__item');
                    if (navItem) navItem.classList.toggle('showMenu');
                });
            });

            document.querySelectorAll('.nav__row').forEach(row => {
                row.addEventListener('click', () => {
                    const navItem = row.closest('.nav__item');
                    if (navItem) navItem.classList.toggle('showMenu');
                });
            });

            // ── Sidebar quick-topic links ────────────────────
            const topicLinks = {
                'forOldStudentsLink':       'How do I enroll as an old student?',
                'forFirstYearStudentsLink': 'How do I enroll as an incoming first year?',
                'forTransfereeLink':        'How do I enroll as a transferee?',
                'forShiftingLink':          'How do I shift to another course?',
                'freshmen_discount_link':   'Tell me about the freshmen discount.',
                'alumni_discount_link':     'Tell me about the DYCI HS alumni discount.',
                'soloparent_discount_link': 'Tell me about the solo parent discount.',
                'sibling_discount_link':    'Tell me about the sibling discount.',
                'employee_discount_link':   'Tell me about the DYCI employee discount.',
                'full_discount_link':       'Tell me about the full payment discount.',
                'student_assistant_link':   'Tell me about the student assistant discount.',
                'get_promi_link':           'How do I get a promissory note?',
                'promi_no_pay_link':        'Can I take exams without payment using a promissory note?',
                'full_academic_link':       'Tell me about the full academic scholarship.',
                'partial_academic_link':    'Tell me about the partial academic scholarship.',
                'cultural_athletics_link':  'Tell me about the cultural and athletics scholarship.',
                'brass_band_link':          'Tell me about the brass band scholarship.',
                'government_endorsed_link': 'Tell me about government-endorsed scholarships.',
            };

            Object.entries(topicLinks).forEach(([id, message]) => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('click', e => {
                        e.preventDefault();
                        this.populateAndSendMessage(message, this.args.chatBox);
                    });
                }
            });
        }

        display() {
            const { chatBox, sendButton } = this.args;
            sendButton.addEventListener('click', () => this.onSendButton(chatBox));
            chatBox.classList.add('chatbox--active');
        }

        onSendButton(chatbox) {
            const textField = this.args.inputField;
            const text = textField.value.trim();
            if (!text) return;

            this.messages.push({ name: 'User', message: text });
            this.updateChatText(chatbox);
            textField.value = '';

            // Show typing indicator
            this.messages.push({ name: 'DYC-AI', message: '<div class="typing-indicator"><span></span><span></span><span></span></div>' });
            this.updateChatText(chatbox);

            // Use relative URL so it works both locally and on Vercel
            fetch('/predict', {
                method: 'POST',
                body: JSON.stringify({ message: text }),
                headers: { 'Content-Type': 'application/json' },
            })
            .then(r => r.json())
            .then(r => {
                setTimeout(() => {
                    this.messages.pop(); // remove typing indicator
                    this.messages.push({ name: 'DYC-AI', message: r.answer });
                    this.updateChatText(chatbox);
                    this.scrollToBottom(chatbox);
                }, 800);
            })
            .catch(err => {
                console.error('Error:', err);
                this.messages.pop();
                this.messages.push({ name: 'DYC-AI', message: "Sorry, I couldn't connect. Please try again." });
                this.updateChatText(chatbox);
            });
        }

        updateChatText(chatbox) {
            let html = '';
            this.messages.slice().reverse().forEach(item => {
                if (item.name === 'DYC-AI') {
                    html += `<div class="messages__item messages__item--visitor">${item.message}</div>`;
                } else {
                    html += `<div class="messages__item messages__item--operator">${item.message}</div>`;
                }
            });
            const chatmessage = chatbox.querySelector('.chatbox__messages');
            chatmessage.innerHTML = html;
            this.scrollToBottom(chatbox);
        }

        scrollToBottom(chatbox) {
            const chatmessage = chatbox.querySelector('.chatbox__messages');
            chatmessage.scrollTop = chatmessage.scrollHeight;
        }

        populateAndSendMessage(message, chatbox) {
            this.args.inputField.value = message;
            this.onSendButton(chatbox);
        }
    }

    const chatbox = new Chatbox();
    chatbox.display();
});
