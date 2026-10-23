import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, RefreshCw, UserCheck } from 'lucide-react';
import { apiRequest } from '../../services/api';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Subjects() {
  useDocumentTitle('Academic Subjects & Faculty');
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadSubjects() {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/subjects');
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load subjects');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Subjects & Faculty</h1>
          <p className="text-sm text-slate-500">
            Registered semester courses, curriculum credits, and assigned department faculty.
          </p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} loading={loading} onClick={loadSubjects}>
          Refresh
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading course curriculum…</p>
      ) : subjects.length === 0 ? (
        <Card className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-2" />
          <h3 className="text-base font-semibold text-slate-800">No subjects registered yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Course allocation for your semester is being updated by the academic section.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    {subject.code}
                  </span>
                  <Badge tone="purple">{subject.credits} Credits</Badge>
                </div>
                <h2 className="text-base font-bold text-slate-900">{subject.name}</h2>
                <p className="text-xs text-slate-500">{subject.course} · Semester {subject.semester}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <UserCheck className="h-4 w-4 text-brand-600 shrink-0" />
                <span className="truncate">
                  {subject.faculty ? `Faculty: ${subject.faculty}` : 'Faculty will be assigned soon'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
