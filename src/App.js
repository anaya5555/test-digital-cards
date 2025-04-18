import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useParams, Link, useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  GoogleAuthProvider 
} from "firebase/auth";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// ================== PUBLIC CARD VIEW ==================
function CardView() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "profiles", username);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          console.error("Profile not found for user:", username);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [username]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{profile.name}</h1>
      <p>Job: {profile.job}</p>
      <p>Email: {profile.email}</p>
      <p>Phone: {profile.phone}</p>
      <Link to="/login">(Admin: Edit this card)</Link>
    </div>
  );
}

// ================== LOGIN/SIGNUP PAGE ==================
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      navigate("/login");
    } catch (err) {
      setError(`Login failed: ${err.message}`);
    }
  };

  const signup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "profiles", userCredential.user.uid), {
        name: "New User",
        job: "",
        email: email,
        phone: ""
      });
      navigate("/login");
    } catch (err) {
      setError(`Signup failed: ${err.message}`);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const credential = GoogleAuthProvider.credential(credentialResponse.credential);
      const userCredential = await signInWithPopup(auth, credential);
      
      const docRef = doc(db, "profiles", userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: userCredential.user.displayName || "Google User",
          job: "",
          email: userCredential.user.email || "",
          phone: ""
        });
      }
      
      navigate("/login");
    } catch (error) {
      console.error("Google login error:", error);
      setError("Google login failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Login or Signup</h1>
      
      <input
        id="email"
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        id="password"
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength="6"
      />
      <button onClick={login}>Login</button>
      <button onClick={signup}>Sign Up</button>
      
      <div style={{ margin: "20px 0" }}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => {
            console.log("Google login failed");
            setError("Google login failed");
          }}
        />
      </div>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

// ================== PROFILE EDITOR ==================
function ProfileEditor() {
  const user = auth.currentUser;
  const [profile, setProfile] = useState({
    name: "",
    job: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          const docRef = doc(db, "profiles", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            await setDoc(docRef, {
              name: user.displayName || "New User",
              job: "",
              email: user.email || "",
              phone: ""
            });
            setProfile({
              name: user.displayName || "New User",
              job: "",
              email: user.email || "",
              phone: ""
            });
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const saveProfile = async () => {
    try {
      await setDoc(doc(db, "profiles", user.uid), profile);
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Edit Your Card</h1>
      <button onClick={() => signOut(auth)}>Logout</button>
      
      <div>
        <label htmlFor="profile-name">Name:</label>
        <input
          id="profile-name"
          name="name"
          placeholder="Name"
          autoComplete="name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
      </div>
      
      <div>
        <label htmlFor="profile-job">Job Title:</label>
        <input
          id="profile-job"
          name="job"
          placeholder="Job Title"
          autoComplete="organization-title"
          value={profile.job}
          onChange={(e) => setProfile({ ...profile, job: e.target.value })}
        />
      </div>
      
      <div>
        <label htmlFor="profile-email">Email:</label>
        <input
          id="profile-email"
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />
      </div>
      
      <div>
        <label htmlFor="profile-phone">Phone:</label>
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          placeholder="Phone"
          autoComplete="tel"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        />
      </div>
      
      <button onClick={saveProfile}>Save Profile</button>
    </div>
  );
}

// ================== MAIN APP ==================
export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  if (!authChecked) return <div>Loading authentication...</div>;

  return (
    <GoogleOAuthProvider clientId="866670933249-eb0144d1kuup7qi09t4skjndapelrmcc.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/u/:username" element={<CardView />} />
          <Route path="/login" element={user ? <ProfileEditor /> : <LoginPage />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}