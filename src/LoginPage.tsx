import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim()) return;

    const db = getDatabase();
    const usersRef = ref(db, "users/" + username);

    const snapshot = await get(usersRef);

    if (snapshot.exists()) {
      setError("❌ Username already taken. Please try again.");
    } else {
      // Save new user
      await fetch(`https://panda-royal-default-rtdb.firebaseio.com/users/${username}.json`, {
        method: "PUT",
        body: JSON.stringify({ score: 0 })
      });
      navigate("/scorecard", { state: { username } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/background.jpg')" }}>
      <div className="bg-gray-800 bg-opacity-80 p-8 rounded-2xl shadow-lg w-96 text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Panda Royale</h1>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter username"
          className="w-full p-2 mb-3 rounded-lg text-black"
        />
        {error && <p className="text-red-400 mb-2">{error}</p>}
        <button
          onClick={handleLogin}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold"
        >
          Start
        </button>
      </div>
    </div>
  );
}
