const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const { validateEmail } = require('../validators');

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email jest wymagany'],
    lowercase: true,
    trim: true,
    unique: true,
    validate: [validateEmail, 'Email nieprawidłowy']
  },
  password: {
    type: String,
    required: true,
    minLength: [4, 'Hasło powinno posiadać min. 4 znaki']
  },
  firstName: String,
  lastName: String,
});

// userSchema.path('password').set(value => {
//   const salt = bcrypt.genSaltSync(10);
//   const hash = bcrypt.hashSync(value, salt);
//   return hash;
// });

userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(user.password, salt);
  user.password = hash;
  next();
})

userSchema.post('save', function(error, doc, next) {
  if (error.code === 11000) {
    error.errors = { email: { message: 'Email jest już zajęty' }};
  }
  next(error);
});

userSchema.methods = {
  comparePassword(password) {
    return bcrypt.compareSync(password, this.password);
  }
}

userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName && this.lastName[0] || ''}.`;
});


const User = mongoose.model('User', userSchema);

module.exports = User;