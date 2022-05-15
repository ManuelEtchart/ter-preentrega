import ContenedorMongoDB from "../contenedores/contenedorMongoDB.js";

class MensajesDaoMongoDB extends ContenedorMongoDB{
    constructor(){
        super('mensajes',{
            timestamp: {type: Date, require: true, default: Date.now()},
            email: {type: String, require: true},
            nombre: {type: String, require: true},
            apellido: {type: String, require: true},
            edad: {type: Number, require: true},
            avatar: {type: String, require: true},
            alias: {type: String, require: true},
            mensaje: {type: String, require: true}
        })
    }
}

export default MensajesDaoMongoDB;

