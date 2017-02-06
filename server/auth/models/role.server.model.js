'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
Schema = mongoose.Schema;

var schemaOptions = { toObject: { virtuals: true } ,toJSON: { virtuals: true } };

var RoleSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User' },

  name: { type: String, required: true, lowercase: true, trim: true },
  description: { type: String, required: true },
  permissions: { type : Array , 'default' : [] }
},
    schemaOptions
);

RoleSchema
    .virtual('users')
    .set(function(users) {
      this._users = users;
    })
    .get(function() {
      if(this._users === undefined) {
        return [];
      } else {
        return this._users;
      }
    });

mongoose.model('Role', RoleSchema);