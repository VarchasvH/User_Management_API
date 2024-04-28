// ? We are defining a higher order function that will act as a wrapper

// ? Giving a function as a parameter
const asyncHandler = (requestHandler) => async (req, res, next)  =>{
  try {
    await requestHandler(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message
    })
  }
};

export default asyncHandler;