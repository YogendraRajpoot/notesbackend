const express = require("express");
const fetchUser = require("../middleware/fetchuser");
const router = express.Router();
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// Routes1: get all the notes
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  const notes = await Notes.find({ user: req.user.id });
  res.json(notes);
});

// Routes2: add notes to mongodb with post api
router.post(
  "/addnotes",
  fetchUser,
  [
    body("title").isLength({ min: 5 }),
    body("description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // if there is a error return a bad status
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
      }
      const notes = new Notes({ title, description, tag, user: req.user.id });
      const saveNote = await notes.save();
      res.json(saveNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

//  Routes3: update an existing note
router.put("/updatenote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  //create a newNote object
  const newNote = {};
  if (title) newNote.title = title;
  if (description) newNote.description = description;
  if (tag) newNote.tag = tag;

  // Find the note to be updated and update it

  const notes = await Notes.findById(req.params.id);
  if (!notes) return res.status(404).send("Not Found");
  if (notes.user.toString() !== req.user.id) {
    return res.status(401).send("Not Allowed");
  }
  const note = await Notes.findOneAndUpdate(
    req.param.id,
    { $set: newNote },
    { new: true }
  );
  res.json({ note });
});

// Routes4: delete an existing notes
router.delete("/deletenotes/:id", fetchUser, async (req, res) => {
  try {
    // find the note to be deleted
    let note = await Notes.findById(req.params.id);
    if (!note) return res.status(404).send("Not Found");

    // Allow deletion only if user owns this Note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);

    res.json({ success: "Note has been deleted" });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
