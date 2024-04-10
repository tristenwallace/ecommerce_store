declare namespace Express {
  export interface Request {
    user?: {
      username: string;
      is_admin: boolean;
    };
  }
}
