import { ApolloProvider } from '@apollo/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { client } from './apollo/client';

import Layout from './components/Layout';
import GamesList from './pages/GamesList';
import GameDetails from './pages/GameDetails';
import AddGame from './pages/AddGame';
import AddReview from './pages/AddReview';
import LiveNotifications from './components/LiveNotifications';

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <LiveNotifications />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<GamesList />} />
            <Route path="game/:id" element={<GameDetails />} />
            <Route path="add-game" element={<AddGame />} />
            <Route path="add-review" element={<AddReview />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
