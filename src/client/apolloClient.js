import ApolloLinkTimeout from "apollo-link-timeout"
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"

const httpLink = createHttpLink({
  uri: "http://localhost:5001/graphql",
})

const timeoutLink = new ApolloLinkTimeout(1000000)

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token")

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }
})


const client = new ApolloClient({
  link: authLink.concat(httpLink.concat(timeoutLink)),
  cache: new InMemoryCache(),
})

export default client
