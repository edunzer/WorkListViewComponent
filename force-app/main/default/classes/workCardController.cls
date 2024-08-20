public with sharing class workCardController {
    @AuraEnabled(cacheable=true)
    public static List<Work_Item_Action__c> getWorkItemActions(Id workId) {
        Id currentUserId = UserInfo.getUserId();
        return [
            SELECT Id, Name, Action_Type__c, Status__c, Due_Date__c, Description__c, User__c, Work__c
            FROM Work_Item_Action__c
            WHERE 	Work__c = :workId
            AND User__c = :currentUserId
        ];
    }
}
