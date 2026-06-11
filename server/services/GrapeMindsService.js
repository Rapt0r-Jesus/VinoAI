const axios = require('axios');

class GrapeMindsService {
  constructor() {
    this.apiKey = process.env.GRAPEMINDS_API_KEY;
    this.baseUrl = 'https://api.grapeminds.com/v1';
  }

  async fetchWineData(name, vintage = null, producer = null) {
    try {
      const params = { name };
      if (vintage) params.vintage = vintage;
      if (producer) params.producer = producer;

      const response = await axios.get(`${this.baseUrl}/wines`, {
        params,
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      return this._parseWineData(response.data);
    } catch (error) {
      this._handleApiError(error);
    }
  }

  async searchByName(query, limit = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/wines/search`, {
        params: { q: query, limit },
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      return response.data.results || [];
    } catch (error) {
      this._handleApiError(error);
    }
  }

  _parseWineData(data) {
    return {
      grape:        data.grape        || null,
      appellation:  data.appellation  || null,
      tasting_notes: data.tasting_notes || null,
      food_pairings: data.food_pairings || [],
      producer_bio:  data.producer_bio  || null,
      grapeminds_id: data.id           || null,
    };
  }

  _handleApiError(error) {
    if (error.response?.status === 404) {
      throw new Error('NOT_FOUND: Wine not found in GrapeMinds database');
    }
    if (error.response?.status === 429) {
      throw new Error('RATE_LIMITED: Too many requests to GrapeMinds API');
    }
    if (error.response?.status === 500) {
      throw new Error('GRAPEMINDS_SERVER_ERROR: GrapeMinds API is unavailable');
    }
    throw new Error(`GRAPEMINDS_ERROR: ${error.message}`);
  }
}

module.exports = new GrapeMindsService();
