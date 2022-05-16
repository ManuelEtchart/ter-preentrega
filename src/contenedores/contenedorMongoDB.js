import config from "../utils/config.js";
import mongoose from "mongoose";
import { productoMonDB } from "../../productos.js";
import { loggerError } from "../../server.js";

const URL = config.mongoDB.url;

await mongoose.connect(URL);


class ContenedorMongoDB {
    constructor(nombreColeccion, esquema){
        this.coleccion = mongoose.model(nombreColeccion, esquema)
    }

    async save(obj){
        try {
            await mongoose.connect(URL)
            await this.coleccion.insertMany([obj])
            return {'Objeto agregado': obj}
        } catch(error){
            loggerError.error(`${error} - Hubo un error en la base de datos`);
        }finally{
            mongoose.disconnect().catch((error)=>{
                loggerError.error(`${error} - Hubo un error en la base de datos`);
            });
        }
    };

    async getById(id){
        try {
            await mongoose.connect(URL)
            if(!mongoose.isObjectIdOrHexString(id)) {
                return {error: `Objeto ${id} no encontrado`}
            }
            const docs = await this.coleccion.find({"_id": id}).lean()
            if(docs.length === 0){
                return {error: `Objeto ${id} no encontrado`}
            }else{
                return docs
            }
        } catch(error){
            loggerError.error(`${error} - Hubo un error en la base de datos`);
        }finally{
            mongoose.disconnect().catch((error)=>{
                loggerError.error(`${error} - Hubo un error en la base de datos`);
            });
        }
    }

    async getByEmail(email){
        try {
            await mongoose.connect(URL)
            const docs = await this.coleccion.find({"email": email}).lean()
            if(docs.length === 0){
                return null
            }else{
                return docs
            }
        } catch(error){
            loggerError.error(`${error} - Hubo un error en la base de datos`);
        }finally{
            mongoose.disconnect().catch((error)=>{
                loggerError.error(`${error} - Hubo un error en la base de datos`);
            });
        }
    }

    async getAll(){
        try {
            await mongoose.connect(URL)
            const docs = await this.coleccion.find({}).lean()
            if(docs.length === 0){
                return {'msg': 'No hay objetos agregados'}
            }else{
                return docs
            }
        } catch (error) {
            loggerError.error(`${error} - Hubo un error en la base de datos`);
        }
        finally{
            mongoose.disconnect().catch((error)=>{
                loggerError.error(`${error} - Hubo un error en la base de datos`);
            });
        }
    };

    async updateById(id, cambios){
        try {
            await mongoose.connect(URL)
            if(!mongoose.isObjectIdOrHexString(id)) {
                return {error: `Objeto ${id} no encontrado`}
            }
            await this.coleccion.updateOne({_id : id},{$set: cambios})
            return {msg: `Objeto ${id} modificado`}
        } catch (error) {
            loggerError.error(`${error} - Hubo un error en la base de datos`);
        }
        finally{
            mongoose.disconnect().catch((error)=>{
                loggerError.error(`${error} - Hubo un error en la base de datos`);
            });
        }
    };

    async deleteById(id){
        try {
            await mongoose.connect(URL)
            if(!mongoose.isObjectIdOrHexString(id)) {
                return {error: `Objeto ${id} no encontrado`}
            }
            await this.coleccion.deleteOne({_id : id})
            return {msg: `Objeto ${id} eliminado`}
        } catch (error) {
            loggerError.error(`${error} - Hubo un error en la base de datos`);
        }
        finally{
            mongoose.disconnect().catch((error)=>{
                loggerError.error(`${error} - Hubo un error en la base de datos`);
            });
        }
    };

    async deleteAll(){
        try {
            await mongoose.connect(URL)
            await this.coleccion.deleteMany({})
            return {'msg': 'Todos los objetos han sido eliminados'}
        } catch (error) {
            loggerError.error(`${error} - Hubo un error en la base de datos`);
        }
        finally{
            mongoose.disconnect().catch((error)=>{
                loggerError.error(`${error} - Hubo un error en la base de datos`);
            });
        }
    };

    async agregarProductoEnCarrito(id, id_prod){
        try {
            await mongoose.connect(URL);

            if(!mongoose.isObjectIdOrHexString(id)) {
                return {error: `Objeto ${id} no encontrado`}
            };
            if(!mongoose.isObjectIdOrHexString(id_prod)) {
                return {error: `Objeto ${id_prod} no encontrado`}
            };

            const productoBuscadoArray = await productoMonDB.getById(id_prod)
            const productoBuscadoObj = productoBuscadoArray[0]

            if(productoBuscadoObj.nombre === undefined){
                return {error: `Producto ${id_prod} no encontrado`}
            }

            await mongoose.connect(URL)
            await this.coleccion.updateOne({_id: id},{$push:{productos: productoBuscadoObj}})
            
            return  {msg: `Producto ${id_prod} agregado`}
        } catch (error) {
            loggerError.error(`${error} - Hubo un error en la base de datos`);
        }
        finally{
            mongoose.disconnect().catch((error)=>{
                loggerError.error(`${error} - Hubo un error en la base de datos`);
            });
        }
        
    }

    async borrarProductoEnCarrito(id, id_prod){
        try {
            await mongoose.connect(URL);

            if(!mongoose.isObjectIdOrHexString(id)) {
                return {error: `Objeto ${id} no encontrado`}
            };
            if(!mongoose.isObjectIdOrHexString(id_prod)) {
                return {error: `Objeto ${id_prod} no encontrado`}
            };
            
            const productoBuscadoArray = await productoMonDB.getById(id_prod);
            const productoBuscadoObj = productoBuscadoArray[0];

            await mongoose.connect(URL)
            await this.coleccion.updateOne({_id: id},{$pull:{productos: productoBuscadoObj}})
            
            return {msg: `Producto ${id_prod} eliminado`}
        } catch (error) {
            loggerError.error(`${error} - Hubo un error en la base de datos`);
        }finally{
            mongoose.disconnect().catch((error)=>{
                loggerError.error(`${error} - Hubo un error en la base de datos`);
            });
        }
    }
}

export default ContenedorMongoDB;