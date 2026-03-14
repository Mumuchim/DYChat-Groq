class Chatbox {
    constructor() {
        this.args = {
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            clearButton: document.querySelector('.clear__button'),
            inputField: document.querySelector('#inputField'), // Added inputField reference
        }
        this.messages = [];

        const { clearButton, inputField } = this.args;

        clearButton.addEventListener('click', () => {
            this.messages = [];
            this.updateChatText(this.args.chatBox);
        });

        inputField.addEventListener('keyup', ({ key }) => {
            if (key === 'Enter') {
                this.onSendButton(this.args.chatBox);
            }
        });

        let arrow = document.querySelectorAll(".arrow");
        for (var i = 0; i < arrow.length; i++) {
            arrow[i].addEventListener("click", (e) => {
                let arrowParent = e.target.parentElement.parentElement;
                arrowParent.classList.toggle("showMenu");
            });
        }

        let sidebar = document.querySelector(".sidebar");
        let sidebarBtn = document.querySelector(".bx-menu");
        console.log(sidebarBtn);
        sidebarBtn.addEventListener("click", () => {
            sidebar.classList.toggle("close");
        });
    }

    display() {
        const { chatBox, sendButton } = this.args;

        sendButton.addEventListener('click', () => this.onSendButton(chatBox));

        chatBox.classList.add('chatbox--active');
    }

    onSendButton(chatbox) {
        const textField = this.args.inputField;
        const text1 = textField.value;

        if (text1 === '') {
            return;
        }

        const msg1 = { name: 'User', message: text1 };
        this.messages.push(msg1);

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(r => r.json())
        .then(r => {
            this.messages.push({ name: 'DYC-AI', message: '<div class="typing-indicator"><span></span><span></span><span></span></div>' });
            this.updateChatText(chatbox);
            textField.value = '';
            setTimeout(() => {
                const msg2 = { name: 'DYC-AI', message: r.answer };
                this.messages.pop(); // remove the typing bubble message
                this.messages.push(msg2);
                this.updateChatText(chatbox);
                this.scrollToBottom(chatbox);
            }, 1100);

        })
        .catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox);
            this.scrollToBottom(chatbox);
            textField.value = '';
        });
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function (item) {
            if (item.name === 'DYC-AI') {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>';
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
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
        const textField = chatbox.querySelector('input');
        textField.value = message;
        this.onSendButton(chatbox);
    }
}

const chatbox = new Chatbox();
chatbox.display();
