import ContenedorMongoDB from "../contenedores/contenedorMongoDB.js";

class UsuariosDaoMongoDB extends ContenedorMongoDB{
    constructor(){
        super('usuarios',{
            timestamp: {type: Date, require: true, default: Date.now()},
            email: {type: String, require: true},
            password: {type: String, require: true},
            nombre: {type: String, require: true},
            apellido: {type: String, require: true},
            edad: {type: Number, require: true},
            avatar: {type: String, require: true},
            direccion: {type: String, require: true},
            telefono: {type: Number, require: true}
        })
    }
}

export default UsuariosDaoMongoDB