import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import ChartCard from '../../components/ChartCard/ChartCard';
import styles from './Settings.module.css';
import { useAuth } from '../../context/AuthContext';
import { MdSave, MdSecurity, MdNotifications, MdPerson, MdTune } from 'react-icons/md';

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    aiSensitivity: 'medium',
    faceConfidence: 75,
    micThreshold: 60,
    recordingQuality: '1080p',
    emailNotifications: true,
    alertNotifications: true,
    theme: 'dark',
  });

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  return (
    <>
      <Navbar title="Settings" />
      <main className="page-body">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure ExamLens platform preferences and AI thresholds</p>
        </div>

        <div className={styles.grid}>
          {/* AI Settings */}
          <ChartCard title={<span style={{ display:'flex', alignItems:'center', gap:'.5rem' }}><MdTune />AI Proctoring Settings</span>}>
            <div className={styles.settingGroup}>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>AI Sensitivity</div>
                  <div className={styles.settingDesc}>Higher sensitivity detects more events</div>
                </div>
                <div className={styles.radioGroup}>
                  {['low','medium','high'].map(v => (
                    <button
                      key={v}
                      className={`${styles.radioBtn} ${settings.aiSensitivity === v ? styles.radioActive : ''}`}
                      onClick={() => update('aiSensitivity', v)}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>Face Confidence Threshold</div>
                  <div className={styles.settingDesc}>Minimum confidence to verify identity</div>
                </div>
                <div className={styles.sliderWrap}>
                  <input
                    type="range" min={50} max={99} value={settings.faceConfidence}
                    onChange={e => update('faceConfidence', +e.target.value)}
                    className={styles.slider}
                  />
                  <span className={styles.sliderVal}>{settings.faceConfidence}%</span>
                </div>
              </div>

              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>Mic Noise Threshold</div>
                  <div className={styles.settingDesc}>Sensitivity for background noise detection</div>
                </div>
                <div className={styles.sliderWrap}>
                  <input
                    type="range" min={20} max={100} value={settings.micThreshold}
                    onChange={e => update('micThreshold', +e.target.value)}
                    className={styles.slider}
                  />
                  <span className={styles.sliderVal}>{settings.micThreshold}%</span>
                </div>
              </div>

              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>Recording Quality</div>
                  <div className={styles.settingDesc}>Session recording resolution</div>
                </div>
                <select
                  className={styles.select}
                  value={settings.recordingQuality}
                  onChange={e => update('recordingQuality', e.target.value)}
                >
                  <option value="720p">720p HD</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="480p">480p (Low Bandwidth)</option>
                </select>
              </div>
            </div>
          </ChartCard>

          {/* Notifications */}
          <ChartCard title={<span style={{ display:'flex', alignItems:'center', gap:'.5rem' }}><MdNotifications />Notifications</span>}>
            <div className={styles.settingGroup}>
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive exam reports via email' },
                { key: 'alertNotifications', label: 'Alert Notifications', desc: 'Get notified of AI alerts in real-time' },
              ].map(({ key, label, desc }) => (
                <div key={key} className={styles.settingRow}>
                  <div>
                    <div className={styles.settingLabel}>{label}</div>
                    <div className={styles.settingDesc}>{desc}</div>
                  </div>
                  <button
                    className={`${styles.toggle} ${settings[key] ? styles.toggleOn : ''}`}
                    onClick={() => update(key, !settings[key])}
                  >
                    <span className={styles.toggleKnob} />
                  </button>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Admin Profile */}
          <ChartCard title={<span style={{ display:'flex', alignItems:'center', gap:'.5rem' }}><MdPerson />Admin Profile</span>}>
            <div className={styles.profileForm}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" defaultValue={user?.name} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" defaultValue={user?.email} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" defaultValue={user?.department} />
              </div>
              <button className="btn btn-primary">
                <MdSave /> Save Changes
              </button>
            </div>
          </ChartCard>

          {/* Security */}
          <ChartCard title={<span style={{ display:'flex', alignItems:'center', gap:'.5rem' }}><MdSecurity />Security</span>}>
            <div className={styles.profileForm}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" placeholder="••••••••" />
              </div>
              <button className="btn btn-secondary">
                <MdSave /> Update Password
              </button>
            </div>
          </ChartCard>
        </div>
      </main>
    </>
  );
}
