(function () {
  'use strict';

  angular
    .module('landscapes')
    .controller('LandscapesController', LandscapesController);

  LandscapesController.$inject = ['$scope', '$state', 'Upload', 'landscapesResolve', 'ValidationService', 'Authentication', 'AppSettingsService'];

  function LandscapesController($scope, $state, Upload, landscape, ValidationService, Authentication, AppSettingsService) {

    console.log('LandscapesController')

    var vm = this;
    vm.landscape = landscape;
    vm.landscape.version = '1.0';
    vm.landscape.imageUri = 'modules/landscapes/client/img/aws.png';
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.save = save;

    vm.selectFile = true;
    vm.templateSelected = false;

    vm.imgSrc = vm.landscape.imageUri;

    vm.selectedFormat = 'JSON'
    vm.formatOptions = [ 'JSON', 'YAML' ]
    vm.onFormatChange = function() {
        if (vm.selectedFormat === 'YAML') {
            return AppSettingsService.convertToYAML(vm.landscape.cloudFormationTemplate).then(res => {
                vm.formattedYAML = res.data
            })
        }
    }

    vm.toggleUploadNewImage = function () {
      vm.showUploadNewImage = !vm.showUploadNewImage;
      vm.imageError = false;
    };

    vm.resetSelectCloudFormationTemplatePanel = function (form) {
      vm.form = form;
      if (vm.landscape.description === JSON.parse(vm.landscape.cloudFormationTemplate).Description) {
        vm.landscape.description = undefined;
      }
      vm.landscape.cloudFormationTemplate = undefined;
      vm.templateSelected = false;
      vm.form['template'].$setValidity('required', false);
      vm.form['template'].$setValidity('json', true);
    };

    vm.onImageSelect = function (files) {
      vm.imageError = false;

      for (var i = 0; i < files.length; i++) {
        var file = files[i];

        console.log(file)

        vm.upload = Upload.upload({
          url: '/api/upload/image',
          withCredentials: true,
          file: file
        })
          .success(function (data, status, headers, config) {
            // data = JSON.parse(data);
            vm.landscape.imageUri = data.imageUri;
            vm.imageSelected = true;
            vm.showUploadNewImage = false;
            vm.imgSrc = data.imageUri;
            vm.form.$dirty = true;
          })
          .error(function (err, status, headers) {
            if (status === 400) {
              vm.imageError = err.msg || err;
              console.log(err);
            } else if (status === 500) {
              vm.imageError = '500 (Internal Server Error)';
              console.log(err);
            }
          }
          );
      }
    };

    vm.onFileSelect = function (files, form) {
      vm.form = form;
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        vm.upload = Upload.upload({
          url: '/api/upload/template',
          method: 'POST',
          withCredentials: true,
          //data: {myObj: $scope.myModelObj},
          file: file
        })
          .success(function (data, status, headers, config) {
            var templateDescription = data.Description;
            vm.landscape.cloudFormationTemplate = JSON.stringify(data, null, 2);
            vm.templateSelected = true;
            vm.form['template'].$setValidity('required', true);
            vm.form['template'].$setValidity('json', true);
            vm.form.template.$valid = true;
            vm.form.template.$invalid = false;

            console.log(templateDescription);
            console.log(vm.landscape.description);
            vm.landscape.description = vm.landscape.description || templateDescription;
          })
          .error(function (err) {
            console.log(err);
          });
      }
    };


    // Save Landscape
    function save(form) {
      vm.form = form;
      vm.submitted = true;
      if (vm.landscape.cloudFormationTemplate === undefined || vm.templateSelected === false) {
        vm.form.$valid = false;
      } else {
        var obj = ValidationService.tryParseJSON(vm.landscape.cloudFormationTemplate);
        if (!obj) {
          vm.form.$valid = false;
          vm.form['template'].$setValidity('json', false);
          console.log('form[\'template\']: ' + JSON.stringify(form['template']));
        }
      }


      if (!vm.form.$valid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.landscapesForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.landscape._id) {
        vm.landscape.$update(successCallback, errorCallback);
      } else {
        vm.landscape.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('landscapes.list', {
          landscapesId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
