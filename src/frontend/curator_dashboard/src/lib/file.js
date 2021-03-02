export const downloadFile = async (fileContent, fileName, fileType, fileExtension) => {
        const blob = new Blob([fileContent], {type: fileType});
        const href = await URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName + '.' + fileExtension;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
}