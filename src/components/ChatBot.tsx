import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatBotProps, MessageType, ChatBotPosition } from './types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSuggestions } from './ChatSuggestions';
import { ChatFeedback } from './ChatFeedback';
import { ChatFileUpload } from './ChatFileUpload';
import styles from './ChatBot.module.css';
import { getLlmConfig } from './llmConfigs';

export const ChatBot = ({
  backendUrl,
  directLlmConfig: directLlmConfigProp,
  llmProvider,
  apiKey,
  context,
  responseType = 'formal',
  position = 'bottom-right',
  welcomeMessage = 'Hello! How can I help you today?',
  styling = {},
  theme = 'light',
  placeholderText,
  headerTitle = 'Chat Assistant',
  showTimestamps = false,
  botAvatarUrl,
  onBeforeSend,
  onAfterResponse,
  maxHeight = '500px',
  persistChat = false,
  className = '',
  enableFileUpload = false,
  enableFeedback = false,
  suggestedQuestions = [],
  onFeedbackSubmit,
  onFileUpload,
  allowedFileTypes,
  maxFileSizeMB,
}: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Apply system theme if selected
  const [effectiveTheme, setEffectiveTheme] = useState(theme);
  
  // Determine which directLlmConfig to use
  const directLlmConfig = llmProvider && apiKey
    ? getLlmConfig(llmProvider, apiKey)
    : directLlmConfigProp;
  
  useEffect(() => {
    if (theme === 'system') {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setEffectiveTheme(isDarkMode ? 'dark' : 'light');
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setEffectiveTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme]);
  
  // Initialize with welcome message and load persisted messages if enabled
  useEffect(() => {
    if (persistChat) {
      const savedMessages = localStorage.getItem('chatbot_messages');
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          // Convert string timestamps back to Date objects
          const messagesWithDates = parsedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDates);
        } catch (e) {
          console.error('Failed to parse saved messages:', e);
          initializeWithWelcome();
        }
      } else {
        initializeWithWelcome();
      }
    } else {
      initializeWithWelcome();
    }
  }, [welcomeMessage, persistChat]);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (persistChat && messages.length > 0) {
      localStorage.setItem('chatbot_messages', JSON.stringify(messages));
    }
  }, [messages, persistChat]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const initializeWithWelcome = () => {
    if (welcomeMessage) {
      setMessages([
        {
          id: uuidv4(),
          content: welcomeMessage,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } else {
      setMessages([]);
    }
  };
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSendMessage = async (content: string) => {
    // Process message with onBeforeSend if provided
    if (onBeforeSend) {
      const processedMessage = onBeforeSend(content);
      if (processedMessage === false) return; // Cancel sending
      if (typeof processedMessage === 'string') {
        content = processedMessage;
      }
    }
    
    const userMessage: MessageType = {
      id: uuidv4(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      let botResponse: string;
      
      // Check if using direct LLM config or backend URL
      if (directLlmConfig && !backendUrl) {
        // Direct LLM API call
        botResponse = await callDirectLlm(content, directLlmConfig);
      } else if (backendUrl) {
        // Backend API call
        botResponse = await callBackendApi(content, backendUrl);
      } else {
        throw new Error('Either backendUrl or directLlmConfig must be provided');
      }
      
      // Process response with onAfterResponse if provided
      if (onAfterResponse) {
        botResponse = onAfterResponse(botResponse);
      }
      
      const botMessage: MessageType = {
        id: uuidv4(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const callDirectLlm = async (content: string, config: typeof directLlmConfig): Promise<string> => {
    if (!config) throw new Error('LLM configuration is missing');

    try {
      // Prepare headers - don't use Bearer token for Gemini
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(config?.apiEndpoint?.includes('gemini') 
          ? {} 
          : { 'Authorization': `Bearer ${config.apiKey}` }),
        ...config.headers
      };

      // Format messages based on history
      const requestBody = config.formatMessages 
        ? config.formatMessages(messages, content, context)
        : {
            model: config.model || 'gpt-3.5-turbo',
            messages: [
              ...(context ? [{ role: 'system', content: context }] : []),
              ...messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content
              })),
              { role: 'user', content }
            ],
            max_tokens: 1000
          };

      // For Gemini, add API key as URL parameter instead of header
      const apiUrl = config.model?.includes('gemini')
        ? `${config.apiEndpoint}?key=${config.apiKey}`
        : config.apiEndpoint;

      // Make the API call
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Parse the response
      return config.parseResponse 
        ? config.parseResponse(data)
        : data.choices?.[0]?.message?.content || 
          data.response || 
          'Sorry, I couldn\'t process your request.';
    } catch (error) {
      console.error('Error calling LLM API:', error);
      throw error;
    }
  };
  
  const callBackendApi = async (content: string, url: string): Promise<string> => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context,
          responseType,
          history: messages.map(msg => ({
            role: msg.sender,
            content: msg.content
          }))
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return data.response || 'Sorry, I couldn\'t process your request.';
    } catch (error) {
      console.error('Error calling backend API:', error);
      throw error;
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };
  
  const handleFileUpload = async (file: File) => {
    if (!onFileUpload) return;
    
    try {
      await onFileUpload(file);
      
      // Add a message indicating file upload
      const fileMessage: MessageType = {
        id: uuidv4(),
        content: `Uploaded file: ${file.name}`,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fileMessage]);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    }
  };
  
  const handleFeedbackSubmit = (messageId: string, rating: 'positive' | 'negative', comment?: string) => {
    if (onFeedbackSubmit) {
      onFeedbackSubmit(messageId, rating, comment);
    }
  };
  
  // Determine position class
  const positionClass = styles[position as ChatBotPosition] || styles['bottom-right'];
  
  return (
    <div 
      className={`${styles.chatbotContainer} ${positionClass} ${className}`}
      data-theme={effectiveTheme}
      style={styling.containerStyle}
    >
      {isOpen ? (
        <div 
          className={styles.chatWindow}
          style={{ maxHeight, ...(styling.windowStyle || {}) }}
        >
          <header className={styles.chatHeader} style={styling.headerStyle}>
            <h3>{headerTitle}</h3>
            <button 
              onClick={toggleChat}
              className={styles.closeButton}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>
          
          <main className={styles.chatBody} style={styling.bodyStyle}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                Start a conversation by typing a message below.
              </div>
            )}
            
            {messages.map(message => (
              <div key={message.id} className={styles.messageContainer}>
                <ChatMessage
                  message={message}
                  styling={styling}
                  showTimestamp={showTimestamps}
                  botAvatarUrl={botAvatarUrl}
                />
                {enableFeedback && message.sender === 'bot' && (
                  <ChatFeedback
                    messageId={message.id}
                    onFeedbackSubmit={handleFeedbackSubmit}
                    styling={styling}
                  />
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className={styles.loadingIndicator} aria-label="Loading response">
                <span className={styles.typingDot}></span>
                <span className={styles.typingDot}></span>
                <span className={styles.typingDot}></span>
              </div>
            )}
            
            {error && (
              <div className={styles.errorMessage} role="alert">
                {error}
              </div>
            )}
            
            {suggestedQuestions.length > 0 && (
              <ChatSuggestions
                suggestions={suggestedQuestions}
                onSuggestionClick={handleSuggestionClick}
                styling={styling}
              />
            )}
            
            <div ref={messagesEndRef} />
          </main>
          
          <footer className={styles.chatFooter}>
            {enableFileUpload && onFileUpload && (
              <ChatFileUpload
                onFileUpload={handleFileUpload}
                allowedFileTypes={allowedFileTypes}
                maxFileSizeMB={maxFileSizeMB}
                styling={styling}
              />
            )}
            
            <ChatInput
              onSendMessage={handleSendMessage}
              placeholderText={placeholderText}
              styling={styling}
              disabled={isLoading}
            />
          </footer>
        </div>
      ) : (
        <button
          className={styles.chatButton}
          onClick={toggleChat}
          aria-label="Open chat"
          style={{
            backgroundColor: styling.widgetColor || '#4f46e5',
            color: styling.textColor || '#ffffff',
            ...(styling.buttonStyle || {})
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatBot;
