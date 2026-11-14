export const successResponse = (res, data, message, statusCode = 200, pagination) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...(pagination ? { pagination } : {}),
    });
};
export const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors ? { errors } : {}),
    });
};
