export const convertToBase64 = (file: any) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};
