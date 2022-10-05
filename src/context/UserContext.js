import React, { useState, createContext } from "react"
import decode from "jwt-decode"

const UserContext = createContext()

const UserProvider = ({ children }) => {
  const token = localStorage.getItem("token")
  let decodeUser = null

  if (token) {
    const tempUser = decode(token)

    if (tempUser.exp > new Date().getTime() / 1000) {
      decodeUser = tempUser
    }
  }
  const [user, setUser] = useState(decodeUser)

  const action = {
    login: ({ _id, adminUser, grade, email, nickname, avatar, token, admin }) => {
      if (!_id) {
        setUser(null)
        localStorage.removeItem("token")
      } else {
        localStorage.setItem("token", token)
        setUser({
          _id,
          adminUser,
          grade,
          email,
          nickname,
          avatar,
          token,
          admin
        })
      }
    },
    logout: () => {
      localStorage.removeItem("token")
      setUser(null)
    }
  }

  return <UserContext.Provider value={{ user, action }}>{children}</UserContext.Provider>
}

export { UserProvider, UserContext }
