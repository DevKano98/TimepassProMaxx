import React from 'react';
import { Map, Cpu, BellRing } from 'lucide-react';
import { BadgePill } from '../common/BadgePill';

const FEATURES = [
  {
    tag: 'SPATIAL INTELLIGENCE',
    title: 'Real-Time Hazard Map',
    description:
      'Interactive street-level heatmaps pinpoint active hazards, road closures, and municipal repair work zones with second-by-second updates.',
    icon: <Map className="w-6 h-6 text-primary" />,
    stat: '2.4s',
    statLabel: 'Avg pin latency',
  },
  {
    tag: 'COMPUTER VISION',
    title: 'AI Detection with Confidence Score',
    description:
      'Deep multimodal neural networks automatically classify road hazards, estimate damage dimensions, and rank urgency scores from 0 to 100%.',
    icon: <Cpu className="w-6 h-6 text-primary" />,
    stat: '96.8%',
    statLabel: 'Classification accuracy',
  },
  {
    tag: 'CIVIL PROTECTION',
    title: 'Critical Safety Alerts',
    description:
      'Hyper-local push alerts notify commuters of sudden flash floods, exposed live wires, or active construction diversions in their immediate radius.',
    icon: <BellRing className="w-6 h-6 text-severity-high" />,
    stat: '<100m',
    statLabel: 'Geo-fence precision',
  },
];

export const FeatureHighlights: React.FC = () => {
  return (
    <section id="features" className="w-full bg-surface-soft py-24 border-b border-hairline">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <BadgePill label="ENGINEERED FOR RESILIENCE" variant="neutral" className="mb-4" />
          <h2 className="type-display-lg text-ink max-w-2xl">
            Built for modern smart cities and vigilant citizens.
          </h2>
          <p className="type-body-md text-muted max-w-xl mt-4">
            Industrial reliability meets citizen-grade simplicity to keep urban corridors safe, clean, and connected.
          </p>
        </div>

        {/* 3-Up Feature Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="bg-canvas border border-hairline rounded-xl p-8 flex flex-col justify-between hover:border-hairline/80 hover:shadow-card-hover transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-full bg-surface-strong flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <BadgePill label={feat.tag} variant="neutral" className="text-[10px]" />
                </div>
                <h3 className="type-title-md text-ink mb-3">{feat.title}</h3>
                <p className="type-body-md text-body leading-relaxed mb-6">
                  {feat.description}
                </p>
              </div>

              {/* Numerical Metric Callout */}
              <div className="pt-6 border-t border-hairline flex items-baseline justify-between">
                <span className="type-caption text-muted">{feat.statLabel}</span>
                <span className="type-number-display text-ink font-bold">{feat.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
