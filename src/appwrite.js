import { Client, Databases, Storage, Account, ID, Query, Permission, Role } from 'appwrite';

// ─── Client Setup ─────────────────────────────────────────────────────────────

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '');

export const databases = new Databases(client);
export const storage   = new Storage(client);
export const account   = new Account(client);

// ─── IDs ─────────────────────────────────────────────────────────────────────

const DATABASE_ID    = import.meta.env.VITE_APPWRITE_DATABASE_ID                      || '';
const BLOOD_COL      = import.meta.env.VITE_APPWRITE_BLOOD_REQUESTS_COLLECTION_ID     || 'blood_requests';
const PACKAGES_COL   = import.meta.env.VITE_APPWRITE_PACKAGES_COLLECTION_ID           || 'packages';
const FEEDBACK_COL   = import.meta.env.VITE_APPWRITE_FEEDBACK_COLLECTION_ID           || 'feedback';
const CERT_COL       = import.meta.env.VITE_APPWRITE_CERTIFICATES_COLLECTION_ID       || 'certificates';
const ADMISSION_COL  = import.meta.env.VITE_APPWRITE_ADMISSIONS_COLLECTION_ID         || 'admissions';
const BUCKET_ID      = import.meta.env.VITE_APPWRITE_BUCKET_ID                        || 'package_images';
const CERT_BUCKET    = import.meta.env.VITE_APPWRITE_CERT_BUCKET_ID                   || 'certificates';

export { ID, DATABASE_ID, BUCKET_ID, CERT_BUCKET };

// ─── Blood Requests ───────────────────────────────────────────────────────────

export const createBloodRequest = ({ name, address, phone, email = '' }) =>
  databases.createDocument(DATABASE_ID, BLOOD_COL, ID.unique(), {
    name, address, phone, email, status: 'pending',
  });

export const getBloodRequests = () =>
  databases.listDocuments(DATABASE_ID, BLOOD_COL, [Query.orderDesc('$createdAt')]);

export const updateBloodRequestStatus = (id, status) =>
  databases.updateDocument(DATABASE_ID, BLOOD_COL, id, { status });

export const deleteBloodRequest = (id) =>
  databases.deleteDocument(DATABASE_ID, BLOOD_COL, id);

// ─── Packages ─────────────────────────────────────────────────────────────────

export const createPackage = ({ title, description, price, features, imageId }) =>
  databases.createDocument(DATABASE_ID, PACKAGES_COL, ID.unique(), {
    title, description, price, features, imageId: imageId || '',
  });

export const getPackages = () =>
  databases.listDocuments(DATABASE_ID, PACKAGES_COL, [Query.orderDesc('$createdAt')]);

export const deletePackage = async (id, imageId) => {
  if (imageId) { try { await storage.deleteFile(BUCKET_ID, imageId); } catch (_) {} }
  return databases.deleteDocument(DATABASE_ID, PACKAGES_COL, id);
};

export const uploadPackageImage = (file) =>
  storage.createFile(BUCKET_ID, ID.unique(), file, [Permission.read(Role.any())]);

const ENDPOINT   = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';

