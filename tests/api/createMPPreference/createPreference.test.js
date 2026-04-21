import { describe, it, expect, vi, beforeEach } from 'vitest';

const db = { client: null };
const mp = { preferenceCreate: null };

vi.mock('pg', () => ({ default: { Client: function() { return db.client; } } }));
vi.mock('config', () => ({ default: { get: vi.fn(), has: vi.fn() } }));
vi.mock('mercadopago', () => ({
  MercadoPagoConfig: function() {},
  Preference: function() { return { create: mp.preferenceCreate }; }
}));

const mockConfig = (await import('config')).default;
const handler = (await import('../../../extensions/panel-theme/src/api/createMPPreference/createPreference.js')).default;

function makeRes() {
  const res = { _status: 200, _body: null };
  res.status = (code) => { res._status = code; return res; };
  res.json = (body) => { res._body = body; return res; };
  return res;
}

const MOCK_ORDER = { order_id: 1, uuid: 'uuid-123', grand_total: '80000', currency: 'COP', customer_email: 'test@test.com', customer_full_name: 'Test' };

describe('createMPPreference', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.client = {
      connect: vi.fn().mockResolvedValue(undefined),
      query: vi.fn(),
      end: vi.fn().mockResolvedValue(undefined)
    };
    mp.preferenceCreate = vi.fn().mockResolvedValue({
      id: 'pref-123',
      init_point: 'https://mp.com/checkout',
      sandbox_init_point: 'https://sandbox.mp.com/checkout'
    });
    mockConfig.get.mockImplementation((key) => {
      if (key === 'mercadopago.accessToken') return 'TEST-fake-token';
      if (key === 'mercadopago.publicKey') return 'TEST-fake-key';
      if (key === 'mercadopago.appUrl') return 'http://localhost:3000';
      throw new Error('not found');
    });
    mockConfig.has.mockReturnValue(false);
  });

  it('retorna 400 si falta order_id', async () => {
    const res = makeRes();
    await handler({ body: {} }, res);
    expect(res._status).toBe(400);
  });

  it('retorna 400 si no hay accessToken', async () => {
    mockConfig.get.mockImplementation(() => { throw new Error('not found'); });
    const res = makeRes();
    await handler({ body: { order_id: 'uuid-123' } }, res);
    expect(res._status).toBe(400);
  });

  it('retorna 404 si la orden no existe', async () => {
    db.client.query.mockResolvedValue({ rows: [] });
    const res = makeRes();
    await handler({ body: { order_id: 'uuid-missing' } }, res);
    expect(res._status).toBe(404);
  });

  it('retorna preference con back_urls correctas en éxito', async () => {
    db.client.query
      .mockResolvedValueOnce({ rows: [MOCK_ORDER] })
      .mockResolvedValueOnce({ rows: [] });
    const res = makeRes();
    await handler({ body: { order_id: 'uuid-123' } }, res);

    expect(res._status).toBe(200);
    expect(res._body.data.preference_id).toBe('pref-123');
    expect(res._body.data.is_sandbox).toBe(true);

    const prefBody = mp.preferenceCreate.mock.calls[0][0].body;
    expect(prefBody.back_urls.success).toBe('http://localhost:3000/checkout/success/uuid-123');
    expect(prefBody.back_urls.failure).toBe('http://localhost:3000/checkout');
    expect(prefBody.external_reference).toBe('uuid-123');
    expect(prefBody.auto_return).toBe('approved');
  });

  it('incluye items de la orden correctamente', async () => {
    db.client.query
      .mockResolvedValueOnce({ rows: [MOCK_ORDER] })
      .mockResolvedValueOnce({ rows: [
        { product_sku: 'SKU-1', product_name: 'T-Shirt', qty: 2, final_price_incl_tax: '80000', order_item_id: 1 }
      ]});
    const res = makeRes();
    await handler({ body: { order_id: 'uuid-123' } }, res);

    const prefBody = mp.preferenceCreate.mock.calls[0][0].body;
    expect(prefBody.items).toHaveLength(1);
    expect(prefBody.items[0].quantity).toBe(2);
    expect(prefBody.items[0].unit_price).toBe(80000);
  });

  it('usa item genérico cuando la orden no tiene items', async () => {
    db.client.query
      .mockResolvedValueOnce({ rows: [MOCK_ORDER] })
      .mockResolvedValueOnce({ rows: [] });
    const res = makeRes();
    await handler({ body: { order_id: 'uuid-123' } }, res);

    const prefBody = mp.preferenceCreate.mock.calls[0][0].body;
    expect(prefBody.items[0].unit_price).toBe(80000);
  });
});
