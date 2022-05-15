import ContenedorMongoDB from "../contenedores/contenedorMongoDB.js";

class ProductosDaoMongoDB extends ContenedorMongoDB{
    constructor(){
        super('productos',{
            timestamp: {type: Date, require: true, default: Date.now()},
            nombre: {type: String, require: true},
            descripcion: {type: String, require: true},
            codigo: {type: String, require: true},
            foto: {type: String, require: true},
            precio: {type: Number, require: true},
            stock: {type: Number, require: true}
        })
    }
}

export default ProductosDaoMongoDB;