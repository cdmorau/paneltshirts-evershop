import { describe, it, expect, vi, beforeEach } from 'vitest';

const db = { client: null };
const mp = { paymentCreate: null };

vi.mock('pg', () => ({ default: { Client: function() { return db.client; } } }));
vi.mock('config', () => ({ default: { get: vi.fn(), has: vi.fn() } }));
vi.mock('mercadopago', () => ({
  MercadoPagoConfig: function() {},
  Payment: function() { return { create: mp.paymentCreate }; }
}));

const mockConfig = (await import('config')).default;
const handler = (await import('../../../extensions/panel-theme/src/api/processMPPayment/processMPPayment.js')).default;

function makeRes() {
  const res = { _status: 200, _body: null };
  res.status = (code) => { res._status = code; return res; };
  res.json = (body) => { res._body = body; return res; };
  return res;
}

const MOCK_ORDER = { order_id: 1, uuid: 'uuid-123', grand_total: '80000' };

describe('processMPPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.client = {
      connect: vi.fn().mockResolvedValue(undefined),
      query: vi.fn(),
      end: vi.fn().mockResolvedValue(undefined)
    };
    mp.paymentCreate = vi.fn().mockResolvedValue({ id: 'pay-999', status: 'approved' });
    mockConfig.get.mockReturnValue('APP_USR-fake-prod-token');
    mockConfig.has.mockReturnValue(false);
  });

  it('retorna 400 si falta formData', async () => {
    const res = makeRes();
    await handler({ body: { order_id: 'uuid-123' } }, res);
    expect(res._status).toBe(400);
    expect(res._body.error.message).toMatch(/formData/);
  });

  it('retorna 400 si falta order_id', async () => {
    const res = makeRes();
    await handler({ body: { formData: {} } }, res);
    expect(res._status).toBe(400);
    expect(res._body.error.message).toMatch(/order_id/);
  });

  it('retorna 400 si no hay accessToken', async () => {
    mockConfig.get.mockImplementation(() => { throw new Error('not found'); });
    const res = makeRes();
    await handler({ body: { formData: {}, order_id: 'uuid-123' } }, res);
    expect(res._status).toBe(400);
  });

  it('retorna 404 si la orden no existe', async () => {
    db.client.query.mockResolvedValue({ rows: [] });
    const res = makeRes();
    await handler({ body: { formData: {}, order_id: 'uuid-not-found' } }, res);
    expect(res._status).toBe(404);
  });

  describe('pago con tarjeta de crédito/débito', () => {
    beforeEach(() => {
      db.client.query
        .mockResolvedValueOnce({ rows: [MOCK_ORDER] })
        .mockResolvedValueOnce({ rows: [] });
    });

    it('envía net_amount y taxes IVA=0 para Colombia', async () => {
      const formData = { token: 'card-token', payment_method_id: 'master', installments: 1, payer: { email: 'buyer@test.com' } };
      const res = makeRes();
      await handler({ body: { formData, order_id: 'uuid-123', brick_amount: 80000 }, ip: '127.0.0.1' }, res);

      const payBody = mp.paymentCreate.mock.calls[0][0].body;
      expect(payBody.net_amount).toBe(80000);
      expect(payBody.taxes).toEqual([{ type: 'IVA', value: 0 }]);
      expect(payBody.token).toBe('card-token');
    });

    it('usa brick_amount cuando se provee', async () => {
      const res = makeRes();
      await handler({ body: { formData: { token: 't', payment_method_id: 'visa', installments: 1, payer: { email: 'b@t.com' } }, order_id: 'uuid-123', brick_amount: 75000 }, ip: '127.0.0.1' }, res);
      expect(mp.paymentCreate.mock.calls[0][0].body.transaction_amount).toBe(75000);
    });

    it('usa grand_total cuando no hay brick_amount', async () => {
      db.client.query.mockReset()
        .mockResolvedValueOnce({ rows: [MOCK_ORDER] })
        .mockResolvedValueOnce({ rows: [] });
      const res = makeRes();
      await handler({ body: { formData: { token: 't', payment_method_id: 'visa', installments: 1, payer: { email: 'b@t.com' } }, order_id: 'uuid-123' }, ip: '127.0.0.1' }, res);
      expect(mp.paymentCreate.mock.calls[0][0].body.transaction_amount).toBe(80000);
    });

    it('mapea approved → mp_paid', async () => {
      mp.paymentCreate.mockResolvedValue({ id: 'pay-1', status: 'approved' });
      const res = makeRes();
      await handler({ body: { formData: { token: 't', payment_method_id: 'master', installments: 1, payer: { email: 'b@t.com' } }, order_id: 'uuid-123' }, ip: '127.0.0.1' }, res);
      expect(res._body.data.order_status).toBe('mp_paid');
      const updateCall = db.client.query.mock.calls.find(c => typeof c[0] === 'string' && c[0].includes('UPDATE'));
      expect(updateCall[1][0]).toBe('mp_paid');
      expect(updateCall[1][1]).toBe('uuid-123');
    });

    it('mapea rejected → mp_rejected', async () => {
      db.client.query.mockReset()
        .mockResolvedValueOnce({ rows: [MOCK_ORDER] })
        .mockResolvedValueOnce({ rows: [] });
      mp.paymentCreate.mockResolvedValue({ id: 'pay-2', status: 'rejected' });
      const res = makeRes();
      await handler({ body: { formData: { token: 't', payment_method_id: 'master', installments: 1, payer: { email: 'b@t.com' } }, order_id: 'uuid-123' }, ip: '127.0.0.1' }, res);
      expect(res._body.data.order_status).toBe('mp_rejected');
    });

    it('mapea pending → mp_pending', async () => {
      db.client.query.mockReset()
        .mockResolvedValueOnce({ rows: [MOCK_ORDER] })
        .mockResolvedValueOnce({ rows: [] });
      mp.paymentCreate.mockResolvedValue({ id: 'pay-3', status: 'pending' });
      const res = makeRes();
      await handler({ body: { formData: { token: 't', payment_method_id: 'master', installments: 1, payer: { email: 'b@t.com' } }, order_id: 'uuid-123' }, ip: '127.0.0.1' }, res);
      expect(res._body.data.order_status).toBe('mp_pending');
    });

    it('mapea in_process → mp_pending', async () => {
      db.client.query.mockReset()
        .mockResolvedValueOnce({ rows: [MOCK_ORDER] })
        .mockResolvedValueOnce({ rows: [] });
      mp.paymentCreate.mockResolvedValue({ id: 'pay-4', status: 'in_process' });
      const res = makeRes();
      await handler({ body: { formData: { token: 't', payment_method_id: 'master', installments: 1, payer: { email: 'b@t.com' } }, order_id: 'uuid-123' }, ip: '127.0.0.1' }, res);
      expect(res._body.data.order_status).toBe('mp_pending');
    });

    it('actualiza la orden usando uuid (no order_id)', async () => {
      const res = makeRes();
      await handler({ body: { formData: { token: 't', payment_method_id: 'visa', installments: 1, payer: { email: 'b@t.com' } }, order_id: 'uuid-123' }, ip: '127.0.0.1' }, res);
      const updateCall = db.client.query.mock.calls.find(c => typeof c[0] === 'string' && c[0].includes('UPDATE'));
      expect(updateCall[0]).toContain('WHERE uuid');
      expect(updateCall[1][1]).toBe('uuid-123');
    });

    it('retorna payment_id en la respuesta', async () => {
      const res = makeRes();
      await handler({ body: { formData: { token: 't', payment_method_id: 'master', installments: 1, payer: { email: 'b@t.com' } }, order_id: 'uuid-123' }, ip: '127.0.0.1' }, res);
      expect(res._body.data.payment_id).toBe('pay-999');
    });
  });

  describe('pago PSE (bank_transfer)', () => {
    beforeEach(() => {
      db.client.query
        .mockResolvedValueOnce({ rows: [MOCK_ORDER] })
        .mockResolvedValueOnce({ rows: [] });
      mp.paymentCreate.mockResolvedValue({ id: 'pse-1', status: 'pending', transaction_details: { external_resource_url: 'https://pse.bank.com/pay' } });
      mockConfig.get.mockImplementation((key) => {
        if (key === 'mercadopago.accessToken') return 'APP_USR-fake-prod-token';
        if (key === 'mercadopago.appUrl') return 'http://localhost:3000';
        throw new Error('not found');
      });
    });

    it('usa payment_method_id pse y sin token', async () => {
      const formData = { payment_method_id: 'pse', payer: { email: 'b@t.com', entity_type: 'individual', identification: { type: 'CC', number: '123' } }, transaction_details: { financial_institution: '1009' } };
      const res = makeRes();
      await handler({ body: { formData, order_id: 'uuid-123', selectedPaymentMethod: 'bank_transfer' }, ip: '127.0.0.1' }, res);

      const payBody = mp.paymentCreate.mock.calls[0][0].body;
      expect(payBody.payment_method_id).toBe('pse');
      expect(payBody.token).toBeUndefined();
      expect(payBody.transaction_details?.financial_institution).toBe('1009');
    });

    it('retorna redirect_url para PSE', async () => {
      const formData = { payment_method_id: 'pse', payer: { email: 'b@t.com', entity_type: 'individual' }, transaction_details: { financial_institution: '1009' } };
      const res = makeRes();
      await handler({ body: { formData, order_id: 'uuid-123', selectedPaymentMethod: 'bank_transfer' }, ip: '127.0.0.1' }, res);
      expect(res._body.data.redirect_url).toBe('https://pse.bank.com/pay');
    });
  });

  describe('pago Efecty (ticket)', () => {
    beforeEach(() => {
      db.client.query
        .mockResolvedValueOnce({ rows: [MOCK_ORDER] })
        .mockResolvedValueOnce({ rows: [] });
      mp.paymentCreate.mockResolvedValue({ id: 'eft-1', status: 'pending' });
    });

    it('envía IVA=0 y sin token para Efecty', async () => {
      const formData = { payment_method_id: 'efecty', payment_type_id: 'ticket', payer: { email: 'b@t.com' } };
      const res = makeRes();
      await handler({ body: { formData, order_id: 'uuid-123', selectedPaymentMethod: 'ticket' }, ip: '127.0.0.1' }, res);

      const payBody = mp.paymentCreate.mock.calls[0][0].body;
      expect(payBody.payment_method_id).toBe('efecty');
      expect(payBody.token).toBeUndefined();
      expect(payBody.taxes).toEqual([{ type: 'IVA', value: 0 }]);
    });
  });

  describe('manejo de errores del SDK', () => {
    it('retorna 500 con detalles cuando el SDK falla', async () => {
      db.client.query.mockResolvedValueOnce({ rows: [MOCK_ORDER] });
      mp.paymentCreate.mockRejectedValue(Object.assign(new Error('bad_request'), { cause: [{ code: 123 }], status: 400 }));
      const res = makeRes();
      await handler({ body: { formData: { token: 't', payment_method_id: 'master', installments: 1, payer: { email: 'b@t.com' } }, order_id: 'uuid-123' }, ip: '127.0.0.1' }, res);
      expect(res._status).toBe(500);
      expect(res._body.error.message).toBe('bad_request');
    });
  });
});
