/**
 * @ngdoc controller
 * @memberOf app.defects
 * @name addDefectController
 * Creates for view, where the modal will be open
 */

(function() {
    'use strict';

    angular
        .module('app.defects')
        .controller('AddDefectController', AddDefectController);

    AddDefectController.$inject = ['$uibModal', '$state', '$scope', '$stateParams', '$rootScope', 'logger',
        '$resource', 'apiUrl', 'moment'];

    function AddDefectController($uibModal, $state, $scope, $stateParams, $rootScope, logger, $resource, apiUrl,
    moment) {

        var vm = this;
        vm.open = openAddDefectModal;

        vm.open();

        /**
         * Opens "Add defect" modal window
         * @memberOf addDefectController
         */
        function openAddDefectModal() {
            if (!$stateParams.previousState) {
                $state.go('dashboard');
            } else {
                $uibModal.open({
                        templateUrl: 'addDefectModalTemplate.html',
                        controller: function ($uibModalInstance, $state, $scope, $rootScope, logger, $resource,
                        moment) {
                            var vmDefectModal = this;
                            var allowStateChange = false;
                            vmDefectModal.bugName = '';
                            vmDefectModal.whoFind = '';
                            vmDefectModal.assignedTo = '';
                            vmDefectModal.priority = 'Critical';
                            vmDefectModal.dateOfDefectCreation = moment();
                            vmDefectModal.description = '';
                            vmDefectModal.chooseFile = '';
                            vmDefectModal.stepsToReproduce = '';
                            vmDefectModal.testCase = 'TODO';

                            if ($stateParams.run) {
                                vmDefectModal.run = $stateParams.run.info;
                            }

                            vmDefectModal.cancel = function () {
                                allowStateChange = true;

                                $uibModalInstance.dismiss('cancel');
                                $state.go($stateParams.previousState);
                            };

                            /*function getNewDefect() {
                             return dataservice.getNewDefect().then(function (data) {
                             //var debug = data.getById("whoFind");
                             return data;
                             });
                             }*/
                            vmDefectModal.post = function () {
                                allowStateChange = true;

                                //var infoPromise = getNewDefect();
                                var sample = {
                                    name: vmDefectModal.bugName,
                                    whoFind: vmDefectModal.whoFind,
                                    assignedTo: vmDefectModal.assignedTo,
                                    dateOfDefectCreation: vmDefectModal.dateOfDefectCreation,
                                    priority: vmDefectModal.priority.toLowerCase(),
                                    chooseFile: vmDefectModal.chooseFile,
                                    description: vmDefectModal.description,
                                    stepsToReproduce: vmDefectModal.stepsToReproduce,
                                    //testRunId:  vmDefectModal.testCase //TODO:
                                };

                                var defectsInfo = $resource(apiUrl.defects, {}, {});

                                defectsInfo.save(sample);
                                // updateDefects();
                                $uibModalInstance.close();
                                $state.go($stateParams.previousState, $stateParams, {reload: true, inherit: false,
                                    notify: true});
                            };

                            // prevent state changing without interraction with modal controlls
                            $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                                if (!allowStateChange) {
                                    logger.warning('Please Save or Cancel this dialog!', '', 'Save or Cancel');
                                    event.preventDefault();
                                }
                            });
                        },
                        controllerAs: 'vmDefectModal',
                        backdrop: 'static'
                    });
            }
        }
    }
})();
