function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [profileLink, setProfileLink] = useState(""); // New state for profile link
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
      const userId = userCredential.user.uid;
      
      await setDoc(doc(db, "profiles", userId), {
        name: "New User",
        job: "",
        email: email,
        phone: ""
      });
      
      // Generate and set profile link
      const link = `${window.location.origin}/u/${userId}`;
      setProfileLink(link);
      
    } catch (err) {
      setError(`Signup failed: ${err.message}`);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const credential = GoogleAuthProvider.credential(credentialResponse.credential);
      const userCredential = await signInWithPopup(auth, credential);
      const userId = userCredential.user.uid;
      
      const docRef = doc(db, "profiles", userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: userCredential.user.displayName || "Google User",
          job: "",
          email: userCredential.user.email || "",
          phone: ""
        });
      }
      
      // Generate and set profile link for Google signup
      const link = `${window.location.origin}/u/${userId}`;
      setProfileLink(link);
      
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
      
      {/* NEW: Show profile link after signup */}
      {profileLink && (
        <div style={{ marginTop: 20, padding: 10, background: "#f0f0f0", borderRadius: 5 }}>
          <h3>Your Profile Link:</h3>
          <input
            type="text"
            value={profileLink}
            readOnly
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />
          <button 
            onClick={() => {
              navigator.clipboard.writeText(profileLink);
              alert("Link copied to clipboard!");
            }}
            style={{ padding: "8px 16px" }}
          >
            Copy Link
          </button>
          <p style={{ marginTop: 10 }}>
            <small>Give this link to your NFC provider or write it to an NFC tag.</small>
          </p>
        </div>
      )}
    </div>
  );
}