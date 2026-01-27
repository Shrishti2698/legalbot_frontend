import './style.css'

class LegalChatbot {
    constructor() {
        this.messages = [];
        this.currentLanguage = 'English';
        this.apiUrl = 'http://localhost:8000'; // Backend URL (to be implemented)
        
        this.initializeElements();
        this.bindEvents();
        this.loadLanguageContent();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearButton = document.getElementById('clearChat');
        this.languageSelect = document.getElementById('languageSelect');
    }

    bindEvents() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.clearButton.addEventListener('click', () => this.clearChat());
        this.languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
    }

    changeLanguage(language) {
        this.currentLanguage = language;
        this.loadLanguageContent();
    }

    loadLanguageContent() {
        const content = {
            English: {
                placeholder: "Ask about Indian legal matters...",
                clearButton: "Clear Chat",
                thinking: "Thinking..."
            },
            Hindi: {
                placeholder: "भारतीय कानूनी मामलों के बारे में पूछें...",
                clearButton: "चैट साफ करें",
                thinking: "सोच रहा हूँ..."
            },
            Bengali: {
                placeholder: "ভারতীয় আইনি বিষয়ে জিজ্ঞাসা করুন...",
                clearButton: "চ্যাট সাফ করুন",
                thinking: "ভাবছি..."
            }
        };

        const lang = content[this.currentLanguage];
        this.chatInput.placeholder = lang.placeholder;
        this.clearButton.textContent = lang.clearButton;
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        this.chatInput.value = '';
        this.sendButton.disabled = true;

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Simulate API call (replace with actual backend call)
            const response = await this.callAPI(message);
            this.hideTypingIndicator();
            this.addMessage('assistant', response.answer, response.references);
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        }

        this.sendButton.disabled = false;
    }

    async callAPI(message) {
        try {
            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    language: this.currentLanguage,
                    chat_history: this.messages.filter(msg => msg.role !== 'typing')
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            return {
                answer: `Backend connection failed. Please ensure the backend server is running on port 8000. Error: ${error.message}`,
                references: []
            };
        }
    }

    formatResponseText(text) {
        // Format numbered lists (1. 2. 3. etc.) and bullet points
        let formattedText = text
            // Replace **bold** with <strong>bold</strong>
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Replace numbered lists with proper line breaks
            .replace(/(\d+\.)\s*/g, '<br><strong>$1</strong> ')
            // Replace bullet points with proper line breaks
            .replace(/([•-])\s*/g, '<br><strong>$1</strong> ')
            // Replace double line breaks with proper spacing
            .replace(/\n\n/g, '<br><br>')
            // Replace single line breaks
            .replace(/\n/g, '<br>')
            // Clean up leading <br> tags
            .replace(/^<br>/, '');
        
        return formattedText;
    }

    addMessage(role, content, references = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Format assistant messages with proper line breaks and bullet points
        if (role === 'assistant') {
            // Make message content container relative for positioning
            messageContent.style.position = 'relative';
            
            // Create copy button inside the message content
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            `;
            copyButton.title = 'Copy response';
            copyButton.onclick = () => this.copyResponse(content);
            
            messageContent.innerHTML = this.formatResponseText(content);
            messageContent.appendChild(copyButton);
        } else {
            messageContent.textContent = content;
        }

        messageDiv.appendChild(messageContent);

        // Add references if provided and response is relevant
        if (references && references.length > 0) {
            // Check if the response indicates an irrelevant query
            const isIrrelevant = content.toLowerCase().includes('can only assist') || 
                               content.toLowerCase().includes('indian legal topics') ||
                               content.toLowerCase().includes('not related to indian legal') ||
                               content.toLowerCase().includes('outside the scope') ||
                               content.toLowerCase().includes('specialize in indian legal');
            
            if (!isIrrelevant) {
                const referencesDiv = document.createElement('div');
                referencesDiv.className = 'references';
                
                const referencesTitle = document.createElement('h4');
                referencesTitle.textContent = '📚 References';
                referencesDiv.appendChild(referencesTitle);

                references.forEach(ref => {
                    const refItem = document.createElement('div');
                    refItem.className = 'reference-item';
                    refItem.style.cursor = 'pointer';
                    
                    const refTitle = document.createElement('div');
                    refTitle.className = 'reference-title';
                    refTitle.textContent = `📖 ${ref.document}`;
                    
                    const refContent = document.createElement('div');
                    refContent.className = 'reference-content';
                    refContent.textContent = ref.content.substring(0, 100) + '...';
                    
                    // Add hover popup functionality
                    this.addHoverPopup(refItem, ref);
                    
                    refItem.appendChild(refTitle);
                    refItem.appendChild(refContent);
                    referencesDiv.appendChild(refItem);
                });

                messageDiv.appendChild(referencesDiv);
            }
        }

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        this.messages.push({ role, content, references });
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant';
        typingDiv.id = 'typing-indicator';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'message-content typing-indicator';
        
        const thinkingText = {
            English: "Thinking",
            Hindi: "सोच रहा हूँ",
            Bengali: "ভাবছি"
        }[this.currentLanguage];
        
        typingContent.innerHTML = `
            ${thinkingText}
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        typingDiv.appendChild(typingContent);
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    addHoverPopup(element, reference) {
        let popup = null;
        
        element.addEventListener('mouseenter', (e) => {
            // Create popup
            popup = document.createElement('div');
            popup.className = 'reference-popup';
            
            // Create header
            const header = document.createElement('div');
            header.className = 'popup-header';
            header.innerHTML = `<strong>📖 ${reference.document}</strong>`;
            
            // Create content
            const content = document.createElement('div');
            content.className = 'popup-content';
            content.textContent = reference.content; // Use textContent to ensure full text is shown
            
            popup.appendChild(header);
            popup.appendChild(content);
            
            // Position popup
            document.body.appendChild(popup);
            const rect = element.getBoundingClientRect();
            popup.style.left = `${rect.left}px`;
            popup.style.top = `${rect.bottom + 10}px`;
            
            // Adjust if popup goes off screen
            const popupRect = popup.getBoundingClientRect();
            if (popupRect.right > window.innerWidth) {
                popup.style.left = `${window.innerWidth - popupRect.width - 10}px`;
            }
            if (popupRect.bottom > window.innerHeight) {
                popup.style.top = `${rect.top - popupRect.height - 10}px`;
            }
        });
        
        element.addEventListener('mouseleave', () => {
            if (popup) {
                popup.remove();
                popup = null;
            }
        });
    }

    copyResponse(content) {
        // Create a simple text area with the content
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        
        // Select and copy
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices
        
        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            success = false;
        }
        
        document.body.removeChild(textArea);
        
        if (success) {
            this.showCopySuccess();
        } else {
            // Try clipboard API as backup
            if (navigator.clipboard) {
                navigator.clipboard.writeText(content).then(() => {
                    this.showCopySuccess();
                }).catch(() => {
                    alert('Copy failed. Please try again.');
                });
            } else {
                alert('Copy not supported in this browser.');
            }
        }
    }
    
    showCopySuccess() {
        const clickedButton = event.target.closest('.copy-button');
        clickedButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
        `;
        clickedButton.style.color = '#10b981';
        
        setTimeout(() => {
            clickedButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            `;
            clickedButton.style.color = '';
        }, 1000);
    }

    clearChat() {
        this.messages = [];
        this.chatMessages.innerHTML = '';
    }
}

// Initialize the chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LegalChatbot();
});