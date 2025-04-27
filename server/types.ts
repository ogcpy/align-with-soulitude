import 'express-session';

declare module 'express-session' {
  interface SessionData {
    adminUser: {
      id: number;
      username: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      [key: string]: any;
    };
  }
}