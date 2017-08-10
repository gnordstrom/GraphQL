import React, { Component } from 'react'
import { graphql, gql } from 'react-apollo'
import Link from './Link'
import { GC_USER_ID, GC_AUTH_TOKEN, LINKS_PER_PAGE } from '../constants'

class LinkList extends Component {

  // _updateCacheAfterVote = (store, createVote, linkId) => {
  //   // Section 6 part 1
  //     // Get the current state of the cached data for the ALL_LINKS_QUERY
  //   const data = store.readQuery({ query: ALL_LINKS_QUERY })
  //   // Section 6 part 2
  //     // Retrieve the link that the user just voted for from that list
  //     // Manipulate that link by resetting it's votes to the votes returned by the server
  //   const votedLink = data.allLinks.find(link => link.id === linkId)
  //   votedLink.votes = createVote.link.votes
  //   // Section 6 part 3
  //     // Take that modified data, and write it back to the store
  //   store.writeQuery({ query: ALL_LINKS_QUERY, data })
  // }
  _updateCacheAfterVote = (store, createVote, linkId) => {
    const isNewPage = this.props.location.pathname.includes('new')
    const page = parseInt(this.props.match.params.page, 10)
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? "createdAt_DESC" : null
    const data = store.readQuery({ query: ALL_LINKS_QUERY, variables: { first, skip, orderBy } })

    const votedLink = data.allLinks.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes
    store.writeQuery({ query: ALL_LINKS_QUERY, data })
  }

  _subscribeToNewLinks = () => {
  this.props.allLinksQuery.subscribeToMore({
    document: gql`
      subscription {
        Link(filter: {
          mutation_in: [CREATED]
        }) {
          node {
            id
            url
            description
            createdAt
            postedBy {
              id
              name
            }
            votes {
              id
              user {
                id
              }
            }
          }
        }
      }
    `,
    updateQuery: (previous, { subscriptionData }) => {
      const newAllLinks = [
        subscriptionData.data.Link.node,
        ...previous.allLinks
      ]
      const result = {
        ...previous,
        allLinks: newAllLinks
      }
      return result
    }
  })
}

  _subscribeToNewVotes = () => {
    this.props.allLinksQuery.subscribeToMore({
      document: gql`
        subscription {
          Vote(filter: {
            mutation_in: [CREATED]
          }) {
            node {
              id
              link {
                id
                url
                description
                createdAt
                postedBy {
                  id
                  name
                }
                votes {
                  id
                  user {
                    id
                  }
                }
              }
              user {
                id
              }
            }
          }
        }
      `,
      updateQuery: (previous, { subscriptionData }) => {
        const votedLinkIndex = previous.allLinks.findIndex(link => link.id === subscriptionData.data.Vote.node.link.id)
        const link = subscriptionData.data.Vote.node.link
        const newAllLinks = previous.allLinks.slice()
        newAllLinks[votedLinkIndex] = link
        const result = {
          ...previous,
          allLinks: newAllLinks
        }
        return result
      }
    })
  }

  _getLinksToRender = (isNewPage) => {
    if (isNewPage) {
      return this.props.allLinksQuery.allLinks
    }
    const rankedLinks = this.props.allLinksQuery.allLinks.slice()
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
    return rankedLinks
  }

  _nextPage = () => {
    const page = parseInt(this.props.match.params.page, 10)
    if (page <= this.props.allLinksQuery._allLinksMeta.count / LINKS_PER_PAGE) {
      const nextPage = page + 1
      this.props.history.push(`/new/${nextPage}`)
    }
  }

  _previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10)
    if (page > 1) {
      const previousPage = page - 1
      this.props.history.push(`/new/${previousPage}`)
    }
  }

  componentDidMount() {
    this._subscribeToNewLinks()
    this._subscribeToNewVotes()
  }


  render() {
  // STEP 1 = DUMMY DATA
  //   const linksToRender = [
  //     {
  //       id: '1',
  //       description: 'The Coolest GraphQL Backend',
  //       url: 'https://www.graph.cool'
  //     }, 
  //     {
  //       id: '2',
  //       description: 'The Best GraphQL Client',
  //       url: 'http://dev.apollodata.com/'
  //     }
  //   ];

  //   return (
  //     <div>
  //       {linksToRender.map(link => (
  //         <Link key={link.id} link={link}/>
  //       ))}
  //     </div>
  //   )
  // }

  // STEP 2 - PULLED FROM DB
  // 1
  // if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
  //   return <div>Loading</div>
  // }
  // 2
  // if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
  //   return <div>Error</div>
  // }
  // 3
  // const linksToRender = this.props.allLinksQuery.allLinks

  if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
    return <div>Loading</div>
  }

  if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
    return <div>Error</div>
  }

  const isNewPage = this.props.location.pathname.includes('new')
  const linksToRender = this._getLinksToRender(isNewPage)
  const userId = localStorage.getItem(GC_USER_ID)

  return (
     <div>
      {!userId ?
        <button onClick={() => {
          this.props.history.push('/login')
        }}>Login</button> :
        <div>
          <button onClick={() => {
            this.props.history.push('/create')
          }}>New Post</button>
          <button onClick={() => {
            localStorage.removeItem(GC_USER_ID)
            localStorage.removeItem(GC_AUTH_TOKEN)
            this.forceUpdate() // doesn't work as it should :(
          }}>Logout</button>
        </div>
      }
      <div>
        {linksToRender.map((link, index) => (
          <Link key={link.id} updateStoreAfterVote={this._updateCacheAfterVote} link={link} index={index}/>
        ))}
      </div>
      {isNewPage &&
      <div>
        <button onClick={() => this._previousPage()}>Previous</button>
        <button onClick={() => this._nextPage()}>Next</button>
      </div>
      }
    </div>
  )

  }
}



// 1
export const ALL_LINKS_QUERY = gql`
  # 2
  query AllLinksQuery($first: Int, $skip: Int, $orderBy: LinkOrderBy) {
    allLinks(first: $first, skip: $skip, orderBy: $orderBy) {
      id
      createdAt
      url
      description
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
    _allLinksMeta {
      count
    }
  }

`

// 3
// The name inside the object defines the props
// export default graphql(ALL_LINKS_QUERY, {name: 'allLinksQuery' }) (LinkList);

export default graphql(ALL_LINKS_QUERY, {
  name: 'allLinksQuery',
  options: (ownProps) => {
    const page = parseInt(ownProps.match.params.page, 10)
    const isNewPage = ownProps.location.pathname.includes('new')
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return {
      variables: { first, skip, orderBy }
    }
  }
}) (LinkList)