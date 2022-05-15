import ContenedorMongoDB from "../contenedores/contenedorMongoDB.js";

class CarritoDaoMongoDB extends ContenedorMongoDB{
    constructor(){
        super('carritos',{
            timestamp: {type: Date, require: true, default: Date.now()},
            productos: {type: Array, require: true}
        })
    }
}

export default CarritoDaoMongoDB;