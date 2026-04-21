import { MercadoPagoConfig, Payment } from 'mercadopago';
import config from 'config';
import pkg from 'pg';
const { Client } = pkg;

function getDbConfig() {
  try {
    const connectionString = config.get('mercadopago.databaseUrl');
    if (connectionString) return { connectionString, ssl: { rejectUnauthorized: false } };
  } catch { /* no DATABASE_URL */ }
  return {
    host: config.has('db.host') ? config.get('db.host') : 'localhost',
    port: parseInt(config.has('db.port') ? config.get('db.port') : '5432'),
    database: config.has('db.name') ? config.get('db.name') : undefined,
    user: config.has('db.user') ? config.get('db.user') : undefined,
    password: config.has('db.password') ? config.get('db.password') : undefined,
    ssl: false
  };
}

async function queryDB(sql, params = []) {
  const client = new Client(getDbConfig());
  await client.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    await client.end();
  }
}

export default async (request, response) => {
  let accessToken;
  try { accessToken = config.get('mercadopago.accessToken'); } catch {
    return response.status(400).json({ error: { message: 'MercadoPago no configurado' } });
  }

  const { formData, order_id, brick_amount, selectedPaymentMethod } = request.body;
  if (!formData || !order_id) {
    return response.status(400).json({ error: { message: 'formData y order_id son requeridos' } });
  }

  try {
    const orders = await queryDB(`SELECT * FROM "order" WHERE uuid = $1`, [order_id]);
    const order = orders[0];
    if (!order) return response.status(404).json({ error: { message: 'Orden no encontrada' } });

    const mpClient = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(mpClient);

    const transactionAmount = brick_amount ? Number(brick_amount) : Number(order.grand_total);
    const payerEmail = formData.payer?.email || formData.email;
    const appUrl = config.has('mercadopago.appUrl') ? config.get('mercadopago.appUrl') : 'https://paneltshirts.co';

    let paymentBody;

    // PSE (Pagos Seguros en Línea) — bank transfer with redirect
    if (selectedPaymentMethod === 'bank_transfer' || formData.payment_method_id === 'pse') {
      paymentBody = {
        transaction_amount: transactionAmount,
        description: 'PANEL! T-Shirts',
        payment_method_id: 'pse',
        external_reference: order_id,
        callback_url: `${appUrl}/checkout/success?order_id=${order_id}`,
        notification_url: `${appUrl}/api/mp/webhook`,
        payer: {
          email: payerEmail,
          entity_type: formData.payer?.entity_type || 'individual',
          first_name: formData.payer?.first_name || '',
          last_name: formData.payer?.last_name || '',
          identification: formData.payer?.identification
        },
        transaction_details: {
          financial_institution: formData.transaction_details?.financial_institution
        },
        additional_info: { ip_address: request.ip || '127.0.0.1' }
      };
    // Efecty / ticket (cash payments)
    } else if (selectedPaymentMethod === 'ticket' || formData.payment_type_id === 'ticket') {
      paymentBody = {
        transaction_amount: transactionAmount,
        net_amount: transactionAmount,
        taxes: [{ type: 'IVA', value: 0 }],
        description: 'PANEL! T-Shirts',
        payment_method_id: formData.payment_method_id || 'efecty',
        external_reference: order_id,
        payer: {
          email: payerEmail,
          identification: formData.payer?.identification
        }
      };
    // Credit / debit card
    } else {
      // Colombia MCO: net_amount + taxes required. T-shirts < 35 UVT → IVA = 0%.
      paymentBody = {
        transaction_amount: transactionAmount,
        net_amount: transactionAmount,
        taxes: [{ type: 'IVA', value: 0 }],
        token: formData.token,
        description: 'PANEL! T-Shirts',
        payment_method_id: formData.payment_method_id,
        installments: Number(formData.installments) || 1,
        external_reference: order_id,
        payer: {
          email: payerEmail,
          identification: formData.payer?.identification
        },
        ...(formData.issuer_id && { issuer_id: Number(formData.issuer_id) })
      };
    }

    console.log('[MP Process] Payment type:', selectedPaymentMethod || formData.payment_method_id, '| amount:', transactionAmount);

    const payment = await paymentClient.create({
      body: paymentBody,
      requestOptions: {
        idempotencyKey: `panel-${order_id}-${formData.token?.slice(-6) ?? selectedPaymentMethod ?? Date.now()}`
      }
    });

    const statusMap = {
      approved: 'mp_paid',
      pending: 'mp_pending',
      in_process: 'mp_pending',
      rejected: 'mp_rejected',
      cancelled: 'mp_cancelled'
    };
    const newStatus = statusMap[payment.status] || 'mp_pending';

    await queryDB(
      `UPDATE "order" SET payment_status = $1, updated_at = NOW() WHERE uuid = $2`,
      [newStatus, order_id]
    );

    console.log(`[MP Process] Order ${order_id}: status=${payment.status} → ${newStatus}`);

    const responseData = {
      status: payment.status,
      payment_id: payment.id,
      order_status: newStatus
    };

    // PSE returns external_resource_url for redirect
    if (payment.transaction_details?.external_resource_url) {
      responseData.redirect_url = payment.transaction_details.external_resource_url;
    }

    return response.json({ data: responseData });
  } catch (e) {
    const cause = e.cause ?? e.error ?? null;
    console.error('[MP Process] Error:', e.message, JSON.stringify(cause));
    return response.status(500).json({ error: { message: e.message, cause, status: e.status ?? null } });
  }
};
