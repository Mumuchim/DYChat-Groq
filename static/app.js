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

            // New sidebar: nav arrows
            let navArrows = document.querySelectorAll(".nav__arrow");
            navArrows.forEach((arrow) => {
                arrow.addEventListener("click", (e) => {
                    let navItem = e.target.closest(".nav__item");
                    if (navItem) navItem.classList.toggle("showMenu");
                });
            });

            // Also allow clicking the nav row to toggle
            let navRows = document.querySelectorAll(".nav__row");
            navRows.forEach((row) => {
                row.addEventListener("click", (e) => {
                    let navItem = row.closest(".nav__item");
                    if (navItem) navItem.classList.toggle("showMenu");
                });
            });

            let sidebar = document.querySelector(".sidebar");

            // Sidebar toggle button (inside sidebar header)
            let sidebarToggleBtn = document.getElementById("sidebarToggle");
            if (sidebarToggleBtn) {
                sidebarToggleBtn.addEventListener("click", () => {
                    sidebar.classList.toggle("close");
                });
            }

            // Menu icon in top bar (bx-menu)
            let sidebarBtn = document.querySelector(".bx-menu");
            if (sidebarBtn) {
                sidebarBtn.addEventListener("click", () => {
                    sidebar.classList.toggle("close");
                });
            }

//             let sidebar = document.querySelector(".sidebar");
//             let homeContent = document.querySelector(".home-content");
//             let sidebarBtn = document.querySelector(".bx-menu");

// sidebarBtn.addEventListener("click", () => {
// if (sidebar.style.width === "250px") {
//     sidebar.style.width = "0";
//     homeContent.style.marginLeft = "0";
// } else {
//     sidebar.style.width = "250px";
//     homeContent.style.marginLeft = "250px";
// }
// });


        

            // FOR OLD STUDENTS
            const forOldStudentsLink = document.getElementById('forOldStudentsLink');
            forOldStudentsLink.addEventListener('click', (event) => {
                event.preventDefault();
                this.populateAndSendMessage('Enrollment - Old Students', this.args.chatBox);
            });

            // FOR NEW STUDENTS
            const forFirstYearStudentsLink = document.getElementById('forFirstYearStudentsLink');
            forFirstYearStudentsLink.addEventListener('click', (event) => {
                event.preventDefault();
                this.populateAndSendMessage('Enrollment - Incoming First Year', this.args.chatBox);
            });

            // transfer
            const forTransfereeLink = document.getElementById('forTransfereeLink');
            forTransfereeLink.addEventListener('click', (event) => {
                event.preventDefault();
                this.populateAndSendMessage('Transferee Student - Enrollment', this.args.chatBox);
            });

            // shift
            const forShiftingLink = document.getElementById('forShiftingLink');
            forShiftingLink.addEventListener('click', (event) => {
                event.preventDefault();
                this.populateAndSendMessage('Shifting Student - Enrollment', this.args.chatBox);
            });

             // freshmen d
             const freshmen_discount_link = document.getElementById('freshmen_discount_link');
             freshmen_discount_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('Discount - Freshmen', this.args.chatBox);
             });

             // alumni d
             const alumni_discount = document.getElementById('alumni_discount_link');
             alumni_discount_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('Discount - Alumni', this.args.chatBox);
             });

             // solo parent d
             const soloparent_discount = document.getElementById('soloparent_discount_link');
             soloparent_discount_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('Discount - Solo Parent', this.args.chatBox);
             });

             // sibling d
             const sibling_discount = document.getElementById('sibling_discount_link');
             sibling_discount_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('Discount - Sibling', this.args.chatBox);
             });

             // employee_discount
             const employee_discount = document.getElementById('employee_discount_link');
             employee_discount_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('Discount - Employee', this.args.chatBox);
             });

             // full_discount
             const full_discount = document.getElementById('full_discount_link');
             full_discount_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('Discount - Full Payment', this.args.chatBox);
             });

             // student assistant
             const student_assistant = document.getElementById('student_assistant_link');
             student_assistant_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('Discount - Student Assistant', this.args.chatBox);
             });
             // end of discount

             

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


            //start of scholarship

             // full
             const full_academic = document.getElementById('full_academic_link');
             full_academic_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('Scholarship - Full Academic', this.args.chatBox);
             });

              // partial
              const partial_academic = document.getElementById('partial_academic_link');
              partial_academic_link.addEventListener('click', (event) => {
                  event.preventDefault();
                  this.populateAndSendMessage('Scholarship - Partial Academic', this.args.chatBox);
              });

             // cultural
             const cultural_athletics= document.getElementById('cultural_athletics_link');
             cultural_athletics_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('Scholarship - Cultural and Athletics', this.args.chatBox);
             });

             // brass band 
             const brass_band = document.getElementById('brass_band_link');
             brass_band_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('Scholarship - Brass Band', this.args.chatBox);
             });

             // government_endorsed
             const government_endorsed = document.getElementById('government_endorsed_link');
             government_endorsed_link.addEventListener('click', (event) => {
                 event.preventDefault();
                 this.populateAndSendMessage('Scholarship - Government Endorsed', this.args.chatBox);
             });

             //end of scholarship

             // APPLY SCHOLARSHIP 2
            //  const scholar_irregular = document.getElementById('scholar_irregular_link');
            //  scholar_irregular_link.addEventListener('click', (event) => {
            //      event.preventDefault();
            //      this.populateAndSendMessage('', this.args.chatBox);
            //  });


            //  // APPLY SCHOLARSHIP 3
            //  const scholarship_inc = document.getElementById('scholarship_inc_link');
            //  scholarship_inc_link.addEventListener('click', (event) => {
            //      event.preventDefault();
            //      this.populateAndSendMessage('scholar with inc', this.args.chatBox);
            //  });


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

        // updateChatText(chatbox) {
        //     var html = '';
        //     this.messages.slice().reverse().forEach(function (item) {
        //         if (item.name === 'DYC-AI') {
        //             html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>';
        //         } else {
        //             html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
        //         }
        //     });

        updateChatText(chatbox) {
            var html = '';
            this.messages.slice().reverse().forEach(function (item) {
                if (item.name === 'DYC-AI') {
                    html += '<div class="messages__item messages__item--visitor">';
                    html += item.message;
                    html += '</div>';
                } else {
                    html += '<div class="messages__item messages__item--operator">';
                    html += item.message;
                    html += '</div>';
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
