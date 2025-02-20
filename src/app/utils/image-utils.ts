export class ImageUtils {
    static readAndResizeImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
  
            let width = img.width;
            let height = img.height;
  
            // Calculate the new dimensions while maintaining the aspect ratio
            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }
  
            canvas.width = width;
            canvas.height = height;
  
            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0, width, height);
  
            // Get the resized image as a data URL
            resolve(canvas.toDataURL('image/jpeg'));
          };
          img.onerror = reject;
        };
        reader.onerror = reject;
  
        reader.readAsDataURL(file);
      });
    }
  }