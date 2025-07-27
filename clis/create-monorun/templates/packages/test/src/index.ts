export const testFunction = () => {
  return "Hello from @repo/test!";
};

export const utils = {
  formatDate: (date: Date) => date.toISOString(),
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
};
