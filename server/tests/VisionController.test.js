jest.mock('../services/ClaudeService');
const claudeService = require('../services/ClaudeService');
const visionController = require('../controllers/VisionController');

describe('VisionController', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('analyzeLabel returns structured wine data', async () => {
    claudeService.sendImagePrompt.mockResolvedValue({
      name: 'Château Margaux',
      vintage: 2018,
      producer: 'Château Margaux',
      region: 'Bordeaux',
    });

    const result = await visionController.analyzeLabel('fake-base64');

    expect(result.name).toBe('Château Margaux');
    expect(result.vintage).toBe(2018);
    expect(result.producer).toBe('Château Margaux');
    expect(result.region).toBe('Bordeaux');
  });

  it('throws EXTRACTION_FAILED when name is missing', async () => {
    claudeService.sendImagePrompt.mockResolvedValue({
      name: null,
      vintage: 2018,
      producer: null,
      region: null,
    });

    await expect(visionController.analyzeLabel('fake-base64'))
      .rejects.toThrow('EXTRACTION_FAILED');
  });

  it('throws when Claude service fails', async () => {
    claudeService.sendImagePrompt.mockRejectedValue(
      new Error('RATE_LIMITED')
    );

    await expect(visionController.analyzeLabel('fake-base64'))
      .rejects.toThrow('RATE_LIMITED');
  });

});
