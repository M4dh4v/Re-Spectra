const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  id: { type: Number, required: true },

  // identifiers
  rollno: { type: String, required: true },
  htno: { type: String },                         // hall ticket (response uses "htno")
  // alias so you can also use doc.hallticketno in code (not stored separately)
  // Mongoose alias created below via option on htno

  // personal
  name: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String },

  // contact
  phone: { type: String },
  student_email: { type: String },                // response uses student_email
  address: { type: String },

  // family
  fathername: { type: String },
  fathermobile: { type: String },

  // academic
  admissionyear: { type: Number },
  studenttype: { type: String },                  // e.g. "REGULAR"
  isLateralEntry: { type: Boolean, default: false },
  isPHC: { type: Boolean, default: false },
  currentyear: { type: Number },
  currentsemester: { type: Number },

  // misc
  qr_key: { type: String },
  status: { type: String },                       // e.g. "ACTIVE"

  // nested sub-docs
  course: {
    id: { type: Number },
    code: { type: String }
  },
  branch: {
    id: { type: Number },
    name: { type: String },
    code: { type: String },
    status: { type: String }
  },
  section: {
    id: { type: Number },
    name: { type: String },
    status: { type: String }
  },
  regulation: {
    name: { type: String }
  },

  // keep original fields you had (optional)
  picture: { type: String },
  password: { type: String },
},
{
  // automatically write `updatedon` on save/update (response uses "updatedon")
  timestamps: { createdAt: false, updatedAt: 'updatedon' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create an alias: allow using doc.hallticketno as a JS property that maps to htno
studentSchema.path('htno').options.alias = 'hallticketno';

const Student = mongoose.model('UpdatedstudentDetail', studentSchema);

module.exports = Student;
