'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Download, Plus, X, Check, Edit2, Trash2 } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Session {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  attendance: { [participantId: string]: boolean };
}

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<'sessions' | 'participants'>('sessions');
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedParticipants = localStorage.getItem('ngo-participants');
    const savedSessions = localStorage.getItem('ngo-sessions');
    if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
    if (savedSessions) setSessions(JSON.parse(savedSessions));
  }, []);

  // Save participants to localStorage
  useEffect(() => {
    if (participants.length > 0) {
      localStorage.setItem('ngo-participants', JSON.stringify(participants));
    }
  }, [participants]);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('ngo-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const addParticipant = (participant: Omit<Participant, 'id'>) => {
    const newParticipant = { ...participant, id: Date.now().toString() };
    setParticipants([...participants, newParticipant]);
    setShowAddParticipant(false);
  };

  const updateParticipant = (id: string, updatedParticipant: Omit<Participant, 'id'>) => {
    setParticipants(participants.map(p => p.id === id ? { ...updatedParticipant, id } : p));
    setEditingParticipant(null);
  };

  const deleteParticipant = (id: string) => {
    if (confirm('Are you sure you want to delete this participant?')) {
      setParticipants(participants.filter(p => p.id !== id));
    }
  };

  const addSession = (session: Omit<Session, 'id' | 'attendance'>) => {
    const newSession: Session = {
      ...session,
      id: Date.now().toString(),
      attendance: {}
    };
    setSessions([...sessions, newSession]);
    setShowAddSession(false);
  };

  const updateSession = (id: string, updatedSession: Omit<Session, 'id' | 'attendance'>) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, ...updatedSession } : s));
    setEditingSession(null);
  };

  const deleteSession = (id: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      setSessions(sessions.filter(s => s.id !== id));
      if (selectedSession?.id === id) setSelectedSession(null);
    }
  };

  const toggleAttendance = (sessionId: string, participantId: string) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        const newAttendance = { ...session.attendance };
        newAttendance[participantId] = !newAttendance[participantId];
        return { ...session, attendance: newAttendance };
      }
      return session;
    }));
  };

  const exportSessionReport = (session: Session) => {
    const present = participants.filter(p => session.attendance[p.id]);
    const absent = participants.filter(p => !session.attendance[p.id]);

    const report = `
NGO ATTENDANCE REPORT
=====================

Session: ${session.name}
Date: ${session.date}
Time: ${session.startTime} - ${session.endTime}
Location: ${session.location}
${session.description ? `Description: ${session.description}` : ''}

ATTENDANCE SUMMARY
------------------
Total Participants: ${participants.length}
Present: ${present.length}
Absent: ${absent.length}
Attendance Rate: ${participants.length > 0 ? ((present.length / participants.length) * 100).toFixed(1) : 0}%

PRESENT (${present.length})
${present.map(p => `- ${p.name}${p.email ? ` (${p.email})` : ''}${p.phone ? ` - ${p.phone}` : ''}`).join('\n')}

ABSENT (${absent.length})
${absent.map(p => `- ${p.name}${p.email ? ` (${p.email})` : ''}${p.phone ? ` - ${p.phone}` : ''}`).join('\n')}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${session.name.replace(/\s+/g, '-')}-${session.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="text-indigo-600" />
            NGO Attendance Manager
          </h1>
          <p className="text-gray-600 mt-2">Track and manage session-wise attendance for your NGO programs</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'sessions'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar size={20} />
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'participants'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users size={20} />
            Participants
          </button>
        </div>

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Sessions</h2>
                <button
                  onClick={() => setShowAddSession(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={20} />
                  Add Session
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No sessions yet. Create your first session to get started!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sessions.map(session => {
                    const presentCount = Object.values(session.attendance).filter(Boolean).length;
                    const totalCount = participants.length;
                    const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

                    return (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800">{session.name}</h3>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p>📅 {session.date} • ⏰ {session.startTime} - {session.endTime}</p>
                              <p>📍 {session.location}</p>
                              {session.description && <p className="text-gray-500">{session.description}</p>}
                            </div>
                            <div className="mt-3 flex items-center gap-4">
                              <span className="text-sm font-medium text-gray-700">
                                Attendance: {presentCount}/{totalCount} ({attendanceRate.toFixed(0)}%)
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all"
                                  style={{ width: `${attendanceRate}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedSession(session)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Take Attendance"
                            >
                              <Check size={20} />
                            </button>
                            <button
                              onClick={() => setEditingSession(session)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={20} />
                            </button>
                            <button
                              onClick={() => exportSessionReport(session)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Export Report"
                            >
                              <Download size={20} />
                            </button>
                            <button
                              onClick={() => deleteSession(session.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Participants</h2>
              <button
                onClick={() => setShowAddParticipant(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus size={20} />
                Add Participant
              </button>
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No participants yet. Add your first participant to get started!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {participants.map(participant => (
                  <div key={participant.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                    <div>
                      <h3 className="font-semibold text-gray-800">{participant.name}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {participant.email && <p>✉️ {participant.email}</p>}
                        {participant.phone && <p>📱 {participant.phone}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingParticipant(participant)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => deleteParticipant(participant.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Participant Modal */}
        {(showAddParticipant || editingParticipant) && (
          <ParticipantForm
            participant={editingParticipant}
            onSubmit={(data) => {
              if (editingParticipant) {
                updateParticipant(editingParticipant.id, data);
              } else {
                addParticipant(data);
              }
            }}
            onClose={() => {
              setShowAddParticipant(false);
              setEditingParticipant(null);
            }}
          />
        )}

        {/* Add/Edit Session Modal */}
        {(showAddSession || editingSession) && (
          <SessionForm
            session={editingSession}
            onSubmit={(data) => {
              if (editingSession) {
                updateSession(editingSession.id, data);
              } else {
                addSession(data);
              }
            }}
            onClose={() => {
              setShowAddSession(false);
              setEditingSession(null);
            }}
          />
        )}

        {/* Attendance Taking Modal */}
        {selectedSession && (
          <AttendanceModal
            session={selectedSession}
            participants={participants}
            onToggle={(participantId) => toggleAttendance(selectedSession.id, participantId)}
            onClose={() => setSelectedSession(null)}
            onExport={() => exportSessionReport(selectedSession)}
          />
        )}
      </div>
    </div>
  );
}

function ParticipantForm({
  participant,
  onSubmit,
  onClose
}: {
  participant: Participant | null;
  onSubmit: (data: Omit<Participant, 'id'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: participant?.name || '',
    email: participant?.email || '',
    phone: participant?.phone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {participant ? 'Edit Participant' : 'Add Participant'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {participant ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SessionForm({
  session,
  onSubmit,
  onClose
}: {
  session: Session | null;
  onSubmit: (data: Omit<Session, 'id' | 'attendance'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: session?.name || '',
    date: session?.date || new Date().toISOString().split('T')[0],
    startTime: session?.startTime || '09:00',
    endTime: session?.endTime || '10:00',
    location: session?.location || '',
    description: session?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.location.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {session ? 'Edit Session' : 'Add Session'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {session ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AttendanceModal({
  session,
  participants,
  onToggle,
  onClose,
  onExport,
}: {
  session: Session;
  participants: Participant[];
  onToggle: (participantId: string) => void;
  onClose: () => void;
  onExport: () => void;
}) {
  const presentCount = Object.values(session.attendance).filter(Boolean).length;
  const totalCount = participants.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{session.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {session.date} • {session.startTime} - {session.endTime}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-4">
            <div>
              <p className="text-sm text-gray-600">Attendance</p>
              <p className="text-2xl font-bold text-indigo-600">
                {presentCount} / {totalCount}
              </p>
            </div>
            <button
              onClick={onExport}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {participants.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>No participants available. Add participants first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {participants.map(participant => {
                const isPresent = session.attendance[participant.id] || false;
                return (
                  <button
                    key={participant.id}
                    onClick={() => onToggle(participant.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isPresent
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{participant.name}</h4>
                        {(participant.email || participant.phone) && (
                          <p className="text-sm text-gray-600 mt-1">
                            {participant.email && `${participant.email}`}
                            {participant.email && participant.phone && ' • '}
                            {participant.phone && `${participant.phone}`}
                          </p>
                        )}
                      </div>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        isPresent ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isPresent && <Check size={20} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
