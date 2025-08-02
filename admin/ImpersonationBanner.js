import React from 'react';

export default function ImpersonationBanner({ user, onExit }) {
  return (
    <div style={{ background: 'orange', padding: '10px', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
      You are impersonating: <b>{user.name}</b>
      <button style={{ marginLeft: '20px', padding: '5px 10px', cursor: 'pointer' }} onClick={onExit}>Exit Impersonation</button>
    </div>
  );
}