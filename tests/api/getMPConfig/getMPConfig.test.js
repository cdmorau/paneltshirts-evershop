import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('config', () => ({
  default: { get: vi.fn(), has: vi.fn() }
}));

const mockConfig = (await import('config')).default;
const handler = (await import('../../../extensions/panel-theme/src/api/getMPConfig/getMPConfig.js')).default;

function makeRes() {
  const res = { _status: 200, _body: null };
  res.status = (code) => { res._status = code; return res; };
  res.json = (body) => { res._body = body; return res; };
  return res;
}

describe('getMPConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig.get.mockReturnValue('TEST-fake-public-key');
  });

  it('retorna la public key cuando está configurada', async () => {
    const res = makeRes();
    await handler({}, res);
    expect(res._status).toBe(200);
    expect(res._body.data.public_key).toBe('TEST-fake-public-key');
  });

  it('retorna 400 cuando la public key no está configurada', async () => {
    mockConfig.get.mockImplementation(() => { throw new Error('not found'); });
    const res = makeRes();
    await handler({}, res);
    expect(res._status).toBe(400);
    expect(res._body.error.message).toMatch(/public key/i);
  });

  it('retorna 400 cuando la public key está vacía', async () => {
    mockConfig.get.mockReturnValue('');
    const res = makeRes();
    await handler({}, res);
    expect(res._status).toBe(400);
  });
});
