"use client";

import { Check, Edit, Loader2, Plus, X } from "lucide-react";
import type { Social } from "../../services/api.service";

interface Props {
  username: string;
  setUsername: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  socials: Social[];
  setSocials: (socials: Social[]) => void;
  saving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ProfileEditForm({
  username,
  setUsername,
  email,
  setEmail,
  bio,
  setBio,
  socials,
  setSocials,
  saving,
  onSubmit,
  onCancel,
}: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const addSocial = () => {
    setSocials([...socials, { platform: "twitter", url: "" }]);
  };

  const removeSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const updateSocial = (index: number, field: keyof Social, value: string) => {
    const newSocials = [...socials];
    newSocials[index] = { ...newSocials[index], [field]: value };
    setSocials(newSocials);
  };

  return (
    <div className="bg-white/2 rounded-3xl border border-white/10 backdrop-blur-sm p-6 md:p-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Edit className="w-5 h-5 text-[#6fc7ba]" />
        Edit Profile
      </h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm text-gray-400 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#6fc7ba]/50 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#6fc7ba]/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm text-gray-400 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell us about yourself"
            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#6fc7ba]/50 transition-colors resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm text-gray-400">Social Links</label>
            <button
              type="button"
              onClick={addSocial}
              className="text-xs text-[#6fc7ba] hover:text-[#4c63c4] flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Social
            </button>
          </div>
          <div className="space-y-3">
            {socials.map((social, index) => (
              <div key={index} className="flex gap-3 items-start">
                <select
                  value={social.platform}
                  onChange={(e) =>
                    updateSocial(index, "platform", e.target.value)
                  }
                  className="px-3 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6fc7ba]/50 transition-colors"
                >
                  <option value="twitter">Twitter</option>
                  <option value="website">Website</option>
                  <option value="telegram">Telegram</option>
                  <option value="discord">Discord</option>
                  <option value="github">GitHub</option>
                </select>
                <input
                  type="url"
                  value={social.url}
                  onChange={(e) => updateSocial(index, "url", e.target.value)}
                  placeholder={
                    social.platform === "twitter" ? "username" : "https://..."
                  }
                  className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#6fc7ba]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeSocial(index)}
                  className="cursor-pointer p-3 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            {socials.length === 0 && (
              <p className="text-gray-500 text-sm py-2">
                No social links added. Click "Add Social" to add one.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer px-6 py-3 bg-white/5 text-gray-400 font-medium rounded-xl hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#6fc7ba] text-black font-semibold rounded-xl hover:bg-[#5bb9a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
