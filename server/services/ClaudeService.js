const axios = require('axios');

class ClaudeService {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.model = 'claude-opus-4-5';
    this.maxTokens = 1024;
  }

  async sendImagePrompt(imageBase64, mimeType = 'image/jpeg') {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.model,
          max_tokens: this.maxTokens,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: 'Extract the wine information from this label. Return ONLY a JSON object with these fields: {"name": "wine name", "vintage": year as number or null, "producer": "producer name or null", "region": "region or null"}. If you cannot find a field, use null.',
              },
            ],
          }],
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        }
      );

      return this._parseResponse(response.data);
    } catch (error) {
      this._handleError(error);
    }
  }

  _parseResponse(data) {
    const text = data.content[0].text;
    // Nettoie le texte et extrait le JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Claude response');
    return JSON.parse(jsonMatch[0]);
  }

  _handleError(error) {
    if (error.response?.status === 429) {
      throw new Error('RATE_LIMITED: Too many requests to Claude API');
    }
    if (error.response?.status === 500) {
      throw new Error('CLAUDE_SERVER_ERROR: Claude API is unavailable');
    }
    throw new Error(`CLAUDE_ERROR: ${error.message}`);
  }
}

module.exports = new ClaudeService();
