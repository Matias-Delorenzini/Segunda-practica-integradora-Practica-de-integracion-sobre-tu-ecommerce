import express from 'express';
import passport from 'passport';
const router = express.Router();

router.get("/current", (req, res) => {
    if (req.session.user) {
        res.status(200).json({ user: req.session.user });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

router.post("/register", passport.authenticate("register", { failureRedirect: "/api/sessions/failregister" }), async (req, res) => {
    res.redirect("http://localhost:8080/login");
});
router.get("/failregister", async (req,res) => {
    console.log("Failed Strategy");
    res.redirect("http://localhost:8080/register");
})

router.post("/login", passport.authenticate("login", { failureRedirect: "/api/sessions/faillogin" }), async (req, res) => {
    if (!req.user) return res.status(400).send({ status: "error", error: "Invalid credentials" });
    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email,
        cart: req.user.cart,
        role: req.user.role
    };
    res.redirect("http://localhost:8080/api/products");
});

router.get("/faillogin",(req,res) => {
    res.redirect("http://localhost:8080/login");
})

router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log("Error al hacer logout", err)
        } 
        res.redirect("http://localhost:8080/login");
    });
});

export default router;