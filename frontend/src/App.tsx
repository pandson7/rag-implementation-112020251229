import React, { useState } from 'react';
import './App.css';

interface QueryResponse {
  response: string;
  sources: string[];
  queryId: string;
  responseTime: number;
}

const sampleQuestions = [
  "What are the key principles of SaaS architecture?",
  "How does multi-tenancy work in SaaS applications?",
  "What are the security considerations for SaaS platforms?",
  "Explain the data isolation strategies in SaaS architecture",
  "What are the scalability patterns for SaaS applications?"
];

const API_BASE_URL = 'https://3n0sg4sx53.execute-api.us-east-1.amazonaws.com/prod';

function App() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: QueryResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleQuestionClick = (sampleQuestion: string) => {
    setQuestion(sampleQuestion);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>RAG Document Q&A System</h1>
        <p>Ask questions about SaaS Architecture Fundamentals</p>
      </header>

      <main className="App-main">
        <div className="sample-questions">
          <h3>Sample Questions:</h3>
          <div className="questions-grid">
            {sampleQuestions.map((q, index) => (
              <button
                key={index}
                className="sample-question-btn"
                onClick={() => handleSampleQuestionClick(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="question-form">
          <div className="input-group">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question here..."
              rows={3}
              className="question-input"
            />
            <button 
              type="submit" 
              disabled={loading || !question.trim()}
              className="submit-btn"
            >
              {loading ? 'Processing...' : 'Ask Question'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <h3>Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {response && (
          <div className="response-section">
            <div className="response-header">
              <h3>Answer:</h3>
              <div className="response-meta">
                <span>Response Time: {response.responseTime}ms</span>
                <span>Query ID: {response.queryId}</span>
              </div>
            </div>
            
            <div className="response-content">
              <p>{response.response}</p>
            </div>

            {response.sources.length > 0 && (
              <div className="sources-section">
                <h4>Sources:</h4>
                <ul>
                  {response.sources.map((source, index) => (
                    <li key={index}>{source}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
