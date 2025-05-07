import React, { useState } from 'react'; 

interface ParsedResponse {
    newPokemon: string;
  }

const UserInput = () => {
    // useStates
    const [userQuery, setUserQuery] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState('');


    //handleSubmit Function

    //
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setOutput('');
    
        try {
          const response = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userQuery }),
          });
    
          if (response.status !== 200) {
            const parsedError: { err: string } = await response.json();
            setError(parsedError.err);
          } else {
            const parsedResponse: ParsedResponse = await response.json();
            setOutput(parsedResponse.newPokemon);
          }
        } catch (error) {
          setError(error as string);
        } finally {
          setLoading(false);
        }
      };


    return (
        <div style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit}>
          <label>
            I want my pokemon to be:
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Enter pokemon parameters"
              style={{ width: '100%', padding: '8px', marginTop: '8px' }}
            />
          </label>
          <button type="submit" style={{ marginTop: '16px' }} disabled={loading}>
            {loading ? 'Loading...' : 'Get Pokemon'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {output && (
          <div style={{ marginTop: '24px' }}>
            <h2>Here's Your New Pokemon:</h2>
            <div>{output}</div>
          </div>
        )}
      </div>
    )

}

export default UserInput;