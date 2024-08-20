public with sharing class workListViewController {
    @AuraEnabled(cacheable=true)
    public static List<agf__ADM_Work__c> getWorkRecords() {
        // Get the current user's Id
        Id currentUserId = UserInfo.getUserId();
        System.debug('Current User ID: ' + currentUserId);

        // Query for Work Item Team records related to the current user
        List<agf__ADM_Work__c> workRecords = [
            SELECT Name, agf__Subject__c, agf__Status__c, agf__Scheduled_Build__c, agf__Scheduled_Build__r.Name, agf__Assignee__c, agf__Assignee__r.Name, Scheduled_Build_Release_Date__c
            FROM agf__ADM_Work__c
            WHERE Id IN (
                SELECT Work__c
                FROM Work_Item_Team__c
                WHERE User__c = :currentUserId
            )
        ];

        System.debug('Work Records Found: ' + workRecords.size());
        for (agf__ADM_Work__c workRecord : workRecords) {
            System.debug('Work Record: ' + workRecord);
        }
        
        return workRecords;
    }
}
