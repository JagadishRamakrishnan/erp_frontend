import apiCall from './api';

const metaService = {
  // Connect Meta Account
  connect: async (metaData) => {
    return await apiCall('/meta/connect', {
      method: 'POST',
      body: JSON.stringify(metaData),
    });
  },

  // Get Meta Account
  getMetaAccount: async () => {
    return await apiCall('/meta/account');
  },

  // Sync Ad Accounts
  syncAdAccounts: async (adAccountsData) => {
    return await apiCall('/meta/ad-accounts/sync', {
      method: 'POST',
      body: JSON.stringify(adAccountsData),
    });
  },

  // Sync Campaigns
  syncCampaigns: async (campaignsData) => {
    return await apiCall('/meta/campaigns/sync', {
      method: 'POST',
      body: JSON.stringify(campaignsData),
    });
  },

  // Sync Ad Sets
  syncAdSets: async (adSetsData) => {
    return await apiCall('/meta/adsets/sync', {
      method: 'POST',
      body: JSON.stringify(adSetsData),
    });
  },

  // Sync Ads
  syncAds: async (adsData) => {
    return await apiCall('/meta/ads/sync', {
      method: 'POST',
      body: JSON.stringify(adsData),
    });
  },

  // Sync Insights
  syncInsights: async (insightsData) => {
    return await apiCall('/meta/insights/sync', {
      method: 'POST',
      body: JSON.stringify(insightsData),
    });
  },

  // Get Marketing Dashboard
  getDashboard: async () => {
    return await apiCall('/meta/dashboard');
  },

  // Get All Campaigns
  getCampaigns: async () => {
    return await apiCall('/meta/campaigns');
  },
};

export default metaService;
