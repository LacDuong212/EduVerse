import axios from "axios";

import AppProvidersWrapper from "./components/wrappers/AppProvidersWrapper";
import AppRouter from "./routes/router";
import '@/assets/scss/style.scss';


axios.defaults.withCredentials = true;  // set globally once

const App = () => {
  return (
    <AppProvidersWrapper>
      <AppRouter />
    </AppProvidersWrapper>
  );
};

export default App;
