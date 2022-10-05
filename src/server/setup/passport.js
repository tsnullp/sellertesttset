const passport = require("passport")
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt")
const User = require("../models/User")
const { Strategy: GoogleTokenStrategy } = require("passport-google-token")
const NaverTokenStrategy = require("passport-naver-token")

const jwtOptions = {
  // header에 bearer스키마에 담겨온 토큰 해석할 것
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // 해당 복화화 방법사용
  secretOrKey: process.env.JWT_SECRET
}

// 인증 성공시 콜백함수
const verifyUser = async (payload, done) => {
  try {
    const user = await User.findById(payload.id)
    user.adminUser = ""
    switch (user.grade) {
      case "1":
        user.adminUser = user._id
        break
      case "2": {
        const adminUser = await User.findById(user.adminUser)
        user.adminUser = adminUser._id
        break
      }
      default:
        break
    }
    
    // user가 있을 경우
    if (user) {
      return done(null, user)
    } else {
      return done(null, false)
    }
  } catch (error) {
    return done(error, false)
  }
}

const passportInit = app => {
  passport.use(new JwtStrategy(jwtOptions, verifyUser))
  app.use(passport.initialize())
}

const authenticateJWT = (req, res, next) => {
  return passport.authenticate("jwt", { session: false }, (error, user) => {
    if (user) {
      req.user = user
    }
    next()
  })(req, res, next)
}

// GOOGLE STRATEGY
const GoogleTokenStrategyCallback = (accessToken, refreshToken, profile, done) => {
  done(null, {
    accessToken,
    refreshToken,
    profile
  })
}

passport.use(
  new GoogleTokenStrategy(
    {
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENTSECRET
    },
    GoogleTokenStrategyCallback
  )
)

const NaverTokenStrategyCallback = (accessToken, refreshToken, profile, done) => {
  done(null, {
    accessToken,
    refreshToken,
    profile
  })
}

passport.use(
  new NaverTokenStrategy(
    {
      clientID: "LsMqM6gjsralPLhC85JR",
      clientSecret: "fDCRXX_clQ"
      // accessTokenField:
      // "AAAANzMqIPvsLeiTpQBeFwRvSlBbhOZFbi2Tq_jY9Ko6rA579oc-UyhUUxqGCB42B4U-9h3D2atEb7zz-fSNxeVnYGI"
    },
    NaverTokenStrategyCallback
  )
)

const authenticateGoogle = (req, res) =>
  new Promise((resolve, reject) => {
    passport.authenticate("google-token", { session: false }, (error, data, info) => {
      if (error) reject(error)
      resolve({ data, info })
    })(req, res)
  })

// NAVER STRATEGY

const authenticateNaver = (req, res) => {
  return new Promise((resolve, reject) => {
    passport.authenticate("naver-token", { session: false }, (error, data, info) => {
      if (error) reject(error)
      resolve({ data, info })
    })(req, res)
  })
}

module.exports = { passportInit, authenticateJWT, authenticateGoogle, authenticateNaver }
