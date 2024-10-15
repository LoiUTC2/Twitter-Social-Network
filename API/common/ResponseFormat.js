function formatResponse(data, isSuccess, errorMessage) {
    return {
        data: data,
        isSuccess: isSuccess,
        errorMessage: errorMessage
    };
}

module.exports = formatResponse;