import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo';
import Link from './Link';

class LinkList extends Component {

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
      {linksToRender.map(link => (
        <Link key={link.id} link={link}/>
      ))}
    </div>
  )

  }
}


// 1
const ALL_LINKS_QUERY = gql`
  # 2
  query AllLinksQuery {
    allLinks {
      id
      createdAt
      url
      description
    }
  }

`

// 3
// The name inside the object defines the props
export default graphql(ALL_LINKS_QUERY, {name: 'allLinksQuery' }) (LinkList);