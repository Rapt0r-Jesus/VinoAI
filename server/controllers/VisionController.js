const claudeService = require('../services/ClaudeService');

class VisionController {
  constructor() {
    this.prompt = `Extract the wine information from this label. 
Return ONLY a JSON object with these fields: 
{"name": "wine name", "vintage": year as number or null, "producer": "producer name or null", "region": "region or null"}. 
If you cannot find a field, use null.`;
  }

  async analyzeLabel(imageBase64) {
    const raw = await claudeService.sendImagePrompt(imageBase64);
    return this._parseResponse(raw);
  }

  _parseResponse(data) {
    this._validate(data);
    return {
      name:     data.name     || null,
      vintage:  data.vintage  || null,
      producer: data.producer || null,
      region:   data.region   || null,
    };
  }

  _validate(data) {
    if (!data || !data.name) {
      throw new Error('EXTRACTION_FAILED: Could not extract wine name from label');
    }
  }
}

module.exports = new VisionController();
