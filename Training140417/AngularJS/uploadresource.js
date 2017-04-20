(function () {
	"use strict";

	angular
        .module("common.services")
        .factory("uploadresource",
                ["$resource",
                 interfaceFileResource]);

	function interfaceFileResource($resource) {
		function formDataObject(data) {
			var fd = new formdata();
			fd.append("content", data.File);
			return fd;
		}
		return $resource("/api/upload/:action/:unitcode",
               { unitcode: '@unitcode' },
               {
               	
               	add: {
               		params: { action: 'upload' },
               		method: 'POST',
               		transformRequest: formDataObject,
               		headers: { 'Content-Type': undefined }
               	}
               })
	}
}());
