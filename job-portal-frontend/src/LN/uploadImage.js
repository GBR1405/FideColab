export const uploadImageToImgBB = async (file) => {
    const apiKey = process.env.REACT_APP_IMGBB_API_KEY;
    if (!apiKey) {
        console.error("API Key no definida");
        return { success: false, message: "API Key no definida" };
    }

    try {
        // Primero procesamos la imagen para hacerla cuadrada
        const squareImage = await createSquareImage(file);
        
        const formData = new FormData();
        formData.append("image", squareImage);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("Respuesta completa:", data);

        if (data.success) {
            return { success: true, url: data.data.url };
        } else {
            // Detección de mantenimiento
            if (data.error?.message === "Imgbb is currently down for maintenance.") {
                return {
                    success: false,
                    message: "El servicio de alojamiento de imagen está en mantenimiento. Intenta más tarde.",
                };
            }

            return {
                success: false,
                message: "Error desconocido al subir la imagen.",
            };
        }
    } catch (error) {
        console.error("Error en la subida de la imagen:", error);
        return {
            success: false,
            message: "No se pudo conectar con el servidor de ImgBB.",
        };
    }
};

// Función auxiliar para crear una imagen cuadrada recortando el centro
const createSquareImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Crear un canvas para el recorte
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Determinar el tamaño del cuadrado (el lado más pequeño)
                const size = Math.min(img.width, img.height);
                
                // Configurar el canvas con el tamaño cuadrado
                canvas.width = size;
                canvas.height = size;
                
                // Calcular las coordenadas para recortar el centro
                const sx = (img.width - size) / 2;
                const sy = (img.height - size) / 2;
                
                // Dibujar la porción cuadrada de la imagen original
                ctx.drawImage(
                    img, 
                    sx, sy,         // Coordenadas de inicio del recorte
                    size, size,     // Ancho y alto del recorte
                    0, 0,           // Coordenadas de inicio en el canvas
                    size, size      // Ancho y alto en el canvas
                );
                
                // Convertir el canvas a Blob
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error("Error al crear la imagen cuadrada"));
                        return;
                    }
                    
                    // Crear un nuevo File con el blob
                    const squareFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    
                    resolve(squareFile);
                }, 'image/jpeg', 0.92); // Calidad del 92%
            };
            img.onerror = () => reject(new Error("Error al cargar la imagen"));
            img.src = event.target.result;
        };
        reader.onerror = () => reject(new Error("Error al leer el archivo"));
        reader.readAsDataURL(file);
    });
};