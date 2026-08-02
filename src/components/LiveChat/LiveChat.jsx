import { useState } from 'react';
import styles from './LiveChat.module.css';
import { MdSend, MdWarning, MdPerson } from 'react-icons/md';

const QUICK_TEMPLATES = [
  '⚠ Please look at the screen.',
  '📷 Enable your webcam.',
  '🔊 Reduce background noise.',
  '📵 No mobile phones allowed.',
  '👁 Keep your face visible at all times.',
];

const INITIAL_MESSAGES = [
  { id: 1, from: 'admin', text: 'Exam has started. Good luck!', time: '14:00' },
];

export default function LiveChat({ studentName = 'Candidate' }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const send = (text) => {
    if (!text.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now(), from: 'admin', text: text.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setInput('');
  };

  return (
    <div className={styles.chat}>
      <div className={styles.header}>
        <MdPerson className={styles.headerIcon} />
        <span>{studentName}</span>
        <span className={styles.onlineDot} />
      </div>

      <div className={styles.messages}>
        {messages.map(m => (
          <div key={m.id} className={`${styles.msg} ${m.from === 'admin' ? styles.adminMsg : styles.studentMsg}`}>
            <div className={styles.msgBubble}>{m.text}</div>
            <div className={styles.msgTime}>{m.time}</div>
          </div>
        ))}
      </div>

      {/* Quick templates */}
      <div className={styles.templates}>
        {QUICK_TEMPLATES.map(t => (
          <button key={t} className={styles.templateBtn} onClick={() => send(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Send a message..."
          onKeyDown={e => e.key === 'Enter' && send(input)}
        />
        <button className={styles.sendBtn} onClick={() => send(input)}>
          <MdSend />
        </button>
        <button className={`${styles.warnBtn}`} onClick={() => send('⚠ OFFICIAL WARNING: Suspicious activity detected.')}>
          <MdWarning />
        </button>
      </div>
    </div>
  );
}
