const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const { passportInit, authenticateJWT } = require("./passport")
const typeDefs = require("../schema")
const resolvers = require("../resolvers")
const { ApolloServer } = require("apollo-server-express")
const model = require("../models")
const logger = require("../../lib/logger")
require("events").EventEmitter.defaultMaxListeners = Infinity

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const setupExpress = () => { 
  const app = express()

  // express middleware
  setupParsers(app)
  setupPassport(app)

  app.use(cors())

  // setupRoutes(app)

  // graphQL
  const server = setupGraphQL()
  
  server.start().then(res => {
    server.applyMiddleware({
      app,
      path: process.env.GRAPHQL_ENDPOINT,
      cors: {
        origin: [process.env.CLIENT_ORIGIN],
        credentials: true,
      },
    })
  })
  

  const expressServer = app.listen({ port: process.env.PORT }, () => {
    console.info(`Server started on port ${process.env.PORT}`)
  })

  return {
    app,
    expressServer,
  }
}

const setupParsers = (app) => {
  app.use(
    bodyParser.json({
      limit: "50mb",
    })
  )
  app.use(
    bodyParser.urlencoded({
      limit: "50mb",
      extended: true,
    })
  )
  app.use(cookieParser())
}

const setupPassport = (app) => {
  passportInit(app)
  app.use(authenticateJWT)
}

const setupGraphQL = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    // schemaDirectives: {
    //   auth: AuthDirective
    // },
    context: async ({ req, res }) => {
      if (req.user) {
        if (!global.user) {
          global.user = req.user
        } else {
          if (global.user && global.user.adminUser !== req.user.adminUser) {
            global.user = req.user
          }
        }
      }
      return {
        req,
        res,
        model,
        user: req.user,
        logger,
      }
    },
    tracing: true,
    cacheControl: true,
    formatError: (error) => {
      if (process.env.NODE === "production") {
        console.log(error)
      }
      return error
    },
  })
}

module.exports = setupExpress
