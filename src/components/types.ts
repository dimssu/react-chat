export type ChatBotPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type ChatBotTheme = 'light' | 'dark' | 'system';
export type ChatBotResponseType = 'casual' | 'formal' | 'technical';

export interface ChatBotStyling {
  containerStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  windowStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  widgetColor?: string;
  textColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  boxShadow?: string;
  chatBackground?: string;
  userMessageBackground?: string;
  botMessageBackground?: string;
}

export interface MessageType {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface DirectLlmConfig {
  /** API endpoint for the LLM service (e.g., 'https://api.openai.com/v1/chat/completions') */
  apiEndpoint: string;
  /** API key for the LLM service */
  apiKey: string;
  /** Model to use (e.g., 'gpt-3.5-turbo', 'gpt-4', 'claude-3-opus-20240229') */
  model?: string;
  /** Headers to include in the request (optional) */
  headers?: Record<string, string>;
  /** Custom message formatter function (optional) */
  formatMessages?: (messages: MessageType[], newMessage: string, context?: string) => any;
  /** Custom response parser function (optional) */
  parseResponse?: (data: any) => string;
}

export interface ChatBotProps {
  /** URL for the backend API endpoint */
  backendUrl?: string;
  /** Configuration for direct LLM API calls (alternative to backendUrl) */
  directLlmConfig?: DirectLlmConfig;
  /** LLM provider (e.g., 'openai', 'gemini', 'claude'). If provided with apiKey, overrides directLlmConfig. */
  llmProvider?: 'openai' | 'gemini' | 'claude';
  /** API key for the LLM provider. Used with llmProvider. */
  apiKey?: string;
  /** Context information to help guide the AI responses */
  context?: string;
  /** Tone of the AI responses */
  responseType?: ChatBotResponseType;
  /** Position of the chat widget on the screen */
  position?: ChatBotPosition;
  /** Initial welcome message displayed when chat is opened */
  welcomeMessage?: string;
  /** Custom styling options */
  styling?: ChatBotStyling;
  /** Color theme for the chat widget */
  theme?: ChatBotTheme;
  /** Placeholder text for the input field */
  placeholderText?: string;
  /** Custom header title for the chat window */
  headerTitle?: string;
  /** Whether to show timestamps on messages */
  showTimestamps?: boolean;
  /** Custom avatar URL for the bot */
  botAvatarUrl?: string;
  /** Function to call before sending message to backend */
  onBeforeSend?: (message: string) => string | false;
  /** Function to call after receiving response */
  onAfterResponse?: (response: string) => string;
  /** Maximum height of the chat window (CSS value) */
  maxHeight?: string;
  /** Whether to persist chat history in localStorage */
  persistChat?: boolean;
  /** Custom class name for the container */
  className?: string;
  /** Enable file upload functionality */
  enableFileUpload?: boolean;
  /** Enable feedback collection on bot messages */
  enableFeedback?: boolean;
  /** Suggested questions to display to the user */
  suggestedQuestions?: string[];
  /** Function to call when feedback is submitted */
  onFeedbackSubmit?: (messageId: string, rating: 'positive' | 'negative', comment?: string) => void;
  /** Function to handle file uploads */
  onFileUpload?: (file: File) => Promise<void>;
  /** Allowed file types for upload */
  allowedFileTypes?: string[];
  /** Maximum file size in MB */
  maxFileSizeMB?: number;
} 