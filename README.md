# Dissu Talks - React Chatbot Component

A customizable React chatbot component that can be easily integrated into any web application.  
Supports multiple LLM providers, custom styling, file uploads, feedback collection, and more.

## ✨ Features

- **Multiple Integration Options**:
  - Backend API integration
  - Direct LLM API integration (OpenAI, Google Gemini, Anthropic Claude)
  - **Simple LLM selection with provider and API key**
  - Custom API request/response formatting
- **Customization**:
  - Positioning: bottom-right, bottom-left, top-right, top-left
  - Styling: colors, themes, fonts
  - Light / Dark / System theme support
  - Custom welcome message and input placeholder
- **Interactive Features**:
  - File uploads
  - Feedback collection
  - Suggested questions
  - Chat history persistence
  - Timestamps
- **Responsive Design**:
  - Mobile-friendly
  - Adjustable chat window size

## 🚀 Installation

```bash
npm install dissu-talks
```

## 🛠️ Usage

### Basic Setup with Backend API

```jsx
import { ChatBot } from 'dissu-talks';

function App() {
  return (
    <div>
      <ChatBot
        backendUrl="https://api.example.com/chat"
        context="This is a chatbot for a finance SaaS tool."
        responseType="formal"
        position="bottom-right"
        welcomeMessage="Welcome! Ask me anything."
        styling={{ widgetColor: "#4f46e5", textColor: "#ffffff" }}
        theme="light"
        placeholderText="Ask your question..."
      />
    </div>
  );
}
```

### ⚡ Easiest LLM Integration (Recommended)

Just pass `llmProvider` and `apiKey` props. No need to construct a config object!

#### 1. OpenAI (ChatGPT)

```jsx
<ChatBot
  llmProvider="openai"
  apiKey="YOUR_OPENAI_API_KEY"
  context="This is a chatbot for a finance SaaS tool."
  responseType="formal"
  position="bottom-left"
  welcomeMessage="Welcome! Ask me anything."
  styling={{ widgetColor: "#10b981", textColor: "#ffffff" }}
  theme="light"
  placeholderText="Ask your question..."
/>
```

#### 2. Google Gemini

```jsx
<ChatBot
  llmProvider="gemini"
  apiKey="YOUR_GEMINI_API_KEY"
  context="This is a chatbot for a finance SaaS tool."
  responseType="formal"
  position="bottom-left"
  welcomeMessage="Welcome! Ask me anything."
  styling={{ widgetColor: "#8e24aa", textColor: "#ffffff" }}
  theme="light"
  placeholderText="Ask your question..."
/>
```

#### 3. Anthropic Claude

```jsx
<ChatBot
  llmProvider="claude"
  apiKey="YOUR_CLAUDE_API_KEY"
  context="You are a helpful assistant for a finance SaaS tool."
  position="top-right"
  welcomeMessage="Hello! I'm Claude. How can I assist you today?"
  styling={{ widgetColor: "#7c3aed", textColor: "#ffffff" }}
  theme="dark"
/>
```

### 🛠️ Advanced: Custom LLM Config (Optional)

You can still use the advanced `directLlmConfig` prop for full control (custom endpoints, models, headers, etc):

```jsx
<ChatBot
  directLlmConfig={{
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    apiKey: "YOUR_API_KEY",
    model: "gpt-3.5-turbo"
  }}
  context="This is a chatbot for a finance SaaS tool."
  responseType="formal"
  position="bottom-left"
  welcomeMessage="Welcome! Ask me anything."
  styling={{ widgetColor: "#10b981", textColor: "#ffffff" }}
  theme="light"
  placeholderText="Ask your question..."
/>
```

### Additional Features

#### 📂 Enable File Upload

```jsx
<ChatBot
  enableFileUpload={true}
  onFileUpload={async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    await fetch('https://api.example.com/upload', {
      method: 'POST',
      body: formData
    });
  }}
  allowedFileTypes={['.pdf', '.doc', '.docx', '.txt']}
  maxFileSizeMB={5}
/>
```

#### 📝 Enable Feedback Collection

```jsx
<ChatBot
  enableFeedback={true}
  onFeedbackSubmit={(messageId, rating, comment) => {
    console.log(`Feedback for message ${messageId}: ${rating} ${comment || ''}`);
  }}
/>
```

#### 💬 Suggested Questions

```jsx
<ChatBot
  suggestedQuestions={[
    "What are the key features?",
    "How do I get started?",
    "What's the pricing model?"
  ]}
/>
```

#### 💾 Persist Chat History

```jsx
<ChatBot persistChat={true} />
```

## 📋 Props Reference

| Prop | Type | Default | Description |
|:-----|:-----|:--------|:------------|
| `backendUrl` | `string` | - | API endpoint URL for backend |
| `llmProvider` | `'openai' \| 'gemini' \| 'claude'` | - | **LLM provider (recommended, use with apiKey)** |
| `apiKey` | `string` | - | **API key for the LLM provider (recommended)** |
| `directLlmConfig` | `object` | - | Advanced: Direct LLM API config (overrides llmProvider/apiKey) |
| `context` | `string` | - | Context to guide AI responses |
| `responseType` | `string` | `'formal'` | Tone of the AI (`'casual'`, `'formal'`, `'technical'`) |
| `position` | `string` | `'bottom-right'` | Widget position |
| `welcomeMessage` | `string` | `'Hello! How can I help you today?'` | Initial welcome text |
| `styling` | `object` | `{}` | Widget color, text color, etc. |
| `theme` | `string` | `'light'` | Theme type (`'light'`, `'dark'`, `'system'`) |
| `placeholderText` | `string` | `'Type your message...'` | Input placeholder |
| `headerTitle` | `string` | `'Chat Assistant'` | Header text |
| `showTimestamps` | `boolean` | `false` | Show timestamps for each message |
| `botAvatarUrl` | `string` | - | Custom bot avatar |
| `maxHeight` | `string` | `'500px'` | Max chat window height |
| `persistChat` | `boolean` | `false` | Save conversation history locally |
| `enableFileUpload` | `boolean` | `false` | Enable file upload feature |
| `enableFeedback` | `boolean` | `false` | Collect feedback after messages |
| `suggestedQuestions` | `string[]` | `[]` | Pre-suggested questions |

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to submit a Pull Request
