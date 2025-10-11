import Usuario from "../models/usuario.js";

// 1. GET: Obtener las preferencias del usuario loggeado
export const getPrefs = async (req, res) => {
    try {
        // req.userId es añadido por el middleware verifyToken
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

// 2. POST/PUT: Alternar el estado (favorito, oculto) de una ruta
export const togglePref = async (req, res) => {
    const { routeId, list, action } = req.body; // list: 'favoritos' o 'ocultos', action: 'add' o 'remove'

    if (!routeId || !['favoritos', 'ocultos'].includes(list) || !['add', 'remove'].includes(action)) {
        return res.status(400).json({ message: "Datos de solicitud inválidos" });
    }

    const idNum = Number(routeId);
    if (!Number.isFinite(idNum)) {
        return res.status(400).json({ message: "ID de ruta inválido" });
    }

    try {
        let updateQuery = {};

        if (action === 'add') {
            // Si añadimos a una lista, también debemos eliminar de la lista opuesta
            const opposingList = list === 'favoritos' ? 'ocultos' : 'favoritos';

            updateQuery = {
                // Añadir a la lista target (solo si no existe: $addToSet)
                $addToSet: { [list]: idNum },
                // Eliminar de la lista opuesta (si estaba allí)
                $pull: { [opposingList]: idNum }
            };
        } else { // action === 'remove'
            // Eliminar de la lista target
            updateQuery = { $pull: { [list]: idNum } };
        }

        // Actualizar en la base de datos
        const updatedUser = await Usuario.findByIdAndUpdate(
            req.userId,
            updateQuery,
            { new: true, select: 'favoritos ocultos' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({
            success: true,
            favoritos: updatedUser.favoritos,
            ocultos: updatedUser.ocultos
        });

    } catch (error) {
        console.error("Error al actualizar preferencias:", error);
        res.status(500).json({ message: "Error al actualizar preferencias" });
    }
};