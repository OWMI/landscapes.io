(function () {
  'use strict';

  angular
        .module('landscapes')
        .controller('LandscapesViewController', LandscapesViewController);

  LandscapesViewController.$inject = ['$scope', '$state', 'Upload', 'landscapesResolve', 'ValidationService', 'PermissionService', 'Authentication', 'AppSettingsService'];

  function LandscapesViewController($scope, $state, Upload, landscape, ValidationService, PermissionService, Authentication, AppSettingsService) {

    var vm = this;

    vm.currentUser = Authentication.user;
    vm.activeTabSet = parseInt($state.params.tabset)
    vm.hasPermission = PermissionService.hasPermission;

    landscape.$promise.then(function (data) {

      vm.landscape = data

      vm.resourcesKeys = [];
      vm.parametersKeys = [];
      vm.mappingsKeys = [];

      vm.template = JSON.parse(vm.landscape.cloudFormationTemplate);

      if (vm.template.Parameters) {
        vm.template.parametersLength = vm.template.Parameters.length;
        vm.parametersKeys = Object.keys(vm.template.Parameters);
      }

      if (vm.template.Resources) {
        vm.resourcesKeys = Object.keys(vm.template.Resources);
      }

      if (vm.template.Mappings) {
        vm.mappingsKeys = Object.keys(vm.template.Mappings);
      }
    });

    $scope.selectedFormat = 'JSON'
    $scope.formatOptions = [ 'JSON', 'YAML' ]
    $scope.onFormatChange = function() {
        if ($scope.selectedFormat === 'YAML') {
            return AppSettingsService.convertToYAML(vm.landscape.cloudFormationTemplate).then(res => {
                $scope.formattedYAML = res.data
            })
        }
    }

    vm.error = null;

    $scope.isSelect = function (pannel) {
      return ($scope.selected === pannel);
    };

    $scope.buttonClick = function (text) {
      $scope.selected = text;
      console.log($scope.selected === 'Template');
    };
  }

})();
