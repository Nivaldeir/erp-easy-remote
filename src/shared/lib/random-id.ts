export const randomId = (text: string) => {
  return `${text}-${Math.random().toString(8).substring(2, 15)}`;
};