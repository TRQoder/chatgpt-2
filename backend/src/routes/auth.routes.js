const authControllers = require("../controllers/auth.controller");
const { authUser } = require("../middlewares/auth.middleware");

const router = require("express").Router();

router.post("/register", authControllers.registerUser);
router.post("/login", authControllers.loginUser);
router.get("/logout", authControllers.logoutUser);
router.get("/me",authUser, authControllers.fetchUserDetails);

module.exports = router;
