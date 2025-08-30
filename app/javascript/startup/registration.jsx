import { createRoot } from 'react-dom/client';
import HomePage from '../components/HomePage';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <Brows dderRouter>
      <HomePage />
    </BrowserRouter>
  );
}
