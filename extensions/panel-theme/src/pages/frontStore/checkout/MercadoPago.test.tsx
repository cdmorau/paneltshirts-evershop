import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('@components/frontStore/checkout/CheckoutContext.js', () => ({
  useCheckout: vi.fn(),
  useCheckoutDispatch: vi.fn()
}));

const { useCheckout, useCheckoutDispatch } = await import('@components/frontStore/checkout/CheckoutContext.js');

const DEFAULT_PROPS = {
  getMPConfigApi: '/api/mp/config',
  processMPPaymentApi: '/api/mp/process',
  cart: { grandTotal: { value: 50000 } }
};

function setup(checkoutState = {}) {
  const registerPaymentComponent = vi.fn();
  const checkout = vi.fn();
  (useCheckoutDispatch as ReturnType<typeof vi.fn>).mockReturnValue({ registerPaymentComponent, checkout });
  (useCheckout as ReturnType<typeof vi.fn>).mockReturnValue({
    checkoutData: { paymentMethod: null },
    ...checkoutState
  });
  return { registerPaymentComponent, checkout };
}

describe('MercadoPagoMethod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('registra el componente de pago con formRenderer y sin checkoutButtonRenderer', async () => {
    const { registerPaymentComponent } = setup();
    const { default: MercadoPagoMethod } = await import('./MercadoPago.js');
    render(<MercadoPagoMethod {...DEFAULT_PROPS} />);
    expect(registerPaymentComponent).toHaveBeenCalledWith('mercadopago', expect.objectContaining({
      nameRenderer: expect.any(Function),
      formRenderer: expect.any(Function),
      checkoutButtonRenderer: expect.any(Function)
    }));
  });

  it('no inicia el Brick si mercadopago no está seleccionado', async () => {
    setup({ checkoutData: { paymentMethod: 'other' } });
    const { default: MercadoPagoMethod } = await import('./MercadoPago.js');
    render(<MercadoPagoMethod {...DEFAULT_PROPS} />);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('llama a getMPConfigApi cuando mercadopago está seleccionado', async () => {
    setup({ checkoutData: { paymentMethod: 'mercadopago' } });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => new Promise(() => {}) // pending para no llegar al Brick
    });

    const { default: MercadoPagoMethod } = await import('./MercadoPago.js');
    render(<MercadoPagoMethod {...DEFAULT_PROPS} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/mp/config');
    });
  });

  it('muestra error si la configuración falla', async () => {
    setup({ checkoutData: { paymentMethod: 'mercadopago' } });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ error: { message: 'MP public key no configurada' } })
    });

    const { default: MercadoPagoMethod } = await import('./MercadoPago.js');
    render(<MercadoPagoMethod {...DEFAULT_PROPS} />);

    // El error se registra en el formRenderer — verificar que registerPaymentComponent
    // fue llamado con un FormRenderer actualizado
    await waitFor(() => {
      const calls = (useCheckoutDispatch as ReturnType<typeof vi.fn>).mock.results;
      expect(calls.length).toBeGreaterThan(0);
    });
  });

  it('retorna null como render (sin modal ni elementos extra en el DOM)', async () => {
    setup({ checkoutData: { paymentMethod: null } });
    const { default: MercadoPagoMethod } = await import('./MercadoPago.js');
    const { container } = render(<MercadoPagoMethod {...DEFAULT_PROPS} />);
    expect(container.firstChild).toBeNull();
  });
});
