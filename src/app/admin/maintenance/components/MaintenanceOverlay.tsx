'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Construction, Clock, ArrowLeft, Home } from 'lucide-react';
import { PageMaintenanceSettings } from '../types/maintenance.types';
import { Card, Button } from '@/components/ui';

/**
 * Maintenance Overlay Component
 * 
 * Displays a beautiful maintenance page with optional countdown timer.
 * Used by MaintenanceWrapper when a page is in maintenance mode.
 * 
 * Uses fixed positioning with high z-index to cover entire viewport
 * including navigation header.
 * 
 * Uses Rare Canvas UI components for consistency with the design system.
 */

interface MaintenanceOverlayProps {
  pageName: string;
  settings: PageMaintenanceSettings;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Countdown digit box component
function CountdownBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <Card size="sm" className="w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 flex items-center justify-center">
        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary font-mono">
          {value}
        </span>
      </Card>
      <span className="text-xs text-text-muted mt-2">{label}</span>
    </div>
  );
}

export function MaintenanceOverlay({ pageName, settings }: MaintenanceOverlayProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!settings.endTime || !settings.showCountdown) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const endDate = new Date(settings.endTime!);
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [settings.endTime, settings.showCountdown]);

  // If maintenance has expired, trigger a page reload
  useEffect(() => {
    if (isExpired) {
      window.location.reload();
    }
  }, [isExpired]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-base p-4 overflow-auto">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-brand-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-2xl mx-auto py-8">
        {/* Main Card */}
        <Card size="lg" className="text-center p-6 sm:p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-yellow-500/10 flex items-center justify-center border border-orange-500/30">
              <Construction className="w-8 h-8 md:w-10 md:h-10 text-orange-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 md:mb-4">
            {pageName} is Under Maintenance
          </h1>

          {/* Reason */}
          <p className="text-base md:text-lg text-text-secondary mb-6 md:mb-8 max-w-md mx-auto">
            {settings.reason}
          </p>

          {/* Countdown Timer */}
          {timeLeft && settings.showCountdown && (
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-center gap-2 text-sm text-text-muted mb-4">
                <Clock className="w-4 h-4" />
                <span>Expected back online in:</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
                <CountdownBox value={formatNumber(timeLeft.days)} label="Days" />
                <span className="text-xl md:text-2xl text-text-disabled font-bold mb-6">:</span>
                <CountdownBox value={formatNumber(timeLeft.hours)} label="Hours" />
                <span className="text-xl md:text-2xl text-text-disabled font-bold mb-6">:</span>
                <CountdownBox value={formatNumber(timeLeft.minutes)} label="Min" />
                <span className="text-xl md:text-2xl text-text-disabled font-bold mb-6">:</span>
                <CountdownBox value={formatNumber(timeLeft.seconds)} label="Sec" />
              </div>
            </div>
          )}

          {/* No countdown - indefinite maintenance */}
          {(!timeLeft && settings.enabled && !settings.endTime) && (
            <div className="mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Duration to be determined</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/">
              <Button variant="primary" size="md">
                <Home className="w-5 h-5" />
                Go to Homepage
              </Button>
            </Link>
            <Button 
              variant="secondary" 
              size="md"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </Button>
          </div>
        </Card>

        {/* Footer note */}
        <p className="text-center text-sm text-text-disabled mt-6">
          Thank you for your patience. We're working hard to improve your experience.
        </p>
      </div>
    </div>
  );
}
