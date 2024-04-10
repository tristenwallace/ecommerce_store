declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      username: string;
      is_admin: boolean;
    };
  }
}
