import express  from "express";
import crypto from 'crypto'
import path from 'path';
import multer from "multer";
import UsuariosDaoMongoDB from "./src/DAOs/usuariosDaoMongoDB.js";
import { loggerError, logger } from './server.js';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from "passport";
import { Strategy } from "passport-local";
import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


const usuarios = express.Router();

export const usuariosMonDB = new UsuariosDaoMongoDB();

const TEST_GMAIL = process.env.TESTGMAIL;
const PASS_GMAIL = process.env.PASSGMAIL;
export const ADMIN_GMAIL = process.env.ADMINGMAIL;

export let emailUser = ''

export const transporter = createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: TEST_GMAIL,
        pass: PASS_GMAIL 
    }
});

const LocalStrategy = Strategy

passport.use(new LocalStrategy(
    async (username, password, done) =>{
        try {
            const usuario = await usuariosMonDB.getByEmail(username);

            emailUser = username;

            if (!usuario) {
                logger.info('Usuario no encontrado')
                return done(null, false);
            }

            const pass = crypto.createHash('sha256').update(password).digest('base64');

            if(!(usuario[0].password == pass)){
                logger.info('Contraseña invalida')
                return done(null, false);
            }

            return done(null, usuario[0])
        } catch (error) {
            loggerError.error(`${error} - Hubo un error`)
        }
    }
))

passport.serializeUser((usuario, done)=>{
    done(null, usuario.email);
})

passport.deserializeUser(async (email, done)=>{
    try {
        const usuario = await usuariosMonDB.getByEmail(email)
        done(null, usuario[0]);
    } catch (error) {
        loggerError.error(`${error} - Hubo un error`)
    }
});

usuarios.use(cookieParser())
usuarios.use(session({
secret: '123456789!#$%&/()',
resave: false,
saveUninitialized: false,
cookie: {
    secure: 'auto',
    maxAge: 600000
}
}));

usuarios.use(passport.initialize());
usuarios.use(passport.session());

usuarios.use(express.json());
usuarios.use(express.urlencoded({extended: true}));

usuarios.use(express.static(path.join(process.cwd(), 'fotos')));

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'fotos')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const upload = multer({storage: storage});

export function isAuth(req, res, next) {
    if(req.isAuthenticated()){
        next();
    } else {
        res.redirect('/api/u/loginerror');
    }
};

usuarios.get('/login', (req, res) =>{
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`);
    emailUser = '';
    res.render('login', {mensajes: false});
});

usuarios.post('/login', passport.authenticate('local',
    {
        successRedirect: '/api/productos',
        failureRedirect: '/api/u/loginerror'
    }
));

usuarios.get('/loginerror',(req, res)=>{
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`);
    res.render('error-notif', {errorMsg: 'Error en el login'});
});

usuarios.get('/registro', (req, res)=>{
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`);
    res.render('registro', {mensajes: false});
});

usuarios.post('/registro', upload.single('foto'), async (req, res)=>{
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`);
    try {
        const usuario = await usuariosMonDB.getByEmail(req.body.email);
        let pathFile = false;
            
        if(req.file){
            pathFile = `/fotos/${req.file.originalname}`;
        };
        
        if (usuario) {
            res.redirect('/api/u/registroerror');
        } else {
            const hash = crypto.createHash('sha256').update(req.body.password).digest('base64');
            
            await usuariosMonDB.save({
                email: req.body.email,
                nombre: req.body.nombreUsuario,
                apellido: req.body.apellido,
                edad: req.body.edad,
                avatar: pathFile || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
                telefono: req.body.telefono,
                password: hash,
                direccion: req.body.direccion
            });

            emailUser = req.body.email;

            const emailContent = {
                from: 'Ecommerce <noreply@example.com>',
                to: `"ADMIN" <${ADMIN_GMAIL}>`,
                subject: 'Nuevo Ingreso',
                text: `
                Nuevo Registro en App Ecommerce
                E-mail: ${req.body.email},
                Nombre: ${req.body.nombreUsuario},
                Apellido: ${req.body.apellido},
                Edad: ${req.body.edad},
                Avatar: ${pathFile || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'},
                Teléfono: ${req.body.telefono},
                Password: ${hash}, 
                Dirección: ${req.body.direccion}`
            };

            try {
                const info = await transporter.sendMail(emailContent);
                logger.info(info);
            } catch (error) {
                loggerError.error(`${error} - Hubo un error en el envío del e-mail de registro`);
            };           

            res.redirect('/api/u/login');
        }
    } catch (error) {
        loggerError.error(`${error} - Hubo un error en ruta ${req.url} metodo ${req.method} implementada`);
    };
});

usuarios.get('/registroerror',(req, res)=>{
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`);
    res.render('error-notif', {errorMsg: 'Error en el registro'});
});

usuarios.get('/logout', (req, res)=>{
    logger.info(`ruta ${req.url} metodo ${req.method} implementada`);
    req.logOut();
    res.redirect('/');
});


export default usuarios