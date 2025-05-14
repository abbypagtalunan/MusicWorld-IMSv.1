// controllers/logoutController.js
exports.logoutUser = (req, res) => {
    // You can add logic here if using sessions or tokens
  
    return res.status(200).json({
      message: "Logged out successfully"
    });
  };