'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaOptions = { toObject: { virtuals: true } ,toJSON: { virtuals: true } };

var GroupSchema = new Schema({
  id: { type: String },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User' },

  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  permissions: { type : Array , 'default' : [] },
  landscapes: [Schema.Types.ObjectId]
}, schemaOptions);

// GroupSchema
//     .virtual('users')
//     .set(function(users) {
//       this._users = users;
//     })
//     .get(function() {
//       if(this._users === undefined) {
//         return [];
//       } else {
//         return this._users;
//       }
//     });

// mongoose.model('Group', GroupSchema);
