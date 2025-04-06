export const uploadImageToImgBB = async (file) => {
    const apiKey = process.env.REACT_APP_IMGBB_API_KEY; // Para Create React App (CRA)
    if (!apiKey) {
        console.error("API Key no definida");
        return null;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (data.success) {
            return data.data.url; // Retorna la URL de la imagen
        } else {
            throw new Error("Error al subir la imagen");
        }
    } catch (error) {
        console.error("Error en la subida de la imagen:", error);
        return null;
    }
};
