import express from 'express';
import EC from 'elliptic';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';

const router = express.Router();
const ec = new EC.ec('secp256k1');

// Utility functions
const generatePrivateKey = () => {
    // Generate 32 bytes (256 bits) of random data
    const privateKeyBytes = crypto.randomBytes(32);
    return privateKeyBytes.toString('hex');
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



// Routes

// POST /api/auth/generate-account - Generate new account
router.post('/generate-account', async (req, res) => {
    try {
        // Generate new private key
        const privateKey = generatePrivateKey();

        // Generate public key and address
        const publicKey = getPublicKeyFromPrivate(privateKey);
        const userAddress = generateUserAddress(publicKey);

        res.json({
            success: true,
            data: {
                privateKey,
                publicKey,
                userAddress
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

        // Clean and validate private key
        const cleanPrivateKey = privateKey.replace(/^0x/, '').toLowerCase();

        if (!validatePrivateKey(cleanPrivateKey)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid private key format'
            });
        }

        // Generate public key and address
        const publicKey = getPublicKeyFromPrivate(cleanPrivateKey);
        const userAddress = generateUserAddress(publicKey);

        res.json({
            success: true,
            data: {
                privateKey: cleanPrivateKey,
                publicKey,
                userAddress
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