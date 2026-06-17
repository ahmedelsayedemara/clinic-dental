/// <reference types="nativewind/types" />

declare module '*.jpeg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare function $t(key: string, options?: Record<string, unknown>): string;

declare function btoa(data: string): string;
declare function atob(data: string): string;

declare namespace NodeJS {
  interface Global {
    $t: (key: string, options?: Record<string, unknown>) => string;
  }
}
