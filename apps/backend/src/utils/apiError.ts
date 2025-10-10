export class ApiError extends Error {
    statusCode: number;
    data: unknown;
    success: boolean;
    errors: unknown[];

    constructor(
        statusCode: number,
        message: string = "Something went wrong",
        errors: unknown[] = [],
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        Error.captureStackTrace(this, this.constructor)
    }
}