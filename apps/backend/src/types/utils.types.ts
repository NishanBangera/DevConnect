import { Request, Response, NextFunction } from 'express';

export type ApiResponseData = any;

export interface AsyncRequestHandler {
    (req: Request, res: Response, next: NextFunction): Promise<any>;
}
