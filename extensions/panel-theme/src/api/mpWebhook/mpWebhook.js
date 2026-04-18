import { MercadoPagoConfig, Payment } from 'mercadopago';
import pkg from 'pg';
const { Client } = pkg;

async function queryDB(sql, params = []) {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSLMODE === 'require' ? { rejectUnauthorized: false } : false
  });
  await client.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    await client.end();
  }
}

export default async (request, response) => {
  // Acknowledge immediately — MP retries if no 200 response
  response.status(200).json({ received: true });

  const { type, data } = request.body;
  if (type !== 'payment') return;

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken || !data?.id) return;

  try {
    const mpClient = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(mpClient);
    const payment = await paymentClient.get({ id: String(data.id) });

    const orderId = payment.external_reference || payment.metadata?.order_id;
    if (!orderId) return;

    const orders = await queryDB(`SELECT * FROM "order" WHERE uuid = $1`, [orderId]);
    const order = orders[0];
    if (!order) return;

    const statusMap = {
      approved: 'mp_paid',
      pending: 'mp_pending',
      in_process: 'mp_pending',
      rejected: 'mp_rejected',
      cancelled: 'mp_cancelled'
    };
    const newStatus = statusMap[payment.status] || 'mp_pending';

    await queryDB(
      `UPDATE "order" SET payment_status = $1, updated_at = NOW() WHERE order_id = $2`,
      [newStatus, order.order_id]
    );

    console.log(`[MP Webhook] Order ${orderId}: ${payment.status} → ${newStatus}`);
  } catch (e) {
    console.error('[MP Webhook] Error:', e.message);
  }
};
