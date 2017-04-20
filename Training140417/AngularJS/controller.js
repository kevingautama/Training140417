applicationPlatformFramework.controller('uploadController', function ($scope, $rootScope, $state, $timeout, $location, dataUploadResource) {

    // Initialize variable

    // 22 Sep 2016
    $scope.UploadIsEnabled = false;

    $scope.InterfaceFiles = [];
    $scope.files = null;
    $scope.progressPercentage = 0;
    $scope.isRunning = 0;
    $scope.fileDisplayName = "";
    var uploadresource = new dataUploadResource();
    $scope.dtOptions = { "aaSorting": [], "bPaginate": false, "bLengthChange": false, "bFilter": false, "bSort": true, "bInfo": false, "bAutoWidth": false };

    // Initialize variable
    var unitCode = "";
    // Initialize variable
    try {
        unitCode = $location.search().UnitCode; // get the unit code from URL value Unit;
    } catch (ex) { }


    // END Initialize variable

    // Watch section

    $scope.$watch(function () {
        return $rootScope.setting.userProfile.operationUnit;
    }, function () {
        if ($rootScope.setting.userProfile.operationUnit != "" && $rootScope.setting.userProfile.operationUnit != undefined) {

            // authorization
            $rootScope.hideAppMenuAll();
            $rootScope.setACL();

            $scope.getAuditLog();

            // authorization
            // authorize for Download Search Result & Download All data
            // Data Upload - Upload
            // Bank Master Support List - Download
            $scope.UploadIsEnabled = false;
            try {
                var hasAccess = $rootScope.isAuthorizedResource("Data Upload - Upload");
                if (hasAccess) {
                    // disable SupportListIsEnabled
                    $scope.UploadIsEnabled = true;
                }
            } catch (ex) {
            }

            try {
                if (unitCode != null && unitCode != "undefined" && unitCode != "") {
                    var businessUnitName = "";
                    for (i = 0; i < $rootScope.setting.userProfile.authorizePermission.length; i++) {
                        var item = $rootScope.setting.userProfile.authorizePermission[i];
                        if (unitCode == item.OperationUnit) {
                            businessUnitName = item.OperationUnitName;
                            break;
                        }

                    }

                    $rootScope.changeUnit(unitCode, businessUnitName);
                }

            }
            catch (ex)
            { }



            // end authorization
        }
    });

    // END Watch section

    // Function section

    $scope.SelectFiles = function (files) {
        //console.log(files);

        var fileType = files[0].type;
        var fileName = files[0].name;
        var fileExtension = fileName.substring(fileName.lastIndexOf('.'));

        if ((fileExtension == ".csv")) {

            $scope.files = files;
            $("#upload-file-info").val($("#my-file-selector").val());

        } else {

            $scope.files = null;
            $("#upload-file-info").val("")
            $scope.hideAlert();
            var errMsg = "Failed: Wrong file format. Please retry uploading the file." // data.obj.StatusMsg;
            $("#alertMessageSearch").text(errMsg);
            $('#alertErrorMessageSearchContainer').show();

        }

    }


    $scope.UploadFile = function () {

        dataUploadResource.getAll({
            unitcode: "9999"
        }, function (data) {
            // call the upload function	   



            try {

                $scope.progressPercentage = 0; // ((processItems/totalItems) * 100);
                $scope.progressBar = "";
                $scope.hideAlert();
                if (($scope.Category != null && $scope.Category != '') && $scope.files != null) {

                    uploadresource.File = $scope.files[0];
                    uploadresource.Category = $scope.Category;

                    if (unitCode != null && unitCode != "undefined" && unitCode != "") {
                        uploadresource.OperationUnit = unitCode;
                    }
                    else {
                        uploadresource.OperationUnit = $rootScope.setting.userProfile.operationUnit;
                    }


                    $('#modal-alert').modal({ backdrop: 'static', keyboard: false });
                    uploadresource.$add().then(function (data) {


                        if (data.success) {

                            // calling CheckStatusForUploadFile after 3 seconds
                            var totalItems = data.obj.TotalItems;
                            var processItems = data.obj.ProcessItems;
                            $scope.StatusBatchID = data.obj.BatchID;
                            $scope.StatusID = data.obj.ID;

                            $scope.progressPercentage = 0; // ((processItems/totalItems) * 100);
                            $timeout($scope.CheckStatusForUpload, 2000);

                        } else {
                            // assign the error  messgae
                            $scope.hideAlert();
                            $('#modal-alert').modal('hide');

                            var errMsg = data.obj.StatusMsg;
                            $("#alertMessageSearch").text(errMsg);
                            // show the alert error message panel
                            $('#alertErrorMessageSearchContainer').show();
                        }

                    }, function errorCallback(response) {
                        $scope.hideAlert();

                        $('#modal-alert').modal('hide');
                        //code for what happens when there's an error
                        // assign the error  messgae
                        var errMsg = "E0003: Error occured while calling REST API. Please try again or contact the Administrator."; // data.obj.StatusMsg;
                        $("#alertMessageSearch").text(errMsg);
                        // show the alert error message panel
                        $('#alertErrorMessageSearchContainer').show();

                    });



                }
                else {
                    $scope.hideAlert();
                    $('#modal-alert').modal('hide');
                    var errMsg = "Please select a Category and the File to upload."; // data.obj.StatusMsg;
                    $("#alertMessageSearch").text(errMsg);
                    $('#alertErrorMessageSearchContainer').show();
                }

            } catch (ex) {
                $scope.hideAlert();

                $('#modal-alert').modal('hide');
                //code for what happens when there's an error
                // assign the error  messgae
                var errMsg = "E0004: Error occured while performing upload. Please try again or contact the Administrator."; // data.obj.StatusMsg;
                $("#alertMessageSearch").text(errMsg);
                // show the alert error message panel
                $('#alertErrorMessageSearchContainer').show();
            }



            // end upload function

        });

    }



    $scope.closeDialog = function () {
        $scope.hideAlert();
        $('#modal-alert').modal('hide');
        $('#modal-alert-1').modal('hide');
        //window.location="/redirector.aspx?UnitCode=" + $rootScope.setting.userProfile.operationUnit;

        // refresh the audit log
        $scope.InterfaceFiles = [];
        $scope.getAuditLog();
    }

    $scope.CheckStatusForUpload = function () {

        try {

            uploadresource.ID = $scope.StatusID; //id; // ID of InterfaceFile
            uploadresource.BatchID = $scope.StatusBatchID; // batchID; // ID of InterfaceFile

            uploadresource.$checkStatusforuploadfile().then(function (data) {
                if (data.success) {
                    if (data.obj.UploadedStatus == "1") {
                        $scope.hideAlert();
                        $('#modal-alert').modal('hide');
                        $('#modal-alert-1').modal({ backdrop: 'static', keyboard: false });
                        // $scope.InterfaceFiles.push(data.obj);
                        $scope.Clear(); // do not clear the scope
                    }
                    else if (data.obj.UploadedStatus == "2") {
                        $scope.hideAlert();
                        $('#modal-alert').modal('hide');
                        errMsg = data.obj.ErrorMessage;
                        $("#alertMessageSearch").text(errMsg);
                        // show the alert error message panel
                        $('#alertErrorMessageSearchContainer').show();
                    }
                    else {
                        var totalItems = data.obj.TotalItems;
                        var processItems = data.obj.ProcessItems;

                        var totalPercentage = Math.round((processItems / totalItems) * 100);

                        if (totalPercentage == $scope.progressPercentage) {
                            if ($scope.progressBar.length > 25)
                                $scope.progressBar = "";
                            $scope.progressBar = $scope.progressBar + ".";
                            $scope.progressPercentage = Math.round((processItems / totalItems) * 100);
                        }
                        else
                            $scope.progressPercentage = Math.round((processItems / totalItems) * 100);

                        $timeout($scope.CheckStatusForUpload, 2000);

                    }



                } else {
                    // assign the error  messgae
                    $('#modal-alert').modal('hide');
                    var errMsg = data.obj.StatusMsg;
                    $("#alertMessageSearch").text(errMsg);
                    // show the alert error message panel
                    $('#alertErrorMessageSearchContainer').show();
                    $scope.hideAlert();

                }

            }, function errorCallback(response) {
                $('#modal-alert').modal('hide');
                //code for what happens when there's an error
                // assign the error  messgae
                var errMsg = "E0003: Error occured while calling REST API. Please try again or contact the Administrator."; // data.obj.StatusMsg;
                $("#alertMessageSearch").text(errMsg);
                // show the alert error message panel
                $('#alertErrorMessageSearchContainer').show();
                $scope.hideAlert();


            });


        } catch (ex) {

            $('#modal-alert').modal('hide');
            //code for what happens when there's an error
            // assign the error  messgae
            var errMsg = "E0003: Error occured while calling REST API. Please try again or contact the Administrator."; // data.obj.StatusMsg;
            $("#alertMessageSearch").text(errMsg);
            // show the alert error message panel
            $('#alertErrorMessageSearchContainer').show();
            $scope.hideAlert();
        }

    }


    $scope.Clear = function () {
        $scope.Category = null;
        //$scope.files = null;
        //$("#upload-file-info").val("")

    }

    $scope.hideAlert = function () {
        $('#alertErrorMessageSearchContainer').hide();
    }

   




    


});
