module.exports = {
  isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect("/failed");
    }
    next();
  },
  alreadyLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/protected");
    }
    next();
  },
};
