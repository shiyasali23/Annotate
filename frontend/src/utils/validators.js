export const validateFolder = (files) => {
    let totalSize = 0;
    let isValid = true;
    const maxSize = 50 * 1024 * 1024; // 50 MB in bytes
    const validExtensions = ['.jpeg', '.jpg', '.png'];
  
    // Check if the uploaded item is a folder
    if (files.length === 0 || !files[0].webkitRelativePath) {
      return 'Please upload a folder';
    }
  
    // Check each file in the folder
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      totalSize += file.size;
  
      // Check if the file has a valid image extension
      const fileExtension = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
      if (!validExtensions.includes(`.${fileExtension}`)) {
        isValid = false;
        break;
      }
    }
  
    // Check the total size of the folder
    if (totalSize > maxSize) {
      return 'Upload folder below 100 MB';
    }
  
    // Check if all files are images
    if (!isValid) {
      return 'Upload folder with only images';
    }
  
    return false;
  };
  

  