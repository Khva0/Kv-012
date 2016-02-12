/* jshint -W072 */

/**
 * @ngdoc controller
 * @memberOf app.defects
 * @name addDefectController
 * Creates for view, where the modal will be open
 */

(function () {
    'use strict';

    angular
        .module('app.defects')
        .controller('AddDefectController', AddDefectController);

    AddDefectController.$inject = ['$uibModal', '$state', '$scope', '$stateParams', '$rootScope', 'logger',
        '$resource', 'apiUrl', 'moment', 'user', 'DefectsService'];

    function AddDefectController($uibModal, $state, $scope, $stateParams, $rootScope, logger, $resource, apiUrl,
                                 moment, user, DefectsService) {

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
                    templateUrl: 'app/defects/add-defect.template.html',
                    controller: function ($uibModalInstance, $state, $scope, $rootScope, logger, $resource,
                                          moment, user) {
                        var vmDefectModal = this;
                        var allowStateChange = false;
                        vmDefectModal.bugName = '';
                        vmDefectModal.reporter = user.fullName;
                        vmDefectModal.assigneeList = [];
                        vmDefectModal.assignedTo = '';
                        vmDefectModal.priority = 'Critical';
                        vmDefectModal.dateOfDefectCreation = moment();
                        vmDefectModal.status = 'notFix';
                        vmDefectModal.description = '';
                        vmDefectModal.description = '';
                        vmDefectModal.chooseFile = '';
                        vmDefectModal.stepsToReproduce = '';
                        vmDefectModal.testCase = 'TODO';

                        var userInfo = $resource(apiUrl.users, {}, {});
                        userInfo.query(function(resp) {
                            vmDefectModal.assigneeList = resp;
                        });

                        if ($stateParams.run) {
                            vmDefectModal.run = $stateParams.run.info;
                        }

                        vmDefectModal.cancel = function () {
                            allowStateChange = true;
                            $uibModalInstance.dismiss('cancel');
                            $state.go($stateParams.previousState);
                            $state.go($stateParams.previousState);
                        };

                        vmDefectModal.post = function () {
                            allowStateChange = true;

                            var sample = {
                                name: vmDefectModal.bugName,
                                reporter: user.id,
                                dateOfDefectCreation: vmDefectModal.dateOfDefectCreation,
                                priority: vmDefectModal.priority,
                                chooseFile: vmDefectModal.chooseFile,
                                description: vmDefectModal.description,
                                stepsToReproduce: vmDefectModal.stepsToReproduce,
                                status: vmDefectModal.status,
                                assignedTo: vmDefectModal.assignedTo,
                                testRunId:  vmDefectModal.testCase //TODO:
                            };

                            var defectsInfo = $resource(apiUrl.defects, {}, {});
                            var result = defectsInfo.save(sample).$promise.then(function success() {
                                vmDefectModal.error = 'Success.';
                                $uibModalInstance.close();
                                $state.go($stateParams.previousState, $stateParams, {
                                    reload: true, inherit: false, notify: true
                                });
                            }, function error(message) {
                                //vmDefectModal.error = 'Error: ' + message.data.errmsg;
                                if (message.data.errors.name !== undefined) {
                                    vmDefectModal.error = message.data.errors.name.message;
                                }
                                else
                                {
                                    vmDefectModal.error = 'Undefined error';
                                }
                            });
                        };

                        // prevent state changing without interraction with modal controlls
                        $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                            if (!allowStateChange) {
                                logger.warning('Please Save or Cancel this dialog!', '', 'Save or Cancel');
                                event.preventDefault();
                            }
                        });

                        vmDefectModal.noActivePostDefect = function () {
                            if (vmDefectModal.description !== undefined &&
                                vmDefectModal.bugName !== undefined &&
                                vmDefectModal.description.length !== 0 &&
                                vmDefectModal.bugName.length !== 0) {
                                return true;
                            }
                            else {

                                return false;
                            }
                        };
                    },
                    controllerAs: 'vmDefectModal',
                    backdrop: 'static',
                    keyboard: false
                });
            }
        }
    }
})();
