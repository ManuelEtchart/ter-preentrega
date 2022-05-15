import express from 'express';
import MensajesDaoMongoDB from './src/DAOs/mensajesDaoMongoDB.js';
import { loggerError, logger } from './server.js';

const mensajes = express.Router();

export const mensajesMonDB = new MensajesDaoMongoDB();

mensajes.use(express.json());
mensajes.use(express.urlencoded({extended: true}));

mensajes.post('', async (req,res) =>{
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`);
    try {
        const mensaje = {
            email: req.body.email,
            nombre: req.body.nombreMensaje,
            apellido: req.body.apellido,
            edad: req.body.edad,
            alias: req.body.alias,
            mensaje: req.body.mensaje
        };
        let fechaActual = new Date();
        mensaje.fecha = `[(${fechaActual.getDay()}/${fechaActual.getMonth()}/${fechaActual.getFullYear()} ${fechaActual.getHours()}:${fechaActual.getMinutes()}:${fechaActual.getSeconds()})]`;
        await mensajesMonDB.save(mensaje);
        res.redirect(req.headers.referer)
    } catch (error) {
        loggerError.error(`${error} - Hubo un error en ruta ${req.url} metodo ${req.method} implementada`)
    }
    
});

export default mensajes