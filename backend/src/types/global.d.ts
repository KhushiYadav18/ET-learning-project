declare global {
  var process: NodeJS.Process;
  var console: Console;
  var require: NodeRequire;
}

declare module 'pg' {
  export * from 'pg';
}

declare module 'express' {
  export * from 'express';
}

declare module 'cors' {
  export * from 'cors';
}

declare module 'bcryptjs' {
  export * from 'bcryptjs';
}

declare module 'jsonwebtoken' {
  export * from 'jsonwebtoken';
}

declare module 'uuid' {
  export * from 'uuid';
}

declare module 'multer' {
  export * from 'multer';
}

export {};
