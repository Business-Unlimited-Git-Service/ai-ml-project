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
          const response = await fetch('http://localhost:8080/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userQuery }), // <----
          });
    
          if (response.status !== 200) {
            const parsedError: { err: string } = await response.json();
            setError(parsedError.err);
          } else {
            const parsedResponse: ParsedResponse = await response.json();
            // parsedResponse.newPokemon was never defined because it expects a JSON file
            setOutput(parsedResponse.newPokemon);
          }
        } catch (error) {
          setError((error as Error).message || 'Your Pokemon died upon creation... It was an abomination. It spat in the face of God and chose not to exist.');
        } finally {
          setLoading(false);
        }
      };


    return (
        <div style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="What form does your pokemon take?"
              style={{ width: '300px', padding: '8px', marginTop: '8px' }}
            />
              <button type="submit" style={{ marginTop: '16px' }} disabled={loading}>
                  {loading ? 'Loading...' : 'Get Pokemon'}
              </button>
        </form> 
              {error && <p className="error">{error}</p>}
              {output && (
            <div style={{ marginTop: '24px' }}>
        <h2>Here's Your New Pokemon:</h2>
            <div>{ output }</div>
        </div>
      )}
        </div>
    )

}

export default UserInput;