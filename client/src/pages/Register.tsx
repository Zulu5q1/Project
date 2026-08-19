import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import type { University, Campus } from "../types";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [campusId, setCampusId] = useState("");

  const [universities, setUniversities] = useState<University[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [loadingCampuses, setLoadingCampuses] = useState(false);
  const [universityError, setUniversityError] = useState("");
  const [campusError, setCampusError] = useState("");

  useEffect(() => {
    apiFetch<{ universities: University[] }>("/api/universities")
      .then((res) => setUniversities(res.universities))
      .catch((err) => {
        setUniversityError(err instanceof Error ? err.message : "Failed to load universities");
      })
      .finally(() => setLoadingUniversities(false));
  }, []);

  useEffect(() => {
    if (!universityId) {
      setCampuses([]);
      setCampusId("");
      setCampusError("");
      return;
    }

    setLoadingCampuses(true);
    setCampusId("");
    setCampusError("");
    apiFetch<{ campuses: Campus[] }>(`/api/universities/${universityId}/campuses`)
      .then((res) => setCampuses(res.campuses))
      .catch((err) => {
        setCampusError(err instanceof Error ? err.message : "Failed to load campuses");
      })
      .finally(() => setLoadingCampuses(false));
  }, [universityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !username || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        username,
        universityId: universityId || undefined,
        campusId: campusId || undefined,
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50";

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Create Account</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        {universityError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            Unable to load universities: {universityError}. Please check that the server is running and the database is connected.
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                placeholder="First name"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
                placeholder="Last name"
                disabled={loading}
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@university.edu"
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              placeholder="Choose a username"
              disabled={loading}
              autoComplete="username"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="At least 8 characters"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
              University
            </label>
            <select
              id="university"
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              className={inputClass}
              disabled={loading || loadingUniversities}
            >
              <option value="">
                {loadingUniversities ? "Loading universities..." : "Select a university"}
              </option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="campus" className="block text-sm font-medium text-gray-700 mb-1">
              Campus
            </label>
            <select
              id="campus"
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              className={inputClass}
              disabled={loading || !universityId || loadingCampuses}
            >
              <option value="">
                {loadingCampuses
                  ? "Loading campuses..."
                  : !universityId
                    ? "Select a university first"
                    : "Select a campus"}
              </option>
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </select>
            {campusError && (
              <p className="text-red-600 text-xs mt-1">{campusError}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
            disabled={loading || loadingUniversities}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
