'use client';

import React, { useState, useEffect } from 'react';
import { AffiliateProgram, AffiliateStats } from '../../types/affiliate';
import { affiliateApi } from '../../lib/affiliate-api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';

export const AffiliateDashboard: React.FC = () => {
  const [program, setProgram] = useState<AffiliateProgram | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      setLoading(true);
      const [programData, statsData] = await Promise.all([
        affiliateApi.getAffiliateProgram().catch(() => null),
        affiliateApi.getAffiliateStats().catch(() => null)
      ]);
      
      setProgram(programData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load affiliate data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async () => {
    try {
      setCreating(true);
      const newProgram = await affiliateApi.createAffiliateProgram();
      setProgram(newProgram);
      await fetchAffiliateData(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create affiliate program');
    } finally {
      setCreating(false);
    }
  };

  const copyAffiliateLink = () => {
    if (program) {
      const link = `${window.location.origin}?ref=${program.affiliateCode}`;
      navigator.clipboard.writeText(link);
      // You could add a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-champagne-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-champagne-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-charcoal-black mb-2">Join Our Affiliate Program</h2>
          <p className="text-gray-600 mb-6">
            Earn commissions by referring customers to our luxury wine collection. 
            Get started today and start earning from your referrals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-champagne-gold mb-2">5%</div>
            <div className="text-sm text-gray-600">Commission Rate</div>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-champagne-gold mb-2">30 Days</div>
            <div className="text-sm text-gray-600">Cookie Duration</div>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-champagne-gold mb-2">$0</div>
            <div className="text-sm text-gray-600">Minimum Payout</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <Button 
          onClick={handleCreateProgram} 
          disabled={creating}
          className="w-full md:w-auto"
        >
          {creating ? <Loading size="sm" /> : 'Join Affiliate Program'}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-black">Affiliate Dashboard</h1>
          <p className="text-gray-600">Track your referrals and earnings</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Your Affiliate Code</div>
          <div className="text-lg font-mono font-bold text-champagne-gold">{program.affiliateCode}</div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold text-champagne-gold">
                  ${stats.totalEarnings.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Referrals</p>
                <p className="text-2xl font-bold text-charcoal-black">{stats.totalReferrals}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <p className="text-2xl font-bold text-charcoal-black">
                  {stats.conversionRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-charcoal-black">
                  ${stats.thisMonthEarnings.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Affiliate Link */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Your Affiliate Link</h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={`${window.location.origin}?ref=${program.affiliateCode}`}
            readOnly
            className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
          />
          <Button onClick={copyAffiliateLink} variant="outline">
            Copy Link
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Share this link to earn {program.commissionRate}% commission on all sales from your referrals.
        </p>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-charcoal-black mb-4">Marketing Materials</h3>
          <p className="text-gray-600 mb-4">
            Download banners, product images, and promotional content to help you promote our wines.
          </p>
          <Button variant="outline" className="w-full">
            Download Materials
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-charcoal-black mb-4">Payment Information</h3>
          <p className="text-gray-600 mb-4">
            Update your payment details to receive your affiliate commissions.
          </p>
          <Button variant="outline" className="w-full">
            Update Payment Info
          </Button>
        </Card>
      </div>
    </div>
  );
};