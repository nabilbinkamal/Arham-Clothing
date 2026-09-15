import React from 'react';

const ToggleSwitch = ({ checked, onChange, label, disabled = false }) => (
  <button
    type="button"
    className={`modern-switch ${checked ? 'is-on' : ''}`}
    role="switch"
    aria-checked={checked}
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
  >
    <span className="modern-switch-track"><span className="modern-switch-thumb" /></span>
    <span className="modern-switch-label">{checked ? 'Enabled' : 'Disabled'}</span>
  </button>
);

export default ToggleSwitch;
