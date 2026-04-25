'use client';

import type { User } from '../../services/api.service';
import { Link, Globe, Mail, X as Twitter } from 'lucide-react';

interface Props {
  profileData: User | null;
  onEdit: () => void;
}

export default function ProfileView({ profileData, onEdit }: Props) {
  return (
    <div className="bg-white/[0.02] rounded-3xl border border-white/10 backdrop-blur-sm p-6 md:p-8">
      {profileData?.bio && (
        <div className="mb-8 pb-8 border-b border-white/10">
          <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Bio</h3>
          <p className="text-gray-300 text-lg">{profileData.bio}</p>
        </div>
      )}

      <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
        Social Links
      </h3>
      <div className="flex flex-wrap gap-3">
        {profileData?.socials && profileData.socials.length > 0 && (
          <>
            {profileData.socials.map((social, index) => (
              <a
                key={index}
                href={social.platform === 'twitter' ? `https://twitter.com/${social.url}` : social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3 bg-black/50 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-[#6fc7ba]/50 transition-all group"
              >
                {social.platform === 'twitter' ? (
                  <Twitter className="w-5 h-5 group-hover:text-[#6fc7ba] transition-colors" />
                ) : social.platform === 'website' ? (
                  <Globe className="w-5 h-5 group-hover:text-[#6fc7ba] transition-colors" />
                ) : (
                  <Link className="w-5 h-5 group-hover:text-[#6fc7ba] transition-colors" />
                )}
                <span>
                  {social.platform === 'twitter'
                    ? `@${social.url}`
                    : social.url.replace(/^https?:\/\//, '')}
                </span>
              </a>
            ))}
          </>
        )}

        {profileData?.email && (
          <div className="flex items-center gap-3 px-5 py-3 bg-black/50 rounded-xl border border-white/10 text-gray-400">
            <Mail className="w-5 h-5" />
            <span>{profileData.email}</span>
          </div>
        )}

        {(!profileData?.socials || profileData.socials.length === 0) && !profileData?.email && (
          <div className="text-center py-8 text-gray-500">
            <Link className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No social links added yet</p>
            <button onClick={onEdit} className="cursor-pointer text-[#6fc7ba] hover:underline mt-2">
              Add some now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}