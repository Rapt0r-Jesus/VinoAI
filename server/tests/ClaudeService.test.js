// Mock axios AVANT tout import
jest.mock('axios');
const axios = require('axios');
const claudeService = require('../services/ClaudeService');

describe('ClaudeService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parses a valid Claude response correctly', async () => {
    axios.post.mockResolvedValue({
      data: {
        content: [{
          text: '{"name": "Château Margaux", "vintage": 2018, "producer": "Château Margaux", "region": "Bordeaux"}'
        }]
      }
    });

    const result = await claudeService.sendImagePrompt('fake-base64-image');

    expect(result.name).toBe('Château Margaux');
    expect(result.vintage).toBe(2018);
    expect(result.region).toBe('Bordeaux');
  });

  it('throws RATE_LIMITED error on 429 response', async () => {
    axios.post.mockRejectedValue({ response: { status: 429 } });

    await expect(claudeService.sendImagePrompt('fake-base64'))
      .rejects.toThrow('RATE_LIMITED');
  });

  it('throws CLAUDE_SERVER_ERROR on 500 response', async () => {
    axios.post.mockRejectedValue({ response: { status: 500 } });

    await expect(claudeService.sendImagePrompt('fake-base64'))
      .rejects.toThrow('CLAUDE_SERVER_ERROR');
  });

});
