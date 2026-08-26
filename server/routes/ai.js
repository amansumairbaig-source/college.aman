const express = require('express');
const router = express.Router();
const { Complaint } = require('../db');

// Keyword dictionary for smart classification
const categoryKeywords = {
  'Wi-Fi & IT': ['wifi', 'wi-fi', 'internet', 'network', 'router', 'ethernet', 'login', 'server', 'portal', 'signal', 'speed', 'lan', 'bandwidth', 'disconnect'],
  'Hostel Maintenance': ['hostel', 'room', 'bed', 'mattress', 'geyser', 'warden', 'corridor', 'dorm', 'water heater', 'shower', 'almirah', 'block a', 'block b', 'block c'],
  'Laboratories': ['lab', 'laboratory', 'apparatus', 'chemical', 'pipette', 'beaker', 'microscope', 'oscilloscope', 'circuit', 'chemistry', 'physics', 'reagent'],
  'Classrooms': ['classroom', 'lecture', 'bench', 'blackboard', 'whiteboard', 'desk', 'projector', 'hdmi', 'fan', 'podium', 'hall', 'speaker', 'audio'],
  'Cleanliness': ['garbage', 'trash', 'dustbin', 'cleaning', 'sweep', 'washroom', 'toilet', 'sanitation', 'dirty', 'restroom', 'smell', 'odor', 'stain', 'overflow'],
  'Transportation': ['bus', 'shuttle', 'route', 'driver', 'transit', 'seat', 'punctual', 'timing', 'pickup', 'drop', 'commute', 'vehicle'],
  'Campus Infrastructure': ['light', 'tube light', 'bulb', 'switch', 'socket', 'plumbing', 'pipe', 'leak', 'door', 'window', 'ceiling', 'lift', 'elevator', 'water cooler', 'stairs'],
  'Library Facilities': ['book', 'library', 'journal', 'reading room', 'librarian', 'borrow', 'return', 'ac', 'silence', 'study desk'],
  'Cafeteria & Dining': ['food', 'canteen', 'cafeteria', 'mess', 'hygiene', 'meal', 'lunch', 'breakfast', 'dinner', 'plate', 'water filter']
};

const criticalKeywords = ['emergency', 'hazard', 'fire', 'shock', 'spark', 'smoke', 'flood', 'leakage near electrical', 'injur', 'collapse', 'danger', 'gas', 'chemical spill'];
const highKeywords = ['broken', 'exam', 'urgent', 'no water', 'power cut', 'wifi down', 'overflow', 'locked', 'stuck', 'midterm', 'assignment'];
const lowKeywords = ['flicker', 'noise', 'cosmetic', 'suggestion', 'request', 'minor', 'slow', 'dim', 'paint'];

function analyzeText(text) {
  const lower = (text || '').toLowerCase();

  let matchedCategory = 'Campus Infrastructure';
  let maxScore = 0;

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    keywords.forEach(kw => {
      if (lower.includes(kw)) score += 2;
    });
    if (score > maxScore) {
      maxScore = score;
      matchedCategory = cat;
    }
  }

  let detectedPriority = 'Medium';
  let priorityReason = 'Standard campus priority based on issue description.';

  if (criticalKeywords.some(kw => lower.includes(kw))) {
    detectedPriority = 'Critical';
    priorityReason = 'Urgent safety or operational impact detected.';
  } else if (highKeywords.some(kw => lower.includes(kw))) {
    detectedPriority = 'High';
    priorityReason = 'Significant disruption to student academics or daily facilities.';
  } else if (lowKeywords.some(kw => lower.includes(kw))) {
    detectedPriority = 'Low';
    priorityReason = 'Minor inconvenience or non-blocking maintenance request.';
  }

  return { matchedCategory, detectedPriority, priorityReason, confidence: maxScore > 0 ? 85 + Math.min(10, maxScore * 2) : 70 };
}

