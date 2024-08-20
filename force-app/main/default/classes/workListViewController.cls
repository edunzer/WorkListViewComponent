public with sharing class workListViewController {
    @AuraEnabled(cacheable=true)
    public static List<agf__ADM_Work__c> getWorkRecords() {
        // Get the current user's Id
        Id currentUserId = UserInfo.getUserId();
        
        // Query for Work Item Team records related to the current user
        List<agf__ADM_Work__c> workRecords = [
            SELECT Name, agf__Subject__c, agf__Status__c, agf__Scheduled_Build__c, agf__Scheduled_Build__r.Name, agf__Assignee__c, agf__Assignee__r.Name
            FROM agf__ADM_Work__c
            WHERE Id IN (
                SELECT Work__c
                FROM Work_Item_Team__c
                WHERE User__c = :currentUserId
            )
        ];
        
        return workRecords;
    }
}