import jwt from "jsonwebtoken";
const SECRET = "mi_clave_secreta"; // Mejor usar process.env.JWT_SECRET

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token; //req por defecto tiene cookies si usas cookie-parser (lo agregamos en server.js)
    if (!token) return res.status(401).json({ success: false, message: "No autenticado" }); //si no hay token, no autenticado y la respuesta es 401, status es un metodo para poner el codigo de estado http 


    try {
        const decoded = jwt.verify(token, SECRET); //el metodo verify verifica que el token es valido y no ha expirado, tiene dos parametros, el token y la clave secreta
        req.user = decoded; // almacena info del usuario en req.user
        next(); // pasa al siguiente handler
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token inválido" });
    }
};

// un middleware siempre tiene (creo)next para pasar al siguiente, respuesta y peticion
//unjson web token tiene 3 partes, header, payload y firma
//header.payload.signature
//header tiene el algoritmo y tipo de token
//payload tiene la info del usuario, en este caso username y role
//firma resultado de aplicar un hash con una clave secreta al header y al payload, que sirve para verificar que el token no haya sido alterado.