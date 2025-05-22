import styles from './ChatSuggestions.module.css';

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  styling?: {
    widgetColor?: string;
    textColor?: string;
  };
}

export const ChatSuggestions = ({
  suggestions,
  onSuggestionClick,
  styling = {},
}: ChatSuggestionsProps) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={styles.suggestionsContainer}>
      <div className={styles.suggestionsLabel}>Suggested questions:</div>
      <div className={styles.suggestionsList}>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className={styles.suggestionButton}
            onClick={() => onSuggestionClick(suggestion)}
            style={{
              borderColor: styling.widgetColor || '#4f46e5',
              color: styling.widgetColor || '#4f46e5',
            }}
            aria-label={`Ask: ${suggestion}`}
          >
            <span className={styles.suggestionIcon}>?</span>
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}; 