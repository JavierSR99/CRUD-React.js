import app from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyB9pfApEFzxUYtepuVgXa57ybo0eNM60s4",
    authDomain: "crud-react-827b4.firebaseapp.com",
    databaseURL: "https://crud-react-827b4.firebaseio.com",
    projectId: "crud-react-827b4",
    storageBucket: "crud-react-827b4.appspot.com",
    messagingSenderId: "914795307854",
    appId: "1:914795307854:web:7a6e12ebf02269a888741f"
  };
  // Initialize Firebase
  app.initializeApp(firebaseConfig);

  //atajos para no escribir todo el rato firestore, auth...
  const db = app.firestore();
  const auth = app.auth();

  export {db, auth}