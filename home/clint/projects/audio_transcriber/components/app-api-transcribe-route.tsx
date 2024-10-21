import React, { useReducer } from 'react';

type State = {
  isLoading: boolean;
  // Add other state properties here
};

type Action = 
  | { type: 'SET_LOADING'; payload: boolean }
  // Add other action types here

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const RouteTs: React.FC = () => {
    // ... existing code ...

    const [state, dispatch] = useReducer(reducer, { isLoading: false });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            // Your transcription logic here
        } catch (error) {
            // Error handling
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    return (
        // ... existing code ...
        <form onSubmit={handleSubmit}>
            {/* ... form fields ... */}
            <button
                type="submit"
                disabled={state.isLoading}
                aria-live="polite"
            >
                {state.isLoading ? 'Transcribing...' : 'Transcribe'}
            </button>
        </form>
        // ... existing code ...
    );
};

export default RouteTs;
