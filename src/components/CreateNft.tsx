import React, { useState, useMemo } from 'react';

// Tipe data yang disederhanakan
export interface RoyaltyRecipient {
  address: string;
  share: number; // Persentase bagian
}

export interface RoyaltyInfo {
  recipients: RoyaltyRecipient[];
}

// Properti yang diterima oleh komponen
interface CreateNftProps {
  onSubmit: (data: {
    trackTitle: string;
    price: number;
    coverImageFile: File;
    audioFile: File;
    royaltyInfo: RoyaltyInfo;
  }) => void;
  onBack: () => void;
  isMinting: boolean;
  mintingStatus: string;
}

export function CreateNft({ onSubmit, onBack, isMinting, mintingStatus }: CreateNftProps) {
  const [trackTitle, setTrackTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const [recipients, setRecipients] = useState<RoyaltyRecipient[]>([
    { address: '', share: 100 },
  ]);

  const totalShare = useMemo(() => recipients.reduce((sum, r) => sum + (Number(r.share) || 0), 0), [recipients]);

  const handleRecipientChange = (index: number, field: 'address' | 'share', value: string) => {
    const newRecipients = [...recipients];
    const val = field === 'share' ? Number(value) : value;
    if (typeof val === 'number' && (val < 0 || val > 100)) return;
    newRecipients[index] = { ...newRecipients[index], [field]: val };
    setRecipients(newRecipients);
  };

  const addRecipient = () => setRecipients([...recipients, { address: '', share: 0 }]);
  const removeRecipient = (index: number) => setRecipients(recipients.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalShare !== 100) {
      alert(`Total royalty share must be exactly 100%, but it is currently ${totalShare}%.`);
      return;
    }
    if (!trackTitle || price <= 0 || !coverImage || !audioFile || recipients.some(r => !r.address || r.share <= 0)) {
        alert('Please fill all fields. Address and share must be positive values.');
        return;
    }

    onSubmit({
      trackTitle,
      price,
      coverImageFile: coverImage,
      audioFile: audioFile,
      royaltyInfo: { recipients },
    });
  };

  return (
    <div className="create-nft-container">
      <button onClick={onBack} className="card back-button" disabled={isMinting}>← Back</button>
      <h2>Mint Your Music NFT</h2>
      <form onSubmit={handleSubmit} className="create-nft-form">
        <div className="form-section">
            <h4>1. Track Details</h4>
            <div className="form-group">
                <label>Track Title</label>
                <input type="text" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Price (QIE)</label>
                <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} step="0.1" required />
            </div>
            {/* DIPERBARUI: Input file untuk cover image */}
            <div className="form-group">
                <label>Cover Image</label>
                <label htmlFor="cover-image-input" className="file-input-label">
                    {coverImage ? 'Change Image' : 'Choose Image'}
                </label>
                <input id="cover-image-input" type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)} required />
                {coverImage && <p className="file-name-display">Selected: {coverImage.name}</p>}
            </div>
            {/* DIPERBARUI: Input file untuk audio */}
            <div className="form-group">
                <label>Audio File</label>
                <label htmlFor="audio-file-input" className="file-input-label">
                    {audioFile ? 'Change Audio' : 'Choose Audio'}
                </label>
                <input id="audio-file-input" type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)} required />
                {audioFile && <p className="file-name-display">Selected: {audioFile.name}</p>}
            </div>
        </div>
        
        <div className="form-section">
          <h4>2. Royalty Distribution (Total: <span className={totalShare === 100 ? 'valid' : 'invalid'}>{totalShare}%</span>)</h4>
          <p>Define who receives royalties and their share. Must sum to 100%.</p>
          {recipients.map((r, index) => (
            <div key={index} className="dynamic-row">
              <input type="text" placeholder="Recipient Address" value={r.address} onChange={e => handleRecipientChange(index, 'address', e.target.value)} required />
              <input type="number" placeholder="Share %" value={r.share} onChange={e => handleRecipientChange(index, 'share', e.target.value)} required />
              {recipients.length > 1 && <button type="button" onClick={() => removeRecipient(index)} className="remove-button">×</button>}
            </div>
          ))}
          <button type="button" onClick={addRecipient} className="card add-button">+ Add Recipient</button>
        </div>

        <button type="submit" className="card mint-button" disabled={isMinting}>
            {isMinting ? mintingStatus || 'Minting...' : 'Mint NFT'}
        </button>
      </form>
    </div>
  );
}
