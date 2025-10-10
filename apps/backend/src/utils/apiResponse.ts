type ApiResponseData = any;

export class ApiResponse {
    statusCode: number;
    data: ApiResponseData;
    message: string;
    success: boolean;

    constructor(statusCode: number, data: ApiResponseData, message: string = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}