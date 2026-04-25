'use client';

import { useState, useEffect } from 'react';
import { useWallet } from "../lib/services/wallet.service";
import { toast } from '../lib/stores/toastStore';
import { Settings, X } from 'lucide-react';
import {
  getProfile,
  updateUser,
  getUserTokens,
  getAirdrops,
  getStakingPools,
  type User,
  type Token,
  type Airdrop,
  type StakingPool,
  type Social
} from '../lib/services/api.service';
import Guardian from '../lib/components/layout/Guardian';
import ProfileHeader from '../lib/components/profile/ProfileHeader';
import ProfileTabs from '../lib/components/profile/ProfileTabs';
import ProfileEditForm from '../lib/components/profile/ProfileEditForm';
import ProfileView from '../lib/components/profile/ProfileView';
import ProfileTokens from '../lib/components/profile/ProfileTokens';
import ProfileAirdrops from '../lib/components/profile/ProfileAirdrops';
import ProfileStakingPools from '../lib/components/profile/ProfileStakingPools';

export default function ProfilePage() {
  const { address, connected, loading: walletLoading, autoSign, autoSignEnabled, setAutoSignEnabled } = useWallet();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [userAirdrops, setUserAirdrops] = useState<Airdrop[]>([]);
  const [airdropsLoading, setAirdropsLoading] = useState(false);
  const [userPools, setUserPools] = useState<StakingPool[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'tokens' | 'airdrops' | 'pools'>('profile');

  const [isEditing, setIsEditing] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [socials, setSocials] = useState<Social[]>([]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfileData(data);
      setUsername(data.username || '');
      setEmail(data.email || '');
      setBio(data.bio || '');
      setSocials(data.socials || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadUserTokens = async () => {
    setTokensLoading(true);
    try {
      const data = await getUserTokens();
      setUserTokens(data.tokens || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load tokens');
    } finally {
      setTokensLoading(false);
    }
  };

  const loadUserAirdrops = async () => {
    setAirdropsLoading(true);
    try {
      const data = await getAirdrops(1, 100, address || undefined);
      setUserAirdrops(data.airdrops || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load airdrops');
    } finally {
      setAirdropsLoading(false);
    }
  };

  const loadUserPools = async () => {
    setPoolsLoading(true);
    try {
      const data = await getStakingPools(1, 100, address || undefined);
      setUserPools(data.pools || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load pools');
    } finally {
      setPoolsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setSaving(true);
    try {
      const response = await updateUser({
        username: username || undefined,
        email: email || undefined,
        bio: bio || undefined,
        socials: socials
      });

      if (response.user) {
        await loadProfile();
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else if (response.error) {
        toast.error(response.error);
      } else if (response.message) {
        toast.error(response.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setUsername(profileData?.username || '');
    setEmail(profileData?.email || '');
    setBio(profileData?.bio || '');
    setSocials(profileData?.socials || []);
    setIsEditing(false);
  };

  useEffect(() => {
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('auth_token');
    if (!walletLoading && connected && hasToken) {
      loadProfile();
      loadUserTokens();
      loadUserAirdrops();
      loadUserPools();
    }
  }, [connected, walletLoading]);

  const CHAIN_ID = 'coin0xyz';

  const handleAutoSignToggle = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (autoSignEnabled) {
      try {
        const grantee = autoSign.granteeByChain[CHAIN_ID];
        if (grantee) {
          await autoSign.disable(CHAIN_ID);
        }
        setAutoSignEnabled(false);
        toast.success('Auto-sign disabled');
      } catch (err) {
        console.error('Error disabling autoSign:', err);
        setAutoSignEnabled(false);
        toast.success('Auto-sign disabled');
      }
    } else {
      try {
        await autoSign.enable(CHAIN_ID);
        setAutoSignEnabled(true);
        toast.success('Auto-sign enabled');
      } catch (err) {
        console.error('Error enabling autoSign:', err);
        toast.error('Failed to enable auto-sign');
      }
    }
  };

  return (
    <Guardian>
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#6fc7ba]/5 via-transparent to-transparent"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6fc7ba]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative max-w-4xl mx-auto px-4 pt-24 pb-16">
          <ProfileHeader
            profileData={profileData}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
            showSettings={showSettings}
            onToggleSettings={() => setShowSettings(!showSettings)}
            autoSignEnabled={autoSignEnabled}
            onAutoSignToggle={handleAutoSignToggle}
          />

          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tokenCount={userTokens.length}
            airdropCount={userAirdrops.length}
            poolCount={userPools.length}
          />

          {activeTab === 'profile' ? (
            isEditing ? (
              <ProfileEditForm
                username={username}
                setUsername={setUsername}
                email={email}
                setEmail={setEmail}
                bio={bio}
                setBio={setBio}
                socials={socials}
                setSocials={setSocials}
                saving={saving}
                onSubmit={handleSubmit}
                onCancel={cancelEdit}
              />
            ) : (
              <ProfileView profileData={profileData} onEdit={() => setIsEditing(true)} />
            )
          ) : activeTab === 'tokens' ? (
            <ProfileTokens userTokens={userTokens} tokensLoading={tokensLoading} />
          ) : activeTab === 'airdrops' ? (
            <ProfileAirdrops userAirdrops={userAirdrops} airdropsLoading={airdropsLoading} />
          ) : (
            <ProfileStakingPools userPools={userPools} poolsLoading={poolsLoading} />
          )}
        </div>
      </div>
    </Guardian>
  );
}