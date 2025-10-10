import { Request, Response, NextFunction, RequestHandler } from 'express';

export interface AsyncRequestHandler {
    (req: Request, res: Response, next: NextFunction): Promise<any>;
}

export const asyncHandler = (requestHandler: AsyncRequestHandler): RequestHandler => (
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch(next);
    }
);
