// Copyright 2014 OpenWhere, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

angular.module('landscapes')
    .factory('AppSettingsService', function AppSettingsService($location, $rootScope, $http, AppSettings) {
      return {
        create: function(group, callback) {
          var cb = callback || angular.noop;
          return AppSettings.save(group,
                    function(data) {
                      return cb(data);
                    },
                    function(err) {
                      return cb(err);
                    }
                ).$promise;
        },
        retrieve: function(callback) {
          var cb = callback || angular.noop;

          return AppSettings.query({},
                    function(data) {
                      return cb(data);
                    },
                    function(err) {
                      return cb(err);
                    }
                ).$promise;
        },
        retrieveOne: function(id) {
          return AppSettings.get({ id:id }, function(){});
        },
        update: function(id, group, callback) {
          var cb = callback || angular.noop;

          return AppSettings.update({ id:id }, group,
                    function(data) {
                      return cb(data);
                    },
                    function(err) {
                      return cb(err);
                    }
                ).$promise;
        },
        delete: function(id, callback) {
          var cb = callback || angular.noop;

          return AppSettings.remove({ id: id },
                    function(data) {
                      return cb(data);
                    },
                    function(err) {
                      return cb(err);
                    }
                ).$promise;
        },
        convertToYAML: function (json) {
            console.log('calling')
            return $http.post('/api/appSettings/convertToYAML', { json: json }).then(function (response) {
                if (response.status === 200) {
                    return response
                }
            }).catch(function (err) {
                console.log(err)
            })
        }
      };
    });

angular.module('landscapes')
    .factory('AppSettings', function ($resource) {
      return $resource('/api/appSettings/:id', {
        id: '@id'
      }, {
        update: { method: 'PUT' }
      });
    });
