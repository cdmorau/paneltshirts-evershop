import { MercadoPagoConfig, Preference } from 'mercadopago';
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
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return response.status(400).json({
      error: { message: 'MercadoPago no configurado. Agrega MP_ACCESS_TOKEN en .env' }
    });
  }

  const { order_id } = request.body;
  if (!order_id) {
    return response.status(400).json({ error: { message: 'order_id es requerido' } });
  }

  try {
    const orders = await queryDB(`SELECT * FROM "order" WHERE uuid = $1`, [order_id]);
    const order = orders[0];
    if (!order) {
      return response.status(404).json({ error: { message: 'Orden no encontrada' } });
    }

    const items = await queryDB(
      `SELECT * FROM order_item WHERE order_item_order_id = $1`, [order.order_id]
    );

    const mpClient = new MercadoPagoConfig({ accessToken });
    const preferenceClient = new Preference(mpClient);
    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const currency = order.currency || 'COP';

    const mpItems = items.length > 0 ? items.map(item => ({
      id: String(item.product_sku || item.order_item_id),
      title: item.product_name,
      quantity: Number(item.qty),
      unit_price: Number(item.final_price_incl_tax || item.product_price),
      currency_id: currency
    })) : [{
      id: 'panel-order',
      title: 'Orden PANEL! T-Shirts',
      quantity: 1,
      unit_price: Number(order.grand_total),
      currency_id: currency
    }];

    const preference = await preferenceClient.create({
      body: {
        items: mpItems,
        payer: {
          email: order.customer_email || 'cliente@paneltshirts.com',
          name: order.customer_full_name || 'Cliente PANEL!'
        },
        external_reference: order_id,
        back_urls: {
          success: `${baseUrl}/checkout/success?order_id=${order_id}`,
          failure: `${baseUrl}/checkout?mp_error=payment_failed`,
          pending: `${baseUrl}/checkout/success?order_id=${order_id}&status=pending`
        },
        auto_return: 'approved',
        notification_url: process.env.MP_WEBHOOK_URL || `${baseUrl}/api/mp/webhook`,
        statement_descriptor: 'PANEL! T-Shirts',
        metadata: { order_id }
      }
    });

    return response.json({
      data: {
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        preference_id: preference.id
      }
    });
  } catch (e) {
    console.error('[MP] Error creando preferencia:', e.message);
    return response.status(500).json({ error: { message: e.message } });
  }
};
