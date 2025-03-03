import { useState } from 'react';
import { 
  startRegistration, 
  startAuthentication 
} from '@simplewebauthn/browser';
import { PasskeySequenceDiagram } from './PasskeySequenceDiagram';

// Helper function to encode strings as base64url
function base64URLEncode(str) {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function PasskeyDemo() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [passkeyState, setPasskeyState] = useState('none'); // none, registering, registered, authenticating, authenticated
  const [stepDescription, setStepDescription] = useState('');
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [diagramFlow, setDiagramFlow] = useState('registration'); // 'registration', 'authentication', or 'cross-device'

  // In a real app, this would come from your server
  const mockServerData = {
    // Base64url encoded challenge 
    challenge: base64URLEncode('random-challenge-from-server-' + Math.random()),
    rpID: window.location.hostname || 'localhost',
    userID: base64URLEncode('user123-' + Math.random()),
  };

  const addLog = (message) => {
    setLogs(prev => [...prev, { time: new Date().toISOString(), message }]);
  };

  const simulateRegistration = async () => {
    try {
      // Generate default names if not provided
      const effectiveUsername = username || `user_${Math.floor(Math.random() * 10000)}`;
      const effectiveDisplayName = displayName || `Device ${Math.floor(Math.random() * 1000)}`;
      
      setError('');
      setPasskeyState('registering');
      setStepDescription('Creating a new passkey for your account...');
      addLog('Starting passkey registration...');
      
      // In a real app, you would fetch these options from your server
      const registrationOptions = {
        challenge: mockServerData.challenge,
        rp: {
          name: 'Passkey Demo',
          id: mockServerData.rpID,
        },
        user: {
          id: mockServerData.userID,
          name: effectiveUsername,
          displayName: effectiveDisplayName,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        timeout: 60000,
        attestation: 'direct',
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
          requireResidentKey: true,
        },
      };

      addLog('Prompting user to create passkey...');
      addLog(`Request payload:\n${JSON.stringify(registrationOptions, null, 2)}`);
      
      // This would trigger the browser's passkey UI
      const registrationResponse = await startRegistration(registrationOptions);
      
      addLog('Passkey created successfully!');
      addLog(`Response payload:\n${JSON.stringify(registrationResponse, null, 2)}`);
      addLog('In a real app, the passkey would be verified by the server');
      
      // In a real app, you would send this response to your server for verification
      console.log('Registration response:', registrationResponse);
      
      setPasskeyState('registered');
      
      // Use the same effective names that were used for registration
      setStepDescription(`Passkey created successfully for ${
        displayName || `Device ${Math.floor(Math.random() * 1000)}`
      }! You can now use it to sign in.`);
      
      // Add more detailed log entry
      addLog(`Passkey registered with username: ${
        username || `user_${Math.floor(Math.random() * 10000)}`
      }, display name: ${
        displayName || `Device ${Math.floor(Math.random() * 1000)}`
      }`);
      
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle specific error cases
      let errorMessage = err.message;
      if (err.name === 'NotAllowedError') {
        errorMessage = 'User declined to create a passkey';
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Security error: The operation is insecure';
      } else if (err.name === 'AbortError') {
        errorMessage = 'Passkey registration was aborted';
      } else if (err.name === 'InvalidStateError') {
        errorMessage = 'This passkey is already registered for this account';
      }
      
      setError(`Registration failed: ${errorMessage}`);
      setPasskeyState('none');
      addLog(`Error: ${errorMessage}`);
    }
  };

  const simulateAuthentication = async () => {
    try {
      setError('');
      setPasskeyState('authenticating');
      setStepDescription('Verifying your identity with passkey...');
      addLog('Starting authentication with passkey...');
      
      // In a real app, you would fetch these options from your server
      const authenticationOptions = {
        challenge: mockServerData.challenge,
        rpId: mockServerData.rpID,
        timeout: 60000,
        userVerification: 'preferred',
        // In a real app, this would contain multiple credential options
        // Since this is a demo, we don't actually need to provide the allowCredentials
        // Including this would filter to only the listed credentials, but we want the browser
        // to show all available passkeys for the domain
        // allowCredentials: [],
      };

      addLog('Checking for available passkeys...');
      addLog('Prompting user to select a passkey...');
      addLog(`Request payload:\n${JSON.stringify(authenticationOptions, null, 2)}`);
      
      // This would trigger the browser's passkey UI with selection
      const authenticationResponse = await startAuthentication(authenticationOptions);
      
      addLog('User selected a passkey and verified with biometrics');
      addLog('Passkey authentication successful!');
      addLog(`Response payload:\n${JSON.stringify(authenticationResponse, null, 2)}`);
      addLog('In a real app, this response would be verified by the server');
      
      // In a real app, you would send this response to your server for verification
      console.log('Authentication response:', authenticationResponse);
      
      setPasskeyState('authenticated');
      setStepDescription('Successfully authenticated with passkey!');
      
    } catch (err) {
      console.error('Authentication error:', err);
      
      // Handle specific error cases
      let errorMessage = err.message;
      if (err.name === 'NotAllowedError') {
        errorMessage = 'User declined to use their passkey';
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Security error: The operation is insecure';
      } else if (err.name === 'AbortError') {
        errorMessage = 'Passkey authentication was aborted';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No passkey found for this account';
      }
      
      setError(`Authentication failed: ${errorMessage}`);
      setPasskeyState('none');
      addLog(`Error: ${errorMessage}`);
    }
  };

  const resetDemo = () => {
    setPasskeyState('none');
    setStepDescription('');
    setLogs([]);
    setError('');
  };

  return (
    <div className="passkey-demo">
      <div className="passkey-container">
        <div className="passkey-form">
          <h2>Try Passkeys</h2>
          
          <div className="input-group">
            <label htmlFor="username">Username (optional):</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username (optional)"
              disabled={passkeyState !== 'none' && passkeyState !== 'registered'}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="displayName">Display Name (optional):</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter a friendly name for this device"
              disabled={passkeyState !== 'none' && passkeyState !== 'registered'}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {stepDescription && (
            <div className="step-description">
              <p>{stepDescription}</p>
            </div>
          )}
          
          <div className="button-group">
            {(passkeyState === 'none' || passkeyState === 'registered') && (
              <button 
                onClick={simulateRegistration}
                disabled={passkeyState === 'registering' || passkeyState === 'authenticating'}
              >
                Register New Passkey
              </button>
            )}
            
            {passkeyState === 'registered' && (
              <button 
                onClick={simulateAuthentication}
                disabled={passkeyState === 'registering' || passkeyState === 'authenticating'}
              >
                Authenticate with Passkey
              </button>
            )}
            
            {(passkeyState === 'registered' || passkeyState === 'authenticated') && (
              <button onClick={resetDemo}>
                Reset Demo
              </button>
            )}
          </div>
        </div>
        
        <div className="passkey-visualization">
          <h3>How Passkeys Work</h3>
          
          <div className="passkey-flowchart">
            <div className={`step ${passkeyState === 'registering' ? 'active' : ''} ${passkeyState === 'registered' || passkeyState === 'authenticating' || passkeyState === 'authenticated' ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Registration</h4>
                <p>Create a new passkey using your device's biometrics or PIN</p>
              </div>
            </div>
            
            <div className="arrow">→</div>
            
            <div className={`step ${passkeyState === 'authenticating' ? 'active' : ''} ${passkeyState === 'authenticated' ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Authentication</h4>
                <p>Use your passkey to sign in securely without a password</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Passkey Process Logs */}
      <div className="passkey-logs">
        <h3>Passkey Process Logs</h3>
        <div className="logs-container">
          {logs.length === 0 ? (
            <p className="empty-logs">Process logs will appear here...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-time">{log.time.split('T')[1].split('.')[0]}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* ReactFlow Sequence Diagram */}
      <div className="sequence-diagram-outer">
        <h3>Interactive Sequence Diagram</h3>
        <div className="diagram-tabs">
          <button 
            className={diagramFlow === 'registration' ? 'active' : ''}
            onClick={() => setDiagramFlow('registration')}
          >
            Registration Flow
          </button>
          <button 
            className={diagramFlow === 'authentication' ? 'active' : ''}
            onClick={() => setDiagramFlow('authentication')}
          >
            Authentication Flow
          </button>
          <button 
            className={diagramFlow === 'cross-device' ? 'active' : ''}
            onClick={() => setDiagramFlow('cross-device')}
          >
            Cross-Device (QR) Flow
          </button>
        </div>
        
        {/* Added key prop to force remount when flow changes */}
        <PasskeySequenceDiagram 
          key={diagramFlow}
          state={passkeyState} 
          showAuthentication={diagramFlow === 'authentication'}
          showCrossDevice={diagramFlow === 'cross-device'} 
        />
      </div>
    </div>
  );
}