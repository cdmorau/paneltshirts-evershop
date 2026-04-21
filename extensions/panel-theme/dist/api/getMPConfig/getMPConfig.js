import config from 'config';
export default ((request, response)=>{
    try {
        const publicKey = config.get('mercadopago.publicKey');
        if (!publicKey) throw new Error('missing');
        return response.json({
            data: {
                public_key: publicKey
            }
        });
    } catch  {
        return response.status(400).json({
            error: {
                message: 'MercadoPago public key no configurada. Agrega mercadopago.publicKey en config/local.json'
            }
        });
    }
});
