const express = require('express')
const auth = require('./auth')

module.exports = function(server) {
  // dividir os web service em 2 grupos, 1 dentro de uma API protegida e o 2 publicas

  /*
   * Rotas protegidas por Token JWT
   */
  const protectedApi = express.Router(); // vai atender as URL que começam com /api
  server.use("/api", protectedApi); 

  // filtro para autenticar 
  protectedApi.use(auth);

  
  const BillingCycle = require("../api/billingCycle/billingCycleService");
  BillingCycle.register(protectedApi, "/billingCycles");

  /*
   * Rotas abertas
   */
  const openApi = express.Router();
  server.use("/oapi", openApi);
  const AuthService = require("../api/user/AuthService");
  openApi.post("/login", AuthService.login);
  openApi.post("/signup", AuthService.signup);
  openApi.post("/validateToken", AuthService.validateToken);
}
