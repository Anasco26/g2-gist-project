import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Post from "./pages/Post";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Newsletter from "./pages/Newsletter";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/new" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/post/:slug" element={<Post />} />
            <Route path="/post/:slug/edit" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/reviews" element={<CategoryPage section="reviews" />} />
            <Route path="/rankings" element={<CategoryPage section="rankings" />} />
            <Route path="/lists" element={<CategoryPage section="lists" />} />
            <Route path="/specials" element={<CategoryPage section="specials" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
