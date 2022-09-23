const jwt = require('jsonwebtoken')
const env = require('../.env')

// recebe e exporta a assinatura do middleware, requisição resposta e next 
module.exports = (req, res, next) =>{
    // CORS preflight request
    if(req.method === 'OPTIONS'){ // para não bloquear requisições do metodo OPTION, vai receber e dar next 
        next()
    } else { // caso não seja OPTION vai esperar receber o token de diversos lugares, body, query ou header
        const token = req.body.token || req.query.token || req.headers['authorization']
        if (!token){ // se o token não estiver presente vai retornar a mensagem
            return res.status(403).send({errors: ['No token provided.']})
        }

        // se o token for enviado vai verificar ele

        jwt.verify(token, env.authSecret, function (err, decoded){
            if(err){
                return res.status(403).send({
                    errors:['Failed to authenticate token.']
                }) 
                
            } else {
                req.decoded = decoded
                next()
            }
        })
    }
}