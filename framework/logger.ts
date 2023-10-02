import expressWinston from "express-winston";
import winston from "winston";

export const routeLogger = expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf((info) => `${info.level}: ${info.message}`)
  ),
  meta: false,
  msg: "{{res.statusCode}} {{req.method}} {{req.url}} {{res.responseTime}}ms",
  expressFormat: false,
  colorize: true,
  // ignoreRoute: function (req, res) { return false; }
});

export const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
});