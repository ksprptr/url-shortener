/**
 * Triggers a browser download for the given href.
 **/
const triggerDownload = (href: string, fileName: string): void => {
  const link = document.createElement('a');

  link.href = href;
  link.download = fileName;
  link.click();
};

/**
 * Triggers a browser download for an in-memory text file.
 **/
export const downloadTextFile = (contents: string, fileName: string, type: string): void => {
  const url = URL.createObjectURL(new Blob([contents], { type }));

  triggerDownload(url, fileName);
  URL.revokeObjectURL(url);
};
