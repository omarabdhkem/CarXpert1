import { Route, Switch } from 'wouter';
import { useUser } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import CarDetailsPage from './pages/CarDetailsPage';
import DealershipsPage from './pages/DealershipsPage';
import ServiceCentersPage from './pages/ServiceCentersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import AddCarPage from './pages/AddCarPage';

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/cars" component={CarsPage} />
          <Route path="/cars/:id" component={CarDetailsPage} />
          <Route path="/dealerships" component={DealershipsPage} />
          <Route path="/service-centers" component={ServiceCentersPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/favorites" component={FavoritesPage} />
          <Route path="/add-car" component={AddCarPage} />
          <Route>
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600">الصفحة غير موجودة</p>
            </div>
          </Route>
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

export default App;
