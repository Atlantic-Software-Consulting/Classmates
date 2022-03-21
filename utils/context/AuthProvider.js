import { createContext, useContext, useState, useEffect } from 'react';
import { useSignInWithFacebook } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router'
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  // FacebookAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { auth } from '../api/firebase.config.js';

const AuthContext = createContext();


// need to implement state machine for idle,loading, success, and error states
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(user);
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
        })
      } else {
        setUser(null);
      }
      setLoading(false);
    })
    return () => unsubscribe();
  }, [])

  const signup = (email, password, username) => {
     createUserWithEmailAndPassword(auth, email, password)
      .then((response) => {
        // need set redirect to login
        router.push('/')
        console.log(response)
      })
      .catch((err) => {
        // needs to set an error state
        console.warn('Problem with sign up: ', err.message);
      })
  }

  const login = (email, password) => {
    console.log(email, password)
    return signInWithEmailAndPassword(auth, email, password)
    .then((response) => {
      // need to set redirect to /[username]/dashboard
      // need to set success state
      router.push('/')
      console.log(response)
    })
      .catch((err) => {
        // needs to set an error state
        console.warn('Problem with log in: ', err.message);
      })
  }

  const logout = async () => {
    setUser(null);
    await signOut(auth);
  }

  // OAuth Google + FB
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(res => {
        console.log(res)
      })
      .catch(error => {
        console.warn(error)
      })
  }
  const signInWithFacebook = () => {
    const [signInWithFacebook, user, loading, error] = useSignInWithFacebook(auth);
    if (error) {
      return(
        <div>
          {alert('Error Signing In')}
        </div>
      );
    }
    if (loading) {
      return(
        <div>
          <h2>Loading...</h2>
        </div>
      );
    }
    if (user) {
      return(
        <div>
          <p>
            Signed In User: {user.email}
          </p>
        </div>
      )
    }
    return(
      <div>
        <p>test</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user, signup, login, logout,
        signInWithGoogle, signInWithFacebook
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext);
}