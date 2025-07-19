# VOID - Distributed Encrypted Chat Network

A secure, decentralized chat network with Bitcoin-like wallet functionality for user authentication.

## Features

### 🔐 Secure Authentication
- **Private Key Based Login**: Uses secp256k1 elliptic curve cryptography like Bitcoin
- **BIP39 Mnemonic Support**: Generate and import accounts using 12/24-word mnemonic phrases
- **WIF Format Support**: Compatible with Bitcoin wallet import format
- **Local Encryption**: AES-256 encryption for local storage
- **No Server Dependencies**: Completely decentralized identity management

### 🎨 Modern Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Automatic theme detection with manual toggle
- **Clean UI**: Minimalist design focused on usability
- **Real-time Updates**: Smooth transitions and interactions

### 🛡️ Security Features
- **Client-side Encryption**: Private keys never leave your device
- **Password Protection**: Additional layer of security with user passwords
- **Session Management**: Secure session handling with automatic expiration
- **Input Validation**: Comprehensive validation for all cryptographic inputs

## Technology Stack

### Frontend
- **Vue.js 3** - Modern reactive framework with Composition API
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Vite** - Fast build tool and development server
- **CSS Variables** - Dynamic theming system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **BIP39** - Mnemonic phrase generation and validation
- **Elliptic** - Cryptographic operations
- **CryptoJS** - Encryption utilities
- **BS58** - Base58 encoding for WIF support

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JustaNewer/VOID.git
   cd VOID
   ```

2. **Install backend dependencies**
   ```bash
   cd BackEnd
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../FrontEnd
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd BackEnd
   npm run dev
   ```
   Backend runs on `http://localhost:3000`

2. **Start the frontend development server**
   ```bash
   cd FrontEnd
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## Usage

### Creating a New Account

1. Navigate to the registration page
2. Click "Generate New Account"
3. **IMPORTANT**: Save your private key and mnemonic phrase securely
4. Set a login password for local encryption
5. Complete the registration process

### Logging In

You can log in using any of these methods:

- **Mnemonic Phrase**: Enter your 12 or 24-word recovery phrase
- **Private Key (Hex)**: Enter your 64-character hexadecimal private key
- **WIF Format**: Enter your Bitcoin-compatible WIF private key
- **Quick Login**: Use saved credentials with your password

### Account Management

- View your user address and public key
- Securely access your private key with password verification
- Export account credentials for backup
- Copy any credential to clipboard

## Security Best Practices

1. **Backup Your Credentials**: Always save your mnemonic phrase and private key securely
2. **Use Strong Passwords**: Choose a strong password for local encryption
3. **Keep Credentials Private**: Never share your private key or mnemonic phrase
4. **Verify URLs**: Always ensure you're using the correct application URL
5. **Regular Backups**: Periodically backup your account information

## API Endpoints

### Authentication Routes

- `POST /api/auth/generate-account` - Generate new account credentials
- `POST /api/auth/import-mnemonic` - Import account from mnemonic phrase
- `POST /api/auth/import-private-key` - Import account from private key (hex or WIF)
- `POST /api/auth/validate-credentials` - Validate user credentials

## Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Peer-to-peer messaging
- [ ] End-to-end encryption for messages
- [ ] Group chat functionality
- [ ] File sharing capabilities
- [ ] Mobile application
- [ ] Multi-language support

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**⚠️ Security Notice**: This is a proof-of-concept implementation. For production use, conduct thorough security audits and follow best practices for cryptographic applications. 