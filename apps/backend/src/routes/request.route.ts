import { Router } from "express";
import { userAuth } from "../middlewares/auth/auth.js";
import { createRequest } from "../controllers/request.controller.js";
import { reviewRequest } from "../controllers/request.controller.js";
import { handleValidationErrors } from "../middlewares/validators/error.validator.js";
import { createRequestValidator } from "../middlewares/validators/request.validator.js";
import { reviewRequestValidator } from "../middlewares/validators/request.validator.js";

const requestRoutes = Router();

requestRoutes.post(
    "/send/:status/:recipientId",
    userAuth,
    createRequestValidator,
    handleValidationErrors,
    createRequest
);
requestRoutes.post(
    "/review/:status/:requestId",
    userAuth,
    reviewRequestValidator,
    handleValidationErrors,
    reviewRequest
)
// requestRoutes.get("/:id", userAuth, getRequestById);
// requestRoutes.get("/", userAuth, getUserRequests);
// requestRoutes.patch("/:id", userAuth, updateRequestStatus);

export default requestRoutes;
