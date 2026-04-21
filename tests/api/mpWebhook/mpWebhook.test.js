import { describe, it, expect, vi, beforeEach } from 'vitest';

const db = { client: null };
const mp = { paymentGet: null };

vi.mock('pg', () => ({
  default: {
    Client: function MockPgClient() { return db.client; }
  }
}));

vi.mock('config', () => ({
  default: { get: vi.fn(), has: vi.fn() }
}));

vi.mock('mercadopago', () => ({
  MercadoPagoConfig: function MockMPConfig() {},
  Payment: function MockPayment() {
    return { get: mp.paymentGet };
  }
}));

const mockConfig = (await import('config')).default;
const handler = (await import('../../../extensions/panel-theme/src/api/mpWebhook/mpWebhook.js')).default;

function makeRes() {
  const res = { _status: null, _body: null };
  res.status = (code) => { res._status = code; return res; };
  res.json = (body) => { res._body = body; return res; };
  return res;
}

describe('mpWebhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    db.client = {
      connect: vi.fn().mockResolvedValue(undefined),
      query: vi.fn().mockResolvedValue({ rows: [] }),
      end: vi.fn().mockResolvedValue(undefined)
    };

    mp.paymentGet = vi.fn().mockResolvedValue({
      id: 'pay-1',
      status: 'approved',
      external_reference: 'uuid-123',
      metadata: { order_id: 'uuid-123' }
    });

    mockConfig.get.mockReturnValue('TEST-fake-token');
    mockConfig.has.mockReturnValue(false);
  });

  it('responde 200 inmediatamente para cualquier request', async () => {
    const req = { body: { type: 'payment', data: { id: '1' } } };
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._body).toEqual({ received: true });
  });

  it('ignora eventos que no son type: payment', async () => {
    const req = { body: { type: 'merchant_order', data: { id: '1' } } };
    const res = makeRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(mp.paymentGet).not.toHaveBeenCalled();
  });

  it('no lanza error si la orden no existe en BD (silencioso)', async () => {
    mp.paymentGet.mockResolvedValue({
      id: 'pay-99',
      status: 'approved',
      external_reference: 'uuid-nonexistent',
      metadata: {}
    });

    const req = { body: { type: 'payment', data: { id: '99' } } };
    const res = makeRes();
    await expect(handler(req, res)).resolves.not.toThrow();
    expect(res._status).toBe(200);
  });

  it('no procesa nada si falta accessToken', async () => {
    mockConfig.get.mockImplementation(() => { throw new Error('not found'); });
    const req = { body: { type: 'payment', data: { id: '1' } } };
    const res = makeRes();
    await handler(req, res);
    expect(mp.paymentGet).not.toHaveBeenCalled();
  });
});
