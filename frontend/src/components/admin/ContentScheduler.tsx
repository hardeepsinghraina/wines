'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import { Modal } from '../ui/Modal';
import { contentManagementAPI } from '../../lib/content-management-api';
import { ContentSchedule } from '../../../../shared/types/content-management';

interface ContentSchedulerProps {
  className?: string;
}

export const ContentScheduler: React.FC<ContentSchedulerProps> = ({
  className = ''
}) => {
  const [schedules, setSchedules] = useState<ContentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    contentId: '',
    versionId: '',
    scheduledAt: '',
    action: 'publish' as 'publish' | 'unpublish' | 'archive'
  });

  useEffect(() => {
    loadSchedules();
    const interval = setInterval(loadSchedules, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSchedules = async () => {
    try {
      const scheduleList = await contentManagementAPI.getScheduledContent();
      setSchedules(scheduleList);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleContent = async () => {
    try {
      await contentManagementAPI.scheduleContent({
        contentId: scheduleForm.contentId,
        versionId: scheduleForm.versionId,
        scheduledAt: new Date(scheduleForm.scheduledAt),
        action: scheduleForm.action
      });
      setShowScheduleModal(false);
      setScheduleForm({
        contentId: '',
        versionId: '',
        scheduledAt: '',
        action: 'publish'
      });
      loadSchedules();
    } catch (error) {
      console.error('Error scheduling content:', error);
    }
  };

  const handleCancelSchedule = async (scheduleId: string) => {
    if (confirm('Are you sure you want to cancel this scheduled action?')) {
      try {
        await contentManagementAPI.cancelScheduledContent(scheduleId);
        loadSchedules();
      } catch (error) {
        console.error('Error canceling schedule:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'publish': return '🚀';
      case 'unpublish': return '📥';
      case 'archive': return '📦';
      default: return '⏰';
    }
  };

  const isScheduleEditable = (schedule: ContentSchedule) => {
    return schedule.status === 'pending' && new Date(schedule.scheduledAt) > new Date();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={`content-scheduler ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Scheduler</h2>
          <p className="text-gray-600">Schedule content publishing, unpublishing, and archiving</p>
        </div>
        <Button
          onClick={() => setShowScheduleModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          ⏰ Schedule Action
        </Button>
      </div>

      {/* Scheduled Actions */}
      <div className="space-y-6">
        {/* Upcoming Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Actions</h3>
          
          {schedules.filter(s => s.status === 'pending' && new Date(s.scheduledAt) > new Date()).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">⏰</div>
              <p>No upcoming scheduled actions</p>
              <p className="text-sm mt-2">Schedule content actions to automate your workflow</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules
                .filter(s => s.status === 'pending' && new Date(s.scheduledAt) > new Date())
                .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                .map((schedule) => (
                  <div
                    key={schedule.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getActionIcon(schedule.action)}</span>
                        <div>
                          <div className="font-medium text-gray-900 capitalize">
                            {schedule.action} Content
                          </div>
                          <div className="text-sm text-gray-500">
                            Content ID: {schedule.contentId}
                          </div>
                          <div className="text-sm text-gray-500">
                            Scheduled for {new Date(schedule.scheduledAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                          {schedule.status.toUpperCase()}
                        </span>
                        {isScheduleEditable(schedule) && (
                          <Button
                            onClick={() => handleCancelSchedule(schedule.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Time until execution */}
                    <div className="mt-3 text-sm text-gray-600">
                      {(() => {
                        const now = new Date();
                        const scheduled = new Date(schedule.scheduledAt);
                        const diff = scheduled.getTime() - now.getTime();
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        
                        if (hours > 24) {
                          const days = Math.floor(hours / 24);
                          return `Executes in ${days} day${days !== 1 ? 's' : ''}`;
                        } else if (hours > 0) {
                          return `Executes in ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
                        } else {
                          return `Executes in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
                        }
                      })()}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>

        {/* Recent Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Actions</h3>
          
          {schedules.filter(s => s.status !== 'pending' || new Date(s.scheduledAt) <= new Date()).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No recent actions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules
                .filter(s => s.status !== 'pending' || new Date(s.scheduledAt) <= new Date())
                .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
                .slice(0, 10)
                .map((schedule) => (
                  <div
                    key={schedule.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getActionIcon(schedule.action)}</span>
                        <div>
                          <div className="font-medium text-gray-900 capitalize">
                            {schedule.action} Content
                          </div>
                          <div className="text-sm text-gray-500">
                            Content ID: {schedule.contentId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {schedule.status === 'executed' && schedule.executedAt
                              ? `Executed ${new Date(schedule.executedAt).toLocaleString()}`
                              : `Scheduled for ${new Date(schedule.scheduledAt).toLocaleString()}`
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                          {schedule.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Error message for failed actions */}
                    {schedule.status === 'failed' && schedule.error && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-sm text-red-800">
                          <strong>Error:</strong> {schedule.error}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      {/* Schedule Action Modal */}
      {showScheduleModal && (
        <Modal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title="Schedule Content Action"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content ID *
              </label>
              <input
                type="text"
                value={scheduleForm.contentId}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, contentId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter content ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version ID *
              </label>
              <input
                type="text"
                value={scheduleForm.versionId}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, versionId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter version ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action *
              </label>
              <select
                value={scheduleForm.action}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, action: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="publish">Publish</option>
                <option value="unpublish">Unpublish</option>
                <option value="archive">Archive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date & Time *
              </label>
              <input
                type="datetime-local"
                value={scheduleForm.scheduledAt}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().slice(0, 16)}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Schedule must be in the future
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 text-lg">ℹ️</span>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Scheduling Information:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Publish:</strong> Make content live and visible to users</li>
                    <li><strong>Unpublish:</strong> Remove content from public view</li>
                    <li><strong>Archive:</strong> Move content to archived state</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowScheduleModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleScheduleContent}
                disabled={!scheduleForm.contentId || !scheduleForm.versionId || !scheduleForm.scheduledAt}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Schedule Action
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ContentScheduler;