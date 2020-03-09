export const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
export const namePattern = /^[a-zA-Z0-9._-]+$/;

export const isEmail = (value: string): boolean => emailPattern.test(value);
export const isName = (value: string): boolean => namePattern.test(value);
