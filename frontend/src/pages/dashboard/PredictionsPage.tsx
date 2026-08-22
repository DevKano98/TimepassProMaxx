import React, { useState, useEffect } from 'react';
import { RiskPrediction } from '../../types';
import { getPredictionsApi } from '../../api/endpoints';
import { BadgePill } from '../../components/common/BadgePill';
import { Button } from '../../components/common/Button';
import { TrendingUp, CloudRain, Clock, AlertTriangle, ShieldCheck, RefreshCw, Zap } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { guestStore } from '../../api/seedData';

export const PredictionsPage: React.FC = () => {
  const { isGuestMode } = useAuth();
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPredictions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isGuestMode) {
        setPredictions(guestStore.predictions);
      } else {
        const data = await getPredictionsApi();
        setPredictions(data);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load predictions from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, [isGuestMode]);


  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="type-title-lg text-ink font-semibold">Predictive Risk Hotspots</h1>
            <BadgePill label="PRE-EMPTIVE AI" variant="neutral" dot />
          </div>
          <p className="type-body-sm text-muted mt-1">
            Machine learning forecast correlating real-time meteorology, historical failure indices, and traffic stress
          </p>
        </div>

        <Button
          variant="secondary-light"
          onClick={loadPredictions}
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          className="h-10 text-[13px]"
        >
          Recalculate Models
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-semantic-down/10 border border-semantic-down/30 rounded-xl text-semantic-down text-[13px] flex items-center justify-between gap-3">
          <span>{error}</span>
          <Button variant="secondary-light" onClick={loadPredictions} className="h-8 text-[12px]">
            Retry
          </Button>
        </div>
      )}

      {/* Predictive List */}

      <div className="bg-canvas border border-hairline rounded-xl overflow-hidden shadow-soft">
        <div className="bg-surface-soft px-6 py-3 border-b border-hairline flex items-center justify-between text-[12px] font-semibold text-muted uppercase tracking-wider">
          <span>Ward & Hazard Vulnerability</span>
          <div className="flex items-center gap-12">
            <span className="hidden md:inline">Forecast Window & Weather Correlation</span>
            <span>Risk Score & Urgency</span>
          </div>
        </div>

        <div className="divide-y divide-hairline">
          {predictions.map((p) => (
            <div
              key={p.id}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-soft/50 transition-colors"
            >
              {/* Left: Ward & Risk Factor */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center text-primary shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink text-[16px]">{p.area_name}</h3>
                    <BadgePill label={p.ward} variant="outline" className="text-[11px]" />
                  </div>
                  <p className="text-body font-medium text-[14px] mt-1">{p.risk_type}</p>
                  <p className="text-muted text-[13px] mt-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span><strong>Action:</strong> {p.recommended_action}</span>
                  </p>
                </div>
              </div>

              {/* Right: Score in Mono & Forecast Horizon */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-hairline-soft">
                <div className="text-left md:text-right text-[13px]">
                  <span className="text-muted flex items-center gap-1 md:justify-end font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{p.forecast_time}</span>
                  </span>
                  <span className="text-[12px] text-muted-soft block truncate max-w-xs mt-0.5">
                    {p.weather_factor}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono text-[22px] font-bold text-ink">
                      {p.risk_score}%
                    </span>
                    <span className="type-caption text-muted block text-[11px]">Vulnerability</span>
                  </div>
                  <BadgePill severity={p.risk_level} label={p.risk_level} dot />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
