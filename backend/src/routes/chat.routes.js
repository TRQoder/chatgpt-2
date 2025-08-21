const router = require("express").Router()
const chatController = require("../controllers/chat.controller")
const authMiddleware = require("../middlewares/auth.middleware")


router.post("/",authMiddleware.authUser,chatController.createChat)

module.exports=router