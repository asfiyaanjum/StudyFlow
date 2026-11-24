import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { Subject, SyllabusUnit, SyllabusTopic } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Checkbox } from '../../components/ui/Checkbox';
import { EmptyState } from '../../components/ui/EmptyState';

export const SubjectsPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [syllabusUnits, setSyllabusUnits] = useState<SyllabusUnit[]>([]);
  const [loading, setLoading] = useState(true);

  // Subject Modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectColor, setSubjectColor] = useState('#6366f1');
  const [creditHours, setCreditHours] = useState(3);
  const [instructor, setInstructor] = useState('');

  // Unit Modal
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<SyllabusUnit | null>(null);
  const [unitTitle, setUnitTitle] = useState('');
  const [unitNumber, setUnitNumber] = useState(1);
  const [unitDescription, setUnitDescription] = useState('');

  // Topic Modal
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<SyllabusTopic | null>(null);
  const [targetUnitId, setTargetUnitId] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicEstMinutes, setTopicEstMinutes] = useState(45);

  // Open unit accordions
  const [expandedUnitIds, setExpandedUnitIds] = useState<Set<string>>(new Set());

  const loadData = async () => {
    try {
      setLoading(true);
      const subs = await api.subjects.getSubjects();
      setSubjects(subs);
      if (subs.length > 0) {
        const active = selectedSubject ? subs.find((s) => s.id === selectedSubject.id) || subs[0] : subs[0];
        setSelectedSubject(active);
        const units = await api.syllabus.getUnits(active.id);
        setSyllabusUnits(units);
        setExpandedUnitIds(new Set(units.map((u: SyllabusUnit) => u.id)));
      } else {
        setSelectedSubject(null);
        setSyllabusUnits([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectSubject = async (sub: Subject) => {
    setSelectedSubject(sub);
    try {
      const units = await api.syllabus.getUnits(sub.id);
      setSyllabusUnits(units);
      setExpandedUnitIds(new Set(units.map((u: SyllabusUnit) => u.id)));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleUnitAccordion = (unitId: string) => {
    setExpandedUnitIds((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  // Helpers to open modals in create vs edit mode
  const openCreateSubject = () => {
    setEditingSubject(null);
    setSubjectName('');
    setSubjectCode('');
    setSubjectColor('#6366f1');
    setCreditHours(3);
    setInstructor('');
    setIsSubjectModalOpen(true);
  };

  const openEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectName(sub.name);
    setSubjectCode(sub.code || '');
    setSubjectColor(sub.color || '#6366f1');
    setCreditHours(sub.credit_hours || 3);
    setInstructor(sub.instructor || '');
    setIsSubjectModalOpen(true);
  };

  const openCreateUnit = () => {
    setEditingUnit(null);
    setUnitTitle('');
    setUnitNumber(syllabusUnits.length + 1);
    setUnitDescription('');
    setIsUnitModalOpen(true);
  };

  const openEditUnit = (unit: SyllabusUnit) => {
    setEditingUnit(unit);
    setUnitTitle(unit.title);
    setUnitNumber(unit.unit_number);
    setUnitDescription(unit.description || '');
    setIsUnitModalOpen(true);
  };

  const openCreateTopic = (unitId: string) => {
    setEditingTopic(null);
    setTargetUnitId(unitId);
    setTopicTitle('');
    setTopicEstMinutes(45);
    setIsTopicModalOpen(true);
  };

  const openEditTopic = (unitId: string, topic: SyllabusTopic) => {
    setEditingTopic(topic);
    setTargetUnitId(unitId);
    setTopicTitle(topic.title);
    setTopicEstMinutes(topic.estimated_minutes || 45);
    setIsTopicModalOpen(true);
  };

  // Create / Update Subject
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    try {
      if (editingSubject) {
        const updated = await api.subjects.updateSubject(editingSubject.id, {
          name: subjectName,
          code: subjectCode,
          color: subjectColor,
          credit_hours: Number(creditHours),
          instructor,
        });
        success('Subject Updated', `Updated ${subjectName}.`);
        setIsSubjectModalOpen(false);
        setEditingSubject(null);
        await loadData();
        handleSelectSubject(updated);
      } else {
        const created = await api.subjects.createSubject({
          user_id: 'user',
          name: subjectName,
          code: subjectCode,
          color: subjectColor,
          credit_hours: Number(creditHours),
          instructor,
        });
        success('Subject Created', `Added ${subjectName} to your curriculum.`);
        setIsSubjectModalOpen(false);
        setSubjectName('');
        setSubjectCode('');
        await loadData();
        handleSelectSubject(created);
      }
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!window.confirm('Delete this subject and all its syllabus units?')) return;
    try {
      await api.subjects.deleteSubject(subjectId);
      success('Subject Deleted', 'Removed from curriculum.');
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Create / Update Unit
  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !unitTitle.trim()) return;

    try {
      if (editingUnit) {
        await api.syllabus.updateUnit(editingUnit.id, {
          title: unitTitle,
          unit_number: Number(unitNumber),
          description: unitDescription,
        });
        success('Unit Updated', `Unit ${unitNumber} updated.`);
        setIsUnitModalOpen(false);
        setEditingUnit(null);
      } else {
        await api.syllabus.createUnit({
          user_id: 'user',
          subject_id: selectedSubject.id,
          title: unitTitle,
          unit_number: Number(unitNumber),
          description: unitDescription,
        });
        success('Unit Added', `Unit ${unitNumber} added to ${selectedSubject.name}.`);
        setIsUnitModalOpen(false);
      }
      setUnitTitle('');
      setUnitDescription('');
      const updated = await api.syllabus.getUnits(selectedSubject.id);
      setSyllabusUnits(updated);
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!window.confirm('Delete this unit?')) return;
    try {
      await api.syllabus.deleteUnit(unitId);
      setSyllabusUnits((prev) => prev.filter((u) => u.id !== unitId));
      success('Unit Deleted', 'Unit removed.');
    } catch (e) {
      console.error(e);
    }
  };

  // Create / Update Topic
  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUnitId || !topicTitle.trim()) return;

    try {
      if (editingTopic) {
        await api.syllabus.updateTopic(editingTopic.id, {
          title: topicTitle,
          estimated_minutes: Number(topicEstMinutes),
        });
        success('Topic Updated', `Updated "${topicTitle}".`);
        setIsTopicModalOpen(false);
        setEditingTopic(null);
      } else {
        await api.syllabus.createTopic({
          user_id: 'user',
          unit_id: targetUnitId,
          title: topicTitle,
          estimated_minutes: Number(topicEstMinutes),
          is_completed: false,
        });
        success('Topic Added', `Added "${topicTitle}".`);
        setIsTopicModalOpen(false);
      }
      setTopicTitle('');
      if (selectedSubject) {
        const updated = await api.syllabus.getUnits(selectedSubject.id);
        setSyllabusUnits(updated);
      }
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  const handleToggleTopic = async (topicId: string) => {
    try {
      const updated = await api.syllabus.toggleTopic(topicId);
      setSyllabusUnits((prev) =>
        prev.map((unit) => ({
          ...unit,
          topics: unit.topics?.map((t) => (t.id === topicId ? updated : t)),
        }))
      );
      if (updated.is_completed) {
        success('Topic Mastered', `Mastered "${updated.title}"!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await api.syllabus.deleteTopic(topicId);
      setSyllabusUnits((prev) =>
        prev.map((unit) => ({
          ...unit,
          topics: unit.topics?.filter((t) => t.id !== topicId),
        }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-border dark:border-slate-800 pb-5">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-charcoal-primary dark:text-white tracking-tight">
            Subjects & Syllabus Mastery
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-0.5">
            Organize course units, track discrete topics, and monitor exam readiness.
          </p>
        </div>
        <Button onClick={openCreateSubject} leftIcon={<Plus size={16} />}>
          Add Subject
        </Button>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No enrolled subjects yet"
          subtitle="Add your course subjects (e.g. Algorithms, Linear Algebra) to begin mapping syllabus units."
          action={
            <Button size="sm" onClick={openCreateSubject}>
              + Add First Subject
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Subjects Grid */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-light dark:text-slate-400 px-1">
              Enrolled Courses ({subjects.length})
            </h3>

            <div className="space-y-2.5">
              {subjects.map((sub) => {
                const isSelected = selectedSubject?.id === sub.id;
                const progress = sub.progress_percentage || 0;

                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSubject(sub)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-brand-500 shadow-card ring-2 ring-brand-500/20'
                        : 'bg-white dark:bg-slate-900 border-paper-border dark:border-slate-800 shadow-xs hover:border-paper-border/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span className="font-semibold text-xs sm:text-sm text-charcoal-primary dark:text-white">
                          {sub.name}
                        </span>
                      </div>
                      {sub.code && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-paper-canvas dark:bg-slate-800 text-charcoal-muted dark:text-slate-400">
                          {sub.code}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] text-charcoal-muted dark:text-slate-400">
                        <span>{sub.completed_topics_count || 0} / {sub.topics_count || 0} Topics</span>
                        <span className="font-semibold text-brand-600 dark:text-brand-400">{progress}%</span>
                      </div>
                      <ProgressBar value={progress} size="xs" variant="brand" />
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-paper-border dark:border-slate-800/80 flex justify-between items-center text-[11px] text-charcoal-light dark:text-slate-400">
                      <span>{sub.credit_hours ? `${sub.credit_hours} Credits` : '3 Credits'}</span>
                      {sub.instructor && <span>Prof. {sub.instructor}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Syllabus Units & Topics for Selected Subject */}
          <div className="lg:col-span-2 space-y-4">
            {selectedSubject && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: selectedSubject.color }}
                    />
                    <h2 className="font-editorial text-2xl font-medium text-charcoal-primary dark:text-white">
                      {selectedSubject.name}
                    </h2>
                    {selectedSubject.code && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-paper-canvas dark:bg-slate-800 text-charcoal-muted">
                        {selectedSubject.code}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-muted dark:text-slate-400">
                    {syllabusUnits.length} syllabus units defined • {selectedSubject.credit_hours || 3} credit hours
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={openCreateUnit}
                    leftIcon={<Plus size={14} />}
                  >
                    Add Unit
                  </Button>
                  <button
                    type="button"
                    onClick={() => openEditSubject(selectedSubject)}
                    className="p-2 text-charcoal-light hover:text-charcoal-primary dark:hover:text-white rounded-xl hover:bg-paper-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Subject"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(selectedSubject.id)}
                    className="p-2 text-charcoal-light hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Subject"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Units List */}
            {syllabusUnits.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-paper-border dark:border-slate-800 text-center space-y-3">
                <Layers className="w-8 h-8 mx-auto text-charcoal-light" />
                <h4 className="text-sm font-semibold text-charcoal-primary dark:text-white">
                  No syllabus units created
                </h4>
                <p className="text-xs text-charcoal-muted dark:text-slate-400 max-w-sm mx-auto">
                  Add units (e.g., Unit 1: Memory Management) to start breaking down your semester exam prep.
                </p>
                <Button size="sm" onClick={() => setIsUnitModalOpen(true)}>
                  + Add Unit
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {syllabusUnits.map((unit) => {
                  const isExpanded = expandedUnitIds.has(unit.id);
                  const topics = unit.topics || [];
                  const completedCount = topics.filter((t) => t.is_completed).length;
                  const unitProgress = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

                  return (
                    <div
                      key={unit.id}
                      className="rounded-2xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 shadow-xs overflow-hidden"
                    >
                      {/* Unit Header Accordion Toggle */}
                      <div
                        onClick={() => toggleUnitAccordion(unit.id)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-paper-canvas/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="text-charcoal-light hover:text-charcoal-primary"
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                                Unit {unit.unit_number}
                              </span>
                              <span className="font-semibold text-sm text-charcoal-primary dark:text-white">
                                {unit.title}
                              </span>
                            </div>
                            {unit.description && (
                              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-0.5 line-clamp-1">
                                {unit.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="w-24 text-right hidden sm:block">
                            <span className="text-[11px] font-semibold text-charcoal-primary dark:text-white">
                              {unitProgress}%
                            </span>
                            <ProgressBar value={unitProgress} size="xs" variant="brand" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCreateTopic(unit.id);
                            }}
                            className="p-1.5 rounded-lg border border-paper-border dark:border-slate-700 hover:bg-paper-100 dark:hover:bg-slate-800 text-charcoal-primary dark:text-white text-xs font-medium"
                            title="Add topic to this unit"
                          >
                            <Plus size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditUnit(unit);
                            }}
                            className="p-1.5 text-charcoal-light hover:text-charcoal-primary dark:hover:text-white rounded-lg hover:bg-paper-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Unit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUnit(unit.id);
                            }}
                            className="p-1.5 text-charcoal-light hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Unit"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Topics Checklist Drawer */}
                      {isExpanded && (
                        <div className="px-5 pb-4 pt-1 border-t border-paper-border dark:border-slate-800/80 bg-paper-canvas/30 dark:bg-slate-900/40 space-y-2">
                          {topics.length === 0 ? (
                            <p className="text-xs text-charcoal-muted dark:text-slate-400 py-2 italic">
                              No topics added yet. Click "+" to add topics.
                            </p>
                          ) : (
                            topics.map((topic) => (
                              <div
                                key={topic.id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-paper-border dark:border-slate-800 text-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Checkbox
                                    checked={topic.is_completed}
                                    onChange={() => handleToggleTopic(topic.id)}
                                  />
                                  <span
                                    className={`truncate ${
                                      topic.is_completed
                                        ? 'line-through text-charcoal-muted dark:text-slate-500'
                                        : 'text-charcoal-primary dark:text-white font-medium'
                                    }`}
                                  >
                                    {topic.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {topic.estimated_minutes && (
                                    <span className="text-[10px] text-charcoal-light mr-1">
                                      ~{topic.estimated_minutes}m
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => openEditTopic(unit.id, topic)}
                                    className="text-charcoal-light hover:text-charcoal-primary dark:hover:text-white p-1 rounded hover:bg-paper-100 dark:hover:bg-slate-800 transition-colors"
                                    title="Edit Topic"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTopic(topic.id)}
                                    className="text-charcoal-light hover:text-rose-500 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                    title="Delete Topic"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        title={editingSubject ? 'Edit Subject' : 'Add Enrolled Subject'}
        description={editingSubject ? 'Update subject details and curriculum settings.' : 'Enter course details for your semester.'}
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          <Input
            label="Subject Name"
            required
            placeholder="e.g. Operating Systems"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Course Code"
              placeholder="e.g. CS 301"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
            />
            <Input
              label="Credit Hours"
              type="number"
              min={1}
              max={6}
              value={creditHours}
              onChange={(e) => setCreditHours(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Instructor Name"
              placeholder="e.g. Prof. Alan Turing"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-charcoal-primary dark:text-slate-300 tracking-wide uppercase mb-1.5">
                Accent Color
              </label>
              <input
                type="color"
                value={subjectColor}
                onChange={(e) => setSubjectColor(e.target.value)}
                className="w-full h-10 rounded-xl border border-paper-border cursor-pointer"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-paper-border dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => { setIsSubjectModalOpen(false); setEditingSubject(null); }}>
              Cancel
            </Button>
            <Button type="submit">{editingSubject ? 'Save Changes' : 'Create Subject'}</Button>
          </div>
        </form>
      </Modal>

      {/* Unit Modal */}
      <Modal
        isOpen={isUnitModalOpen}
        onClose={() => {
          setIsUnitModalOpen(false);
          setEditingUnit(null);
        }}
        title={editingUnit ? `Edit Syllabus Unit #${editingUnit.unit_number}` : `Add Syllabus Unit (${selectedSubject?.name})`}
        description={editingUnit ? 'Modify unit title, number, or topic outline.' : 'Define a major module or chapter in this syllabus.'}
      >
        <form onSubmit={handleSaveUnit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Unit #"
              type="number"
              min={1}
              value={unitNumber}
              onChange={(e) => setUnitNumber(Number(e.target.value))}
            />
            <div className="col-span-2">
              <Input
                label="Unit Title"
                required
                placeholder="e.g. Virtual Memory Management"
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
              />
            </div>
          </div>
          <Input
            label="Description (Optional)"
            placeholder="Key concepts, algorithms, textbook chapters..."
            value={unitDescription}
            onChange={(e) => setUnitDescription(e.target.value)}
          />
          <div className="flex justify-end gap-2.5 pt-4 border-t border-paper-border dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => { setIsUnitModalOpen(false); setEditingUnit(null); }}>
              Cancel
            </Button>
            <Button type="submit">{editingUnit ? 'Save Changes' : 'Add Unit'}</Button>
          </div>
        </form>
      </Modal>

      {/* Topic Modal */}
      <Modal
        isOpen={isTopicModalOpen}
        onClose={() => {
          setIsTopicModalOpen(false);
          setEditingTopic(null);
        }}
        title={editingTopic ? 'Edit Syllabus Topic' : 'Add Syllabus Topic'}
        description={editingTopic ? 'Update topic title or estimated revision duration.' : 'Add a discrete revision item to this unit.'}
      >
        <form onSubmit={handleSaveTopic} className="space-y-4">
          <Input
            label="Topic Name"
            required
            placeholder="e.g. Page Replacement Algorithms (FIFO, LRU)"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
          />
          <Input
            label="Estimated Revision Duration (Mins)"
            type="number"
            min={10}
            step={5}
            value={topicEstMinutes}
            onChange={(e) => setTopicEstMinutes(Number(e.target.value))}
          />
          <div className="flex justify-end gap-2.5 pt-4 border-t border-paper-border dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => { setIsTopicModalOpen(false); setEditingTopic(null); }}>
              Cancel
            </Button>
            <Button type="submit">{editingTopic ? 'Save Changes' : 'Add Topic'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
