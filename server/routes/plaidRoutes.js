const express = require('express');
const router = express.Router();
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

// Configure Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Create a link token
router.post('/create_link_token', async (req, res) => {
  try {
    const createTokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: 'user-id', // In a real app, use the authenticated user's ID
      },
      client_name: 'Finance App',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    });
    
    return res.json(createTokenResponse.data);
  } catch (error) {
    console.error('Error creating link token:', error);
    return res.status(500).json({ error: 'Failed to create link token' });
  }
});

// Exchange public token for access token
router.post('/exchange_token', async (req, res) => {
  try {
    const { public_token } = req.body;
    
    if (!public_token) {
      return res.status(400).json({ error: 'Missing public token' });
    }
    
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;
    
    // In a real app, store these securely for the user
    // e.g., in your database associated with the user
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return res.status(500).json({ error: 'Failed to exchange token' });
  }
});

// Get linked accounts
router.get('/accounts', async (req, res) => {
  try {
    // In a real app, retrieve the access token for the authenticated user
    const accessToken = 'access-token'; // Replace with actual token retrieval
    
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    
    return res.json(response.data.accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

module.exports = router; 