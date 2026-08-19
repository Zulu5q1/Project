import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch, getToken } from "../services/api";
import type { University, Campus, User } from "../types";

export default function Profile() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [department, setDepartment] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [campusId, setCampusId] = useState("");

  const [universities, setUniversities] = useState<University[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCampuses, setLoadingCampuses] = useState(false);
  const [universityError, setUniversityError] = useState("");
  const [campusError, setCampusError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setBio(user.bio || "");
      setDepartment(user.department || "");
      setUniversityId(user.university?.id || "");
      setCampusId(user.campus?.id || "");
    }
  }, [user]);

  useEffect(() => {
    apiFetch<{ universities: University[] }>("/api/universities")
      .then((res) => setUniversities(res.universities))
      .catch((err) => {
        setUniversityError(err instanceof Error ? err.message : "Failed to load universities");
      });
  }, []);

  useEffect(() => {
    if (!universityId) {
      setCampuses([]);
      setCampusError("");
      return;
    }

    setLoadingCampuses(true);
    setCampusError("");
    apiFetch<{ campuses: Campus[] }>(`/api/universities/${universityId}/campuses`)
      .then((res) => setCampuses(res.campuses))
      .catch((err) => {
        setCampusError(err instanceof Error ? err.message : "Failed to load campuses");
      })
      .finally(() => setLoadingCampuses(false));
  }, [universityId]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = getToken();
      const res = await apiFetch<{ user: User }>("/api/users/profile", {
        method: "PUT",
        token: token || undefined,
        body: JSON.stringify({
          firstName,
          lastName,
          bio,
          department,
          universityId: universityId || null,
          campusId: campusId || null,
        }),
      });
      updateUser(res.user);
      setEditing(false);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 text-2xl font-semibold">
              {user.firstName[0]}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-500 text-sm">@{user.username}</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department / Course</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={inputClass}
                placeholder="e.g. Computer Science"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Tell us about yourself..."
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
              <select
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className={inputClass}
                disabled={loading}
              >
                <option value="">Select a university</option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>
              {universityError && (
                <p className="text-red-600 text-xs mt-1">{universityError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campus</label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className={inputClass}
                disabled={loading || !universityId || loadingCampuses}
              >
                <option value="">
                  {loadingCampuses
                    ? "Loading..."
                    : !universityId
                      ? "Select a university first"
                      : "Select a campus"}
                </option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {campusError && (
                <p className="text-red-600 text-xs mt-1">{campusError}</p>
              )}
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setError("");
                  if (user) {
                    setFirstName(user.firstName);
                    setLastName(user.lastName);
                    setBio(user.bio || "");
                    setDepartment(user.department || "");
                    setUniversityId(user.university?.id || "");
                    setCampusId(user.campus?.id || "");
                  }
                }}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-gray-900 capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">University</p>
              <p className="text-gray-900">{user.university?.name || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Campus</p>
              <p className="text-gray-900">{user.campus?.name || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department / Course</p>
              <p className="text-gray-900">{user.department || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bio</p>
              <p className="text-gray-900">{user.bio || "No bio yet"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
