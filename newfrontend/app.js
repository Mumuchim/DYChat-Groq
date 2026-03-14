document.addEventListener('DOMContentLoaded', () => {
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

            // FOR OLD STUDENTS
            const forOldStudentsLink = document.getElementById('forOldStudentsLink');
            forOldStudentsLink.addEventListener('click', (event) => {
                event.preventDefault();
                this.populateAndSendMessage('How to enroll as an old student', this.args.chatBox);
            });

            // FOR NEW STUDENTS
            const forNewStudentsLink = document.getElementById('forNewStudentsLink');
            forNewStudentsLink.addEventListener('click', (event) => {
                event.preventDefault();
                this.populateAndSendMessage('How to enroll as an old student', this.args.chatBox);
            });

             // OFFICE LOCATION
             const office_location = document.getElementById('office_location_link');
             office_location_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('office location', this.args.chatBox);
             });

             // PAYMENT METHOD
             const payment_method = document.getElementById('payment_method_link');
             payment_method_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('payment method', this.args.chatBox);
             });

             // TUITION FEE
             const tuition_fee = document.getElementById('tuition_fee_link');
             tuition_fee_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('tuition fee', this.args.chatBox);
             });

             // CHECK BALANCE
             const check_balance = document.getElementById('check_balance_link');
             check_balance_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('check balance', this.args.chatBox);
             });

             // DOWN PAYMENT
             const down_payment = document.getElementById('down_payment_link');
             down_payment_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('down payment', this.args.chatBox);
             });

             // DISCOUNT
             const discount = document.getElementById('discount_link');
             discount_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('discount', this.args.chatBox);
             });

             // GET PROMI
             const get_promi = document.getElementById('get_promi_link');
             get_promi_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('how to get promi', this.args.chatBox);
             });

             // EXAM NO PAYMENT
             const no_payment_exam = document.getElementById('promi_no_pay_link');
             promi_no_pay_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('exam without payment', this.args.chatBox);
             });

             // SCHOLARSHIP LIST
             const scholarship_list = document.getElementById('scholarship_list_link');
             scholarship_list_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('list of scholarship', this.args.chatBox);
             });

             // SCHOLARSHIP REQUIREMENTS
             const scholarship_requirements= document.getElementById('scholarship_requirements_link');
             scholarship_requirements_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('scholarship requirements', this.args.chatBox);
             });

             // APPLY SCHOLARSHIP 
             const apply_scholarship = document.getElementById('apply_scholar_link');
             apply_scholar_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('apply scholarship', this.args.chatBox);
             });

             // APPLY SCHOLARSHIP 1
             const multiple_scholarship = document.getElementById('multiple_scholarship_link');
             multiple_scholarship_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('multiple scholarship', this.args.chatBox);
             });


             // APPLY SCHOLARSHIP 2
             const scholar_irregular = document.getElementById('scholar_irregular_link');
             scholar_irregular_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('irregular students scholarship', this.args.chatBox);
             });


             // APPLY SCHOLARSHIP 3
             const scholarship_inc = document.getElementById('scholarship_inc_link');
             scholarship_inc_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('scholar with inc', this.args.chatBox);
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
        
            // Create and dispatch an input event
            const inputEvent = new Event('input', { bubbles: true });
            textField.dispatchEvent(inputEvent);
        
            // Trigger the send button click event
            this.onSendButton(chatbox);
        }

        sendMessage(message) {
            const textField = this.args.inputField;
            textField.value = message;

            // Create and dispatch an input event
            const inputEvent = new Event('input', { bubbles: true });
            textField.dispatchEvent(inputEvent);

            // Trigger the send button click event
            this.onSendButton(this.args.chatBox);
        }

    }

    const chatbox = new Chatbox();
    chatbox.display();

    // Your other event listeners and initialization code here

});
