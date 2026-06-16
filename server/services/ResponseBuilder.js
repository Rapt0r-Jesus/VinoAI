class ResponseBuilder {
  merge(visionData, wineData) {
    return this._sanitize({
      // Données de Claude Vision
      name:          visionData.name     || null,
      vintage:       visionData.vintage  || null,
      producer:      visionData.producer || null,
      region:        visionData.region   || null,
      // Données de GrapeMinds
      grape:         wineData.grape         || null,
      appellation:   wineData.appellation   || null,
      tasting_notes: wineData.tasting_notes || null,
      food_pairings: wineData.food_pairings || [],
      grapeminds_id: wineData.grapeminds_id || null,
    });
  }

  _sanitize(data) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        sanitized[key] = value;
      } else {
        sanitized[key] = value !== null && value !== undefined ? value : '';
      }
    }
    return sanitized;
  }

  toJSON(winePayload) {
    return JSON.stringify(winePayload);
  }
}

module.exports = new ResponseBuilder();
