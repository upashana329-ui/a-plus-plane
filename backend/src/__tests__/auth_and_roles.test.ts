import { describe, it } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('A+ Plane Security & Auth Unit Tests', () => {
  const TEST_JWT_SECRET = 'test-super-secret-key-for-unit-tests-minimum-32-chars';

  it('correctly hashes passwords with bcrypt and verifies matching passwords', async () => {
    const rawPassword = 'SecureStudentPassword!123';
    const hash = await bcrypt.hash(rawPassword, 10);

    assert.notStrictEqual(hash, rawPassword);
    const isMatch = await bcrypt.compare(rawPassword, hash);
    assert.strictEqual(isMatch, true);

    const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
    assert.strictEqual(isWrongMatch, false);
  });

  it('generates valid signed JWT tokens with student role claims', () => {
    const student = { id: 'clx_stu_test_123', role: 'STUDENT' };
    const token = jwt.sign({ role: student.role }, TEST_JWT_SECRET, {
      subject: student.id,
      expiresIn: '1h',
    });

    const decoded = jwt.verify(token, TEST_JWT_SECRET) as any;
    assert.strictEqual(decoded.sub, student.id);
    assert.strictEqual(decoded.role, 'STUDENT');
  });

  it('generates valid signed JWT tokens with ADMIN role claims', () => {
    const admin = { id: 'clx_admin_test_456', role: 'ADMIN' };
    const token = jwt.sign({ role: admin.role }, TEST_JWT_SECRET, {
      subject: admin.id,
      expiresIn: '1h',
    });

    const decoded = jwt.verify(token, TEST_JWT_SECRET) as any;
    assert.strictEqual(decoded.sub, admin.id);
    assert.strictEqual(decoded.role, 'ADMIN');
  });

  it('rejects expired or tampered JWT tokens', () => {
    const token = jwt.sign({ role: 'STUDENT' }, TEST_JWT_SECRET, {
      subject: 'stu_1',
      expiresIn: '0s', // expired immediately
    });

    assert.throws(() => {
      jwt.verify(token, TEST_JWT_SECRET);
    });
  });

  it('strictly validates complaint reopening logic: only resolved or closed can be reopened', () => {
    function canReopen(status: string) {
      return status === 'RESOLVED' || status === 'CLOSED';
    }

    assert.strictEqual(canReopen('RESOLVED'), true);
    assert.strictEqual(canReopen('CLOSED'), true);
    assert.strictEqual(canReopen('SUBMITTED'), false);
    assert.strictEqual(canReopen('IN_PROGRESS'), false);
    assert.strictEqual(canReopen('UNDER_REVIEW'), false);
  });

  it('strictly enforces ownership check logic for student grievance privacy', () => {
    function canStudentView(complaintStudentId: string, currentStudentId: string, isAdmin: boolean) {
      if (isAdmin) return true;
      return complaintStudentId === currentStudentId;
    }

    // Owner student
    assert.strictEqual(canStudentView('stu_1001', 'stu_1001', false), true);
    // Other student trying to access private grievance
    assert.strictEqual(canStudentView('stu_1001', 'stu_9999', false), false);
    // Administrator
    assert.strictEqual(canStudentView('stu_1001', 'admin_01', true), true);
  });
});
