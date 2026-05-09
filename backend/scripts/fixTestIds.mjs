import { readFileSync, writeFileSync } from 'fs';

const filePath = 'tests/instructor.test.js';
let content = readFileSync(filePath, 'utf8');

// Fix 1: updates live course test - LIVE_COURSE_1 -> testLiveCourseId
// File uses CRLF line endings
const CRLF = '\r\n';
const old1 = `.patch(\`\${PRI}/courses/\${LIVE_COURSE_1}\`)${CRLF}        .set("Cookie", insACookie)${CRLF}        .send({ title: "Live Course Pending Update" });`;
const new1 = `.patch(\`\${PRI}/courses/\${testLiveCourseId}\`)${CRLF}        .set("Cookie", insACookie)${CRLF}        .send({ title: "Live Course Pending Update" });`;

const found1 = content.includes(old1);
console.log('Fix 1 (updates live course PATCH):', found1 ? 'FOUND' : 'NOT FOUND');
if (found1) content = content.replace(old1, new1);

writeFileSync(filePath, content, 'utf8');
console.log('Done. Writing file.');
