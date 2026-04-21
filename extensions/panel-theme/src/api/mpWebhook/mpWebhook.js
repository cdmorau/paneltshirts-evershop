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
  // Acknowledge immediately — MP retries if no 200 response
  response.status(200).json({ received: true });

  const { type, data } = request.body;
  if (type !== 'payment') return;

  let accessToken;
  try { accessToken = config.get('mercadopago.accessToken'); } catch { return; }
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
      `UPDATE "order" SET payment_status = $1, updated_at = NOW() WHERE uuid = $2`,
      [newStatus, orderId]
    );

    console.log(`[MP Webhook] Order ${orderId}: ${payment.status} → ${newStatus}`);
  } catch (e) {
    console.error('[MP Webhook] Error:', e.message);
  }
};
