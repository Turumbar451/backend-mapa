// backend/controllers/userPrefsController.js (MODIFICACIÓN TEMPORAL PARA DIAGNÓSTICO)
import Usuario from "../models/usuario.js";

// 1. GET: Obtener las preferencias del usuario loggeado
export const getPrefs = async (req, res) => {
    try {
        // [MODIFICACIÓN CLAVE]: Ahora, esta ruta debe verificar si hay un usuario ID
        // En producción, el verifyToken lo garantiza. Para la prueba, lo verificamos aquí.
        // req.userId es añadido por el middleware verifyToken (que acabamos de quitar).
        // Si el usuario no está loggeado (o si quitamos el middleware), req.userId será undefined.

        if (!req.userId) {
            // Si el frontend llama a esta ruta sin un token, devolvemos 401 o un array vacío.
            // Devolver un array vacío es más seguro para no romper el frontend.
            return res.status(200).json({ favoritos: [], ocultos: [] });
        }

        const user = await Usuario.findById(req.userId).select('favoritos ocultos');

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.json({
            favoritos: user.favoritos || [],
            ocultos: user.ocultos || [],
        });
    } catch (error) {
        console.error("GET /api/prefs error:", error);
        res.status(500).json({ message: "Error al obtener preferencias" });
    }
};
// backend/controllers/userPrefsController.js

// 2. POST/PUT: Alternar el estado (favorito, oculto) de una ruta
export const togglePref = async (req, res) => {
    // 👈 El backend lee las claves correctas: route_id y type
    const { route_id, type } = req.body;
    const userId = req.userId; // Obtenido del middleware verifyToken

    if (!userId) {
        return res.status(401).json({ message: "No autorizado. Sesión inválida." });
    }

    // 1. Validar la entrada recibida
    const routeIdNum = Number(route_id);
    if (!Number.isFinite(routeIdNum) || (type !== 'favoritos' && type !== 'ocultos')) {
        return res.status(400).json({ message: "Datos de ruta o tipo de preferencia inválidos." });
    }

    try {
        // 2. Obtener el documento actual para verificar el estado
        const user = await Usuario.findById(userId).select('favoritos ocultos');

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado en la base de datos." });
        }

        const arrayToUpdate = user[type] || [];
        const isCurrentlySet = arrayToUpdate.includes(routeIdNum);

        let updateQuery = {};

        // 3. Determinar la operación a realizar (toggle)
        if (isCurrentlySet) {
            // Si ya está: usar $pull para ELIMINAR el ID
            updateQuery = { $pull: { [type]: routeIdNum } };
        } else {
            // Si no está: usar $addToSet para AGREGAR el ID
            updateQuery = { $addToSet: { [type]: routeIdNum } };

            // Lógica para el toggle cruzado (si se marca como favorito, se quita de oculto y viceversa)
            const opposingList = type === 'favoritos' ? 'ocultos' : 'favoritos';
            // Usa $pull para asegurar que no esté en la lista opuesta
            updateQuery.$pull = { [opposingList]: routeIdNum };
        }

        // 4. Actualizar en la base de datos
        const updatedUser = await Usuario.findByIdAndUpdate(
            userId,
            updateQuery,
            { new: true, select: 'favoritos ocultos' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "Usuario no encontrado después de la actualización." });
        }

        // 5. Respuesta exitosa (el frontend usará esto para actualizar su estado)
        res.json({
            success: true,
            favoritos: updatedUser.favoritos,
            ocultos: updatedUser.ocultos
        });

    } catch (error) {
        console.error("Error al actualizar preferencias:", error);
        res.status(500).json({ message: "Error interno al actualizar preferencias" });
    }
};