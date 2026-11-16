export function comprimirImagen(archivo, maxAncho = 800, maxAlto = 800, calidad = 0.75) {
  return new Promise((resolve, reject) => {
    if (!archivo) {
      reject(new Error('No se proporcionó archivo'));
      return;
    }

    const tiposValidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposValidos.includes(archivo.type)) {
      reject(new Error('Formato no soportado. Usa JPG, PNG o WebP.'));
      return;
    }

    const lector = new FileReader();

    lector.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let ancho = img.width;
        let alto = img.height;

        if (ancho > maxAncho || alto > maxAlto) {
          const ratio = Math.min(maxAncho / ancho, maxAlto / alto);
          ancho = Math.round(ancho * ratio);
          alto = Math.round(alto * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, ancho, alto);

        let tipoSalida = 'image/jpeg';
        try {
          if (canvas.toDataURL('image/webp').startsWith('data:image/webp')) {
            tipoSalida = 'image/webp';
          }
        } catch {
        }

        const base64 = canvas.toDataURL(tipoSalida, calidad);
        resolve(base64);
      };

      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      img.src = e.target.result;
    };

    lector.onerror = () => reject(new Error('No se pudo leer el archivo'));
    lector.readAsDataURL(archivo);
  });
}

export function validarTamanoImagen(base64, maxBytes = 2.7 * 1024 * 1024) {
  return base64.length <= maxBytes;
}