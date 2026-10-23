import {
  COMPLAINT_CATEGORIES,
  COURSES,
  PRIORITIES,
  SECTIONS,
  SEMESTERS,
} from './constants';

const STUDENT_ID_PATTERN = /^[A-Za-z0-9_-]{3,30}$/;
const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]*$/u;

// Keeps only the fields that have an error message.
function collect(checks) {
  const errors = {};
  Object.entries(checks).forEach(([field, message]) => {
    if (message) errors[field] = message;
  });
  return errors;
}

function checkStudentId(value) {
  const id = (value || '').trim();
  if (!id) return 'Student ID is required.';
  if (!STUDENT_ID_PATTERN.test(id)) {
    return 'Use 3–30 letters, numbers, hyphens or underscores, with no spaces.';
  }
  return '';
}

function checkPassword(value) {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  // bcrypt only uses the first 72 bytes of a password.
  if (new TextEncoder().encode(value).length > 72) {
    return 'Password is too long (maximum 72 characters).';
  }
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Password must contain at least one letter and one number.';
  }
  return '';
}

export function validateLogin({ studentId, password }) {
  return collect({
    studentId: checkStudentId(studentId),
    password: password ? '' : 'Password is required.',
  });
}

export function validateRegistration(values) {
  const name = (values.name || '').trim();
  const semester = Number(values.semester);

  let nameError = '';
  if (!name) nameError = 'Full name is required.';
  else if (name.length < 2 || name.length > 80) nameError = 'Name must be 2–80 characters long.';
  else if (!NAME_PATTERN.test(name)) nameError = 'Name can only contain letters, spaces, dots, hyphens and apostrophes.';

  let confirmError = '';
  if (!values.confirmPassword) confirmError = 'Please confirm your password.';
  else if (values.confirmPassword !== values.password) confirmError = 'Passwords do not match.';

  return collect({
    name: nameError,
    studentId: checkStudentId(values.studentId),
    course: COURSES.includes(values.course) ? '' : 'Please select your course.',
    semester: SEMESTERS.includes(semester) ? '' : 'Please select your semester.',
    section: SECTIONS.includes(values.section) ? '' : 'Please select your section.',
    password: checkPassword(values.password),
    confirmPassword: confirmError,
  });
}

export function validateComplaint(values) {
  const title = (values.title || '').trim();
  const description = (values.description || '').trim();

  let titleError = '';
  if (!title) titleError = 'Please enter a title.';
  else if (title.length < 5) titleError = 'Title must be at least 5 characters.';
  else if (title.length > 120) titleError = 'Title must be 120 characters or fewer.';

  let descriptionError = '';
  if (!description) descriptionError = 'Please describe the problem.';
  else if (description.length < 20) descriptionError = 'Please give at least 20 characters so the issue is clear.';
  else if (description.length > 2000) descriptionError = 'Description must be 2000 characters or fewer.';

  return collect({
    title: titleError,
    category: COMPLAINT_CATEGORIES.includes(values.category) ? '' : 'Please choose a category.',
    description: descriptionError,
    priority: !values.priority || PRIORITIES.includes(values.priority) ? '' : 'Invalid priority.',
  });
}
