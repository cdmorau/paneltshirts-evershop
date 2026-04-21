import { MercadoPagoConfig, Preference } from 'mercadopago';
import config from 'config';
import pkg from 'pg';
const { Client } = pkg;
function getMPAccessToken() {
    try {
        return config.get('mercadopago.accessToken');
    } catch  {
        return null;
    }
}
function getMPPublicKey() {
    try {
        return config.get('mercadopago.publicKey');
    } catch  {
        return null;
    }
}
function getDbConfig() {
    try {
        const connectionString = config.get('mercadopago.databaseUrl');
        if (connectionString) return {
            connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        };
    } catch  {}
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
    } finally{
        await client.end();
    }
}
export default (async (request, response)=>{
    const accessToken = getMPAccessToken();
    if (!accessToken) {
        return response.status(400).json({
            error: {
                message: 'MercadoPago no configurado. Agrega mercadopago.accessToken en config/local.json'
            }
        });
    }
    const { order_id } = request.body;
    if (!order_id) {
        return response.status(400).json({
            error: {
                message: 'order_id es requerido'
            }
        });
    }
    const isSandbox = config.has('mercadopago.sandbox') && config.get('mercadopago.sandbox') === true || accessToken.startsWith('TEST-');
    try {
        const orders = await queryDB(`SELECT * FROM "order" WHERE uuid = $1`, [
            order_id
        ]);
        const order = orders[0];
        if (!order) {
            return response.status(404).json({
                error: {
                    message: 'Orden no encontrada'
                }
            });
        }
        const items = await queryDB(`SELECT * FROM order_item WHERE order_item_order_id = $1`, [
            order.order_id
        ]);
        const mpClient = new MercadoPagoConfig({
            accessToken
        });
        const preferenceClient = new Preference(mpClient);
        let baseUrl = 'http://localhost:3000';
        try {
            baseUrl = config.get('mercadopago.appUrl');
        } catch  {}
        const currency = order.currency || 'COP';
        const mpItems = items.length > 0 ? items.map((item)=>({
                id: String(item.product_sku || item.order_item_id),
                title: item.product_name,
                quantity: Number(item.qty),
                unit_price: Number(item.final_price_incl_tax || item.product_price),
                currency_id: currency
            })) : [
            {
                id: 'panel-order',
                title: 'Orden PANEL! T-Shirts',
                quantity: 1,
                unit_price: Number(order.grand_total),
                currency_id: currency
            }
        ];
        let webhookUrl = `${baseUrl}/api/mp/webhook`;
        try {
            webhookUrl = config.get('mercadopago.webhookUrl');
        } catch  {}
        const preference = await preferenceClient.create({
            body: {
                items: mpItems,
                payer: {
                    email: order.customer_email || 'cliente@paneltshirts.com',
                    name: order.customer_full_name || 'Cliente PANEL!'
                },
                back_urls: {
                    success: `${baseUrl}/checkout/success/${order_id}`,
                    failure: `${baseUrl}/checkout`,
                    pending: `${baseUrl}/checkout/success?order_id=${order_id}`
                },
                auto_return: 'approved',
                external_reference: order_id,
                notification_url: webhookUrl,
                statement_descriptor: 'PANEL! T-Shirts',
                metadata: {
                    order_id
                }
            }
        });
        return response.json({
            data: {
                init_point: preference.init_point,
                sandbox_init_point: preference.sandbox_init_point,
                preference_id: preference.id,
                is_sandbox: isSandbox,
                public_key: getMPPublicKey(),
                amount: Number(order.grand_total)
            }
        });
    } catch (e) {
        console.error('[MP] Error creando preferencia:', e.message);
        return response.status(500).json({
            error: {
                message: e.message
            }
        });
    }
});
