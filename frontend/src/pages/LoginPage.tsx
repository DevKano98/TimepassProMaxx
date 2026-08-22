import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { TextInput } from '../components/common/TextInput';
import { Button } from '../components/common/Button';

const DEMO_PRESETS = [
  { role: 'admin', label: 'Admin Director', email: 'admin@civicguard.gov' },
  { role: 'control_room', label: 'Control Room', email: 'control@civicguard.gov' },
  { role: 'department_officer', label: 'Roads Officer', email: 'roads.officer@civicguard.gov' },
  { role: 'field_team', label: 'Field Crew', email: 'field1@civicguard.gov' },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@civicguard.gov');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, enterGuestMode } = useAuth();
  const navigate = useNavigate();

  const handleContinueAsGuest = () => {
    enterGuestMode();
    navigate('/governmentdashboard/home');
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    if (!email) {
      setError('Please enter your authorized email address.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'field_team') {
        navigate('/governmentdashboard/field');
      } else {
        navigate('/governmentdashboard/home');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-surface-soft text-ink flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted hover:text-ink text-[14px] font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Public Landing Page</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-semantic-up animate-pulse" />
          <span className="text-[12px] font-mono text-muted uppercase">Municipal Gateway</span>
        </div>
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-4">
        <div className="bg-canvas border border-hairline rounded-2xl p-6 sm:p-8 shadow-soft">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-on-primary mb-3 shadow-soft">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="type-title-lg text-ink font-semibold">Government Sign In</h1>
            <p className="type-body-sm text-muted mt-1">
              Command triage & field dispatch operations
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-semantic-down/10 border border-semantic-down/20 rounded-lg text-semantic-down text-[13px] flex items-start gap-2">
              <Lock className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <TextInput
              label="Staff Email"
              type="email"
              placeholder="officer@civicguard.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <TextInput
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="w-full mt-2 h-11 text-[15px]"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </Button>

            <div className="relative my-1 flex items-center justify-center">
              <div className="border-t border-hairline w-full" />
              <span className="bg-canvas px-3 text-[11px] font-mono text-muted uppercase tracking-wider shrink-0">
                Or explore without login
              </span>
            </div>

            <Button
              type="button"
              variant="secondary-light"
              onClick={handleContinueAsGuest}
              className="w-full h-10 text-[14px] font-medium"
            >
              Continue as Guest (Demo Mode)
            </Button>
          </form>


          {/* Quick Demo Role Selector */}
          <div className="mt-6 pt-5 border-t border-hairline">
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider block mb-2.5 font-semibold">
              Select Demo Role
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_PRESETS.map((p) => {
                const isSelected = email === p.email;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => selectPreset(p.email)}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-hairline hover:bg-surface-soft text-body'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold truncate">{p.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />}
                    </div>
                    <span className="text-[10px] font-mono text-muted block truncate">
                      {p.email}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[12px] text-muted py-2">
        <span>© {new Date().getFullYear()} CivicGuard Municipal Command Suite</span>
      </div>
    </div>
  );
};
