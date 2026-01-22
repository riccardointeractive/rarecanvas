'use client';

import { ComponentPreview } from '../components/ComponentPreview';
import { RoadmapItem } from '@/components/RoadmapItem';
import { CheckCircle } from 'lucide-react';

export function RoadmapSection() {
  return (
    <div className="space-y-16">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-semibold text-text-primary mb-4">Roadmap</h2>
        <p className="text-lg text-text-secondary max-w-3xl">
          Timeline components for displaying project milestones and progress.
        </p>
      </div>

      {/* RoadmapItem (Timeline) */}
      <section id="roadmap-item" className="scroll-mt-8">
        <div className="bg-bg-surface rounded-2xl border border-border-default p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-text-primary mb-2">RoadmapItem (Timeline)</h3>
            <p className="text-text-secondary mb-4">
              Timeline items for roadmap sections. Supports complete, in-progress, and upcoming states with automatic styling.
            </p>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                  <p className="text-xs text-text-secondary">Uses the actual RoadmapItem component from @/components/RoadmapItem</p>
                </div>
              </div>
            </div>
          </div>

          <ComponentPreview
            title="Status Variants"
            description="Complete, In-Progress, and Upcoming states"
            code={`<RoadmapItem
  title="Q1 2024 - Foundation"
  description="Project architecture designed • Token economics planned"
  quarter="Q1 2024"
  status="complete" // 'complete' | 'in-progress' | 'upcoming'
  isLast={false} // hides connector line if true
/>`}
          >
            <div className="space-y-6">
              <RoadmapItem
                title="Q1 2024 - Foundation"
                description="Project architecture designed • Token economics planned • Design system specifications"
                quarter="Q1 2024"
                status="complete"
              />
              <RoadmapItem
                title="Q2 2025 - In Development"
                description="Currently building new features and improvements • Testing in progress"
                quarter="Q2 2025"
                status="in-progress"
              />
              <RoadmapItem
                title="Q1 2026 - Future Plans"
                description="NFT Marketplace launch • Games Platform release • Ecosystem expansion"
                quarter="Q1 2026"
                status="upcoming"
                isLast
              />
            </div>
          </ComponentPreview>
        </div>
      </section>
    </div>
  );
}
