//blocking user for 5mins after exceeding 5 login attempts
var loginBouncer = require ("express-bouncer")(300000, 900000, 5);
loginBouncer.blocked = function (req, res, next, remaining)
{
    if(Math.round(remaining / 1000 / 60) > 1) return res.json({success: false, error: 0, time: Math.round(remaining / 1000 / 60),  message: "Zu viele Versuche. Bitte warte " + Math.round(remaining / 1000 / 60) + " Minuten"});
    res.json({success: false, error: 0, time: Math.round(remaining / 1000 / 60),  message: "Zu viele Versuche. Bitte warte " + Math.round(remaining / 1000 / 60) + " Minute"});
};


exports.loginBouncer = loginBouncer