import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo';
import Link from './Link';

class LinkList extends Component {

  _updateCacheAfterVote = (store, createVote, linkId) => {
    // Section 6 part 1
      // Get the current state of the cached data for the ALL_LINKS_QUERY
    const data = store.readQuery({ query: ALL_LINKS_QUERY })
    // Section 6 part 2
      // Retrieve the link that the user just voted for from that list
      // Manipulate that link by resetting it's votes to the votes returned by the server
    const votedLink = data.allLinks.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes
    // Section 6 part 3
      // Take that modified data, and write it back to the store
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
  if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
    return <div>Loading</div>
  }
  // 2
  if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
    return <div>Error</div>
  }
  // 3
  const linksToRender = this.props.allLinksQuery.allLinks

  return (
    <div>
      {linksToRender.map( (link, index) => (
        <Link 
          key={link.id} 
          index={index} 
          link={link}
          updateStoreAfterVote={this._updateCacheAfterVote}
        />
      ))}
    </div>
  )

  }
}


// 1
export const ALL_LINKS_QUERY = gql`
  # 2
  query AllLinksQuery {
    allLinks {
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
  }

`

// 3
// The name inside the object defines the props
export default graphql(ALL_LINKS_QUERY, {name: 'allLinksQuery' }) (LinkList);