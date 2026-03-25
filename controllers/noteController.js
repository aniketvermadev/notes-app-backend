const Note = require('../models/Note');

exports.getNotes = async (req, res) => {
  try {
    // get page & limit from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    // total notes count
    const total = await Note.countDocuments({ user: req.user.id });

    // paginated notes
    const notes = await Note.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      notes,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createNote = async (req, res) => {
  const note = await Note.create({
    user: req.user.id,
    title: req.body.title,
    content: req.body.content,
    completed: req.body.completed
  });

  res.json(note);
};

exports.updateNote = async (req, res) => {
  const { title, content, completed } = req.body;

  let note = await Note.findById(req.params.id);

  if (!note) {
    return res.status(404).json({ msg: 'Note not found' });
  }

  // check ownership
  if (note.user.toString() !== req.user.id) {
    return res.status(401).json({ msg: 'Not authorized' });
  }

  note = await Note.findByIdAndUpdate(
    req.params.id,
    { title, content, completed },
    { new: true }
  );

  res.json(note);
};

exports.deleteNote = async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) return res.status(404).json({ msg: 'Note not found' });

  // check ownership
  if (note.user.toString() !== req.user.id) {
    return res.status(401).json({ msg: 'Not authorized' });
  }

  await Note.findByIdAndDelete(req.params.id);

  res.json({ msg: 'Note deleted' });
};