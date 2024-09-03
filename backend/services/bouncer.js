//blocking user for 5mins after exceeding 5 login attempts
var loginBouncer = require ("express-bouncer")(300000, 900000, 5);
loginBouncer.blocked = function (req, res, next, remaining)
{
    if(Math.round(remaining / 1000 / 60) > 1) return res.json({success: false, error: 0, time: Math.round(remaining / 1000 / 60),  message: "Zu viele Versuche. Bitte warte " + Math.round(remaining / 1000 / 60) + " Minuten"});
    res.json({success: false, error: 0, time: Math.round(remaining / 1000 / 60),  message: "Zu viele Versuche. Bitte warte " + Math.round(remaining / 1000 / 60) + " Minute"});
};


exports.loginBouncer = loginBouncer;

//blocking user for 5mins after exceeding 5 login attempts
var signupBouncer = require ("express-bouncer")(300000, 900000, 5);
signupBouncer.blocked = function (req, res, next, remaining)
{
    if(Math.round(remaining / 1000 / 60) > 1) return res.json({success: false, error: 0, time: Math.round(remaining / 1000 / 60),  message: "Zu viele Versuche. Bitte warte " + Math.round(remaining / 1000 / 60) + " Minuten"});
    res.json({success: false, error: 0, time: Math.round(remaining / 1000 / 60),  message: "Zu viele Versuche. Bitte warte " + Math.round(remaining / 1000 / 60) + " Minute"});
};

exports.signupBouncer = signupBouncer

//blocking user for 5mins after exceeding 10 request attempts
var accountStatusBouncer = require ("express-bouncer")(300000, 900000, 10);
accountStatusBouncer.blocked = function (req, res, next, remaining)
{
    if(Math.round(remaining / 1000 / 60) > 1) return res.json({success: false, error: 0, time: Math.round(remaining / 1000 / 60),  message: "Zu viele Versuche. Bitte warte " + Math.round(remaining / 1000 / 60) + " Minuten"});
    res.json({success: false, error: 0, time: Math.round(remaining / 1000 / 60),  message: "Zu viele Versuche. Bitte warte " + Math.round(remaining / 1000 / 60) + " Minute"});
};

exports.accountStatusBouncer = accountStatusBouncer

//blocking user for 5mins after exceeding 2 login attempts
var passwordBouncer = require ("express-bouncer")(300000, 900000, 2);
passwordBouncer.blocked = function (req, res, next, remaining)
{
    if(Math.round(remaining / 1000 / 60) > 1) return res.json({success: false, error: 0, time: Math.round(remaining / 1000 / 60),  message: "Zu viele Versuche. Bitte warte " + Math.round(remaining / 1000 / 60) + " Minuten"});
    res.json({success: false, error: 0, time: Math.round(remaining / 1000 / 60),  message: "Zu viele Versuche. Bitte warte " + Math.round(remaining / 1000 / 60) + " Minute"});
};


exports.passwordBouncer = passwordBouncer
