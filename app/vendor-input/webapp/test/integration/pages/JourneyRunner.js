sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"vendorinput/test/integration/pages/VendorApprovalRequestsObjectPage"
], function (JourneyRunner, VendorApprovalRequestsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('vendorinput') + '/test/flp.html#app-preview',
        pages: {
			onTheVendorApprovalRequestsObjectPage: VendorApprovalRequestsObjectPage
        },
        async: true
    });

    return runner;
});

