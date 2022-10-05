import React from "react"
import { HashRouter as Router, Route, Switch } from "react-router-dom"
import { HomePage, Login } from "components"

const router = () => {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/home">
            <HomePage />
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

export default router
