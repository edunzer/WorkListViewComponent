public with sharing class workListViewController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getWorkRecords(Integer pageSize, Integer pageNumber) {
        // Get the current user's Id
        Id currentUserId = UserInfo.getUserId();
        Integer offset = (pageNumber - 1) * pageSize;

        // Query for Work Item Team records related to the current user
        List<agf__ADM_Work__c> workRecords = [
            SELECT Name, agf__Subject__c, agf__Status__c, agf__Scheduled_Build__c, agf__Scheduled_Build__r.Name, agf__Assignee__c, agf__Assignee__r.Name, Scheduled_Build_Release_Date__c
            FROM agf__ADM_Work__c
            WHERE Id IN (
                SELECT Work__c
                FROM Work_Item_Team__c
                WHERE User__c = :currentUserId
            )
            LIMIT :pageSize OFFSET :offset
        ];

        // Query for the total number of records for pagination
        Integer totalRecords = [SELECT COUNT() FROM agf__ADM_Work__c WHERE Id IN (SELECT Work__c FROM Work_Item_Team__c WHERE User__c = :currentUserId)];

        // Prepare the result map
        Map<String, Object> result = new Map<String, Object>();
        result.put('workRecords', workRecords);
        result.put('totalRecords', totalRecords);

        return result;
    }
}
