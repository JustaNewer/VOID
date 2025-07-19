import express from 'express';
import * as bip39 from 'bip39';
import EC from 'elliptic';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import bs58 from 'bs58';

const router = express.Router();
const ec = new EC.ec('secp256k1');

// Utility functions
const generatePrivateKey = () => {
    // Generate 32 bytes (256 bits) of random data
    const privateKeyBytes = crypto.randomBytes(32);
    return privateKeyBytes.toString('hex');
};

const privateKeyToMnemonic = (privateKey) => {
    try {
        // Convert hex private key to buffer
        const privateKeyBuffer = Buffer.from(privateKey, 'hex');
        // Generate mnemonic from entropy
        const mnemonic = bip39.entropyToMnemonic(privateKeyBuffer);
        return mnemonic;
    } catch (error) {
        throw new Error('Invalid private key format');
    }
};

const mnemonicToPrivateKey = (mnemonic) => {
    try {
        // Validate mnemonic
        if (!bip39.validateMnemonic(mnemonic)) {
            throw new Error('Invalid mnemonic');
        }
        // Convert mnemonic to entropy (private key)
        const entropy = bip39.mnemonicToEntropy(mnemonic);
        return entropy;
    } catch (error) {
        throw new Error('Invalid mnemonic format');
    }
};

const getPublicKeyFromPrivate = (privateKey) => {
    try {
        const keyPair = ec.keyFromPrivate(privateKey, 'hex');
        const publicKey = keyPair.getPublic('hex');
        return publicKey;
    } catch (error) {
        throw new Error('Invalid private key');
    }
};

const generateUserAddress = (publicKey) => {
    // Generate user address from public key hash
    const hash = CryptoJS.SHA256(publicKey).toString();
    return hash.substring(0, 40); // Take first 40 characters as address
};

const validatePrivateKey = (privateKey) => {
    try {
        // Remove 0x prefix if present
        const cleanKey = privateKey.replace(/^0x/, '');

        // Check if it's valid hex and correct length
        if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
            return false;
        }

        // Try to create key pair to validate
        ec.keyFromPrivate(cleanKey, 'hex');
        return true;
    } catch (error) {
        return false;
    }
};

const wifToPrivateKey = (wif) => {
    try {
        // Decode WIF (Wallet Import Format)
        const decoded = bs58.decode(wif);
        
        // Check minimum length (should be 37 bytes: 1 + 32 + 4)
        if (decoded.length < 37) {
            throw new Error('Invalid WIF length');
        }
        
        // Extract private key (32 bytes starting from index 1)
        const privateKeyBytes = decoded.slice(1, 33);
        
        // Convert to hex
        const privateKeyHex = privateKeyBytes.toString('hex');
        
        // Validate the private key
        if (!validatePrivateKey(privateKeyHex)) {
            throw new Error('Invalid private key from WIF');
        }
        
        return privateKeyHex;
    } catch (error) {
        throw new Error('Invalid WIF format');
    }
};

const privateKeyToWif = (privateKey) => {
    try {
        // Convert hex private key to buffer
        const privateKeyBuffer = Buffer.from(privateKey, 'hex');
        
        // Add version byte (0x80 for mainnet)
        const versionedKey = Buffer.concat([Buffer.from([0x80]), privateKeyBuffer]);
        
        // Calculate checksum (double SHA256)
        const hash1 = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(versionedKey));
        const hash2 = CryptoJS.SHA256(hash1);
        const checksum = Buffer.from(hash2.toString(), 'hex').slice(0, 4);
        
        // Combine versioned key with checksum
        const payload = Buffer.concat([versionedKey, checksum]);
        
        // Encode with Base58
        return bs58.encode(payload);
    } catch (error) {
        throw new Error('Failed to convert private key to WIF');
    }
};

const isValidWif = (wif) => {
    try {
        wifToPrivateKey(wif);
        return true;
    } catch (error) {
        return false;
    }
};

// Routes

