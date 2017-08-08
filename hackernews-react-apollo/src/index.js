import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import './styles/index.css';

// 1
import { ApolloProvider, createNetworkInterface, ApolloClient } from 'react-apollo';

// 2
const networkInterface = createNetworkInterface({
  uri: 'https://api.graph.cool/simple/v1/cj640qnt2k9yj01532v5uvpkh'
})

// 3
const client = new ApolloClient({
  networkInterface
})

// 4
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>
  , document.getElementById('root'));
registerServiceWorker();