// Build direct URLs — avoids SDK URL object quirks and works with public buckets
export const getImagePreviewUrl = (fileId) =>
  `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;

// ─── Feedback ─────────────────────────────────────────────────────────────────

export const createFeedback = ({ name, message, rating }) =>
  databases.createDocument(DATABASE_ID, FEEDBACK_COL, ID.unique(), {
    name, message, rating: parseInt(rating),
  });

export const getFeedback = () =>
  databases.listDocuments(DATABASE_ID, FEEDBACK_COL, [Query.orderDesc('$createdAt')]);

export const deleteFeedback = (id) =>
  databases.deleteDocument(DATABASE_ID, FEEDBACK_COL, id);

// ─── Certificates ─────────────────────────────────────────────────────────────

export const uploadCertificatePDF = (file) =>
  storage.createFile(CERT_BUCKET, ID.unique(), file, [Permission.read(Role.any())]);

export const createCertificate = ({ enrollmentNo, studentPhone, fileId, studentName, issuedDate }) =>
  databases.createDocument(DATABASE_ID, CERT_COL, ID.unique(), {
    enrollmentNo:  enrollmentNo.trim().toUpperCase(),
    studentPhone:  studentPhone.trim(),
    studentName:   studentName || '',
    fileId,
    issuedDate:    issuedDate || new Date().toISOString(),
  });

export const getCertificates = () =>
  databases.listDocuments(DATABASE_ID, CERT_COL, [Query.orderDesc('$createdAt')]);

export const verifyCertificate = async (enrollmentNo) => {
  try {
    const res = await databases.listDocuments(DATABASE_ID, CERT_COL, [
      Query.equal('enrollmentNo', enrollmentNo.trim().toUpperCase()),
      Query.limit(1),
    ]);
    return res.documents[0] ?? null;
  } catch (_) { return null; }
};

export const deleteCertificate = async (id, fileId) => {
  if (fileId) { try { await storage.deleteFile(CERT_BUCKET, fileId); } catch (_) {} }
  return databases.deleteDocument(DATABASE_ID, CERT_COL, id);
};

export const getCertificateDownloadUrl = (fileId) =>
  `${ENDPOINT}/storage/buckets/${CERT_BUCKET}/files/${fileId}/download?project=${PROJECT_ID}`;

export const getCertificateViewUrl = (fileId) =>
  `${ENDPOINT}/storage/buckets/${CERT_BUCKET}/files/${fileId}/view?project=${PROJECT_ID}`;

// ─── Admissions ───────────────────────────────────────────────────────────────
// Students sign up / log in via Appwrite Account.
// Each student can have ONE admission document linked by userId.

export const createAdmission = ({ userId, name, age, phone, email, address, course, qualification }) =>
  databases.createDocument(DATABASE_ID, ADMISSION_COL, ID.unique(), {
    userId, name, age: parseInt(age), phone, email, address, course, qualification,
    status: 'pending',
  });

export const getMyAdmission = async (userId) => {
  try {
    const res = await databases.listDocuments(DATABASE_ID, ADMISSION_COL, [
      Query.equal('userId', userId),
      Query.limit(1),
    ]);
    return res.documents[0] ?? null;
  } catch (_) { return null; }
};

export const cancelAdmission = (id) =>
  databases.updateDocument(DATABASE_ID, ADMISSION_COL, id, { status: 'cancelled' });

export const reactivateAdmission = (id) =>
  databases.updateDocument(DATABASE_ID, ADMISSION_COL, id, { status: 'pending' });

export const deleteAdmissionDoc = (id) =>
  databases.deleteDocument(DATABASE_ID, ADMISSION_COL, id);

// Admin: get all admissions
export const getAllAdmissions = () =>
  databases.listDocuments(DATABASE_ID, ADMISSION_COL, [Query.orderDesc('$createdAt')]);

export const updateAdmissionStatus = (id, status) =>
  databases.updateDocument(DATABASE_ID, ADMISSION_COL, id, { status });

// ─── Student Auth (separate from admin) ──────────────────────────────────────

export const studentSignup = async (email, password, name) => {
  await account.create(ID.unique(), email, password, name);
  return account.createEmailPasswordSession(email, password);
};

export const studentLogin = (email, password) =>
  account.createEmailPasswordSession(email, password);

export const studentLogout = () =>
  account.deleteSession('current');

export const getStudentSession = async () => {
  try { return await account.get(); } catch (_) { return null; }
};

// ─── Admin Auth ───────────────────────────────────────────────────────────────

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'pankajosank1994@gmail.com';

export const adminLogin = (email, password) =>
  account.createEmailPasswordSession(email, password);

export const adminLogout = () =>
  account.deleteSession('current');

export const getAdminSession = async () => {
  try {
    const user = await account.get();
    // Only treat as admin if email matches configured admin email
    return user.email === ADMIN_EMAIL ? user : null;
  } catch (_) { return null; }
};

export { ADMIN_EMAIL };