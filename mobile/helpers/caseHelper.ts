export const uppercaseAll = (obj: any): any => {
  if (typeof obj === 'string') {
    return obj.toUpperCase();
  } else if (Array.isArray(obj)) {
    return obj.map(uppercaseAll);
  } else if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = uppercaseAll(obj[key]);
      }
    }
    return result;
  } else {
    return obj;
  }
}
