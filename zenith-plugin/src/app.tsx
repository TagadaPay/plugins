import Providers from '@/components/providers';
import SEO from '@/components/seo';
import Home from '@/pages/home/Home';
import './styles/globals.css';

export default function App() {
  return (
    <Providers>
      <SEO />
      <Home />
    </Providers>
  );
}
