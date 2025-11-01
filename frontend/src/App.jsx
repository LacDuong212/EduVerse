import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import AppProvidersWrapper from "./components/wrappers/AppProvidersWrapper";
import AppRouter from "./routes/router";
import '@/assets/scss/style.scss';


axios.defaults.withCredentials = true;

const App = () => {
  return (
    <AppProvidersWrapper>
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </AppProvidersWrapper>
  );
};

export default App;