// POST /api/auth/generate-account - Generate new account
router.post('/generate-account', async (req, res) => {
    try {
        // Generate new private key
        const privateKey = generatePrivateKey();

        // Generate mnemonic from private key
        const mnemonic = privateKeyToMnemonic(privateKey);

        // Generate public key and address
        const publicKey = getPublicKeyFromPrivate(privateKey);
        const userAddress = generateUserAddress(publicKey);

        // Generate WIF format
        const wifFormat = privateKeyToWif(privateKey);

        res.json({
            success: true,
            data: {
                privateKey,
                mnemonic,
                publicKey,
                userAddress,
                wif: wifFormat,
                wordCount: mnemonic.split(' ').length
            }
        });
    } catch (error) {
        console.error('Error generating account:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate account',
            message: error.message
        });
    }
});

// POST /api/auth/import-mnemonic - Import account from mnemonic
router.post('/import-mnemonic', async (req, res) => {
    try {
        const { mnemonic } = req.body;

        if (!mnemonic) {
            return res.status(400).json({
                success: false,
                error: 'Mnemonic is required'
            });
        }

        // Convert mnemonic to private key
        const privateKey = mnemonicToPrivateKey(mnemonic.trim());

        // Generate public key and address
        const publicKey = getPublicKeyFromPrivate(privateKey);
        const userAddress = generateUserAddress(publicKey);

        // Generate WIF format
        const wifFormat = privateKeyToWif(privateKey);

        res.json({
            success: true,
            data: {
                privateKey,
                publicKey,
                userAddress,
                mnemonic: mnemonic.trim(),
                wif: wifFormat
            }
        });
    } catch (error) {
        console.error('Error importing mnemonic:', error);
        res.status(400).json({
            success: false,
            error: 'Invalid mnemonic',
            message: error.message
        });
    }
});

// POST /api/auth/import-private-key - Import account from private key
router.post('/import-private-key', async (req, res) => {
    try {
        const { privateKey } = req.body;

        if (!privateKey) {
            return res.status(400).json({
                success: false,
                error: 'Private key is required'
            });
        }

        let cleanPrivateKey;

        // Check if it's WIF format first
        if (isValidWif(privateKey.trim())) {
            cleanPrivateKey = wifToPrivateKey(privateKey.trim());
        } else {
            // Clean and validate hex private key
            cleanPrivateKey = privateKey.replace(/^0x/, '').toLowerCase();

            if (!validatePrivateKey(cleanPrivateKey)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid private key format (not valid hex or WIF)'
                });
            }
        }

        // Generate public key and address
        const publicKey = getPublicKeyFromPrivate(cleanPrivateKey);
        const userAddress = generateUserAddress(publicKey);
        const mnemonic = privateKeyToMnemonic(cleanPrivateKey);
        const wifFormat = privateKeyToWif(cleanPrivateKey);

        res.json({
            success: true,
            data: {
                privateKey: cleanPrivateKey,
                publicKey,
                userAddress,
                mnemonic,
                wif: wifFormat
            }
        });
    } catch (error) {
        console.error('Error importing private key:', error);
        res.status(400).json({
            success: false,
            error: 'Invalid private key',
            message: error.message
        });
    }
});

// POST /api/auth/validate-credentials - Validate user credentials
router.post('/validate-credentials', async (req, res) => {
    try {
        const { type, credential } = req.body;

        if (!type || !credential) {
            return res.status(400).json({
                success: false,
                error: 'Type and credential are required'
            });
        }

        let privateKey;
        let isValid = false;

        switch (type) {
            case 'mnemonic':
                isValid = bip39.validateMnemonic(credential.trim());
                if (isValid) {
                    privateKey = mnemonicToPrivateKey(credential.trim());
                }
                break;

            case 'privateKey':
                isValid = validatePrivateKey(credential);
                if (isValid) {
                    privateKey = credential.replace(/^0x/, '').toLowerCase();
                }
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid credential type'
                });
        }

        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: `Invalid ${type} format`
            });
        }

        // Generate public key and address for valid credentials
        const publicKey = getPublicKeyFromPrivate(privateKey);
        const userAddress = generateUserAddress(publicKey);

        res.json({
            success: true,
            data: {
                valid: true,
                userAddress,
                publicKey
            }
        });
    } catch (error) {
        console.error('Error validating credentials:', error);
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            message: error.message
        });
    }
});

export default router; 