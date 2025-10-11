import jwt from "jsonwebtoken";
const SECRET = "mi_clave_secreta"; // Mejor usar process.env.JWT_SECRET

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token; //req por defecto tiene cookies si usas cookie-parser (lo agregamos en server.js)
    if (!token) {
        // [ERROR CLARO]: Avisa que el token no se pudo leer
        console.warn("VerifyToken: No se encontró token en cookies.");
        return res.status(401).json({ success: false, message: "No autorizado. Sesión inválida." });
    }


    try {
        // [PROBLEMA MÁS PROBABLE]: Si esta verificación falla, es que el SECRET no coincide o el token expiró.
        const decoded = jwt.verify(token, SECRET);

        // El token es válido, adjuntar datos de usuario (sin el hash de la contraseña)
        req.user = {
            username: decoded.username,
            role: decoded.role,
            id: decoded.id
        };
        // Adjuntar el ID de MongoDB para usarlo en controladores como userPrefsController.js
        req.userId = decoded.id;

        next(); // Continuar al controlador
    } catch (err) {
        // El token es inválido, expiró, o el SECRET no coincide.
        console.error("VerifyToken: Fallo en la verificación JWT:", err.message);
        return res.status(401).json({ success: false, message: "Token inválido o expirado." });
    }

};

// un middleware siempre tiene (creo)next para pasar al siguiente, respuesta y peticion
//unjson web token tiene 3 partes, header, payload y firma
//header.payload.signature
//header tiene el algoritmo y tipo de token
//payload tiene la info del usuario, en este caso username y role
//firma resultado de aplicar un hash con una clave secreta al header y al payload, que sirve para verificar que el token no haya sido alterado.