// POST /api/ai/categorize
router.post('/categorize', (req, res) => {
  const { title = '', description = '' } = req.body;
  const combined = `${title} ${description}`;

  if (!combined.trim()) {
    return res.json({
      category: 'Campus Infrastructure',
      priority: 'Medium',
      confidence: 60,
      reasoning: 'Default baseline classification.'
    });
  }

  const analysis = analyzeText(combined);

  res.json({
    category: analysis.matchedCategory,
    priority: analysis.detectedPriority,
    confidence: analysis.confidence,
    reasoning: analysis.priorityReason
  });
});

// POST /api/ai/summarize
router.post('/summarize', (req, res) => {
  const { title = '', description = '', location = '' } = req.body;
  if (!description && !title) {
    return res.status(400).json({ error: 'Title and description are required for summarization' });
  }

  const analysis = analyzeText(`${title} ${description}`);
  const cleanDesc = description.trim();
  const summary = cleanDesc.length > 120 
    ? `${cleanDesc.substring(0, 115)}... (Action needed at ${location || 'campus location'})`
    : `Issue: ${cleanDesc}. Located at: ${location || 'Campus'}.`;

  const recommendedDepartment = {
    'Wi-Fi & IT': 'IT & Wi-Fi Support',
    'Hostel Maintenance': 'Hostel Maintenance',
    'Laboratories': 'Laboratories & Equipment',
    'Classrooms': 'Campus Infrastructure',
    'Cleanliness': 'Cleanliness & Sanitation',
    'Transportation': 'Transportation',
    'Campus Infrastructure': 'Campus Infrastructure',
    'Library Facilities': 'Library Facilities',
    'Cafeteria & Dining': 'Cafeteria & Dining'
  }[analysis.matchedCategory] || 'Campus Infrastructure';

  res.json({
    summary,
    suggestedCategory: analysis.matchedCategory,
    suggestedPriority: analysis.detectedPriority,
    recommendedDepartment,
    keyKeywords: analysis.matchedCategory.toLowerCase().split(' ')
  });
});

// POST /api/ai/check-duplicates
router.post('/check-duplicates', async (req, res) => {
  try {
    const { title = '', description = '', location = '', category = '' } = req.body;
    const complaints = await Complaint.find({ status: { $ne: 'Closed' } });

    const textToWords = (str) =>
      (str || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3);

    const newWords = new Set([...textToWords(title), ...textToWords(description), ...textToWords(location)]);

    const duplicates = [];

    complaints.forEach(c => {
      const existingWords = new Set([...textToWords(c.title), ...textToWords(c.description), ...textToWords(c.location)]);
      let matchCount = 0;

      newWords.forEach(word => {
        if (existingWords.has(word)) matchCount++;
      });

      const locMatch = location && c.location && (
        c.location.toLowerCase().includes(location.toLowerCase()) ||
        location.toLowerCase().includes(c.location.toLowerCase())
      );

      const categoryMatch = category && c.category && c.category.toLowerCase() === category.toLowerCase();

      let similarity = 0;
      if (newWords.size > 0) {
        similarity = Math.round((matchCount / Math.max(newWords.size, 5)) * 100);
      }
      if (locMatch) similarity = Math.min(100, similarity + 30);
      if (categoryMatch) similarity = Math.min(100, similarity + 15);

      if (similarity >= 45) {
        duplicates.push({
          id: c.id,
          title: c.title,
          status: c.status,
          location: c.location,
          category: c.category,
          similarityScore: similarity,
          createdAt: c.createdAt
        });
      }
    });

    duplicates.sort((a, b) => b.similarityScore - a.similarityScore);

    res.json({
      hasPotentialDuplicates: duplicates.length > 0,
      matches: duplicates.slice(0, 3)
    });
  } catch (err) {
    console.error('Error checking duplicates:', err);
    res.status(500).json({ error: 'Failed to check duplicates' });
  }
});

module.exports = router;
