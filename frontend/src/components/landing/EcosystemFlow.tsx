import React from 'react';
import { BadgePill } from '../common/BadgePill';
import {
  Smartphone,
  Cpu,
  LayoutDashboard,
  Truck,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';

const ECOSYSTEM_NODES = [
  {
    step: '01',
    role: 'CITIZEN APPS',
    title: 'Citizen Smartphone',
    detail: 'Android app captures hazard with sub-meter GPS and offline queueing.',
    icon: <Smartphone className="w-6 h-6 text-primary" />,
    badge: 'KOTLIN CLIENT',
  },
  {
    step: '02',
    role: 'NEURAL CLOUD',
    title: 'Multimodal Vision AI',
    detail: 'Automated 98% hazard classification, depth analysis, and duplicate suppression.',
    icon: <Cpu className="w-6 h-6 text-primary" />,
    badge: '300ms INFERENCE',
  },
  {
    step: '03',
    role: 'MUNICIPAL COMMAND',
    title: 'Central Control Deck',
    detail: 'City officials verify work orders and assign jurisdiction with one click.',
    icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
    badge: 'DISPATCH HUB',
  },
  {
    step: '04',
    role: 'FIELD FORCES',
    title: 'Mobile Field Squads',
    detail: 'Field crews navigate turn-by-turn and advance ticket status on mobile.',
    icon: <Truck className="w-6 h-6 text-primary" />,
    badge: 'MOBILE-FIRST',
  },
  {
    step: '05',
    role: 'TRANSPARENCY',
    title: 'Audited Proof of Work',
    detail: 'Citizens and municipal directors receive verified before/after repair proof.',
    icon: <CheckCircle2 className="w-6 h-6 text-semantic-up" />,
    badge: 'PUBLIC AUDIT',
  },
];

export const EcosystemFlow: React.FC = () => {
  return (
    <section className="w-full bg-surface-soft py-24 px-6 border-b border-hairline">
      <div className="max-w-[1200px] mx-auto text-center">
        <BadgePill label="CONNECTED CIVIC INFRASTRUCTURE" variant="neutral" className="mb-4" />
        <h2 className="type-display-lg text-ink max-w-2xl mx-auto">
          The complete municipal response ecosystem.
        </h2>
        <p className="type-body-md text-muted max-w-xl mx-auto mt-4 mb-16">
          Every report travels through an end-to-end pipeline that synchronizes citizens, AI vision models, control rooms, and field crews seamlessly.
        </p>

        {/* 5-Node Interactive Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {ECOSYSTEM_NODES.map((node, i) => (
            <div
              key={node.step}
              className="bg-canvas border border-hairline rounded-xl p-6 text-left flex flex-col justify-between hover:border-hairline/80 hover:shadow-card-hover transition-all duration-200 group relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-surface-strong flex items-center justify-center group-hover:scale-110 transition-transform">
                    {node.icon}
                  </div>
                  <span className="font-mono text-[14px] font-bold text-muted-soft">
                    {node.step}
                  </span>
                </div>

                <BadgePill label={node.badge} variant="outline" className="text-[9px] mb-2" />
                <h4 className="font-bold text-ink text-[16px] mb-2">{node.title}</h4>
                <p className="text-[13px] text-body leading-relaxed">{node.detail}</p>
              </div>

              {i < ECOSYSTEM_NODES.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-muted">
                  <ArrowRight className="w-4 h-4 text-muted-soft" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
