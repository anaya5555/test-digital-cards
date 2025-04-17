import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";

function CardView() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, "profiles", username);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setProfile(docSnap.data());
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
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/u/:username" element={<CardView />} />
      </Routes>
    </Router>
  );
}