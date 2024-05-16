import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const unit8Array2String = (uint8Array:Uint8Array):string =>{
    const decoder = new TextDecoder();
    return decoder.decode(uint8Array);
}

export const stringToUint8Array = (str: string): Uint8Array => {
    // Split the string into an array of string numbers
    const strArray = str.split(',');

    // Convert each string number to a Number
    const numArray = strArray.map(Number);
  
    // Create a Uint8Array from the number array
    const uint8Array = new Uint8Array(numArray);
  
    return uint8Array;
};



