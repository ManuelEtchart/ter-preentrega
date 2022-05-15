import express from 'express';
//import decision from './src/DAOs/decision.js';
import { mensajesMonDB } from './mensajes.js';
import { productoMonDB } from './productos.js';
import { logger,loggerError } from './server.js';
import CarritoDaoMongoDB from './src/DAOs/carritoDaoMongoDB.js';
import { ADMIN_GMAIL, emailUser, isAuth, transporter, usuariosMonDB } from './usuarios.js';


const carrito = express.Router();

//const query = await decision()
//const queryCarrito = query.queryCarrito


const carritoMonDB = new CarritoDaoMongoDB()

carrito.use(express.json());
carrito.use(express.urlencoded({extended: true}))

carrito.get('', async (req,res)=>{
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`)
    try {
        res.render('carritos',{carritos: await carritoMonDB.getAll(), mensajes: await mensajesMonDB.getAll(), datosUsuario: await usuariosMonDB.getByEmail(emailUser)})
    } catch (error) {
        loggerError.error(`${error} - Hubo un error en ruta ${req.url} metodo ${req.method} implementada`)
    }
})

carrito.post('', async (req,res) => {
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`)
    try {
        await carritoMonDB.save(
            {
                timestamp: Date.now(),
                productos: []
            }
        );
        res.redirect('/api/carrito')
    } catch (error) {
        loggerError.error(`${error} - Hubo un error en ruta ${req.url} metodo ${req.method} implementada`)
    }
})

carrito.delete('/:id', async (req,res) => {
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`)
    try {
        res.json(await carritoMonDB.deleteById(req.params.id))
    } catch (error) {
        loggerError.error(`${error} - Hubo un error en ruta ${req.url} metodo ${req.method} implementada`)
    }
})

carrito.get('/:id?/productos', async (req,res) => {
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`)
    try {
        if(req.params.id === undefined){
            res.render('carritos',{carritos: await carritoMonDB.getAll(), mensajes: await mensajesMonDB.getAll()})
        }else{
            res.render('carrito', {carritos: await carritoMonDB.getById(req.params.id), mensajes: await mensajesMonDB.getAll(), productos: await productoMonDB.getAll()})
        } 
    } catch (error) {
        loggerError.error(`${error} - Hubo un error en ruta ${req.url} metodo ${req.method} implementada`)
    }
});

carrito.post('/:id/productos/:id_prod', async (req,res) => {
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`)
    try {
        await carritoMonDB.agregarProductoEnCarrito(req.params.id, req.params.id_prod)
        res.redirect(`/api/carrito/${req.params.id}/productos`)
    } catch (error) {
        loggerError.error(`${error} - Hubo un error en ruta ${req.url} metodo ${req.method} implementada`)
    }
});

carrito.get('/:id/pedir', async (req,res)=>{
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`)
    try {
        const carrito = await carritoMonDB.getById(req.params.id);
        const usuario = await usuariosMonDB.getByEmail(emailUser)
        console.log(carrito[0].productos)
        const emailContent = {
            from: 'Ecommerce <noreply@example.com>',
            to: `"ADMIN" <${ADMIN_GMAIL}>`,
            subject: `Nuevo pedido de ${usuario[0].nombre} - ${emailUser}`,
            text: `
            ID Carrito: ${req.params.id} 
            Productos Agregados:
            ${JSON.stringify(carrito[0].productos,null,2)}
            `
        }

        try {
            const info = await transporter.sendMail(emailContent);
            logger.info(info);
        } catch (error) {
            loggerError.error(`${error} - Hubo un error en el envío del e-mail de registro`);
        }

        res.render('pedido', {carritos: await carritoMonDB.getById(req.params.id)})
    } catch (error) {
        loggerError.error(`${error} - Hubo un error en ruta ${req.url} metodo ${req.method} implementada`)
    }
})

carrito.delete('/:id/productos/:id_prod', async (req,res) => {
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`)
    try {
        res.json( await carritoMemoria.borrarProductoEnCarrito(req.params.id,req.params.id_prod))
    } catch (error) {
        loggerError.error(`${error} - Hubo un error en ruta ${req.url} metodo ${req.method} implementada`)
    }
});


export default carrito;