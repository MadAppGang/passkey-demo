# Passkey Demo

This is an interactive React.js demonstration of the WebAuthn/Passkey authentication flow. The demo simulates both the registration and authentication processes using the WebAuthn API.

## Features

- Interactive visualization of the passkey flow
- Step-by-step process demonstration
- Live logging of the authentication process
- Simulates both registration and authentication

## Technologies Used

- React.js
- Vite
- SimpleWebAuthn library

## How Passkeys Work

Passkeys are a modern authentication mechanism that replaces traditional passwords with more secure cryptographic keys. The process works as follows:

1. **Registration**: 
   - The user creates a passkey using their device's biometrics (fingerprint, face recognition) or PIN
   - The browser generates a public-private key pair
   - The private key stays on the user's device
   - The public key is sent to the website's server

2. **Authentication**:
   - When signing in, the website sends a challenge to the user's device
   - The user verifies their identity using biometrics or PIN
   - The device uses the private key to sign the challenge
   - The signed challenge is sent back to the server for verification

Passkeys offer several advantages over traditional passwords:
- No more forgotten passwords
- Protection against phishing (passkeys are domain-specific)
- No password reuse between sites
- Strong security by default

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to the URL shown in the terminal

## Notes

This is a demonstration and simulation of the passkey flow. In a real-world implementation, you would need:

1. A proper backend server to generate challenges and verify responses
2. Server-side storage for user public keys
3. Proper error handling and security measures

For production use, consider a full WebAuthn server implementation with proper security considerations.

## Resources

- [WebAuthn API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
- [SimpleWebAuthn Documentation](https://simplewebauthn.dev/)
- [FIDO Alliance Passkeys](https://fidoalliance.org/passkeys/)
