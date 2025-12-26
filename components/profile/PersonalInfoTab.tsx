'use client';

import React, { useState, FormEvent } from 'react';

interface Profile {
  id?: string;
  name?: string;
  school?: string;
  subjects?: string[];
  bundesland?: string;
}

interface PersonalInfoTabProps {
  initialProfile: Profile | null;
  userEmail: string;
}

const BUNDESLAENDER = [
  'Baden-Württemberg',
  'Bayern',
  'Berlin',
  'Brandenburg',
  'Bremen',
  'Hamburg',
  'Hessen',
  'Mecklenburg-Vorpommern',
  'Niedersachsen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Saarland',
  'Sachsen',
  'Sachsen-Anhalt',
  'Schleswig-Holstein',
  'Thüringen',
];

const FAECHER = [
  'Biologie',
  'Chemie',
  'Physik',
  'Mathematik',
  'Deutsch',
  'Englisch',
  'Französisch',
  'Spanisch',
  'Geschichte',
  'Geographie',
  'Politik',
  'Wirtschaft',
  'Informatik',
  'Kunst',
  'Musik',
  'Sport',
  'Religion',
  'Ethik',
  'Philosophie',
];

export const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ 
  initialProfile, 
  userEmail 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: initialProfile?.name || '',
    school: initialProfile?.school || '',
    subjects: initialProfile?.subjects || [],
    bundesland: initialProfile?.bundesland || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // Versuche zuerst, die Antwort als Text zu lesen, dann als JSON
      const text = await response.text();
      console.log('Profil-Update Antwort:', response.status, text);

      if (!response.ok) {
        let errorMessage = `Fehler beim Speichern (Status: ${response.status})`;
        
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Wenn kein JSON, verwende den Text direkt
          if (text) {
            errorMessage = text;
          }
        }
        
        console.error('Profil speichern fehlgeschlagen:', response.status, text);
        setErrorMessage(errorMessage);
        throw new Error(errorMessage);
      }

      // Erfolgreich gespeichert
      setIsEditing(false);
      setErrorMessage(null);
      
      // Optional: Erfolgsmeldung anzeigen
      // alert('Profil erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error saving profile:', error);
      if (!errorMessage) {
        setErrorMessage(error instanceof Error ? error.message : 'Fehler beim Speichern. Bitte versuche es erneut.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Das neue Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Ändern des Passworts');
      }

      alert('Passwort erfolgreich geändert!');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error instanceof Error ? error.message : 'Fehler beim Ändern des Passworts. Bitte versuche es erneut.');
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!emailData.newEmail || !emailData.password) {
      alert('Bitte fülle alle Felder aus.');
      return;
    }

    try {
      const response = await fetch('/api/profile/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          password: emailData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Ändern der E-Mail-Adresse');
      }

      alert(data.message || 'E-Mail-Adresse wurde aktualisiert. Bitte prüfe dein Postfach und bestätige die neue E-Mail-Adresse.');
      setShowEmailForm(false);
      setEmailData({ newEmail: '', password: '' });
      setShowEmailPassword(false);
      
      // Optional: Seite neu laden, um die neue E-Mail anzuzeigen
      // window.location.reload();
    } catch (error) {
      console.error('Error changing email:', error);
      alert(error instanceof Error ? error.message : 'Fehler beim Ändern der E-Mail-Adresse. Bitte versuche es erneut.');
    }
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-gray-900)' }}>Persönliche Informationen</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-link"
            style={{ fontSize: '0.875rem' }}
          >
            ✏️ Bearbeiten
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {errorMessage && (
          <div style={{
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: 'var(--radius-lg)',
            color: '#991b1b',
            fontSize: '0.875rem'
          }}>
            ⚠️ {errorMessage}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {/* Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-gray-700)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: 'var(--radius-lg)',
                  outline: 'none',
                  fontSize: '1rem'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(30, 58, 138, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-gray-300)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Max Mustermann"
              />
            ) : (
              <p style={{ color: 'var(--color-gray-900)', fontSize: '1rem' }}>{formData.name || 'Nicht angegeben'}</p>
            )}
          </div>

          {/* E-Mail */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-gray-700)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              E-Mail
            </label>
            {showEmailForm ? (
              <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <input
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                  placeholder="Neue E-Mail-Adresse"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-lg)',
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                  required
                />
                <div style={{ position: 'relative' }}>
                  <input
                    type={showEmailPassword ? "text" : "password"}
                    value={emailData.password}
                    onChange={(e) => setEmailData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Aktuelles Passwort zur Bestätigung"
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      paddingRight: '48px',
                      border: '1px solid var(--color-gray-300)',
                      borderRadius: 'var(--radius-lg)',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailPassword(!showEmailPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-gray-500)',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-gray-700)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-gray-500)';
                    }}
                    aria-label={showEmailPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                    tabIndex={-1}
                  >
                    {showEmailPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <button type="submit" className="primary-button" style={{ flex: 1 }}>
                    E-Mail ändern
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailForm(false);
                      setEmailData({ newEmail: '', password: '' });
                      setShowEmailPassword(false);
                    }}
                    className="secondary-button"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p style={{ color: 'var(--color-gray-900)', fontSize: '1rem', marginBottom: '4px' }}>{userEmail}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                  E-Mail-Adresse kann nur nach Verifizierung geändert werden.
                </p>
              </>
            )}
          </div>

          {/* Schule */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-gray-700)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              Schule / Institution
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: 'var(--radius-lg)',
                  outline: 'none',
                  fontSize: '1rem'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(30, 58, 138, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-gray-300)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Gymnasium Köln"
              />
            ) : (
              <p style={{ color: 'var(--color-gray-900)', fontSize: '1rem' }}>{formData.school || 'Nicht angegeben'}</p>
            )}
          </div>

          {/* Bundesland */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-gray-700)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              Bundesland
            </label>
            {isEditing ? (
              <select
                value={formData.bundesland}
                onChange={(e) => setFormData(prev => ({ ...prev, bundesland: e.target.value }))}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: 'var(--radius-lg)',
                  outline: 'none',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(30, 58, 138, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-gray-300)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="">Bitte wählen</option>
                {BUNDESLAENDER.map(bundesland => (
                  <option key={bundesland} value={bundesland}>
                    {bundesland}
                  </option>
                ))}
              </select>
            ) : (
              <p style={{ color: 'var(--color-gray-900)', fontSize: '1rem' }}>{formData.bundesland || 'Nicht angegeben'}</p>
            )}
          </div>

          {/* Unterrichtete Fächer */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-gray-700)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              Unterrichtete Fächer
            </label>
            {isEditing ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 'var(--spacing-sm)'
              }}>
                {FAECHER.map(fach => (
                  <label
                    key={fach}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-sm)',
                      padding: 'var(--spacing-sm)',
                      border: '1px solid var(--color-gray-300)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      backgroundColor: formData.subjects.includes(fach) ? 'var(--color-info-light)' : 'white',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!formData.subjects.includes(fach)) {
                        e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!formData.subjects.includes(fach)) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(fach)}
                      onChange={() => toggleSubject(fach)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)' }}>{fach}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                {formData.subjects.length > 0 ? (
                  formData.subjects.map(fach => (
                    <span
                      key={fach}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: 'var(--color-info-light)',
                        color: 'var(--color-primary)',
                        borderRadius: '999px',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      {fach}
                    </span>
                  ))
                ) : (
                  <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>Keine Fächer ausgewählt</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            marginTop: 'var(--spacing-xl)',
            paddingTop: 'var(--spacing-lg)',
            borderTop: '1px solid var(--color-gray-200)'
          }}>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setErrorMessage(null);
                setFormData({
                  name: initialProfile?.name || '',
                  school: initialProfile?.school || '',
                  subjects: initialProfile?.subjects || [],
                  bundesland: initialProfile?.bundesland || '',
                });
              }}
              className="secondary-button"
              disabled={isSaving}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isSaving}
            >
              {isSaving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        )}
      </form>

      {/* Additional Actions */}
      {!isEditing && (
        <div style={{
          marginTop: 'var(--spacing-xl)',
          paddingTop: 'var(--spacing-lg)',
          borderTop: '1px solid var(--color-gray-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)'
        }}>
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="text-link"
              style={{ fontSize: '0.875rem', textAlign: 'left' }}
            >
              🔑 Passwort ändern
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Aktuelles Passwort"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    paddingRight: '48px',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-lg)',
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-gray-500)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-gray-700)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-gray-500)';
                  }}
                  aria-label={showCurrentPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Neues Passwort"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    paddingRight: '48px',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-lg)',
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-gray-500)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-gray-700)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-gray-500)';
                  }}
                  aria-label={showNewPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Neues Passwort bestätigen"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    paddingRight: '48px',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-lg)',
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-gray-500)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-gray-700)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-gray-500)';
                  }}
                  aria-label={showConfirmPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <button type="submit" className="primary-button" style={{ flex: 1 }}>
                  Passwort ändern
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="secondary-button"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}
          
          {!showEmailForm && (
            <button
              onClick={() => setShowEmailForm(true)}
              className="text-link"
              style={{ fontSize: '0.875rem', textAlign: 'left' }}
            >
              ✉️ E-Mail-Adresse ändern
            </button>
          )}
        </div>
      )}
    </div>
  );
};
