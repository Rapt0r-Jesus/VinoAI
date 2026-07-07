const axios = require('axios');

class GrapeMindsService {
  constructor() {
    this.apiKey = process.env.GRAPEMINDS_API_KEY;
    this.claudeKey = process.env.CLAUDE_API_KEY;
    this.baseUrl = 'https://api.grapeminds.eu/public/v1';
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept-Language': 'fr',
    };
  }

  async fetchWineData(name, vintage = null, producer = null) {
    try {
      const searchResponse = await axios.get(`${this.baseUrl}/wines/search`, {
        params: { q: name, limit: 1 },
        headers: this.headers,
      });

      const results = searchResponse.data.data;
      if (!results || results.length === 0) {
        throw new Error('NOT_FOUND: Wine not found in GrapeMinds database');
      }

      const wineId = results[0].id;
      console.log(`Vin trouvé: ${results[0].display_name} (ID: ${wineId})`);

      const detailResponse = await axios.get(`${this.baseUrl}/wines/${wineId}`, {
        headers: this.headers,
      });

      const wineDetail = detailResponse.data.data || detailResponse.data;

      if (!wineDetail.tasting_notes && !wineDetail.pairing) {
        console.log('Données manquantes, génération via Claude...');
        const aiData = await this._generateWithClaude(wineDetail, name, vintage);
        wineDetail.tasting_notes = { text: aiData.tasting_notes };
        wineDetail.pairing = { text: aiData.food_pairings };
      }

      return this._parseWineData(wineDetail);

    } catch (error) {
      this._handleApiError(error);
    }
  }

  async _generateWithClaude(wineData, name, vintage) {
    const grapes = wineData.grapes?.map(g => g.name).join(', ') || 'inconnu';
    const region = wineData.region?.name || 'inconnue';
    const flavor = wineData.flavor_profile;

    const prompt = `Tu es un sommelier expert. Pour ce vin :
- Nom: ${name} ${vintage || ''}
- Région: ${region}
- Cépages: ${grapes}
- Profil: sucrosité ${flavor?.sweetness}/10, acidité ${flavor?.acidity}/10, tanins ${flavor?.tannins}/10, corps ${flavor?.body}/10

Génère en français :
1. Des notes de dégustation (2-3 phrases)
2. 3 suggestions d'accords mets-vins (liste courte)

Réponds UNIQUEMENT en JSON : {"tasting_notes": "...", "food_pairings": "..."}`;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': this.claudeKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    const text = response.data.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { tasting_notes: null, food_pairings: null };
  }

  async searchByName(query, limit = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/wines/search`, {
        params: { q: query, limit },
        headers: this.headers,
      });

      return response.data.data || [];
    } catch (error) {
      this._handleApiError(error);
    }
  }

  _parseWineData(data) {
    return {
      grape:         data.grapes?.map(g => g.name).join(', ') || null,
      appellation:   data.region?.name || null,
      tasting_notes: data.tasting_notes?.text || null,
      food_pairings: data.pairing?.text ? [data.pairing.text] : [],
      producer_bio:  data.description?.text || null,
      grapeminds_id: data.id || null,
    };
  }

  _handleApiError(error) {
    if (error.message?.startsWith('NOT_FOUND')) {
      throw error;
    }
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
