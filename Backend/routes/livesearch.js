const express = require('express');
const StudentDetail = require('../models/studentDetails');
const router = express.Router();

router.post('/search', async (req, res) => {
  const searchInput = (req.body.searchInput || '').trim();
  if (!searchInput) return res.status(400).json({ error: 'Missing searchInput' });

  let searchCriteria = {};
  let field = 'name'; // default projection field

  // Exact 10-digit phone
  if (/^\d{10}$/.test(searchInput)) {
    field = 'phone';
    searchCriteria = { phone: searchInput };
  }
  // Partial phone (all digits)
  else if (/^\d+$/.test(searchInput)) {
    field = 'phone';
    searchCriteria = { phone: { $regex: '^' + searchInput } };
  }
  // Hall ticket style starting with 2 + alnum -> use htno (actual DB field)
  else if (/^2[a-zA-Z0-9]+$/.test(searchInput)) {
    field = 'htno';
    searchCriteria = { htno: { $regex: '^' + searchInput, $options: 'i' } };
  }
  // Looks like an email
  else if (/@/.test(searchInput)) {
    field = 'student_email';
    searchCriteria = { student_email: { $regex: '^' + searchInput, $options: 'i' } };
  }
  // Fallback: name search (case-insensitive substring)
  else {
    field = 'name';
    searchCriteria = { name: { $regex: searchInput, $options: 'i' } };
  }

  try {
    // Include only necessary fields in projection
    const projection = { _id: 1, currentyear: 1 };
    projection[field] = 1;

    // Run query (limit can be added if you expect many results)
    const students = await StudentDetail.find(searchCriteria, projection).maxTimeMS(30000).lean();

    res.json(students);
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
