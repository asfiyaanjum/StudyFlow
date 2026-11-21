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
} from 'lucide-react';
import { api } from '../../services/api';
import { Subject, SyllabusUnit, SyllabusTopic } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const SubjectsPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [syllabusUnits, setSyllabusUnits] = useState<SyllabusUnit[]>([]);
  const [loading, setLoading] = useState(true);

  // Subject Modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectColor, setSubjectColor] = useState('#6366f1');
  const [creditHours, setCreditHours] = useState(3);
  const [instructor, setInstructor] = useState('');

  // Unit Modal
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitTitle, setUnitTitle] = useState('');
  const [unitNumber, setUnitNumber] = useState(1);
  const [unitDescription, setUnitDescription] = useState('');

  // Topic Modal
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [targetUnitId, setTargetUnitId] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicMinutes, setTopicMinutes] = useState(60);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await api.subjects.getSubjects();
      setSubjects(data);
      if (data.length > 0) {
        // preserve selected subject or default to first
        const current = selectedSubject ? data.find((s) => s.id === selectedSubject.id) : data[0];
        const active = current || data[0];
        setSelectedSubject(active);
        const units = await api.subjects.getSyllabus(active.id);
        setSyllabusUnits(units);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSelectSubject = async (sub: Subject) => {
    setSelectedSubject(sub);
    try {
      const units = await api.subjects.getSyllabus(sub.id);
      setSyllabusUnits(units);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      toastError('Validation', 'Subject name is required.');
      return;
    }

    try {
      const created = await api.subjects.createSubject({
        user_id: 'user',
        name: subjectName,
        code: subjectCode,
        color: subjectColor,
        credit_hours: creditHours,
        instructor,
      });

      setSubjects((prev) => [...prev, created]);
      setSelectedSubject(created);
      setSyllabusUnits([]);
      success('Subject Created', `"${created.name}" was added to your curriculum.`);
      setIsSubjectModalOpen(false);
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;

    try {
      const created = await api.subjects.createUnit({
        subject_id: selectedSubject.id,
        user_id: 'user',
        title: unitTitle,
        unit_number: unitNumber,
        description: unitDescription,
      });

      setSyllabusUnits((prev) => [...prev, { ...created, topics: [], progress_percentage: 0 }]);
      success('Unit Added', `"${created.title}" added to syllabus.`);
      setIsUnitModalOpen(false);
      setUnitTitle('');
      setUnitDescription('');
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUnitId) return;

    try {
      const created = await api.subjects.createTopic({
        unit_id: targetUnitId,
        user_id: 'user',
        title: topicTitle,
        estimated_minutes: topicMinutes,
        is_completed: false,
      });

      setSyllabusUnits((prev) =>
        prev.map((unit) => {
          if (unit.id === targetUnitId) {
            const nextTopics = [...(unit.topics || []), created];
            const completedCount = nextTopics.filter((t) => t.is_completed).length;
            const pct = Math.round((completedCount / nextTopics.length) * 100);
            return { ...unit, topics: nextTopics, progress_percentage: pct };
          }
          return unit;
        })
      );

      success('Topic Added', `Topic "${topicTitle}" added.`);
      setIsTopicModalOpen(false);
      setTopicTitle('');
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  const handleToggleTopic = async (topic: SyllabusTopic) => {
    try {
      const updated = await api.subjects.toggleTopicComplete(topic.id, !topic.is_completed);

      setSyllabusUnits((prev) =>
        prev.map((unit) => {
          if (unit.id === topic.unit_id) {
            const nextTopics = (unit.topics || []).map((t) => (t.id === topic.id ? updated : t));
            const completedCount = nextTopics.filter((t) => t.is_completed).length;
            const pct = Math.round((completedCount / nextTopics.length) * 100);
            return { ...unit, topics: nextTopics, progress_percentage: pct };
          }
          return unit;
        })
      );

      // Refresh subject summary
      const updatedSubjects = await api.subjects.getSubjects();
      setSubjects(updatedSubjects);

      if (updated.is_completed) {
        success('Topic Mastered', `Checked off "${topic.title}"!`);
      }
    } catch (err: any) {
      toastError('Error', err.message);
    }
  };

  const colors = [
    '#6366f1', // Indigo
    '#0284c7', // Sky
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#f43f5e', // Rose
    '#8b5cf6', // Purple
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Add Subject */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Subjects & Syllabus Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track official course syllabi, unit milestones, and conceptual topic mastery.
          </p>
        </div>

        <Button onClick={() => setIsSubjectModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          New Subject
        </Button>
      </div>

      {/* Subject Pills Slider */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {subjects.map((sub) => {
          const isSelected = selectedSubject?.id === sub.id;

          return (
            <button
              key={sub.id}
              onClick={() => handleSelectSubject(sub)}
              className={`px-4 py-3 rounded-2xl border text-left transition-all shrink-0 flex items-center gap-3 ${
                isSelected
                  ? 'border-brand-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900'
              }`}
            >
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: sub.color }}
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {sub.code || sub.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {sub.progress_percentage || 0}% Complete
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Subject Details & Syllabus Units */}
      {selectedSubject ? (
        <div className="space-y-6">
          {/* Subject Banner Card */}
          <Card
            className="p-6 border-t-4"
            style={{ borderTopColor: selectedSubject.color }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: selectedSubject.color }}
                  >
                    {selectedSubject.code || 'COURSE'}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedSubject.name}
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  {selectedSubject.instructor && <span>👨‍🏫 {selectedSubject.instructor}</span>}
                  {selectedSubject.credit_hours && <span>🎓 {selectedSubject.credit_hours} Credits</span>}
                </div>
              </div>

              {/* Progress summary */}
              <div className="text-right space-y-1.5 min-w-[200px]">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-slate-500">Syllabus Mastery</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {selectedSubject.progress_percentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedSubject.progress_percentage || 0}%`,
                      backgroundColor: selectedSubject.color,
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {selectedSubject.completed_topics_count || 0} of {selectedSubject.topics_count || 0} topics completed
                </p>
              </div>
            </div>
          </Card>

          {/* Syllabus Units Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-600" />
                Syllabus Units & Topics
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setUnitNumber(syllabusUnits.length + 1);
                  setIsUnitModalOpen(true);
                }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Unit
              </Button>
            </div>

            {syllabusUnits.length === 0 ? (
              <Card className="py-12 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No syllabus units added yet
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add units and topics from your course syllabus to track your conceptual progress through the semester.
                </p>
                <Button size="sm" onClick={() => setIsUnitModalOpen(true)}>
                  Add First Unit
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {syllabusUnits.map((unit) => (
                  <Card key={unit.id} className="p-5 space-y-4">
                    {/* Unit Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            Unit {unit.unit_number}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {unit.title}
                          </h4>
                        </div>
                        {unit.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {unit.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                          {unit.progress_percentage || 0}% Complete
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTargetUnitId(unit.id);
                            setIsTopicModalOpen(true);
                          }}
                          leftIcon={<Plus className="w-3 h-3" />}
                        >
                          Add Topic
                        </Button>
                      </div>
                    </div>

                    {/* Topics List */}
                    <div className="space-y-2">
                      {unit.topics && unit.topics.length > 0 ? (
                        unit.topics.map((topic) => (
                          <div
                            key={topic.id}
                            className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={() => handleToggleTopic(topic)}
                                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                                  topic.is_completed
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-brand-500'
                                }`}
                              >
                                {topic.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>
                              <span
                                className={`text-xs font-medium text-slate-800 dark:text-slate-200 truncate ${
                                  topic.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                                }`}
                              >
                                {topic.title}
                              </span>
                            </div>

                            <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3" />
                              {topic.estimated_minutes || 45}m
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic py-2">
                          No topics added to this unit yet.
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Add Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title="Add Academic Subject"
        description="Add a new course or subject to your StudyFlow curriculum."
      >
        <form onSubmit={handleCreateSubject} className="space-y-4 pt-2">
          <Input
            label="Subject Name"
            placeholder="e.g. Data Structures & Algorithms"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Course Code"
              placeholder="e.g. CS 106B"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
            />
            <Input
              label="Credit Hours"
              type="number"
              min={1}
              max={10}
              value={creditHours}
              onChange={(e) => setCreditHours(Number(e.target.value))}
            />
          </div>

          <Input
            label="Professor / Instructor"
            placeholder="e.g. Prof. Julie Zelenski"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Subject Color
            </label>
            <div className="flex items-center gap-3">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSubjectColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    subjectColor === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsSubjectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Subject</Button>
          </div>
        </form>
      </Modal>

      {/* Add Unit Modal */}
      <Modal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        title="Add Syllabus Unit"
        description={`Add a major curriculum unit to ${selectedSubject?.name}.`}
      >
        <form onSubmit={handleCreateUnit} className="space-y-4 pt-2">
          <Input
            label="Unit Number"
            type="number"
            min={1}
            value={unitNumber}
            onChange={(e) => setUnitNumber(Number(e.target.value))}
            required
          />
          <Input
            label="Unit Title"
            placeholder="e.g. Unit 3: Trees, Heaps & Graph Algorithms"
            value={unitTitle}
            onChange={(e) => setUnitTitle(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={unitDescription}
              onChange={(e) => setUnitDescription(e.target.value)}
              placeholder="Key concepts covered in this unit..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsUnitModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Unit</Button>
          </div>
        </form>
      </Modal>

      {/* Add Topic Modal */}
      <Modal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        title="Add Syllabus Topic"
        description="Add a specific concept or chapter topic to master."
      >
        <form onSubmit={handleCreateTopic} className="space-y-4 pt-2">
          <Input
            label="Topic Title"
            placeholder="e.g. Binary Search Tree Traversals & Balancing"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            required
          />
          <Input
            label="Estimated Study Duration (Minutes)"
            type="number"
            min={15}
            step={15}
            value={topicMinutes}
            onChange={(e) => setTopicMinutes(Number(e.target.value))}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsTopicModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Topic</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

