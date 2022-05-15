import express from 'express';
import path from 'path';
import os from 'os';
import cluster from 'cluster';
import log4js from 'log4js';
import hbs from 'express-handlebars';
import productos from './productos.js';
import carrito from './carrito.js';
import mensajes from './mensajes.js';
import usuarios from './usuarios.js';
import dotenv from 'dotenv';
dotenv.config()

const app = express();

log4js.configure({
    appenders:{
        logConsola: {type: 'console'},
        logError: {type: 'file', filename: 'error.log'},
        logWarn: {type: 'file', filename: 'warn.log'},
        loggerWarn: {type: 'logLevelFilter', appender: 'logWarn', level: 'warn'},
        loggerError: {type: 'logLevelFilter', appender: 'logError', level: 'error'}
        
    },
    categories:{
        default:{
            appenders: ["loggerError", "logConsola"], level: "all"
        },
        custom:{
            appenders: ["loggerWarn", "logConsola"], level: "all"
        }
    }
});

export const logger = log4js.getLogger('custom');
export const loggerError = log4js.getLogger();

const MODO_CLUSTER = process.env.MODO === 'cluster';

if(MODO_CLUSTER && cluster.isMaster) {
    const numCPUs = os.cpus().length
    
    logger.info(`PID MASTER ${process.pid}`)

    for(let i=0; i<numCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', worker => {
        logger.info('Worker', worker.process.pid, 'died', new Date().toLocaleString())
        cluster.fork()
    })

}else{

    //app.use(express.static('public'));

    app.set('views', path.join(path.dirname(''), 'src/views'));

    app.engine('.hbs', hbs.engine({
        defaultLayout: 'main',
        layoutsDir: path.join(app.get('views'), 'layouts'),
        partialsDir: path.join(app.get('views'), 'partials'),
        extname: '.hbs',
    }))

    app.set('view engine', '.hbs');
    

    app.use('/api/u', usuarios)
    app.use('/api/carrito', carrito);
    app.use('/api/productos', productos);
    app.use('/api/mensajes', mensajes);

    app.get('/', (req,res)=>{
        logger.info(`ruta ${req.url} metodo ${req.method} implementada`)
        res.redirect('/api/u/login')
    });

    app.get('*', (req,res) => {
        res.send({error: '-2', descripcion: `ruta ${req.url} metodo ${req.method} no implementada`});
        logger.warn({error: '-2', descripcion: `ruta ${req.url} metodo ${req.method} no implementada`})
    });
    app.post('*', (req,res) => {
        res.send({error: '-2', descripcion: `ruta ${req.url} metodo ${req.method} no implementada`});
        logger.warn({error: '-2', descripcion: `ruta ${req.url} metodo ${req.method} no implementada`})
    });
    app.delete('*', (req,res) => {
        res.send({error: '-2', descripcion: `ruta ${req.url} metodo ${req.method} no implementada`});
        logger.warn({error: '-2', descripcion: `ruta ${req.url} metodo ${req.method} no implementada`})
    });
    app.put('*', (req,res) => {
        res.send({error: '-2', descripcion: `ruta ${req.url} metodo ${req.method} no implementada`});
        logger.warn({error: '-2', descripcion: `ruta ${req.url} metodo ${req.method} no implementada`})
    });

    const PORT = process.env.PORT || 8080;

    const server = app.listen(PORT, () => {
    logger.info(`Servidor escuchando en el puerto ${server.address().port}`);
    });

    server.on("error", error => loggerError.error(error, `Error en servidor ${error}`) ); 
}