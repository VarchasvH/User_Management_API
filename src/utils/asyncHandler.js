// ? We are defining a higher order function that will act as a wrapper

// ? Giving a function as a parameter
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export default asyncHandler